// server.js

// Load environment variables from .env file
import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';

// Import the database connection function
import connectDB from './config/db.js';

// Import the User model from its dedicated file
import { User } from './models/User.js';

const app = express();
app.use(express.json());
app.use(cors());

// Connect to the database
connectDB();

const JWT_SECRET = process.env.JWT_SECRET;

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Check if email or phone already exists
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const existingUserPhone = await User.findOne({ phone });
    if (existingUserPhone) {
        return res.status(409).json({ message: 'Phone number already in use.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      contacts: []
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    // Log the full error object to the console
    console.error('Error during registration:', error); 
    
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
});

// Login endpoint (no changes needed here as login is by email)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const payload = { userId: user._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, message: 'Logged in successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});

// Middleware to protect routes that require authentication
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

// Example of a protected route
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ name: user.name, email: user.email, phone: user.phone }); // Added phone to the response
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// NEW: Protected route to get user's contacts
app.get('/api/contacts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user.contacts || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
