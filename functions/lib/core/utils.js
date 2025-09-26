/**
 * Extract platform from request (subdomain or query parameter)
 * @param {Object} req Express request object
 * @returns {string} Platform name (doordash, ubereats, grubhub)
 */
function extractPlatform(req) {
  // Try query parameter first
  if (req.query.platform) {
    return req.query.platform.toLowerCase();
  }

  // Try subdomain extraction
  const host = req.get('host') || req.get('x-forwarded-host') || '';
  if (host.includes('doordash')) return 'doordash';
  if (host.includes('ubereats')) return 'ubereats';
  if (host.includes('grubhub')) return 'grubhub';

  // Default fallback
  return 'doordash';
}

/**
 * Generate today's hours string for display
 * @param {Object} settings Settings object with hours configuration
 * @returns {string} Formatted hours string
 */
function generateTodaysHours(settings) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const hours = settings.hours && settings.hours[today];

  if (!hours) {
    return 'Open Daily: 11:00 AM - 10:00 PM';
  }

  return hours.closed ? 'Closed Today' : `Open Today: ${hours.open} - ${hours.close}`;
}

/**
 * Get heat level CSS class
 * @param {number} heatLevel Heat level (1-5)
 * @returns {string} CSS class name
 */
function getHeatLevelClass(heatLevel) {
  if (heatLevel <= 1) return 'heat-mild';
  if (heatLevel <= 2) return 'heat-medium';
  if (heatLevel <= 3) return 'heat-hot';
  if (heatLevel <= 4) return 'heat-very-hot';
  return 'heat-extreme';
}

/**
 * Get heat level text description
 * @param {number} heatLevel Heat level (1-5)
 * @returns {string} Text description
 */
function getHeatLevelText(heatLevel) {
  if (heatLevel <= 1) return 'Mild';
  if (heatLevel <= 2) return 'Medium';
  if (heatLevel <= 3) return 'Hot';
  if (heatLevel <= 4) return 'Very Hot';
  return 'Extreme';
}

/**
 * Get heat level emoji representation
 * @param {number} heatLevel Heat level (1-5)
 * @returns {string} Emoji string
 */
function getHeatEmojis(heatLevel) {
  const emoji = '🔥';
  const count = Math.max(1, Math.min(5, Math.floor(heatLevel)));
  return emoji.repeat(count);
}

/**
 * Generate wing description based on variant
 * @param {Object} variant Wing variant object
 * @returns {string} Description text
 */
function generateWingDescription(variant) {
  return `Crispy ${variant.name.toLowerCase()} wings with your choice of signature sauces`;
}

/**
 * Generate combo description
 * @param {Object} combo Combo object
 * @returns {string} Description text
 */
function generateComboDescription(combo) {
  return combo.description || `${combo.name} - A perfect meal combination`;
}

/**
 * Get platform display name
 * @param {string} platform Platform identifier
 * @returns {string} Display name
 */
function getPlatformName(platform) {
  const names = {
    'doordash': 'DoorDash',
    'ubereats': 'UberEats',
    'grubhub': 'GrubHub'
  };
  return names[platform] || 'DoorDash';
}

/**
 * Format currency for display
 * @param {number} amount Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `$${numAmount.toFixed(2)}`;
}

/**
 * Generate today's hours from settings
 * @param {Object} settings Settings object from Firestore
 * @returns {string} Today's business hours
 */
function generateTodaysHours(settings) {
  if (!settings?.businessHours) return '10:30 AM - 7:15 PM';

  const today = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[today.getDay()];

  const todayHours = settings.businessHours[todayName];
  if (!todayHours) return '10:30 AM - 7:15 PM';

  return `${todayHours.open} - ${todayHours.close}`;
}

/**
 * Sanitize HTML content
 * @param {string} content HTML content to sanitize
 * @returns {string} Sanitized content
 */
function sanitizeHTML(content) {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = {
  extractPlatform,
  generateTodaysHours,
  getHeatLevelClass,
  getHeatLevelText,
  getHeatEmojis,
  generateWingDescription,
  generateComboDescription,
  getPlatformName,
  formatCurrency,
  sanitizeHTML
};