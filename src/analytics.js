// Analytics Tracking Module for Mirror Mode
// Goal: Track platform clicks and measure conversion funnel

let analyticsInitialized = false;
let sessionStartTime = Date.now();
let lastViewedSize = null;
let lastViewedCombo = null;
let maxScrollDepth = 0;

// Initialize analytics
export function initAnalytics() {
    if (analyticsInitialized) return;

    // Check if gtag is available
    if (typeof gtag === 'undefined') {
        console.warn('Google Analytics not loaded. Using console logging for analytics.');
        window.gtag = function(...args) {
            console.log('Analytics Event:', args);
        };
    }

    analyticsInitialized = true;

    // Track page view
    gtag('event', 'page_view', {
        'page_title': 'Philly Wings Express',
        'page_location': window.location.href,
        'page_path': window.location.pathname
    });

    // Set up scroll depth tracking
    setupScrollTracking();

    // Track time on page before platform click
    setupTimeTracking();

    console.log('Analytics initialized for Mirror Mode');
}

// Primary conversion tracking - Platform clicks
export function trackPlatformClick(platform) {
    const timeToClick = Math.round((Date.now() - sessionStartTime) / 1000);

    // Primary conversion event with GA4 naming convention
    const eventName = `click_${platform.toLowerCase()}`;
    gtag('event', eventName, {
        'event_category': 'conversion',
        'event_label': platform,
        'value': 1,
        'time_to_click': timeToClick,
        'scroll_depth': maxScrollDepth
    });

    // Track what they were interested in
    if (lastViewedSize || lastViewedCombo) {
        gtag('event', 'platform_click_with_interest', {
            'platform': platform,
            'last_viewed_size': lastViewedSize,
            'last_viewed_combo': lastViewedCombo,
            'time_to_click': timeToClick
        });
    }

    // Store in session for follow-up
    sessionStorage.setItem('platform_clicked', platform);
    sessionStorage.setItem('time_to_click', timeToClick);

    // Facebook Pixel if available
    if (window.fbq) {
        fbq('track', 'InitiateCheckout', {
            content_category: 'wings',
            content_type: platform,
            value: timeToClick
        });
    }

    console.log(`Platform click: ${platform} after ${timeToClick}s at ${maxScrollDepth}% scroll`);
}

// Track Quick Pick views
export function trackQuickPickView(comboName, price) {
    lastViewedCombo = comboName;

    gtag('event', 'quick_pick_view', {
        'event_category': 'engagement',
        'combo_name': comboName,
        'price': price
    });

    sessionStorage.setItem('last_viewed_combo', comboName);
}

// Track size card views
export function trackSizeView(size, price) {
    lastViewedSize = size;

    gtag('event', 'size_view', {
        'event_category': 'menu',
        'wing_count': size,
        'price': price
    });

    sessionStorage.setItem('last_viewed_size', size);
}

// Track sauce gallery views
export function trackSauceView(sauceName, heatLevel) {
    gtag('event', 'sauce_view', {
        'event_category': 'menu',
        'sauce_name': sauceName,
        'heat_level': heatLevel
    });
}

// Track section visibility
export function trackSectionView(sectionName) {
    gtag('event', 'section_view', {
        'event_category': 'navigation',
        'section_name': sectionName
    });
}

// Scroll depth tracking
function setupScrollTracking() {
    let ticking = false;

    function updateScrollDepth() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

        if (scrollPercent > maxScrollDepth) {
            maxScrollDepth = scrollPercent;

            // Fire milestone events
            if (maxScrollDepth >= 25 && maxScrollDepth < 30) {
                gtag('event', 'scroll_depth', {
                    'event_category': 'engagement',
                    'depth': '25_percent'
                });
            } else if (maxScrollDepth >= 50 && maxScrollDepth < 55) {
                gtag('event', 'scroll_depth', {
                    'event_category': 'engagement',
                    'depth': '50_percent'
                });
            } else if (maxScrollDepth >= 75 && maxScrollDepth < 80) {
                gtag('event', 'scroll_depth', {
                    'event_category': 'engagement',
                    'depth': '75_percent'
                });
            } else if (maxScrollDepth >= 90) {
                gtag('event', 'scroll_depth', {
                    'event_category': 'engagement',
                    'depth': '90_percent'
                });
            }
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollDepth);
            ticking = true;
        }
    });
}

// Track time to platform click
function setupTimeTracking() {
    // Track 15 second milestone (our goal)
    setTimeout(() => {
        if (!sessionStorage.getItem('platform_clicked')) {
            gtag('event', 'time_milestone', {
                'event_category': 'engagement',
                'milestone': '15_seconds_no_click'
            });
        }
    }, 15000);

    // Track 30 second milestone
    setTimeout(() => {
        if (!sessionStorage.getItem('platform_clicked')) {
            gtag('event', 'time_milestone', {
                'event_category': 'engagement',
                'milestone': '30_seconds_no_click'
            });
        }
    }, 30000);
}

// Set up Intersection Observer for key sections
export function setupSectionObservers() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id || entry.target.className;
                trackSectionView(sectionId);

                // Special tracking for platform section
                if (sectionId === 'order-platform' || entry.target.classList.contains('platform-cards')) {
                    gtag('event', 'platform_section_reached', {
                        'event_category': 'conversion',
                        'time_to_reach': Math.round((Date.now() - sessionStartTime) / 1000)
                    });
                }
            }
        });
    }, observerOptions);

    // Observe key sections
    const sectionsToObserve = [
        '.quick-picks',
        '.wing-sizes',
        '.sauce-showcase',
        '.platform-cards',
        '#order-platform'
    ];

    sectionsToObserve.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            sectionObserver.observe(element);
        }
    });
}

// Track bounce if user leaves quickly
export function setupBounceTracking() {
    let bounceTimer = setTimeout(() => {
        // If they haven't scrolled past 25% or clicked platform in 10 seconds
        if (maxScrollDepth < 25 && !sessionStorage.getItem('platform_clicked')) {
            gtag('event', 'potential_bounce', {
                'event_category': 'engagement',
                'bounce_at': maxScrollDepth
            });
        }
    }, 10000);

    // Cancel bounce tracking if they engage
    window.addEventListener('scroll', () => {
        if (maxScrollDepth > 25) {
            clearTimeout(bounceTimer);
        }
    });
}

// A/B Testing support
export function trackVariant(testName, variant) {
    gtag('event', 'ab_test_view', {
        'event_category': 'experiment',
        'test_name': testName,
        'variant': variant
    });

    sessionStorage.setItem(`ab_test_${testName}`, variant);
}

// ============================================================================
// CATERING ADD-ONS TRACKING
// Goal: Track add-on selections, preparation variants, and order totals
// Spec: Gate 3 prep packet from codex-philly (Oct 2025)
// ============================================================================

/**
 * Track add-on selection with optional preparation variant
 * @param {Object} addOn - Add-on item from Firestore
 * @param {number} packageTier - Package tier (1, 2, 3)
 * @param {string} preparationMethod - 'fried', 'baked', or undefined for single-method items
 * @param {number} selectionCount - Number of this add-on selected (for quantity tracking)
 */
export function trackAddOnSelected(addOn, packageTier, preparationMethod, selectionCount = 1) {
    const eventParams = {
        'event_category': 'catering',
        'item_id': addOn.id,
        'item_name': addOn.name,
        'category': addOn.category, // 'vegetarian', 'dessert'
        'price': addOn.basePrice,
        'package_tier': packageTier,
        'selection_count': selectionCount
    };

    // Only include preparation_method when add-on offers variants
    if (preparationMethod) {
        eventParams.preparation_method = preparationMethod;
    }

    gtag('event', 'add_on_selected', eventParams);

    // Track vegetarian interest separately for demand analysis
    if (addOn.category === 'vegetarian') {
        gtag('event', 'vegetarian_interest', {
            'event_category': 'catering',
            'package_tier': packageTier,
            'add_on_count': selectionCount,
            'has_preparation_choice': !!preparationMethod
        });
    }

    // Track dessert interest separately
    if (addOn.category === 'dessert') {
        gtag('event', 'dessert_interest', {
            'event_category': 'catering',
            'package_tier': packageTier,
            'add_on_count': selectionCount
        });
    }

    console.log(`Add-on selected: ${addOn.name} (${preparationMethod || 'default'}) for tier ${packageTier}`);
}

/**
 * Track add-on removal
 * @param {string} addOnId - Add-on ID
 * @param {string} category - 'vegetarian', 'dessert'
 * @param {number} packageTier - Package tier
 * @param {string} preparationMethod - Optional prep method if applicable
 */
export function trackAddOnRemoved(addOnId, category, packageTier, preparationMethod) {
    const eventParams = {
        'event_category': 'catering',
        'item_id': addOnId,
        'category': category,
        'package_tier': packageTier
    };

    // Only include preparation_method when applicable
    if (preparationMethod) {
        eventParams.preparation_method = preparationMethod;
    }

    gtag('event', 'add_on_removed', eventParams);
}

/**
 * Track preparation method change (fried ↔ baked toggle)
 * @param {string} addOnId - Add-on ID
 * @param {string} fromMethod - Previous method ('fried' or 'baked')
 * @param {string} toMethod - New method ('fried' or 'baked')
 * @param {number} packageTier - Package tier
 */
export function trackPreparationMethodChanged(addOnId, fromMethod, toMethod, packageTier) {
    gtag('event', 'preparation_method_changed', {
        'event_category': 'catering',
        'item_id': addOnId,
        'from_method': fromMethod,
        'to_method': toMethod,
        'package_tier': packageTier
    });

    console.log(`Prep method changed: ${addOnId} from ${fromMethod} to ${toMethod}`);
}

/**
 * Track final order total calculation (fires on add-on adjustments)
 * @param {string} packageId - Package ID
 * @param {number} packageTier - Package tier (1, 2, 3)
 * @param {number} basePrice - Package base price
 * @param {number} addOnsTotal - Total add-ons cost
 * @param {number} finalPrice - Final order total
 * @param {number} addOnCount - Total number of add-ons selected
 * @param {number} vegetarianCount - Count of vegetarian add-ons
 * @param {number} dessertCount - Count of dessert add-ons
 */
export function trackTotalCalculated(packageId, packageTier, basePrice, addOnsTotal, finalPrice, addOnCount, vegetarianCount, dessertCount) {
    gtag('event', 'total_calculated', {
        'event_category': 'catering',
        'package_id': packageId,
        'package_tier': packageTier,
        'base_price': basePrice,
        'add_ons_total': addOnsTotal,
        'final_price': finalPrice,
        'add_on_count': addOnCount,
        'vegetarian_count': vegetarianCount,
        'dessert_count': dessertCount,
        'value': finalPrice // GA4 standard parameter for conversion tracking
    });
}

/**
 * Track ezCater redirect (primary conversion event)
 * @param {string} packageId - Package ID
 * @param {number} packageTier - Package tier
 * @param {number} finalPrice - Order total
 * @param {Array} selectedAddOns - Array of selected add-on objects
 */
export function trackEzCaterRedirect(packageId, packageTier, finalPrice, selectedAddOns) {
    const timeToOrder = Math.round((Date.now() - sessionStartTime) / 1000);

    gtag('event', 'ezcater_redirect', {
        'event_category': 'conversion',
        'package_id': packageId,
        'package_tier': packageTier,
        'final_price': finalPrice,
        'add_ons_count': selectedAddOns.length,
        'time_to_order': timeToOrder,
        'value': finalPrice // GA4 standard parameter
    });

    // Store in session for follow-up tracking
    sessionStorage.setItem('catering_order_started', packageId);
    sessionStorage.setItem('catering_add_ons_count', selectedAddOns.length);
    sessionStorage.setItem('time_to_order', timeToOrder);

    console.log(`ezCater redirect: ${packageId} (tier ${packageTier}) with ${selectedAddOns.length} add-ons after ${timeToOrder}s`);
}

// Export for window access
if (typeof window !== 'undefined') {
    window.trackPlatformClick = trackPlatformClick;
    window.trackQuickPickView = trackQuickPickView;
    window.trackSizeView = trackSizeView;
    window.trackSauceView = trackSauceView;
    // Catering add-ons tracking
    window.trackAddOnSelected = trackAddOnSelected;
    window.trackAddOnRemoved = trackAddOnRemoved;
    window.trackPreparationMethodChanged = trackPreparationMethodChanged;
    window.trackTotalCalculated = trackTotalCalculated;
    window.trackEzCaterRedirect = trackEzCaterRedirect;
}