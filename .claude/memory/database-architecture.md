# Database Architecture - Philly Wings Express

**Last Updated**: 2025-09-20
**Active Collections**: 13
**Architecture**: Denormalized for read performance

## FIRESTORE COLLECTIONS OVERVIEW

### Core Menu System

#### 1. **menuItems**
- **Purpose**: Primary menu offerings with complete item details
- **Key Fields**: name, description, price, imageUrl, nutritionalInfo, category
- **Relationships**: Links to nutritionData, modifierGroups
- **Recent Updates**: Enhanced with Firebase Storage image integration
- **Performance**: Optimized for read-heavy operations

#### 2. **sauces**
- **Purpose**: Wing sauces and dry rubs with heat level indicators
- **Key Fields**: name, description, heatLevel, imageUrl, category
- **Recent Changes**: Transformed from text-only to image-based display
- **New Images**: ranch, honey mustard, blue cheese, cheese sauce
- **Display**: Dynamic card-based layout with CSS object-fit optimization

#### 3. **combos**
- **Purpose**: Combination deals and package offerings
- **Key Fields**: name, items, totalPrice, savings, description
- **Business Logic**: Package pricing calculated at publish time

#### 4. **modifierGroups**
- **Purpose**: Customization options and add-ons for menu items
- **Key Fields**: name, options, priceModifiers, applicableItems
- **Integration**: Links with menuItems for customization

### Content Management

#### 5. **publishedMenus**
- **Purpose**: Platform-specific menu snapshots for delivery apps
- **Architecture**: Immutable snapshots for version control
- **Key Fields**: platformId, menuSnapshot, publishDate, version
- **Business Value**: Enables rollback and platform-specific pricing

#### 6. **content**
- **Purpose**: General content management and marketing copy
- **Key Fields**: pageName, sections, content, lastModified
- **Usage**: Powers marketing pages and promotional content

#### 7. **gameDayBanners**
- **Purpose**: Event-specific promotional banners and seasonal content
- **Key Fields**: title, imageUrl, startDate, endDate, priority
- **Display**: Dynamic banner rotation based on date/priority

### Customer Experience

#### 8. **reviews**
- **Purpose**: Customer testimonials and rating aggregation
- **Key Fields**: customerName, rating, review, date, verified
- **Display**: Social proof integration on main pages

#### 9. **liveOrders**
- **Purpose**: Real-time order ticker for social proof
- **Key Fields**: orderType, timestamp, location, items
- **Performance**: Real-time updates for engagement

#### 10. **emailSubscribers**
- **Purpose**: Newsletter and marketing email management
- **Key Fields**: email, subscribeDate, preferences, active
- **Integration**: Marketing automation pipeline

### System Configuration

#### 11. **settings**
- **Purpose**: Application-wide configuration and feature flags
- **Key Fields**: key, value, environment, lastModified
- **Usage**: Runtime configuration without code deployment

#### 12. **nutritionData**
- **Purpose**: FDA 2020 compliant nutritional information
- **Key Fields**: itemId, calories, protein, carbs, fat, allergens
- **Compliance**: Meets regulatory requirements for food service
- **Relationships**: Links to menuItems for detailed nutrition display

#### 13. **menu-sections**
- **Purpose**: Menu organization and display ordering
- **Key Fields**: sectionName, order, visibility, description
- **Usage**: Controls menu layout and categorization

## REMOVED COLLECTIONS

### Legacy Cleanup (Recent Session)
- **nutrition** (20 documents) - Successfully removed legacy collection
  - **Reason**: Replaced by more comprehensive nutritionData collection
  - **Impact**: Improved database performance, reduced complexity
  - **Verification**: No dependencies found before removal

## DATABASE RELATIONSHIPS

### Primary Relationships
```
menuItems → nutritionData (itemId)
menuItems → modifierGroups (applicableItems)
publishedMenus → menuItems (snapshot creation)
sauces → modifierGroups (sauce options)
content → gameDayBanners (promotional content)
reviews → menuItems (item-specific reviews)
```

### Data Flow Patterns
1. **Menu Publishing**: menuItems → publishedMenus (platform snapshots)
2. **Nutrition Display**: menuItems → nutritionData (detailed info)
3. **Customization**: menuItems → modifierGroups → sauces
4. **Social Proof**: liveOrders + reviews → content display

## PERFORMANCE OPTIMIZATIONS

### Read-Optimized Structure
- **Denormalized design** for fast read operations
- **Calculated fields** stored rather than computed at runtime
- **Immutable snapshots** for platform menu publishing
- **Minimal Firebase Functions** usage for performance

### Image Integration
- **Firebase Storage URLs** in imageUrl fields
- **WebP conversion** handled by Firebase Functions
- **Responsive images** with multiple size variants
- **Lazy loading** implementation for below-fold content

## RECENT TECHNICAL IMPROVEMENTS

### Database Cleanup
- Removed unused legacy 'nutrition' collection
- Verified no orphaned references
- Improved query performance

### Image Display Enhancement
- Fixed water bottle image display with CSS object-fit
- Integrated new sauce images seamlessly
- Enhanced mobile responsive design

### Architecture Validation
- 13 active collections serving distinct purposes
- No redundant or conflicting data structures
- Clear separation of concerns between collections

## NEXT PHASE CONSIDERATIONS

### Scalability
- Current structure supports growth without major refactoring
- Collection-based organization allows feature additions
- Performance targets maintained with current architecture

### Platform Integration
- publishedMenus collection ready for additional delivery platforms
- Flexible schema supports platform-specific requirements
- Audit trail maintained for all menu changes

This database architecture reflects a mature, well-organized system optimized for the specific needs of a Firebase-powered marketing application driving traffic to delivery platforms.