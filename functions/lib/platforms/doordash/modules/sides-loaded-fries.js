/**
 * Sides Loaded Fries Orchestrator (initial implementation)
 * Provides configuration for loaded fries with a customization step that
 * allows customers to select topping placement.
 */

function generateSidesLoadedFriesJS(menuData = {}) {
  const friesVariants = (menuData.fries && menuData.fries.variants) || [];
  const loadedFallback = friesVariants.filter(variant =>
    /cheese|bacon/i.test(variant.name || '') && !/^french fries$/i.test(variant.name || '')
  );

  // Build customization options from Firebase config or use fallback
  function buildCustomizationOptions() {
    const friesConfig = menuData.fries && menuData.fries.customization;
    if (friesConfig && Array.isArray(friesConfig.toppingsPlacement)) {
      return friesConfig.toppingsPlacement;
    }

    // Fallback hardcoded options if not configured in Firebase
    return [
      { id: 'on_top', label: 'On Top', description: 'Cheese sauce and bacon served over the fries for maximum flavor.' },
      { id: 'on_side', label: 'On the Side', description: 'Toppings served separately to keep fries crisp.' }
    ];
  }

  const customizationOptions = buildCustomizationOptions();

  return `
    (function(){
      const FALLBACK_VARIANTS = ${JSON.stringify(loadedFallback)};
      const CUSTOMIZATION_OPTIONS = ${JSON.stringify(customizationOptions)};
      const DOORDASH_MULTIPLIER = 1.35;

      function toNumber(value, fallback = 0) {
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? fallback : parsed;
      }

      function derivePlatformPrice(variant) {
        if (typeof variant.platformPrice === 'number') return variant.platformPrice;
        if (typeof variant.platformPrice === 'string') {
          const parsed = parseFloat(variant.platformPrice);
          if (!Number.isNaN(parsed)) return parsed;
        }
        if (typeof variant.basePrice === 'number') return Number((variant.basePrice * DOORDASH_MULTIPLIER).toFixed(2));
        if (typeof variant.price === 'number') return Number((variant.price * DOORDASH_MULTIPLIER).toFixed(2));
        const parsed = toNumber(variant.basePrice || variant.price, 0);
        return Number((parsed * DOORDASH_MULTIPLIER).toFixed(2));
      }

      function normaliseLoadedVariants(rawVariants) {
        if (!Array.isArray(rawVariants)) return [];
        return rawVariants.map((variant, index) => {
          const platformPrice = derivePlatformPrice(variant);
          const variantId = variant.id || (variant.name ? variant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'loaded-fries-' + (index + 1));
          return {
            id: variantId,
            name: variant.name || 'Loaded Fries',
            subtitle: variant.description || 'Loaded with cheese sauce and toppings',
            platformPrice,
            description: variant.description || ''
          };
        });
      }

      function buildLoadedVariants() {
        const firestoreVariants = (strategicMenu.fries && Array.isArray(strategicMenu.fries.variants))
          ? strategicMenu.fries.variants.filter(variant =>
              /cheese|bacon/i.test(variant.name || '') && !/^french fries$/i.test(variant.name || '')
            )
          : FALLBACK_VARIANTS;
        return normaliseLoadedVariants(firestoreVariants);
      }

      window.openLoadedFriesModal = function() {
        if (typeof window.openSidesModal !== 'function') {
          console.error('Shared sides modal not loaded.');
          return;
        }

        const variants = buildLoadedVariants();
        if (!variants.length) {
          alert('Loaded fries are currently unavailable. Please check back soon.');
          return;
        }

        window.openSidesModal({
          sideKey: 'loaded-fries',
          modalTitle: 'Loaded Fries',
          stepOrder: ['variants', 'customization', 'dips', 'summary'],
          stepLabels: {
            variants: 'Options',
            customization: 'Customize',
            dips: 'Dips',
            summary: 'Summary'
          },
          stepTitles: {
            variants: 'Choose Your Loaded Fries',
            customization: 'How should we serve the toppings?',
            dips: 'Extra Dipping Sauces',
            summary: 'Loaded Fries Summary'
          },
          summaryHeading: 'Loaded Fries Summary',
          customization: {
            enabled: true,
            stateKey: 'toppingsPlacement',
            defaultOption: 'on_top',
            options: CUSTOMIZATION_OPTIONS,
            required: true
          },
          variants
        });
      };
    })();
  `;
}

module.exports = {
  generateSidesLoadedFriesJS
};
