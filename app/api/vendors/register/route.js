import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Vendor from '@/lib/models/Vendor';

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
    const userId = decoded.userId;

    const {
      businessName,
      businessType,
      gstNumber,
      panNumber,
      businessAddress,
      bankDetails,
    } = await req.json();

    if (!businessName) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user exists and is not already a vendor
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already vendor
    const existingVendor = await Vendor.findOne({ user: userId });
    if (existingVendor) {
      return NextResponse.json(
        { error: 'You are already registered as a vendor' },
        { status: 400 }
      );
    }

    // Create vendor profile
    const vendor = new Vendor({
      user: userId,
      businessName,
      businessType: businessType || 'individual',
      gstNumber,
      panNumber,
      businessAddress,
      bankDetails,
      verificationStatus: 'pending',
    });

    await vendor.save();

    // Update user type to vendor
    user.userType = 'vendor';
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Vendor registration submitted for verification',
        vendor: {
          id: vendor._id,
          businessName: vendor.businessName,
          verificationStatus: vendor.verificationStatus,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Vendor registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register as vendor' },
      { status: 500 }
    );
  }
}
