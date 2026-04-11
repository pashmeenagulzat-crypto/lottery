const { pool } = require('../config/database');
const { generateBulkTicketNumbers } = require('../utils/ticketGenerator');

const buyTickets = async (req, res) => {
  const { lotteryId, quantity } = req.body;
  const userId = req.user.id;

  if (!lotteryId || !quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: 'lotteryId and quantity (min 1) are required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [lotteries] = await conn.query(
      'SELECT * FROM lotteries WHERE id = ? AND status = ? FOR UPDATE',
      [lotteryId, 'active']
    );

    if (lotteries.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Lottery not found or not active' });
    }

    const lottery = lotteries[0];

    if (new Date(lottery.draw_time) <= new Date()) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Lottery draw time has passed' });
    }

    const available = lottery.total_tickets - lottery.tickets_sold;
    if (quantity > available) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: `Only ${available} ticket(s) available` });
    }

    const totalCost = parseFloat(lottery.ticket_price) * quantity;

    const [users] = await conn.query('SELECT wallet FROM users WHERE id = ? FOR UPDATE', [userId]);
    if (parseFloat(users[0].wallet) < totalCost) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: `Insufficient wallet balance. Need ₹${totalCost.toFixed(2)}, have ₹${parseFloat(users[0].wallet).toFixed(2)}` });
    }

    // Find next available ticket index
    const [maxTicket] = await conn.query(
      "SELECT ticket_number FROM tickets WHERE lottery_id = ? ORDER BY ticket_number DESC LIMIT 1",
      [lotteryId]
    );

    let startIndex = 1;
    if (maxTicket.length > 0) {
      const lastNum = parseInt(maxTicket[0].ticket_number.replace('LT-', ''), 10);
      startIndex = lastNum + 1;
    }

    const ticketNumbers = generateBulkTicketNumbers(startIndex, quantity);

    const ticketValues = ticketNumbers.map((tn) => [userId, lotteryId, tn]);
    await conn.query('INSERT INTO tickets (user_id, lottery_id, ticket_number) VALUES ?', [ticketValues]);

    await conn.query('UPDATE users SET wallet = wallet - ? WHERE id = ?', [totalCost, userId]);
    await conn.query('UPDATE lotteries SET tickets_sold = tickets_sold + ? WHERE id = ?', [quantity, lotteryId]);

    await conn.query(
      `INSERT INTO transactions (user_id, amount, type, status, reference)
       VALUES (?, ?, 'ticket_purchase', 'completed', ?)`,
      [userId, totalCost, `Purchased ${quantity} ticket(s) for lottery #${lotteryId}`]
    );

    await conn.commit();

    const [purchased] = await pool.query(
      'SELECT * FROM tickets WHERE lottery_id = ? AND user_id = ? ORDER BY purchased_at DESC LIMIT ?',
      [lotteryId, userId, quantity]
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('ticket_sold', { lotteryId, quantity, ticketsAvailable: available - quantity });
    }

    return res.status(201).json({
      success: true,
      message: `${quantity} ticket(s) purchased successfully`,
      data: {
        tickets: purchased,
        totalCost,
        ticketNumbers,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error('buyTickets error:', err);
    return res.status(500).json({ success: false, message: 'Failed to purchase tickets' });
  } finally {
    conn.release();
  }
};

const getMyTickets = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, l.name AS lottery_name, l.draw_time, l.status AS lottery_status,
              l.prize_pool, l.ticket_price
       FROM tickets t
       JOIN lotteries l ON t.lottery_id = l.id
       WHERE t.user_id = ?
       ORDER BY t.purchased_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getMyTickets error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
};

const getTicketsByLottery = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT t.*, u.mobile, u.name AS user_name
       FROM tickets t
       JOIN users u ON t.user_id = u.id
       WHERE t.lottery_id = ?
       ORDER BY t.purchased_at ASC`,
      [id]
    );
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    console.error('getTicketsByLottery error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
};

module.exports = { buyTickets, getMyTickets, getTicketsByLottery };
