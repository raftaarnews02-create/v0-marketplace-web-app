import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/lib/models/Shop';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const sellerId = decoded.userId;

    const {
      shopName,
      category,
      description,
      location,
      contactPerson,
      mobile,
      whatsapp,
      images,
      documents,
    } = await req.json();

    await connectDB();

    const shop = await Shop.findById(id);

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    if (shop.seller.toString() !== sellerId) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only update your own shop' },
        { status: 403 }
      );
    }

    if (shop.payment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Please complete payment before updating shop details' },
        { status: 400 }
      );
    }

    if (shop.moderation.status === 'approved') {
      return NextResponse.json(
        { error: 'Cannot update shop after approval. Contact admin for changes.' },
        { status: 400 }
      );
    }

    if (shopName) shop.shopName = shopName;
    if (category) shop.category = category;
    if (description) shop.description = description;
    if (location) shop.location = location;
    if (contactPerson) shop.contactPerson = contactPerson;
    if (mobile) shop.mobile = mobile;
    if (whatsapp !== undefined) shop.whatsapp = whatsapp;
    if (images) shop.images = images;
    if (documents) shop.documents = documents;

    shop.updatedAt = new Date();
    await shop.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Shop updated successfully',
        shop,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update shop error:', error);
    return NextResponse.json(
      { error: 'Failed to update shop' },
      { status: 500 }
    );
  }
}
