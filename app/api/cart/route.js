import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/lib/models/Cart';

export async function GET(req) {
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

    await connectDB();

    const cart = await Cart.findOne({ customer: customerId })
      .populate('items.product', 'title price discount images')
      .populate('items.vendor', 'name');

    if (!cart) {
      return NextResponse.json(
        {
          success: true,
          cart: {
            items: [],
            totalItems: 0,
            totalPrice: 0,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        cart: {
          id: cart._id,
          items: cart.items,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
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

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Remove product from cart
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    // Recalculate totals
    let totalItems = 0;
    let totalPrice = 0;

    for (const item of cart.items) {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;
    }

    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    await cart.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Product removed from cart',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
