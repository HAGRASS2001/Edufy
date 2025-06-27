const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class UserService {
  // Hash password
  async hashPassword(password) {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new Error('Error hashing password: ' + error.message);
    }
  }

  // Compare password
  async comparePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error('Error comparing password: ' + error.message);
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      // Hash password before saving
      if (userData.password) {
        userData.password = await this.hashPassword(userData.password);
      }
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`${field} already exists`);
      }
      throw new Error('Error creating user: ' + error.message);
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      return await User.findById(userId);
    } catch (error) {
      throw new Error('Error fetching user: ' + error.message);
    }
  }

  // Get all users
  async getAllUsers(page = 1, limit = 10, filters = {}) {
    try {
      return await User.find();
    } catch (error) {
      throw new Error('Error fetching users: ' + error.message);
    }
  }

  // Update user
  async updateUser(userId, updateData) {
    try {
      // Hash password if being updated
      if (updateData.password) {
        updateData.password = await this.hashPassword(updateData.password);
      }
      return await User.findByIdAndUpdate(
        userId, 
        updateData, 
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error('Error updating user: ' + error.message);
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      return await User.findByIdAndDelete(userId);
    } catch (error) {
      throw new Error('Error deleting user: ' + error.message);
    }
  }

  // Authenticate user by username
  async authenticateUserByUsername(username, password) {
    try {
      const user = await User.findOne({ username, isActive: true }).select('+password');
      if (!user) {
        throw new Error('Invalid credentials');
      }
      const isMatch = await this.comparePassword(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
      return user;
    } catch (error) {
      throw new Error('Error authenticating user: ' + error.message);
    }
  }

  // Generate JWT tokens
  generateTokens(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRE || '15m' 
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { 
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' 
    });
    return { accessToken, refreshToken };
  }
}

module.exports = new UserService();