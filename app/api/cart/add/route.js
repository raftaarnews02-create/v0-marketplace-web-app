import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/lib/models/Cart';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';

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

    const { productId, quantity = 1 } = await req.json();

    if (!productId || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid product or quantity' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.status !== 'active' || product.moderation.status !== 'approved') {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Get or create cart
    let cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      cart = new Cart({ customer: customerId, items: [] });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        vendor: product.vendor,
        quantity,
        price: product.price,
      });
    }

    // Recalculate totals
    let totalItems = 0;
    let totalPrice = 0;

    for (const item of cart.items) {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;
    }

    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    cart.updatedAt = new Date();

    await cart.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Product added to cart',
        cart: {
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
          itemCount: cart.items.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}
