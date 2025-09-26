/**
 * Shared Utilities Module
 * Common functionality used across multiple modal systems:
 * - Mobile menu toggle
 * - Smooth scrolling
 * - Sauce modal (individual sauce details)
 * - Common utility functions
 */

function generateSharedUtilsJS(menuData = {}) {
  return `
    // Mobile Menu Functions
    function toggleMobileMenu() {
      const mobileNav = document.getElementById('mobileNav');
      if (mobileNav) {
        mobileNav.classList.toggle('show');
      }
    }

    function closeMobileMenu() {
      const mobileNav = document.getElementById('mobileNav');
      if (mobileNav) {
        mobileNav.classList.remove('show');
      }
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      const mobileNav = document.getElementById('mobileNav');
      const hamburger = document.querySelector('.hamburger-menu');

      if (mobileNav && !mobileNav.contains(event.target) && !hamburger.contains(event.target)) {
        closeMobileMenu();
      }
    });

    // Sauce Modal (individual sauce details)
    window.openSauceModal = function(sauceId, sauceData) {
      console.log('Opening sauce modal for:', sauceId, sauceData);

      // TODO: Implement individual sauce detail modal
      alert('Sauce details for: ' + (sauceData.name || sauceId));
    };

    window.closeSauceModal = function() {
      const modal = document.getElementById('sauceModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    };

    // Navigation and Smooth Scrolling Functions
    function scrollToSection(sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Close mobile menu if open
        closeMobileMenu();
      }
    }

    // Utility Functions
    function formatPrice(price) {
      return typeof price === 'number' ? price.toFixed(2) : '0.00';
    }

    function generateId() {
      return Math.random().toString(36).substr(2, 9);
    }

    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    // Initialize smooth scrolling for navigation links
    document.addEventListener('DOMContentLoaded', function() {
      // Add click handlers for navigation links
      document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').slice(1);
          scrollToSection(targetId);
        });
      });
    });

    // Global modal utilities
    function closeAllModals() {
      const modals = ['wingsModal', 'sidesModal', 'beverageModal', 'sauceModal'];
      modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.style.display = 'none';
        }
      });
      document.body.style.overflow = 'auto';
    }

    // Close modals on ESC key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        closeAllModals();
      }
    });

    // Global click outside modal handler
    document.addEventListener('click', function(event) {
      if (event.target.classList.contains('modal')) {
        closeAllModals();
      }
    });
  `;
}

module.exports = {
  generateSharedUtilsJS
};