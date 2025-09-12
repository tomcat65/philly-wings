// Data models for Philly Wings Express

export const GameDayBanner = {
  id: '',
  active: false,
  team1: '',
  team2: '',
  gameDate: null,
  message: '',
  specialOffer: '',
  priority: 0,
  createdAt: null,
  updatedAt: null
};

export const MenuItem = {
  id: '',
  name: '',
  description: '',
  category: '', // wings, sides, drinks, combos
  price: 0,
  image: '',
  imageUrl: '',
  active: true,
  featured: false,
  heatLevel: 0, // 0-5
  ingredients: [],
  allergens: [],
  nutritionInfo: {},
  sortOrder: 0,
  createdAt: null,
  updatedAt: null
};

export const Combo = {
  id: '',
  name: '',
  description: '',
  items: [], // array of {itemId, quantity}
  originalPrice: 0,
  comboPrice: 0,
  savings: 0,
  image: '',
  imageUrl: '',
  active: true,
  featured: false,
  gameDay: false,
  limitedTime: false,
  expiresAt: null,
  sortOrder: 0,
  createdAt: null,
  updatedAt: null
};

export const LiveOrder = {
  id: '',
  customerName: '',
  neighborhood: '',
  items: '',
  timestamp: null,
  display: true
};

export const Review = {
  id: '',
  customerName: '',
  rating: 5,
  text: '',
  platform: '', // DoorDash, UberEats, Grubhub
  featured: false,
  verified: true,
  createdAt: null
};

export const SiteSettings = {
  id: 'main',
  businessHours: {
    monday: { open: '11:00', close: '22:00' },
    tuesday: { open: '11:00', close: '22:00' },
    wednesday: { open: '11:00', close: '22:00' },
    thursday: { open: '11:00', close: '22:00' },
    friday: { open: '11:00', close: '23:00' },
    saturday: { open: '11:00', close: '23:00' },
    sunday: { open: '12:00', close: '21:00' }
  },
  deliveryPlatforms: {
    doorDash: { active: true, url: '' },
    uberEats: { active: true, url: '' },
    grubHub: { active: true, url: '' }
  },
  socialMedia: {
    instagram: '',
    facebook: '',
    twitter: ''
  },
  analytics: {
    orderCount: 0,
    lastHourOrders: 0
  },
  updatedAt: null
};