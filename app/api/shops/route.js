import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/lib/models/Shop';

// Middleware to verify token
function verifyToken(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
  } catch (error) {
    return null;
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const seller = searchParams.get('seller');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const approved = searchParams.get('approved');
    const myShops = searchParams.get('myShops');

    await connectDB();

    let query = {};

    // If myShops=true, return shops for the authenticated seller
    if (myShops === 'true') {
      const user = verifyToken(req);
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      query.seller = user.userId;
    } else if (seller) {
      query.seller = seller;
    }
    
    if (approved === 'true') {
      query['moderation.status'] = 'approved';
      query.status = 'active';
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const shops = await Shop.find(query)
      .populate('seller', 'name phone')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        shops,
        count: shops.length,
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
