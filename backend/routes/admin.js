const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, getAllTransactions, getPendingDeposits } = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

router.use(authenticateToken, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/transactions', getAllTransactions);
router.get('/deposits/pending', getPendingDeposits);

module.exports = router;
