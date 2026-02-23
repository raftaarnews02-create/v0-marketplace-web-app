'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { Store, Package, Search, Loader } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🔥' },
  { id: 'fashion', name: 'Fashion', icon: '👕' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'home', name: 'Home', icon: '🏠' },
  { id: 'beauty', name: 'Beauty', icon: '💄' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'books', name: 'Books', icon: '📚' },
  { id: 'food', name: 'Food', icon: '🍔' },
  { id: 'services', name: 'Services', icon: '🔧' },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const { products, loading, fetchProducts } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchQuery || undefined,
      page,
    };

    fetchProducts(params).then((data) => {
      if (data) {
        setTotalPages(data.pages);
      }
    });
  }, [selectedCategory, searchQuery, page, fetchProducts]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Link href="/" className="flex items-center gap-1.5">
              <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-800">Zubika</span>
            </Link>
          </div>
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </header>

      {/* Categories */}
      <section className="max-w-md mx-auto px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-md mx-auto px-4 py-2">
        <p className="text-sm text-gray-500 mb-3">
          {products.length} products found
        </p>

        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <Link
                key={product._id}
                href={`/product/${product._id}`}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="h-28 bg-gray-100 relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-gray-800 text-sm line-clamp-2">{product.title}</h3>
                  <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-orange-600">₹{product.price}</span>
                    <span className="text-xs text-gray-500">{product.location?.city}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <Package size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No products found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1.5 text-sm text-gray-500">
              {page}/{totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1.5 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between px-4">
          <Link href="/" className="flex flex-col items-center gap-0.5 p-1.5 text-gray-500">
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link href="/browse" className="flex flex-col items-center gap-0.5 p-1.5 text-orange-600">
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Browse</span>
          </Link>
          <Link href="/sell" className="flex flex-col items-center gap-0.5 -mt-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <span className="w-6 h-6 text-white text-lg font-bold">+</span>
            </div>
            <span className="text-[10px] font-medium text-gray-600">Sell</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-0.5 p-1.5 text-gray-500">
            <span className="text-lg">👤</span>
            <span className="text-[10px] font-medium">Account</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}

function BrowseLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg"></div>
            <div className="w-20 h-5 bg-gray-200 rounded"></div>
          </div>
        </div>
      </header>
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    </main>
  );
}

export default function Browse() {
  return (
    <Suspense fallback={<BrowseLoading />}>
      <BrowseContent />
    </Suspense>
  );
}
