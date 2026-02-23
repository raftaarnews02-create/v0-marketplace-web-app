'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Store, Package, ShoppingCart, Heart, MessageCircle, Settings, LogOut, Star, MapPin, Phone, User } from 'lucide-react';

export default function Profile() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('listings');
  const [stats, setStats] = useState({
    shops: 0,
    products: 0,
    orders: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800">My Account</h1>
            <button className="p-2 text-gray-600">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Card */}
      <section className="max-w-md mx-auto px-4 py-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">{user.name || 'User'}</h2>
              <p className="text-sm text-gray-500">{user.phone}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full capitalize">
                {user.userType}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-md mx-auto px-4 py-2">
        <div className="grid grid-cols-3 gap-3">
          <Link href="/sell" className="bg-white rounded-xl p-3 shadow-sm text-center">
            <Store className="w-5 h-5 mx-auto text-orange-500 mb-1" />
            <span className="text-lg font-bold text-gray-800">{stats.shops}</span>
            <p className="text-xs text-gray-500">Shops</p>
          </Link>
          <Link href="/sell" className="bg-white rounded-xl p-3 shadow-sm text-center">
            <Package className="w-5 h-5 mx-auto text-green-500 mb-1" />
            <span className="text-lg font-bold text-gray-800">{stats.products}</span>
            <p className="text-xs text-gray-500">Products</p>
          </Link>
          <Link href="/orders" className="bg-white rounded-xl p-3 shadow-sm text-center">
            <ShoppingCart className="w-5 h-5 mx-auto text-blue-500 mb-1" />
            <span className="text-lg font-bold text-gray-800">{stats.orders}</span>
            <p className="text-xs text-gray-500">Orders</p>
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-md mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {user.userType === 'vendor' && (
            <Link href="/sell" className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50">
              <Store className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">My Shop</span>
            </Link>
          )}
          <Link href="/cart" className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">My Cart</span>
          </Link>
          <Link href="/wishlist" className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-700">Wishlist</span>
          </Link>
          <Link href="/messages" className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50">
            <MessageCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Messages</span>
          </Link>
        </div>
      </section>

      {/* Account Settings */}
      <section className="max-w-md mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Edit Profile</span>
          </div>
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
            <MapPin className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Saved Addresses</span>
          </div>
          <div className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer">
            <Phone className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Change Mobile Number</span>
          </div>
        </div>
      </section>

      {/* Logout */}
      <section className="max-w-md mx-auto px-4 py-4">
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 text-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1.5 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between px-4">
          <Link href="/" className="flex flex-col items-center gap-0.5 p-1.5 text-gray-500">
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link href="/browse" className="flex flex-col items-center gap-0.5 p-1.5 text-gray-500">
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-medium">Browse</span>
          </Link>
          <Link href="/sell" className="flex flex-col items-center gap-0.5 -mt-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <span className="w-6 h-6 text-white text-lg font-bold">+</span>
            </div>
            <span className="text-[10px] font-medium text-gray-600">Sell</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-0.5 p-1.5 text-orange-600">
            <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-[10px] font-medium">Account</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
