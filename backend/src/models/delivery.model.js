import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming delivery personnel are users
      required: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'enroute', 'delivered', 'failed'],
      default: 'assigned',
    },
    pickupTime: Date,
    deliveryTime: Date,
    deliveryAddress: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Delivery = mongoose.model('Delivery', deliverySchema);

export default Delivery;
