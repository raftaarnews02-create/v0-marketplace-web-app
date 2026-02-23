'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Star, MapPin, Phone, ArrowLeft, MessageCircle, User, Package } from 'lucide-react';

export default function ShopDetails({ params }) {
  // Unwrap params in Next.js 15
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { user, token } = useAuth();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSending, setMessageSending] = useState(false);

  useEffect(() => {
    if (id) {
      fetchShop();
    }
  }, [id]);

  const fetchShop = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shops/${id}`);
      if (!response.ok) throw new Error('Shop not found');

      const data = await response.json();
      setShop(data.shop);
      
      // Fetch products from this shop
      if (data.shop && data.shop._id) {
        const productsResponse = await fetch(`/api/products?seller=${data.shop.seller?._id}`);
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData.products || []);
        }
      }
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
          receiver: shop.seller._id,
          content: messageText,
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
          <p className="text-muted-foreground">Loading shop...</p>
        </div>
      </main>
    );
  }

  if (error || !shop) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-4">{error || 'Shop not found'}</p>
          <Link href="/" className="text-primary font-medium hover:underline flex items-center gap-2 justify-center">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary hover:underline font-medium"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Shop Hero */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Shop Image */}
            <div className="w-full md:w-48 h-48 bg-card rounded-lg overflow-hidden border border-border flex-shrink-0">
              {shop.images && shop.images.length > 0 ? (
                <Image
                  src={shop.images[0]}
                  alt={shop.shopName}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl bg-muted">
                  🏪
                </div>
              )}
            </div>

            {/* Shop Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{shop.shopName}</h1>
              
              {/* Category Badge */}
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
                {shop.category}
              </span>

              {/* Rating */}
              {shop.rating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < Math.round(shop.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-foreground">{shop.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({shop.ratingCount || 0} reviews)</span>
                </div>
              )}

              {/* Location */}
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MapPin size={18} />
                <span>
                  {shop.location?.city}, {shop.location?.state}
                  {shop.location?.pincode ? ` - ${shop.location.pincode}` : ''}
                </span>
              </div>

              {/* Products Count */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package size={18} />
                <span>{shop.totalProducts || 0} Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Shop Details */}
          <div className="md:col-span-2">
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3">About Shop</h2>
              <p className="text-foreground leading-relaxed">{shop.description}</p>
            </div>

            {/* Products from this shop */}
            {products.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Products from this Shop</h2>
                <div className="grid grid-cols-2 gap-4">
                  {products.slice(0, 6).map((product) => (
                    <Link
                      key={product._id}
                      href={`/product/${product._id}`}
                      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition"
                    >
                      <div className="h-32 bg-muted flex items-center justify-center text-4xl">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder.jpg';
                            }}
                          />
                        ) : (
                          '📦'
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-foreground text-sm line-clamp-1">{product.title}</h3>
                        <p className="text-primary font-bold">₹{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact Info */}
          <div>
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>

              {/* Contact Person */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Contact Person</p>
                <div className="flex items-center gap-2 text-foreground">
                  <User size={16} />
                  <span className="font-medium">{shop.contactPerson}</span>
                </div>
              </div>

              {/* Mobile */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Mobile</p>
                <div className="flex items-center gap-2 text-foreground">
                  <Phone size={16} />
                  <a href={`tel:${shop.mobile}`} className="hover:text-primary">
                    {shop.mobile}
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              {shop.whatsapp && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">WhatsApp</p>
                  <div className="flex items-center gap-2 text-foreground">
                    <a href={`https://wa.me/${shop.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      {shop.whatsapp}
                    </a>
                  </div>
                </div>
              )}

              {/* Address */}
              {shop.location?.fullAddress && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Address</p>
                  <div className="flex items-start gap-2 text-foreground">
                    <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{shop.location.fullAddress}</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-6 pt-6 border-t border-border">
                {user && user.id !== shop.seller?._id ? (
                  <button
                    onClick={() => setMessageModalOpen(true)}
                    className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Message Seller
                  </button>
                ) : !user ? (
                  <Link
                    href="/auth/login"
                    className="block w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-center"
                  >
                    Sign In to Contact
                  </Link>
                ) : null}
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
              Message {shop.contactPerson}
            </h3>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Ask about this shop..."
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
