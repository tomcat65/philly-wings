/**
 * Catering Types and Interfaces
 * Defines TypeScript types for catering packages and add-ons
 * Source of truth for all catering data structures
 */

// ============================================================================
// ENUMS - Controlled Vocabularies
// ============================================================================

/**
 * Storage requirements for inventory management
 */
export enum StorageType {
  FROZEN = 'frozen',
  REFRIGERATED = 'refrigerated',
  DRY = 'dry',
  AMBIENT = 'ambient'
}

/**
 * Team capability requirements for operational workflow
 */
export enum TeamCapability {
  HEAT_ONLY = 'heat-only',
  FRY = 'fry',
  ASSEMBLE = 'assemble',
  NONE = 'none'
}

/**
 * Required equipment for prep and service
 */
export enum RequiredEquipment {
  IMPINGER_OVEN = 'impingerOven',
  FRYER = 'fryer',
  REFRIGERATION = 'refrigeration',
  CHAFING = 'chafing',
  BOXING_STATION = 'boxingStation'
}

/**
 * Canonical allergen list (FDA major allergens + common additions)
 */
export enum Allergen {
  DAIRY = 'dairy',
  EGG = 'egg',
  GLUTEN = 'gluten',
  SOY = 'soy',
  NUTS = 'nuts',
  SHELLFISH = 'shellfish',
  SESAME = 'sesame',
  FISH = 'fish',
  NONE = 'none'
}

/**
 * Dietary tags for filtering and compliance
 */
export enum DietaryTag {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  GLUTEN_FREE = 'gluten-free',
  CONTAINS_NUTS = 'contains-nuts',
  DAIRY_FREE = 'dairy-free',
  HALAL = 'halal',
  KOSHER = 'kosher'
}

/**
 * Add-on category for organization
 */
export enum AddOnCategory {
  VEGETARIAN = 'vegetarian',
  DESSERT = 'dessert',
  SIDE = 'side',
  PACKAGING = 'packaging',
  BEVERAGE = 'beverage'
}

/**
 * Preparation methods for configurable add-ons
 */
export enum PreparationMethod {
  FRIED = 'fried',
  BAKED = 'baked'
}

// ============================================================================
// INTERFACES - Data Structures
// ============================================================================

/**
 * Variant-specific preparation details
 */
export interface PreparationOption {
  id: PreparationMethod;
  label: string;
  teamCapability: TeamCapability;
  requiredEquipment: RequiredEquipment[];
  prepTimeMinutes: number;
  maxDailyUnits?: number;
  operationalNotes: string;
  allergenAdjustments?: Allergen[];
}

/**
 * Catering Add-On Item
 * Enhanced schema with operational fields
 */
export interface CateringAddOn {
  // Identity
  id: string;
  name: string;
  category: AddOnCategory;
  type: string; // Freeform subtype for analytics

  // Description & Display
  description: string;
  imageUrl: string;
  badge?: string; // e.g., "Vegetarian", "Local", "Premium"
  featured: boolean;
  active: boolean;

  // Supplier & Sourcing
  supplier: string; // Display name
  supplierSku: string; // Restaurant Depot / Daisy SKU

  // Operations
  storageType: StorageType;
  leadTimeDays: number; // Default 2 if same-day pull
  prepTimeMinutes: number; // Incremental labor minutes
  teamCapability: TeamCapability;
  requiredEquipment: RequiredEquipment[];
  operationalNotes?: string; // SOP callouts like "Thaw overnight"

  // Serving & Portions
  servingSize: string; // Human-readable (e.g., "Full tray")
  serves: string | number; // Keep string for ranges like "12-15"

  // Pricing & Margins
  basePrice: number; // USD
  costPerUnit?: number; // USD - for Richard's margin calc
  marginTarget?: number; // Percentage 0-100

  // Availability & Constraints
  availableForTiers: number[]; // [1, 2, 3]
  maxDailyUnits: number; // System-wide daily cap

  // Nutrition & Dietary
  allergens: Allergen[];
  dietaryTags: DietaryTag[];

  // Preparation variants
  preparationOptions?: PreparationOption[];

  // Selection quantity (for cart/order management)
  quantity?: number;

  // Metadata
  lastUpdated?: Date | string; // Server-set timestamp
}

/**
 * Catering Package with Add-Ons Support
 *
 * TODO: Current seed data (scripts/seed-catering-data.js) uses legacy structure:
 * - wingCount (number) instead of wingOptions object
 * - sauceSelections (number) instead of sauceSelections object
 * - composition object instead of sides array
 * This interface reflects the FUTURE structure for Gate 3 configurator refactor.
 * Legacy packages will be migrated during Gate 3 implementation.
 */
export interface CateringPackage {
  // Existing fields
  id: string;
  name: string;
  tier: number;
  servesMin: number;
  servesMax: number;
  basePrice: number;
  description: string;
  marketingHook: string;
  popular: boolean;
  imageUrl: string;

  // Wing configuration
  wingOptions: {
    totalWings: number;
    allowMixed: boolean;
    types: string[];
    boneInOptions: string[];
  };

  // Sauce selection
  sauceSelections: {
    min: number;
    max: number;
    allowedTypes: string[];
  };

  // Dips included
  dipsIncluded: {
    count: number;
    types: string[];
  };

  // Sides
  sides: Array<{
    item: string;
    quantity: number;
  }>;

  // What's included
  includes: string[];

  // Add-ons support (Gate 3)
  allowedAddOns?: {
    vegetarian?: boolean;
    desserts?: boolean;
    maxSelections?: number;
  };

  // Status
  active: boolean;
}

// ============================================================================
// VALIDATORS & TYPE GUARDS
// ============================================================================

/**
 * Check if value is valid StorageType
 */
export function isStorageType(value: string): value is StorageType {
  return Object.values(StorageType).includes(value as StorageType);
}

/**
 * Check if value is valid TeamCapability
 */
export function isTeamCapability(value: string): value is TeamCapability {
  return Object.values(TeamCapability).includes(value as TeamCapability);
}

/**
 * Check if value is valid RequiredEquipment
 */
export function isRequiredEquipment(value: string): value is RequiredEquipment {
  return Object.values(RequiredEquipment).includes(value as RequiredEquipment);
}

/**
 * Check if value is valid Allergen
 */
export function isAllergen(value: string): value is Allergen {
  return Object.values(Allergen).includes(value as Allergen);
}

/**
 * Check if value is valid DietaryTag
 */
export function isDietaryTag(value: string): value is DietaryTag {
  return Object.values(DietaryTag).includes(value as DietaryTag);
}

/**
 * Check if value is valid AddOnCategory
 */
export function isAddOnCategory(value: string): value is AddOnCategory {
  return Object.values(AddOnCategory).includes(value as AddOnCategory);
}

/**
 * Check if value is valid PreparationMethod
 */
export function isPreparationMethod(value: string): value is PreparationMethod {
  return Object.values(PreparationMethod).includes(value as PreparationMethod);
}

/**
 * Validate CateringAddOn object structure
 */
export function validateCateringAddOn(data: any): data is CateringAddOn {
  return (
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    isAddOnCategory(data.category) &&
    typeof data.type === 'string' &&
    typeof data.description === 'string' &&
    typeof data.supplier === 'string' &&
    typeof data.supplierSku === 'string' &&
    isStorageType(data.storageType) &&
    typeof data.leadTimeDays === 'number' &&
    typeof data.prepTimeMinutes === 'number' &&
    isTeamCapability(data.teamCapability) &&
    Array.isArray(data.requiredEquipment) &&
    data.requiredEquipment.every(isRequiredEquipment) &&
    typeof data.servingSize === 'string' &&
    typeof data.basePrice === 'number' &&
    Array.isArray(data.availableForTiers) &&
    typeof data.maxDailyUnits === 'number' &&
    Array.isArray(data.allergens) &&
    data.allergens.every(isAllergen) &&
    Array.isArray(data.dietaryTags) &&
    data.dietaryTags.every(isDietaryTag) &&
    typeof data.imageUrl === 'string' &&
    typeof data.featured === 'boolean' &&
    typeof data.active === 'boolean' &&
    (
      data.preparationOptions === undefined ||
      (
        Array.isArray(data.preparationOptions) &&
        data.preparationOptions.length > 0 &&
        data.preparationOptions.every((option: any) =>
          isPreparationMethod(option.id) &&
          typeof option.label === 'string' &&
          isTeamCapability(option.teamCapability) &&
          Array.isArray(option.requiredEquipment) &&
          option.requiredEquipment.every(isRequiredEquipment) &&
          typeof option.prepTimeMinutes === 'number' &&
          (option.maxDailyUnits === undefined || typeof option.maxDailyUnits === 'number') &&
          typeof option.operationalNotes === 'string' &&
          (
            option.allergenAdjustments === undefined ||
            (Array.isArray(option.allergenAdjustments) && option.allergenAdjustments.every(isAllergen))
          )
        )
      )
    )
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all enum values for a given enum type
 */
export const EnumValues = {
  storageTypes: Object.values(StorageType),
  teamCapabilities: Object.values(TeamCapability),
  requiredEquipment: Object.values(RequiredEquipment),
  allergens: Object.values(Allergen),
  dietaryTags: Object.values(DietaryTag),
  addOnCategories: Object.values(AddOnCategory),
  preparationMethods: Object.values(PreparationMethod)
};

/**
 * Calculate total prep time for an order with add-ons
 */
export function calculateTotalPrepTime(
  basePackagePrepTime: number,
  addOns: CateringAddOn[],
  preparationSelections?: Record<string, PreparationMethod>
): number {
  const addOnTime = addOns.reduce((total, addOn) => {
    const selectedMethod = preparationSelections?.[addOn.id];
    const quantity = addOn.quantity ?? 1;
    return total + getAddOnPrepTime(addOn, selectedMethod) * quantity;
  }, 0);
  return basePackagePrepTime + addOnTime;
}

/**
 * Get all required equipment for an order
 */
export function getRequiredEquipment(
  packageEquipment: RequiredEquipment[],
  addOns: CateringAddOn[],
  preparationSelections?: Record<string, PreparationMethod>
): RequiredEquipment[] {
  const allEquipment = new Set(packageEquipment);
  addOns.forEach(addOn => {
    const selectedMethod = preparationSelections?.[addOn.id];
    const quantity = addOn.quantity ?? 1;
    if (quantity > 0) {
      getAddOnRequiredEquipment(addOn, selectedMethod).forEach(eq => allEquipment.add(eq));
    }
  });
  return Array.from(allEquipment);
}

/**
 * Check if add-on is available for package tier
 */
export function isAddOnAvailableForTier(addOn: CateringAddOn, tier: number): boolean {
  return addOn.availableForTiers.includes(tier);
}

/**
 * Get all allergens for an order
 */
export function getAllergens(
  packageAllergens: Allergen[],
  addOns: CateringAddOn[],
  preparationSelections?: Record<string, PreparationMethod>
): Allergen[] {
  const allAllergens = new Set(packageAllergens);
  addOns.forEach(addOn => {
    const selectedMethod = preparationSelections?.[addOn.id];
    const variantAllergens = getAddOnAllergens(addOn, selectedMethod);
    const quantity = addOn.quantity ?? 1;
    if (quantity > 0) {
      variantAllergens.forEach(allergen => {
        if (allergen !== Allergen.NONE) {
          allAllergens.add(allergen);
        }
      });
    }
  });

  // Remove NONE if other allergens present
  if (allAllergens.size > 1 && allAllergens.has(Allergen.NONE)) {
    allAllergens.delete(Allergen.NONE);
  }

  return Array.from(allAllergens);
}

/**
 * Retrieve a specific preparation option from an add-on
 */
export function getPreparationOption(
  addOn: CateringAddOn,
  method?: PreparationMethod
): PreparationOption | undefined {
  if (!method || !addOn.preparationOptions) {
    return undefined;
  }

  return addOn.preparationOptions.find(option => option.id === method);
}

/**
 * Determine prep time for an add-on, considering preparation option
 */
export function getAddOnPrepTime(
  addOn: CateringAddOn,
  method?: PreparationMethod
): number {
  const option = getPreparationOption(addOn, method);
  return option?.prepTimeMinutes ?? addOn.prepTimeMinutes;
}

/**
 * Determine required equipment for an add-on, considering preparation option
 */
export function getAddOnRequiredEquipment(
  addOn: CateringAddOn,
  method?: PreparationMethod
): RequiredEquipment[] {
  const option = getPreparationOption(addOn, method);
  return option?.requiredEquipment ?? addOn.requiredEquipment;
}

/**
 * Determine allergens for an add-on, considering preparation option adjustments
 */
export function getAddOnAllergens(
  addOn: CateringAddOn,
  method?: PreparationMethod
): Allergen[] {
  const option = getPreparationOption(addOn, method);
  if (!option || !option.allergenAdjustments) {
    return addOn.allergens;
  }

  const allergens = new Set(addOn.allergens);
  option.allergenAdjustments.forEach(adjustment => {
    if (adjustment === Allergen.NONE) {
      allergens.delete(Allergen.NONE);
    } else {
      allergens.add(adjustment);
    }
  });

  return Array.from(allergens);
}
