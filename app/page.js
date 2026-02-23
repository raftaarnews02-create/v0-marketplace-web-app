'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Search, ShoppingCart, Store, TrendingUp, MapPin, Star, ChevronRight, Loader2 } from 'lucide-react';

const SHOP_CATEGORIES = [
  { id: 1, name: 'Fashion & Apparel', icon: '👕', count: 234 },
  { id: 2, name: 'Electronics', icon: '📱', count: 456 },
  { id: 3, name: 'Home & Garden', icon: '🏠', count: 178 },
  { id: 4, name: 'Health & Beauty', icon: '💄', count: 321 },
  { id: 5, name: 'Sports & Outdoors', icon: '⚽', count: 145 },
  { id: 6, name: 'Books & Media', icon: '📚', count: 89 },
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('shops');
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/home?type=all');
      if (response.ok) {
        const data = await response.json();
        setShops(data.shops || []);
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

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
              href={`/browse?category=${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-lg hover:shadow-md hover:border-accent transition cursor-pointer"
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Featured Shops */}
        {!loading && activeTab === 'shops' && (
          <>
            {shops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {shops.map((shop) => (
                  <Link
                    key={shop.id}
                    href={`/shops/${shop.id}`}
                    className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-accent transition group cursor-pointer"
                  >
                    <div className="h-40 bg-secondary flex items-center justify-center relative overflow-hidden">
                      {shop.images && shop.images.length > 0 ? (
                        <Image
                          src={shop.images[0]}
                          alt={shop.shopName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-6xl">🏪</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{shop.shopName}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{shop.category}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-foreground">{shop.rating || 'New'}</span>
                          <span className="text-xs text-muted-foreground">({shop.ratingCount || 0})</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {shop.location?.city}, {shop.location?.state}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted rounded-lg">
                <Store size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No shops available yet</p>
                <Link href="/auth/register" className="mt-4 inline-block text-primary hover:underline font-medium">
                  Register as a Seller
                </Link>
              </div>
            )}
          </>
        )}

        {/* Trending Products */}
        {!loading && activeTab === 'products' && (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-accent transition group cursor-pointer"
                  >
                    <div className="h-40 bg-secondary flex items-center justify-center relative overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-6xl">📦</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-2 text-sm">{product.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{product.category}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-foreground">{product.rating || 'New'}</span>
                          <span className="text-xs text-muted-foreground">({product.ratingCount || 0})</span>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-primary">₹{product.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted rounded-lg">
                <TrendingUp size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No products available yet</p>
                <Link href="/auth/register" className="mt-4 inline-block text-primary hover:underline font-medium">
                  Register as a Seller
                </Link>
              </div>
            )}
          </>
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
