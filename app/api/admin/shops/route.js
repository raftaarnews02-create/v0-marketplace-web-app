import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/lib/models/Shop';
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

    const shops = await Shop.find(query)
      .populate('seller', 'name phone')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        shops: shops.map(shop => ({
          id: shop._id,
          shopName: shop.shopName,
          category: shop.category,
          description: shop.description,
          location: shop.location,
          contactPerson: shop.contactPerson,
          mobile: shop.mobile,
          whatsapp: shop.whatsapp,
          images: shop.images,
          status: shop.status,
          paymentStatus: shop.payment?.status,
          moderationStatus: shop.moderation?.status,
          rejectionReason: shop.moderation?.rejectionReason,
          seller: shop.seller,
          createdAt: shop.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get shops error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shops' },
      { status: 500 }
    );
  }
}
