'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Search, Star, ArrowRight, Loader2, Plus, ChevronRight, Sparkles, Shield, Zap, Phone } from 'lucide-react';

const SERVICE_CATEGORIES = [
  { id: 1,  name: 'Event Planner',   icon: '🎊', color: '#f472b6' },
  { id: 2,  name: 'Hospitality',     icon: '✈️', color: '#60a5fa' },
  { id: 3,  name: 'Pharmacy',        icon: '💊', color: '#34d399' },
  { id: 4,  name: 'Hospitals',       icon: '🏥', color: '#f87171' },
  { id: 5,  name: 'Gym & Fitness',   icon: '💪', color: '#fb923c' },
  { id: 6,  name: 'Farmhouse',       icon: '🌾', color: '#a3e635' },
  { id: 7,  name: 'Hotel Bookings',  icon: '🏨', color: '#818cf8' },
  { id: 8,  name: 'Corporate',       icon: '💼', color: '#94a3b8' },
  { id: 9,  name: 'Sports',          icon: '⚽', color: '#fbbf24' },
  { id: 10, name: 'Beauty',          icon: '💄', color: '#e879f9' },
  { id: 11, name: 'Food',            icon: '🍔', color: '#fb923c' },
  { id: 12, name: 'Dentists',        icon: '🦷', color: '#2dd4bf' },
  { id: 13, name: 'Driving Schools', icon: '🚗', color: '#60a5fa' },
  { id: 14, name: 'PG & Rentals',    icon: '🏠', color: '#c084fc' },
];

const FEATURES = [
  { icon: <Shield className="w-5 h-5" />, title: 'Verified',      desc: 'All providers verified' },
  { icon: <Zap className="w-5 h-5" />,    title: '2 Free',        desc: 'First 2 listings free' },
  { icon: <Sparkles className="w-5 h-5" />, title: '14 Categories', desc: 'Any service you need' },
];

const BG    = '#0a1628';
const SURF  = '#0f2040';
const SURF2 = '#162a52';
const PRI   = '#3b82f6';
const PRI2  = '#60a5fa';
const ACC   = '#2ED47A';
const T1    = '#e2e8f0';
const T2    = '#94a3b8';
const T3    = '#64748b';
const BOR   = '#1e3a5f';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery]       = useState('');
  const [activeTab, setActiveTab]           = useState('services');
  const [shops, setShops]                   = useState([]);
  const [products, setProducts]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedCategory
        ? `/api/home?type=all&category=${encodeURIComponent(selectedCategory)}`
        : '/api/home?type=all';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setShops(data.shops || []);
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  // Fetch on mount and whenever category changes
  useEffect(() => { fetchHomeData(); }, [fetchHomeData]);

  // Refresh when the page regains focus (e.g. user returns from /sell)
  useEffect(() => {
    const onFocus = () => fetchHomeData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchHomeData]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push('/browse?search=' + encodeURIComponent(searchQuery));
  };

  const toggleCategory = (name) => {
    setSelectedCategory(prev => prev === name ? null : name);
  };

  const catIcon = (name) =>
    SERVICE_CATEGORIES.find(c => c.name === name)?.icon || '🏢';

  return (
    <main className="min-h-screen pb-24" style={{ background: BG }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40"
        style={{ background: 'rgba(10,22,40,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid ' + BOR, boxShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>Z</div>
            <div>
              <span className="text-lg font-bold" style={{ color: PRI2 }}>Zubika</span>
              <div className="text-[9px] font-semibold leading-none" style={{ color: ACC }}>SMART MARKETPLACE</div>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xs">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
              style={{ background: SURF2, borderColor: BOR }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: T3 }} />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search services..." className="flex-1 bg-transparent text-sm outline-none min-w-0"
                style={{ color: T1 }} />
            </div>
          </form>

          {user ? (
            <Link href="/profile"
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </Link>
          ) : (
            <Link href="/auth/login"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
              Login
            </Link>
          )}
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section className="max-w-2xl mx-auto px-4 pt-5 pb-2">
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d2a5e 0%, #1d4ed8 60%, #0f5a3a 100%)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '1px solid ' + BOR }}>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{ background: 'rgba(46,212,122,0.15)', color: ACC, border: '1px solid rgba(46,212,122,0.3)' }}>
              <Sparkles className="w-3 h-3" /> India's Smart Service Platform
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Find Any Service,<br />Anywhere in India</h1>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
              14 categories · Verified providers · Instant connect
            </p>
            <div className="flex gap-2">
              <Link href={user ? '/sell' : '/auth/register'}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                List Free →
              </Link>
              <Link href="/browse"
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: ACC, color: '#0a1628' }}>
                Browse Services
              </Link>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10" style={{ background: ACC }} />
          <div className="absolute -right-4 -bottom-6 w-20 h-20 rounded-full opacity-10" style={{ background: PRI2 }} />
        </div>
      </section>

      {/* ── Feature Pills ── */}
      <section className="max-w-2xl mx-auto px-4 py-3">
        <div className="grid grid-cols-3 gap-2">
          {FEATURES.map((f, i) => (
            <div key={i} className="rounded-xl p-3 text-center hover-lift"
              style={{ background: SURF, border: '1px solid ' + BOR, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                style={{ background: 'rgba(59,130,246,0.15)', color: PRI2 }}>
                {f.icon}
              </div>
              <p className="text-xs font-semibold" style={{ color: T1 }}>{f.title}</p>
              <p className="text-[10px]" style={{ color: T3 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Service Categories ── */}
      <section className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold" style={{ color: T1 }}>Browse by Category</h2>
          {selectedCategory && (
            <button onClick={() => setSelectedCategory(null)} className="text-xs font-semibold px-2 py-1 rounded-lg"
              style={{ color: PRI2, background: 'rgba(59,130,246,0.1)' }}>
              Clear filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SERVICE_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => toggleCategory(cat.name)}
              className="rounded-xl p-2.5 text-center transition-all hover-lift"
              style={{
                background: selectedCategory === cat.name
                  ? `rgba(${hexToRgb(cat.color)},0.15)`
                  : SURF,
                border: selectedCategory === cat.name
                  ? '2px solid ' + cat.color
                  : '1px solid ' + BOR,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}>
              <div className="text-2xl mb-1">{cat.icon}</div>
              <p className="text-[9px] font-semibold leading-tight"
                style={{ color: selectedCategory === cat.name ? cat.color : T2 }}>
                {cat.name}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Listings ── */}
      <section className="max-w-2xl mx-auto px-4 py-3">

        {/* Tab bar */}
        <div className="flex gap-2 mb-4">
          {['services', 'products'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={activeTab === tab
                ? { background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: '#fff', boxShadow: '0 4px 12px rgba(59,130,246,0.4)' }
                : { background: SURF, color: T2, border: '1px solid ' + BOR }
              }>
              {tab === 'services'
                ? `🏢 Services${selectedCategory ? '' : ''}`
                : `📦 Products`}
            </button>
          ))}
          {/* Quick add button */}
          <Link href={user ? '/sell' : '/auth/register'}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
            <Plus className="w-3.5 h-3.5" />
            Add
          </Link>
        </div>

        {selectedCategory && (
          <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <span className="text-lg">{catIcon(selectedCategory)}</span>
            <span className="text-sm font-semibold" style={{ color: PRI2 }}>{selectedCategory}</span>
            <span className="text-xs ml-1" style={{ color: T3 }}>— filtered</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRI }} />
            <p className="text-sm" style={{ color: T3 }}>Loading listings…</p>
          </div>
        ) : (
          <>
            {/* ── Services Tab ── */}
            {activeTab === 'services' && (
              <>
                {shops.length > 0 ? (
                  <div className="space-y-3">
                    {shops.map(shop => (
                      <Link key={shop._id || shop.id} href={'/shops/' + (shop._id || shop.id)}
                        className="block rounded-2xl p-4 hover-lift transition-all"
                        style={{ background: SURF, border: '1px solid ' + BOR, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ background: SURF2 }}>
                            {catIcon(shop.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <h3 className="font-semibold text-sm truncate" style={{ color: T1 }}>{shop.shopName}</h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
                                style={{ background: 'rgba(46,212,122,0.15)', color: ACC }}>
                                ✓ Live
                              </span>
                            </div>
                            <p className="text-xs mb-1" style={{ color: PRI2 }}>{shop.category}</p>
                            <p className="text-xs line-clamp-2" style={{ color: T3 }}>{shop.description}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="text-xs" style={{ color: T3 }}>
                                📍 {shop.location?.city}, {shop.location?.state}
                              </span>
                              {shop.rating > 0 && (
                                <span className="flex items-center gap-0.5 text-xs" style={{ color: T3 }}>
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{shop.rating}
                                </span>
                              )}
                              {shop.mobile && (
                                <a href={`tel:${shop.mobile}`} onClick={e => e.stopPropagation()}
                                  className="flex items-center gap-0.5 text-xs font-semibold"
                                  style={{ color: ACC }}>
                                  <Phone className="w-3 h-3" /> Call
                                </a>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: T3 }} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    emoji="🏢"
                    title={selectedCategory ? `No ${selectedCategory} services yet` : 'No services listed yet'}
                    subtitle={selectedCategory ? 'Be the first to list in this category!' : 'Be the first to list your service!'}
                    href={user ? '/sell' : '/auth/register'}
                    btnLabel="List Your Service Free"
                  />
                )}
              </>
            )}

            {/* ── Products Tab ── */}
            {activeTab === 'products' && (
              <>
                {products.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {products.map(product => (
                      <Link key={product._id || product.id} href={'/product/' + (product._id || product.id)}
                        className="rounded-2xl overflow-hidden hover-lift"
                        style={{ background: SURF, border: '1px solid ' + BOR }}>
                        <div className="h-28 relative" style={{ background: SURF2 }}>
                          {product.images?.length > 0 ? (
                            <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              {catIcon(product.category)}
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-2 mb-1" style={{ color: T1 }}>{product.title}</h3>
                          <p className="text-xs mb-1" style={{ color: PRI2 }}>{product.category}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm" style={{ color: ACC }}>₹{product.price}</span>
                            {product.rating > 0 && (
                              <span className="flex items-center gap-0.5 text-xs" style={{ color: T3 }}>
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{product.rating}
                              </span>
                            )}
                          </div>
                          {product.location?.city && (
                            <p className="text-[10px] mt-1 truncate" style={{ color: T3 }}>
                              📍 {product.location.city}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    emoji="📦"
                    title={selectedCategory ? `No ${selectedCategory} products yet` : 'No products listed yet'}
                    subtitle={selectedCategory ? 'Be the first to list in this category!' : 'First 2 listings are FREE!'}
                    href={user ? '/sell' : '/auth/register'}
                    btnLabel="Add Your Product"
                  />
                )}
              </>
            )}
          </>
        )}
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-2xl mx-auto px-4 py-3 pb-6">
        <div className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(46,212,122,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(46,212,122,0.25)' }}>
          <div className="text-3xl">🚀</div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: ACC }}>List Your Service — First 2 FREE!</p>
            <p className="text-xs" style={{ color: T2 }}>Join thousands of service providers on Zubika</p>
          </div>
          <Link href={user ? '/sell' : '/auth/register'}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
            Start Now
          </Link>
        </div>
      </section>
    </main>
  );
}

function EmptyState({ emoji, title, subtitle, href, btnLabel }) {
  return (
    <div className="rounded-2xl p-10 text-center" style={{ background: '#0f2040', border: '1px solid #1e3a5f' }}>
      <div className="text-5xl mb-3">{emoji}</div>
      <p className="font-semibold mb-1" style={{ color: '#e2e8f0' }}>{title}</p>
      <p className="text-sm mb-4" style={{ color: '#64748b' }}>{subtitle}</p>
      <Link href={href}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
        <Plus className="w-4 h-4" /> {btnLabel}
      </Link>
    </div>
  );
}
