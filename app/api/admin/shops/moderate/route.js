import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/lib/models/Shop';
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

    const { shopId, status, rejectionReason } = await req.json();

    if (!shopId || !status) {
      return NextResponse.json(
        { error: 'Shop ID and status are required' },
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

    const admin = await User.findById(adminId);
    if (!admin || admin.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    shop.moderation = {
      status,
      rejectionReason: status === 'rejected' ? rejectionReason : null,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    };

    if (status === 'approved') {
      shop.status = 'active';
      shop.isVerified = true;
    } else if (status === 'rejected') {
      shop.status = 'rejected';
      shop.isVerified = false;
    }

    await shop.save();

    return NextResponse.json(
      {
        success: true,
        message: `Shop ${status} successfully`,
        shop: {
          id: shop._id,
          shopName: shop.shopName,
          status: shop.status,
          moderationStatus: shop.moderation.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Moderate shop error:', error);
    return NextResponse.json(
      { error: 'Failed to moderate shop' },
      { status: 500 }
    );
  }
}
