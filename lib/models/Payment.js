import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ['razorpay', 'upi', 'netbanking', 'wallet', 'cod'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    refund: {
      razorpayRefundId: String,
      amount: Number,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
      },
      reason: String,
      requestedAt: Date,
      completedAt: Date,
    },
    errorMessage: String,
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'payments' }
);

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
