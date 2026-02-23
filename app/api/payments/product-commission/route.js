import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';

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

const COMMISSION_RATE = 0.05;

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

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.vendor.toString() !== sellerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (product.payment.status === 'completed') {
      return NextResponse.json(
        { error: 'Payment already completed for this product' },
        { status: 400 }
      );
    }

    const commission = Math.round(product.price * COMMISSION_RATE);
    const razorpayOrder = await mockRazorpay.createOrder(commission);

    product.payment.razorpayOrderId = razorpayOrder.id;
    product.payment.commission = commission;
    await product.save();

    return NextResponse.json(
      {
        success: true,
        productId: product._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        commission: commission,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_DEMO_KEY',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Product commission payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
