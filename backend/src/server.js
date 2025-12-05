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
import connectDB from './config/db.js';
import { User } from './models/User.js';
import contactRoutes from './routes/contactRoutes.js';
import createTransporter from './utils/mailer.js';
// ✅ gTTS for TTS
import gTTS from 'gtts'; 
import path from 'path';
import fs from 'fs';

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
    const payload = { userId: newUser._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    
    res.status(201).json({ message: 'User registered successfully!', token });
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

    const payload = { userId: user._id, phoneNo: user.phoneNo };
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
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

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

// -------------------- AGORA TOKEN GENERATION -------------------- //

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

// -------------------- NEW TTS ROUTE -------------------- //

const AUDIO_DIR = path.join(process.cwd(), 'audio_files');
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR);

app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const filename = `tts_${Date.now()}.mp3`;
    const filepath = path.join(AUDIO_DIR, filename);

    const tts = new gTTS(text, 'en');
    tts.save(filepath, (err) => {
      if (err) {
        return res.status(500).json({ message: 'TTS generation failed', error: err.message });
      }
      const url = `/audio/${filename}`;
      res.json({ url });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during TTS.', error: error.message });
  }
});

app.use('/audio', express.static(AUDIO_DIR));

// -------------------- SOCKET.IO -------------------- //

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const activeUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (phoneNo) => {
    for (const phone in activeUsers) {
      if (activeUsers[phone] === socket.id) {
        delete activeUsers[phone];
        break;
      }
    }
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

  socket.on('acceptCall', ({ toPhone, channelName }) => {
    const targetSocketId = activeUsers[toPhone];

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

    if (targetSocketId) {
      io.to(targetSocketId).emit('callAccepted', { channelName, token });
    }
    socket.emit('callAccepted', { channelName, token });
  });

  socket.on('rejectCall', ({ toPhone, channelName }) => {
    const targetSocketId = activeUsers[toPhone];
    if (targetSocketId) {
        // Notify the calling user that the call was rejected
        io.to(targetSocketId).emit('callRejected', { 
            message: `Your call to ${toPhone} was rejected.`,
            channelName 
        });
    }
});

// End Call Handler
socket.on('end-call', ({ fromPhone, toPhone }) => {
    const targetSocketId = activeUsers[toPhone];
    if (targetSocketId) {
        // Notify the remote user that the call has ended
        io.to(targetSocketId).emit('callEnded', { 
            message: `${fromPhone} has ended the call.`,
            fromPhone 
        });
    }
    // Note: The 'end-call' event should also clear states on the client that originated the call.
    // The client should handle clearing its own state, but this informs the other party.
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
