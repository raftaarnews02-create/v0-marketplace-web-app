'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import { ShoppingCart, Heart, Star, Zap, Shield } from 'lucide-react';

const FEATURED_PRODUCTS = [
  { id: 1, title: 'Premium Wireless Headphones', price: 2999, rating: 4.5, vendor: 'TechGear', discount: 20 },
  { id: 2, title: 'Cotton T-Shirt', price: 499, rating: 4.2, vendor: 'StyleHub', discount: 15 },
  { id: 3, title: 'Stainless Steel Water Bottle', price: 799, rating: 4.7, vendor: 'EcoProducts', discount: 10 },
  { id: 4, title: 'LED Desk Lamp', price: 1299, rating: 4.4, vendor: 'LightWorks', discount: 25 },
];

const CATEGORIES = [
  { name: 'Electronics', emoji: '📱' },
  { name: 'Fashion', emoji: '👕' },
  { name: 'Home', emoji: '🏠' },
  { name: 'Books', emoji: '📚' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Beauty', emoji: '💄' },
];

export default function Home() {
  const { user } = useAuth();
  const { products, loading } = useProducts();
  const [featured] = useState(FEATURED_PRODUCTS);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
              Zubika
            </h1>
            {user ? (
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.userType}</p>
              </div>
            ) : (
              <Link href="/auth/login" className="text-slate-400 hover:text-white transition">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Shop from Verified Vendors
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Millions of products, secure payments, fast delivery
          </p>
          <SearchBar placeholder="Search products, vendors..." />
        </div>

        {/* Categories */}
        <div className="mb-16">
          <h3 className="text-xl font-bold text-white mb-6">Shop by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/shop?cat=${cat.name}`}
                className="flex flex-col items-center justify-center p-4 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition"
              >
                <span className="text-3xl mb-2">{cat.emoji}</span>
                <span className="text-sm text-slate-300">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-8">Featured Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-blue-500 transition group"
              >
                <div className="bg-slate-700 h-40 flex items-center justify-center text-4xl group-hover:bg-slate-600">
                  📷
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-white mb-2 line-clamp-2">{product.title}</h4>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-slate-600'}`}
                      />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">{product.rating}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{product.vendor}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">₹{product.price}</span>
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">-{product.discount}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Auth Prompt */}
        {!user && (
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-8 text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-4">Join Zubika Today</h3>
            <p className="text-slate-100 mb-6">Sign up to browse, shop, or sell</p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/login" className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-slate-100">
                Sign In
              </Link>
              <Link href="/auth/register" className="px-6 py-2 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10">
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <Shield className="w-8 h-8 text-blue-500 mb-3" />
            <h4 className="font-semibold text-white mb-2">Secure Payments</h4>
            <p className="text-sm text-slate-400">
              Razorpay integration for safe & instant transactions
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <Zap className="w-8 h-8 text-cyan-500 mb-3" />
            <h4 className="font-semibold text-white mb-2">Verified Vendors</h4>
            <p className="text-sm text-slate-400">
              All sellers verified and rated by customers
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <ShoppingCart className="w-8 h-8 text-green-500 mb-3" />
            <h4 className="font-semibold text-white mb-2">Easy Shopping</h4>
            <p className="text-sm text-slate-400">
              Browse, compare, and checkout in minutes
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
