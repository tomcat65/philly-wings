// Simple GameDayBanner without Firebase dependencies for now
export class GameDayBanner {
  constructor() {
    this.container = document.getElementById('gameDayBanner');
    this.liveOrderCount = document.getElementById('liveOrderCount');
  }

  async init() {
    if (!this.container) return;

    try {
      // For now, use a simple fetch approach or keep hardcoded fallback
      // This will be replaced with proper Firebase integration later
      const bannerData = {
        active: true,
        team1: "EAGLES",
        team2: "COWBOYS",
        gameDate: "2025-09-14T17:00:00.000Z",
        message: "Order your Tailgate Special now",
        specialOffer: "Free delivery on orders $30+"
      };

      if (bannerData.active) {
        this.updateBanner(bannerData);
        this.container.style.display = 'block';
      } else {
        this.container.style.display = 'none';
      }
    } catch (error) {
      console.error('Error loading banner:', error);
      // Keep banner hidden on error
      this.container.style.display = 'none';
    }
  }

  updateBanner(banner) {
    const gameText = document.querySelector('.game-day-text');
    if (!gameText) return;

    let message = '';

    if (banner.team1 && banner.team2) {
      const gameDate = banner.gameDate ? new Date(banner.gameDate) : null;
      const dayOfWeek = gameDate ? gameDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() : 'GAMEDAY';

      message = `🏈 ${banner.team1} VS ${banner.team2} ${dayOfWeek}`;
    }

    if (banner.message) {
      message += ` • ${banner.message}`;
    }

    if (banner.specialOffer) {
      message += ` • 🔥 ${banner.specialOffer}`;
    } else {
      message += ' • 🔥 Limited time deals';
    }

    gameText.textContent = message;
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