import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
   phoneNo: {
    type: String,
    
    unique: true, // Ensured uniqueness
  },
   // OTP / password-reset fields
  resetOtp: { type: String },                  // hashed OTP (sha256)
  resetOtpExpires: { type: Date },             // expiry timestamp
  resetOtpAttempts: { type: Number, default: 0 },

  // Track when password was last changed (useful to invalidate JWTs)
  passwordChangedAt: { type: Date },

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export { User };