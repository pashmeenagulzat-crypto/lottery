const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { generateOTP } = require('../utils/otpGenerator');

const sendOTP = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile || !/^\d{10,15}$/.test(mobile)) {
    return res.status(400).json({ success: false, message: 'Valid mobile number is required (10-15 digits)' });
  }

  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000);

    await pool.query(
      'INSERT INTO otp_verifications (mobile, otp, expires_at) VALUES (?, ?, ?)',
      [mobile, otp, expiresAt]
    );

    // In production, send via SMS provider. In dev, return in response.
    const response = { success: true, message: 'OTP sent successfully' };
    if (process.env.NODE_ENV !== 'production') {
      response.otp = otp;
    }

    return res.json(response);
  } catch (err) {
    console.error('sendOTP error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

const verifyOTP = async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
  }

  try {
    const [otpRows] = await pool.query(
      `SELECT id FROM otp_verifications
       WHERE mobile = ? AND otp = ? AND verified = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [mobile, otp]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await pool.query('UPDATE otp_verifications SET verified = TRUE WHERE id = ?', [otpRows[0].id]);

    let [userRows] = await pool.query('SELECT * FROM users WHERE mobile = ?', [mobile]);
    let user;

    if (userRows.length === 0) {
      const referralCode = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const [result] = await pool.query(
        'INSERT INTO users (mobile, referral_code) VALUES (?, ?)',
        [mobile, referralCode]
      );
      const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newUser[0];
    } else {
      user = userRows[0];
    }

    const token = jwt.sign(
      { userId: user.id, mobile: user.mobile, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          mobile: user.mobile,
          name: user.name,
          wallet: user.wallet,
          is_admin: user.is_admin,
          referral_code: user.referral_code,
        },
      },
    });
  } catch (err) {
    console.error('verifyOTP error:', err);
    return res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, mobile, name, wallet, is_admin, referral_code, referred_by, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

module.exports = { sendOTP, verifyOTP, getProfile };
