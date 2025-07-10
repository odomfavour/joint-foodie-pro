import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // eslint-disable-next-line no-undef
    const con = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${con.connection.host}`);
  } catch (error) {
    console.log(`MongoDD connection error: ${error}`);
  }
};
