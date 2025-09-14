#!/bin/bash

# Philly Wings Image Optimization Script
# This script optimizes all images for web performance

echo "🔥 Philly Wings Image Optimizer 🔥"
echo "=================================="

# Create images directory if it doesn't exist
mkdir -p images
mkdir -p images/optimized

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install imagemagick
    else
        sudo apt-get install imagemagick -y
    fi
fi

# Check if cwebp is installed for WebP conversion
if ! command -v cwebp &> /dev/null; then
    echo "WebP tools not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install webp
    else
        sudo apt-get install webp -y
    fi
fi

# Optimize function
optimize_image() {
    local input=$1
    local filename=$(basename "$input")
    local name="${filename%.*}"
    
    echo "Optimizing: $filename"
    
    # Resize to max 1920px width (keeping aspect ratio)
    convert "$input" -resize '1920>' "images/optimized/${name}.jpg"
    
    # Create WebP version (better compression)
    cwebp -q 85 "images/optimized/${name}.jpg" -o "images/optimized/${name}.webp"
    
    # Create thumbnail version (for previews)
    convert "$input" -resize '400x300^' -gravity center -extent 400x300 "images/optimized/${name}-thumb.jpg"
    
    # Create mobile version
    convert "$input" -resize '800>' "images/optimized/${name}-mobile.jpg"
    
    echo "✓ Created: ${name}.jpg, ${name}.webp, ${name}-thumb.jpg, ${name}-mobile.jpg"
}

# Process all images
echo ""
echo "Place your wing photos in the 'images' directory"
echo "Expected files:"
echo "  - hero-wings.jpg (main hero image)"
echo "  - buffalo-wings.jpg"
echo "  - honey-habanero.jpg"
echo "  - atomic-buffalo.jpg"
echo "  - garlic-parmesan.jpg"
echo ""

read -p "Press Enter when images are ready..."

# Optimize each image
for img in images/*.{jpg,jpeg,png,JPG,JPEG,PNG} 2>/dev/null; do
    if [[ -f "$img" ]]; then
        optimize_image "$img"
    fi
done

echo ""
echo "✅ Optimization complete!"
echo ""
echo "📁 Optimized images saved in: images/optimized/"
echo ""
echo "💡 Update your HTML to use WebP with fallback:"
echo '<picture>'
echo '  <source srcset="/images/optimized/buffalo-wings.webp" type="image/webp">'
echo '  <img src="/images/optimized/buffalo-wings.jpg" alt="Buffalo Wings">'
echo '</picture>'
echo ""
echo "🚀 Your images are now web-ready!"

# Generate image map for easy reference
echo ""
echo "Creating image reference file..."

cat > images/image-map.json <<EOF
{
  "hero": {
    "desktop": "/images/optimized/hero-wings.jpg",
    "mobile": "/images/optimized/hero-wings-mobile.jpg",
    "webp": "/images/optimized/hero-wings.webp"
  },
  "flavors": {
    "buffalo": {
      "full": "/images/optimized/buffalo-wings.jpg",
      "thumb": "/images/optimized/buffalo-wings-thumb.jpg",
      "webp": "/images/optimized/buffalo-wings.webp"
    },
    "honey_habanero": {
      "full": "/images/optimized/honey-habanero.jpg",
      "thumb": "/images/optimized/honey-habanero-thumb.jpg",
      "webp": "/images/optimized/honey-habanero.webp"
    },
    "atomic": {
      "full": "/images/optimized/atomic-buffalo.jpg",
      "thumb": "/images/optimized/atomic-buffalo-thumb.jpg",
      "webp": "/images/optimized/atomic-buffalo.webp"
    },
    "garlic_parmesan": {
      "full": "/images/optimized/garlic-parmesan.jpg",
      "thumb": "/images/optimized/garlic-parmesan-thumb.jpg",
      "webp": "/images/optimized/garlic-parmesan.webp"
    }
  }
}
EOF

echo "✓ Image map created at: images/image-map.json"