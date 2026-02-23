import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/lib/models/Shop';

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

    const { shopId, razorpayPaymentId, razorpayOrderId } = await req.json();

    if (!shopId || !razorpayPaymentId || !razorpayOrderId) {
      return NextResponse.json(
        { error: 'Payment details are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const shop = await Shop.findById(shopId);

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    if (shop.seller.toString() !== sellerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (shop.payment.status === 'completed') {
      return NextResponse.json(
        { error: 'Payment already completed' },
        { status: 400 }
      );
    }

    shop.payment.status = 'completed';
    shop.payment.razorpayPaymentId = razorpayPaymentId;
    shop.payment.paidAt = new Date();
    shop.status = 'under_review';
    shop.moderation.status = 'pending';
    await shop.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Payment successful. Your shop is now under review.',
        shop: {
          id: shop._id,
          shopName: shop.shopName,
          status: shop.status,
          paymentStatus: shop.payment.status,
          moderationStatus: shop.moderation.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify shop payment error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
