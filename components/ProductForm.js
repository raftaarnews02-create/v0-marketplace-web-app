'use client';
import { Loader2 } from 'lucide-react';
import { SERVICE_CATEGORIES } from './ServiceForm';

const SURF2 = '#162a52';
const PRI2  = '#60a5fa';
const T1    = '#e2e8f0';
const BOR   = '#1e3a5f';
const SECTION = { background: '#0f2040', border: '1px solid #1e3a5f' };

const IC = "w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition";
const IS = { background: SURF2, border: '1.5px solid ' + BOR, color: T1 };
const LC = "block text-xs font-semibold mb-1.5 uppercase tracking-wider";
const LS = { color: PRI2 };

export function ProductForm({ prd, onChange, onSubmit, onCancel, loading, nextFree, LISTING_FEE }) {
  return (
    <form onSubmit={onSubmit} className="p-5 space-y-4 sheet-scroll">

      <div className="rounded-xl p-4 space-y-3" style={SECTION}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: PRI2 }}>Product Information</p>

        <div>
          <label className={LC} style={LS}>Product Name *</label>
          <input type="text" name="title" value={prd.title} onChange={onChange} required
            placeholder="e.g. Wedding Photography Package" className={IC} style={IS} />
        </div>

        <div>
          <label className={LC} style={LS}>Category *</label>
          <select name="category" value={prd.category} onChange={onChange} required className={IC} style={IS}>
            {SERVICE_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={LC} style={LS}>Description *</label>
          <textarea name="description" value={prd.description} onChange={onChange} required rows={3}
            placeholder="Describe your product..." className={IC + " resize-none"} style={IS} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LC} style={LS}>Price (Rs.) *</label>
            <input type="number" name="price" value={prd.price} onChange={onChange} required min="0"
              placeholder="999" className={IC} style={IS} />
          </div>
          <div>
            <label className={LC} style={LS}>Stock / Slots</label>
            <input type="number" name="stock" value={prd.stock} onChange={onChange} min="1"
              placeholder="10" className={IC} style={IS} />
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 space-y-3" style={SECTION}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: PRI2 }}>Location & Contact</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LC} style={LS}>City *</label>
            <input type="text" name="location.city" value={prd.location.city} onChange={onChange} required
              placeholder="Mumbai" className={IC} style={IS} />
          </div>
          <div>
            <label className={LC} style={LS}>State *</label>
            <input type="text" name="location.state" value={prd.location.state} onChange={onChange} required
              placeholder="Maharashtra" className={IC} style={IS} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LC} style={LS}>Contact Person</label>
            <input type="text" name="contactPerson" value={prd.contactPerson} onChange={onChange}
              placeholder="Your name" className={IC} style={IS} />
          </div>
          <div>
            <label className={LC} style={LS}>Mobile</label>
            <input type="tel" name="mobile" value={prd.mobile} onChange={onChange}
              placeholder="9876543210" className={IC} style={IS} />
          </div>
        </div>
      </div>

      {/* Submit buttons — pb ensures they're above iOS home indicator */}
      <div className="flex gap-3 pt-1 pb-8">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3.5 rounded-xl text-sm font-semibold border"
          style={{ borderColor: BOR, color: '#94a3b8', background: '#0f2040' }}>
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }}>
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            : nextFree ? '🎉 List for FREE' : `List (Rs.${LISTING_FEE})`
          }
        </button>
      </div>
    </form>
  );
}
