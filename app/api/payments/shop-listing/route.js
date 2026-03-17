import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/lib/models/Shop';

const LISTING_FEE = 99;

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'rzp_test_YOUR_KEY_ID') {
    // Return mock for demo/development
    return null;
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const sellerId = decoded.userId;

    const { shopId } = await req.json();

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Payment already completed for this listing' }, { status: 400 });
    }

    const amountInPaise = LISTING_FEE * 100;
    let razorpayOrderId;

    const razorpay = getRazorpayInstance();

    if (razorpay) {
      // Real Razorpay order
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `shop_${shop._id}_${Date.now()}`,
        notes: {
          shopId: shop._id.toString(),
          sellerId,
          type: 'service_listing',
        },
      });
      razorpayOrderId = order.id;
    } else {
      // Demo/mock order
      razorpayOrderId = `order_demo_${Date.now()}`;
    }

    shop.payment.razorpayOrderId = razorpayOrderId;
    await shop.save();

    return NextResponse.json({
      success: true,
      shopId: shop._id,
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
      shopName: shop.shopName,
      listingFee: LISTING_FEE,
    });
  } catch (error) {
    console.error('Shop listing payment error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
 