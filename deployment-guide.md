# Philly Wings Express - Deployment Guide

## 🚀 Quick Deploy Options (Choose One)

### Option 1: Vercel (Recommended - Free & Fast)
```bash
# Install Vercel CLI
npm i -g vercel

# In your philly-wings directory
vercel

# Follow prompts, it will give you a URL like:
# https://philly-wings.vercel.app
```

### Option 2: Netlify (Also Free)
1. Go to [netlify.com](https://netlify.com)
2. Drag your `philly-wings` folder to browser
3. Instant deploy with URL

### Option 3: GitHub Pages (Free)
```bash
# Create new repo on GitHub
git init
git add .
git commit -m "Launch Philly Wings"
git push origin main

# Enable Pages in repo settings
```

## 🔧 Immediate Setup Tasks

### 1. Platform Registration (TODAY)

#### DoorDash
1. Go to [merchants.doordash.com](https://merchants.doordash.com)
2. Sign up as "Philly Wings Express"
3. Use Charleys address but separate phone/email
4. Upload menu:
   - 6pc Wings - $10.99
   - 10pc Wings - $16.99
   - 30pc Party Pack - $44.99
   - 50pc Game Day - $69.99
5. Get your store URL for deep linking

#### Uber Eats
1. [merchants.ubereats.com](https://merchants.ubereats.com)
2. Same process as DoorDash
3. Enable "Virtual Restaurant" option
4. Set 20-30 min prep time

### 2. Analytics Setup (30 mins)

1. Create Google Analytics 4 account
2. Get your Measurement ID (G-XXXXXXXXXX)
3. Replace in index.html:
```javascript
// Find this line and update:
gtag('config', 'GA_MEASUREMENT_ID');
// Change to:
gtag('config', 'G-YOUR-REAL-ID');
```

### 3. Domain Setup (Optional but Recommended)

Quick options:
- `phillywingsexpress.com`
- `phillywings.delivery`
- `getphillywings.com`

Use Namecheap or Google Domains (~$12/year)

### 4. Update Platform Links

In `index.html`, update these lines:
```html
<!-- Find and replace with your actual URLs -->
<a href="https://www.doordash.com/store/philly-wings-express-YOUR-ID">
<a href="https://www.ubereats.com/store/philly-wings-express/YOUR-ID">
<a href="https://www.grubhub.com/restaurant/philly-wings-express-YOUR-ID">
```

### 5. Visual Assets Checklist

Create/source these ASAP:
- [ ] Hero video: Wings being tossed in sauce (iPhone slow-mo works!)
- [ ] Hero fallback: High-res wings photo
- [ ] Buffalo wings photo (glistening sauce)
- [ ] Honey Habanero photo (show the glaze)
- [ ] Atomic wings photo (extra red/dangerous looking)
- [ ] Garlic Parmesan photo (visible herbs/cheese)

Photo tips:
- Natural lighting or bright kitchen lights
- 45-degree angle
- Steam/heat visible if possible
- Dark background for contrast

## 📱 Pre-Launch Testing

### Mobile Testing
1. Open on your phone
2. Check all buttons are tappable
3. Test platform links open apps
4. Verify sticky CTA appears on scroll

### Desktop Testing
- Chrome, Safari, Firefox
- Test hover effects
- Check video plays
- Verify countdown timer works

### Speed Test
1. Go to [PageSpeed Insights](https://pagespeed.web.dev)
2. Enter your URL
3. Should score 90+ on mobile

## 🎯 Launch Sequence

### Hour 1: Technical
- [ ] Deploy to hosting
- [ ] Test all links
- [ ] Verify analytics working
- [ ] Check mobile experience

### Hour 2: Platforms
- [ ] Complete platform setups
- [ ] Set initial promotions
- [ ] Configure delivery zones
- [ ] Test ordering process

### Hour 3: Marketing
- [ ] Share on social media
- [ ] Post in local Facebook groups
- [ ] Text friends/family
- [ ] Monitor first orders

## 🔥 Go-Live Checklist

```javascript
// Add this to your console to verify tracking:
gtag('event', 'test_event', {
  'event_category': 'test',
  'event_label': 'deployment_test'
});
```

Platform URLs secured? ✓
Analytics tracking? ✓
Mobile tested? ✓
Wings ready? ✓

**YOU'RE READY TO LAUNCH!** 🚀

## 📊 Day 1 Monitoring

1. **Every Hour**: Check platform dashboards
2. **Every 2 Hours**: Review Google Analytics
3. **Continuous**: Watch for first reviews
4. **End of Day**: Calculate conversion rate

## 🆘 Emergency Contacts

- DoorDash Support: 855-973-1040
- Uber Eats Support: 833-275-3287
- Grubhub Support: 877-585-1085

---

Remember: Launch TODAY with what you have. Perfect is the enemy of good. You can optimize everything based on real data once orders start flowing!