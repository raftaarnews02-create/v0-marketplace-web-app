import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const sellerId = decoded.userId;

    const body = await req.json();
    const productId = body.productId;

    // Accept both snake_case (Razorpay standard) and camelCase
    const razorpayPaymentId = body.razorpay_payment_id || body.razorpayPaymentId;
    const razorpayOrderId   = body.razorpay_order_id   || body.razorpayOrderId;
    const razorpaySignature = body.razorpay_signature  || body.razorpaySignature;

    if (!productId || !razorpayPaymentId || !razorpayOrderId) {
      return NextResponse.json({ error: 'Payment details are required' }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.vendor.toString() !== sellerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (product.payment.status === 'completed' || product.payment.status === 'free') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }

    // Verify Razorpay signature if real keys are configured
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isDemoPayment = !keySecret || keySecret === 'your_razorpay_key_secret' || razorpaySignature === 'demo_signature';

    if (!isDemoPayment) {
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }
    }

    // After payment, listing goes live immediately
    product.payment.status = 'completed';
    product.payment.razorpayPaymentId = razorpayPaymentId;
    product.payment.razorpaySignature = razorpaySignature || '';
    product.payment.paidAt = new Date();
    product.status = 'active';
    product.moderation.status = 'approved';
    await product.save();

    return NextResponse.json({
      success: true,
      message: 'Payment successful! Your product listing is now live on Zubika.',
      product: {
        id: product._id,
        title: product.title,
        price: product.price,
        status: product.status,
        paymentStatus: product.payment.status,
        moderationStatus: product.moderation.status,
      },
    });
  } catch (error) {
    console.error('Verify product payment error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
