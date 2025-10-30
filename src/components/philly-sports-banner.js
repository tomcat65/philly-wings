export class PhillySportsBanner {
  constructor() {
    this.container = document.getElementById('phillySportsBanner');
    this.games = [];
    this.refreshInterval = null;
    this.cacheKey = 'philly_games_cache_v3';
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  async init() {
    if (!this.container) return;

    // Quick cache check for immediate display
    const cachedData = this.getCachedData();
    if (cachedData?.games?.length) {
      this.games = cachedData.games;
      this.renderBanner();
    } else {
      this.showLoadingState();
    }

    // Fetch fresh data
    await this.fetchGames();

    // Set up refresh every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.fetchGames();
    }, 5 * 60 * 1000);
  }

  async fetchGames() {
    try {
      const response = await fetch('/api/phillygames');
      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();

      if (data.games?.length > 0) {
        this.games = data.games;
        this.cacheData(data);
        this.renderBanner();
      } else if (!this.games.length) {
        this.showNoGamesState();
      }
    } catch (error) {
      console.error('Fetch error:', error);
      if (!this.games.length) {
        this.showErrorState();
      }
    }
  }

  renderBanner() {
    if (!this.games.length) {
      this.showNoGamesState();
      return;
    }

    // Take first 4 games for banner (2 rows, 2 games each)
    const bannerGames = this.games.slice(0, 4);

    const gamesHTML = bannerGames.map((game, index) => {
      const isLive = game.isLive;
      const teamDisplay = game.isHome ? `${game.awayTeam.name} vs ${game.homeTeam.name}` : `${game.homeTeam.name} vs ${game.awayTeam.name}`;

      return `
        <div class="sports-game" data-row="${index < 2 ? 'top' : 'bottom'}">
          <div class="game-info">
            <span class="sport-icon">${game.icon}</span>
            <span class="team-vs">${teamDisplay}</span>
            ${isLive ? '<span class="live-indicator">LIVE</span>' : ''}
          </div>
          <span class="game-time">${isLive ? game.clock || 'LIVE' : game.gameTime}</span>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="sports-banner-content">
        ${gamesHTML}
      </div>
    `;

    this.container.style.display = 'block';
  }

  showLoadingState() {
    this.container.innerHTML = `
      <div class="banner-loading" role="status" aria-live="polite">
        <div class="aural-spinner" aria-hidden="true"></div>
        <span>Loading Philadelphia sports schedule...</span>
      </div>
    `;
    this.container.style.display = 'block';
  }

  showNoGamesState() {
    this.container.innerHTML = `
      <div class="banner-loading">
        No upcoming Philadelphia games scheduled
      </div>
    `;
    this.container.style.display = 'block';
  }

  showErrorState() {
    this.container.innerHTML = `
      <div class="banner-loading">
        Unable to load sports schedule
      </div>
    `;
    this.container.style.display = 'block';
  }

  // Cache management
  getCachedData() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;

      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < this.cacheDuration) {
        return data;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  cacheData(data) {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: data
      }));
    } catch (error) {
      console.error('Failed to cache games:', error);
    }
  }

  destroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.phillySportsBanner = new PhillySportsBanner();
    window.phillySportsBanner.init();
  } catch (error) {
    console.error('Failed to initialize sports banner:', error);
  }
});
