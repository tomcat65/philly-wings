/**
 * Product Configurator - Product Definitions
 * Defines customization flows for all orderable products
 */

/**
 * Product configuration registry
 * Each product defines its customization flow using composable step types
 */
const PRODUCT_CONFIGS = {
  /**
   * Plant-Based Wings Configuration
   * Flow: Prep Method → Size → Sauces → Included Dips → Extra Dips → Summary
   */
  plantBasedWings: {
    productType: 'configurable-entree',
    displayName: 'Plant-Based Cauliflower Wings',
    category: 'plant-based-wings',

    customizationFlow: [
      {
        id: 'preparation',
        type: 'single-choice',
        label: 'Choose Preparation Method',
        required: true,
        options: [
          {
            id: 'fried',
            label: '🔥 Fried',
            description: 'Crispy & golden, classic texture',
            emoji: '🔥'
          },
          {
            id: 'baked',
            label: '🌿 Baked',
            description: 'Lower fat, health-conscious',
            emoji: '🌿'
          }
        ]
      },
      {
        id: 'size',
        type: 'variant-selector',
        label: 'Choose Size',
        required: true,
        dependsOn: 'preparation', // Filter variants by prep method
        priceSource: 'variant.platformPrice'
      },
      {
        id: 'sauces',
        type: 'multi-choice',
        label: 'Choose Sauces (Up to 3)',
        description: 'Select 1-3 sauces for your plant-based wings',
        required: true,
        minSelections: 1,
        maxSelections: 3,
        allocationRule: 'equalSplit', // For multiple sauces
        dataSource: 'sauces' // Reference to global sauces data
      },
      {
        id: 'extra-sauces',
        type: 'optional-addons',
        label: 'Extra Sauces (Optional)',
        description: 'Add extra 1.5oz sauce cups - choose any sauce!',
        dataSource: 'sauces',
        priceSource: 'firebase' // Use basePrice from Firebase with platform markup
      },
      {
        id: 'included-dips',
        type: 'included-dips',
        label: 'Choose Included Dips',
        description: 'Select your complimentary dipping sauces',
        maxSelections: 2,
        noDipOption: true
      },
      {
        id: 'extra-dips',
        type: 'optional-addons',
        label: 'Extra Dipping Sauces (Optional)',
        description: 'Add extra dips',
        dataSource: 'dippingSauces',
        priceSource: 'firebase' // Use basePrice from Firebase with platform markup
      },
      {
        id: 'summary',
        type: 'review',
        label: 'Review Your Order',
        showPriceBreakdown: true,
        allowEdit: true
      }
    ]
  },

  /**
   * Boneless Wings Configuration (backward compatible)
   * Flow: Size → Sauces → Included Dips → Extra Dips → Summary
   */
  bonelessWings: {
    productType: 'configurable-entree',
    displayName: 'Boneless Wings',
    category: 'wings',

    customizationFlow: [
      {
        id: 'size',
        type: 'variant-selector',
        label: 'Choose Wing Size',
        required: true,
        priceSource: 'variant.platformPrice'
      },
      {
        id: 'sauces',
        type: 'multi-choice',
        label: 'Choose Sauces (Up to 3)',
        required: true,
        minSelections: 1,
        maxSelections: 3,
        allocationRule: 'equalSplit',
        dataSource: 'sauces'
      },
      {
        id: 'extra-sauces',
        type: 'optional-addons',
        label: 'Extra Sauces (Optional)',
        description: 'Add extra 1.5oz sauce cups - choose any sauce!',
        dataSource: 'sauces',
        priceSource: 'firebase' // Use basePrice from Firebase with platform markup
      },
      {
        id: 'includedDips',
        type: 'included-dips',
        label: 'Choose Included Dips',
        description: 'Select your complimentary dipping sauces',
        maxSelections: 2,
        noDipOption: true
      },
      {
        id: 'extraDips',
        type: 'optional-addons',
        label: 'Extra Dipping Sauces',
        description: 'Add extra dips',
        skipIf: { includedDips: 'no-dip' }, // Skip if "No Dip" selected
        dataSource: 'dippingSauces',
        priceSource: 'firebase' // Use basePrice from Firebase with platform markup
      },
      {
        id: 'summary',
        type: 'review',
        label: 'Review Your Order',
        showPriceBreakdown: true,
        allowEdit: true
      }
    ]
  },

  /**
   * Bone-In Wings Configuration (backward compatible)
   * Flow: Size → Sauces → Included Dips → Wing Style → Extra Dips → Summary
   */
  boneInWings: {
    productType: 'configurable-entree',
    displayName: 'Classic Bone-In Wings',
    category: 'wings',

    customizationFlow: [
      {
        id: 'size',
        type: 'variant-selector',
        label: 'Choose Wing Size',
        required: true,
        priceSource: 'variant.platformPrice'
      },
      {
        id: 'sauces',
        type: 'multi-choice',
        label: 'Choose Sauces (Up to 3)',
        required: true,
        minSelections: 1,
        maxSelections: 3,
        allocationRule: 'equalSplit',
        dataSource: 'sauces'
      },
      {
        id: 'extra-sauces',
        type: 'optional-addons',
        label: 'Extra Sauces (Optional)',
        description: 'Add extra 1.5oz sauce cups - choose any sauce!',
        dataSource: 'sauces',
        priceSource: 'firebase' // Use basePrice from Firebase with platform markup
      },
      {
        id: 'includedDips',
        type: 'included-dips',
        label: 'Choose Included Dips',
        maxSelections: 2,
        noDipOption: true
      },
      {
        id: 'wingStyle',
        type: 'single-choice',
        label: 'Wing Style Preference',
        description: 'Choose your preferred wing parts',
        required: true,
        options: [
          { id: 'regular', label: '🍗 Regular Mix', description: 'Flats and drums mixed' },
          { id: 'flats', label: '🦴 All Flats', description: 'Flat wingettes only' },
          { id: 'drums', label: '🍖 All Drums', description: 'Drumettes only' }
        ]
      },
      {
        id: 'extraDips',
        type: 'optional-addons',
        label: 'Extra Dipping Sauces',
        skipIf: { includedDips: 'no-dip' },
        dataSource: 'dippingSauces',
        priceSource: 'firebase' // Use basePrice from Firebase with platform markup
      },
      {
        id: 'summary',
        type: 'review',
        label: 'Review Your Order',
        showPriceBreakdown: true,
        allowEdit: true
      }
    ]
  }
};

module.exports = {
  PRODUCT_CONFIGS
};
