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

  // Get user by email (include password for authentication)
  async getUserByEmail(email, includePassword = false) {
    try {
      const query = User.findOne({ email: email.toLowerCase(), isActive: true });
      if (includePassword) {
        query.select('+password');
      }
      return await query;
    } catch (error) {
      throw new Error('Error fetching user by email: ' + error.message);
    }
  }

  // Get user by username
  async getUserByUsername(username) {
    try {
      return await User.findOne({ username, isActive: true });
    } catch (error) {
      throw new Error('Error fetching user by username: ' + error.message);
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

  // Authenticate user
  async authenticateUser(email, password) {
    try {
      const user = await this.getUserByEmail(email, true);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        throw new Error('Account temporarily locked. Try again later.');
      }

      const isMatch = await this.comparePassword(password, user.password);
      
      if (!isMatch) {
        // Handle failed login attempt
        await this.handleFailedLogin(user._id);
        throw new Error('Invalid credentials');
      }

      // Reset failed attempts and update last login
      await this.handleSuccessfulLogin(user._id);
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Handle failed login attempt
  async handleFailedLogin(userId) {
    try {
      const user = await User.findById(userId);
      const maxAttempts = 5;
      const lockTime = 2 * 60 * 60 * 1000; // 2 hours

      const updates = {};
      
      // If lock has expired, restart count
      if (user.lockUntil && user.lockUntil < Date.now()) {
        updates.$unset = { lockUntil: 1 };
        updates.$set = { loginAttempts: 1 };
      } else {
        updates.$inc = { loginAttempts: 1 };
        
        // Lock account if max attempts reached
        if ((user.loginAttempts || 0) + 1 >= maxAttempts) {
          updates.$set = { lockUntil: Date.now() + lockTime };
        }
      }

      await User.updateOne({ _id: userId }, updates);
    } catch (error) {
      throw new Error('Error handling failed login: ' + error.message);
    }
  }

  // Handle successful login
  async handleSuccessfulLogin(userId) {
    try {
      await User.updateOne(
        { _id: userId },
        {
          $unset: { loginAttempts: 1, lockUntil: 1 },
          $set: { lastLogin: new Date() }
        }
      );
    } catch (error) {
      throw new Error('Error handling successful login: ' + error.message);
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

  // Update refresh token
  async updateRefreshToken(userId, refreshToken) {
    try {
      await User.findByIdAndUpdate(userId, { refreshToken });
    } catch (error) {
      throw new Error('Error updating refresh token: ' + error.message);
    }
  }

  // Generate password reset token
  async generatePasswordResetToken(email) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      const resetToken = jwt.sign(
        { userId: user._id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );

      await User.findByIdAndUpdate(user._id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: Date.now() + 3600000 // 1 hour
      });

      return resetToken;
    } catch (error) {
      throw new Error('Error generating reset token: ' + error.message);
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      const hashedPassword = await this.hashPassword(newPassword);

      await User.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 }
      });

      return true;
    } catch (error) {
      throw new Error('Error resetting password: ' + error.message);
    }
  }

  // Get all users (admin only)
  async getAllUsers(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = { isActive: true, ...filters };

      const users = await User.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      return {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      };
    } catch (error) {
      throw new Error('Error fetching users: ' + error.message);
    }
  }

  // Deactivate user
  async deactivateUser(userId) {
    try {
      return await User.findByIdAndUpdate(
        userId, 
        { isActive: false },
        { new: true }
      );
    } catch (error) {
      throw new Error('Error deactivating user: ' + error.message);
    }
  }

  // Get users by role
  async getUsersByRole(role) {
    try {
      return await User.find({ role, isActive: true }).sort({ name: 1 });
    } catch (error) {
      throw new Error('Error fetching users by role: ' + error.message);
    }
  }

  // Get users by course
  async getUsersByCourse(course) {
    try {
      return await User.find({ 
        courses: { $in: [course] }, 
        isActive: true 
      }).sort({ name: 1 });
    } catch (error) {
      throw new Error('Error fetching users by course: ' + error.message);
    }
  }
}

module.exports = new UserService();