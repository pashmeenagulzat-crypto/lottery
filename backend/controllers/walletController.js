const { pool } = require('../config/database');

const getWalletBalance = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT wallet FROM users WHERE id = ?', [req.user.id]);
    return res.json({ success: true, data: { balance: rows[0].wallet } });
  } catch (err) {
    console.error('getWalletBalance error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch balance' });
  }
};

const requestDeposit = async (req, res) => {
  const { amount, upi_id, screenshot_url } = req.body;

  if (!amount || parseFloat(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Valid amount is required' });
  }

  if (!upi_id) {
    return res.status(400).json({ success: false, message: 'UPI ID is required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO transactions (user_id, amount, type, status, upi_id, screenshot_url)
       VALUES (?, ?, 'deposit', 'pending', ?, ?)`,
      [req.user.id, amount, upi_id, screenshot_url || null]
    );

    const [txn] = await pool.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, message: 'Deposit request submitted', data: txn[0] });
  } catch (err) {
    console.error('requestDeposit error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create deposit request' });
  }
};

const approveDeposit = async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [txns] = await conn.query(
      "SELECT * FROM transactions WHERE id = ? AND type = 'deposit' AND status = 'pending' FOR UPDATE",
      [id]
    );

    if (txns.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Pending deposit not found' });
    }

    const txn = txns[0];

    await conn.query(
      "UPDATE transactions SET status = 'approved', notes = ? WHERE id = ?",
      [notes || null, id]
    );

    await conn.query('UPDATE users SET wallet = wallet + ? WHERE id = ?', [txn.amount, txn.user_id]);

    await conn.commit();
    return res.json({ success: true, message: `Deposit of ₹${txn.amount} approved and credited to wallet` });
  } catch (err) {
    await conn.rollback();
    console.error('approveDeposit error:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve deposit' });
  } finally {
    conn.release();
  }
};

const rejectDeposit = async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  try {
    const [txns] = await pool.query(
      "SELECT * FROM transactions WHERE id = ? AND type = 'deposit' AND status = 'pending'",
      [id]
    );

    if (txns.length === 0) {
      return res.status(404).json({ success: false, message: 'Pending deposit not found' });
    }

    await pool.query(
      "UPDATE transactions SET status = 'rejected', notes = ? WHERE id = ?",
      [notes || null, id]
    );

    return res.json({ success: true, message: 'Deposit request rejected' });
  } catch (err) {
    console.error('rejectDeposit error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reject deposit' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getTransactions error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
};

module.exports = { getWalletBalance, requestDeposit, approveDeposit, rejectDeposit, getTransactions };
