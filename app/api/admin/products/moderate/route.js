import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';

export async function PUT(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const adminId = decoded.userId;

    const { productId, status, rejectionReason } = await req.json();

    if (!productId || !status) {
      return NextResponse.json(
        { error: 'Product ID and status are required' },
        { status: 400 }
      );
    }

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user is admin
    const admin = await User.findById(adminId);
    if (!admin || admin.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Update product moderation status
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    product.moderation = {
      status,
      rejectionReason: status === 'rejected' ? rejectionReason : null,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    };

    if (status === 'approved') {
      product.status = 'active';
    } else if (status === 'rejected') {
      product.status = 'inactive';
    }

    await product.save();

    return NextResponse.json(
      {
        success: true,
        message: `Product ${status} successfully`,
        product: {
          id: product._id,
          title: product.title,
          status: product.status,
          moderationStatus: product.moderation.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Moderate product error:', error);
    return NextResponse.json(
      { error: 'Failed to moderate product' },
      { status: 500 }
    );
  }
}
