const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', auth, logout);

module.exports = router;