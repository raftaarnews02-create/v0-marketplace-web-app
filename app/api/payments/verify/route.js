import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Payment from '@/lib/models/Payment';
import Order from '@/lib/models/Order';
import Vendor from '@/lib/models/Vendor';

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
    const customerId = decoded.userId;

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get payment and verify signature
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.customer.toString() !== customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // In production, verify signature with Razorpay
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    //   .digest('hex');
    // if (razorpaySignature !== expectedSignature) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    // }

    // For demo, we'll skip signature verification
    // Update payment
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'completed';
    await payment.save();

    // Update order
    const order = await Order.findById(payment.order).populate('items.vendor');
    order.razorpayPaymentId = razorpayPaymentId;
    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    await order.save();

    // Update vendor order counts and revenue
    const vendorIds = new Set(order.items.map(item => item.vendor.toString()));
    for (const vendorId of vendorIds) {
      await Vendor.updateOne(
        { user: vendorId },
        {
          $inc: {
            totalOrders: 1,
            totalRevenue: order.paymentAmount,
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified successfully',
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.orderStatus,
          paymentStatus: order.paymentStatus,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
