// server.js

import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import pkg from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = pkg;

import connectDB from './config/db.js';
import { User } from './models/User.js';
import contactRoutes from './routes/contactRoutes.js';

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

const JWT_SECRET = process.env.JWT_SECRET;
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

if (!APP_ID || !APP_CERTIFICATE) {
  console.log("❌ ERROR: Agora APP_ID or APP_CERTIFICATE missing in .env");
}

app.use('/api/contacts', contactRoutes);

// ✅ REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) return res.status(409).json({ message: 'Email already in use.' });

    const existingUserPhone = await User.findOne({ phone });
    if (existingUserPhone) return res.status(409).json({ message: 'Phone number already in use.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, phone, password: hashedPassword, contacts: [] });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// ✅ LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, phone: user.phone }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, phone: user.phone, message: "Logged in successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error during login." });
  }
});

// ✅ AUTH MIDDLEWARE
const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Please authenticate." });
  }
};

// ✅ DEBUG: PROFILE
app.get('/api/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  res.json(user);
});

// ✅ SOCKET + AGORA CALL FEATURE ------------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const activeUsers = {}; // { phone: socketId }

io.on("connection", (socket) => {
  console.log("📡 User connected:", socket.id);

  socket.on("register", (phone) => {
    activeUsers[phone] = socket.id;
    console.log("✅ Registered:", phone, "=>", socket.id);
  });

  socket.on("call-user", ({ from, to, channelName }) => {
    const targetSocket = activeUsers[to];
    if (!targetSocket) {
      socket.emit("user-offline", { message: "User is offline" });
      return;
    }
    io.to(targetSocket).emit("incoming-call", { fromPhone: from, channelName });
  });

  socket.on("acceptCall", ({ toPhone, channelName }) => {
    const callerSocket = activeUsers[toPhone];

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      0,
      RtcRole.PUBLISHER,
      Math.floor(Date.now() / 1000) + 3600
    );

    socket.emit("callAccepted", { channelName, token });
    if (callerSocket) io.to(callerSocket).emit("callAccepted", { channelName, token });
  });

  socket.on("rejectCall", ({ toPhone }) => {
    const callerSocket = activeUsers[toPhone];
    if (callerSocket) io.to(callerSocket).emit("callRejected", { message: "Call rejected" });
  });

  socket.on("disconnect", () => {
    Object.keys(activeUsers).forEach((phone) => {
      if (activeUsers[phone] === socket.id) delete activeUsers[phone];
    });
    console.log("❌ Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
