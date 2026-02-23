import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const skip = (page - 1) * limit;
    const reviews = await Review.find({ product: productId })
      .populate('customer', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ product: productId });

    return NextResponse.json(
      {
        success: true,
        reviews,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

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
    const customerId = decoded.userId;

    const { productId, orderId, rating, title, comment, images } = await req.json();

    // Validation
    if (!productId || !orderId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify customer made this order
    const order = await Order.findById(orderId);
    if (!order || order.customer.toString() !== customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if product is in the order
    const productInOrder = order.items.some(
      item => item.product.toString() === productId
    );
    if (!productInOrder) {
      return NextResponse.json(
        { error: 'Product not in this order' },
        { status: 400 }
      );
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      product: productId,
      customer: customerId,
      order: orderId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Create review
    const review = new Review({
      product: productId,
      customer: customerId,
      order: orderId,
      rating,
      title,
      comment,
      images,
    });

    await review.save();

    // Update product rating
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.updateOne(
      { _id: productId },
      {
        rating: avgRating,
        ratingCount: allReviews.length,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Review submitted successfully',
        review: {
          id: review._id,
          rating: review.rating,
          title: review.title,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
