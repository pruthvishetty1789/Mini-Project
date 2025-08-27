// routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

// Public routes (no token required)
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Protected routes (token required)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;