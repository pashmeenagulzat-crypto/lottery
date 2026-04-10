const { pool } = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users WHERE is_admin = FALSE');
    const [[{ totalRevenue }]] = await pool.query("SELECT COALESCE(SUM(amount), 0) AS totalRevenue FROM transactions WHERE type = 'ticket_purchase' AND status = 'completed'");
    const [[{ activeLotteries }]] = await pool.query("SELECT COUNT(*) AS activeLotteries FROM lotteries WHERE status = 'active'");
    const [[{ pendingDeposits }]] = await pool.query("SELECT COUNT(*) AS pendingDeposits FROM transactions WHERE type = 'deposit' AND status = 'pending'");
    const [[{ totalTicketsSold }]] = await pool.query('SELECT COALESCE(SUM(tickets_sold), 0) AS totalTicketsSold FROM lotteries');
    const [[{ completedLotteries }]] = await pool.query("SELECT COUNT(*) AS completedLotteries FROM lotteries WHERE status = 'completed'");

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalRevenue: parseFloat(totalRevenue),
        activeLotteries,
        pendingDeposits,
        totalTicketsSold,
        completedLotteries,
      },
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, mobile, name, wallet, is_admin, referral_code, referred_by, created_at FROM users ORDER BY created_at DESC'
    );
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, u.mobile, u.name AS user_name
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`
    );
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    console.error('getAllTransactions error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
};

const getPendingDeposits = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, u.mobile, u.name AS user_name
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.type = 'deposit' AND t.status = 'pending'
       ORDER BY t.created_at ASC`
    );
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    console.error('getPendingDeposits error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch pending deposits' });
  }
};

module.exports = { getDashboardStats, getAllUsers, getAllTransactions, getPendingDeposits };
