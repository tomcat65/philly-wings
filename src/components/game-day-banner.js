import { GameDayBannerService, SettingsService } from '../services/firebase-service';

export class GameDayBanner {
  constructor() {
    this.container = document.getElementById('gameDayBanner');
    this.liveOrderCount = document.getElementById('liveOrderCount');
    this.unsubscribeBanner = null;
    this.unsubscribeSettings = null;
  }

  init() {
    if (!this.container) return;

    // Subscribe to active game day banner
    this.unsubscribeBanner = GameDayBannerService.subscribeToActive((banners) => {
      if (banners && banners.length > 0) {
        this.updateBanner(banners[0]);
        this.container.style.display = 'block';
      } else {
        this.container.style.display = 'none';
      }
    });

    // Subscribe to live order count
    if (this.liveOrderCount) {
      this.unsubscribeSettings = SettingsService.subscribeToSettings((settings) => {
        if (settings && settings.analytics) {
          this.liveOrderCount.textContent = settings.analytics.lastHourOrders || 0;
        }
      });
    }
  }

  updateBanner(banner) {
    const gameText = document.querySelector('.game-day-text');
    if (!gameText) return;

    let message = '';
    
    if (banner.team1 && banner.team2) {
      const gameDate = banner.gameDate ? new Date(banner.gameDate.seconds * 1000) : null;
      const dayOfWeek = gameDate ? gameDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() : 'GAMEDAY';
      
      message = `🏈 ${banner.team1} VS ${banner.team2} ${dayOfWeek}`;
    }

    if (banner.specialOffer) {
      message += ` • ${banner.specialOffer}`;
    }

    if (banner.message) {
      message += ` • ${banner.message}`;
    }

    if (this.liveOrderCount) {
      message += ` • <span id="liveOrderCount">${this.liveOrderCount.textContent}</span> orders this hour`;
    }

    gameText.innerHTML = message;
  }

  destroy() {
    if (this.unsubscribeBanner) {
      this.unsubscribeBanner();
    }
    if (this.unsubscribeSettings) {
      this.unsubscribeSettings();
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const banner = new GameDayBanner();
    banner.init();
  });
} else {
  const banner = new GameDayBanner();
  banner.init();
}