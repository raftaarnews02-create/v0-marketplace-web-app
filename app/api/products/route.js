import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import jwt from 'jsonwebtoken';

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

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const sellerId = searchParams.get('seller');
    const limit = 12;

    // If seller parameter is provided with a specific ID, return products for that seller
    if (sellerId && sellerId !== 'true') {
      const products = await Product.find({ vendor: sellerId })
        .sort({ createdAt: -1 });

      return NextResponse.json({
        products,
        total: products.length,
      });
    }

    // If seller=true, return products for the authenticated seller
    if (sellerId === 'true') {
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const products = await Product.find({ vendor: user.userId })
        .sort({ createdAt: -1 });

      return NextResponse.json({
        products,
        total: products.length,
      });
    }

    // Public: Return only approved products
    let query = { 
      'moderation.status': 'approved',
      status: 'active'
    };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .populate('vendor', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const data = await request.json();

    const product = new Product({
      ...data,
      seller: user.userId,
    });

    await product.save();

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
