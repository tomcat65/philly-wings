/**
 * Catering Sauce Selector Component
 * Interactive showcase of 14 signature sauces with heat levels and stories
 */

import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config.js';

export async function renderSauceSelector() {
  const sauces = await fetchSauces();
  const phillySauces = sauces.filter(s => s.category === 'philly-signature');
  const classicSauces = sauces.filter(s => s.category === 'classic');

  return `
    <section class="sauce-selector-section">
      <div class="section-header">
        <h2>14 Signature Sauces That Actually Taste Different</h2>
        <p class="section-subtitle">
          <strong>Double most competitors.</strong> Buffalo Wild Wings has 6-8, Wingstop has 11. We have 14.
        </p>
      </div>

      <div class="sauce-categories">
        <div class="sauce-category">
          <div class="category-header">
            <h3>🦅 Philly Signature Sauces</h3>
            <p>Named after real Philadelphia neighborhoods and legends</p>
          </div>
          <div class="sauces-grid">
            ${phillySauces.map(sauce => renderSauceCard(sauce)).join('')}
          </div>
        </div>

        <div class="sauce-category">
          <div class="category-header">
            <h3>🔥 Classic Crowd-Pleasers</h3>
            <p>Timeless favorites everyone knows and loves</p>
          </div>
          <div class="sauces-grid">
            ${classicSauces.map(sauce => renderSauceCard(sauce)).join('')}
          </div>
        </div>
      </div>

      <div class="sauce-legend">
        <h4>Heat Level Guide:</h4>
        <div class="legend-grid">
          <div class="legend-item">
            <span class="heat-icon">🟢</span>
            <span>0-1: No heat, all flavor</span>
          </div>
          <div class="legend-item">
            <span class="heat-icon">🟡</span>
            <span>2: Gentle kick</span>
          </div>
          <div class="legend-item">
            <span class="heat-icon">🟠</span>
            <span>3: Medium heat</span>
          </div>
          <div class="legend-item">
            <span class="heat-icon">🔴</span>
            <span>4: Hot & spicy</span>
          </div>
          <div class="legend-item">
            <span class="heat-icon">💀</span>
            <span>5: Scorpion pepper insanity</span>
          </div>
        </div>
      </div>

      <div class="sauce-note">
        <p>
          <strong>Pro Tip:</strong> Mix mild and spicy options for your team.
          We recommend 1 no-heat sauce, 1 medium, and 1 hot per package.
        </p>
      </div>
    </section>
  `;
}

function renderSauceCard(sauce) {
  const heatDots = getHeatDots(sauce.heatLevel);
  const categoryBadge = sauce.category === 'philly-signature'
    ? '<span class="category-badge philly-badge">Philly Exclusive</span>'
    : '';

  return `
    <div class="sauce-card" data-heat="${sauce.heatLevel}">
      ${categoryBadge}

      <div class="sauce-header">
        <h4 class="sauce-name">${sauce.name}</h4>
        <div class="sauce-heat">
          <span class="heat-label">Heat:</span>
          <span class="heat-dots">${heatDots}</span>
        </div>
      </div>

      <p class="sauce-description">${sauce.description}</p>

      <div class="sauce-story">
        <p>${sauce.story}</p>
      </div>
    </div>
  `;
}

function getHeatDots(level) {
  const heatIcons = ['🟢', '🟡', '🟠', '🔴', '💀'];

  if (level === 0) {
    return '🟢 (No Heat)';
  }

  if (level === 5) {
    return '💀💀💀💀💀';
  }

  const iconIndex = level <= 1 ? 1 : level <= 2 ? 1 : level <= 3 ? 2 : 3;
  return heatIcons[iconIndex].repeat(level);
}

/**
 * Fetch active sauces from Firebase
 * @returns {Promise<Array>} Array of sauce objects
 */
async function fetchSauces() {
  try {
    const q = query(
      collection(db, 'sauces'),
      where('active', '==', true),
      orderBy('sortOrder', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching sauces from Firebase:', error);
    return [];
  }
}
