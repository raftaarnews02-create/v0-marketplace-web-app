import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      default: '',
    },
    email: {
      type: String,
      sparse: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    otp: {
      code: String,
      expiresAt: Date,
      attempts: {
        type: Number,
        default: 0,
      },
    },
    profileImage: {
      type: String,
      default: null,
    },
    userType: {
      type: String,
      enum: ['customer', 'vendor', 'admin'],
      default: 'customer',
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'vendor', 'admin'],
      default: 'buyer',
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'users' }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.models.User || mongoose.model('User', userSchema);
