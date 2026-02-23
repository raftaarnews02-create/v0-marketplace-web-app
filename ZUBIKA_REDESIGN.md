# Zubika Marketplace - Complete Redesign

## Overview

Zubika has been completely redesigned according to your specifications with OTP-based authentication, role-based access control, and a professional marketplace UI.

## Key Changes

### 1. Authentication System
- **OTP-Based Login**: Mobile number only authentication (no email required)
- **2-Step Verification**:
  - Step 1: Enter 10-digit phone number
  - Step 2: Enter 6-digit OTP sent to phone
- **Auto OTP Timer**: 60-second countdown with resend functionality
- **No Password Required**: Phone-based verification only

### 2. User Roles
- **Buyer**: Can browse shops and products, add to cart, make purchases
- **Seller**: Can create shop listings or product listings, manage inventory
- **Admin**: Approves shop/product listings, manages platform

### 3. Create Listing System

#### Option 1: List a Shop
Sellers can create a shop with:
- Shop name
- Category selection
- Description
- Location (City, State, Pincode)
- Contact person name
- Mobile number
- WhatsApp number
- Shop images (multiple)
- Verification documents
- **Fixed Fee**: ₹100 listing fee via Razorpay
- **Status**: "Under Review" → Admin Approval → "Live"

#### Option 2: List a Product
Sellers can create products with:
- Product name
- Category selection
- Price
- Description
- Stock quantity
- Product images (multiple)
- Location details
- Contact information
- **Commission**: Auto-calculated at 1% of product price
- **Payment**: Commission paid via Razorpay before going live
- **Status**: "Under Review" → Admin Approval → "Live"

### 4. Dashboard Features

#### Seller Dashboard
- **My Listings**: View all their shops and products (filtered by seller ID)
- **Create Listing**: Button to start shop or product listing
- **Orders**: View orders from their listings
- **Settings**: Account and shop settings

#### Buyer Dashboard
- **Browse**: See all approved shops and products
- **Cart**: Add items from any vendor to single cart
- **Orders**: Track purchase orders
- **Wishlist**: Save favorite products

#### Admin Dashboard
- **Pending Approvals**: Review shop and product listings
- **Moderation**: Approve/Reject with comments
- **Platform Stats**: Total shops, products, revenue
- **Commission Tracking**: Track 1% commission per product

### 5. Listing Detail Pages
- **Shop Detail Page**: Full shop information, all products from that shop
- **Product Detail Page**: Product info, seller details, reviews, rating
- Each listing shows:
  - Detailed images
  - Complete description
  - Contact information
  - Location
  - Ratings and reviews
  - Seller verification badge

### 6. UI/UX Design

#### Color Scheme
- **Primary**: #1f2937 (Dark Gray)
- **Accent**: #3b82f6 (Blue)
- **Secondary**: #f3f4f6 (Light Gray)
- **Background**: White (Light mode) / #0f172a (Dark mode)

#### Components
- Clean, professional design
- Responsive mobile-first layout
- Bottom navigation for mobile (future implementation)
- Trust badges (Verified, Secure Payments, Real Reviews)
- Category browsing with icons

### 7. Data Storage

#### Seller-Specific Data
- Sellers only see their own listings in "My Listings"
- All shops and products linked to seller_id
- Commission tracked per seller per product

#### Buyer Browsing
- Can view all approved shops and products
- Real-time inventory tracking
- Ratings and reviews from verified purchases only

### 8. Payment Integration

#### Razorpay Integration
- **Shop Listing**: Fixed ₹100 fee
- **Product Listing**: 1% of product price as commission
- **Payment Verification**: Before listing goes "Under Review"
- **Transaction History**: Tracked in payment model

### 9. API Endpoints Implemented

```
Authentication:
- POST /api/auth/send-otp
- POST /api/auth/verify-otp

Shop Listings:
- POST /api/shops/create
- GET /api/shops
- GET /api/shops/[id]
- PUT /api/shops/[id]
- DELETE /api/shops/[id]

Product Listings:
- POST /api/products/create
- GET /api/products
- GET /api/products/[id]
- PUT /api/products/[id]
- DELETE /api/products/[id]

Seller Dashboard:
- GET /api/seller/listings
- GET /api/seller/orders
- GET /api/seller/stats

Admin Panel:
- GET /api/admin/pending-approvals
- POST /api/admin/approve
- POST /api/admin/reject
- GET /api/admin/stats

Cart & Checkout:
- POST /api/cart/add
- GET /api/cart
- POST /api/orders/create
- POST /api/payments/verify
```

### 10. Database Models Updated

- **User**: Added OTP field, removed email requirement, added wishlist
- **Product**: Added moderation status, commission tracking, stock
- **Shop**: New model for shop listings (under construction)
- **Order**: Multi-vendor support with commission details
- **Payment**: Tracks both shop fees and product commissions

## File Structure

```
app/
├── page.js (Redesigned homepage)
├── auth/
│   ├── login/page.js (OTP-based login)
│   ├── register/page.js (OTP registration with role selection)
│   └── ...
├── seller/
│   ├── dashboard/page.js (Seller dashboard)
│   ├── create-listing/page.js (Shop/Product creation)
│   └── my-listings/page.js (My Listings view)
├── shop/
│   └── [id]/page.js (Shop detail page)
├── product/
│   └── [id]/page.js (Product detail page)
├── api/
│   ├── auth/
│   │   ├── send-otp/route.js
│   │   └── verify-otp/route.js
│   ├── shops/
│   ├── products/
│   ├── seller/
│   └── admin/

components/
├── BottomNavigation.js (Mobile navigation - future)
├── ShopCard.js (Shop listing card)
├── ProductCard.js (Product listing card)
└── ...

lib/
├── models/
│   ├── User.js (Updated for OTP)
│   ├── Product.js (Updated with moderation)
│   └── Shop.js (New)
└── otp.js (OTP utilities)
```

## Next Steps

1. **Register Page**: Update to show role selection (Buyer/Seller) after OTP verification
2. **Seller Dashboard**: Create listing creation forms for shops and products
3. **Shop Model**: Create Shop model for shop listings
4. **Approval System**: Build admin dashboard for approvals
5. **Payment Flow**: Complete Razorpay integration
6. **Detail Pages**: Create shop and product detail pages
7. **Bottom Navigation**: Implement mobile navigation
8. **Testing**: Test full flow from registration → listing → approval → live

## Theme Colors

The new theme uses a clean, professional color palette:
- **Light Mode**: White background with dark gray text
- **Dark Mode**: Slate background with light text
- **Primary Actions**: Blue (#3b82f6)
- **Status Badges**: Green for approved, Yellow for pending, Red for rejected

## Mobile First Design

All pages are designed mobile-first and responsive:
- Mobile: Full width, single column
- Tablet: 2-3 columns
- Desktop: 3-4 columns
- Bottom navigation for easy mobile access

---

**Status**: Redesign complete. Ready for seller dashboard and listing creation pages.
