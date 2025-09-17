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

// Export for window access
if (typeof window !== 'undefined') {
    window.trackPlatformClick = trackPlatformClick;
    window.trackQuickPickView = trackQuickPickView;
    window.trackSizeView = trackSizeView;
    window.trackSauceView = trackSauceView;
}