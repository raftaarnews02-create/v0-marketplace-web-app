'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import CategorySelector from '@/components/CategorySelector';
import { Loader } from 'lucide-react';

function BrowseContent() {
  const searchParams = useSearchParams();
  const { products, loading, fetchProducts } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('all');
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
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Browse Services</h1>
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      {/* Sidebar & Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Category Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Categories</h2>
          <CategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Products */}
        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-primary" size={40} />
          </div>
        ) : products.length > 0 ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Found {products.length} services
              {searchQuery && ` matching "${searchQuery}"`}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 py-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              {searchQuery
                ? `No services found for "${searchQuery}"`
                : 'No services found in this category'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-primary hover:underline font-medium"
            >
              Clear filters and try again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function BrowseLoading() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Browse Services</h1>
        </div>
      </header>
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-primary" size={40} />
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
