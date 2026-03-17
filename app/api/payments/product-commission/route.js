import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';

const LISTING_FEE = 99;

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'rzp_test_YOUR_KEY_ID') {
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

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Payment already completed for this listing' }, { status: 400 });
    }

    const amountInPaise = LISTING_FEE * 100;
    let razorpayOrderId;

    const razorpay = getRazorpayInstance();

    if (razorpay) {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `product_${product._id}_${Date.now()}`,
        notes: {
          productId: product._id.toString(),
          sellerId,
          type: 'product_listing',
        },
      });
      razorpayOrderId = order.id;
    } else {
      razorpayOrderId = `order_demo_${Date.now()}`;
    }

    product.payment.razorpayOrderId = razorpayOrderId;
    product.payment.amount = LISTING_FEE;
    await product.save();

    return NextResponse.json({
      success: true,
      productId: product._id,
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
      productTitle: product.title,
      listingFee: LISTING_FEE,
    });
  } catch (error) {
    console.error('Product listing payment error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
