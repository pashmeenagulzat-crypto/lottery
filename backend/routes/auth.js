const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { otpLimiter } = require('../middlewares/rateLimiter');

router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
