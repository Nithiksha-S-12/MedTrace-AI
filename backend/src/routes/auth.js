const express = require('express');
const { mockLogin } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login — Mock login for demo
router.post('/login', (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: 'ID and password are required' });
  }

  const result = mockLogin(id, password);

  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  res.json({
    success: true,
    token: result.token,
    user: result.user,
  });
});

// GET /api/auth/me — Get current user from token
router.get('/me', require('../middleware/auth').authenticate, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
