import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
    },
    images: [
      {
        type: String,
      },
    ],
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
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    location: {
      city: String,
      state: String,
      pincode: String,
    },
    stock: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'rejected'],
      default: 'pending',
    },
    moderation: {
      status: {
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        default: 'pending',
      },
      rejectionReason: String,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewedAt: Date,
    },
    payment: {
      amount: {
        type: Number,
        default: 0,
      },
      commission: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      paidAt: Date,
    },
    tags: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'products' }
);

productSchema.index({ vendor: 1 });
productSchema.index({ shop: 1 });
productSchema.index({ 'moderation.status': 1 });
productSchema.index({ category: 1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
