const { pool } = require('../config/database');

const performDraw = async (req, res) => {
  const { lotteryId } = req.params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [lotteries] = await conn.query(
      "SELECT * FROM lotteries WHERE id = ? AND status IN ('active', 'drawing') FOR UPDATE",
      [lotteryId]
    );

    if (lotteries.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Lottery not found or already completed' });
    }

    const lottery = lotteries[0];

    const [ticketRows] = await conn.query(
      'SELECT * FROM tickets WHERE lottery_id = ?',
      [lotteryId]
    );

    if (ticketRows.length === 0) {
      await conn.query("UPDATE lotteries SET status = 'cancelled' WHERE id = ?", [lotteryId]);
      await conn.commit();
      return res.json({ success: true, message: 'No tickets sold. Lottery cancelled.' });
    }

    await conn.query("UPDATE lotteries SET status = 'drawing' WHERE id = ?", [lotteryId]);

    const winnerTicket = ticketRows[Math.floor(Math.random() * ticketRows.length)];

    const [existing] = await conn.query('SELECT id FROM winners WHERE lottery_id = ?', [lotteryId]);
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Draw already performed for this lottery' });
    }

    await conn.query(
      'INSERT INTO winners (lottery_id, user_id, ticket_number, prize_amount) VALUES (?, ?, ?, ?)',
      [lotteryId, winnerTicket.user_id, winnerTicket.ticket_number, lottery.prize_pool]
    );

    await conn.query('UPDATE users SET wallet = wallet + ? WHERE id = ?', [lottery.prize_pool, winnerTicket.user_id]);

    await conn.query(
      `INSERT INTO transactions (user_id, amount, type, status, reference)
       VALUES (?, ?, 'winning', 'completed', ?)`,
      [winnerTicket.user_id, lottery.prize_pool, `Won lottery #${lotteryId} - ${lottery.name}`]
    );

    await conn.query("UPDATE lotteries SET status = 'completed' WHERE id = ?", [lotteryId]);

    await conn.commit();

    const [winnerDetails] = await pool.query(
      `SELECT w.*, u.name AS winner_name, u.mobile AS winner_mobile, l.name AS lottery_name
       FROM winners w
       JOIN users u ON w.user_id = u.id
       JOIN lotteries l ON w.lottery_id = l.id
       WHERE w.lottery_id = ?`,
      [lotteryId]
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('new_winner', { lotteryId: parseInt(lotteryId), winner: winnerDetails[0] });
      io.emit('lottery_updated', { action: 'completed', lotteryId: parseInt(lotteryId) });
    }

    return res.json({
      success: true,
      message: 'Draw performed successfully',
      data: winnerDetails[0],
    });
  } catch (err) {
    await conn.rollback();
    console.error('performDraw error:', err);
    return res.status(500).json({ success: false, message: 'Failed to perform draw' });
  } finally {
    conn.release();
  }
};

const getWinners = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT w.*, u.name AS winner_name, u.mobile AS winner_mobile, l.name AS lottery_name
       FROM winners w
       JOIN users u ON w.user_id = u.id
       JOIN lotteries l ON w.lottery_id = l.id
       ORDER BY w.announced_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getWinners error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch winners' });
  }
};

const getLotteryWinner = async (req, res) => {
  const { lotteryId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT w.*, u.name AS winner_name, u.mobile AS winner_mobile, l.name AS lottery_name
       FROM winners w
       JOIN users u ON w.user_id = u.id
       JOIN lotteries l ON w.lottery_id = l.id
       WHERE w.lottery_id = ?`,
      [lotteryId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No winner found for this lottery yet' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getLotteryWinner error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch winner' });
  }
};

module.exports = { performDraw, getWinners, getLotteryWinner };
