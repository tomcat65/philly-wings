/**
 * Sides Fries Orchestrator
 * Normalizes fries variants from Firestore and launches the shared sides modal.
 */

function generateSidesFriesJS(menuData = {}) {
  const friesFallback = (menuData.fries && menuData.fries.variants) || [];

  return `
    (function(){
      const FALLBACK_VARIANTS = ${JSON.stringify(friesFallback)};
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

      function normaliseVariants(rawVariants) {
        if (!Array.isArray(rawVariants)) return [];
        return rawVariants.map((variant, index) => {
          const platformPrice = derivePlatformPrice(variant);
          const subtitle = variant.description || variant.size || '';
          const variantId = variant.id || (variant.name ? variant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'fries-' + (index + 1));
          return {
            id: variantId,
            name: variant.name || variant.size || 'Fries',
            subtitle,
            platformPrice,
            description: variant.description || ''
          };
        });
      }

      function buildFriesVariants() {
        const firestoreVariants = (strategicMenu.fries && Array.isArray(strategicMenu.fries.variants)) ? strategicMenu.fries.variants : FALLBACK_VARIANTS;
        // Filter to only show plain fries (no cheese, no bacon) - just Original and Large sizes
        const plainFries = firestoreVariants.filter(v =>
          v.id && v.id.includes('fries_') && !v.id.includes('cheese') && !v.id.includes('bacon')
        );
        return normaliseVariants(plainFries.length > 0 ? plainFries : firestoreVariants);
      }

      window.openFriesModal = function() {
        if (typeof window.openSidesModal !== 'function') {
          console.error('Shared sides modal not loaded.');
          return;
        }

        const variants = buildFriesVariants();
        if (!variants.length) {
          alert('Fries are currently unavailable. Please check back soon.');
          return;
        }

        window.openSidesModal({
          sideKey: 'fries',
          modalTitle: 'Choose Your Fries',
          stepOrder: ['variants', 'dips', 'summary'],
          stepLabels: {
            variants: 'Size',
            dips: 'Dips',
            summary: 'Summary'
          },
          stepTitles: {
            variants: 'Select Your Size',
            dips: 'Extra Dipping Sauces',
            summary: 'Fries Summary'
          },
          summaryHeading: 'Fries Summary',
          variants
        });
      };
    })();
  `;
}

module.exports = {
  generateSidesFriesJS
};
