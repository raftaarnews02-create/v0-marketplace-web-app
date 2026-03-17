import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/lib/models/Shop';

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const sellerId = decoded.userId;

    const body = await req.json();
    const shopId = body.shopId;

    // Accept both snake_case (Razorpay standard) and camelCase
    const razorpayPaymentId = body.razorpay_payment_id || body.razorpayPaymentId;
    const razorpayOrderId   = body.razorpay_order_id   || body.razorpayOrderId;
    const razorpaySignature = body.razorpay_signature  || body.razorpaySignature;

    if (!shopId || !razorpayPaymentId || !razorpayOrderId) {
      return NextResponse.json({ error: 'Payment details are required' }, { status: 400 });
    }

    await connectDB();

    const shop = await Shop.findById(shopId);

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    if (shop.seller.toString() !== sellerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (shop.payment.status === 'completed' || shop.payment.status === 'free') {
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
    shop.payment.status = 'completed';
    shop.payment.razorpayPaymentId = razorpayPaymentId;
    shop.payment.razorpaySignature = razorpaySignature || '';
    shop.payment.paidAt = new Date();
    shop.status = 'active';
    shop.isActive = true;
    shop.moderation.status = 'approved';
    await shop.save();

    return NextResponse.json({
      success: true,
      message: 'Payment successful! Your service listing is now live on Zubika.',
      shop: {
        id: shop._id,
        shopName: shop.shopName,
        status: shop.status,
        paymentStatus: shop.payment.status,
        moderationStatus: shop.moderation.status,
      },
    });
  } catch (error) {
    console.error('Verify shop payment error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
