/**
 * Platform branding and styling configuration
 */

/**
 * Get platform-specific branding configuration
 * @param {string} platform Platform name (doordash, ubereats, grubhub)
 * @returns {Object} Branding configuration object
 */
function getPlatformBranding(platform) {
  const branding = {
    doordash: {
      primaryColor: '#FF3333',
      secondaryColor: '#FF6B6B',
      backgroundColor: '#FAFAFA',
      textColor: '#2D2D2D',
      accentColor: '#FFE66D',
      borderColor: '#E0E0E0',
      buttonColor: '#FF3333',
      buttonHover: '#E02929',
      cardBackground: '#FFFFFF',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      platformName: 'DoorDash',
      logoUrl: 'https://cdn.doordash.com/static/img/doordash-logo-red.svg',
      favicon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0ZGMzMzMyIvPgo8L3N2Zz4K',
      backgroundLogo: {
        bonelessWings: {
          url: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fchicken-box-boneless_800x800.webp?alt=media&token=bcfc95e6-d251-4043-8ddd-703cae1a7d63',
          originalUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fchicken-box-boneless.png?alt=media&token=d028ec0c-3815-47a9-8b9c-178a2467fe29',
          position: 'left center',
          size: '320px'
        },
        classicWings: {
          url: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fchicken-box-classic_800x800.webp?alt=media&token=5f73fc8f-3466-4142-83a7-6ac140b709ab',
          originalUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fchicken-box-classic.png?alt=media&token=7446adb5-a179-4a33-9e0a-ad3e0b11fbc3',
          position: 'right center',
          size: '320px'
        },
        opacity: 0.85,
        blend: 'normal'
      }
    },
    ubereats: {
      primaryColor: '#06C167',
      secondaryColor: '#4AE584',
      backgroundColor: '#F8F9FA',
      textColor: '#1C1C1C',
      accentColor: '#FFD23F',
      borderColor: '#DEDEDE',
      buttonColor: '#06C167',
      buttonHover: '#05A856',
      cardBackground: '#FFFFFF',
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      platformName: 'Uber Eats',
      logoUrl: 'https://d3i4yxtzktqr9n.cloudfront.net/web-eats-v2/97c43f8974e6c876.svg',
      favicon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzA2QzE2NyIvPgo8L3N2Zz4K',
      backgroundLogo: {
        bonelessWings: {
          url: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fchicken-box-boneless_800x800.webp?alt=media&token=bcfc95e6-d251-4043-8ddd-703cae1a7d63',
          originalUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fchicken-box-boneless.png?alt=media&token=d028ec0c-3815-47a9-8b9c-178a2467fe29',
          position: 'left center',
          size: '320px'
        },
        classicWings: {
          url: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fchicken-box-classic_800x800.webp?alt=media&token=5f73fc8f-3466-4142-83a7-6ac140b709ab',
          originalUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fchicken-box-classic.png?alt=media&token=7446adb5-a179-4a33-9e0a-ad3e0b11fbc3',
          position: 'right center',
          size: '320px'
        },
        opacity: 0.85,
        blend: 'normal'
      }
    },
    grubhub: {
      primaryColor: '#F63440',
      secondaryColor: '#FF6B73',
      backgroundColor: '#FFFFFF',
      textColor: '#2E3333',
      accentColor: '#FFA500',
      borderColor: '#E8E8E8',
      buttonColor: '#F63440',
      buttonHover: '#DD2E39',
      cardBackground: '#FFFFFF',
      shadowColor: 'rgba(246, 52, 64, 0.1)',
      platformName: 'Grubhub',
      logoUrl: 'https://res.cloudinary.com/grubhub/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_64/TopBranding/gh-logo',
      favicon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y2MzQ0MCIvPgo8L3N2Zz4K',
      backgroundLogo: {
        bonelessWings: {
          url: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fchicken-box-boneless_800x800.webp?alt=media&token=bcfc95e6-d251-4043-8ddd-703cae1a7d63',
          originalUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fchicken-box-boneless.png?alt=media&token=d028ec0c-3815-47a9-8b9c-178a2467fe29',
          position: 'left center',
          size: '320px'
        },
        classicWings: {
          url: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fchicken-box-classic_800x800.webp?alt=media&token=5f73fc8f-3466-4142-83a7-6ac140b709ab',
          originalUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fchicken-box-classic.png?alt=media&token=7446adb5-a179-4a33-9e0a-ad3e0b11fbc3',
          position: 'right center',
          size: '320px'
        },
        opacity: 0.85,
        blend: 'normal'
      }
    }
  };

  return branding[platform] || branding.doordash;
}

/**
 * Generate platform-specific featured items
 * @param {Array} wings Wing variants array
 * @param {Array} combos Combos array
 * @returns {Array} Featured items for homepage display
 */
function generateFeaturedItems(wings, combos) {
  const featured = [];

  // Add top combos (first 2)
  if (combos.length > 0) {
    featured.push(...combos.slice(0, 2).map(combo => ({
      id: combo.id,
      name: combo.name,
      description: combo.description || `${combo.name} - A perfect meal combination`,
      price: combo.platformPrice,
      image: combo.image,
      category: 'combo',
      featured: true
    })));
  }

  // Add popular wing variants (6 and 12 count)
  const popularWings = wings.filter(wing =>
    wing.name.includes('6 ') || wing.name.includes('12 ')
  ).slice(0, 2);

  featured.push(...popularWings.map(wing => ({
    id: wing.id,
    name: wing.name,
    description: `Crispy ${wing.name.toLowerCase()} wings with your choice of signature sauces`,
    price: wing.platformPrice,
    image: wing.image,
    category: 'wings',
    featured: true
  })));

  return featured.slice(0, 4); // Limit to 4 featured items
}

module.exports = {
  getPlatformBranding,
  generateFeaturedItems
};