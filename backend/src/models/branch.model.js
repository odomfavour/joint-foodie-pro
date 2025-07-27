import mongoose from 'mongoose';

const phoneSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true, // e.g., "+234"
    },
    number: {
      type: String,
      required: true,
      match: [/^\d{7,15}$/, 'Invalid phone number'],
    },
  },
  { _id: false }
);

const coordinatesSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  { _id: false }
);

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email'],
    },
    phone: {
      type: phoneSchema,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    coordinates: {
      type: coordinatesSchema,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    staff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

branchSchema.index({ coordinates: '2dsphere' });

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;
