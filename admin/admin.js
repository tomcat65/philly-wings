import { auth } from '../src/firebase-config';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { 
  FirebaseService, 
  GameDayBannerService, 
  MenuService,
  ComboService,
  ReviewService,
  SettingsService 
} from '../src/services/firebase-service';

class AdminPanel {
  constructor() {
    this.currentUser = null;
    this.currentSection = 'gameDayBanner';
    this.init();
  }

  init() {
    // Auth state listener
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = user;
        this.showDashboard();
      } else {
        this.showLogin();
      }
    });

    // Event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgotPassword');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', (e) => this.handlePasswordReset(e));
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const section = e.target.dataset.section;
        this.switchSection(section);
      });
    });

    // Forms
    this.setupFormHandlers();
  }

  setupFormHandlers() {
    // Banner form
    const bannerForm = document.getElementById('bannerForm');
    if (bannerForm) {
      bannerForm.addEventListener('submit', (e) => this.handleBannerSubmit(e));
    }

    // Menu form
    const menuForm = document.getElementById('menuForm');
    if (menuForm) {
      menuForm.addEventListener('submit', (e) => this.handleMenuSubmit(e));
    }

    // Category filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.filterMenuItems(e.target.dataset.category);
      });
    });
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const errorDiv = document.getElementById('loginError');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      errorDiv.textContent = '';
    } catch (error) {
      errorDiv.textContent = 'Invalid login credentials';
      console.error('Login error:', error);
    }
  }

  async handlePasswordReset(e) {
    e.preventDefault();
    const email = document.getElementById('emailInput').value;
    const errorDiv = document.getElementById('loginError');
    const resetMessage = document.getElementById('resetMessage');

    if (!email) {
      errorDiv.textContent = 'Please enter your email address first';
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      errorDiv.textContent = '';
      resetMessage.style.display = 'block';
      resetMessage.textContent = `Password reset email sent to ${email}. Check your inbox!`;

      // Hide message after 5 seconds
      setTimeout(() => {
        resetMessage.style.display = 'none';
      }, 5000);
    } catch (error) {
      errorDiv.textContent = 'Error sending reset email: ' + error.message;
      console.error('Password reset error:', error);
    }
  }

  async handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
  }

  showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    this.loadDashboardData();
  }

  switchSection(section) {
    this.currentSection = section;

    // Update nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });

    // Update content
    document.querySelectorAll('.content-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === section);
    });

    // Load section data
    this.loadSectionData(section);
  }

  async loadDashboardData() {
    this.loadSectionData(this.currentSection);
  }

  async loadSectionData(section) {
    switch(section) {
      case 'gameDayBanner':
        this.loadBanners();
        break;
      case 'menuItems':
        this.loadMenuItems();
        break;
      case 'combos':
        this.loadCombos();
        break;
      case 'reviews':
        this.loadReviews();
        break;
      case 'settings':
        this.loadSettings();
        break;
    }
  }

  async loadBanners() {
    try {
      const banners = await FirebaseService.getAll('gameDayBanners', {
        orderBy: ['priority', 'desc']
      });
      this.displayBanners(banners);
    } catch (error) {
      console.error('Error loading banners:', error);
    }
  }

  displayBanners(banners) {
    const container = document.getElementById('bannersList');
    if (!container) return;

    container.innerHTML = banners.map(banner => `
      <div class="banner-item">
        <div class="item-info">
          <h4>${banner.team1} vs ${banner.team2}</h4>
          <p>
            ${banner.active ? '✅ Active' : '❌ Inactive'} | 
            Priority: ${banner.priority} | 
            ${banner.specialOffer || 'No special offer'}
          </p>
        </div>
        <div class="item-actions">
          <button class="edit-btn" onclick="admin.editBanner('${banner.id}')">Edit</button>
          <button class="delete-btn" onclick="admin.deleteBanner('${banner.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  }

  async handleBannerSubmit(e) {
    e.preventDefault();
    
    const bannerData = {
      active: document.getElementById('bannerActive').checked,
      team1: document.getElementById('team1').value,
      team2: document.getElementById('team2').value,
      gameDate: new Date(document.getElementById('gameDate').value),
      priority: parseInt(document.getElementById('priority').value) || 0,
      specialOffer: document.getElementById('specialOffer').value,
      message: document.getElementById('bannerMessage').value
    };

    try {
      await FirebaseService.create('gameDayBanners', bannerData);
      alert('Banner created successfully!');
      e.target.reset();
      this.loadBanners();
    } catch (error) {
      console.error('Error creating banner:', error);
      alert('Error creating banner');
    }
  }

  async deleteBanner(id) {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        await FirebaseService.delete('gameDayBanners', id);
        this.loadBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert('Error deleting banner');
      }
    }
  }

  async loadMenuItems() {
    try {
      const items = await MenuService.getActiveItems();
      this.displayMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  }

  displayMenuItems(items) {
    const container = document.getElementById('menuList');
    if (!container) return;

    container.innerHTML = items.map(item => `
      <div class="menu-item" data-category="${item.category}">
        <div class="item-info">
          <h4>${item.name}</h4>
          <p>${item.category} | $${item.price} | Heat: ${item.heatLevel}/5</p>
          <p>${item.description}</p>
        </div>
        <div class="item-actions">
          <button class="edit-btn" onclick="admin.editMenuItem('${item.id}')">Edit</button>
          <button class="delete-btn" onclick="admin.deleteMenuItem('${item.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  }

  async handleMenuSubmit(e) {
    e.preventDefault();
    
    const itemData = {
      name: document.getElementById('itemName').value,
      category: document.getElementById('itemCategory').value,
      description: document.getElementById('itemDescription').value,
      price: parseFloat(document.getElementById('itemPrice').value),
      heatLevel: parseInt(document.getElementById('heatLevel').value) || 0,
      sortOrder: parseInt(document.getElementById('sortOrder').value) || 0,
      active: document.getElementById('itemActive').checked,
      featured: document.getElementById('itemFeatured').checked
    };

    // Handle image upload
    const imageFile = document.getElementById('itemImage').files[0];
    if (imageFile) {
      try {
        const imagePath = `menu-items/${Date.now()}-${imageFile.name}`;
        itemData.imageUrl = await FirebaseService.uploadImage(imageFile, imagePath);
        itemData.image = imagePath;
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    try {
      await FirebaseService.create('menuItems', itemData);
      alert('Menu item created successfully!');
      e.target.reset();
      this.loadMenuItems();
    } catch (error) {
      console.error('Error creating menu item:', error);
      alert('Error creating menu item');
    }
  }

  async deleteMenuItem(id) {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        // Get item to delete image if exists
        const item = await FirebaseService.getById('menuItems', id);
        if (item && item.image) {
          await FirebaseService.deleteImage(item.image);
        }
        
        await FirebaseService.delete('menuItems', id);
        this.loadMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('Error deleting menu item');
      }
    }
  }

  filterMenuItems(category) {
    const items = document.querySelectorAll('.menu-item');
    items.forEach(item => {
      if (category === 'all' || item.dataset.category === category) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  // Placeholder methods for other sections
  async loadCombos() {
    // TODO: Implement combo loading
  }

  async loadReviews() {
    // TODO: Implement reviews loading
  }

  async loadSettings() {
    // TODO: Implement settings loading
  }
}

// Initialize admin panel
const admin = new AdminPanel();
window.admin = admin; // Make available globally for onclick handlers