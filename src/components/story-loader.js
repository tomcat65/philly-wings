// Firebase Story Loader - Secure Content Management
// Fetches Our Story content from Firestore

export class StoryLoader {
  constructor() {
    this.storyData = null;
    this.init();
  }

  async init() {
    try {
      await this.loadStory();
    } catch (error) {
      console.error('Error loading story:', error);
      this.displayFallback();
    }
  }

  async loadStory() {
    try {
      // Fetch from Firebase
      const response = await fetch('/api/content/our-story');

      if (!response.ok) {
        // Fallback to direct Firestore if API not available
        await this.loadFromFirestore();
        return;
      }

      this.storyData = await response.json();
      this.renderStory();
    } catch (error) {
      console.error('Story fetch error:', error);
      await this.loadFromFirestore();
    }
  }

  async loadFromFirestore() {
    // This would normally use Firebase SDK
    // For now, we'll use the hardcoded story as fallback
    this.storyData = {
      title: "The Real Story",
      subtitle: "By Arleth (Oxford Circle, NE Philly)",
      sections: [
        {
          content: "I was done with soggy, freezer-burned wings. So I built the spot I wanted: wings brined overnight, double-fried to a shattering crunch, and sauces we make at 7 a.m. — from classic Buffalo to Lemon Pepper and our Gritty Garlic Parm. Dry rubs? Blended in-house."
        },
        {
          content: "This isn't a franchise play. It's Northeast Philly standards: do it right or don't do it. Every order is cooked to order, with \"sauce on the side\" and \"extra crispy\" always an option. We pack in vented, tamper-evident boxes so your wings land hot and crisp — even after the ride."
        },
        {
          content: "No shortcuts. No pre-cooked sadness. Just wings that taste like someone cared."
        }
      ],
      signature: "Every. Single. Wing. Matters.",
      signatureAuthor: "- Arleth"
    };

    this.renderStory();
  }

  renderStory() {
    const storySection = document.getElementById('whoWeAre');
    if (!storySection || !this.storyData) return;

    const storyContent = storySection.querySelector('.story-text');
    if (!storyContent) return;

    // Clear existing content
    storyContent.innerHTML = '';

    // Add title if exists
    if (this.storyData.subtitle) {
      const subtitle = document.createElement('h3');
      subtitle.textContent = this.storyData.subtitle;
      storyContent.appendChild(subtitle);
    }

    // Add sections
    this.storyData.sections.forEach(section => {
      if (section.heading) {
        const heading = document.createElement('h3');
        heading.textContent = section.heading;
        storyContent.appendChild(heading);
      }

      const paragraph = document.createElement('p');
      paragraph.textContent = section.content;
      storyContent.appendChild(paragraph);
    });

    // Add signature
    if (this.storyData.signature) {
      const signature = document.createElement('p');
      signature.className = 'story-signature';
      signature.innerHTML = `${this.storyData.signature}<br><span>${this.storyData.signatureAuthor}</span>`;
      storyContent.appendChild(signature);
    }

    // Add CTA if exists
    if (this.storyData.cta) {
      const cta = document.createElement('p');
      cta.className = 'story-cta';
      cta.innerHTML = `${this.storyData.cta.text} ${this.storyData.cta.platforms.join(' • ')}`;
      storyContent.appendChild(cta);
    }
  }

  displayFallback() {
    // Keep the existing HTML content as fallback
    console.log('Using fallback story content');
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.storyLoader = new StoryLoader();
  });
} else {
  window.storyLoader = new StoryLoader();
}