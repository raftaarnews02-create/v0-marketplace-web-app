'use client';
import { Trash2, CreditCard, Loader2 } from 'lucide-react';

export default function ListingCard({ item, type, onDelete, onPay, processingPayment }) {
  const pay = item.payment?.status;
  const mod = item.moderation?.status;
  const needsPay = pay !== 'completed' && pay !== 'free';

  let badgeText = 'Pay to Activate';
  let badgeColor = '#3b82f6';
  let badgeBg = 'rgba(59,130,246,0.15)';
  if (!needsPay) {
    if (mod === 'approved') { badgeText = 'Live'; badgeColor = '#16a34a'; badgeBg = 'rgba(22,163,74,0.15)'; }
    else { badgeText = 'Under Review'; badgeColor = '#f59e0b'; badgeBg = 'rgba(245,158,11,0.15)'; }
  }

  const name = type === 'service' ? item.shopName : item.title;
  const cat = item.category;
  const city = item.location?.city;
  const state = item.location?.state;
  const desc = item.description;

  return (
    <div className="rounded-xl p-4 border" style={{ background: 'rgba(15,23,41,0.8)', borderColor: '#1e3a5f' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-white text-sm">{name}</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color: badgeColor, background: badgeBg }}>{badgeText}</span>
            {pay === 'free' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-green-400" style={{ background: 'rgba(22,163,74,0.15)' }}>FREE</span>
            )}
          </div>
          <p className="text-xs text-blue-400 mb-1">{cat} • {city}, {state}</p>
          <p className="text-xs text-gray-400 line-clamp-2">{desc}</p>
          {type === 'product' && item.price && (
            <p className="text-sm font-bold text-blue-400 mt-1">Rs.{item.price}</p>
          )}
        </div>
        <button onClick={() => onDelete(item._id)} className="p-2 text-red-400 hover:text-red-300 flex-shrink-0">
          <Trash2 size={16} />
        </button>
      </div>

      {needsPay && (
        <button
          onClick={() => onPay(type, item)}
          disabled={processingPayment === item._id}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
        >
          {processingPayment === item._id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Pay Rs.99 to Activate</span>
          )}
        </button>
      )}
    </div>
  );
}
