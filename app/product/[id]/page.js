'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Star, MapPin, Phone, Mail, ArrowLeft, MessageCircle } from 'lucide-react';

export default function ProductDetails({ params }) {
  // Unwrap params in Next.js 15
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { user, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSending, setMessageSending] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Product not found');

      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      window.location.href = '/auth/login';
      return;
    }

    if (!messageText.trim()) return;

    try {
      setMessageSending(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver: product.vendor?._id || product.vendor,
          content: messageText,
          product: product._id,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setMessageText('');
      setMessageModalOpen(false);
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setMessageSending(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-4">{error || 'Product not found'}</p>
          <Link href="/browse" className="text-primary font-medium hover:underline flex items-center gap-2 justify-center">
            <ArrowLeft size={18} />
            Back to Browse
          </Link>
        </div>
      </main>
    );
  }

  const imageUrl = product.images?.[0] || '/placeholder.jpg';

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/browse"
            className="flex items-center gap-2 text-primary hover:underline font-medium"
          >
            <ArrowLeft size={18} />
            Back to Browse
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Product Image & Info */}
          <div className="md:col-span-2">
            {/* Image */}
            <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden mb-6">
              <Image
                src={imageUrl}
                alt={product.title}
                fill
                className="object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder.jpg';
                }}
              />
            </div>

            {/* Title & Price */}
            <h1 className="text-3xl font-bold text-foreground mb-4">{product.title}</h1>

            <div className="flex items-center justify-between mb-6">
              <p className="text-3xl font-bold text-primary">₹{product.price}</p>
              {product.rating > 0 && (
                <div className="flex items-center gap-2">
                  <Star size={20} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{product.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.ratingCount || 0} reviews)</span>
                </div>
              )}
            </div>

            {/* Availability Status */}
            <div className="mb-6">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  product.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {product.status === 'active' ? 'Available' : 'Unavailable'}
              </span>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3">Description</h2>
              <p className="text-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {product.location && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin size={18} />
                  Location
                </h3>
                <p className="text-foreground">
                  {product.location.city}
                  {product.location.state ? `, ${product.location.state}` : ''}
                  {product.location.pincode ? ` - ${product.location.pincode}` : ''}
                </p>
              </div>
            )}

            {/* Reviews */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">Reviews</h2>
                <div className="space-y-4">
                  {product.reviews.map((review, idx) => (
                    <div key={idx} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-foreground">
                            {review.user?.name || 'Anonymous'}
                          </p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Seller Info & Actions */}
          <div>
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              {/* Seller Header */}
              <h2 className="text-lg font-semibold text-foreground mb-4">About the Seller</h2>

              {/* Seller Avatar & Name */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {(product.vendor?.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {product.vendor?.name || 'Seller'}
                  </p>
                  <p className="text-xs text-muted-foreground">Verified Seller</p>
                  {product.vendor?.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{product.vendor.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Options */}
              <div className="space-y-2 mb-6">
                {product.vendor?.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone size={16} />
                    {product.vendor.phone}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {user && user.id !== (product.vendor?._id || product.vendor)?._id ? (
                  <>
                    <button
                      onClick={() => setMessageModalOpen(true)}
                      className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} />
                      Message Seller
                    </button>
                  </>
                ) : user && user.id === (product.vendor?._id || product.vendor)?._id ? (
                  <Link
                    href="/sell"
                    className="block w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-center"
                  >
                    Manage This Listing
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="block w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-center"
                    >
                      Sign In to Contact
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {messageModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Message {product.vendor?.name || 'Seller'}
            </h3>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Ask about this product..."
                rows="4"
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={messageSending || !messageText.trim()}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {messageSending ? 'Sending...' : 'Send Message'}
                </button>
                <button
                  type="button"
                  onClick={() => setMessageModalOpen(false)}
                  className="flex-1 bg-secondary text-secondary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
