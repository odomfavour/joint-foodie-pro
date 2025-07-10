import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    category: {
      type: String, // e.g., 'Appetizers', 'Main Course', etc.
      required: [true, 'Category is required'],
    },
    image: {
      type: String, // URL to image
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    customizations: [
      {
        name: String, // e.g., "Spice Level"
        options: [String], // e.g., ["Mild", "Medium", "Hot"]
      },
    ],
  },
  { timestamps: true }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
