const cron = require('node-cron');
const { pool } = require('../config/database');

const autoDraw = async (io) => {
  try {
    const [lotteries] = await pool.query(
      "SELECT * FROM lotteries WHERE status = 'active' AND draw_time <= NOW()"
    );

    for (const lottery of lotteries) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        const [existing] = await conn.query('SELECT id FROM winners WHERE lottery_id = ?', [lottery.id]);
        if (existing.length > 0) {
          await conn.query("UPDATE lotteries SET status = 'completed' WHERE id = ?", [lottery.id]);
          await conn.commit();
          continue;
        }

        const [tickets] = await conn.query('SELECT * FROM tickets WHERE lottery_id = ?', [lottery.id]);

        if (tickets.length === 0) {
          await conn.query("UPDATE lotteries SET status = 'cancelled' WHERE id = ?", [lottery.id]);
          await conn.commit();
          console.log(`[CRON] Lottery #${lottery.id} cancelled - no tickets sold`);
          if (io) io.emit('lottery_updated', { action: 'cancelled', lotteryId: lottery.id });
          continue;
        }

        const winnerTicket = tickets[Math.floor(Math.random() * tickets.length)];

        await conn.query(
          'INSERT INTO winners (lottery_id, user_id, ticket_number, prize_amount) VALUES (?, ?, ?, ?)',
          [lottery.id, winnerTicket.user_id, winnerTicket.ticket_number, lottery.prize_pool]
        );

        await conn.query('UPDATE users SET wallet = wallet + ? WHERE id = ?', [lottery.prize_pool, winnerTicket.user_id]);

        await conn.query(
          `INSERT INTO transactions (user_id, amount, type, status, reference)
           VALUES (?, ?, 'winning', 'completed', ?)`,
          [winnerTicket.user_id, lottery.prize_pool, `Won lottery #${lottery.id} - ${lottery.name} (auto-draw)`]
        );

        await conn.query("UPDATE lotteries SET status = 'completed' WHERE id = ?", [lottery.id]);
        await conn.commit();

        console.log(`[CRON] Auto-draw completed for lottery #${lottery.id}. Winner ticket: ${winnerTicket.ticket_number}`);

        if (io) {
          const [winnerDetails] = await pool.query(
            `SELECT w.*, u.name AS winner_name, u.mobile AS winner_mobile, l.name AS lottery_name
             FROM winners w
             JOIN users u ON w.user_id = u.id
             JOIN lotteries l ON w.lottery_id = l.id
             WHERE w.lottery_id = ?`,
            [lottery.id]
          );
          io.emit('new_winner', { lotteryId: lottery.id, winner: winnerDetails[0] });
          io.emit('lottery_updated', { action: 'completed', lotteryId: lottery.id });
        }
      } catch (err) {
        await conn.rollback();
        console.error(`[CRON] Error drawing lottery #${lottery.id}:`, err.message);
      } finally {
        conn.release();
      }
    }
  } catch (err) {
    console.error('[CRON] autoDraw error:', err.message);
  }
};

const startCronJobs = (io) => {
  // Run every minute
  cron.schedule('* * * * *', () => {
    autoDraw(io);
  });

  console.log('✅ CRON jobs started');
};

module.exports = { startCronJobs };
