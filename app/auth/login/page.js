'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Phone, ArrowRight, Loader2, ArrowLeft, Shield, Sparkles } from 'lucide-react';

const BG    = '#0a1628';
const SURF  = '#0f2040';
const SURF2 = '#162a52';
const PRI2  = '#60a5fa';
const ACC   = '#2ED47A';
const T1    = '#e2e8f0';
const T2    = '#94a3b8';
const T3    = '#64748b';
const BOR   = '#1e3a5f';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);

  const startTimer = () => {
    setTimer(60);
    const iv = setInterval(() => {
      setTimer(p => { if (p <= 1) { clearInterval(iv); return 0; } return p - 1; });
    }, 1000);
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!phone || phone.length !== 10) { setError('Enter a valid 10-digit number'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to send OTP'); return; }
      setStep('otp'); startTimer();
    } catch { setError('Failed to send OTP. Try again.'); }
    finally { setLoading(false); }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { setError('Enter a valid 6-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid OTP'); return; }
      if (data.token) {
        login(data.token, data.user);
        router.push('/');
      }
    } catch { setError('Verification failed. Try again.'); }
    finally { setLoading(false); }
  };

  const IC = "w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none transition";
  const IS = { background: SURF2, border: '1.5px solid ' + BOR, color: T1 };

  return (
    <main className="min-h-screen flex flex-col" style={{ background: BG }}>

      {/* Top bar */}
      <div className="max-w-md mx-auto w-full px-4 pt-5 flex items-center gap-3">
        <Link href="/" className="p-2 rounded-xl" style={{ background: SURF, border: '1px solid ' + BOR, color: PRI2 }}>
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>Z</div>
          <span className="font-bold text-base" style={{ color: PRI2 }}>Zubika</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-4 py-8">

        {/* Card */}
        <div className="rounded-3xl p-6 shadow-2xl" style={{ background: SURF, border: '1px solid ' + BOR }}>

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
            {step === 'phone' ? <Phone className="w-7 h-7 text-white" /> : <Shield className="w-7 h-7 text-white" />}
          </div>

          <h1 className="text-xl font-bold text-center mb-1" style={{ color: T1 }}>
            {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
          </h1>
          <p className="text-sm text-center mb-6" style={{ color: T3 }}>
            {step === 'phone' ? 'Sign in with your mobile number' : 'Enter the 6-digit code sent to +91 ' + phone}
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={sendOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: PRI2 }}>
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="px-3 py-3.5 rounded-xl text-sm font-semibold flex-shrink-0"
                    style={{ background: SURF2, border: '1.5px solid ' + BOR, color: PRI2 }}>+91</div>
                  <input type="tel" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210" maxLength={10} className={IC} style={IS} autoFocus />
                </div>
              </div>
              <button type="submit" disabled={loading || phone.length !== 10}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Send OTP</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: PRI2 }}>
                  Enter OTP
                </label>
                <input type="tel" value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •" maxLength={6}
                  className={IC + " text-center text-2xl tracking-[0.5em] font-bold"} style={IS} autoFocus />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Verify & Login</span><ArrowRight className="w-4 h-4" /></>}
              </button>
              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-xs" style={{ color: T3 }}>Resend OTP in {timer}s</p>
                ) : (
                  <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                    className="text-xs font-semibold" style={{ color: PRI2 }}>
                    Change number / Resend
                  </button>
                )}
              </div>
            </form>
          )}

          {step === 'phone' && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: BOR }} />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs" style={{ background: SURF, color: T3 }}>New to Zubika?</span>
                </div>
              </div>
              <Link href="/auth/register"
                className="block w-full py-3.5 rounded-xl text-sm font-semibold text-center border-2 transition"
                style={{ borderColor: BOR, color: PRI2, background: SURF2 }}>
                Create Account
              </Link>
            </>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: T3 }}>
            <Shield className="w-3.5 h-3.5" style={{ color: ACC }} /> Secure Login
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: T3 }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: ACC }} /> 2 Free Listings
          </div>
        </div>
      </div>
    </main>
  );
}
