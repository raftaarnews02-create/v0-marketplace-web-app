'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, Trash2, Package, Store, ShoppingBag, ArrowRight, CreditCard, CheckCircle, Loader2 } from 'lucide-react';

const SHOP_CATEGORIES = [
  { value: 'retail', label: 'Retail Store' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'services', label: 'Services' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion & Clothing' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

const PRODUCT_CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home', label: 'Home & Living' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'sports', label: 'Sports' },
  { value: 'toys', label: 'Toys & Games' },
  { value: 'books', label: 'Books' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'food', label: 'Food & Drinks' },
  { value: 'other', label: 'Other' },
];

const COMMISSION_RATE = 0.05; // 5%

export default function Sell() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('shops');
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(null);
  
  // Form data states
  const [shopFormData, setShopFormData] = useState({
    shopName: '',
    category: 'retail',
    description: '',
    location: { city: '', state: '', pincode: '', fullAddress: '' },
    contactPerson: '',
    mobile: '',
    whatsapp: '',
    images: [],
    documents: [],
  });

  const [productFormData, setProductFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'electronics',
    stock: '',
    location: { city: '', state: '', pincode: '' },
    images: [],
    contactPerson: '',
    mobile: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (!authLoading && user && user.userType !== 'vendor') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && token && user.userType === 'vendor') {
      fetchMyListings();
    }
  }, [user, token]);

  const fetchMyListings = async () => {
    try {
      // Fetch shops - using myShops=true to get seller's own shops
      const shopsResponse = await fetch('/api/shops?myShops=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shopsData = await shopsResponse.json();
      if (shopsData.success) {
        setShops(shopsData.shops || []);
      }

      // Fetch products - using seller=true to get seller's own products
      const productsResponse = await fetch('/api/products?seller=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const productsData = await productsResponse.json();
      if (productsData.products) {
        setProducts(productsData.products);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const handleShopFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setShopFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else {
      setShopFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setProductFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else {
      setProductFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/shops/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(shopFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to create shop');
        return;
      }

      alert('Shop created successfully! Please complete the listing fee payment of ₹100.');
      setShowForm(false);
      setFormType(null);
      fetchMyListings();
    } catch (error) {
      console.error('Error creating shop:', error);
      alert('Failed to create shop');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...productFormData,
          price: parseFloat(productFormData.price),
          stock: parseInt(productFormData.stock) || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to create product');
        return;
      }

      alert('Product created successfully! Please complete the commission payment.');
      setShowForm(false);
      setFormType(null);
      fetchMyListings();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (type, item) => {
    try {
      setProcessingPayment(item._id);
      
      if (type === 'shop') {
        // Create Razorpay order for shop listing fee
        const response = await fetch('/api/payments/shop-listing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ shopId: item._id }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          alert(data.error || 'Failed to initiate payment');
          return;
        }

        // Simulate payment success (in production, integrate with Razorpay)
        const verifyResponse = await fetch('/api/payments/shop-verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            shopId: item._id,
            razorpayPaymentId: 'pay_' + Date.now(),
            razorpayOrderId: data.razorpayOrderId,
          }),
        });

        if (verifyResponse.ok) {
          alert('Payment successful! Your shop is now under review for approval.');
          fetchMyListings();
        } else {
          alert('Payment verification failed');
        }
      } else {
        // Create Razorpay order for product commission
        const response = await fetch('/api/payments/product-commission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: item._id }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          alert(data.error || 'Failed to initiate payment');
          return;
        }

        // Calculate commission
        const commission = Math.round(item.price * COMMISSION_RATE);

        // Simulate payment success (in production, integrate with Razorpay)
        const verifyResponse = await fetch('/api/payments/product-verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            productId: item._id,
            razorpayPaymentId: 'pay_' + Date.now(),
            razorpayOrderId: data.razorpayOrderId,
            commission: commission,
          }),
        });

        if (verifyResponse.ok) {
          alert(`Payment successful! Commission of ₹${commission} paid. Your product is now under review.`);
          fetchMyListings();
        } else {
          alert('Payment verification failed');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed');
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (!window.confirm('Are you sure you want to delete this shop?')) return;

    try {
      const response = await fetch(`/api/shops/${shopId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchMyListings();
      }
    } catch (error) {
      console.error('Error deleting shop:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchMyListings();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </main>
    );
  }

  if (!user || user.userType !== 'vendor') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Create Listing
          </button>
        </div>
      </header>

      {/* Create Listing Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create New Listing</h2>
              <p className="text-gray-500 mt-1">Choose what you want to list</p>
            </div>
            
            {!formType ? (
              <div className="p-6 space-y-4">
                <button
                  onClick={() => setFormType('shop')}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex items-center gap-4 text-left"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Store className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">List a Shop</h3>
                    <p className="text-sm text-gray-500">Create a physical or online store</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                </button>

                <button
                  onClick={() => setFormType('product')}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition flex items-center gap-4 text-left"
                >
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">List a Product</h3>
                    <p className="text-sm text-gray-500">Sell individual products or services</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  className="w-full py-3 text-gray-600 hover:text-gray-900 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <form onSubmit={formType === 'shop' ? handleCreateShop : handleCreateProduct} className="p-6 space-y-4">
                <button
                  type="button"
                  onClick={() => setFormType(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 mb-2"
                >
                  ← Back to selection
                </button>

                {formType === 'shop' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
                      <input
                        type="text"
                        name="shopName"
                        value={shopFormData.shopName}
                        onChange={handleShopFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter shop name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        name="category"
                        value={shopFormData.category}
                        onChange={handleShopFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {SHOP_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea
                        name="description"
                        value={shopFormData.description}
                        onChange={handleShopFormChange}
                        required
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your shop"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          name="location.city"
                          value={shopFormData.location.city}
                          onChange={handleShopFormChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Mumbai"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <input
                          type="text"
                          name="location.state"
                          value={shopFormData.location.state}
                          onChange={handleShopFormChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Maharashtra"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                      <input
                        type="text"
                        name="location.fullAddress"
                        value={shopFormData.location.fullAddress}
                        onChange={handleShopFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Complete address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={shopFormData.contactPerson}
                        onChange={handleShopFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Owner name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                        <input
                          type="tel"
                          name="mobile"
                          value={shopFormData.mobile}
                          onChange={handleShopFormChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="9876543210"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                        <input
                          type="tel"
                          name="whatsapp"
                          value={shopFormData.whatsapp}
                          onChange={handleShopFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setShowForm(false); setFormType(null); }}
                        className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? 'Creating...' : 'Create Shop (₹100)'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                      <input
                        type="text"
                        name="title"
                        value={productFormData.title}
                        onChange={handleProductFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Product name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                        <input
                          type="number"
                          name="price"
                          value={productFormData.price}
                          onChange={handleProductFormChange}
                          required
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="999"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                        <input
                          type="number"
                          name="stock"
                          value={productFormData.stock}
                          onChange={handleProductFormChange}
                          required
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        name="category"
                        value={productFormData.category}
                        onChange={handleProductFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {PRODUCT_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea
                        name="description"
                        value={productFormData.description}
                        onChange={handleProductFormChange}
                        required
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Product description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          name="location.city"
                          value={productFormData.location.city}
                          onChange={handleProductFormChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Mumbai"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <input
                          type="text"
                          name="location.state"
                          value={productFormData.location.state}
                          onChange={handleProductFormChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Maharashtra"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        <input
                          type="text"
                          name="contactPerson"
                          value={productFormData.contactPerson}
                          onChange={handleProductFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Contact name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                        <input
                          type="tel"
                          name="mobile"
                          value={productFormData.mobile}
                          onChange={handleProductFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setShowForm(false); setFormType(null); }}
                        className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? 'Creating...' : 'Create Product'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('shops')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'shops' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            My Shops ({shops.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            My Products ({products.length})
          </button>
        </div>

        {/* Shops Tab */}
        {activeTab === 'shops' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shops.length > 0 ? shops.map((shop) => (
              <div key={shop._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{shop.shopName}</h3>
                    <p className="text-sm text-gray-500 capitalize">{shop.category}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{shop.description}</p>
                    
                    {/* Status Badges */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        shop.moderation?.status === 'approved' ? 'bg-green-100 text-green-700' :
                        shop.moderation?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {shop.moderation?.status === 'approved' ? '✅ Live' : 
                         shop.moderation?.status === 'pending' ? '⏳ Under Review' : '❌ Rejected'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        shop.payment?.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {shop.payment?.status === 'completed' ? '✅ Paid' : '💳 Payment Pending'}
                      </span>
                    </div>

                    {/* Payment Button */}
                    {shop.payment?.status !== 'completed' && (
                      <button
                        onClick={() => handlePayment('shop', shop)}
                        disabled={processingPayment === shop._id}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {processingPayment === shop._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        Pay ₹100 Listing Fee
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDeleteShop(shop._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
                <Store size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No shops listed yet</p>
                <button
                  onClick={() => { setShowForm(true); setFormType('shop'); }}
                  className="mt-4 text-blue-600 hover:underline font-medium"
                >
                  Create your first shop
                </button>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.length > 0 ? products.map((product) => (
              <div key={product._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.title}</h3>
                    <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">₹{product.price}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                    
                    {/* Status Badges */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.moderation?.status === 'approved' ? 'bg-green-100 text-green-700' :
                        product.moderation?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.moderation?.status === 'approved' ? '✅ Live' : 
                         product.moderation?.status === 'pending' ? '⏳ Under Review' : '❌ Rejected'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.payment?.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {product.payment?.status === 'completed' ? '✅ Commission Paid' : `💳 Pay ₹${Math.round(product.price * COMMISSION_RATE)}`}
                      </span>
                    </div>

                    {/* Payment Button */}
                    {product.payment?.status !== 'completed' && (
                      <button
                        onClick={() => handlePayment('product', product)}
                        disabled={processingPayment === product._id}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {processingPayment === product._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        Pay Commission (₹{Math.round(product.price * COMMISSION_RATE)})
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
                <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No products listed yet</p>
                <button
                  onClick={() => { setShowForm(true); setFormType('product'); }}
                  className="mt-4 text-blue-600 hover:underline font-medium"
                >
                  Create your first product
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
