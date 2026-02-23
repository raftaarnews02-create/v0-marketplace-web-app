import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateOTP, generateOTPExpiry, storeDemoOTP, getTestUser } from '@/lib/otp';

export async function POST(req) {
  try {
    const { phone, countryCode = '+91' } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const fullPhone = `${countryCode}${phone}`.replace(/-/g, '').replace(/^\+?91/, '');

    await connectDB();

    // Check if user exists
    let user = await User.findOne({ phone: fullPhone });

    // Generate OTP
    const otp = generateOTP(fullPhone);
    const expiresAt = generateOTPExpiry(10); // 10 minutes

    // Get test user data if this is a test phone
    const testUser = getTestUser(fullPhone);

    if (user) {
      // Update existing user's OTP
      user.otp = {
        code: otp,
        expiresAt,
        attempts: 0,
      };
      // Update role and userType if test user
      if (testUser) {
        user.role = testUser.role;
        user.userType = testUser.userType;
      }
      await user.save();
    } else {
      // Create new user (will be completed on registration)
      user = new User({
        phone: fullPhone,
        name: testUser ? testUser.name : '',
        otp: {
          code: otp,
          expiresAt,
          attempts: 0,
        },
        userType: testUser ? testUser.userType : 'customer',
        role: testUser ? testUser.role : 'buyer',
        isVerified: testUser ? true : false,
      });
      await user.save();
    }

    // In production, integrate with Twilio/AWS SNS
    // For now, store in memory (demo mode)
    storeDemoOTP(fullPhone, otp);

    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent successfully',
        phone: fullPhone,
        expiresIn: 600, // 10 minutes in seconds
        // In production, don't send OTP in response
        // For demo only:
        demoOTP: otp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Phone number already registered. Please try logging in.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
