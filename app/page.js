'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Search, ShoppingCart, Store, TrendingUp, MapPin, Star, ArrowRight, Loader2, Plus, Tag } from 'lucide-react';

const SHOP_CATEGORIES = [
  { id: 1, name: 'Fashion', icon: '👕', count: 234 },
  { id: 2, name: 'Electronics', icon: '📱', count: 456 },
  { id: 3, name: 'Home', icon: '🏠', count: 178 },
  { id: 4, name: 'Beauty', icon: '💄', count: 321 },
  { id: 5, name: 'Sports', icon: '⚽', count: 145 },
  { id: 6, name: 'Books', icon: '📚', count: 89 },
  { id: 7, name: 'Food', icon: '🍔', count: 67 },
  { id: 8, name: 'Services', icon: '🔧', count: 234 },
];

const BANNER_IMAGES = [
  { id: 1, text: 'Big Sale', color: 'from-orange-500 to-red-500' },
  { id: 2, text: 'New Arrivals', color: 'from-blue-500 to-purple-500' },
  { id: 3, text: 'Free Delivery', color: 'from-green-500 to-teal-500' },
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
      router.push(`/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Mobile App Like Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Zubika</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-1.5 text-gray-700">
              <ShoppingCart className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Banner Carousel */}
      <section className="max-w-md mx-auto px-4 py-3">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold mb-1">Start Selling Today!</h2>
              <p className="text-xs opacity-90 mb-2">List your shop or products in minutes</p>
              <Link href="/auth/register" className="inline-flex items-center gap-1 bg-white text-orange-600 px-3 py-1.5 rounded-full text-xs font-semibold">
                <Plus className="w-3 h-3" />
                Sell Now
              </Link>
            </div>
            <div className="text-5xl">🛍️</div>
          </div>
        </div>
      </section>

      {/* Quick Actions - Mobile App Style */}
      <section className="max-w-md mx-auto px-4 py-2">
        <div className="flex gap-2">
          {user ? (
            <>
              <Link href="/sell" className="flex-1 flex items-center justify-center gap-1.5 bg-orange-100 text-orange-700 py-2.5 rounded-lg text-sm font-medium">
                <Store className="w-4 h-4" />
                My Shop
              </Link>
              <Link href="/sell" className="flex-1 flex items-center justify-center gap-1.5 bg-green-100 text-green-700 py-2.5 rounded-lg text-sm font-medium">
                <Plus className="w-4 h-4" />
                Add Product
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="flex-1 flex items-center justify-center gap-1.5 bg-orange-100 text-orange-700 py-2.5 rounded-lg text-sm font-medium">
                Sign In
              </Link>
              <Link href="/auth/register" className="flex-1 flex items-center justify-center gap-1.5 bg-green-100 text-green-700 py-2.5 rounded-lg text-sm font-medium">
                <Plus className="w-4 h-4" />
                Register
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Shop by Category - Mobile App Style */}
      <section className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800">Categories</h2>
          <Link href="/browse" className="text-xs text-orange-600 font-medium flex items-center gap-0.5">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SHOP_CATEGORIES.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              href={`/browse?category=${cat.name.toLowerCase()}`}
              className="flex flex-col items-center justify-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 truncate w-full text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Tabs - Mobile App Style */}
      <section className="max-w-md mx-auto px-4 py-2">
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('shops')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              activeTab === 'shops' ? 'bg-orange-500 text-white' : 'text-gray-600'
            }`}
          >
            🏪 Shops
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              activeTab === 'products' ? 'bg-orange-500 text-white' : 'text-gray-600'
            }`}
          >
            📦 Products
          </button>
        </div>
      </section>

      {/* Content - Mobile App Style */}
      <section className="max-w-md mx-auto px-4 py-3">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        )}

        {/* Featured Shops */}
        {!loading && activeTab === 'shops' && (
          <>
            {shops.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {shops.slice(0, 6).map((shop) => (
                  <Link
                    key={shop.id}
                    href={`/shops/${shop.id}`}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    <div className="h-28 bg-gray-100 relative">
                      {shop.images && shop.images.length > 0 ? (
                        <Image
                          src={shop.images[0]}
                          alt={shop.shopName}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🏪</div>
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{shop.shopName}</h3>
                      <p className="text-xs text-gray-500 mb-1">{shop.category}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium text-gray-700">{shop.rating || 'New'}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-xs text-gray-500">
                          <MapPin className="w-2.5 h-2.5" />
                          {shop.location?.city}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <Store size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm mb-3">No shops yet</p>
                <Link href="/auth/register" className="inline-flex items-center gap-1 text-orange-600 text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  Create Your Shop
                </Link>
              </div>
            )}
          </>
        )}

        {/* Trending Products */}
        {!loading && activeTab === 'products' && (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 6).map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    <div className="h-28 bg-gray-100 relative">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">{product.title}</h3>
                      <p className="text-xs text-gray-500">{product.category}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-orange-600">₹{product.price}</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{product.rating || 'New'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <TrendingUp size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm mb-3">No products yet</p>
                <Link href="/auth/register" className="inline-flex items-center gap-1 text-orange-600 text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  Add Your Product
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* Bottom Navigation - Mobile App Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1.5 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between px-4">
          <Link href="/" className="flex flex-col items-center gap-0.5 p-1.5 text-orange-600">
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link href="/browse" className="flex flex-col items-center gap-0.5 p-1.5 text-gray-500">
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Browse</span>
          </Link>
          <Link href="/sell" className="flex flex-col items-center gap-0.5 -mt-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-medium text-gray-600">Sell</span>
          </Link>
          <Link href={user ? "/profile" : "/auth/login"} className="flex flex-col items-center gap-0.5 p-1.5 text-gray-500">
            {user ? (
              <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            ) : (
              <Tag className="w-5 h-5" />
            )}
            <span className="text-[10px] font-medium">{user ? 'Account' : 'Login'}</span>
          </Link>
        </div>
      </nav>

      {/* Bottom Padding */}
      <div className="h-20"></div>
    </main>
  );
}
