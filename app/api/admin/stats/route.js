import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Payment from '@/lib/models/Payment';
import Vendor from '@/lib/models/Vendor';

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

    // Check if user is admin
    const admin = await User.findById(adminId);
    if (!admin || admin.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get statistics
    const totalCustomers = await User.countDocuments({ userType: 'customer' });
    const totalVendors = await User.countDocuments({ userType: 'vendor' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const pendingProducts = await Product.countDocuments({
      'moderation.status': 'pending',
    });

    const pendingVendors = await Vendor.countDocuments({
      verificationStatus: 'pending',
    });

    // Revenue stats
    const completedPayments = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalRevenue = completedPayments.length > 0 ? completedPayments[0].total : 0;

    // Commission calculation (1%)
    const totalCommission = totalRevenue * 0.01;

    // Top vendors
    const topVendors = await Vendor.find()
      .sort({ totalRevenue: -1 })
      .limit(5)
      .select('businessName totalRevenue totalOrders rating');

    // Recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalCustomers,
          totalVendors,
          totalProducts,
          totalOrders,
          pendingProducts,
          pendingVendors,
          totalRevenue,
          totalCommission,
        },
        topVendors,
        recentOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
