import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Payment from '@/lib/models/Payment';

// Note: In production, you'll need to install razorpay package and configure it
// For now, this is a mock implementation
const mockRazorpay = {
  createOrder: async (amount, currency = 'INR') => {
    // In production: const Razorpay = require('razorpay');
    // const instance = new Razorpay({ key_id, key_secret });
    // return instance.orders.create({ amount, currency });
    
    // Mock order for demo
    return {
      id: `order_${Date.now()}`,
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
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
    const customerId = decoded.userId;

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.customer.toString() !== customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await mockRazorpay.createOrder(order.paymentAmount);

    // Save payment record
    const payment = new Payment({
      order: orderId,
      customer: customerId,
      amount: order.paymentAmount,
      method: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
    });

    await payment.save();

    // Update order with razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return NextResponse.json(
      {
        success: true,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_DEMO_KEY',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Razorpay order error:', error);
    return NextResponse.json(
      { error: 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
