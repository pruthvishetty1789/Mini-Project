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
    required: true,
    unique: true, // Ensured uniqueness
  }

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export { User };