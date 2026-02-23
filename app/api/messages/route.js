import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/lib/models/Message';
import jwt from 'jsonwebtoken';

function verifyToken(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const conversationWith = searchParams.get('with');

    let query = {
      $or: [
        { sender: user.userId },
        { receiver: user.userId },
      ],
    };

    if (conversationWith) {
      query.$or = [
        { sender: user.userId, receiver: conversationWith },
        { sender: conversationWith, receiver: user.userId },
      ];
    }

    const messages = await Message.find(query)
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .sort({ createdAt: 1 })
      .limit(50);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { receiver, content, product } = await request.json();

    const message = new Message({
      sender: user.userId,
      receiver,
      content,
      product,
    });

    await message.save();
    await message.populate('sender', 'name profileImage');

    return NextResponse.json(
      { message: 'Message sent successfully', data: message },
      { status: 201 }
    );
  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
