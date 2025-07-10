import mongoose from 'mongoose';

const phoneSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true, // e.g., "+234"
    },
    number: {
      type: String,
      required: true, // e.g., "7012345678"
      match: [/^\d{7,15}$/, 'Invalid phone number'],
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Email is invalid'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    phone: {
      type: phoneSchema,
      required: true,
    },

    role: {
      type: String,
      required: [true, 'User type is required'],
      default: 'customer',
      enum: ['customer', 'admin', 'staff', 'superadmin'],
    },

    // Branch association for staff and admins
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },

    profilePic: {
      type: String,
      default: '',
    },

    address: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
