'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Store, Check, X, Search, Filter, MapPin, Phone, User } from 'lucide-react';

export default function AdminShops() {
  const { user } = useAuth();
  const router = useRouter();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [selectedShop, setSelectedShop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      const storedUser = localStorage.getItem('user');
      if (!storedUser || (JSON.parse(storedUser).userType !== 'admin' && JSON.parse(storedUser).role !== 'admin')) {
        router.push('/auth/login');
        return;
      }
    } else if (user.userType !== 'admin' && user.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    fetchShops();
  }, [filter]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/shops?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setShops(data.shops);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (shopId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/shops/moderate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopId,
          status: 'approved',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Shop approved successfully!');
        fetchShops();
      } else {
        alert(data.error || 'Failed to approve shop');
      }
    } catch (error) {
      console.error('Error approving shop:', error);
      alert('Failed to approve shop');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (shopId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/shops/moderate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopId,
          status: 'rejected',
          rejectionReason,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Shop rejected!');
        setShowModal(false);
        setRejectionReason('');
        fetchShops();
      } else {
        alert(data.error || 'Failed to reject shop');
      }
    } catch (error) {
      console.error('Error rejecting shop:', error);
      alert('Failed to reject shop');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (shop) => {
    setSelectedShop(shop);
    setShowModal(true);
  };

  // Check if user is admin
  const isAdmin = user?.userType === 'admin' || user?.role === 'admin';
  const hasStoredUser = typeof window !== 'undefined' && localStorage.getItem('user');

  if (!isAdmin && !hasStoredUser) {
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
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Shops Management</h1>
              <p className="text-sm text-muted-foreground">Review and approve shop listings</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Shops List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <Store size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No shops found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Shop Image */}
                  <div className="w-full md:w-48 h-48 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {shop.images && shop.images.length > 0 ? (
                      <img
                        src={shop.images[0]}
                        alt={shop.shopName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store size={48} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Shop Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{shop.shopName}</h3>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          shop.moderationStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          shop.moderationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {shop.moderationStatus?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {shop.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={14} />
                        <span>{shop.location?.city}, {shop.location?.state}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User size={14} />
                        <span>{shop.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone size={14} />
                        <span>{shop.mobile}</span>
                      </div>
                    </div>

                    {/* Seller Info */}
                    {shop.seller && (
                      <div className="mt-3 pt-3 border-t border-border text-sm">
                        <span className="text-muted-foreground">Seller: </span>
                        <span className="font-medium">{shop.seller.name} ({shop.seller.phone})</span>
                      </div>
                    )}

                    {/* Actions */}
                    {shop.moderationStatus === 'pending' && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleApprove(shop.id)}
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <Check size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(shop)}
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <X size={16} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Shop</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejecting "{selectedShop?.shopName}"
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground resize-none h-24"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setRejectionReason('');
                  setSelectedShop(null);
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedShop?.id)}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
