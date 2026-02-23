'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import CategorySelector from '@/components/CategorySelector';
import { MapPin, Star, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const { products, loading, fetchProducts } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts({ category: selectedCategory });
  }, [selectedCategory, fetchProducts]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">ServiceHub</h1>
              <p className="text-xs text-muted-foreground">Find local services instantly</p>
            </div>
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.userType}</p>
              </div>
            )}
          </div>

          {/* Search */}
          <SearchBar placeholder="Find services, businesses, or people..." />

          {/* Location */}
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <MapPin size={16} />
            <span>Showing services near you</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {!user ? (
          // Authentication Prompt
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Welcome to ServiceHub</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to browse services, message sellers, or list your own services
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/login"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </div>
          </div>
        ) : null}

        {/* Category Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Browse by Category</h2>
          <CategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Featured Banner */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-6 mb-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Trending This Week</h3>
          <p className="opacity-90 mb-4">Check out the most popular services in your area</p>
          <button className="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
            Explore More
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Products Grid */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {selectedCategory === 'all' ? 'All Services' : 'Services in This Category'}
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg h-64 animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No services found in this category</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="mt-4 text-primary hover:underline font-medium"
              >
                View all services
              </button>
            </div>
          )}
        </div>

        {/* Why ServiceHub */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Star className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Verified Services</h3>
            <p className="text-sm text-muted-foreground">
              All sellers are verified and rated by real users
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Local & Nearby</h3>
            <p className="text-sm text-muted-foreground">
              Find services in your neighborhood instantly
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Star className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Direct Messaging</h3>
            <p className="text-sm text-muted-foreground">
              Chat directly with sellers to discuss details
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
