'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Home, Search, Plus, LogIn, MessageCircle } from 'lucide-react';

const BG   = 'rgba(10,22,40,0.97)';
const PRI  = '#3b82f6';
const PRI2 = '#60a5fa';
const ACC  = '#2ED47A';
const T3   = '#64748b';
const BOR  = '#1e3a5f';

export default function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href) => pathname === href;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bottom-nav-safe"
      style={{
        background: BG,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid ' + BOR,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">

        {/* Home */}
        <Link href="/"
          className="flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all relative"
          style={{ color: isActive('/') ? PRI2 : T3 }}>
          {isActive('/') && (
            <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: ACC }} />
          )}
          <Home className="w-5 h-5" strokeWidth={isActive('/') ? 2.5 : 1.8} />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>

        {/* Browse */}
        <Link href="/browse"
          className="flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all relative"
          style={{ color: isActive('/browse') ? PRI2 : T3 }}>
          {isActive('/browse') && (
            <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: ACC }} />
          )}
          <Search className="w-5 h-5" strokeWidth={isActive('/browse') ? 2.5 : 1.8} />
          <span className="text-[10px] font-semibold">Browse</span>
        </Link>

        {/* Sell — center FAB */}
        <Link href={user ? '/sell' : '/auth/register'} className="flex flex-col items-center gap-0.5 -mt-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
              borderColor: '#0a1628',
              boxShadow: '0 4px 20px rgba(59,130,246,0.5)',
            }}>
            <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-semibold" style={{ color: PRI2 }}>
            {user ? 'Sell' : 'List'}
          </span>
        </Link>

        {/* Chat */}
        <Link href="/messages"
          className="flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all relative"
          style={{ color: isActive('/messages') ? PRI2 : T3 }}>
          {isActive('/messages') && (
            <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: ACC }} />
          )}
          <MessageCircle className="w-5 h-5" strokeWidth={isActive('/messages') ? 2.5 : 1.8} />
          <span className="text-[10px] font-semibold">Chat</span>
        </Link>

        {/* Profile / Login */}
        <Link
          href={user ? '/profile' : '/auth/login'}
          className="flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all relative"
          style={{ color: (isActive('/profile') || isActive('/auth/login')) ? PRI2 : T3 }}>
          {(isActive('/profile') || isActive('/auth/login')) && (
            <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: ACC }} />
          )}
          {user ? (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          ) : (
            <LogIn className="w-5 h-5" strokeWidth={1.8} />
          )}
          <span className="text-[10px] font-semibold">{user ? 'Profile' : 'Login'}</span>
        </Link>

      </div>
    </nav>
  );
}
