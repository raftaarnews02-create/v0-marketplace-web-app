import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    platform: {
      name: {
        type: String,
        default: 'Zubika',
      },
      commission: {
        type: Number,
        default: 1,
      },
      minOrderValue: {
        type: Number,
        default: 1,
      },
      maxOrderValue: {
        type: Number,
        default: 1000000,
      },
    },
    payment: {
      razorpayKeyId: String,
      razorpayKeySecret: String,
      enableCOD: {
        type: Boolean,
        default: true,
      },
      enableUPI: {
        type: Boolean,
        default: true,
      },
    },
    storage: {
      cloudinaryName: String,
      cloudinaryKey: String,
      cloudinarySecret: String,
    },
    email: {
      smtpHost: String,
      smtpPort: Number,
      smtpUser: String,
      smtpPassword: String,
    },
    sms: {
      provider: {
        type: String,
        enum: ['twilio', 'aws', 'demo'],
        default: 'demo',
      },
      accountSid: String,
      authToken: String,
      senderNumber: String,
    },
    features: {
      enableVendors: {
        type: Boolean,
        default: true,
      },
      enableReviews: {
        type: Boolean,
        default: true,
      },
      enableWishlist: {
        type: Boolean,
        default: true,
      },
      enableMessaging: {
        type: Boolean,
        default: true,
      },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'settings' }
);

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
