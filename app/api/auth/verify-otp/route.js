import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { isOTPExpired } from '@/lib/otp';

export async function POST(req) {
  try {
    const { phone, otp, countryCode = '+91', name, userType = 'customer' } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone and OTP are required' },
        { status: 400 }
      );
    }

    const fullPhone = `${countryCode}${phone}`.replace(/-/g, '');

    await connectDB();

    const user = await User.findOne({ phone: fullPhone });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please send OTP first.' },
        { status: 404 }
      );
    }

    // Check if OTP exists
    if (!user.otp || !user.otp.code) {
      return NextResponse.json(
        { error: 'No OTP found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (isOTPExpired(user.otp.expiresAt)) {
      user.otp = null;
      await user.save();
      return NextResponse.json(
        { error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check OTP attempts
    if (user.otp.attempts >= 5) {
      user.otp = null;
      await user.save();
      return NextResponse.json(
        { error: 'Too many attempts. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.otp.code !== otp) {
      user.otp.attempts += 1;
      await user.save();
      return NextResponse.json(
        { error: 'Invalid OTP', attempts: user.otp.attempts },
        { status: 400 }
      );
    }

    // OTP verified successfully
    user.otp = null;
    user.isVerified = true;
    user.lastLogin = new Date();

    // Update name and user type if provided (for new registration)
    if (name) user.name = name;
    if (userType) user.userType = userType;

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
        userType: user.userType,
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '30d' }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'OTP verified successfully',
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          userType: user.userType,
          isVerified: user.isVerified,
        },
        token,
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
