const express = require('express');
const router = express.Router();
const { performDraw, getWinners, getLotteryWinner } = require('../controllers/drawController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

router.post('/:lotteryId', authenticateToken, requireAdmin, performDraw);
router.get('/winners', getWinners);
router.get('/winners/:lotteryId', getLotteryWinner);

module.exports = router;
