const express = require('express');
const router = express.Router();
const { buyTickets, getMyTickets, getTicketsByLottery } = require('../controllers/ticketController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { strictLimiter } = require('../middlewares/rateLimiter');

router.post('/buy', authenticateToken, strictLimiter, buyTickets);
router.get('/my', authenticateToken, getMyTickets);
router.get('/lottery/:id', authenticateToken, requireAdmin, getTicketsByLottery);

module.exports = router;
