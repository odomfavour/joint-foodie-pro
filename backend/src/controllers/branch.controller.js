import Branch from '../models/branch.model.js';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
export const getBranches = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = search
      ? {
          name: { $regex: search, $options: 'i' }, // case-insensitive partial match
        }
      : {};

    const total = await Branch.countDocuments(query);
    const branches = await Branch.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: branches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single branch
export const getSingleBranch = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid branch ID' });
  }

  const branch = await Branch.findById(id);
  if (!branch) return res.status(404).json({ message: 'Branch not found' });

  res.status(200).json({ success: true, data: branch });
};

// Create a new branch
export const createBranch = async (req, res) => {
  try {
    const {
      name,
      address,
      state,
      phone,
      email,
      location,
      coordinates,
      admins,
    } = req.body;

    // Optional: Validate required fields
    if (!name || !address || !state || !phone || !email) {
      return res
        .status(400)
        .json({ message: 'All required fields must be provided' });
    }

    const newBranch = await Branch.create({
      name,
      address,
      state,
      phone,
      email,
      location,
      coordinates,
      admins,
    });

    res.status(201).json({ success: true, data: newBranch });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating branch',
      error: error.message,
    });
  }
};

// Update a branch
export const updateBranch = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Branch.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Branch not found' });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ message: 'Error updating branch', error });
  }
};

export const getNearbyBranches = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ message: 'Latitude and longitude are required' });
    }

    const branches = await Branch.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 10000, // 10km radius
        },
      },
    });

    res.status(200).json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    console.error('Nearby branches error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a branch
export const deleteBranch = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Branch.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Branch not found' });

    res.status(200).json({ message: 'Branch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting branch', error });
  }
};

export const getUsersByBranch = async (req, res) => {
  const { id } = req.params;
  const {
    page = 1,
    limit = 10,
    role, // optional: filter by role
    search = '', // optional: keyword search
  } = req.query;

  try {
    const query = {
      branch: id,
    };

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('fullName email role phone createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users for branch:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
