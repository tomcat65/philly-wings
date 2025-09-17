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

    try {
      // Extract the base URL and the encoded path
      const [baseUrlWithPath, queryParams] = originalUrl.split('?');

      // Extract just the filename from the path
      // The URL structure is: .../o/images%2Ffilename.ext?alt=media...
      const pathMatch = baseUrlWithPath.match(/\/o\/images%2F([^?]+)/);
      if (!pathMatch) {
        console.warn('Could not parse Firebase Storage URL:', originalUrl);
        return originalUrl;
      }

      const filenameWithExt = decodeURIComponent(pathMatch[1]);

      // Remove extension to get base filename
      // If no extension found, use the full filename
      const nameWithoutExt = filenameWithExt.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '') || filenameWithExt;

      // Build WebP filename
      const webpFilename = `${nameWithoutExt}_${size}.webp`;

      // Construct new Firebase Storage URL
      const baseUrl = baseUrlWithPath.split('/o/')[0];
      const webpPath = `images%2Fresized%2F${encodeURIComponent(webpFilename)}`;
      const webpUrl = `${baseUrl}/o/${webpPath}`;

      console.log('WebP Transform:', {
        original: originalUrl,
        filename: filenameWithExt,
        nameWithoutExt: nameWithoutExt,
        webpFilename: webpFilename,
        webp: webpUrl + '?alt=media'
      });

      return webpUrl + '?alt=media';
    } catch (error) {
      console.error('Error transforming to WebP:', error);
      return originalUrl;
    }
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