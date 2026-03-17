import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: String,
      fullAddress: String,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
    },
    serviceDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        type: String,
      },
    ],
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'under_review', 'rejected'],
      default: 'pending',
    },
    payment: {
      amount: {
        type: Number,
        default: 99,
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded', 'free'],
        default: 'pending',
      },
      isFree: {
        type: Boolean,
        default: false,
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paidAt: Date,
    },
    moderation: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      rejectionReason: String,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewedAt: Date,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'shops' }
);

shopSchema.index({ seller: 1 });
shopSchema.index({ 'moderation.status': 1 });
shopSchema.index({ category: 1 });
shopSchema.index({ 'location.city': 1, 'location.state': 1 });

export default mongoose.models.Shop || mongoose.model('Shop', shopSchema);
