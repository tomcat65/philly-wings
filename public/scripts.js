// Public copy of premium conversion scripts to satisfy Vite/dist path
// Source: scripts.js at repo root

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

    function updateCountdown() {
        const now = new Date();
        const closing = new Date();
        closing.setHours(21, 0, 0, 0); // 9 PM
        if (closing < now) closing.setDate(closing.getDate() + 1);
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

    let currentCount = 17;
    setInterval(() => {
        if (Math.random() > 0.7) {
            currentCount++;
            orderCount.textContent = currentCount;
            orderCount.style.animation = 'none';
            setTimeout(() => { orderCount.style.animation = 'pulse-text 0.5s ease-out'; }, 10);
        }
    }, 5000);

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
        orderItem.innerHTML = `<span class="order-time">just now</span><span class="order-details">${orderText}</span>`;
        orderTicker.insertBefore(orderItem, orderTicker.firstChild);
        while (orderTicker.children.length > 5) orderTicker.removeChild(orderTicker.lastChild);
        updateOrderTimes();
    }

    function updateOrderTimes() {
        const items = orderTicker.querySelectorAll('.order-item');
        const times = ['just now', '2 min ago', '5 min ago', '8 min ago', '12 min ago'];
        items.forEach((item, index) => { if (index < times.length) item.querySelector('.order-time').textContent = times[index]; });
    }
    setInterval(() => { if (Math.random() > 0.5) addNewOrder(); }, 20000);
}

// Image Zoom (expects modal markup in index)
window.initFoodImageZoom = function initFoodImageZoom() {
    const modal = document.getElementById('imageZoomModal');
    const modalImg = document.getElementById('zoomedImage');
    const captionText = document.getElementById('zoomCaption');
    const closeBtn = document.querySelector('.zoom-close');
    const imgs = document.querySelectorAll('.combo-image, .sauce-image, .side-image, .gallery-item img, .wing-style-img.zoomable, .menu-card img, .menu-card-img');
    const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
    imgs.forEach(img => {
        img.style.cursor = 'pointer';
        const openZoom = function() {
            modal.style.display = 'block';
            modalImg.dataset.noWebp = 'true';
            const zoomSrc = img.src || img.getAttribute('src');
            modalImg.onerror = () => { modalImg.setAttribute('src', img.getAttribute('src') || zoomSrc); };
            modalImg.onload = () => { modalImg.style.display = 'block'; modalImg.style.visibility = 'visible'; };
            modalImg.setAttribute('src', zoomSrc);
            captionText.innerHTML = img.alt || 'Zoomed view';
        };
        if (isMobile) img.addEventListener('touchend', (e) => { e.preventDefault(); openZoom(); }, {passive:false});
        img.addEventListener('click', openZoom);
    });
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

function initStickyMobileCTA(){}
function initHeroVideoOptimization(){}
function initSoundEffects(){}
function initWingStyleSelector(){}
function trackPageView(){}

