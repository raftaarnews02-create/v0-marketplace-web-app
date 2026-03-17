import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/lib/models/Shop';
import Product from '@/lib/models/Product';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const type     = searchParams.get('type');     // 'shops' | 'products' | 'all'
    const category = searchParams.get('category'); // optional category filter
    const page     = parseInt(searchParams.get('page') || '1');
    const limit    = parseInt(searchParams.get('limit') || '50');
    const skip     = (page - 1) * limit;

    // A listing is visible if:
    //   • it's a free listing that was auto-approved, OR
    //   • the seller paid and the listing was approved
    // Either way: status === 'active' && moderation.status === 'approved'
    const baseShopFilter = {
      status: 'active',
      isActive: true,
      'moderation.status': 'approved',
    };

    const baseProductFilter = {
      status: 'active',
      'moderation.status': 'approved',
    };

    if (category) {
      baseShopFilter.category    = category;
      baseProductFilter.category = category;
    }

    let shops    = [];
    let products = [];

    if (type === 'shops' || type === 'all') {
      shops = await Shop.find(baseShopFilter)
        .populate('seller', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }

    if (type === 'products' || type === 'all') {
      products = await Product.find(baseProductFilter)
        .populate('vendor', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }

    return NextResponse.json(
      {
        success: true,
        page,
        shops: shops.map(shop => ({
          _id: shop._id,
          id: shop._id,
          shopName: shop.shopName,
          category: shop.category,
          description: shop.description,
          location: shop.location,
          contactPerson: shop.contactPerson,
          mobile: shop.mobile,
          whatsapp: shop.whatsapp,
          images: shop.images,
          rating: shop.rating,
          ratingCount: shop.ratingCount,
          seller: shop.seller,
          createdAt: shop.createdAt,
        })),
        products: products.map(product => ({
          _id: product._id,
          id: product._id,
          title: product.title,
          description: product.description,
          price: product.price,
          discount: product.discount,
          category: product.category,
          subcategory: product.subcategory,
          images: product.images,
          rating: product.rating,
          ratingCount: product.ratingCount,
          stock: product.stock,
          location: product.location,
          vendor: product.vendor,
          createdAt: product.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get home data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
