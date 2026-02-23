'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Phone, Lock, User, ArrowRight, ArrowLeft, ShoppingBag, Briefcase } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    userType: 'buyer',
  });

  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP');
        return;
      }

      setStep('otp');
      startTimer();
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name: '', userType: '' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid OTP');
        return;
      }

      if (data.user && data.user.isVerified && data.user.name) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.userType === 'vendor') {
          router.push('/sell');
        } else if (data.user.userType === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        return;
      }

      setStep('details');
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async (e) => {
    e.preventDefault();
    
    if (!formData.name || formData.name.trim().length < 2) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone, 
          otp, 
          name: formData.name,
          userType: formData.userType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to complete registration');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (formData.userType === 'vendor') {
        router.push('/sell');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isTestCustomer = phone === '7740847114';
  const isTestSeller = phone === '7740847112';
  const isTestAdmin = phone === '7740847111';

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Zubika</span>
          </Link>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white mb-6">
          <h1 className="text-2xl font-bold mb-2">Create Account!</h1>
          <p className="text-sm opacity-90">Join Zubika today</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          {/* Test Accounts Info */}
          <div className="mb-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-xs font-medium text-orange-700 mb-1">Demo Accounts:</p>
            <p className="text-xs text-orange-600">Buyer: 7740847114 | Seller: 7740847112 | Admin: 7740847111</p>
            <p className="text-xs text-orange-600 mt-1">OTP: 123456</p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${step === 'phone' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            <div className={`w-8 h-0.5 ${step === 'otp' || step === 'details' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'otp' ? 'bg-orange-500' : step === 'details' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-0.5 ${step === 'details' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'details' ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
          </div>

          {/* Phone Step */}
          {step === 'phone' && (
            <form onSubmit={sendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="+91"
                    disabled
                    className="w-16 px-3 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 text-center font-semibold"
                  />
                  <input
                    type="tel"
                    maxLength="10"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    placeholder="9876543210"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={verifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <p className="text-sm text-gray-500 mb-3">Sent to +91 {phone}</p>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                  required
                />
                
                {(isTestCustomer || isTestSeller || isTestAdmin) && (
                  <div className="mt-2 text-center text-sm text-green-600 font-medium">
                    Demo OTP: 123456
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                  }}
                  className="text-orange-600 font-medium"
                >
                  Change Number
                </button>
                {timer > 0 ? (
                  <span className="text-gray-500">Resend in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={sendOTP}
                    className="text-orange-600 font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {/* Details Step */}
          {step === 'details' && (
            <form onSubmit={completeRegistration} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    setError('');
                  }}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I want to
                </label>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${formData.userType === 'buyer' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="userType"
                      value="buyer"
                      checked={formData.userType === 'buyer'}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, userType: e.target.value }));
                        setError('');
                      }}
                      className="w-4 h-4 text-orange-500"
                    />
                    <ShoppingBag className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Browse & Buy</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${formData.userType === 'vendor' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="userType"
                      value="vendor"
                      checked={formData.userType === 'vendor'}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, userType: e.target.value }));
                        setError('');
                      }}
                      className="w-4 h-4 text-orange-500"
                    />
                    <Briefcase className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Sell Products</p>
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('otp')}
                  className="w-1/3 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.name}
                  className="w-2/3 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          {step === 'phone' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <Link
                href="/auth/login"
                className="block w-full px-4 py-3 border-2 border-orange-500 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition text-center"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1.5 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between px-4">
          <Link href="/" className="flex flex-col items-center gap-0.5 p-1.5 text-gray-500">
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link href="/browse" className="flex flex-col items-center gap-0.5 p-1.5 text-gray-500">
            <span className="text-lg">🔍</span>
            <span className="text-[10px] font-medium">Browse</span>
          </Link>
          <Link href="/sell" className="flex flex-col items-center gap-0.5 -mt-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <span className="w-6 h-6 text-white text-lg font-bold">+</span>
            </div>
            <span className="text-[10px] font-medium text-gray-600">Sell</span>
          </Link>
          <Link href="/auth/login" className="flex flex-col items-center gap-0.5 p-1.5 text-orange-600">
            <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">
              👤
            </div>
            <span className="text-[10px] font-medium">Login</span>
          </Link>
        </div>
      </nav>
      <div className="h-20"></div>
    </main>
  );
}
