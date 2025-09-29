/**
 * UberEats Platform Module - Uses shared generators with UberEats branding
 */

const { generateDoorDashCSS } = require('../doordash/css');
const { generateDoorDashHTMLBody } = require('../doordash/html');
const { generateDoorDashJS } = require('../doordash/javascript-modular');
const { getPlatformBranding } = require('../../data/branding');

function generateUberEatsMenuPage(menuData, settings = {}) {
  const branding = getPlatformBranding('ubereats');

  const css = generateDoorDashCSS(branding);
  const javascript = generateDoorDashJS(menuData);
  const htmlBody = generateDoorDashHTMLBody(menuData, branding, settings);

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
  generateUberEatsHTML: generateUberEatsMenuPage
};
