import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Shop from '@/lib/models/Shop';
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
    const vendorId = decoded.userId;

    const {
      title,
      description,
      price,
      category,
      subcategory,
      images,
      stock,
      discount,
      location,
      tags,
      contactPerson,
      mobile,
    } = await req.json();

    if (!title || !description || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(vendorId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Auto-upgrade user to vendor if they're listing a product
    if (user.userType !== 'vendor' && user.userType !== 'admin') {
      user.userType = 'vendor';
      await user.save();
    }

    // Count total listings (shops + products) by this user
    const shopCount = await Shop.countDocuments({ seller: vendorId });
    const productCount = await Product.countDocuments({ vendor: vendorId });
    const totalListings = shopCount + productCount;

    // Determine if this listing is free
    const isFree = totalListings < FREE_LISTING_LIMIT;

    const product = new Product({
      title,
      description,
      price: parseFloat(price),
      category,
      subcategory,
      vendor: vendorId,
      images: images || [],
      stock: parseInt(stock) || 0,
      discount: discount || 0,
      location,
      tags,
      contactPerson,
      mobile,
      // Free listings go live immediately; paid listings wait for payment
      status: isFree ? 'active' : 'pending',
      moderation: {
        // Free listings are auto-approved so they appear on home page immediately
        status: isFree ? 'approved' : 'pending',
      },
      payment: {
        amount: isFree ? 0 : LISTING_FEE,
        commission: 0,
        status: isFree ? 'free' : 'pending',
        isFree,
      },
    });

    await product.save();

    return NextResponse.json(
      {
        success: true,
        isFree,
        requiresPayment: !isFree,
        message: isFree
          ? 'Product listed successfully! It is now live on Zubika.'
          : `Pay Rs.${LISTING_FEE} to activate your listing.`,
        product: {
          _id: product._id,
          id: product._id,
          title: product.title,
          price: product.price,
          status: product.status,
          isFree,
          payment: { status: product.payment.status, amount: product.payment.amount },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product/listing error:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
