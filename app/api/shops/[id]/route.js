import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/lib/models/Shop';

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
