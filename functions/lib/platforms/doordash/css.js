/**
 * DoorDash CSS Generation
 * Handles all styling for DoorDash platform with clean, maintainable structure
 */

/**
 * Generate complete DoorDash CSS
 * @param {Object} branding Platform branding configuration
 * @returns {string} Complete CSS stylesheet
 */
function generateDoorDashCSS(branding) {
  return `
    ${generateBaseStyles()}
    ${generateHeaderStyles(branding)}
    ${generateNavigationStyles(branding)}
    ${generateMenuSectionStyles(branding)}
    ${generateWingModalStyles(branding)}
    ${generateResponsiveStyles()}
  `;
}

/**
 * Generate base/reset styles
 */
function generateBaseStyles() {
  return `
    /* Reset and Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #2D2D2D;
      background-color: #FAFAFA;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
    }

    button {
      font-family: inherit;
      cursor: pointer;
      border: none;
      outline: none;
    }
  `;
}

/**
 * Generate header styles
 */
function generateHeaderStyles(branding) {
  return `
    /* Header Styles */
    .restaurant-header {
      background: linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor});
      color: white;
      padding: 2rem 1rem;
      text-align: center;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 20px ${branding.shadowColor};
      position: relative;
      overflow: hidden;
    }

    /* Dual Background Logo System */
    .restaurant-header::before,
    .restaurant-header::after {
      content: '';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: ${branding.backgroundLogo?.bonelessWings?.size || '180px'};
      height: ${branding.backgroundLogo?.bonelessWings?.size || '180px'};
      background-size: contain;
      background-repeat: no-repeat;
      opacity: ${branding.backgroundLogo?.opacity || 0.08};
      mix-blend-mode: ${branding.backgroundLogo?.blend || 'overlay'};
      z-index: 1;
      pointer-events: none;
    }

    .restaurant-header::before {
      left: 5%;
      background-image: url('${branding.backgroundLogo?.bonelessWings?.url}');
      background-position: ${branding.backgroundLogo?.bonelessWings?.position || 'left center'};
    }

    .restaurant-header::after {
      right: 5%;
      background-image: url('${branding.backgroundLogo?.classicWings?.url}');
      background-position: ${branding.backgroundLogo?.classicWings?.position || 'right center'};
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }

    .restaurant-name {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .restaurant-description {
      font-size: 1.1rem;
      opacity: 0.9;
      margin-bottom: 1rem;
    }

    .restaurant-meta {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 0.9rem;
    }

    .hours, .delivery-info {
      background: rgba(255,255,255,0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
  `;
}

/**
 * Generate navigation styles
 */
function generateNavigationStyles(branding) {
  return `
    /* Navigation Styles */
    .menu-navigation {
      background: white;
      border-bottom: 1px solid ${branding.borderColor};
      position: static;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      padding: 1rem;
    }

    .mobile-menu-toggle {
      display: none;
      background: none;
      border: none;
      flex-direction: column;
      justify-content: center;
      width: 30px;
      height: 30px;
      cursor: pointer;
      padding: 0;
    }

    .hamburger-line {
      width: 25px;
      height: 3px;
      background-color: #666;
      margin: 3px 0;
      transition: 0.3s;
      border-radius: 2px;
    }

    .mobile-menu-toggle.active .hamburger-line:nth-child(1) {
      transform: rotate(-45deg) translate(-5px, 6px);
    }

    .mobile-menu-toggle.active .hamburger-line:nth-child(2) {
      opacity: 0;
    }

    .mobile-menu-toggle.active .hamburger-line:nth-child(3) {
      transform: rotate(45deg) translate(-5px, -6px);
    }

    .nav-items {
      display: flex;
      gap: 2rem;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .nav-items::-webkit-scrollbar {
      display: none;
    }

    .nav-item {
      white-space: nowrap;
      color: #666;
      text-decoration: none;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 25px;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .nav-item:hover, .nav-item.active {
      color: ${branding.primaryColor};
      background: ${branding.primaryColor}10;
      border-color: ${branding.primaryColor};
    }
  `;
}

/**
 * Generate menu section styles
 */
function generateMenuSectionStyles(branding) {
  return `
    /* Menu Section Styles */
    .menu-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .menu-section {
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 1.5rem;
      position: relative;
    }

    .section-title::after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 0;
      width: 60px;
      height: 3px;
      background: ${branding.primaryColor};
      border-radius: 2px;
    }

    /* Combo Cards */
    .combo-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .combo-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px ${branding.shadowColor};
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .combo-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px ${branding.shadowColor};
    }

    .combo-image-wrapper {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .combo-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .combo-card:hover .combo-image {
      transform: scale(1.05);
    }

    .combo-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: #ff6b35;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .savings-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #00b887;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: bold;
    }

    .combo-details {
      padding: 20px;
    }

    .combo-name {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #1a1a1a;
    }

    .combo-description {
      color: #666;
      font-size: 14px;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .combo-includes {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .include-item {
      background: #f8f9fa;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      color: #666;
    }

    .combo-pricing {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .combo-price {
      font-size: 24px;
      font-weight: bold;
      color: #1a1a1a;
    }

    .price-label {
      font-size: 12px;
      color: #666;
    }

    .order-now-btn {
      width: 100%;
      background: #ff6b35;
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .order-now-btn:hover {
      background: #e55a2b;
    }

    /* Enhanced Wings Section */
    .wings-categories-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin: 24px 0;
    }

    @media (max-width: 768px) {
      .wings-categories-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }

    .wing-category-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .wing-category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }

    .wing-category-image-wrapper {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
    }

    .wing-category-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .wing-category-card:hover .wing-category-image {
      transform: scale(1.05);
    }

    .wing-category-badge {
      position: absolute;
      top: 16px;
      left: 16px;
      background: ${branding.primaryColor};
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .value-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: #00b887;
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }

    .authenticity-badge, .tradition-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: #ff6b35;
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }

    .wing-category-details {
      padding: 20px;
    }

    .wing-category-name {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #1a1a1a;
    }

    .wing-category-description {
      color: #666;
      font-size: 14px;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .wing-category-pricing {
      margin-bottom: 16px;
    }

    .price-main {
      font-size: 20px;
      font-weight: bold;
      color: ${branding.primaryColor};
      margin-bottom: 4px;
    }

    .price-comparison {
      font-size: 12px;
      color: #00b887;
      font-weight: 600;
    }

    .order-wing-category-btn {
      width: 100%;
      background: ${branding.primaryColor};
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .order-wing-category-btn:hover {
      background: ${branding.buttonHover};
    }

    /* Sides Section Professional Design */
    .sides-categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin: 24px 0;
    }

    .side-category-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .side-category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }

    .side-category-image-wrapper {
      position: relative;
      width: 100%;
      height: 180px;
      overflow: hidden;
    }

    .side-category-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .side-category-card:hover .side-category-image {
      transform: scale(1.05);
    }

    .side-category-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: #ff6b35;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .side-category-details {
      padding: 20px;
    }

    .side-category-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #1a1a1a;
    }

    .side-category-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .side-sizes-info {
      margin-bottom: 16px;
    }

    .sizes-label {
      font-size: 13px;
      color: #888;
      font-style: italic;
    }

    .side-category-pricing {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .order-side-category-btn {
      width: 100%;
      background: #ff6b35;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .order-side-category-btn:hover {
      background: #e55a2b;
    }

    /* Dips Section Professional Design */
    .dips-categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 24px 0;
    }

    .dip-category-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .dip-category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }

    .dip-category-image-wrapper {
      position: relative;
      width: 100%;
      height: 180px;
      overflow: hidden;
    }

    .dip-category-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .dip-category-card:hover .dip-category-image {
      transform: scale(1.05);
    }

    .dip-category-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: #ff6b35;
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .dip-category-details {
      padding: 20px;
    }

    .dip-category-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #1a1a1a;
    }

    .dip-category-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .dip-category-pricing {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .order-dip-category-btn {
      width: 100%;
      background: #ff6b35;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .order-dip-category-btn:hover {
      background: #e55a2b;
    }

    /* Beverages Section Professional Design */
    .beverages-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin: 24px 0;
    }

    .beverage-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .beverage-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }

    .beverage-card.featured {
      border: 2px solid #ff6b35;
    }

    .beverage-image-wrapper {
      position: relative;
      width: 100%;
      height: 280px;
      overflow: hidden;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .beverage-card .beverage-image {
      width: 220px !important;
      height: 220px !important;
      max-width: 220px !important;
      max-height: 220px !important;
      object-fit: contain;
      transition: transform 0.3s ease;
    }

    .beverage-card:hover .beverage-image {
      transform: scale(1.05);
    }

    .beverage-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: #28a745;
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .beverage-details {
      padding: 20px;
    }

    .beverage-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #1a1a1a;
    }

    .beverage-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .beverage-pricing {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .beverage-btn {
      width: 100%;
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .beverage-btn:hover {
      background: #218838;
    }

    /* Sauce Section Professional Design */
    .sauce-category-section {
      margin-bottom: 40px;
    }

    .sauce-category-title {
      font-size: 22px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sauce-category-description {
      font-size: 16px;
      color: #666;
      margin-bottom: 24px;
      line-height: 1.5;
    }

    .sauces-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .sauce-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .sauce-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }

    .sauce-image-wrapper {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    }

    .sauce-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .sauce-card:hover .sauce-image {
      transform: scale(1.05);
    }

    .sauce-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #28a745;
      color: white;
      padding: 6px 10px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .sauce-content {
      padding: 20px;
    }

    .sauce-name {
      font-size: 18px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 8px;
    }

    .sauce-description {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .sauce-heat-level {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: bold;
    }

    .heat-indicators {
      font-size: 14px;
    }

    .heat-text {
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Other Items */
    .beverages-grid, .dips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .beverage-item, .dip-item {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px ${branding.shadowColor};
      transition: transform 0.3s ease;
      text-align: center;
    }

    .beverage-item:hover, .dip-item:hover {
      transform: translateY(-2px);
    }

    .beverage-image, .dip-image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      margin: 0 auto 1rem;
    }

    .beverage-name, .dip-name {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 0.5rem;
    }

    .dip-description {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .beverage-price {
      font-size: 1.3rem;
      font-weight: 700;
      color: ${branding.primaryColor};
    }

    .dip-size {
      color: #999;
      font-size: 0.8rem;
    }
  `;
}

/**
 * Generate wing modal styles
 */
function generateWingModalStyles(branding) {
  return `
    /* Wing Modal Styles */
    .wing-modal,
    .sides-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      position: relative;
      z-index: 1001;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid ${branding.borderColor};
      position: relative;
    }

    .modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #666;
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .modal-close:hover {
      background: #f0f0f0;
      color: #333;
    }

    .modal-progress {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
    }

    .progress-step {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f0f0f0;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      transition: all 0.3s ease;
    }

    .progress-step.active {
      background: ${branding.primaryColor};
      color: white;
    }

    .progress-step.completed {
      background: ${branding.accentColor};
      color: #333;
    }

    .modal-body {
      padding: 1.5rem;
      max-height: 60vh;
      overflow-y: auto;
      flex: 1;
    }

    .modal-step {
      display: none;
    }

    .modal-step.active {
      display: block;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid ${branding.borderColor};
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    #modalBackBtn, #modalNextBtn, #modalAddToCartBtn,
    #beverageModalBackBtn, #beverageModalNextBtn, #beverageModalAddToCartBtn {
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    #modalBackBtn, #beverageModalBackBtn {
      background: #f0f0f0;
      color: #666;
    }

    #modalNextBtn, #modalAddToCartBtn,
    #beverageModalNextBtn, #beverageModalAddToCartBtn {
      background: ${branding.primaryColor};
      color: white;
    }

    #modalBackBtn:hover, #beverageModalBackBtn:hover {
      background: #e0e0e0;
    }

    #modalNextBtn:hover, #modalAddToCartBtn:hover,
    #beverageModalNextBtn:hover, #beverageModalAddToCartBtn:hover {
      background: ${branding.buttonHover};
    }

    #modalNextBtn:disabled, #modalAddToCartBtn:disabled,
    #beverageModalNextBtn:disabled, #beverageModalAddToCartBtn:disabled {
      background: #ccc;
      color: #888;
      cursor: not-allowed;
      opacity: 0.6;
    }

    #modalNextBtn:disabled:hover, #modalAddToCartBtn:disabled:hover,
    #beverageModalNextBtn:disabled:hover, #beverageModalAddToCartBtn:disabled:hover {
      background: #ccc;
    }

    .wing-variants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .wing-variant-card {
      background: #f8f9fa;
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 1rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .wing-variant-card:hover {
      border-color: ${branding.primaryColor};
      transform: translateY(-2px);
    }

    .wing-variant-card.selected {
      border-color: ${branding.primaryColor};
      background: ${branding.primaryColor}10;
    }

    /* Beverage Modal Styles */
    .beverage-size-options, .beverage-flavor-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .beverage-size-option, .beverage-flavor-option {
      background: #f8f9fa;
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .beverage-size-option:hover, .beverage-flavor-option:hover {
      border-color: ${branding.primaryColor};
      transform: translateY(-2px);
    }

    .beverage-size-option.selected, .beverage-flavor-option.selected {
      border-color: ${branding.primaryColor};
      background: ${branding.primaryColor}10;
    }

    .size-content, .flavor-content {
      flex: 1;
      text-align: left;
    }

    .size-name, .flavor-name {
      font-size: 16px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    .size-description, .flavor-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }

    .size-price {
      font-size: 14px;
      font-weight: bold;
      color: ${branding.primaryColor};
    }

    .size-selector, .flavor-selector {
      width: 20px;
      height: 20px;
      border: 2px solid #ddd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: ${branding.primaryColor};
    }

    .selected .size-selector, .selected .flavor-selector {
      border-color: ${branding.primaryColor};
      background: ${branding.primaryColor};
      color: white;
    }

    .beverage-order-summary {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
    }

    /* Fountain Drinks Styles - Consistent with Wing Variants */
    .fountain-drinks-container {
      padding: 0.5rem 0;
    }

    .fountain-sizes-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .fountain-size-column {
      display: flex;
      flex-direction: column;
    }

    .fountain-size-header {
      margin: 0 0 1rem 0;
      color: #1a1a1a;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      padding: 0.75rem;
      background: ${branding.primaryColor}15;
      border-radius: 12px;
      border: 2px solid ${branding.primaryColor}30;
    }

    .fountain-flavors-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .fountain-flavor-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      margin: 0;
    }

    .fountain-flavor-info {
      flex: 1;
      text-align: left;
    }

    .fountain-flavor-name {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }

    .fountain-quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .fountain-qty-btn {
      width: 32px;
      height: 32px;
      border: 2px solid ${branding.primaryColor};
      background: white;
      color: ${branding.primaryColor};
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .fountain-qty-btn:hover {
      background: ${branding.primaryColor};
      color: white;
      transform: scale(1.1);
    }

    .fountain-qty-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .fountain-qty-display {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      min-width: 32px;
      text-align: center;
      padding: 0.25rem 0.5rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    /* Responsive adjustments for fountain drinks */
    @media (max-width: 768px) {
      .fountain-sizes-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    /* Cart Summary Styles */
    .cart-items {
      margin-bottom: 1.5rem;
    }

    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e9ecef;
    }

    .cart-item:last-child {
      border-bottom: none;
    }

    .item-desc {
      font-size: 16px;
      color: #1a1a1a;
      font-weight: 500;
    }

    .item-price {
      font-size: 16px;
      font-weight: 600;
      color: ${branding.primaryColor};
    }

    .cart-total {
      padding: 1rem 0;
      border-top: 2px solid ${branding.primaryColor};
      margin-top: 1rem;
      text-align: center;
    }

    .cart-total strong {
      font-size: 20px;
      color: #1a1a1a;
    }

    .summary-header h4 {
      margin: 0 0 1rem 0;
      color: #1a1a1a;
      font-size: 18px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .summary-item.total {
      border-top: 1px solid #ddd;
      margin-top: 8px;
      padding-top: 12px;
      font-weight: bold;
      font-size: 16px;
    }

    .item-label {
      color: #666;
    }

    .item-value {
      color: #1a1a1a;
      font-weight: 500;
    }

    .summary-divider {
      height: 1px;
      background: #ddd;
      margin: 8px 0;
    }

    .variant-count {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 0.5rem;
    }

    .variant-type {
      color: #666;
      margin-bottom: 0.25rem;
    }

    .variant-sauces {
      color: ${branding.primaryColor};
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .variant-price {
      font-size: 1.3rem;
      font-weight: 700;
      color: ${branding.primaryColor};
    }
  `;
}

/**
 * Generate sides modal specific styles
 */
function generateSidesModalStyles() {
  return `
    /* Fries Modal Options */
    .fries-options-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .fries-size-option {
      background: #f8f9fa;
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .fries-size-option:hover {
      border-color: #ff6b35;
      transform: translateY(-2px);
    }

    .fries-size-option.selected {
      border-color: #ff6b35;
      background: #fff5f2;
    }

    .size-content {
      flex: 1;
      text-align: left;
    }

    .size-name {
      font-size: 16px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    .size-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }

    .size-price {
      font-size: 14px;
      font-weight: bold;
      color: #ff6b35;
    }

    .size-selector {
      width: 20px;
      height: 20px;
      border: 2px solid #ddd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: #ff6b35;
    }

    .selected .size-selector {
      border-color: #ff6b35;
      background: #ff6b35;
      color: white;
    }

    /* Loaded Fries Modal Options */
    .loaded-fries-options-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .loaded-fries-option {
      background: #f8f9fa;
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .loaded-fries-option:hover {
      border-color: #ff6b35;
      transform: translateY(-2px);
    }

    .loaded-fries-option.selected {
      border-color: #ff6b35;
      background: #fff5f2;
    }

    .loaded-fries-content {
      flex: 1;
      text-align: left;
    }

    .loaded-fries-name {
      font-size: 16px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    .loaded-fries-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .loaded-fries-includes {
      font-size: 12px;
      color: #888;
      margin-bottom: 4px;
    }

    .loaded-fries-price {
      font-size: 14px;
      font-weight: bold;
      color: #ff6b35;
    }

    .loaded-fries-selector {
      width: 20px;
      height: 20px;
      border: 2px solid #ddd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: #ff6b35;
    }

    .selected .loaded-fries-selector {
      border-color: #ff6b35;
      background: #ff6b35;
      color: white;
    }

    /* Customizations Grid */
    .customizations-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .customization-option {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Mozzarella Modal Options */
    .mozzarella-options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .mozzarella-count-option {
      background: #f8f9fa;
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mozzarella-count-option:hover {
      border-color: #ff6b35;
      transform: translateY(-2px);
    }

    .mozzarella-count-option.selected {
      border-color: #ff6b35;
      background: #fff5f2;
    }

    .mozzarella-content {
      flex: 1;
      text-align: left;
    }

    .mozzarella-count-badge {
      background: #ff6b35;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 8px;
      display: inline-block;
    }

    .mozzarella-name {
      font-size: 16px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    .mozzarella-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .mozzarella-price {
      font-size: 14px;
      font-weight: bold;
      color: #ff6b35;
    }

    .mozzarella-selector {
      width: 20px;
      height: 20px;
      border: 2px solid #ddd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: #ff6b35;
    }

    .selected .mozzarella-selector {
      border-color: #ff6b35;
      background: #ff6b35;
      color: white;
    }

    @media (max-width: 768px) {
      .mozzarella-options-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
}

/**
 * Generate responsive styles
 */
function generateResponsiveStyles() {
  return `
    /* Responsive Styles */
    @media (max-width: 768px) {
      .restaurant-name {
        font-size: 2rem;
      }

      .restaurant-meta {
        flex-direction: column;
        align-items: center;
      }

      /* Adjust background logos for mobile */
      .restaurant-header::before,
      .restaurant-header::after {
        width: 120px;
        height: 120px;
        opacity: 0.05;
      }

      .restaurant-header::before {
        left: 2%;
      }

      .restaurant-header::after {
        right: 2%;
      }

      .mobile-menu-toggle {
        display: flex;
      }

      .nav-items {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        gap: 0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        border-radius: 0 0 12px 12px;
        padding: 1rem 0;
        margin: 0 1rem;
      }

      .nav-items.active {
        display: flex;
      }

      .nav-item {
        padding: 1rem 1.5rem;
        border-radius: 0;
        border: none;
        border-bottom: 1px solid #f0f0f0;
      }

      .nav-item:last-child {
        border-bottom: none;
      }

      .menu-content {
        padding: 1rem;
      }

      .wings-categories {
        grid-template-columns: 1fr;
      }

      .combo-cards-grid {
        grid-template-columns: 1fr;
      }

      .sides-categories-grid, .dips-categories-grid, .beverages-cards-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .beverages-grid, .sauces-cards-grid, .dips-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .modal-content {
        margin: 1rem;
        max-height: calc(100vh - 2rem);
      }

      .wing-variants-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .restaurant-name {
        font-size: 1.5rem;
      }

      .section-title {
        font-size: 1.5rem;
      }

      .combo-cards-grid,
      .sides-categories-grid,
      .dips-categories-grid,
      .beverages-cards-grid,
      .beverages-grid,
      .sauces-cards-grid,
      .dips-grid {
        grid-template-columns: 1fr;
      }

      .modal-footer {
        flex-direction: column;
      }

      #modalBackBtn, #modalNextBtn, #modalAddToCartBtn {
        width: 100%;
      }
    }
  `;
}

module.exports = {
  generateDoorDashCSS,
  generateBaseStyles,
  generateHeaderStyles,
  generateNavigationStyles,
  generateMenuSectionStyles,
  generateWingModalStyles,
  generateResponsiveStyles
};
