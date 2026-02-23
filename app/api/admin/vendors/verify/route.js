import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Vendor from '@/lib/models/Vendor';
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

    const { vendorId, status, rejectionReason } = await req.json();

    if (!vendorId || !status) {
      return NextResponse.json(
        { error: 'Vendor ID and status are required' },
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

    // Update vendor verification status
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    vendor.verificationStatus = status;
    vendor.rejectionReason = status === 'rejected' ? rejectionReason : null;
    vendor.verifiedAt = status === 'approved' ? new Date() : null;

    await vendor.save();

    return NextResponse.json(
      {
        success: true,
        message: `Vendor ${status} successfully`,
        vendor: {
          id: vendor._id,
          businessName: vendor.businessName,
          verificationStatus: vendor.verificationStatus,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify vendor error:', error);
    return NextResponse.json(
      { error: 'Failed to verify vendor' },
      { status: 500 }
    );
  }
}
