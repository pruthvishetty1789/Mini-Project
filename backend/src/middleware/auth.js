// middleware/auth.js

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    console.log('Auth header:', req.header('Authorization'));
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("jwt token middleware",token);
    console.log("decoded token",decoded);
    req.user = decoded; // Add user payload to the request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed. Invalid token.' });
  }
};

module.exports = auth;