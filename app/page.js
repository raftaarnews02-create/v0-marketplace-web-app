'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Search, ShoppingCart, Store, TrendingUp, MapPin, Star, ChevronRight } from 'lucide-react';

const SHOP_CATEGORIES = [
  { id: 1, name: 'Fashion & Apparel', icon: '👕', count: 234 },
  { id: 2, name: 'Electronics', icon: '📱', count: 456 },
  { id: 3, name: 'Home & Garden', icon: '🏠', count: 178 },
  { id: 4, name: 'Health & Beauty', icon: '💄', count: 321 },
  { id: 5, name: 'Sports & Outdoors', icon: '⚽', count: 145 },
  { id: 6, name: 'Books & Media', icon: '📚', count: 89 },
];

const FEATURED_SHOPS = [
  { id: 1, name: 'TechHub Store', category: 'Electronics', rating: 4.8, reviews: 1230, location: 'Mumbai' },
  { id: 2, name: 'Fashion Forward', category: 'Fashion', rating: 4.6, reviews: 890, location: 'Delhi' },
  { id: 3, name: 'Home Essentials', category: 'Home', rating: 4.7, reviews: 650, location: 'Bangalore' },
  { id: 4, name: 'Beauty & Glow', category: 'Beauty', rating: 4.9, reviews: 1100, location: 'Pune' },
];

const FEATURED_PRODUCTS = [
  { id: 1, name: 'Wireless Headphones', shop: 'TechHub Store', price: 2999, rating: 4.5, reviews: 320, image: '🎧' },
  { id: 2, name: 'Cotton T-Shirt Pack', shop: 'Fashion Forward', price: 499, rating: 4.2, reviews: 180, image: '👕' },
  { id: 3, name: 'Yoga Mat Premium', shop: 'Sports Zone', price: 1299, rating: 4.7, reviews: 450, image: '🧘' },
  { id: 4, name: 'LED Desk Lamp', shop: 'Home Essentials', price: 899, rating: 4.4, reviews: 220, image: '💡' },
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('shops');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Store className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Zubika</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search shops, products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-secondary text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Auth */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/cart" className="relative p-2 hover:bg-secondary rounded-lg transition">
                    <ShoppingCart className="w-6 h-6 text-foreground" />
                  </Link>
                  <Link href="/account" className="text-foreground hover:text-primary transition">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/auth/login" className="px-4 py-2 text-primary hover:bg-secondary rounded-lg transition font-medium">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Discover Amazing Shops & Products
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Find verified sellers, browse quality products, and shop with confidence
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {SHOP_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-lg hover:shadow-md hover:border-accent transition"
            >
              <span className="text-4xl mb-3">{cat.icon}</span>
              <h3 className="text-sm font-semibold text-foreground text-center mb-1">{cat.name}</h3>
              <p className="text-xs text-muted-foreground">{cat.count} items</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('shops')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'shops' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Featured Shops
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'products' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Trending Products
          </button>
        </div>

        {/* Featured Shops */}
        {activeTab === 'shops' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_SHOPS.map((shop) => (
              <Link
                key={shop.id}
                href={`/shop/${shop.id}`}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-accent transition group"
              >
                <div className="bg-secondary h-40 flex items-center justify-center text-6xl group-hover:bg-muted transition">
                  🏪
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">{shop.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{shop.category}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-foreground">{shop.rating}</span>
                      <span className="text-xs text-muted-foreground">({shop.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {shop.location}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Trending Products */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PRODUCTS.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-accent transition group"
              >
                <div className="bg-secondary h-40 flex items-center justify-center text-6xl group-hover:bg-muted transition">
                  {product.image}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{product.shop}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-foreground">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">({product.reviews})</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-primary">₹{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-primary text-primary-foreground py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
            <p className="text-lg opacity-90 mb-8">Join thousands of vendors earning on Zubika. Create your shop or list products today.</p>
            <Link href="/auth/register" className="inline-block px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-secondary transition">
              Get Started Now
            </Link>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-3">✓</div>
            <h3 className="font-semibold text-foreground mb-2">Verified Sellers</h3>
            <p className="text-muted-foreground">All shops and products verified before going live</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">💳</div>
            <h3 className="font-semibold text-foreground mb-2">Secure Payments</h3>
            <p className="text-muted-foreground">Powered by Razorpay for safe transactions</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="font-semibold text-foreground mb-2">Customer Ratings</h3>
            <p className="text-muted-foreground">Real reviews from real buyers</p>
          </div>
        </div>
      </section>
    </main>
  );
}
