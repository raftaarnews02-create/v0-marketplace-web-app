'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Store, ShoppingBag, CreditCard, CheckCircle, Loader2, ArrowLeft, Tag, AlertCircle, X } from 'lucide-react';
import { ServiceForm } from '@/components/ServiceForm';
import { ProductForm } from '@/components/ProductForm';

const FREE_LISTING_LIMIT = 2;
const LISTING_FEE = 99;

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const DEMO_KEY = 'rzp_test_YOUR_KEY_ID';

export default function Sell() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('services');
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [toast, setToast] = useState(null);

  const [svcForm, setSvcForm] = useState({
    shopName: '', category: 'Event Planner', description: '',
    location: { city: '', state: '', pincode: '', fullAddress: '' },
    contactPerson: '', mobile: '', whatsapp: '',
    serviceDetails: {},
  });

  const [prdForm, setPrdForm] = useState({
    title: '', description: '', price: '', category: 'Event Planner',
    stock: '', location: { city: '', state: '', pincode: '' },
    contactPerson: '', mobile: '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const totalListings = shops.length + products.length;
  const nextFree = totalListings < FREE_LISTING_LIMIT;

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [sRes, pRes] = await Promise.all([
        fetch('/api/sellers', { headers: { Authorization: 'Bearer ' + token } }),
        fetch('/api/products', { headers: { Authorization: 'Bearer ' + token } }),
      ]);
      if (sRes.ok) { const d = await sRes.json(); setShops(d.shops || []); }
      if (pRes.ok) { const d = await pRes.json(); setProducts(d.products || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
    else if (user) fetchData();
  }, [authLoading, user, fetchData, router]);

  /* ── onChange handlers ── */
  const handleSvcChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const key = name.split('.')[1];
      setSvcForm(p => ({ ...p, location: { ...p.location, [key]: value } }));
    } else if (name.startsWith('serviceDetails.')) {
      const key = name.split('.')[1];
      setSvcForm(p => ({ ...p, serviceDetails: { ...p.serviceDetails, [key]: value } }));
    } else {
      setSvcForm(p => ({ ...p, [name]: value }));
    }
  };

  const handlePrdChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const key = name.split('.')[1];
      setPrdForm(p => ({ ...p, location: { ...p.location, [key]: value } }));
    } else {
      setPrdForm(p => ({ ...p, [name]: value }));
    }
  };

  /* ── Submit service ── */
  const handleSvcSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/shops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(svcForm),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to create listing', 'error'); return; }

      if (data.requiresPayment) {
        await initiatePayment('service', data.shop);
      } else {
        showToast('Service listed successfully!');
        setShowForm(false);
        fetchData();
      }
    } catch (err) {
      showToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ── Submit product ── */
  const handlePrdSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(prdForm),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to create listing', 'error'); return; }

      if (data.requiresPayment) {
        await initiatePayment('product', data.product);
      } else {
        showToast('Product listed successfully!');
        setShowForm(false);
        fetchData();
      }
    } catch (err) {
      showToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ── Razorpay payment ── */
  const initiatePayment = async (type, item) => {
    setProcessingPayment(item._id);
    try {
      const endpoint = type === 'service' ? '/api/payments/shop-listing' : '/api/payments/product-commission';
      const bodyKey = type === 'service' ? 'shopId' : 'productId';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ [bodyKey]: item._id }),
      });
      const orderData = await res.json();
      if (!res.ok) { showToast(orderData.error || 'Payment init failed', 'error'); return; }

      const isDemo = orderData.key === DEMO_KEY || !orderData.key;

      if (isDemo) {
        // Demo mode — simulate payment
        const verifyEndpoint = type === 'service' ? '/api/payments/shop-verify' : '/api/payments/product-verify';
        const vRes = await fetch(verifyEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({
            [bodyKey]: item._id,
            razorpay_order_id: orderData.razorpayOrderId,
            razorpay_payment_id: 'pay_demo_' + Date.now(),
            razorpay_signature: 'demo_signature',
          }),
        });
        if (vRes.ok) {
          showToast('Payment successful! (Demo mode)');
          setShowForm(false);
          fetchData();
        }
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) { showToast('Razorpay failed to load', 'error'); return; }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Zubika',
        description: 'Listing Fee',
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          const verifyEndpoint = type === 'service' ? '/api/payments/shop-verify' : '/api/payments/product-verify';
          const vRes = await fetch(verifyEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({
              [bodyKey]: item._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (vRes.ok) {
            showToast('Payment successful! Listing is live.');
            setShowForm(false);
            fetchData();
          } else {
            showToast('Payment verification failed', 'error');
          }
        },
        prefill: { name: user?.name || '', contact: user?.phone || '' },
        theme: { color: '#1E4F7A' },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      showToast('Payment error', 'error');
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleDeleteShop = async (id) => {
    if (!confirm('Delete this service listing?')) return;
    await fetch('/api/shops/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
    fetchData();
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await fetch('/api/products/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
    fetchData();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a1628' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#3b82f6' }} />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-24" style={{ background: '#0a1628' }}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold"
          style={{ background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(46,212,122,0.15)', color: toast.type === 'error' ? '#f87171' : '#2ED47A', border: '1px solid ' + (toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(46,212,122,0.4)'), backdropFilter: 'blur(12px)' }}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
          <button onClick={() => setToast(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40" style={{ background: 'rgba(10,22,40,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1e3a5f', boxShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1.5 rounded-lg" style={{ color: '#60a5fa' }}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-bold" style={{ color: '#e2e8f0' }}>My Listings</h1>
              <p className="text-xs" style={{ color: '#94a3b8' }}>{totalListings} listing{totalListings !== 1 ? 's' : ''} · {Math.max(0, FREE_LISTING_LIMIT - totalListings)} free remaining</p>
            </div>
          </div>
          <button onClick={() => { setShowForm(true); setFormType(activeTab === 'services' ? 'service' : 'product'); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }}>
            <Plus className="w-4 h-4" />
            {nextFree ? '🎉 Add Free' : 'Add (Rs.' + LISTING_FEE + ')'}
          </button>
        </div>
      </header>

      {/* Free tier banner */}
      {totalListings < FREE_LISTING_LIMIT && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(46,212,122,0.08)', border: '1px solid rgba(46,212,122,0.3)' }}>
            <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#2ED47A' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#2ED47A' }}>
                {FREE_LISTING_LIMIT - totalListings} free listing{FREE_LISTING_LIMIT - totalListings !== 1 ? 's' : ''} remaining!
              </p>
              <p className="text-xs" style={{ color: '#4ade80' }}>After {FREE_LISTING_LIMIT} listings, each costs Rs.{LISTING_FEE} via Razorpay</p>
            </div>
          </div>
        </div>
      )}

      {/* Slide-in Form Panel */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.75)' }}>
          {/* Tap outside to dismiss */}
          <div className="flex-1" onClick={() => setShowForm(false)} />

          {/* Sheet — fills up to 92% of viewport; scrollable internally */}
          <div className="rounded-t-3xl flex flex-col" style={{ background: '#0a1628', maxHeight: '92dvh', height: 'auto' }}>

            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: '#1e3a5f' }} />
            </div>

            {/* Form Header — sticky inside the sheet */}
            <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0" style={{ background: '#0f2040', borderColor: '#1e3a5f' }}>
              <div>
                <h2 className="font-bold text-base" style={{ color: '#e2e8f0' }}>
                  {formType === 'service' ? 'List a Service' : 'List a Product'}
                </h2>
                <p className="text-xs font-semibold" style={{ color: nextFree ? '#2ED47A' : '#60a5fa' }}>
                  {nextFree ? '🎉 FREE listing' : 'Rs.' + LISTING_FEE + ' via Razorpay'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setFormType(formType === 'service' ? 'product' : 'service')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                  style={{ borderColor: '#1e3a5f', color: '#60a5fa', background: '#162a52' }}>
                  Switch to {formType === 'service' ? 'Product' : 'Service'}
                </button>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg" style={{ color: '#94a3b8' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable form body — pb-safe ensures buttons above iOS home bar */}
            <div className="overflow-y-auto flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
              {formType === 'service' ? (
                <ServiceForm svc={svcForm} onChange={handleSvcChange} onSubmit={handleSvcSubmit}
                  onCancel={() => setShowForm(false)} loading={loading} nextFree={nextFree} LISTING_FEE={LISTING_FEE} />
              ) : (
                <ProductForm prd={prdForm} onChange={handlePrdChange} onSubmit={handlePrdSubmit}
                  onCancel={() => setShowForm(false)} loading={loading} nextFree={nextFree} LISTING_FEE={LISTING_FEE} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-2 mb-4">
          {['services', 'products'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={activeTab === tab
                ? { background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: '#fff', boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }
                : { background: '#0f2040', color: '#94a3b8', border: '1px solid #1e3a5f' }
              }>
              {tab === 'services' ? '🏢 Services (' + shops.length + ')' : '📦 Products (' + products.length + ')'}
            </button>
          ))}
        </div>

        {loading && !showForm ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#3b82f6' }} />
          </div>
        ) : (
          <>
            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-3">
                {shops.length > 0 ? shops.map(shop => (
                  <div key={shop._id} className="rounded-2xl p-4" style={{ background: '#0f2040', border: '1px solid #1e3a5f', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>{shop.shopName}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: shop.moderation?.status === 'approved' ? 'rgba(46,212,122,0.15)' : 'rgba(245,158,11,0.15)', color: shop.moderation?.status === 'approved' ? '#2ED47A' : '#fbbf24' }}>
                            {shop.moderation?.status === 'approved' ? '✓ Live' : 'Under Review'}
                          </span>
                          {shop.payment?.status === 'completed' || shop.isFree ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(46,212,122,0.15)', color: '#2ED47A' }}>
                              {shop.isFree ? 'FREE' : 'Paid'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
                              Payment Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs mb-1" style={{ color: '#60a5fa' }}>{shop.category}</p>
                        <p className="text-xs line-clamp-2" style={{ color: '#94a3b8' }}>{shop.description}</p>
                        <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                          📍 {shop.location?.city}, {shop.location?.state}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteShop(shop._id)} className="p-2 rounded-lg flex-shrink-0" style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {!shop.isFree && shop.payment?.status !== 'completed' && (
                      <button onClick={() => initiatePayment('service', shop)} disabled={processingPayment === shop._id}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }}>
                        {processingPayment === shop._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        Pay Rs.{LISTING_FEE} to Activate
                      </button>
                    )}
                  </div>
                )) : (
                  <div className="rounded-2xl p-10 text-center" style={{ background: '#0f2040', border: '1px solid #1e3a5f' }}>
                    <Store className="w-12 h-12 mx-auto mb-3" style={{ color: '#1e3a5f' }} />
                    <p className="font-semibold mb-1" style={{ color: '#e2e8f0' }}>No services listed yet</p>
                    <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>Your first 2 listings are FREE!</p>
                    <button onClick={() => { setShowForm(true); setFormType('service'); }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
                      <Plus className="w-4 h-4" /> Add Service
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-3">
                {products.length > 0 ? products.map(product => (
                  <div key={product._id} className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid #e8f0f8', boxShadow: '0 2px 8px rgba(30,79,122,0.06)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-sm" style={{ color: '#0f1f35' }}>{product.title}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: product.moderation?.status === 'approved' ? '#dcfce7' : '#fef9c3', color: product.moderation?.status === 'approved' ? '#166534' : '#713f12' }}>
                            {product.moderation?.status === 'approved' ? 'Live' : 'Under Review'}
                          </span>
                          {product.payment?.status === 'completed' || product.isFree ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: '#dcfce7', color: '#166534' }}>
                              {product.isFree ? 'Free' : 'Paid'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: '#fef3c7', color: '#92400e' }}>
                              Payment Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs mb-1" style={{ color: '#1E4F7A' }}>{product.category} · Rs.{product.price}</p>
                        <p className="text-xs line-clamp-2" style={{ color: '#5a7a9a' }}>{product.description}</p>
                      </div>
                      <button onClick={() => handleDeleteProduct(product._id)} className="p-2 rounded-lg flex-shrink-0" style={{ color: '#ef4444', background: '#fef2f2' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {!product.isFree && product.payment?.status !== 'completed' && (
                      <button onClick={() => initiatePayment('product', product)} disabled={processingPayment === product._id}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #1E4F7A, #2a6fa8)' }}>
                        {processingPayment === product._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        Pay Rs.{LISTING_FEE} to Activate
                      </button>
                    )}
                  </div>
                )) : (
                  <div className="rounded-2xl p-10 text-center" style={{ background: '#ffffff', border: '1px solid #e8f0f8' }}>
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: '#d0dce8' }} />
                    <p className="font-semibold mb-1" style={{ color: '#0f1f35' }}>No products listed yet</p>
                    <p className="text-sm mb-4" style={{ color: '#5a7a9a' }}>Your first 2 listings are FREE!</p>
                    <button onClick={() => { setShowForm(true); setFormType('product'); }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #1E4F7A, #2a6fa8)' }}>
                      <Plus className="w-4 h-4" /> Add Product
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
