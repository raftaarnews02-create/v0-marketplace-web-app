import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    businessType: {
      type: String,
      enum: ['individual', 'partnership', 'company'],
      default: 'individual',
    },
    gstNumber: String,
    panNumber: String,
    businessAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: String,
    verifiedAt: Date,
    totalProducts: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalCommissionPaid: {
      type: Number,
      default: 0,
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
    responseTime: Number,
    returnsAccepted: {
      type: Boolean,
      default: true,
    },
    policies: {
      returnPolicy: String,
      shippingPolicy: String,
      cancellationPolicy: String,
    },
    documents: [
      {
        type: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    isSuspended: {
      type: Boolean,
      default: false,
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
  { collection: 'vendors' }
);

export default mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
