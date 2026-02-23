import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/lib/models/Shop';
import Product from '@/lib/models/Product';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'shops', 'products', or 'all'

    let shops = [];
    let products = [];

    if (type === 'shops' || type === 'all') {
      // Fetch approved and active shops
      shops = await Shop.find({
        'moderation.status': 'approved',
        status: 'active',
        isActive: true
      })
        .populate('seller', 'name phone')
        .sort({ createdAt: -1 })
        .limit(8);
    }

    if (type === 'products' || type === 'all') {
      // Fetch approved and active products
      products = await Product.find({
        'moderation.status': 'approved',
        status: 'active',
      })
        .populate('vendor', 'name phone')
        .sort({ createdAt: -1 })
        .limit(12);
    }

    return NextResponse.json(
      {
        success: true,
        shops: shops.map(shop => ({
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
          totalProducts: shop.totalProducts,
          seller: shop.seller,
          createdAt: shop.createdAt,
        })),
        products: products.map(product => ({
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
