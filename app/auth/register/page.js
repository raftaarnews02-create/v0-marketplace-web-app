'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Phone, Lock, User, ArrowRight, ArrowLeft, ShoppingBag, Briefcase } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState('phone'); // phone, otp, details
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    userType: 'buyer', // buyer or vendor
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

      // If user exists and is already registered, log them in
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

      // If new user, move to details step
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

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on user type
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

  // Test account hints
  const isTestCustomer = phone === '7740847114';
  const isTestSeller = phone === '7740847112';
  const isTestAdmin = phone === '7740847111';

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <Store className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Zubika</h1>
            <p className="text-gray-500 mt-2">Create your account</p>
          </div>

          {/* Test Accounts Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm font-medium text-blue-800 mb-2">Test Accounts:</p>
            <p className="text-xs text-blue-600">Buyer: 7740847114 → OTP: 123456</p>
            <p className="text-xs text-blue-600">Seller: 7740847112 → OTP: 123456</p>
            <p className="text-xs text-blue-600">Admin: 7740847111 → OTP: 123456</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-3 h-3 rounded-full ${step === 'phone' ? 'bg-blue-600' : 'bg-green-500'}`}></div>
            <div className={`w-8 h-0.5 ${step === 'otp' || step === 'details' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'otp' ? 'bg-blue-600' : step === 'details' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-0.5 ${step === 'details' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'details' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          </div>

          {/* Phone Step */}
          {step === 'phone' && (
            <form onSubmit={sendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="+91"
                    disabled
                    className="w-16 px-3 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 text-center font-semibold"
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
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">We'll send you an OTP to verify your number</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Sending OTP...</span>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={verifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Enter OTP
                </label>
                <p className="text-sm text-gray-500 mb-4">We sent a 6-digit OTP to +91 {phone}</p>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  placeholder="000000"
                  className="w-full px-4 py-4 text-center text-3xl tracking-widest border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  required
                />
                
                {/* Show correct OTP for test accounts */}
                {(isTestCustomer || isTestSeller || isTestAdmin) && (
                  <div className="mt-2 text-center text-sm text-green-600 font-medium">
                    Demo OTP: 123456
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
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
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change Number
                </button>
                {timer > 0 ? (
                  <span className="text-gray-500">Resend in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={sendOTP}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Verify OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Details Step */}
          {step === 'details' && (
            <form onSubmit={completeRegistration} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  I want to
                </label>
                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${formData.userType === 'buyer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="userType"
                      value="buyer"
                      checked={formData.userType === 'buyer'}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, userType: e.target.value }));
                        setError('');
                      }}
                      className="w-5 h-5 text-blue-600"
                    />
                    <ShoppingBag className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Browse & Buy</p>
                      <p className="text-sm text-gray-500">Find products and services</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${formData.userType === 'vendor' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="userType"
                      value="vendor"
                      checked={formData.userType === 'vendor'}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, userType: e.target.value }));
                        setError('');
                      }}
                      className="w-5 h-5 text-blue-600"
                    />
                    <Briefcase className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Sell Products & Services</p>
                      <p className="text-sm text-gray-500">List your shop or products</p>
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('otp');
                  }}
                  className="w-1/3 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.name}
                  className="w-2/3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Creating...</span>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          {step === 'phone' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              {/* Sign In Link */}
              <Link
                href="/auth/login"
                className="block w-full px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition text-center"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
