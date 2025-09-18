// Export Menu for Delivery Platforms
// Generates CSV and JSON formats for DoorDash, UberEats, and Grubhub

import { masterMenu, getMenuForPlatform, getModifiersWithPricing } from './menu-master.js';

// DoorDash CSV Format
export function exportDoorDashCSV() {
  const menu = getMenuForPlatform('doordash');
  const modifiers = getModifiersWithPricing('doordash');

  let csv = 'Category,Item Name,Description,Price,Modifier Group,Modifier Name,Modifier Price,Calories,Prep Time,Featured\n';

  Object.keys(menu).forEach(categoryKey => {
    const category = menu[categoryKey];
    if (!category.items) return;

    category.items.forEach(item => {
      // Base item row
      csv += `"${category.category}","${item.name}","${item.description || ''}","${item.price}","","","","${item.calories || ''}","${item.prepTime || ''}","${item.featured ? 'Yes' : 'No'}"\n`;

      // Add modifier rows
      if (item.modifiers) {
        // Sauce modifiers
        if (item.modifiers.sauces) {
          modifiers.sauces.forEach(sauce => {
            csv += `"${category.category}","${item.name}","","","Sauce Choice","${sauce.name}","0","","",""\n`;
          });
        }

        // Extra modifiers
        if (item.modifiers.extras && item.modifiers.extras.options) {
          item.modifiers.extras.options.forEach(extra => {
            csv += `"${category.category}","${item.name}","","","Extras","${extra.name}","${extra.price}","","",""\n`;
          });
        }
      }
    });
  });

  return csv;
}

// UberEats JSON Format
export function exportUberEatsJSON() {
  const menu = getMenuForPlatform('ubereats');
  const modifiers = getModifiersWithPricing('ubereats');

  const uberMenu = {
    restaurant_name: "Philly Wings Express",
    menu_sections: []
  };

  Object.keys(menu).forEach(categoryKey => {
    const category = menu[categoryKey];
    if (!category.items) return;

    const section = {
      section_name: category.category,
      section_description: category.description,
      items: []
    };

    category.items.forEach(item => {
      const menuItem = {
        item_name: item.name,
        item_description: item.description || '',
        price: item.price,
        calories: item.calories,
        preparation_time_minutes: item.prepTime,
        featured: item.featured || false,
        modifier_groups: []
      };

      // Add sauce modifiers
      if (item.modifiers && item.modifiers.sauces) {
        menuItem.modifier_groups.push({
          group_name: 'Choose Your Sauce',
          required: item.modifiers.sauces.required || false,
          max_selections: item.modifiers.sauces.limit || 1,
          modifiers: modifiers.sauces.map(sauce => ({
            modifier_name: sauce.name,
            modifier_price: 0,
            heat_level: sauce.heatLevel,
            allergens: sauce.allergens || []
          }))
        });
      }

      // Add extras
      if (item.modifiers && item.modifiers.extras) {
        menuItem.modifier_groups.push({
          group_name: 'Add Extras',
          required: false,
          modifiers: item.modifiers.extras.options.map(extra => ({
            modifier_name: extra.name,
            modifier_price: extra.price
          }))
        });
      }

      section.items.push(menuItem);
    });

    uberMenu.menu_sections.push(section);
  });

  return JSON.stringify(uberMenu, null, 2);
}

// Grubhub CSV Format
export function exportGrubhubCSV() {
  const menu = getMenuForPlatform('grubhub');
  const modifiers = getModifiersWithPricing('grubhub');

  let csv = 'Menu Section,Item Name,Item Description,Item Price,Option Group,Option Name,Option Price,Min Options,Max Options,Calories\n';

  Object.keys(menu).forEach(categoryKey => {
    const category = menu[categoryKey];
    if (!category.items) return;

    category.items.forEach(item => {
      // Base item
      csv += `"${category.category}","${item.name}","${item.description || ''}","${item.price}","","","","","","${item.calories || ''}"\n`;

      // Sauce options
      if (item.modifiers && item.modifiers.sauces) {
        const min = item.modifiers.sauces.required ? 1 : 0;
        const max = item.modifiers.sauces.limit || 1;

        modifiers.sauces.forEach(sauce => {
          csv += `"${category.category}","${item.name}","","","Sauce Selection","${sauce.name}","0","${min}","${max}",""\n`;
        });
      }

      // Extra options
      if (item.modifiers && item.modifiers.extras && item.modifiers.extras.options) {
        item.modifiers.extras.options.forEach(extra => {
          csv += `"${category.category}","${item.name}","","","Add-Ons","${extra.name}","${extra.price}","0","99",""\n`;
        });
      }
    });
  });

  return csv;
}

// Platform-specific formatting guidelines
export const platformGuidelines = {
  doordash: {
    name: 'DoorDash',
    format: 'CSV',
    requirements: [
      'Item names must be under 50 characters',
      'Descriptions should be under 200 characters',
      'Modifier groups must be clearly defined',
      'Prices must include dollar sign',
      'Featured items should be marked',
      'Include prep time for kitchen efficiency'
    ],
    uploadUrl: 'https://merchant.doordash.com/menu',
    notes: 'Upload CSV through Merchant Portal. Allow 24-48 hours for review.'
  },

  ubereats: {
    name: 'UberEats',
    format: 'JSON',
    requirements: [
      'JSON format preferred for bulk uploads',
      'Include all modifier groups',
      'Specify required vs optional modifiers',
      'Set max selections for each group',
      'Include nutritional info when available',
      'Mark featured/popular items'
    ],
    uploadUrl: 'https://merchants.ubereats.com/manager',
    notes: 'Use Menu Maker tool or upload JSON via API. Changes reflect within 2-4 hours.'
  },

  grubhub: {
    name: 'Grubhub',
    format: 'CSV',
    requirements: [
      'CSV with specific column headers',
      'Option groups must specify min/max',
      'Include all customization options',
      'Descriptions improve conversion',
      'Photos can be uploaded separately',
      'Consider promotional tags'
    ],
    uploadUrl: 'https://restaurant.grubhub.com/menu',
    notes: 'Import through Restaurant Dashboard. Review takes 12-24 hours.'
  }
};

// Generate complete export package
export function generateExportPackage(platform) {
  const timestamp = new Date().toISOString().split('T')[0];
  const menu = getMenuForPlatform(platform);

  let content, filename, mimeType;

  switch(platform) {
    case 'doordash':
      content = exportDoorDashCSV();
      filename = `philly-wings-doordash-menu-${timestamp}.csv`;
      mimeType = 'text/csv';
      break;

    case 'ubereats':
      content = exportUberEatsJSON();
      filename = `philly-wings-ubereats-menu-${timestamp}.json`;
      mimeType = 'application/json';
      break;

    case 'grubhub':
      content = exportGrubhubCSV();
      filename = `philly-wings-grubhub-menu-${timestamp}.csv`;
      mimeType = 'text/csv';
      break;

    default:
      content = JSON.stringify(menu, null, 2);
      filename = `philly-wings-${platform}-menu-${timestamp}.json`;
      mimeType = 'application/json';
  }

  return {
    content,
    filename,
    mimeType,
    guidelines: platformGuidelines[platform] || null,
    stats: calculateMenuStats(menu)
  };
}

// Calculate menu statistics
function calculateMenuStats(menu) {
  let totalItems = 0;
  let totalModifiers = 0;
  let avgPrice = 0;
  let categories = [];

  Object.keys(menu).forEach(categoryKey => {
    const category = menu[categoryKey];
    if (!category.items) return;

    categories.push(category.category);
    category.items.forEach(item => {
      totalItems++;
      avgPrice += item.price || 0;

      if (item.modifiers) {
        Object.keys(item.modifiers).forEach(modGroup => {
          if (item.modifiers[modGroup].options) {
            totalModifiers += item.modifiers[modGroup].options.length;
          }
        });
      }
    });
  });

  return {
    totalItems,
    totalModifiers,
    avgPrice: (avgPrice / totalItems).toFixed(2),
    categories: categories.length,
    exportDate: new Date().toISOString()
  };
}