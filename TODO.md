# Zubika Implementation Plan

## Information Gathered:
- Current codebase uses Next.js 16 with MongoDB
- OTP authentication via mobile is already implemented
- User model has userType (customer, vendor, admin)
- Product model has moderation status (pending/approved/rejected)
- Seller/Vendor models exist but need enhancement
- Payment APIs exist but need new endpoints for listing fees

## Plan:

### Phase 1: Data Models
- [ ] 1.1 Create/Enhance Shop model with fields: name, category, description, location, contactPerson, mobile, whatsapp, images, documents, status
- [ ] 1.2 Add role field to user to distinguish Buyer/Seller

### Phase 2: API Routes
- [ ] 2.1 Create API for Shop listings (create, read, update, delete)
- [ ] 2.2 Create payment API for shop listing fee (₹100)
- [ ] 2.3 Create payment API for product commission
- [ ] 2.4 Update product create API to require payment first
- [ ] 2.5 Create API for admin to approve/reject shops
- [ ] 2.6 Create API for seller to get only their listings (shops + products)
- [ ] 2.7 Create API for buyers to get all approved listings

### Phase 3: Frontend - Authentication
- [ ] 3.1 Update AuthContext to include role (Buyer/Seller)
- [ ] 3.2 Add role selection after OTP verification (Buyer or Seller)

### Phase 4: Frontend - Seller Dashboard
- [ ] 4.1 Update sell/page.js to check user role before showing Create Listing
- [ ] 4.2 Create listing selection modal (Shop vs Product)
- [ ] 4.3 Create Shop listing form with all required fields
- [ ] 4.4 Update Product listing form with payment integration
- [ ] 4.5 Update "My Listings" to show both shops and products
- [ ] 4.6 Add payment flow before listing submission

### Phase 5: Frontend - Buyer Experience
- [ ] 5.1 Update homepage to show approved shops and products
- [ ] 5.2 Create shop detail page
- [ ] 5.3 Update product detail page
- [ ] 5.4 Ensure buyers can browse all approved listings

### Phase 6: Admin Panel
- [ ] 6.1 Add shop moderation to admin panel
- [ ] 6.2 Update product moderation if needed

## Dependent Files to be edited:
- lib/models/Shop.js (new)
- lib/models/User.js (enhance)
- lib/models/Product.js (enhance)
- context/AuthContext.js
- app/api/shops/ (new directory)
- app/api/payments/create-listing (new)
- app/sell/page.js
- app/auth/register/page.js
- app/page.js
- app/shop/[id]/page.js (new)

## Followup steps:
- Test OTP authentication with role selection
- Test seller dashboard access control
- Test payment flow for shop listing
- Test payment flow for product listing
- Test admin approval flow
- Test buyer browsing experience
