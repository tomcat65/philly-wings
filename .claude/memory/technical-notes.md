# Technical Findings

## Firebase Storage
- Hero video uploaded: hero-wings-sauced.mp4 (3MB)
- Images uploaded: 5 assets total (11MB)
- All assets served via Firebase CDN
- Storage was completely empty before Dec 13

## Performance
- Asset sizes optimized: All under 3MB
- Using Firebase Storage URLs directly
- Video autoplay with muted/loop
- Images lazy loaded where appropriate

## Security Incident - Dec 13, 2024
- API key exposed in .env.example on GitHub
- Google Cloud detected and alerted
- FIXED: Replaced with placeholders
- Pushed clean version to repo
- No other files contained exposed keys

## Analytics Setup
- GA4 configured but needs proper ID
- Platform click tracking implemented
- Missing proper conversion events

<!-- Update with findings -->
