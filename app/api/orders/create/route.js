import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Cart from '@/lib/models/Cart';
import User from '@/lib/models/User';
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
    const customerId = decoded.userId;

    const { shippingAddress, paymentMethod = 'razorpay' } = await req.json();

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get cart items
    const cart = await Cart.findOne({ customer: customerId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate totals and commissions
    let totalAmount = 0;
    let totalDiscount = 0;
    let totalCommission = 0;
    const items = [];

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      const quantity = cartItem.quantity;
      const price = cartItem.price;
      const discount = product.discount || 0;

      const itemTotal = price * quantity;
      const itemDiscount = (itemTotal * discount) / 100;
      const commissionAmount = (itemTotal * 1) / 100; // 1% commission

      totalAmount += itemTotal;
      totalDiscount += itemDiscount;
      totalCommission += commissionAmount;

      items.push({
        product: product._id,
        vendor: product.vendor,
        quantity,
        price,
        discount,
        commission: commissionAmount,
      });
    }

    const paymentAmount = totalAmount - totalDiscount;

    // Create order
    const order = new Order({
      customer: customerId,
      items,
      totalAmount,
      totalDiscount,
      totalCommission,
      paymentAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    await order.save();

    // Clear cart
    await Cart.updateOne(
      { customer: customerId },
      { items: [], totalItems: 0, totalPrice: 0 }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          paymentAmount: order.paymentAmount,
          paymentMethod: order.paymentMethod,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
