import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
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
    const vendorId = decoded.userId;

    const {
      title,
      description,
      price,
      category,
      subcategory,
      images,
      stock,
      discount,
      location,
      tags,
    } = await req.json();

    // Validation
    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user is a vendor
    const user = await User.findById(vendorId);
    if (!user || user.userType !== 'vendor') {
      return NextResponse.json(
        { error: 'You must be a registered vendor to add products' },
        { status: 403 }
      );
    }

    // Create product
    const product = new Product({
      title,
      description,
      price: parseFloat(price),
      category,
      subcategory,
      vendor: vendorId,
      images: images || [],
      stock: parseInt(stock) || 0,
      discount: discount || 0,
      location,
      tags,
      status: 'pending',
      moderation: {
        status: 'pending',
      },
      payment: {
        amount: 0,
        commission: 0,
        status: 'pending',
      },
    });

    await product.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully. Please complete the commission payment to submit for review.',
        product: {
          id: product._id,
          title: product.title,
          price: product.price,
          status: product.status,
          moderationStatus: product.moderation.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
