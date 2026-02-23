'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Users, Package, MessageSquare, TrendingUp, Ban, CheckCircle, Store, ShoppingBag } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalSellers: 0,
    totalMessages: 0,
  });

  useEffect(() => {
    // Check if user is admin - check both userType and role
    if (!user) {
      // Try to get user from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.userType !== 'admin' && parsedUser.role !== 'admin') {
          router.push('/auth/login');
          return;
        }
      } else {
        router.push('/auth/login');
        return;
      }
    } else if (user.userType !== 'admin' && user.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // In a real app, you would fetch from admin API endpoints
        setStats({
          totalUsers: 0,
          totalProducts: 0,
          totalSellers: 0,
          totalMessages: 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Check if user is admin
  const isAdmin = user?.userType === 'admin' || user?.role === 'admin';
  
  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-2">Access Denied</p>
          <p className="text-muted-foreground mb-4">You need admin privileges to access this page</p>
          <Link href="/" className="text-primary font-medium hover:underline">
            Go Back Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
              </div>
              <Users size={32} className="text-primary/20" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Products</p>
                <p className="text-3xl font-bold text-primary">{stats.totalProducts}</p>
              </div>
              <Package size={32} className="text-primary/20" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Active Sellers</p>
                <p className="text-3xl font-bold text-primary">{stats.totalSellers}</p>
              </div>
              <TrendingUp size={32} className="text-primary/20" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Messages</p>
                <p className="text-3xl font-bold text-primary">{stats.totalMessages}</p>
              </div>
              <MessageSquare size={32} className="text-primary/20" />
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shops Pending Review */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Store size={24} className="text-yellow-600" />
              <h2 className="text-lg font-semibold text-foreground">Shops Pending Review</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Review and approve shop listings submitted by sellers
            </p>
            <Link 
              href="/admin/shops" 
              className="block w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium text-center"
            >
              View Pending Shops
            </Link>
          </div>

          {/* Products Pending Review */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag size={24} className="text-yellow-600" />
              <h2 className="text-lg font-semibold text-foreground">Products Pending Review</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Review and approve product listings submitted by sellers
            </p>
            <Link 
              href="/admin/products" 
              className="block w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium text-center"
            >
              View Pending Products
            </Link>
          </div>

          {/* Users Management */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users size={24} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Users Management</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage all registered users, handle ban/unban requests
            </p>
            <button className="w-full px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium">
              View All Users
            </button>
          </div>

          {/* Sellers Management */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={24} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Sellers Management</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Verify seller accounts, manage seller status and ratings
            </p>
            <button className="w-full px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium">
              All Sellers
            </button>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-2">Admin Features (Coming Soon)</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Real-time analytics and insights</li>
            <li>✓ Advanced user filtering and search</li>
            <li>✓ Automated moderation rules</li>
            <li>✓ Payment and dispute management</li>
            <li>✓ System notifications and alerts</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
