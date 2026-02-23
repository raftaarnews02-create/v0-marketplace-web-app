import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateOTP, generateOTPExpiry, storeDemoOTP } from '@/lib/otp';

export async function POST(req) {
  try {
    const { phone, countryCode = '+91' } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const fullPhone = `${countryCode}${phone}`.replace(/-/g, '');

    await connectDB();

    // Check if user exists
    let user = await User.findOne({ phone: fullPhone });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = generateOTPExpiry(10); // 10 minutes

    if (user) {
      // Update existing user's OTP
      user.otp = {
        code: otp,
        expiresAt,
        attempts: 0,
      };
      await user.save();
    } else {
      // Create new user (will be completed on registration)
      user = new User({
        phone: fullPhone,
        name: 'New User',
        otp: {
          code: otp,
          expiresAt,
          attempts: 0,
        },
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
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
