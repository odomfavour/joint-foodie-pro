import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  try {
    // Check for the authorization header
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')
    ) {
      throw new Error('Unauthorized');
    }

    // Extract the token
    const token = req.headers.authorization.split(' ')[1];

    // Verify the token
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      throw new Error('Unauthorized - Invalid token');
    }

    // Find the user in the database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Contact support.',
      });
    }

    // Attach user to the request object
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error in protectRoute middleware:', error.message);

    // Determine the status code based on the error message
    const statusCode = error.message.includes('Unauthorized') ? 401 : 404;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Not authorized, insufficient permissions' });
    }
    next();
  };
};
