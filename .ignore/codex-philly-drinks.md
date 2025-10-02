Explored
  └ Search generateDoorDashHTMLBody
    Read index.js
    Search "drinks" in doordash-menu.json

• Edited functions/lib/platforms/doordash/html.js (+42 -67)
    58             ${generateDipsSection(menuData.sauces.filter(s => s.category === 'dipping-sauce'), branding)}
    59    -        ${generateBeveragesSection(menuData.beverages, branding)}
    59    +        ${generateBeveragesSection(menuData.drinks, branding)}
    60             ${generateSaucesSection(menuData.sauces, branding)}
    ⋮
    467     */
    468   -function generateBeveragesSection(beverages, branding) {
    469   -  if (!beverages || beverages.length === 0) return '';
    470   -
    471   -  // Separate fountain drinks, tea, and other beverages (matching original logic)
    472   -  const fountainDrinks = beverages.filter(b => b.name.toLowerCase().includes('fountain'));
    473   -  const teaDrinks = beverages.filter(b => b.name.toLowerCase().includes('tea'));
    474   -  const otherBeverages = beverages.filter(b => !b.name.toLowerCase().includes('fountain') && !b.name.toLowerCase().includes('tea'));
    475   -
    476   -  // Combine all beverages into rich card format
    477   -  const allBeverages = [];
    478   -
    479   -  // Add fountain drinks as a single card
    480   -  if (fountainDrinks.length > 0) {
    481   -    allBeverages.push({
    482   -      id: 'fountain-drinks',
    483   -      name: 'Fountain Drinks',
    484   -      description: '8 Flavors: Coca-Cola, Diet Coke, Coke Zero, Sprite, Fanta Orange, Dr Pepper, Barq\'s Root Beer, Hi-C Fruit Punch',
    485   -      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ffountain-drinks_200x200.webp?alt=med
           ia',
    486   -      platformPrice: fountainDrinks[0]?.platformPrice || fountainDrinks[0]?.basePrice || 3.36,
    487   -      badge: 'CHOOSE SIZE',
    488   -      details: fountainDrinks.map(f => ({ name: f.name, price: f.platformPrice || f.basePrice })),
    489   -      type: 'fountain'
    490   -    });
    491   -  }
    492   -
    493   -  // Add tea as a single card
    494   -  if (teaDrinks.length > 0) {
    495   -    allBeverages.push({
    496   -      id: 'iced-tea',
    497   -      name: 'Fresh Brewed Tea',
    498   -      description: 'Freshly brewed daily • Sweet or unsweetened • Perfect refreshment',
    499   -      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ficed-tea_200x200.webp?alt=media',
    500   -      platformPrice: teaDrinks[0]?.platformPrice || teaDrinks[0]?.basePrice || 2.99,
    501   -      badge: 'FRESH DAILY',
    502   -      details: teaDrinks.map(t => ({ name: t.name, price: t.platformPrice || t.basePrice })),
    503   -      type: 'tea'
    504   -    });
    505   -  }
    506   -
    507   -  // Add other beverages (like bottled water)
    508   -  otherBeverages.forEach(beverage => {
    509   -    allBeverages.push({
    510   -      id: beverage.id || 'bottled-water',
    511   -      name: beverage.name || 'Bottled Water',
    512   -      description: beverage.description || 'Pure refreshment • 16.9 fl oz bottle',
    513   -      imageUrl: beverage.imageUrl || 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fwater-bottle_20
           0x200.webp?alt=media',
    514   -      platformPrice: beverage.platformPrice || beverage.basePrice || 3.09,
    515   -      badge: 'PURE',
    516   -      type: 'bottle'
    517   -    });
    518   -  });
    468   +function generateBeveragesSection(drinksDoc, branding) {
    469   +  const variants = drinksDoc?.variants || [];
    470   +  if (!variants.length) return '';
    471
    ⋮
    474            <div class="section-header">
    523   -            <h2 class="section-title">🥤 Beverages</h2>
    524   -            <p class="section-description">Cool down the heat • Fountain drinks, tea, and water</p>
    475   +            <h2 class="section-title">🥤 ${drinksDoc?.name || 'Beverages'}</h2>
    476   +            <p class="section-description">${drinksDoc?.description || 'Cool down the heat with handcrafted refreshments'}</p>
    477            </div>
    ⋮
    479            <div class="beverages-cards-grid">
    528   -            ${allBeverages.map(beverage => `
    529   -                <div class="beverage-card ${beverage.type === 'fountain' ? 'featured' : ''}" onclick="openBeverageModal(${JSON.stringify(beverage).repl
           ace(/"/g, '&quot;')})">
    480   +            ${variants.map((variant, index) => {
    481   +              const displayPrice = (() => {
    482   +                const platformPrice = variant?.platformPricing?.doordash ?? variant?.platformPrice;
    483   +                const base = typeof platformPrice === 'number' ? platformPrice : parseFloat(platformPrice);
    484   +                const fallback = typeof variant?.basePrice === 'number' ? variant.basePrice : parseFloat(variant?.basePrice);
    485   +                const value = !Number.isNaN(base) && base > 0 ? base : (!Number.isNaN(fallback) && fallback > 0 ? fallback : 0);
    486   +                return value.toFixed(2);
    487   +              })();
    488   +
    489   +              const cardClasses = ['beverage-card'];
    490   +              if (variant?.featured) cardClasses.push('featured');
    491   +
    492   +              const safeImage = variant?.imageUrl || variant?.image || drinksDoc?.images?.hero || 'https://firebasestorage.googleapis.com/v0/b/philly-w
           ings.firebasestorage.app/o/images%2Fresized%2Ffountain-drinks_200x200.webp?alt=media';
    493   +
    494   +              const subtitleParts = [];
    495   +              if (variant?.size) subtitleParts.push(variant.size);
    496   +              if (variant?.servingDescription) subtitleParts.push(variant.servingDescription);
    497   +              const subtitle = subtitleParts.join(' • ');
    498   +
    499   +              const flavorCount = Array.isArray(variant?.flavors) ? variant.flavors.length : 0;
    500   +              const badgeText = flavorCount > 0 ? `${flavorCount} FLAVORS` : (variant?.badge || 'SELECT SIZE');
    501   +
    502   +              const description = variant?.description || drinksDoc?.description || 'Refreshing beverage';
    503   +
    504   +              return `
    505   +                <div class="${cardClasses.join(' ')}" onclick="openBeverageModal(strategicMenu.drinks.variants[${index}])">
    506                        <div class="beverage-image-wrapper">
    531   -                        <img src="${beverage.imageUrl}"
    532   -                             alt="${beverage.name}"
    507   +                        <img src="${safeImage}"
    508   +                             alt="${variant?.name || 'Beverage'}"
    509                                 class="beverage-image"
    510                                 loading="lazy">
    535   -                        ${beverage.badge ? `<div class="beverage-badge">${beverage.badge}</div>` : ''}
    511   +                        ${badgeText ? `<div class="beverage-badge">${badgeText}</div>` : ''}
    512                        </div>
    513                        <div class="beverage-details">
    538   -                        <h3 class="beverage-name">${beverage.name}</h3>
    539   -                        <p class="beverage-description">${beverage.description}</p>
    514   +                        <h3 class="beverage-name">${variant?.name || 'Beverage Option'}</h3>
    515   +                        <p class="beverage-description">${subtitle || description}</p>
    516                            <div class="beverage-pricing">
    541   -                            <div class="price-main">$${beverage.platformPrice ? (typeof beverage.platformPrice === 'number' ? beverage.platformPrice.to
           Fixed(2) : parseFloat(beverage.platformPrice).toFixed(2)) : 'N/A'}</div>
    542   -                            <div class="price-label">${beverage.details ? 'Starting at' : 'Add to Order'}</div>
    517   +                            <div class="price-main">$${displayPrice}</div>
    522                    </div>
    549   -            `).join('')}
    523   +              `;
    524   +            }).join('')}
    525            </div>

• Edited functions/lib/platforms/doordash/html.js (+2 -1)
    499                  const flavorCount = Array.isArray(variant?.flavors) ? variant.flavors.length : 0;
    500   -              const badgeText = flavorCount > 0 ? `${flavorCount} FLAVORS` : (variant?.badge || 'SELECT SIZE');
    500   +              const hasMultipleSizes = Array.isArray(variant?.sizes) && variant.sizes.length > 1;
    501   +              const badgeText = variant?.badge || (flavorCount > 0 ? `${flavorCount} FLAVORS` : (hasMultipleSizes ? 'SELECT SIZE' : ''));
    502

• Edited functions/lib/platforms/doordash/html.js (+1 -1)
    518                                <div class="price-main">$${displayPrice}</div>
    519   -                            <div class="price-label">${flavorCount > 0 ? 'Choose flavor' : 'Select size'}</div>
    519   +                            <div class="price-label">${flavorCount > 0 ? 'Choose flavor' : (hasMultipleSizes ? 'Select size' : 'Add to order')}</div>
    520                            </div>

• Explored
  └ Search menuData.beverages
    Read pricingEngine.js
    Search processPlatformMenu
    Read index.js
    Search generateDoorDashHTML in index.js

• Edited functions/index.js (+27 -4)
    331      if (processedMenu.drinks && processedMenu.drinks.variants) {
    332   -    processedMenu.beverages = processedMenu.drinks.variants.map(beverage => ({
    333   -      ...beverage,
    334   -      basePrice: beverage.basePrice || beverage.price,
    335   -      platformPrice: parseFloat(((beverage.basePrice || beverage.price) * multiplier).toFixed(2))
    332   +    processedMenu.drinks.variants = processedMenu.drinks.variants.map(variant => {
    333   +      const numericBase = typeof variant.basePrice === 'number'
    334   +        ? variant.basePrice
    335   +        : parseFloat(variant.basePrice || variant.price || 0);
    336   +      const safeBase = !Number.isNaN(numericBase) && numericBase > 0 ? numericBase : 0;
    337   +      const existingPricing = variant.platformPricing || {};
    338   +      const existingPlatformPrice = existingPricing[platform];
    339   +      const computedPrice = typeof existingPlatformPrice === 'number'
    340   +        ? existingPlatformPrice
    341   +        : parseFloat(existingPlatformPrice);
    342   +      const platformPrice = !Number.isNaN(computedPrice) && computedPrice > 0
    343   +        ? parseFloat(computedPrice.toFixed(2))
    344   +        : parseFloat((safeBase * multiplier).toFixed(2));
    345   +
    346   +      return {
    347   +        ...variant,
    348   +        basePrice: safeBase,
    349   +        platformPrice,
    350   +        platformPricing: {
    351   +          ...existingPricing,
    352   +          [platform]: platformPrice
    353   +        }
    354   +      };
    355   +    });
    356   +
    357   +    processedMenu.beverages = processedMenu.drinks.variants.map(variant => ({
    358   +      ...variant
    359        }));

• I’m making sure price calculations consistently handle decimals by fixing to two decimals and parsing as floats. I plan to update processBeverages to accept a
  platform parameter so it can set platformPricing properly, then adjust processPlatformMenu to pass this platform argument without breaking existing exports or
  usages. This will keep pricing logic aligned across modules.

• Edited functions/lib/data/pricingEngine.js (+26 -7)
    70      */
    71    -function processBeverages(drinksData, markup) {
    72    -  return drinksData.map(drink => ({
    73    -    ...drink,
    74    -    platformPrice: parseFloat((drink.basePrice * markup).toFixed(2))
    75    -  }));
    71    +function processBeverages(drinksData, markup, platform) {
    72    +  const platformKey = platform || 'doordash';
    73    +  return drinksData.map(drink => {
    74    +    const numericBase = typeof drink.basePrice === 'number'
    75    +      ? drink.basePrice
    76    +      : parseFloat(drink.basePrice || drink.price || 0);
    77    +    const safeBase = !Number.isNaN(numericBase) && numericBase > 0 ? numericBase : 0;
    78    +    const existingPricing = drink.platformPricing || {};
    79    +    const platformValue = existingPricing[platformKey];
    80    +    const parsedPlatform = typeof platformValue === 'number' ? platformValue : parseFloat(platformValue);
    81    +    const platformPrice = !Number.isNaN(parsedPlatform) && parsedPlatform > 0
    82    +      ? parseFloat(parsedPlatform.toFixed(2))
    83    +      : parseFloat((safeBase * markup).toFixed(2));
    84    +
    85    +    return {
    86    +      ...drink,
    87    +      basePrice: safeBase,
    88    +      platformPrice,
    89    +      platformPricing: {
    90    +        ...existingPricing,
    91    +        [platformKey]: platformPrice
    92    +      }
    93    +    };
    94    +  });
    95     }
    ⋮
    108      const processedSides = processSides(menuData.sides.fries, menuData.sides.mozzarella, markup);
    90    -  const processedBeverages = processBeverages(menuData.beverages, markup);
    109   +  const processedBeverages = processBeverages(menuData.beverages, markup, platform);
    110
    ⋮
    132      processPlatformMenu
    114   -};
    133   +};

• Implementing index-based selection and dynamic flavor handling

  I'll revise the modal’s size and flavor option rendering to select by index instead of ID to avoid quoting issues, add helpers to derive sizes and flavors
  with proper price resolution, and dynamically show or hide the flavor step and progress indicators depending on available flavors—ensuring seamless gating and
  consistent UI updates throughout the modal flow.

• Edited functions/lib/platforms/doordash/modules/beverage-modal.js (+296 -99)
    10       return `
    11    -    // Beverage Modal State Variables
    12    -    let currentBeverageData = null;
    11    +    const BEVERAGE_PLATFORM_KEY = 'doordash';
    12    +    let beverageModalStep = 1;
    13    +    let currentBeverageVariant = null;
    14    +    let availableBeverageSizes = [];
    15    +    let availableBeverageFlavors = [];
    16         let selectedBeverageSize = null;
    17         let selectedBeverageFlavor = null;
    15    -    let beverageModalStep = 1;
    18
    17    -    window.openBeverageModal = function(beverageData) {
    18    -      console.log('Opening beverage modal with data:', beverageData);
    19    +    function resolvePrice(entry) {
    20    +      if (!entry) return 0;
    21    +      const pricing = entry.platformPricing || {};
    22    +      const platformValue = pricing[BEVERAGE_PLATFORM_KEY];
    23    +      const numericPlatform = typeof platformValue === 'number' ? platformValue : parseFloat(platformValue);
    24    +      if (!Number.isNaN(numericPlatform) && numericPlatform > 0) {
    25    +        return parseFloat(numericPlatform.toFixed(2));
    26    +      }
    27    +      if (typeof entry.platformPrice === 'number') {
    28    +        return parseFloat(entry.platformPrice.toFixed(2));
    29    +      }
    30    +      const parsedPlatform = parseFloat(entry.platformPrice);
    31    +      if (!Number.isNaN(parsedPlatform) && parsedPlatform > 0) {
    32    +        return parseFloat(parsedPlatform.toFixed(2));
    33    +      }
    34    +      if (typeof entry.basePrice === 'number') {
    35    +        return parseFloat(entry.basePrice.toFixed(2));
    36    +      }
    37    +      const parsedBase = parseFloat(entry.basePrice);
    38    +      if (!Number.isNaN(parsedBase) && parsedBase > 0) {
    39    +        return parseFloat(parsedBase.toFixed(2));
    40    +      }
    41    +      return 0;
    42    +    }
    43    +
    44    +    function formatBeveragePrice(value) {
    45    +      const numeric = typeof value === 'number' ? value : parseFloat(value);
    46    +      if (Number.isNaN(numeric) || !Number.isFinite(numeric)) {
    47    +        return '0.00';
    48    +      }
    49    +      return numeric.toFixed(2);
    50    +    }
    51
    20    -      currentBeverageData = beverageData;
    52    +    function deriveBeverageSizes(variant) {
    53    +      if (!variant) return [];
    54    +      if (Array.isArray(variant.sizes) && variant.sizes.length > 0) {
    55    +        return variant.sizes.map((size, index) => ({
    56    +          ...size,
    57    +          id: size.id || `${variant.id || 'beverage'}_size_${index}`,
    58    +          label: size.name || size.label || size.size || `Size ${index + 1}`,
    59    +          description: size.description || variant.description || '',
    60    +          platformPrice: resolvePrice(size),
    61    +          basePrice: typeof size.basePrice === 'number' ? size.basePrice : parseFloat(size.basePrice || variant.basePrice || 0)
    62    +        }));
    63    +      }
    64    +
    65    +      const fallbackBase = typeof variant.basePrice === 'number' ? variant.basePrice : parseFloat(variant.basePrice || variant.price || 0) || 0;
    66    +
    67    +      return [{
    68    +        id: variant.id || 'beverage_default_size',
    69    +        label: variant.size || variant.name || 'Standard',
    70    +        description: variant.description || '',
    71    +        platformPrice: resolvePrice(variant),
    72    +        basePrice: fallbackBase
    73    +      }];
    74    +    }
    75    +
    76    +    function deriveBeverageFlavors(variant) {
    77    +      if (!variant || !Array.isArray(variant.flavors)) return [];
    78    +      return variant.flavors.map((flavor, index) => {
    79    +        if (typeof flavor === 'string') {
    80    +          return {
    81    +            id: `${variant.id || 'beverage'}_flavor_${index}`,
    82    +            name: flavor,
    83    +            description: ''
    84    +          };
    85    +        }
    86    +        return {
    87    +          id: flavor.id || flavor.value || `${variant.id || 'beverage'}_flavor_${index}`,
    88    +          name: flavor.name || flavor.label || `Flavor ${index + 1}`,
    89    +          description: flavor.description || flavor.subtext || ''
    90    +        };
    91    +      }).filter(flavor => flavor.name);
    92    +    }
    93    +
    94    +    function hasFlavorStep() {
    95    +      return availableBeverageFlavors.length > 0;
    96    +    }
    97    +
    98    +    window.openBeverageModal = function(beverageVariant) {
    99    +      console.log('Opening beverage modal with data:', beverageVariant);
    100   +
    101   +      currentBeverageVariant = beverageVariant || null;
    102   +      availableBeverageSizes = deriveBeverageSizes(currentBeverageVariant);
    103   +      availableBeverageFlavors = deriveBeverageFlavors(currentBeverageVariant);
    104          selectedBeverageSize = null;
    ⋮
    108          const modal = document.getElementById('beverageModal');
    109   +      const modalTitle = document.getElementById('beverageModalTitle');
    110   +      const flavorStep = document.getElementById('beverageModalStep2');
    111   +
    112   +      if (flavorStep) {
    113   +        flavorStep.style.display = hasFlavorStep() ? 'block' : 'none';
    114   +      }
    115   +
    116   +      if (modalTitle) {
    117   +        modalTitle.textContent = beverageVariant?.name || 'Choose Your Beverage';
    118   +      }
    119   +
    120   +      populateBeverageSizes();
    121   +      populateBeverageFlavors();
    122   +      updateBeverageModalDisplay();
    123   +
    124          if (modal) {
    ⋮
    126            document.body.style.overflow = 'hidden';
    29    -
    30    -        // Set title
    31    -        document.getElementById('beverageModalTitle').textContent = beverageData.name;
    32    -
    33    -        // Show first step (size selection)
    34    -        populateBeverageSizes();
    35    -        updateBeverageModalDisplay();
    127          }
    ⋮
    135          }
    45    -    };
    136
    47    -    function populateBeverageSizes() {
    48    -      const container = document.getElementById('beverageSizes');
    49    -      if (!container || !currentBeverageData) return;
    137   +      currentBeverageVariant = null;
    138   +      availableBeverageSizes = [];
    139   +      availableBeverageFlavors = [];
    140   +      selectedBeverageSize = null;
    141   +      selectedBeverageFlavor = null;
    142   +      beverageModalStep = 1;
    143
    51    -      const sizes = currentBeverageData.sizes || [];
    52    -      container.innerHTML = sizes.map(size =>
    53    -        '<div class="beverage-size-card' + (selectedBeverageSize && selectedBeverageSize.id === size.id ? ' selected' : '') + '" onclick="selectBeverag
           eSize(\\'' + size.id + '\\');">' +
    54    -          '<div class="beverage-size-info">' +
    55    -            '<h4>' + size.name + '</h4>' +
    56    -            '<p>' + size.description + '</p>' +
    57    -            '<div class="beverage-size-price">$' + size.platformPrice + '</div>' +
    58    -          '</div>' +
    59    -        '</div>'
    60    -      ).join('');
    61    -    }
    144   +      const sizeContainer = document.getElementById('beverageSizeOptions');
    145   +      const flavorContainer = document.getElementById('beverageFlavorOptions');
    146   +      const summaryContainer = document.getElementById('beverageOrderSummary');
    147   +      if (sizeContainer) sizeContainer.innerHTML = '';
    148   +      if (flavorContainer) flavorContainer.innerHTML = '';
    149   +      if (summaryContainer) summaryContainer.innerHTML = '';
    150   +    };
    151
    63    -    window.selectBeverageSize = function(sizeId) {
    64    -      selectedBeverageSize = currentBeverageData.sizes.find(size => size.id === sizeId);
    65    -      populateBeverageSizes(); // Re-render to show selection
    152   +    window.navigateBeverageModalStep = function(direction) {
    153   +      if (direction === 1) {
    154   +        if (!selectedBeverageSize) {
    155   +          alert('Please select a size to continue.');
    156   +          return;
    157   +        }
    158
    67    -      // Auto-advance if this beverage type has flavors
    68    -      if (currentBeverageData.flavors && currentBeverageData.flavors.length > 0) {
    69    -        beverageModalStep = 2;
    70    -        setTimeout(() => {
    71    -          populateBeverageFlavors();
    72    -          updateBeverageModalDisplay();
    73    -        }, 200);
    74    -      } else {
    75    -        // No flavors, go straight to summary
    76    -        beverageModalStep = 3;
    77    -        setTimeout(() => {
    159   +        if (beverageModalStep === 1) {
    160   +          if (hasFlavorStep()) {
    161   +            beverageModalStep = 2;
    162   +            populateBeverageFlavors();
    163   +          } else {
    164   +            beverageModalStep = 3;
    165   +            populateBeverageOrderSummary();
    166   +          }
    167   +        } else if (beverageModalStep === 2) {
    168   +          if (!selectedBeverageFlavor) {
    169   +            alert('Please pick a flavor to continue.');
    170   +            return;
    171   +          }
    172   +          beverageModalStep = 3;
    173              populateBeverageOrderSummary();
    79    -          updateBeverageModalDisplay();
    80    -        }, 200);
    174   +        }
    175   +      } else if (direction === -1) {
    176   +        if (beverageModalStep === 3) {
    177   +          beverageModalStep = hasFlavorStep() ? 2 : 1;
    178   +          if (beverageModalStep === 2) {
    179   +            populateBeverageFlavors();
    180   +          }
    181   +        } else if (beverageModalStep === 2) {
    182   +          beverageModalStep = 1;
    183   +        }
    184   +      }
    185   +
    186   +      if (beverageModalStep === 1) {
    187   +        populateBeverageSizes();
    188          }
    189   +
    190   +      if (beverageModalStep === 3) {
    191   +        populateBeverageOrderSummary();
    192   +      }
    193   +
    194   +      updateBeverageModalDisplay();
    195        };
    196
    84    -    function populateBeverageFlavors() {
    85    -      const container = document.getElementById('beverageFlavors');
    86    -      if (!container || !currentBeverageData) return;
    197   +    window.selectBeverageSize = function(index) {
    198   +      const option = availableBeverageSizes[index];
    199   +      if (!option) return;
    200
    88    -      const flavors = currentBeverageData.flavors || [];
    89    -      container.innerHTML = flavors.map(flavor =>
    90    -        '<div class="beverage-flavor-card' + (selectedBeverageFlavor && selectedBeverageFlavor.id === flavor.id ? ' selected' : '') + '" onclick="selec
           tBeverageFlavor(\\'' + flavor.id + '\\');">' +
    91    -          '<div class="beverage-flavor-info">' +
    92    -            '<h4>' + flavor.name + '</h4>' +
    93    -            (flavor.description ? '<p>' + flavor.description + '</p>' : '') +
    94    -          '</div>' +
    95    -        '</div>'
    96    -      ).join('');
    97    -    }
    201   +      selectedBeverageSize = option;
    202   +      populateBeverageSizes();
    203   +      updateBeverageModalDisplay();
    204   +    };
    205
    99    -    window.selectBeverageFlavor = function(flavorId) {
    100   -      selectedBeverageFlavor = currentBeverageData.flavors.find(flavor => flavor.id === flavorId);
    101   -      populateBeverageFlavors(); // Re-render to show selection
    206   +    window.selectBeverageFlavor = function(index) {
    207   +      const flavor = availableBeverageFlavors[index];
    208   +      if (!flavor) return;
    209
    103   -      // Auto-advance to summary
    104   -      beverageModalStep = 3;
    105   -      setTimeout(() => {
    106   -        populateBeverageOrderSummary();
    107   -        updateBeverageModalDisplay();
    108   -      }, 200);
    210   +      selectedBeverageFlavor = flavor;
    211   +      populateBeverageFlavors();
    212   +      updateBeverageModalDisplay();
    213        };
    214
    215   +    function populateBeverageSizes() {
    216   +      const container = document.getElementById('beverageSizeOptions');
    217   +      if (!container) return;
    218   +
    219   +      if (!availableBeverageSizes.length) {
    220   +        container.innerHTML = '<p class="beverage-empty-state">No size options available right now.</p>';
    221   +        return;
    222   +      }
    223   +
    224   +      container.innerHTML = availableBeverageSizes.map((option, index) => {
    225   +        const isSelected = selectedBeverageSize && selectedBeverageSize.id === option.id;
    226   +        const description = option.description || currentBeverageVariant?.description || '';
    227   +        return '<div class="beverage-size-card' + (isSelected ? ' selected' : '') + '" onclick="selectBeverageSize(' + index + ')">' +
    228   +                 '<div class="beverage-size-info">' +
    229   +                   '<h4>' + option.label + '</h4>' +
    230   +                   (description ? '<p>' + description + '</p>' : '') +
    231   +                   '<div class="beverage-size-price">$' + formatBeveragePrice(option.platformPrice ?? option.basePrice) + '</div>' +
    232   +                 '</div>' +
    233   +               '</div>';
    234   +      }).join('');
    235   +    }
    236   +
    237   +    function populateBeverageFlavors() {
    238   +      const container = document.getElementById('beverageFlavorOptions');
    239   +      if (!container) return;
    240   +
    241   +      if (!hasFlavorStep()) {
    242   +        container.innerHTML = '';
    243   +        return;
    244   +      }
    245   +
    246   +      container.innerHTML = availableBeverageFlavors.map((flavor, index) => {
    247   +        const isSelected = selectedBeverageFlavor && selectedBeverageFlavor.id === flavor.id;
    248   +        return '<div class="beverage-flavor-card' + (isSelected ? ' selected' : '') + '" onclick="selectBeverageFlavor(' + index + ')">' +
    249   +                 '<div class="beverage-flavor-info">' +
    250   +                   '<h4>' + flavor.name + '</h4>' +
    251   +                   (flavor.description ? '<p>' + flavor.description + '</p>' : '') +
    252   +                 '</div>' +
    253   +               '</div>';
    254   +      }).join('');
    255   +    }
    256   +
    257        function populateBeverageOrderSummary() {
    ⋮
    260
    115   -      const price = selectedBeverageSize ? selectedBeverageSize.platformPrice : 0;
    261   +      if (!selectedBeverageSize) {
    262   +        container.innerHTML = '<p>Please pick a size to view the summary.</p>';
    263   +        return;
    264   +      }
    265   +
    266   +      const price = resolvePrice(selectedBeverageSize) || resolvePrice(currentBeverageVariant);
    267
    117   -      container.innerHTML =
    118   -        '<div style="text-align: center;">' +
    119   -          '<h3>' + currentBeverageData.name + '</h3>' +
    120   -          (selectedBeverageSize ? '<p>Size: ' + selectedBeverageSize.name + '</p>' : '') +
    121   -          (selectedBeverageFlavor ? '<p>Flavor: ' + selectedBeverageFlavor.name + '</p>' : '') +
    122   -          '<div style="font-size: 24px; font-weight: bold; color: #ff6b35; margin-top: 16px;">$' + price.toFixed(2) + '</div>' +
    123   -        '</div>';
    268   +      container.innerHTML = '<div class="beverage-summary">' +
    269   +        '<h3>' + (currentBeverageVariant?.name || 'Selected Beverage') + '</h3>' +
    270   +        '<p>Size: ' + (selectedBeverageSize.label || selectedBeverageSize.name || 'Standard') + '</p>' +
    271   +        (selectedBeverageFlavor ? '<p>Flavor: ' + selectedBeverageFlavor.name + '</p>' : '') +
    272   +        '<div class="beverage-summary-price">$' + formatBeveragePrice(price) + '</div>' +
    273   +      '</div>';
    274        }
    ⋮
    276        function updateBeverageModalDisplay() {
    127   -      // Show correct step content
    277   +      const progressSteps = document.querySelectorAll('#beverageModal .progress-step');
    278   +      progressSteps.forEach((step, index) => {
    279   +        const stepNumber = index + 1;
    280   +        if (stepNumber === 2 && !hasFlavorStep()) {
    281   +          step.style.display = 'none';
    282   +          return;
    283   +        }
    284   +
    285   +        step.style.display = 'flex';
    286   +        step.classList.remove('active', 'completed');
    287   +        if (stepNumber < beverageModalStep) {
    288   +          step.classList.add('completed');
    289   +        }
    290   +        if (stepNumber === beverageModalStep) {
    291   +          step.classList.add('active');
    292   +        }
    293   +      });
    294   +
    295          for (let i = 1; i <= 3; i++) {
    296            const step = document.getElementById('beverageModalStep' + i);
    130   -        if (step) {
    297   +        if (!step) continue;
    298   +
    299   +        if (i === 2 && !hasFlavorStep()) {
    300              step.classList.remove('active');
    132   -          if (i === beverageModalStep) {
    133   -            step.classList.add('active');
    301   +          step.style.display = 'none';
    302   +        } else {
    303   +          step.style.display = 'block';
    304   +          step.classList.toggle('active', i === beverageModalStep);
    305   +        }
    306   +      }
    307   +
    308   +      const backBtn = document.getElementById('beverageModalBackBtn');
    309   +      const nextBtn = document.getElementById('beverageModalNextBtn');
    310   +      const addBtn = document.getElementById('beverageModalAddToCartBtn');
    311   +
    312   +      if (backBtn) {
    313   +        backBtn.style.display = beverageModalStep > 1 ? 'inline-block' : 'none';
    314   +      }
    315   +
    316   +      if (nextBtn) {
    317   +        if (beverageModalStep < 3) {
    318   +          nextBtn.style.display = 'inline-block';
    319   +          if (beverageModalStep === 1) {
    320   +            nextBtn.disabled = !selectedBeverageSize;
    321   +          } else if (beverageModalStep === 2) {
    322   +            nextBtn.disabled = !selectedBeverageFlavor;
    323   +          } else {
    324   +            nextBtn.disabled = false;
    325              }
    326   +        } else {
    327   +          nextBtn.style.display = 'none';
    328   +          nextBtn.disabled = false;
    329            }
    ⋮
    331
    138   -      // Update navigation buttons
    139   -      const prevBtn = document.getElementById('beveragePrevBtn');
    140   -      const nextBtn = document.getElementById('beverageNextBtn');
    141   -      const addBtn = document.getElementById('addBeverageToCartBtn');
    142   -
    143   -      if (prevBtn) prevBtn.style.display = beverageModalStep > 1 ? 'block' : 'none';
    144   -      if (nextBtn) nextBtn.style.display = beverageModalStep < 3 ? 'block' : 'none';
    145   -      if (addBtn) addBtn.style.display = beverageModalStep === 3 ? 'block' : 'none';
    332   +      if (addBtn) {
    333   +        addBtn.style.display = beverageModalStep === 3 ? 'inline-block' : 'none';
    334   +        addBtn.disabled = !selectedBeverageSize;
    335   +      }
    336        }
    337
    148   -    window.addBeverageToCart = function() {
    149   -      console.log('Adding beverage to cart:', {
    150   -        beverage: currentBeverageData.name,
    151   -        size: selectedBeverageSize,
    152   -        flavor: selectedBeverageFlavor
    153   -      });
    338   +    window.addBeverageOrderToCart = function() {
    339   +      if (!selectedBeverageSize) {
    340   +        alert('Please select a size before adding to cart.');
    341   +        return;
    342   +      }
    343   +
    344   +      const payload = {
    345   +        beverageId: currentBeverageVariant?.id,
    350   +        flavorName: selectedBeverageFlavor?.name || null,
    351   +        price: formatBeveragePrice(resolvePrice(selectedBeverageSize) || resolvePrice(currentBeverageVariant))
    352   +      };
    353
    155   -      // Close modal
    156   -      closeBeverageModal();
    354   +      console.log('Adding beverage to cart:', payload);
    355   +
    356   +      alert('Added to cart: ' + payload.beverageName + (payload.sizeName ? ' (' + payload.sizeName + ')' : '') + (payload.flavorName ? ' - ' + payload.
           flavorName : '') + ' — $' + payload.price);
    357
    158   -      // TODO: Implement actual cart functionality
    159   -      alert('Added to cart: ' + currentBeverageData.name +
    160   -            (selectedBeverageSize ? ' (' + selectedBeverageSize.name + ')' : '') +
    161   -            (selectedBeverageFlavor ? ' - ' + selectedBeverageFlavor.name : ''));
    358   +      window.closeBeverageModal();
    359        };
    ⋮
    364      generateBeverageModalJS
    168   -};
  └ Search \${ in beverage-modal.js
    Search \$\{ in beverage-modal.js

• Edited functions/lib/platforms/doordash/modules/beverage-modal.js (+5 -5)
    56               ...size,
    58    +          label: size.name || size.label || size.size || ('Size ' + (index + 1)),
    59               description: size.description || variant.description || '',
    ⋮
    80               return {
    81    -            id: `${variant.id || 'beverage'}_flavor_${index}`,
    81    +            id: (variant.id || 'beverage') + '_flavor_' + index,
    82                 name: flavor,
    ⋮
    86             return {
    87    -          id: flavor.id || flavor.value || `${variant.id || 'beverage'}_flavor_${index}`,
    88    -          name: flavor.name || flavor.label || `Flavor ${index + 1}`,
    87    +          id: flavor.id || flavor.value || (variant.id || 'beverage') + '_flavor_' + index,
    88    +          name: flavor.name || flavor.label || ('Flavor ' + (index + 1)),
    89               description: flavor.description || flavor.subtext || ''

• Explored
  └ Search \$\{ in beverage-modal.js

• Updated Plan
  └ ✔ Audit current drinks data flow and identify gaps vs. new contract
    ✔ Update DoorDash JS/HTML generators to use strategicMenu.drinks variants directly
    □ Refactor beverage modal module for size/flavor gating and price handling

• Explored
  └ Search addBeverageToCart