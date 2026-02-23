# Quick Setup Guide - ServiceHub

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Create MongoDB Atlas Database
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (choose free tier)
4. Click "Connect" → "Drivers" (Node.js)
5. Copy the connection string
6. Replace `<password>` with your cluster password

### Step 3: Setup Environment File
Create `.env.local` in project root:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/servicehub?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_SECRET=another-secret-key-here
NODE_ENV=development
```

### Step 4: Start Development Server
```bash
pnpm dev
```

Open http://localhost:3000 in your browser

## 🎯 First Steps in the App

### As a Buyer:
1. Go to Register → Choose "Browse & Buy"
2. Go to Home → Browse services by category
3. Click on a product → Message the seller
4. View your messages in Messages tab

### As a Seller:
1. Go to Register → Choose "Sell Services"
2. Go to Sell → Click "New Listing"
3. Fill in product details and save
4. View/edit products in Sell dashboard
5. Respond to buyer messages

## 📱 Mobile Navigation
The app has a mobile-style bottom navigation:
- 🏠 **Home** - Featured services and categories
- 🔍 **Browse** - Search and filter products
- ➕ **Sell** - Manage your listings
- 💬 **Messages** - Chat with buyers/sellers
- 👤 **Profile** - Your account settings

## 🔑 Demo Credentials
Test without registering:
```
Email: demo@email.com
Password: password123
```

## 📚 Important Files to Know

| File | Purpose |
|------|---------|
| `/app/page.js` | Home page |
| `/app/auth/login/page.js` | Login form |
| `/app/auth/register/page.js` | Sign up form |
| `/app/browse/page.js` | Search & browse products |
| `/app/sell/page.js` | Seller dashboard |
| `/app/messages/page.js` | Messaging system |
| `/app/product/[id]/page.js` | Product details |
| `/context/AuthContext.js` | User authentication state |
| `/lib/mongodb.js` | MongoDB connection |
| `/lib/models/` | Database schemas |
| `/app/api/` | API endpoints |

## 🛠️ Customization Tips

### Change App Colors
Edit `/app/globals.css` and modify design tokens:
```css
:root {
  --primary: #your-brand-color;
  --accent: #your-accent-color;
}
```

### Add Service Categories
Edit `/components/CategorySelector.js` - add to CATEGORIES array

### Modify Product Fields
Edit `/lib/models/Product.js` - add fields to schema

### Change Site Title
Edit `/app/layout.js` - metadata.title

## 🐛 Common Issues & Fixes

### "MongoDB connection failed"
- Check MONGODB_URI in .env.local
- Verify IP is whitelisted in MongoDB Atlas
- Username/password correct?

### "Cannot find module 'mongoose'"
- Run `pnpm install`
- Clear node_modules: `rm -rf node_modules && pnpm install`

### Page is blank
- Check browser console for errors
- Refresh the page
- Check Network tab for API errors

### Image won't load
- Currently uses placeholder images
- For real images, use image URLs in product form

## 📦 Project Features Overview

✅ User authentication (Register/Login)
✅ Create & manage product listings
✅ Search & browse by category
✅ Direct messaging between users
✅ User profiles with location info
✅ Mobile-app-style navigation
✅ Responsive design (mobile/tablet/desktop)
✅ Admin dashboard (UI only)
✅ Seller dashboard
✅ Product reviews & ratings

## 🚀 Next Steps

1. **Run the app** - `pnpm dev`
2. **Register** - Create a buyer and seller account
3. **Create products** - Add some listings as a seller
4. **Browse** - Find products and send messages
5. **Explore code** - Check out the API routes and components

## 🎓 Learning Resources

- Next.js docs: https://nextjs.org/docs
- MongoDB docs: https://docs.mongodb.com
- Tailwind CSS: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com

## 💡 Tips for Development

- Use browser DevTools console to debug
- Check API responses in Network tab
- MongoDB Atlas web console to view data
- Hot reload works - changes save instantly

## 🔐 Security Notes

⚠️ **For Production:**
- Change JWT_SECRET to a strong random string
- Use environment variables for all secrets
- Enable HTTPS
- Add rate limiting to API
- Implement CSRF protection
- Add input validation

## 📞 Need Help?

Check the README.md for:
- Detailed API documentation
- Full project structure
- Deployment instructions
- Feature explanations

---

**Happy Building! 🎉**
