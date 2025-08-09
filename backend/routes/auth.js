const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login, logout, checkAuth } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/check-auth', auth, checkAuth);
router.post('/logout', logout);

module.exports = router;