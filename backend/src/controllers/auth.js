// // controllers/auth.js

// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User'); // Import the User model

// // Handle user registration
// exports.registerUser = async (req, res) => {
//   const { name, email, phone, password } = req.body;

//   if (!name || !email || !phone || !password) {
//     return res.status(400).json({ message: 'All fields are required.' });
//   }

//   try {
//     // Check if an email or phone number already exists to prevent duplicate accounts
//     const existingUser = await User.findOne({ email });
//     const existingPhone = await User.findOne({ phone });

//     if (existingUser) {
//       return res.status(409).json({ message: 'Email already in use.' });
//     }

//     if (existingPhone) {
//         return res.status(409).json({ message: 'Phone number already in use.' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ name, email, phone, password: hashedPassword }); // Pass the phone to the new User object
//     await newUser.save();

//     res.status(201).json({ message: 'User registered successfully!' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error.', error: error.message });
//   }
// };

// // Handle user login
// // Handle user login
// exports.loginUser = async (req, res) => {
//   const { email, password } = req.body;
  
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid credentials.' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials.' });
//     }

//     const payload = { userId: user._id };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

//     // ✅ Return phone in response
//     res.json({
//       token,
//       message: 'Logged in successfully!',
//       phone: user.phone, // <--- Add this
//       name: user.name,   // Optional
//       email: user.email  // Optional
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error.', error: error.message });
//   }
// };

// // Get user profile (requires authentication)
// exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId).select('-password');
//     if (!user) {
//       return res.status(404).json({ message: 'User not found.' });
//     }
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error.', error: error.message });
//   }
// };
// controllers/auth.js

// controllers/auth.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Use the reusable mailer (nodemailer transporter) from utils/mailer.js
const createTransporter = require('../utils/mailer');

// Robust import of User model to handle both CommonJS and ES module exports
const ImportedUser = require('../models/User');
const User = ImportedUser && (ImportedUser.default || ImportedUser.User) ? (ImportedUser.default || ImportedUser.User) : ImportedUser;

/* -------------------------
   Existing auth functions
   ------------------------- */

// Handle user registration
exports.registerUser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if an email or phone number already exists to prevent duplicate accounts
    const existingUser = await User.findOne({ email });
    const existingPhone = await User.findOne({ phone });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    if (existingPhone) {
      return res.status(409).json({ message: 'Phone number already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, phone, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Handle user login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      message: 'Logged in successfully!',
      phone: user.phone,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Get user profile (requires authentication)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

/* -------------------------
   New: OTP (email) functions
   ------------------------- */

/**
 * POST /auth/request-reset-otp
 * Body: { email }
 * - Generates a 6-digit OTP, hashes and stores it on user with expiry.
 * - Sends OTP via SMTP email (Nodemailer) using utils/mailer.js transporter.
 * - In development (NODE_ENV !== 'production') returns the OTP in the response to help testing.
 */
exports.requestResetOtpWithEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Generate 6-digit OTP
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    const hashedOtp = crypto.createHash('sha256').update(otpPlain).digest('hex');

    // Save hashed OTP + expiry (10 minutes) + reset attempts
    user.resetOtp = hashedOtp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.resetOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    // Prepare email
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"No Reply" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'HearMe — Your password reset OTP',
      text: `Your OTP is ${otpPlain}. It will expire in 10 minutes.`,
      html: `<p>Your OTP is <strong>${otpPlain}</strong>. It will expire in 10 minutes.</p>`
    };

    try {
      await transporter.sendMail(mailOptions);

      // DEV fallback: return OTP in response only when not in production
      const devResponse = process.env.NODE_ENV === 'production' ? {} : { otp: otpPlain };

      return res.status(200).json({
        message: 'OTP sent to your email (check spam/junk).',
        note: 'OTP valid for 10 minutes.',
        ...devResponse
      });
    } catch (mailErr) {
      // Clear saved OTP fields on email send failure
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      user.resetOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });

      console.error('Error sending OTP email:', mailErr);
      return res.status(500).json({ message: 'Failed to send OTP email. Try again later.' });
    }
  } catch (err) {
    console.error('requestResetOtpWithEmail error:', err);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

/**
 * POST /auth/reset-password-otp
 * Body: { email, otp, password }
 * - Verifies OTP (hashed), expiry and attempts.
 * - If valid, updates user's password and clears OTP fields.
 */
exports.resetPasswordWithOtp = async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    return res.status(400).json({ message: 'Email, otp and new password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Attempts limit
    if (user.resetOtpAttempts && user.resetOtpAttempts >= 5) {
      return res.status(429).json({ message: 'Too many attempts. Request a new OTP.' });
    }

    // Check expiry
    if (!user.resetOtp || !user.resetOtpExpires || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP expired or not found. Request a new OTP.' });
    }

    // Hash provided otp and compare
    const hashedProvided = crypto.createHash('sha256').update(otp).digest('hex');

    if (hashedProvided !== user.resetOtp) {
      // increment attempts
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // OTP valid -> update password and clear reset fields
    user.password = await bcrypt.hash(password, 10);
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = 0;
    user.passwordChangedAt = Date.now();

    await user.save();

    return res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('resetPasswordWithOtp error:', err);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
