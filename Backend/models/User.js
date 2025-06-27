const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6,
    select: false
  },
  name: { type: String, required: true },
  username: { 
    type: String, 
    required: true, 
    unique: true,
    minlength: 3,
    maxlength: 20
  },
  role: { 
    type: String, 
    enum: ['student', 'instructor', 'admin'], 
    default: 'student' 
  },
  courses: [{ type: String }],
  semester: { type: String, required: true },
  studentId: { 
    type: String
  },
  phoneNumber: { 
    type: String
  },
  dateOfBirth: { type: Date },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'Egypt' }
  },
  profilePicture: { 
    type: String, 
    default: '/images/default-avatar.png' 
  },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  refreshToken: { type: String },
  lockUntil: { type: Date },

  lastLogin: { type: Date }
}, {
  timestamps: true
});


module.exports = mongoose.model('User', userSchema);