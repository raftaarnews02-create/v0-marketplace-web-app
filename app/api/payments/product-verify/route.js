import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';

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

    const { productId, razorpayPaymentId, razorpayOrderId, commission } = await req.json();

    if (!productId || !razorpayPaymentId || !razorpayOrderId) {
      return NextResponse.json(
        { error: 'Payment details are required' },
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
        { error: 'Payment already completed' },
        { status: 400 }
      );
    }

    product.payment.status = 'completed';
    product.payment.razorpayPaymentId = razorpayPaymentId;
    product.payment.paidAt = new Date();
    // Store commission if provided
    if (commission) {
      product.payment.commission = commission;
    }
    product.status = 'pending';
    product.moderation.status = 'pending';
    await product.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Payment successful. Your product is now under review.',
        product: {
          id: product._id,
          title: product.title,
          price: product.price,
          status: product.status,
          paymentStatus: product.payment.status,
          moderationStatus: product.moderation.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify product payment error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
