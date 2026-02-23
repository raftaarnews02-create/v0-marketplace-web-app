import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/lib/models/Shop';
import User from '@/lib/models/User';

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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
    } = await req.json();

    if (!shopName || !category || !description || !location?.city || !location?.state || !contactPerson || !mobile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(sellerId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.userType !== 'vendor') {
      return NextResponse.json(
        { error: 'You must be a seller to create a shop listing' },
        { status: 403 }
      );
    }

    const existingShop = await Shop.findOne({ seller: sellerId });
    if (existingShop) {
      return NextResponse.json(
        { error: 'You already have a shop listing. You can only have one shop.' },
        { status: 400 }
      );
    }

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
      status: 'pending',
      payment: {
        amount: 100,
        status: 'pending',
      },
      moderation: {
        status: 'pending',
      },
    });

    await shop.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Shop created successfully. Please complete payment to submit for review.',
        shop: {
          id: shop._id,
          shopName: shop.shopName,
          category: shop.category,
          status: shop.status,
          paymentStatus: shop.payment.status,
          paymentAmount: shop.payment.amount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create shop error:', error);
    return NextResponse.json(
      { error: 'Failed to create shop' },
      { status: 500 }
    );
  }
}
