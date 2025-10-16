/**
 * DoorDash Platform Module - Main Entry Point
 * Coordinates HTML, CSS, and JavaScript generation for DoorDash platform
 */

const { generateDoorDashCSS, generateProductConfiguratorStyles } = require('./css');
const { generateDoorDashHTMLBody } = require('./html');
const { generateDoorDashJS } = require('./javascript-modular');
const { getPlatformBranding } = require('../../data/branding');

/**
 * Generate complete DoorDash menu HTML
 * @param {Object} menuData Processed menu data with platform pricing
 * @param {Object} settings Restaurant settings
 * @returns {string} Complete HTML page for DoorDash
 */
function generateDoorDashMenuPage(menuData, settings = {}) {
  const branding = getPlatformBranding('doordash');

  // Generate individual components
  const css = generateDoorDashCSS(branding) + generateProductConfiguratorStyles();
  const javascript = generateDoorDashJS(menuData);
  const htmlBody = generateDoorDashHTMLBody(menuData, branding, settings);

  // Combine into complete page
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Philly Wings Express - ${branding.platformName} Menu</title>
    <link rel="icon" href="${branding.favicon}" type="image/svg+xml">
    <style>${css}</style>
</head>
<body>
    ${htmlBody}
    <script>${javascript}</script>
</body>
</html>`;
}

module.exports = {
  generateDoorDashHTML: generateDoorDashMenuPage
};