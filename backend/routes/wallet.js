const express = require('express');
const router = express.Router();
const { getWalletBalance, requestDeposit, approveDeposit, rejectDeposit, getTransactions } = require('../controllers/walletController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

router.get('/balance', authenticateToken, getWalletBalance);
router.post('/deposit', authenticateToken, requestDeposit);
router.get('/transactions', authenticateToken, getTransactions);
router.post('/approve/:id', authenticateToken, requireAdmin, approveDeposit);
router.post('/reject/:id', authenticateToken, requireAdmin, rejectDeposit);

module.exports = router;
