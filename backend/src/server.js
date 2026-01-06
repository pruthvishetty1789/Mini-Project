/*import { parsePhoneNumberWithError } from 'libphonenumber-js';
import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import pkg from 'agora-access-token';  // ✅ FIXED IMPORT
const { RtcTokenBuilder, RtcRole } = pkg;

// Import DB connection and User model
import connectDB from './config/db.js';
import { User } from './models/User.js';
import contactRoutes from './routes/contactRoutes.js';

const app = express();
app.use(express.json());
app.use(cors());

// Connect DB
connectDB();

// JWT secret and Agora credentials
const JWT_SECRET = process.env.JWT_SECRET;
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// -------------------- USER AUTH ROUTES -------------------- //

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, phoneNo } = req.body;
    const defaultCountry = 'IN';
    const phoneNumber = parsePhoneNumberWithError(phoneNo, defaultCountry);

    if (!phoneNumber || !phoneNumber.isValid()) {
      return res.status(400).json({ message: 'Invalid phone number.' });
    }

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
      phoneNo: normalizedPhone,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

    const payload = { userId: user._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, message: 'Logged in successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

// Profile route
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ name: user.name, email: user.email, phoneNo: user.phoneNo });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Contacts route
app.use('/api/contacts', auth, contactRoutes);

// -------------------- AGORA TOKEN GENERATION -------------------- //

app.post('/api/agora/token', auth, (req, res) => {
  try {
    const { channelName } = req.body;
    if (!channelName) return res.status(400).json({ message: 'Channel name is required' });

    const uid = 0; // can be random or userId
    const role = RtcRole.PUBLISHER;
    const expireTime = 3600; // 1 hour

    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTime
    );

    res.json({ token });
  } catch (error) {
    console.error('Error generating Agora token:', error);
    res.status(500).json({ message: 'Failed to generate token' });
  }
});

// -------------------- SOCKET.IO (ONLINE USERS) -------------------- //

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const activeUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('acceptCall', ({ toPhone, channelName, token }) => {
  const targetSocketId = activeUsers[toPhone];
  if (targetSocketId) {
    io.to(targetSocketId).emit('callAccepted', { channelName, token });
  }
});

  socket.on('register', (phoneNo) => {
    activeUsers[phoneNo] = socket.id;
    console.log(`User registered: ${phoneNo} (${socket.id})`);
  });

  socket.on('call-user', ({ from, to, channelName }) => {
    const targetSocketId = activeUsers[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('incoming-call', { fromPhone: from, channelName });
    } else {
      socket.emit('user-offline', { message: 'User not available' });
    }
  });

  socket.on('disconnect', () => {
    for (const phone in activeUsers) {
      if (activeUsers[phone] === socket.id) {
        delete activeUsers[phone];
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// -------------------- START SERVER -------------------- //

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
*/

import { parsePhoneNumberWithError } from 'libphonenumber-js';
import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import pkg from 'agora-access-token'; 
const { RtcTokenBuilder, RtcRole } = pkg;
import crypto from 'crypto';
import createTransporter from './utils/mailer.js';
// Import DB connection and User model (Assuming these files exist)
import connectDB from './config/db.js';
import { User } from './models/User.js';
import contactRoutes from './routes/contactRoutes.js';

const app = express();
app.use(express.json());
app.use(cors());

// Connect DB
connectDB();

// JWT secret and Agora credentials
const JWT_SECRET = process.env.JWT_SECRET;
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// -------------------- USER AUTH ROUTES -------------------- //

// Register
// Replace existing /api/register handler with this
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, phoneNo } = req.body;

    // Basic presence/type checks
    if (!name || !email || !password || !phoneNo) {
      return res.status(400).json({ message: 'name, email, password and phoneNo are required.' });
    }
    if (typeof phoneNo !== 'string') {
      return res.status(400).json({ message: 'phoneNo must be a string.' });
    }

    const trimmedPhone = phoneNo.trim();
    const defaultCountry = 'IN';

    // Parse phone safely
    let phoneNumber;
    try {
      phoneNumber = parsePhoneNumberWithError(trimmedPhone, defaultCountry);
    } catch (parseErr) {
      return res.status(400).json({ message: 'Invalid phone number format.' });
    }

    if (!phoneNumber || !phoneNumber.isValid()) {
      return res.status(400).json({ message: 'Invalid phone number.' });
    }

    const normalizedPhone = phoneNumber.format('E.164'); // e.g. +919876543210

    // Check duplicate email or phone (note: schema expects `phone`)
    const existingUser = await User.findOne({ $or: [{ email }, { phone: normalizedPhone }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Email or phone already in use.' });
    }

    // Hash and save (save as `phone` to match schema)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone: normalizedPhone, // <-- saved to `phone` (matches your schema)
    });

    await newUser.save();

    // Optional: auto-login
    const payload = { userId: newUser._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '6h' });

    return res.status(201).json({ message: 'User registered successfully!', token });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
});


// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

    const payload = { userId: user._id, phoneNo: user.phoneNo }; // Include phoneNo in payload
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, message: 'Logged in successfully!', phoneNo: user.phoneNo });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided.');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains userId and phoneNo
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

// ---------- OTP Password Reset Endpoints ---------- //
 // adjust path if your server file location differs

// Request OTP — sends OTP via email
app.post('/api/request-reset-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Generate 6-digit OTP
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    const hashedOtp = crypto.createHash('sha256').update(otpPlain).digest('hex');

    // Save hashed OTP + expiry + attempts
    user.resetOtp = hashedOtp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.resetOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    // Prepare email
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'HearMe — Password reset OTP',
      text: `Your HearMe OTP is ${otpPlain}. It expires in 10 minutes.`,
      html: `<p>Your HearMe OTP is <strong>${otpPlain}</strong>. It expires in 10 minutes.</p>`
    };

    try {
      await transporter.sendMail(mailOptions);
      // In development return OTP for testing; remove in production
      const devResponse = process.env.NODE_ENV === 'production' ? {} : { otp: otpPlain };
      return res.status(200).json({ message: 'OTP sent to your email.', ...devResponse });
    } catch (mailErr) {
      // clear otp fields on failure
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      user.resetOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });
      console.error('Error sending OTP email:', mailErr);
      return res.status(500).json({ message: 'Failed to send OTP email.' });
    }
  } catch (err) {
    console.error('request-reset-otp error:', err);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// Reset password using OTP
app.post('/api/reset-password-otp', async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, otp and new password are required.' });
    }

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

    const hashedProvided = crypto.createHash('sha256').update(otp).digest('hex');
    if (hashedProvided !== user.resetOtp) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // OTP valid -> update password and clear reset fields
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = 0;
    user.passwordChangedAt = Date.now();
    await user.save();

    return res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('reset-password-otp error:', err);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// Profile route
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ name: user.name, email: user.email, phoneNo: user.phoneNo });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Contacts route
app.use('/api/contacts', auth, contactRoutes);

// -------------------- AGORA TOKEN GENERATION (USED for Call Initialization by the Server) -------------------- //

// This route is now redundant since the token is generated in the socket handler, but is kept 
// in case the client needs a token for other features. The auth middleware ensures security.
app.post('/api/agora/token', auth, (req, res) => {
  try {
    const { channelName } = req.body;
    if (!channelName) return res.status(400).json({ message: 'Channel name is required' });

    const uid = 0;
    const role = RtcRole.PUBLISHER;
    const expireTime = 3600;

    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTime
    );

    res.json({ token });
  } catch (error) {
    console.error('Error generating Agora token:', error);
    res.status(500).json({ message: 'Failed to generate token' });
  }
});

// -------------------- SOCKET.IO (ONLINE USERS & CALL SIGNALING) -------------------- //

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const activeUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 1. REGISTER: Maps phoneNo to socket.id
  socket.on('register', (phoneNo) => {
    // Clean up any old entries for this socket before registering the new one
    for (const phone in activeUsers) {
      if (activeUsers[phone] === socket.id) {
        delete activeUsers[phone];
        break;
      }
    }
    activeUsers[phoneNo] = socket.id;
    console.log(`User registered: ${phoneNo} (${socket.id})`);
    // Optional: Emit list of online users
  });

  // 2. CALL-USER: Caller initiates the call (no token yet)
  socket.on('call-user', ({ from, to, channelName }) => {
    const targetSocketId = activeUsers[to];
    if (targetSocketId) {
      // Send call request to receiver
      io.to(targetSocketId).emit('incoming-call', { fromPhone: from, channelName });
    } else {
      socket.emit('user-offline', { message: 'User not available' });
    }
  });

  // 3. ACCEPT-CALL: Receiver accepts and server generates the token for both parties
  socket.on('acceptCall', ({ toPhone, channelName }) => { // toPhone is the original caller's phone
    const targetSocketId = activeUsers[toPhone]; // Caller's socket ID

    // Generate Agora Token for the channel
    const uid = 0; 
    const role = RtcRole.PUBLISHER;
    const expireTime = 3600;
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTime
    );

    // 3a. Send 'callAccepted' to the original caller (targetSocketId)
    if (targetSocketId) {
      io.to(targetSocketId).emit('callAccepted', { channelName, token });
    }

    // 3b. Send 'callAccepted' to the receiver (current socket) immediately
    socket.emit('callAccepted', { channelName, token });
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    for (const phone in activeUsers) {
      if (activeUsers[phone] === socket.id) {
        delete activeUsers[phone];
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });


});


// -------------------- START SERVER -------------------- //

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));