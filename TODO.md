# Zubika Marketplace — Task List

## Phase 1: Bug Fixes
- [x] Fix `AuthContext.js` — `login(token, user)` signature mismatch
- [x] Update `lib/models/Shop.js` — add `serviceDetails`, `isFree` fields
- [x] Update `app/api/shops/create/route.js` — accept `serviceDetails`, return `requiresPayment`
- [x] Update `app/api/products/create/route.js` — return `requiresPayment`

## Phase 2: Dark Blue Theme
- [ ] Update `app/globals.css` — dark navy CSS variables
- [ ] Update `app/page.js` — dark theme inline styles
- [ ] Update `app/sell/page.js` — dark theme inline styles
- [ ] Update `app/auth/login/page.js` — dark theme inline styles
- [ ] Update `app/auth/register/page.js` — dark theme inline styles
- [ ] Update `components/BottomNavigation.js` — dark theme
- [ ] Update `components/ServiceForm.js` — dark theme form fields
- [ ] Update `components/ProductForm.js` — dark theme form fields

## Phase 3: Verify
- [ ] Confirm app loads at localhost:3000
- [ ] Test service listing flow (free tier)
- [ ] Test Razorpay payment trigger on 3rd listing
