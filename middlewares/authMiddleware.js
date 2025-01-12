const jwt = require('../config/jwt');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract Bearer token

  if (!token) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verifyToken(token); // Verify token using correct secret key
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
