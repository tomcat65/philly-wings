// Philly Wings Express - Premium Conversion Scripts

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initCountdown();
    initLiveOrders();
    initStickyMobileCTA();
    initHeroVideoOptimization();
    initSoundEffects();
    initWingStyleSelector();
    initFoodImageZoom();
    trackPageView();
});

// Countdown Timer for Urgency
function initCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;

    // Set closing time (9 PM)
    function updateCountdown() {
        const now = new Date();
        const closing = new Date();
        closing.setHours(21, 0, 0, 0); // 9 PM
        
        if (closing < now) {
            closing.setDate(closing.getDate() + 1);
        }
        
        const diff = closing - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        countdownEl.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Live Order Feed Simulation
function initLiveOrders() {
    const orderCount = document.getElementById('liveOrderCount');
    const orderTicker = document.getElementById('orderTicker');
    
    if (!orderCount || !orderTicker) return;
    
    // Simulate order count updates
    let currentCount = 17;
    setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance of new order
            currentCount++;
            orderCount.textContent = currentCount;
            
            // Pulse animation on update
            orderCount.style.animation = 'none';
            setTimeout(() => {
                orderCount.style.animation = 'pulse-text 0.5s ease-out';
            }, 10);
        }
    }, 5000);
    
    // Add new orders to ticker
    const neighborhoods = ['Fishtown', 'South Philly', 'Center City', 'University City', 'Northern Liberties', 'Manayunk'];
    const orders = [
        '{name} from {hood} ordered 20 Buffalo Wings',
        '{name} from {hood} ordered Game Day Special',
        '{name} from {hood} ordered 50 Mixed Wings for the crew',
        '{name} from {hood} conquered the Atomic Challenge!',
        '{name} from {hood} ordered Party Pack with extra ranch'
    ];
    const names = ['Mike', 'Sarah', 'Tom', 'Lisa', 'Chris', 'Maria', 'James', 'Ashley', 'Kevin', 'Nicole'];
    
    function addNewOrder() {
        const template = orders[Math.floor(Math.random() * orders.length)];
        const name = names[Math.floor(Math.random() * names.length)];
        const hood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
        const orderText = template.replace('{name}', name).replace('{hood}', hood);
        
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <span class="order-time">just now</span>
            <span class="order-details">${orderText}</span>
        `;
        
        orderTicker.insertBefore(orderItem, orderTicker.firstChild);
        
        // Remove old orders
        while (orderTicker.children.length > 5) {
            orderTicker.removeChild(orderTicker.lastChild);
        }
        
        // Update times
        updateOrderTimes();
    }
    
    function updateOrderTimes() {
        const items = orderTicker.querySelectorAll('.order-item');
        const times = ['just now', '2 min ago', '5 min ago', '8 min ago', '12 min ago'];
        items.forEach((item, index) => {
            if (index < times.length) {
                item.querySelector('.order-time').textContent = times[index];
            }
        });
    }
    
    // Add new order every 15-30 seconds
    setInterval(() => {
        if (Math.random() > 0.5) {
            addNewOrder();
        }
    }, 20000);
}

// Universal Food Image Zoom
window.initFoodImageZoom = function initFoodImageZoom() {
    const modal = document.getElementById('imageZoomModal');
    const modalImg = document.getElementById('zoomedImage');
    const captionText = document.getElementById('zoomCaption');
    const closeBtn = document.querySelector('.zoom-close');

    // Add zoom to all food images including limited time deals, sauces, and dynamically loaded content
    const foodImages = document.querySelectorAll('.combo-image, .sauce-image, .side-image, .gallery-item img, .wing-style-img.zoomable, .hero-banner, .menu-card img, .menu-card-img');

    // Check if device is mobile/tablet
    const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);

    foodImages.forEach(img => {
        // Add cursor pointer and title
        img.style.cursor = 'pointer';

        // Function to open zoom modal
        const openZoomModal = function() {
            modal.style.display = 'block';

            // Get the original image source from the HTML (not the transformed one)
            const originalSrc = img.dataset.originalSrc || img.getAttribute('src') || img.src;

            // Clear any previous error handlers
            modalImg.onerror = null;
            modalImg.onload = null;

            // For zoom, use the original image source directly
            // The WebP transformation is causing issues with the modal
            let zoomSrc = originalSrc;

            // Ensure we're using the original Firebase Storage URL
            if (originalSrc.includes('firebasestorage')) {
                // Clean up any WebP transformations and use original
                zoomSrc = originalSrc.replace(/images%2Fresized%2F.*\.webp/, function(match) {
                    // Extract the original filename from WebP path if present
                    return originalSrc.split('/o/')[1].split('?')[0];
                });
            }

            console.log('Zoom modal using image:', zoomSrc);

            // Add error handler for image loading
            modalImg.onerror = function() {
                console.error('Failed to load zoom image:', zoomSrc);
                // Try the current src as fallback
                if (img.src && img.src !== zoomSrc) {
                    console.log('Falling back to current src:', img.src);
                    modalImg.src = img.src;
                }
            };

            modalImg.onload = function() {
                // Image loaded successfully
                console.log('Zoom image loaded successfully');
                modalImg.style.display = 'block';
                modalImg.style.visibility = 'visible';
            };

            // Use the original source for zoom
            modalImg.src = zoomSrc;

            // Force image to display
            modalImg.style.display = 'block';
            modalImg.style.visibility = 'visible';

            captionText.innerHTML = img.alt || 'Zoomed view';

            // Reset and apply appropriate zoom class
            modalImg.className = 'zoom-content';

            // Determine food type and apply smart crop
            if (img.classList.contains('combo-image')) {
                // Combos: focus on the center-right where food usually is
                modalImg.classList.add('combo-zoom');
            } else if (img.classList.contains('sauce-image')) {
                // Sauces: focus on center where sauce detail is
                modalImg.classList.add('sauce-zoom');
            } else if (img.classList.contains('side-image')) {
                // Sides: focus on center-top
                modalImg.classList.add('side-zoom');
            } else if (img.closest('.wing-style-card')) {
                // Wing types: use existing positioning
                const wingStyle = img.closest('.wing-style-card').dataset.style;
                modalImg.classList.add(`${wingStyle}-zoom`);
            } else if (img.alt && img.alt.toLowerCase().includes('wing')) {
                // Gallery wings: smart detect and position
                modalImg.classList.add('wings-zoom');
            } else {
                // Default: center focus
                modalImg.classList.add('default-zoom');
            }
        };

        if (isMobile) {
            // Mobile: Single tap to zoom (use touchend for better mobile support)
            img.title = 'Tap to zoom';

            // Add both touch and click events for better mobile compatibility
            img.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openZoomModal();
            }, { passive: false });

            // Fallback click event for devices that don't fire touchend
            img.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openZoomModal();
            });
        } else {
            // Desktop: Single click to zoom
            img.title = 'Click to zoom';

            img.addEventListener('click', function(e) {
                e.stopPropagation();
                openZoomModal();
            });
        }
    });

    // Close modal handlers
    if (closeBtn) {
        // Add both click and touch events for mobile compatibility
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
        closeBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            modal.style.display = 'none';
        }, { passive: false });
    }

    modal?.addEventListener('click', function(e) {
        if (e.target === modal || e.target === closeBtn) {
            modal.style.display = 'none';
        }
    });

    // Also handle touch on modal background for mobile
    modal?.addEventListener('touchend', function(e) {
        if (e.target === modal) {
            e.preventDefault();
            modal.style.display = 'none';
        }
    }, { passive: false });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal?.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
}

// Wing Style Selector (separated from zoom)
function initWingStyleSelector() {
    const wingStyleCards = document.querySelectorAll('.wing-style-card');

    wingStyleCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // If clicking on the image, don't change selection
            if (e.target.tagName === 'IMG') {
                return;
            }

            // Remove active from all cards
            wingStyleCards.forEach(c => c.classList.remove('active'));
            // Add active to clicked card
            this.classList.add('active');

            // Track selection
            const style = this.dataset.style;
            trackEvent('wing_style_selected', {
                style: style
            });
        });
    });
}

// Sticky Mobile CTA
function initStickyMobileCTA() {
    const stickyCTA = document.getElementById('stickyCTA');
    const heroSection = document.querySelector('.hero');
    
    if (!stickyCTA || !heroSection) return;
    
    // Only on mobile
    if (window.innerWidth > 768) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                stickyCTA.classList.add('show');
            } else {
                stickyCTA.classList.remove('show');
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(heroSection);
}

// Hero Video Optimization
function initHeroVideoOptimization() {
    const video = document.getElementById('heroVideo');
    if (!video) return;
    
    // Check connection speed
    if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection.effectiveType === '3g' || connection.effectiveType === '2g') {
            video.remove();
            document.querySelector('.hero-fallback').style.display = 'block';
        }
    }
    
    // Pause video when not in viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                video.play();
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(video);
}

// Sound Effects (Mobile Haptics)
function initSoundEffects() {
    // Add subtle haptic feedback on mobile
    if ('vibrate' in navigator) {
        document.querySelectorAll('button, .platform-card').forEach(element => {
            element.addEventListener('click', () => {
                navigator.vibrate(10);
            });
        });
    }
    
    // Hover sounds for desktop
    if (window.innerWidth > 768) {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT' + 
            'AkNUqzq8a1aFA07lNr0u3UnBSyB0fPah0A7CG+hh2VPW3iTqrKPYS49Vqje8KVbFgU7lNr1x3kpBSl+zPLfizAIHGi98OWhUgwOU6zp8LVhGAU/mtzy1HQkBSl+zPDeiTEIF2m98eShTQoMUqvt8LVeFApGouTyvGkcBTGH1fPTgjMGFWi98eidUgkNUqzr8LVgGAU+m9zz1HQlBCh+zPDfiDEJGGm+8OWhTQoLU6vt8LRdFApGoOXxu2oaBziP1/PPeScFK4HP8N+LMQY');
        
        document.querySelectorAll('.flavor-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                audio.volume = 0.1;
                audio.play();
            });
        });
    }
}

// Conversion Tracking - Enhanced for Mirror Mode
// This function is overridden by the analytics module when it loads
function trackPlatformClick(platform) {
    // The analytics module will replace this function
    // This is a fallback for immediate clicks before module loads
    gtag('event', 'click', {
        'event_category': 'Platform Order',
        'event_label': platform,
        'value': 1
    });

    // Add to conversion pixel tracking
    if (window.fbq) {
        fbq('track', 'InitiateCheckout', {
            content_category: 'wings',
            content_type: platform
        });
    }
}

function trackPageView() {
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.body.offsetHeight - window.innerHeight)) * 100;
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            // Fire events at milestones
            if (maxScroll > 25 && !window.tracked25) {
                window.tracked25 = true;
                gtag('event', 'scroll', {
                    'event_category': 'Engagement',
                    'event_label': '25%'
                });
            }
            if (maxScroll > 50 && !window.tracked50) {
                window.tracked50 = true;
                gtag('event', 'scroll', {
                    'event_category': 'Engagement',
                    'event_label': '50%'
                });
            }
            if (maxScroll > 75 && !window.tracked75) {
                window.tracked75 = true;
                gtag('event', 'scroll', {
                    'event_category': 'Engagement',
                    'event_label': '75%'
                });
            }
            if (maxScroll > 90 && !window.tracked90) {
                window.tracked90 = true;
                gtag('event', 'scroll', {
                    'event_category': 'Engagement',
                    'event_label': '90%'
                });
            }
        }
    });
    
    // Track time on page
    let timeOnPage = 0;
    setInterval(() => {
        timeOnPage += 5;
        
        // Send event every 30 seconds
        if (timeOnPage % 30 === 0) {
            gtag('event', 'time_on_page', {
                'event_category': 'Engagement',
                'event_label': `${timeOnPage}s`
            });
        }
    }, 5000);
}

// Utility Functions - Make globally available
function scrollToOrder() {
    document.getElementById('orderSection').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    // Track CTA click
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            'event_category': 'CTA',
            'event_label': 'Hero Order Button'
        });
    }
}

// Make scrollToOrder globally available
window.scrollToOrder = scrollToOrder;

function showAllPlatforms() {
    scrollToOrder();
    
    // Highlight platforms
    document.querySelectorAll('.platform-card').forEach(card => {
        card.style.animation = 'pulse-shadow 0.5s ease-out';
    });
}

function showNutrition() {
    // TODO: Implement nutrition modal
    alert('Nutritional information coming soon! All calorie counts are available on delivery platforms.');
    
    gtag('event', 'click', {
        'event_category': 'Info',
        'event_label': 'Nutrition'
    });
}

function showAllergens() {
    // TODO: Implement allergen modal
    alert('Common allergens: Wheat, Soy, Dairy, Eggs. Please check with platforms for specific items.');
    
    gtag('event', 'click', {
        'event_category': 'Info',
        'event_label': 'Allergens'
    });
}

// Exit Intent Detection
let exitIntentShown = false;
document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 10 && !exitIntentShown) {
        exitIntentShown = true;
        
        // Create exit intent popup
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1A1A1A;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            z-index: 10000;
            text-align: center;
            max-width: 400px;
            border: 3px solid #00FF00;
        `;
        
        popup.innerHTML = `
            <button onclick="this.parentElement.remove()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: transparent;
                color: #F5F5F5;
                border: 2px solid #F5F5F5;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='#F5F5F5'; this.style.color='#1A1A1A'" onmouseout="this.style.background='transparent'; this.style.color='#F5F5F5'">&times;</button>
            <h2 style="margin-bottom: 16px; color: #00FF00; font-family: 'Bebas Neue', sans-serif; font-size: 32px; text-shadow: 0 0 20px rgba(0, 255, 0, 0.5);">Yo! Don't Dip Without Your Wings! 🔥</h2>
            <p style="margin-bottom: 24px; color: #F5F5F5; font-size: 18px;">Get 15% off your first jawn with code <strong style="color: #00FF00;">FIRSTWINGS</strong></p>
            <button onclick="document.getElementById('orderSection').scrollIntoView({behavior: 'smooth'}); this.parentElement.remove();" style="
                background: #00FF00;
                color: #1A1A1A;
                border: none;
                padding: 16px 32px;
                border-radius: 100px;
                font-size: 18px;
                font-weight: 700;
                cursor: pointer;
                font-family: 'Bebas Neue', sans-serif;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Lemme Get That Deal →</button>
        `;
        
        document.body.appendChild(popup);
        
        // Track exit intent
        gtag('event', 'exit_intent', {
            'event_category': 'Engagement',
            'event_label': 'Popup Shown'
        });
    }
});

// A/B Testing Framework
function getVariant(testName) {
    // Simple variant assignment based on timestamp
    const variants = ['A', 'B', 'C'];
    const index = new Date().getTime() % variants.length;
    return variants[index];
}

// Apply A/B test variants
function applyABTests() {
    // Test 1: Hero Headline
    const headlineVariant = getVariant('headline');
    const headlines = {
        'A': "Philadelphia's Most<br><span class='text-danger'>Dangerous</span> Wings",
        'B': "Wings So Good,<br>They're <span class='text-danger'>Addictive</span>",
        'C': "Your New Wing<br><span class='text-danger'>Obsession</span> Starts Here"
    };
    
    const heroHeadline = document.querySelector('.hero-headline');
    if (heroHeadline && headlines[headlineVariant]) {
        heroHeadline.innerHTML = headlines[headlineVariant];
        
        // Track variant
        gtag('event', 'ab_test', {
            'event_category': 'Experiment',
            'event_label': `Headline ${headlineVariant}`
        });
    }
}

// Run A/B tests
// applyABTests(); // Disabled - was replacing the "Yo, This Is THE JAWN" headline