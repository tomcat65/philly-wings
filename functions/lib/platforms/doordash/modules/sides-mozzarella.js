/**
 * Sides Mozzarella Orchestrator
 * Normalizes mozzarella stick variants and launches the shared sides modal.
 */

function generateSidesMozzarellaJS(menuData = {}) {
  const mozzarellaFallback = (menuData.mozzarella && menuData.mozzarella.variants) || [];

  return `
    (function(){
      const FALLBACK_VARIANTS = ${JSON.stringify(mozzarellaFallback)};
      const DOORDASH_MULTIPLIER = 1.35;

      function derivePlatformPrice(variant) {
        if (typeof variant.platformPrice === 'number') return variant.platformPrice;
        if (typeof variant.platformPrice === 'string') {
          const parsed = parseFloat(variant.platformPrice);
          if (!Number.isNaN(parsed)) return parsed;
        }
        if (typeof variant.basePrice === 'number') return Number((variant.basePrice * DOORDASH_MULTIPLIER).toFixed(2));
        if (typeof variant.price === 'number') return Number((variant.price * DOORDASH_MULTIPLIER).toFixed(2));
        const parsed = parseFloat(variant.basePrice || variant.price || 0);
        if (Number.isNaN(parsed)) return 0;
        return Number((parsed * DOORDASH_MULTIPLIER).toFixed(2));
      }

      function normaliseMozzarellaVariants(rawVariants) {
        if (!Array.isArray(rawVariants)) return [];
        return rawVariants.map((variant, index) => {
          const platformPrice = derivePlatformPrice(variant);
          const countLabel = variant.count ? variant.count + ' Sticks' : '';
          const variantId = variant.id || ('mozzarella-' + (index + 1));
          return {
            id: variantId,
            name: variant.name || (countLabel || 'Mozzarella Sticks'),
            subtitle: variant.description || countLabel,
            platformPrice,
            description: variant.description || ''
          };
        });
      }

      function buildMozzarellaVariants() {
        const firestoreVariants = (strategicMenu.mozzarella && Array.isArray(strategicMenu.mozzarella.variants))
          ? strategicMenu.mozzarella.variants
          : FALLBACK_VARIANTS;
        return normaliseMozzarellaVariants(firestoreVariants);
      }

      window.openMozzarellaModal = function() {
        if (typeof window.openSidesModal !== 'function') {
          console.error('Shared sides modal not loaded.');
          return;
        }

        const variants = buildMozzarellaVariants();
        if (!variants.length) {
          alert('Mozzarella sticks are currently unavailable. Please check back soon.');
          return;
        }

        window.openSidesModal({
          sideKey: 'mozzarella',
          modalTitle: 'Mozzarella Sticks',
          stepOrder: ['variants', 'dips', 'summary'],
          stepLabels: {
            variants: 'Quantity',
            dips: 'Dips',
            summary: 'Summary'
          },
          stepTitles: {
            variants: 'Choose Your Quantity',
            dips: 'Add Extra Dipping Sauces',
            summary: 'Mozzarella Summary'
          },
          summaryHeading: 'Mozzarella Summary',
          variants
        });
      };
    })();
  `;
}

module.exports = {
  generateSidesMozzarellaJS
};
