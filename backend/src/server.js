// server.js
import { parsePhoneNumberWithError} from 'libphonenumber-js';
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

import contactRoutes from './routes/contactRoutes.js';
const app = express();
app.use(express.json());
app.use(cors());

// Connect to the database
connectDB();

const JWT_SECRET = process.env.JWT_SECRET;

// Use the contact routes
app.use('/api/contacts', contactRoutes);

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password,phoneNo } = req.body;
    // Default country code for parsing. Adjust this based on your target audience.
    // You could also send the country code from the client.
    const defaultCountry = 'IN'; 
    // Step 3a: Parse the phone number
    // The library handles different formats, like spaces, dashes, etc.
    const phoneNumber = parsePhoneNumberWithError(phoneNo, defaultCountry);
    // Step 3b: Validate the number
    // The isValid() method checks if the number is plausible and valid.
    if (!phoneNumber || !phoneNumber.isValid()) {
      return res.status(400).json({ 
        message: 'The phone number you entered is invalid.',
      });
    }

    // Step 3c: Normalize the number to E.164 format
    // This is the standardized format you'll save to the database.
    const normalizedPhone = phoneNumber.format('E.164');


    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNo:normalizedPhone
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
});

// Login endpoint
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
    res.json({ name: user.name, email: user.email });
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