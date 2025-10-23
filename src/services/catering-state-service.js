/**
 * Catering State Service v2.0.0
 * Centralized state management with dual persistence:
 * - Guest users: localStorage (fallback)
 * - Authenticated users: Firestore (primary) + localStorage (offline cache)
 *
 * Features:
 * - Pub/sub pattern for reactive updates
 * - Draft copy pattern for modal editing
 * - Identity handoff (localStorage → Firestore migration)
 * - Real-time cross-device sync via Firestore onSnapshot
 * - Version-based migration
 */

import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase-config.js';
import { TAX_RATE } from '../utils/catering-pricing.js';

const STATE_VERSION = '2.0.0';
const STORAGE_PREFIX = 'philly-catering-state';
const FIRESTORE_COLLECTION = 'catering-drafts';

/**
 * Default state templates for each flow
 */
const DEFAULT_STATES = {
  'boxed-meals': {
    currentStep: 'template-selection',
    selectedTemplate: null,
    boxCount: 10,
    currentConfig: {
      wingCount: 6,
      wingType: null,
      wingStyle: null,
      sauce: null,
      sauces: [],
      splitSauces: false,
      sauceOnSide: false,
      dips: [],
      side: null,
      dessert: null,
      specialInstructions: ''
    },
    individualOverrides: {},
    lastSavedBoxNumber: null,
    menuData: {
      sauces: [],
      sides: [],
      desserts: []
    },
    extras: {
      quickAdds: [],
      beverages: [],
      hotBeverages: [],
      salads: [],
      sides: [],
      desserts: [],
      saucesToGo: [],
      dipsToGo: []
    },
    contact: {
      company: '',
      name: '',
      email: '',
      phone: '',
      deliveryAddress: {
        street: '',
        street2: '',
        city: '',
        state: '',
        zip: ''
      },
      billingAddress: {
        sameAsDelivery: true,
        street: '',
        street2: '',
        city: '',
        state: '',
        zip: ''
      },
      deliveryDate: '',
      deliveryTimeHour: '12',
      deliveryTimeMinute: '00',
      deliveryPeriod: 'PM',
      notes: ''
    },
    pricing: {
      subtotal: 0,
      estimatedTotal: 0,
      taxRate: TAX_RATE,
      note: `Final price includes setup fees, staff, delivery distance, tips, and ${Math.round(TAX_RATE * 100)}% tax. We'll provide exact pricing in your quote.`
    }
  },
  'guided-planner': {
    currentStep: 1,
    guestCount: null,
    eventType: null,
    selectedPackage: null,
    sauceSelections: [],
    addOns: {
      desserts: [],
      beverages: [],
      hotBeverages: [],
      salads: [],
      sides: []
    },
    contact: {
      company: '',
      name: '',
      email: '',
      phone: '',
      deliveryAddress: {
        street: '',
        street2: '',
        city: '',
        state: '',
        zip: ''
      },
      billingAddress: {
        sameAsDelivery: true,
        street: '',
        street2: '',
        city: '',
        state: '',
        zip: ''
      },
      deliveryDate: '',
      deliveryTimeHour: '12',
      deliveryTimeMinute: '00',
      deliveryPeriod: 'PM',
      notes: ''
    },
    pricing: {
      packagePrice: 0,
      addOnsTotal: 0,
      subtotal: 0,
      estimatedTotal: 0,
      taxRate: TAX_RATE
    }
  }
};

class CateringStateService {
  constructor() {
    // Main states for each flow
    this.states = {
      'boxed-meals': null,
      'guided-planner': null
    };

    // Subscribers for pub/sub pattern
    this.subscribers = {
      'boxed-meals': new Set(),
      'guided-planner': new Set()
    };

    // Draft copies for modal editing
    this.drafts = {
      'boxed-meals': null,
      'guided-planner': null
    };

    // Firestore listeners for real-time sync
    this.firestoreListeners = {
      'boxed-meals': null,
      'guided-planner': null
    };

    // Current authenticated user
    this.currentUser = null;

    // Initialize auth listener
    this._initAuthListener();
  }

  /**
   * Initialize Firebase Auth state listener
   * Handles identity handoff and profile prefill
   */
  _initAuthListener() {
    auth.onAuthStateChanged(async (user) => {
      const previousUser = this.currentUser;
      this.currentUser = user;

      if (user && !previousUser) {
        // User just signed in - migrate localStorage drafts to Firestore
        console.log('🔐 User signed in, migrating drafts to Firestore...');

        for (const flowType of ['boxed-meals', 'guided-planner']) {
          await this.migrateLocalDraftToFirestore(flowType);
          await this.prefillFromAuthProfile(flowType);
          this._setupFirestoreListener(flowType);
        }
      } else if (!user && previousUser) {
        // User signed out - clean up listeners
        console.log('🔓 User signed out, switching to localStorage only');

        for (const flowType of ['boxed-meals', 'guided-planner']) {
          if (this.firestoreListeners[flowType]) {
            this.firestoreListeners[flowType]();
            this.firestoreListeners[flowType] = null;
          }
        }
      }
    });
  }

  /**
   * Load state from Firestore (authenticated) or localStorage (guest)
   * @param {string} flowType - 'boxed-meals' | 'guided-planner'
   * @returns {Promise<Object>} State object
   */
  async loadState(flowType) {
    // Check version and clear if mismatch
    this._checkVersionAndMigrate(flowType);

    // Try Firestore first if authenticated
    if (this.currentUser) {
      const firestoreState = await this._loadFromFirestore(flowType);
      if (firestoreState) {
        this.states[flowType] = firestoreState;
        // Also cache in localStorage for offline access
        this._saveToLocalStorage(flowType, firestoreState);
        return this._deepClone(firestoreState);
      }
    }

    // Fall back to localStorage
    const localState = this._loadFromLocalStorage(flowType);
    if (localState) {
      this.states[flowType] = localState;
      return this._deepClone(localState);
    }

    // Initialize with default state
    const defaultState = this._getDefaultState(flowType);
    this.states[flowType] = defaultState;
    await this.saveState(flowType, defaultState, { skipNotify: true });
    return this._deepClone(defaultState);
  }

  /**
   * Save state updates with dual persistence
   * @param {string} flowType - 'boxed-meals' | 'guided-planner'
   * @param {Object} updates - Partial state updates (deep merged)
   * @param {Object} options - { skipNotify, skipFirestore, skipLocalStorage }
   */
  async saveState(flowType, updates, options = {}) {
    const { skipNotify = false, skipFirestore = false, skipLocalStorage = false } = options;

    // Deep merge updates into current state
    this.states[flowType] = this._deepMerge(this.states[flowType] || this._getDefaultState(flowType), updates);

    // Persist to localStorage (unless skipped)
    if (!skipLocalStorage) {
      this._saveToLocalStorage(flowType, this.states[flowType]);
    }

    // Persist to Firestore if authenticated (unless skipped)
    if (this.currentUser && !skipFirestore) {
      await this._persistToFirestore(flowType);
    }

    // Notify subscribers (unless skipped)
    if (!skipNotify) {
      this._notifySubscribers(flowType);
    }
  }

  /**
   * Get current state (returns deep clone to prevent mutations)
   * @param {string} flowType - 'boxed-meals' | 'guided-planner'
   * @returns {Object} Deep clone of current state
   */
  getState(flowType) {
    return this._deepClone(this.states[flowType] || this._getDefaultState(flowType));
  }

  /**
   * Subscribe to state changes
   * @param {string} flowType - 'boxed-meals' | 'guided-planner'
   * @param {Function} handler - Callback receiving (newState, flowType)
   * @returns {Function} Unsubscribe function
   */
  subscribe(flowType, handler) {
    this.subscribers[flowType].add(handler);
    return () => this.subscribers[flowType].delete(handler);
  }

  /**
   * Create draft copy for modal editing
   * @param {string} flowType - 'boxed-meals' | 'guided-planner'
   * @returns {Object} Draft copy
   */
  createDraft(flowType) {
    this.drafts[flowType] = this._deepClone(this.states[flowType]);
    return this._deepClone(this.drafts[flowType]);
  }

  /**
   * Update draft without affecting main state
   * @param {string} flowType - 'boxed-meals' | 'guided-planner'
   * @param {Object} updates - Partial updates
   */
  updateDraft(flowType, updates) {
    if (!this.drafts[flowType]) {
      throw new Error(`No draft exists for ${flowType}. Call createDraft() first.`);
    }
    this.drafts[flowType] = this._deepMerge(this.drafts[flowType], updates);
  }

  /**
   * Apply draft to main state with validation
   * @param {string} flowType - 'boxed-meals' | 'guided-planner'
   * @param {string} section - Section being edited (for validation)
   * @returns {Promise<{isValid: boolean, errors: string[]}>}
   */
  async applyDraft(flowType, section) {
    if (!this.drafts[flowType]) {
      throw new Error(`No draft exists for ${flowType}.`);
    }

    // Validate draft before applying (validation TBD - Phase 2)
    const validation = { isValid: true, errors: [] };

    if (!validation.isValid) {
      return validation;
    }

    // Apply draft to main state
    await this.saveState(flowType, this.drafts[flowType]);
    this.drafts[flowType] = null;

    return validation;
  }

  /**
   * Discard draft without applying
   * @param {string} flowType - 'boxed-meals' | 'guided-planner'
   */
  discardDraft(flowType) {
    this.drafts[flowType] = null;
  }

  /**
   * Get current draft
   * @param {string} flowType - 'boxed-meals' | 'guided-planner'
   * @returns {Object|null} Draft copy or null
   */
  getDraft(flowType) {
    return this.drafts[flowType] ? this._deepClone(this.drafts[flowType]) : null;
  }

  /**
   * Migrate localStorage draft to Firestore on user signin
   * @param {string} flowType - 'boxed-meals' | 'guided-planner'
   */
  async migrateLocalDraftToFirestore(flowType) {
    if (!this.currentUser) return;

    const localState = this._loadFromLocalStorage(flowType);
    if (localState && this._hasUserData(localState)) {
      console.log(`📤 Migrating ${flowType} draft to Firestore for user ${this.currentUser.uid}`);
      await this._persistToFirestore(flowType, localState);
    }
  }

  /**
   * Prefill contact info from Firebase Auth profile
   * @param {string} flowType - 'boxed-meals' | 'guided-planner'
   */
  async prefillFromAuthProfile(flowType) {
    if (!this.currentUser) return;

    const currentState = this.states[flowType] || this._getDefaultState(flowType);

    // Only prefill if contact info is empty
    if (!currentState.contact.name && !currentState.contact.email) {
      const updates = {
        contact: {
          ...currentState.contact,
          name: this.currentUser.displayName || '',
          email: this.currentUser.email || '',
          phone: this.currentUser.phoneNumber || currentState.contact.phone
        }
      };

      await this.saveState(flowType, updates, { skipNotify: true });
      console.log(`✨ Pre-filled contact from auth profile for ${flowType}`);
    }
  }

  /**
   * Clear all state for a flow (reset)
   * @param {string} flowType - 'boxed-meals' | 'guided-planner'
   */
  async clearState(flowType) {
    this.states[flowType] = this._getDefaultState(flowType);
    this.drafts[flowType] = null;

    // Clear localStorage
    localStorage.removeItem(`${STORAGE_PREFIX}-${flowType}`);

    // Clear Firestore if authenticated
    if (this.currentUser) {
      const docRef = doc(db, FIRESTORE_COLLECTION, `${this.currentUser.uid}_${flowType}`);
      await deleteDoc(docRef);
    }

    this._notifySubscribers(flowType);
  }

  // ========================================
  // Private Helper Methods
  // ========================================

  /**
   * Persist state to Firestore
   */
  async _persistToFirestore(flowType, stateOverride = null) {
    if (!this.currentUser) return;

    const state = stateOverride || this.states[flowType];
    const docRef = doc(db, FIRESTORE_COLLECTION, `${this.currentUser.uid}_${flowType}`);

    try {
      await setDoc(docRef, {
        flowType,
        userId: this.currentUser.uid,
        state,
        version: STATE_VERSION,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error(`Failed to persist ${flowType} to Firestore:`, error);
    }
  }

  /**
   * Load state from Firestore
   */
  async _loadFromFirestore(flowType) {
    if (!this.currentUser) return null;

    const docRef = doc(db, FIRESTORE_COLLECTION, `${this.currentUser.uid}_${flowType}`);

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.state;
      }
    } catch (error) {
      console.error(`Failed to load ${flowType} from Firestore:`, error);
    }

    return null;
  }

  /**
   * Set up real-time Firestore listener for cross-device sync
   */
  _setupFirestoreListener(flowType) {
    if (!this.currentUser || this.firestoreListeners[flowType]) return;

    const docRef = doc(db, FIRESTORE_COLLECTION, `${this.currentUser.uid}_${flowType}`);

    this.firestoreListeners[flowType] = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Only update if version matches
        if (data.version === STATE_VERSION) {
          this.states[flowType] = data.state;
          this._saveToLocalStorage(flowType, data.state);
          this._notifySubscribers(flowType);
          console.log(`🔄 ${flowType} synced from Firestore (cross-device update)`);
        }
      }
    }, (error) => {
      console.error(`Firestore listener error for ${flowType}:`, error);
    });
  }

  /**
   * Save to localStorage
   */
  _saveToLocalStorage(flowType, state) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}-${flowType}`, JSON.stringify({
        version: STATE_VERSION,
        state,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn(`Failed to save ${flowType} to localStorage:`, error);
    }
  }

  /**
   * Load from localStorage
   */
  _loadFromLocalStorage(flowType) {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}-${flowType}`);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Check version match
        if (parsed.version === STATE_VERSION) {
          return parsed.state;
        } else {
          console.warn(`Version mismatch for ${flowType}, clearing localStorage`);
          localStorage.removeItem(`${STORAGE_PREFIX}-${flowType}`);
        }
      }
    } catch (error) {
      console.warn(`Failed to load ${flowType} from localStorage:`, error);
    }
    return null;
  }

  /**
   * Check version and migrate if needed
   */
  _checkVersionAndMigrate(flowType) {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}-${flowType}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version !== STATE_VERSION) {
          console.log(`🔄 Clearing ${flowType} due to version mismatch (${parsed.version} → ${STATE_VERSION})`);
          localStorage.removeItem(`${STORAGE_PREFIX}-${flowType}`);
        }
      }
    } catch (error) {
      console.warn(`Version check failed for ${flowType}:`, error);
    }
  }

  /**
   * Notify all subscribers of state change
   */
  _notifySubscribers(flowType) {
    const state = this._deepClone(this.states[flowType]);
    this.subscribers[flowType].forEach(handler => {
      try {
        handler(state, flowType);
      } catch (error) {
        console.error(`Subscriber error for ${flowType}:`, error);
      }
    });
  }

  /**
   * Get default state for flow type
   */
  _getDefaultState(flowType) {
    return this._deepClone(DEFAULT_STATES[flowType]);
  }

  /**
   * Check if state has user data (for migration detection)
   */
  _hasUserData(state) {
    return state.contact && (state.contact.name || state.contact.email || state.contact.phone);
  }

  /**
   * Deep clone object
   */
  _deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Deep merge two objects
   */
  _deepMerge(target, source) {
    const output = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this._deepMerge(output[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }

    return output;
  }
}

// Export singleton instance
export const cateringStateService = new CateringStateService();
