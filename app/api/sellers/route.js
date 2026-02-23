import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Seller from '@/lib/models/Seller';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

function verifyToken(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('id');

    if (sellerId) {
      const seller = await Seller.findById(sellerId).populate('user', 'name email phone');
      if (!seller) {
        return NextResponse.json(
          { error: 'Seller not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(seller);
    }

    const sellers = await Seller.find({ isActive: true })
      .populate('user', 'name email phone')
      .limit(20);

    return NextResponse.json({ sellers });
  } catch (error) {
    console.error('Sellers fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = verifyToken(request);
    if (!user || user.userType !== 'seller') {
      return NextResponse.json(
        { error: 'Unauthorized - Seller access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const data = await request.json();

    // Check if seller profile already exists
    const existingSeller = await Seller.findOne({ user: user.userId });
    if (existingSeller) {
      return NextResponse.json(
        { error: 'Seller profile already exists' },
        { status: 400 }
      );
    }

    const seller = new Seller({
      user: user.userId,
      ...data,
    });

    await seller.save();

    return NextResponse.json(
      { message: 'Seller profile created successfully', seller },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seller creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
