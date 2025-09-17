// WebP Image Service - Automatically serves WebP images to supported browsers
export class WebPImageService {
  constructor() {
    this.webpSupported = null;
    this.imageCache = new Map();
    this.init();
  }

  // Detect WebP support on initialization
  async init() {
    this.webpSupported = await this.checkWebPSupport();
    if (this.webpSupported) {
      console.log('✅ WebP supported - serving optimized images');
      this.interceptImageLoading();
    } else {
      console.log('📸 WebP not supported - serving original images');
    }
  }

  // Check browser WebP support
  checkWebPSupport() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  // Transform Firebase Storage URL to WebP version
  transformToWebP(originalUrl, size = '800x800') {
    // Skip if not a Firebase Storage image
    if (!originalUrl.includes('firebasestorage.googleapis.com')) {
      return originalUrl;
    }

    // Skip if already a WebP or resized image
    if (originalUrl.includes('.webp') || originalUrl.includes('/resized/')) {
      return originalUrl;
    }

    // Extract image path and filename
    const urlParts = originalUrl.split('?')[0];
    const matches = urlParts.match(/o\/(.+?)(\.[^.]+)$/);

    if (!matches) return originalUrl;

    const [, imagePath, extension] = matches;
    const filename = imagePath.split('/').pop();

    // Skip if no valid image extension
    if (!['.jpg', '.jpeg', '.png', '.gif'].includes(extension.toLowerCase())) {
      return originalUrl;
    }

    // Build WebP URL with resized path
    const basePath = imagePath.substring(0, imagePath.lastIndexOf('/'));
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    const webpFilename = `${nameWithoutExt}_${size}.webp`;

    // Construct new Firebase Storage URL
    const webpPath = `${basePath}/resized/${webpFilename}`;
    const webpUrl = urlParts.replace(imagePath + extension, webpPath);

    // Add token if present in original URL
    const tokenMatch = originalUrl.match(/[?&]token=([^&]+)/);
    if (tokenMatch) {
      return `${webpUrl}?alt=media&token=${tokenMatch[1]}`;
    }

    return `${webpUrl}?alt=media`;
  }

  // Get appropriate image size based on context
  getOptimalSize(element) {
    // Hero images and banners
    if (element.classList.contains('hero-video') ||
        element.classList.contains('banner-image')) {
      return '1920x1080';
    }

    // Menu cards and medium images
    if (element.classList.contains('menu-card-img') ||
        element.classList.contains('sauce-image') ||
        element.classList.contains('combo-image')) {
      return '800x800';
    }

    // Thumbnails and small images
    if (element.classList.contains('thumbnail') ||
        element.classList.contains('wing-type-image') ||
        element.width < 300) {
      return '200x200';
    }

    // Default to medium size
    return '800x800';
  }

  // Intercept image loading and replace with WebP
  interceptImageLoading() {
    // Override image src setter
    const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').set;

    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      set: function(value) {
        if (!value) {
          originalSrcSetter.call(this, value);
          return;
        }

        const service = window.webpService;
        if (service && service.webpSupported && !this.dataset.noWebp) {
          const size = service.getOptimalSize(this);
          const webpUrl = service.transformToWebP(value, size);

          // Set original as fallback
          this.dataset.originalSrc = value;

          // Try loading WebP with fallback
          const testImg = new Image();
          testImg.onload = () => {
            originalSrcSetter.call(this, webpUrl);
          };
          testImg.onerror = () => {
            console.warn(`WebP not found, using original: ${value}`);
            originalSrcSetter.call(this, value);
          };
          testImg.src = webpUrl;
        } else {
          originalSrcSetter.call(this, value);
        }
      },
      get: function() {
        return this.getAttribute('src');
      }
    });

    // Process existing images
    this.processExistingImages();
  }

  // Process images already on the page
  processExistingImages() {
    const images = document.querySelectorAll('img[src]');
    images.forEach(img => {
      if (!img.dataset.noWebp && img.src.includes('firebasestorage')) {
        const size = this.getOptimalSize(img);
        const webpUrl = this.transformToWebP(img.src, size);

        // Store original
        img.dataset.originalSrc = img.src;

        // Try WebP with fallback
        const testImg = new Image();
        testImg.onload = () => {
          img.src = webpUrl;
        };
        testImg.onerror = () => {
          console.warn(`WebP not found for existing image: ${img.src}`);
        };
        testImg.src = webpUrl;
      }
    });
  }

  // Manual method to convert URL (for dynamic content)
  getWebPUrl(originalUrl, size = '800x800') {
    if (!this.webpSupported) return originalUrl;
    return this.transformToWebP(originalUrl, size);
  }

  // Preload critical WebP images
  preloadCriticalImages(urls) {
    if (!this.webpSupported) return;

    urls.forEach(url => {
      const webpUrl = this.transformToWebP(url, '800x800');
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.type = 'image/webp';
      link.href = webpUrl;
      document.head.appendChild(link);
    });
  }
}

// Initialize service globally
window.webpService = new WebPImageService();

// Export for module usage
export default window.webpService;