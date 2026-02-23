import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { isOTPExpired, getTestUser } from '@/lib/otp';

export async function POST(req) {
  try {
    const { phone, otp, countryCode = '+91', name, userType = 'buyer' } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone and OTP are required' },
        { status: 400 }
      );
    }

    const fullPhone = `${countryCode}${phone}`.replace(/-/g, '').replace(/^\+?91/, '');

    await connectDB();

    let user = await User.findOne({ phone: fullPhone });

    // If user doesn't exist, check if this is a test phone number
    if (!user) {
      // Check if it's a test phone number
      const testUser = getTestUser(fullPhone);
      if (testUser) {
        // Create the user automatically for test phones
        user = new User({
          phone: fullPhone,
          name: testUser.name,
          userType: testUser.userType, // This will be 'admin' for admin user
          role: testUser.role,
          isVerified: true,
          lastLogin: new Date(),
        });
        await user.save();
      } else {
        return NextResponse.json(
          { error: 'User not found. Please request OTP first.' },
          { status: 404 }
        );
      }
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

    // Check if it's a test phone number and set appropriate role
    const testUser = getTestUser(fullPhone);
    if (testUser) {
      user.name = testUser.name;
      user.userType = testUser.userType; // Use the userType from testUser config
      user.role = testUser.role;
    } else if (name) {
      // If this is a new user registration with name provided
      user.name = name;
      user.userType = userType === 'vendor' ? 'vendor' : 'customer';
      user.role = userType;
    }

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
        message: user.name && user.name !== '' ? 'Login successful' : 'Account created successfully',
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          userType: user.userType,
          role: user.role,
          isVerified: user.isVerified,
        },
        isNewUser: !user.name || user.name === '',
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
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
