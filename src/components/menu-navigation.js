/**
 * Menu Navigation Component
 * Handles sticky navigation, smooth scrolling, and active state management
 */

export class MenuNavigation {
    constructor() {
        this.navButtons = document.querySelectorAll('.menu-nav-btn');
        this.categories = document.querySelectorAll('.menu-category');
        this.activeCategory = null;
        this.scrollTimeout = null;

        // Bind event handlers to maintain consistent references
        this.handleNavClick = this.handleNavClick.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    init() {
        if (!this.navButtons.length) return;

        // Add click handlers to navigation buttons
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', this.handleNavClick);
        });

        // Track scroll position for active state
        window.addEventListener('scroll', this.handleScroll);

        // Set initial active state
        this.updateActiveState();
    }

    handleNavClick(e) {
        const btn = e.currentTarget;
        const category = btn.dataset.category;
        const targetElement = document.getElementById(`category-${category}`);

        if (targetElement) {
            // Calculate offset for sticky nav
            const navHeight = document.querySelector('.menu-nav-sticky').offsetHeight;
            const targetPosition = targetElement.offsetTop - navHeight - 20;

            // Smooth scroll to category
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update active state immediately
            this.setActiveButton(btn);
        }
    }

    handleScroll() {
        // Debounce scroll events
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.updateActiveState();
        }, 100);
    }

    updateActiveState() {
        const scrollPosition = window.scrollY + 100; // Offset for detection

        // Find which category is currently in view
        let activeCategory = null;
        this.categories.forEach(category => {
            const top = category.offsetTop;
            const bottom = top + category.offsetHeight;

            if (scrollPosition >= top && scrollPosition < bottom) {
                activeCategory = category.id.replace('category-', '');
            }
        });

        // Update active button
        if (activeCategory) {
            const activeBtn = document.querySelector(`.menu-nav-btn[data-category="${activeCategory}"]`);
            if (activeBtn) {
                this.setActiveButton(activeBtn);
            }
        }
    }

    setActiveButton(activeBtn) {
        // Remove active class from all buttons
        this.navButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to current button
        activeBtn.classList.add('active');

        // Ensure active button is visible in horizontal scroll
        this.scrollToButton(activeBtn);
    }

    scrollToButton(btn) {
        const container = btn.parentElement;
        const btnLeft = btn.offsetLeft;
        const btnWidth = btn.offsetWidth;
        const containerWidth = container.offsetWidth;
        const scrollLeft = container.scrollLeft;

        // Check if button is out of view
        if (btnLeft < scrollLeft || btnLeft + btnWidth > scrollLeft + containerWidth) {
            // Center the button in the container
            container.scrollTo({
                left: btnLeft - (containerWidth / 2) + (btnWidth / 2),
                behavior: 'smooth'
            });
        }
    }

    destroy() {
        // Clean up event listeners
        this.navButtons.forEach(btn => {
            btn.removeEventListener('click', this.handleNavClick);
        });
        window.removeEventListener('scroll', this.handleScroll);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const menuNav = new MenuNavigation();
        menuNav.init();
    });
} else {
    const menuNav = new MenuNavigation();
    menuNav.init();
}