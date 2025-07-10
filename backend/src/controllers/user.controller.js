import Branch from '../models/branch.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      sort = 'createdAt', // default sort field
      order = 'desc', // default order: descending
    } = req.query;

    const query = {};

    // Filtering by role
    if (role) {
      query.role = role;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination options
    const skip = (Number(page) - 1) * Number(limit);

    // Sorting
    const sortOption = { [sort]: order === 'asc' ? 1 : -1 };

    const users = await User.find(query)
      .select('-password') // exclude password
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password'); // Exclude password

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Validate MongoDB ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid user ID' });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      message: `User account has been ${
        user.isActive ? 'activated' : 'suspended'
      }`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

export const assignBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { branchId, role } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(branchId)
    ) {
      return res.status(400).json({ message: 'Invalid user or branch ID' });
    }

    const currentUser = req.user;

    // Only superadmin can assign admins
    if (role === 'admin' && currentUser.role !== 'superadmin') {
      return res
        .status(403)
        .json({ message: 'Only superadmin can assign admin role' });
    }

    // Admins can only assign staff to their own branch
    if (currentUser.role === 'admin') {
      if (role !== 'staff' || currentUser.branch?.toString() !== branchId) {
        return res.status(403).json({
          message: 'Admins can only assign staff to their own branch',
        });
      }
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If role is admin, check admin count in branch
    if (role === 'admin') {
      const adminCount = await User.countDocuments({
        branch: branchId,
        role: 'admin',
      });
      await Branch.findByIdAndUpdate(branchId, {
        $addToSet: { admins: user._id }, // $addToSet prevents duplicates
      });

      // Don't assign if the branch already has 7 admins
      if (adminCount >= 7 && user.role !== 'admin') {
        return res
          .status(400)
          .json({ message: 'Branch already has maximum number of admins (7)' });
      }
    }

    user.branch = branchId;
    user.role = role;
    await user.save();
    const updatedUser = await User.findById(user._id).select('-password');
    res.status(200).json({
      message: `Assigned ${role} to branch`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error assigning branch:', error);
    res
      .status(500)
      .json({ message: 'Something went wrong', error: error.message });
  }
};

export const removeBranch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.branch) {
      return res
        .status(400)
        .json({ message: 'User is not assigned to any branch' });
    }

    const oldBranchId = user.branch;

    // If the user is an admin, remove from the branch admins array
    if (user.role === 'admin') {
      await Branch.findByIdAndUpdate(oldBranchId, {
        $pull: { admins: user._id },
      });
    }

    user.branch = null;
    await user.save();

    res.status(200).json({
      message: `Branch unassigned from ${user.fullName}`,
      branch: null,
    });
  } catch (error) {
    console.error('Error removing branch:', error);
    res
      .status(500)
      .json({ message: 'Something went wrong', error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Validate role
    const allowedRoles = ['customer', 'admin', 'staff', 'superadmin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Find and update
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      message: `User role updated to ${user.role}`,
      user,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res
      .status(500)
      .json({ message: 'Something went wrong', error: error.message });
  }
};
