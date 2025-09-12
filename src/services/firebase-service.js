import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase-config';

// Generic CRUD operations
export const FirebaseService = {
  // Create
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  // Read single document
  async getById(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  // Read all documents
  async getAll(collectionName, filters = {}) {
    try {
      let q = collection(db, collectionName);
      
      if (filters.where) {
        q = query(q, where(...filters.where));
      }
      
      if (filters.orderBy) {
        q = query(q, orderBy(...filters.orderBy));
      }
      
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }
      
      const querySnapshot = await getDocs(q);
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      
      return docs;
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  },

  // Update
  async update(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Delete
  async delete(collectionName, id) {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Real-time listener
  subscribe(collectionName, callback, filters = {}) {
    let q = collection(db, collectionName);
    
    if (filters.where) {
      q = query(q, where(...filters.where));
    }
    
    if (filters.orderBy) {
      q = query(q, orderBy(...filters.orderBy));
    }
    
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    return onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      callback(docs);
    });
  },

  // Storage operations
  async uploadImage(file, path) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  async deleteImage(path) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
};

// Specific services for each collection
export const GameDayBannerService = {
  async getActive() {
    const banners = await FirebaseService.getAll('gameDayBanners', {
      where: ['active', '==', true],
      orderBy: ['priority', 'desc'],
      limit: 1
    });
    return banners[0] || null;
  },

  subscribeToActive(callback) {
    return FirebaseService.subscribe('gameDayBanners', callback, {
      where: ['active', '==', true],
      orderBy: ['priority', 'desc'],
      limit: 1
    });
  }
};

export const MenuService = {
  async getActiveItems(category = null) {
    const filters = {
      where: ['active', '==', true],
      orderBy: ['sortOrder', 'asc']
    };
    
    if (category) {
      filters.where = ['category', '==', category];
    }
    
    return FirebaseService.getAll('menuItems', filters);
  },

  async getFeaturedItems() {
    return FirebaseService.getAll('menuItems', {
      where: ['featured', '==', true],
      orderBy: ['sortOrder', 'asc']
    });
  }
};

export const ComboService = {
  async getActiveCombos() {
    return FirebaseService.getAll('combos', {
      where: ['active', '==', true],
      orderBy: ['sortOrder', 'asc']
    });
  },

  async getGameDayCombos() {
    return FirebaseService.getAll('combos', {
      where: ['gameDay', '==', true],
      orderBy: ['sortOrder', 'asc']
    });
  }
};

export const LiveOrderService = {
  subscribeToRecent(callback, limitCount = 5) {
    return FirebaseService.subscribe('liveOrders', callback, {
      where: ['display', '==', true],
      orderBy: ['timestamp', 'desc'],
      limit: limitCount
    });
  }
};

export const ReviewService = {
  async getFeaturedReviews() {
    return FirebaseService.getAll('reviews', {
      where: ['featured', '==', true],
      orderBy: ['createdAt', 'desc']
    });
  }
};

export const SettingsService = {
  async getSettings() {
    return FirebaseService.getById('settings', 'main');
  },

  async updateSettings(data) {
    return FirebaseService.update('settings', 'main', data);
  },

  subscribeToSettings(callback) {
    return FirebaseService.subscribe('settings', (docs) => {
      callback(docs.find(doc => doc.id === 'main'));
    });
  }
};