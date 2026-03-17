import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/lib/models/Shop';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';

const FREE_LISTING_LIMIT = 2;
const LISTING_FEE = 99;

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const sellerId = decoded.userId;

    const {
      shopName,
      category,
      description,
      location,
      contactPerson,
      mobile,
      whatsapp,
      images,
      documents,
      serviceDetails,
    } = await req.json();

    if (!shopName || !category || !description || !location?.city || !location?.state || !contactPerson || !mobile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(sellerId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Auto-upgrade user to vendor if they're listing a service
    if (user.userType !== 'vendor' && user.userType !== 'admin') {
      user.userType = 'vendor';
      await user.save();
    }

    // Count total listings (shops + products) by this user
    const shopCount = await Shop.countDocuments({ seller: sellerId });
    const productCount = await Product.countDocuments({ vendor: sellerId });
    const totalListings = shopCount + productCount;

    // Determine if this listing is free
    const isFree = totalListings < FREE_LISTING_LIMIT;

    const shop = new Shop({
      seller: sellerId,
      shopName,
      category,
      description,
      location,
      contactPerson,
      mobile,
      whatsapp,
      images: images || [],
      documents: documents || [],
      serviceDetails: serviceDetails || {},
      // Free listings go live immediately; paid listings wait for payment
      status: isFree ? 'active' : 'pending',
      isActive: isFree,
      isFree,
      payment: {
        amount: isFree ? 0 : LISTING_FEE,
        status: isFree ? 'free' : 'pending',
      },
      moderation: {
        // Free listings are auto-approved so they appear on home page immediately
        status: isFree ? 'approved' : 'pending',
      },
    });

    await shop.save();

    return NextResponse.json(
      {
        success: true,
        isFree,
        requiresPayment: !isFree,
        message: isFree
          ? 'Service listed successfully! It is now live on Zubika.'
          : `Pay Rs.${LISTING_FEE} to activate your listing.`,
        shop: {
          _id: shop._id,
          id: shop._id,
          shopName: shop.shopName,
          category: shop.category,
          status: shop.status,
          isFree,
          payment: { status: shop.payment.status, amount: shop.payment.amount },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create service listing error:', error);
    return NextResponse.json({ error: 'Failed to create service listing' }, { status: 500 });
  }
}
