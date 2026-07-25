const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['admin', 'superadmin'],
      default: 'admin',
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// ✅ Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Compare password method - FIXED
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔐 comparePassword called');
    console.log(`   Candidate: ${candidatePassword}`);
    console.log(`   Stored hash: ${this.password}`);
    console.log(`   Hash length: ${this.password ? this.password.length : 0}`);
    
    if (!this.password) {
      console.log('❌ No password stored for this user');
      return false;
    }
    
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      console.log('❌ Invalid hash format - does not start with $2a$ or $2b$');
      console.log(`   Hash starts with: ${this.password.substring(0, 4)}`);
      return false;
    }
    
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log(`   Comparison result: ${result ? '✅ MATCH' : '❌ NO MATCH'}`);
    return result;
  } catch (error) {
    console.log(`❌ Error in comparePassword: ${error.message}`);
    return false;
  }
};

// ✅ Remove sensitive data
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);