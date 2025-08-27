// middleware/auth.js

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user payload to the request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed. Invalid token.' });
  }
};

module.exports = auth;