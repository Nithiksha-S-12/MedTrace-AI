const config = require('../config/config');
const jwt = require('jsonwebtoken');

// Mock users for demo mode
const MOCK_USERS = {
  '1234567890': {
    id: 'mock_citizen_001',
    email: 'citizen@demo.com',
    password: 'password',
    role: 'citizen',
    name: 'Arjun Kumar',
    healthId: '1234567890',
    governmentId: '1234567890',
    status: 'approved',
  },
  'DOC001': {
    id: 'mock_doctor_001',
    email: 'doctor@demo.com',
    password: 'password',
    role: 'doctor',
    name: 'Dr. Priya Sharma',
    licenseNumber: 'DOC001',
    status: 'approved',
  },
  'DOC002': {
    id: 'mock_diag_001',
    email: 'diagnostic@demo.com',
    password: 'password',
    role: 'diagnostic',
    name: 'Dr. Rajesh Mehta (Head Radiologist)',
    licenseNumber: 'DOC002',
    status: 'approved',
    isDiagnosticCenter: true,
  },
  'ADMIN001': {
    id: 'mock_admin_001',
    email: 'admin@demo.com',
    password: 'password',
    role: 'admin',
    name: 'Administrator - Ministry of Health',
    status: 'approved',
  },
};

/**
 * Middleware: Authenticate request
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware: Require specific role(s)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

/**
 * Mock Login — returns JWT for demo accounts
 */
const mockLogin = (userId, password) => {
  const user = MOCK_USERS[userId];
  if (!user || user.password !== password) {
    return { success: false, error: 'Invalid credentials' };
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      ...(user.healthId && { healthId: user.healthId }),
      ...(user.governmentId && { governmentId: user.governmentId }),
      ...(user.status && { status: user.status }),
      ...(user.isDiagnosticCenter && { isDiagnosticCenter: true }),
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  return { success: true, token, user: { ...user, password: undefined } };
};

module.exports = { authenticate, requireRole, mockLogin, MOCK_USERS };
