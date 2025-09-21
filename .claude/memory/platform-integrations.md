# Platform Integration Notes

## DoorDash Integration

### Menu URL Format
```
https://phillywingsexpress.com/menu/doordash/[snapshot-id]
```

### Quirks & Gotchas
- **Modifier Limit**: Max 10 options per modifier group
- **Description Length**: 200 chars max (they truncate)
- **Price Format**: Must use decimals, not cents (12.99 not 1299)
- **Image Requirements**: 1:1 ratio, min 600x600px
- **Update Frequency**: Takes 24-48hrs to reflect changes

### Working Integration Code
```javascript
// DoorDash-specific menu formatter
const formatForDoorDash = (menuData) => {
  return {
    restaurant: {
      name: "Philly Wings Express",
      hours: getBusinessHours(),
    },
    categories: menuData.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      sort_order: cat.order,
      items: cat.items.map(formatDoorDashItem)
    }))
  };
};

const formatDoorDashItem = (item) => ({
  id: item.id,
  name: item.name.substring(0, 50), // They display max 50 chars
  description: item.description?.substring(0, 200),
  price: item.platformPricing.doordash,
  image_url: item.imageUrl,
  modifier_groups: item.modifierGroups?.slice(0, 10), // Max 10
  nutritional_info: {
    calories: item.nutrition?.calories
  }
});
```

## UberEats Integration

### Menu URL Format  
```
https://phillywingsexpress.com/menu/ubereats/[snapshot-id]
```

### Quirks & Gotchas
- **Faster Updates**: Usually within 2-6 hours
- **Rich Formatting**: Supports markdown in descriptions
- **Bundle Support**: Better combo meal handling
- **Photo Requirements**: Multiple angles preferred
- **Promo Integration**: Can push limited-time offers

### Working Integration Code
```javascript
// UberEats prefers nested structure
const formatForUberEats = (menuData) => {
  return {
    menus: [{
      id: "main-menu",
      title: "All Day Menu",
      subtitle: "Available for delivery",
      categories: menuData.categories.map(cat => ({
        id: cat.id,
        title: cat.name,
        entities: cat.items.map(item => ({
          id: item.id,
          title: item.name,
          description: formatMarkdown(item.description),
          price: {
            amount: Math.round(item.platformPricing.ubereats * 100),
            currency: "USD"
          },
          imageUrl: item.imageUrl,
          modifierGroups: formatUberModifiers(item.modifierGroups)
        }))
      }))
    }]
  };
};
```

## Grubhub Integration

### Menu URL Format
```
https://phillywingsexpress.com/menu/grubhub/[snapshot-id]
```

### Quirks & Gotchas
- **Simpler Format**: Less sophisticated than others
- **Manual Updates**: Sometimes requires phone call
- **Lower Fees**: But less traffic
- **Limited Modifiers**: Basic options only
- **No Markdown**: Plain text descriptions only

### Working Integration Code
```javascript
// Grubhub uses flatter structure
const formatForGrubhub = (menuData) => {
  const allItems = [];
  
  menuData.categories.forEach(cat => {
    cat.items.forEach(item => {
      allItems.push({
        category: cat.name,
        name: item.name,
        description: item.description?.replace(/[*_]/g, ''), // Strip markdown
        price: item.platformPricing.grubhub.toFixed(2),
        options: flattenModifiers(item.modifierGroups)
      });
    });
  });
  
  return { restaurant_name: "Philly Wings Express", items: allItems };
};
```

## Common Issues & Solutions

### Issue: Menu Not Updating
**Solution**: Always create new snapshot, never update existing
```javascript
// WRONG
await firestore.doc(`publishedMenus/${id}`).update(data);

// RIGHT
const newSnapshot = await firestore.collection('publishedMenus').add(data);
sendToPlatform(newSnapshot.id);
```

### Issue: Prices Showing Wrong
**Solution**: Always use platform-specific pricing
```javascript
// Each platform sees only their prices
const getPlatformPrice = (item, platform) => {
  if (!item.platformPricing?.[platform]) {
    console.error(`Missing ${platform} price for ${item.name}`);
    return item.basePrice * 1.35; // Emergency fallback
  }
  return item.platformPricing[platform];
};
```

### Issue: Modifiers Not Working
**Solution**: Match platform's expected structure exactly
```javascript
// DoorDash wants arrays, UberEats wants objects
const formatModifiers = (modifiers, platform) => {
  switch(platform) {
    case 'doordash':
      return modifiers.map(m => m.options);
    case 'ubereats':
      return { groups: modifiers };
    case 'grubhub':
      return modifiers.flatMap(m => m.options);
  }
};
```

## Testing Checklist

Before sending menu to platform:
- [ ] All items have platform-specific prices
- [ ] Images are correct size/format
- [ ] Modifiers are within platform limits
- [ ] Descriptions fit character limits
- [ ] Test URL loads without auth
- [ ] JSON-LD structured data validates
- [ ] Mobile view works properly
- [ ] Print view is readable

## Platform Contacts

- **DoorDash**: merchant-support@doordash.com (24-48hr response)
- **UberEats**: restaurants@uber.com (same day usually)
- **Grubhub**: restaurants@grubhub.com (2-3 days)

## Integration Testing URLs

```javascript
// Test environments (ask platform for access)
const TEST_URLS = {
  doordash: 'https://merchant-staging.doordash.com',
  ubereats: 'https://restaurant.uber.com/test',
  grubhub: 'https://restaurant-test.grubhub.com'
};
```