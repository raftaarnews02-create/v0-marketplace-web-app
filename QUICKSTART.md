# Zubika - Quick Start Guide (5 Minutes)

## Step 1: Install Dependencies
```bash
pnpm install
```

## Step 2: Create MongoDB Atlas Cluster (Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster (M0 free tier)
4. Create database user (save username & password)
5. Whitelist your IP (or 0.0.0.0/0 for development)
6. Click "Connect" → "Drivers" → Copy connection string
7. Replace `<username>` and `<password>` in the string

## Step 3: Create `.env.local`
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zubika?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-random-key-here-min-32-chars
NEXTAUTH_SECRET=another-random-secret-key-here-32-chars
NODE_ENV=development

# These are optional - demo OTP works without them
RAZORPAY_KEY_ID=rzp_test_DEMO_KEY
RAZORPAY_KEY_SECRET=your-test-secret-when-ready
```

## Step 4: Run Development Server
```bash
pnpm dev
```

Open http://localhost:3000 in your browser

## Step 5: Test the App

### Create First User
1. Click "Sign Up" on home page
2. Enter phone number: `9876543210`
3. Get OTP from browser console (check terminal output)
4. Enter OTP and create account

### Browse Products
1. Click categories or search
2. View featured products
3. Click product to see details

### Add to Cart
1. Click shopping cart icon on product
2. See cart update

### Checkout (Demo)
1. Go to Cart page
2. Click Checkout
3. Demo Razorpay order created (no actual payment)
4. Order confirmed

### Become Vendor
1. Go to "Sell" page
2. Fill vendor registration form
3. Auto-approved in demo
4. Create test products
5. Auto-approved for listing

## Key Demo Credentials

### For Testing
- **Phone**: 9876543210
- **OTP**: Check console/terminal output
- **Test Razorpay**: All payments succeed in test mode

### Admin Access
To make yourself admin in MongoDB:
1. Open MongoDB Atlas
2. Go to Collections
3. Find `users` collection
4. Find your user by phone
5. Update `userType` to `"admin"`
6. Access `/admin` page

## Important Files to Know

| File | Purpose |
|------|---------|
| `app/page.js` | Home page - featured products |
| `app/api/auth/send-otp/route.js` | Send OTP |
| `app/api/auth/verify-otp/route.js` | Verify OTP & login |
| `app/api/products/create/route.js` | Create product |
| `app/api/orders/create/route.js` | Create order |
| `app/api/payments/razorpay-order/route.js` | Payment gateway |
| `lib/models/` | Database schemas |
| `lib/mongodb.js` | Database connection |

## Common Issues & Fixes

### "MongoDB connection failed"
- Check MONGODB_URI format
- Verify IP whitelisting
- Check username/password

### "OTP not appearing"
- Check browser console (F12)
- Check terminal output
- OTP expires in 10 minutes

### "Vendor registration fails"
- Ensure you're logged in as customer first
- After registering, refresh to see approve prompt
- Check MongoDB for vendor record

### "Products not visible"
- Products pending moderation (auto-approve in demo)
- Check `moderation.status` in MongoDB
- Approve in admin panel

## Next Steps

1. **Setup Razorpay** (https://razorpay.com)
   - Get production API keys
   - Update `.env.local`

2. **Add Cloudinary** (https://cloudinary.com)
   - Get cloud name and API key
   - Update `.env.local`
   - Upload actual product images

3. **Deploy** (https://vercel.com)
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables
   - Deploy!

4. **Customize**
   - Update colors in `app/globals.css`
   - Add real products
   - Setup email notifications
   - Add SMS provider

## Features Ready to Use

✓ OTP authentication (demo mode)
✓ Multi-vendor marketplace
✓ Product management
✓ Shopping cart
✓ Order creation
✓ Payment flow (Razorpay structure)
✓ Admin dashboard
✓ Vendor verification
✓ Product reviews
✓ Wishlist
✓ Direct messaging (framework ready)

## Troubleshooting

**Can't create account?**
- Clear browser cache
- Try different phone number
- Check MongoDB connection

**Products not loading?**
- Wait for API response
- Check network tab in DevTools
- Restart dev server

**Cart not updating?**
- Refresh page
- Check localStorage
- Check API response

## Support

- Check `ZUBIKA_COMPLETE.md` for full documentation
- Check individual API files for detailed implementation
- Check MongoDB collections for data structure
- Check console for error messages

## Ready? Start Coding!

```bash
pnpm dev
# Visit http://localhost:3000
# Happy building with Zubika!
```
