const jwt = require('jsonwebtoken');

// Verify JWT Token
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

//   if (!token) {
//     return res.status(401).json({ message: 'Access token required' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//  } catch (error) {
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ message: 'Token expired, please login again' });
//     }
//     return res.status(403).json({ message: 'Invalid token' });
//   }
// };
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.id  // ← sirf yeh line add hui
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Check if user is vendor
const isVendor = (req, res, next) => {
  if (req.user.type !== 'vendor' && req.user.role !== 'vendor') {
    return res.status(403).json({ message: 'Vendor access required' });
  }
  next();
};

// Check if user is regular user
const isUser = (req, res, next) => {
  console.log("isUser check - req.user:", req.user);
  const type = req.user.type || req.user.role;
  console.log("type resolved to:", type);
  if (type !== 'user') {
    return res.status(403).json({ message: 'User access required' });
  }
  next();
};
module.exports = { verifyToken, isAdmin, isVendor, isUser };