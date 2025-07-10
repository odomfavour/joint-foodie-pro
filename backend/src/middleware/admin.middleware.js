export const adminRoute = (req, res, next) => {
  try {
    // Ensure the user is authenticated (req.user is set by protectRoute)
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized - No user found' });
    }

    // Check if the user is an admin
    if (req.user.userType !== 'admin') {
      return res
        .status(401)
        .json({ success: false, message: 'Only Admin access' });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error in adminRoute middleware:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
