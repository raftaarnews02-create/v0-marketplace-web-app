# ServiceHub - JustDial-Like Marketplace Platform

A complete, full-stack marketplace application built with Next.js, JavaScript, MongoDB, and modern web technologies. Features a mobile-app-like interface with bottom navigation, allowing users to browse services, sell offerings, and communicate with sellers.

## Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with password hashing (bcrypt)
- **Role-Based Access**: Support for Buyer, Seller, and Admin accounts
- **Product Management**: Create, read, update, and delete product listings
- **Search & Browse**: Advanced search and category-based browsing
- **Messaging System**: Direct communication between buyers and sellers
- **User Profiles**: Complete user profile management with address and contact info
- **Seller Dashboard**: Dedicated seller panel for managing products
- **Admin Dashboard**: Admin controls for user and product moderation

### UI/UX Features
- **Mobile-App-Style Navigation**: Bottom navigation bar (5 tabs) - Home, Browse, Sell, Messages, Profile
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Modern Styling**: Uses Tailwind CSS with shadcn/ui components
- **Product Cards**: Beautiful product display with ratings, location, and seller info
- **Real-time Search**: Search products by title, description, or tags
- **Category Filtering**: Browse by service categories

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Backend API
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Development
- **JavaScript** - No TypeScript
- **pnpm** - Package manager

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.js                 # Root layout with AuthProvider & BottomNavigation
│   ├── page.js                   # Home page
│   ├── auth/
│   │   ├── login/page.js        # Login page
│   │   └── register/page.js     # Registration page
│   ├── browse/page.js            # Product browsing page
│   ├── product/[id]/page.js     # Product details page
│   ├── sell/page.js              # Seller dashboard
│   ├── messages/page.js          # Messaging page
│   ├── profile/page.js           # User profile page
│   ├── admin/page.js             # Admin dashboard
│   └── api/
│       ├── auth/
│       │   ├── login/route.js
│       │   └── register/route.js
│       ├── products/
│       │   ├── route.js          # List & Create products
│       │   └── [id]/route.js     # Get, Update, Delete product
│       ├── messages/route.js     # Messages API
│       ├── sellers/route.js      # Sellers API
│       └── users/profile/route.js # User profile API
├── components/
│   ├── BottomNavigation.js       # Mobile-style bottom nav
│   ├── ProductCard.js            # Product display card
│   ├── SearchBar.js              # Search component
│   └── CategorySelector.js       # Category filter
├── context/
│   └── AuthContext.js            # Authentication context
├── hooks/
│   └── useProducts.js            # Products data fetching hook
├── lib/
│   ├── mongodb.js                # MongoDB connection
│   └── models/
│       ├── User.js               # User schema
│       ├── Product.js            # Product schema
│       ├── Seller.js             # Seller schema
│       └── Message.js            # Message schema
├── globals.css                   # Global styles & design tokens
└── .env.local                    # Environment variables

```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vercel/share/v0-project
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup Environment Variables**
   
   Create a `.env.local` file in the project root:
   ```env
   # MongoDB Connection String
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/servicehub?retryWrites=true&w=majority
   
   # JWT Secret (Change in production!)
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   
   # NextAuth Secret
   NEXTAUTH_SECRET=your-nextauth-secret-key
   
   # Environment
   NODE_ENV=development
   ```

   **To get MongoDB URI:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account
   - Create a cluster
   - Click "Connect" → "Drivers" → Copy the connection string
   - Replace `<password>` with your cluster password

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
pnpm build
pnpm start
```

## Usage

### First Time Setup

1. **Register an Account**
   - Go to `http://localhost:3000/auth/register`
   - Choose "Browse & Buy" (buyer) or "Sell Services" (seller)
   - Complete registration

2. **For Sellers: Create a Product Listing**
   - Navigate to "Sell" tab (bottom navigation)
   - Click "New Listing"
   - Fill in product details (title, description, price, location, etc.)
   - Click "Save Listing"

3. **For Buyers: Browse Products**
   - Go to "Browse" tab
   - Use search bar to find services
   - Click on a product to see details
   - Message the seller directly

4. **Messaging**
   - Click "Messages" tab to see conversations
   - Start a new conversation by messaging from product details
   - Real-time message updates

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - List products with filters
- `POST /api/products` - Create product (requires auth)
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product (seller only)
- `DELETE /api/products/[id]` - Delete product (seller only)

### Messages
- `GET /api/messages` - Get messages (requires auth)
- `POST /api/messages` - Send message (requires auth)

### Sellers
- `GET /api/sellers` - List sellers
- `POST /api/sellers` - Create seller profile (requires auth)

### Users
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)

## Features Explained

### Mobile-Style Bottom Navigation
- **Home**: Browse featured services and categories
- **Browse**: Advanced search and filtering
- **Sell**: Create and manage product listings
- **Messages**: Inbox with conversations
- **Profile**: User profile and account settings

### Authentication System
- Secure JWT tokens stored in localStorage
- Password hashing with bcrypt
- Role-based access control (Buyer/Seller/Admin)
- Protected API routes with token verification

### Database Schema

**Users Collection:**
- Basic info: name, email, password (hashed), phone
- Address: street, city, state, pincode
- Account: userType (buyer/seller/admin), created/updated dates

**Products Collection:**
- Details: title, description, price, category
- Seller info: reference to seller user
- Location: city, state, pincode
- Availability and tags
- Reviews with ratings

**Messages Collection:**
- Sender and receiver references
- Message content with timestamps
- Product reference for context

**Sellers Collection:**
- Shop info: shopName, shopDescription, shopImage
- Verification status
- Bank details (optional)
- Rating and review count

## Demo Credentials

For testing without creating an account:
- **Email**: demo@email.com
- **Password**: password123

## Security Features

- ✓ Password hashing with bcrypt
- ✓ JWT token-based authentication
- ✓ Protected API routes with token verification
- ✓ Input validation and sanitization
- ✓ CORS-ready API structure
- ✓ Secure session management

## Customization

### Change Colors & Theme
Edit `/app/globals.css` to modify design tokens:
```css
:root {
  --primary: #your-color;
  --secondary: #your-color;
  /* ... other tokens ... */
}
```

### Add New Categories
Edit `/components/CategorySelector.js`:
```javascript
const CATEGORIES = [
  { id: 'your-category', name: 'Your Category' },
  // ...
];
```

### Modify Product Fields
Edit `/lib/models/Product.js` to add new fields to the schema.

## Known Limitations

- Image uploads stored as URLs (not file system)
- Messaging is text-only (no file attachments)
- No real-time updates via WebSocket (polling-based)
- Admin features are UI placeholders (backend not implemented)
- Payment integration not included

## Future Enhancements

- [ ] Real-time messaging with WebSocket
- [ ] Image file uploads with Cloudinary/AWS S3
- [ ] Payment integration (Razorpay/Stripe)
- [ ] Ratings and reviews system
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Stripe/Razorpay payment gateway
- [ ] Advanced admin dashboard
- [ ] Analytics and reports
- [ ] Mobile app version

## Troubleshooting

### MongoDB Connection Error
- Verify MONGODB_URI in `.env.local`
- Check MongoDB Atlas whitelist IP
- Ensure database username/password are correct

### Login/Register Issues
- Clear browser localStorage and try again
- Check console for error messages
- Ensure MongoDB is running

### Products Not Loading
- Check MongoDB connection
- Verify database has the `products` collection
- Check browser console for API errors

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Deploy MongoDB
- Use MongoDB Atlas (free tier available)
- Set environment variable in Vercel

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify environment variables are set correctly
3. Review API response in Network tab
4. Check database connection in MongoDB Atlas

## License

This project is open source and available under the MIT License.

## Credits

Built with ❤️ using Next.js, MongoDB, and modern web technologies.
