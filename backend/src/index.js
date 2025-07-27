import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/users.route.js';
import branchesRoutes from './routes/branches.route.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000', // frontend origin
    credentials: true, // if you're using cookies or sessions
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', branchesRoutes);

// eslint-disable-next-line no-undef
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  connectDB();
});
