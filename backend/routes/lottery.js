const express = require('express');
const router = express.Router();
const { getAllLotteries, getLotteryById, createLottery, updateLottery, deleteLottery } = require('../controllers/lotteryController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

router.get('/', getAllLotteries);
router.get('/:id', getLotteryById);
router.post('/', authenticateToken, requireAdmin, createLottery);
router.put('/:id', authenticateToken, requireAdmin, updateLottery);
router.delete('/:id', authenticateToken, requireAdmin, deleteLottery);

module.exports = router;
