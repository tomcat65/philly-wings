#!/usr/bin/env node

/**
 * Create Wings Menu Item with proper array structure
 */

import { createReadStream } from 'fs';

const wingsData = {
  id: "wings",
  name: "Wings",
  category: "wings",
  description: "Fresh, never frozen wings double-fried to crispy perfection",
  baseItem: true,
  active: true,
  sortOrder: 1,
  modifierGroups: ["sauce_choice", "wing_style", "extra_sauces"],
  variants: [
    {
      id: "wings_6",
      name: "6 Wings",
      description: "Half dozen wings with your choice of sauce",
      basePrice: 5.99,
      platformPricing: {
        doordash: 8.99,
        ubereats: 8.99,
        grubhub: 7.99
      },
      portionDetails: {
        count: 6,
        servings: 1,
        maxSauces: 1
      },
      sortOrder: 1
    },
    {
      id: "wings_12",
      name: "12 Wings",
      description: "A dozen wings with your choice of sauce",
      basePrice: 10.99,
      platformPricing: {
        doordash: 16.99,
        ubereats: 16.99,
        grubhub: 14.99
      },
      portionDetails: {
        count: 12,
        servings: 2,
        maxSauces: 1
      },
      sortOrder: 2
    },
    {
      id: "wings_24",
      name: "24 Wings",
      description: "Two dozen wings, mix up to 2 sauces",
      basePrice: 19.99,
      platformPricing: {
        doordash: 28.99,
        ubereats: 28.99,
        grubhub: 24.99
      },
      portionDetails: {
        count: 24,
        servings: 4,
        maxSauces: 2
      },
      sortOrder: 3
    },
    {
      id: "wings_30",
      name: "30 Wings",
      description: "Thirty wings, mix up to 3 sauces",
      basePrice: 24.99,
      platformPricing: {
        doordash: 35.99,
        ubereats: 35.99,
        grubhub: 31.99
      },
      portionDetails: {
        count: 30,
        servings: 5,
        maxSauces: 3
      },
      sortOrder: 4
    },
    {
      id: "wings_50",
      name: "50 Wings",
      description: "Fifty wings for the big game, mix up to 4 sauces",
      basePrice: 39.99,
      platformPricing: {
        doordash: 59.99,
        ubereats: 59.99,
        grubhub: 51.99
      },
      portionDetails: {
        count: 50,
        servings: 8,
        maxSauces: 4
      },
      sortOrder: 5
    }
  ],
  images: {
    hero: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fphilly-classic-hot.png?alt=media"
  },
  createdAt: "2025-01-18T14:00:00Z",
  updatedAt: "2025-01-18T14:00:00Z"
};

console.log('📄 Wings data structure:');
console.log('✅ Variants is array:', Array.isArray(wingsData.variants));
console.log('✅ Variant count:', wingsData.variants.length);
console.log('✅ ModifierGroups is array:', Array.isArray(wingsData.modifierGroups));
console.log(JSON.stringify(wingsData, null, 2));
