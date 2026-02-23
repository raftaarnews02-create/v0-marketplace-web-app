import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';

export async function PUT(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const userId = decoded.userId;

    const { id } = params;
    const updates = await req.json();

    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (product.vendor.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Allowed fields to update
    const allowedFields = ['title', 'description', 'price', 'discount', 'stock', 'tags', 'images'];

    for (const field of allowedFields) {
      if (field in updates) {
        if (field === 'price' || field === 'stock' || field === 'discount') {
          product[field] = parseFloat(updates[field]);
        } else {
          product[field] = updates[field];
        }
      }
    }

    product.updatedAt = new Date();
    await product.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Product updated successfully',
        product: {
          id: product._id,
          title: product.title,
          price: product.price,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
