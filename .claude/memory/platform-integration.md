# Platform Integration & Pricing

## Last Updated: 2025-01-17

## Platform Requirements

### DoorDash Menu Requirements
- Item names and descriptions
- Clear pricing per item
- Modifier options with prices
- High-quality images (optional but recommended)
- Nutritional info (optional)
- Prep time estimates

### UberEats Menu Requirements
- Similar to DoorDash
- Supports promotional pricing
- Requires clear categorization
- Allergen information recommended

### Grubhub Menu Requirements
- Simpler structure than others
- Focus on price and descriptions
- Less complex modifier system
- Delivery radius specification

## Shareable Menu Links

### Link Structure
```
https://phillywingsexpress.com/menu/{platform}/{unique-id}
```

### Features Per Link
- Platform-specific pricing
- Professional layout
- All modifiers included
- Portion details
- Optional nutrition/allergens
- Print-friendly CSS
- Mobile responsive

### Generation Process
1. Click "Generate Menu Link" in admin
2. Select options (images, nutrition, allergens)
3. System creates unique Firebase document
4. Link ready to share immediately
5. QR code generated for easy sharing

## Platform Pricing Matrix

### 6 Wings
| Platform | Our Cost | Sell Price | Margin % |
|----------|----------|------------|----------|
| DoorDash | $8.99 | $11.99 | 54.0% |
| UberEats | $8.99 | $11.99 | 54.0% |
| Grubhub | $8.99 | $11.49 | 56.0% |

### 12 Wings
| Platform | Our Cost | Sell Price | Margin % |
|----------|----------|------------|----------|
| DoorDash | $16.99 | $21.99 | 49.8% |
| UberEats | $16.99 | $21.99 | 49.8% |
| Grubhub | $16.99 | $21.49 | 51.0% |

### Combos
| Item | DoorDash | UberEats | Grubhub |
|------|----------|----------|---------|
| Sampler | $19.99 | $19.99 | $19.49 |
| MVP Meal | $32.99 | $32.99 | $31.99 |
| Tailgater | $64.99 | $64.99 | $63.99 |
| Game Day 30 | $52.99 | $52.99 | $51.99 |
| Party Pack 50 | $109.99 | $109.99 | $107.99 |

## Modifier Pricing

### Wing Styles
- Regular Mix: $0
- All Drums: +$1.50 (6-12 wings), +$2.50 (24+ wings)
- All Flats: +$1.50 (6-12 wings), +$2.50 (24+ wings)
- Boneless: $0

### Sauce Rules
- First sauce: FREE
- Additional sauces: +$1.49 each
- Sauce on side: FREE
- Extra sauce on wings: +$0.75

### Dipping Sauces (1.5oz)
- Ranch: +$1.25
- Blue Cheese: +$1.25
- Honey Mustard: +$1.25
- Cheese Sauce: +$1.25
- Extra Marinara: +$1.25

## Platform API Integration (Future)

### DoorDash Drive API
- Status: Not yet implemented
- Cost: $500/month minimum
- Benefits: Real-time menu updates

### Uber Direct API
- Status: Not yet implemented
- Requirements: 100+ orders/week
- Benefits: Dynamic pricing

### Grubhub Restaurant API
- Status: Not yet implemented
- Simplest integration
- CSV upload supported

## Current Integration Method
1. Generate menu link in admin
2. Email link to platform rep
3. Platform team uploads manually
4. Updates require new link generation
5. Old links remain valid

## Platform Contacts
- DoorDash: merchant@doordash.com
- UberEats: restaurants@uber.com
- Grubhub: restaurants@grubhub.com

## Best Practices
1. Update all platforms simultaneously
2. Keep pricing consistent per platform
3. Test modifiers before publishing
4. Include all allergen information
5. Use high-quality images
6. Update during off-peak hours
7. Notify platforms of major changes

## Platform Performance Metrics

### Order Volume (Weekly Average)
- DoorDash: 65% of orders
- UberEats: 25% of orders
- Grubhub: 10% of orders

### Average Order Value
- DoorDash: $28.50
- UberEats: $26.00
- Grubhub: $31.00

### Peak Times
- Lunch: 11:30 AM - 1:30 PM
- Dinner: 5:30 PM - 8:30 PM
- Late Night: 10 PM - 12 AM (Fri/Sat)

## Promotional Strategy
- Happy Hour: 3-6 PM weekdays (15% off)
- Game Day: Special combos on Sundays
- First-Time: $5 off $20+ (platform specific)
- Weather: Rainy day free delivery

## Notes for Admin Team
- Platform fees are already calculated in pricing
- Never share base prices with platforms
- Always maintain 35% minimum margin
- Update Firebase first, then generate links
- Keep platform tabs open for quick switching
- Use tablet in landscape mode for best experience