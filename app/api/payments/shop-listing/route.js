import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/lib/models/Shop';

const mockRazorpay = {
  createOrder: async (amount, currency = 'INR') => {
    return {
      id: `order_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
      status: 'created',
      created_at: new Date(),
    };
  },
};

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

    const { shopId } = await req.json();

    if (!shopId) {
      return NextResponse.json(
        { error: 'Shop ID is required' },
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
        { error: 'Payment already completed for this shop' },
        { status: 400 }
      );
    }

    const amount = 100;
    const razorpayOrder = await mockRazorpay.createOrder(amount);

    shop.payment.razorpayOrderId = razorpayOrder.id;
    await shop.save();

    return NextResponse.json(
      {
        success: true,
        shopId: shop._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_DEMO_KEY',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Shop payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
