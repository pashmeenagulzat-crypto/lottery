import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Ticket, Trophy, Users, BarChart2 } from 'lucide-react';
import { getAdminStats, getAllTransactions } from '../../services/api';
import type { AdminStats, Transaction } from '../../types';

const AdminAnalytics: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getAdminStats(), getAllTransactions()])
      .then(([statsRes, txRes]) => {
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
        if (txRes.status === 'fulfilled') setTransactions(txRes.value.data.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const totalRevenue = transactions.filter((t) => t.type === 'purchase' && t.status === 'completed')
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalPayouts = transactions.filter((t) => t.type === 'winning' && t.status === 'completed')
    .reduce((s, t) => s + Number(t.amount), 0);
  const profit = totalRevenue - totalPayouts;
  const totalDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'completed')
    .reduce((s, t) => s + Number(t.amount), 0);

  const analyticsCards = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'from-green-500 to-emerald-600', desc: 'From ticket sales' },
    { label: 'Total Payouts', value: `₹${totalPayouts.toLocaleString('en-IN')}`, icon: Trophy, color: 'from-amber-500 to-orange-600', desc: 'Prizes awarded' },
    { label: 'Net Profit', value: `₹${profit.toLocaleString('en-IN')}`, icon: TrendingUp, color: profit >= 0 ? 'from-blue-500 to-cyan-600' : 'from-red-500 to-rose-600', desc: 'Revenue - Payouts' },
    { label: 'Total Deposits', value: `₹${totalDeposits.toLocaleString('en-IN')}`, icon: Ticket, color: 'from-violet-500 to-purple-600', desc: 'User deposits approved' },
  ];

  // Group transactions by day for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });

  const revenueByDay = last7Days.map((day) =>
    transactions
      .filter((t) => t.type === 'purchase' && t.status === 'completed' && new Date(t.created_at).toDateString() === day)
      .reduce((s, t) => s + Number(t.amount), 0)
  );

  const maxRevenue = Math.max(...revenueByDay, 1);

  return (
    <div className="px-4 pt-4 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-white/40 text-sm mt-0.5">Financial overview & insights</p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {isLoading
          ? [1, 2, 3, 4].map((i) => <div key={i} className="h-24 glass rounded-xl animate-pulse" />)
          : analyticsCards.map(({ label, value, icon: Icon, color, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className="glass rounded-xl p-4"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
                  <Icon size={16} className="text-white" />
                </div>
                <p className="text-white font-black text-lg leading-none">{value}</p>
                <p className="text-white/50 text-xs mt-1">{label}</p>
                <p className="text-white/30 text-[10px] mt-0.5">{desc}</p>
              </motion.div>
            ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-4 mb-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={16} className="text-violet-400" />
          <h3 className="text-white font-semibold text-sm">Revenue Last 7 Days</h3>
        </div>
        <div className="flex items-end gap-2 h-28">
          {revenueByDay.map((rev, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-white/30 text-[9px]">
                {rev > 0 ? `₹${rev >= 1000 ? `${(rev / 1000).toFixed(0)}k` : rev}` : ''}
              </p>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(rev / maxRevenue) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
                className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-purple-400 min-h-[2px]"
                style={{ height: `${Math.max((rev / maxRevenue) * 100, 4)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {last7Days.map((day) => (
            <span key={day} className="text-white/30 text-[10px] flex-1 text-center">
              {new Date(day).toLocaleDateString('en', { weekday: 'short' })}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Profit Meter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-green-400" />
          <h3 className="text-white font-semibold text-sm">Profit Margin</h3>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-xs">Profit / Revenue</span>
          <span className="text-green-400 font-bold text-sm">
            {totalRevenue > 0 ? `${((profit / totalRevenue) * 100).toFixed(1)}%` : 'N/A'}
          </span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${profit >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`}
            initial={{ width: 0 }}
            animate={{ width: `${totalRevenue > 0 ? Math.min(Math.abs(profit / totalRevenue) * 100, 100) : 0}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div>
            <p className="text-white/40 text-[10px]">Revenue</p>
            <p className="text-green-400 font-bold text-sm">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-white/40 text-[10px]">Payouts</p>
            <p className="text-red-400 font-bold text-sm">₹{totalPayouts.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-white/40 text-[10px]">Net</p>
            <p className={`font-bold text-sm ${profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              ₹{profit.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;
