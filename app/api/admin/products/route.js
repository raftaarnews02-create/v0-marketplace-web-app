import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';

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
    const adminId = decoded.userId;

    await connectDB();

    const admin = await User.findById(adminId);
    if (!admin || admin.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', or 'all'

    let query = {};
    if (status && status !== 'all') {
      query['moderation.status'] = status;
    }

    const products = await Product.find(query)
      .populate('vendor', 'name phone')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        products: products.map(product => ({
          id: product._id,
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          subcategory: product.subcategory,
          images: product.images,
          stock: product.stock,
          location: product.location,
          status: product.status,
          moderationStatus: product.moderation?.status,
          rejectionReason: product.moderation?.rejectionReason,
          vendor: product.vendor,
          createdAt: product.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
