const { pool } = require('../config/database');

const getAllLotteries = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, u.name AS created_by_name,
              (l.total_tickets - l.tickets_sold) AS tickets_available
       FROM lotteries l
       LEFT JOIN users u ON l.created_by = u.id
       WHERE l.status = 'active'
       ORDER BY l.draw_time ASC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getAllLotteries error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch lotteries' });
  }
};

const getLotteryById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT l.*, u.name AS created_by_name,
              (l.total_tickets - l.tickets_sold) AS tickets_available
       FROM lotteries l
       LEFT JOIN users u ON l.created_by = u.id
       WHERE l.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lottery not found' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getLotteryById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch lottery' });
  }
};

const createLottery = async (req, res) => {
  const { name, description, ticket_price, total_tickets, prize_pool, draw_time, image_url } = req.body;

  if (!name || !ticket_price || !total_tickets || !prize_pool || !draw_time) {
    return res.status(400).json({ success: false, message: 'name, ticket_price, total_tickets, prize_pool, and draw_time are required' });
  }

  if (new Date(draw_time) <= new Date()) {
    return res.status(400).json({ success: false, message: 'draw_time must be in the future' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO lotteries (name, description, ticket_price, total_tickets, prize_pool, draw_time, image_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, ticket_price, total_tickets, prize_pool, draw_time, image_url || null, req.user.id]
    );

    const [lottery] = await pool.query('SELECT * FROM lotteries WHERE id = ?', [result.insertId]);

    const io = req.app.get('io');
    if (io) io.emit('lottery_updated', { action: 'created', lottery: lottery[0] });

    return res.status(201).json({ success: true, message: 'Lottery created', data: lottery[0] });
  } catch (err) {
    console.error('createLottery error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create lottery' });
  }
};

const updateLottery = async (req, res) => {
  const { id } = req.params;
  const { name, description, ticket_price, total_tickets, prize_pool, draw_time, status, image_url } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM lotteries WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Lottery not found' });
    }

    const lottery = existing[0];
    await pool.query(
      `UPDATE lotteries SET
        name = ?, description = ?, ticket_price = ?, total_tickets = ?,
        prize_pool = ?, draw_time = ?, status = ?, image_url = ?
       WHERE id = ?`,
      [
        name ?? lottery.name,
        description ?? lottery.description,
        ticket_price ?? lottery.ticket_price,
        total_tickets ?? lottery.total_tickets,
        prize_pool ?? lottery.prize_pool,
        draw_time ?? lottery.draw_time,
        status ?? lottery.status,
        image_url ?? lottery.image_url,
        id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM lotteries WHERE id = ?', [id]);

    const io = req.app.get('io');
    if (io) io.emit('lottery_updated', { action: 'updated', lottery: updated[0] });

    return res.json({ success: true, message: 'Lottery updated', data: updated[0] });
  } catch (err) {
    console.error('updateLottery error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update lottery' });
  }
};

const deleteLottery = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.query('SELECT * FROM lotteries WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Lottery not found' });
    }

    if (existing[0].tickets_sold > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete lottery with sold tickets. Cancel it instead.' });
    }

    await pool.query('DELETE FROM lotteries WHERE id = ?', [id]);

    const io = req.app.get('io');
    if (io) io.emit('lottery_updated', { action: 'deleted', lotteryId: parseInt(id) });

    return res.json({ success: true, message: 'Lottery deleted' });
  } catch (err) {
    console.error('deleteLottery error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete lottery' });
  }
};

module.exports = { getAllLotteries, getLotteryById, createLottery, updateLottery, deleteLottery };
