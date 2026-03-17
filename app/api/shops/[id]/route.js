import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/lib/models/Shop';

function verifyToken(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
  } catch (e) { return null; }
}

export async function DELETE(req, { params }) {
  try {
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const shop = await Shop.findById(id);
    if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

    if (shop.seller.toString() !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await Shop.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Service listing deleted successfully' });
  } catch (error) {
    console.error('Delete shop error:', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    await connectDB();

    const shop = await Shop.findById(id).populate('seller', 'name phone');

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        shop,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get shop error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop' },
      { status: 500 }
    );
  }
}
