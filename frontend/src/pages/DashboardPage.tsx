import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Ticket, History, Trophy, TrendingUp, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLotteries, getTransactions, getWalletBalance } from '../services/api';
import type { Lottery, Transaction } from '../types';
import LotteryCard from '../components/LotteryCard';
import TransactionItem from '../components/TransactionItem';
import LiveTicker from '../components/LiveTicker';
import { LotteryCardSkeleton } from '../components/LoadingSkeleton';
import { useSocket } from '../hooks/useSocket';

const DashboardPage: React.FC = () => {
  const { user, updateWallet } = useAuth();
  const navigate = useNavigate();
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingLotteries, setIsLoadingLotteries] = useState(true);
  const [isLoadingTx, setIsLoadingTx] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [lotRes, txRes, walRes] = await Promise.allSettled([
        getLotteries(),
        getTransactions(),
        getWalletBalance(),
      ]);
      if (lotRes.status === 'fulfilled') setLotteries(lotRes.value.data.data.slice(0, 5));
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data.data.slice(0, 3));
      if (walRes.status === 'fulfilled') updateWallet(walRes.value.data.data.balance);
    } finally {
      setIsLoadingLotteries(false);
      setIsLoadingTx(false);
    }
  };

  useSocket({
    lottery_updated: () => loadData(),
    deposit_approved: (data: unknown) => {
      const d = data as { balance?: number };
      if (d?.balance !== undefined) updateWallet(d.balance);
    },
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatBalance = (amount: number) =>
    new Intl.NumberFormat('en-IN').format(amount ?? 0);

  const quickActions = [
    { label: 'Add Money', icon: Plus, color: 'from-green-500 to-emerald-600', path: '/wallet' },
    { label: 'Buy Tickets', icon: Ticket, color: 'from-violet-500 to-purple-600', path: '/lotteries' },
    { label: 'History', icon: History, color: 'from-blue-500 to-cyan-600', path: '/history' },
    { label: 'Winners', icon: Trophy, color: 'from-amber-500 to-orange-600', path: '/winners' },
  ];

  return (
    <div className="px-4 pt-4 pb-4">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/50 text-sm">{greeting()},</p>
            <h1 className="text-2xl font-black text-white">
              {user?.name || `User ${user?.mobile?.slice(-4)}`} 👋
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/lotteries')}
            className="flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/30 rounded-xl px-3 py-2"
          >
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-violet-400 text-xs font-semibold">Explore</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Wallet Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl mb-5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent" />
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-amber-100/70 text-xs font-medium uppercase tracking-wide">Wallet Balance</p>
              <motion.div key={user?.wallet} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-baseline gap-1 mt-1">
                <span className="text-white/80 text-lg">₹</span>
                <span className="text-white text-4xl font-black tracking-tight">
                  {formatBalance(user?.wallet ?? 0)}
                </span>
              </motion.div>
            </div>
            <div className="bg-white/20 rounded-2xl p-2.5">
              <TrendingUp size={22} className="text-white" />
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/wallet')}
              className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl py-2.5 text-white font-semibold text-sm"
            >
              <Plus size={16} />
              Add Money
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/history')}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-2.5 text-white/80 font-semibold text-sm"
            >
              Transactions
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-4 gap-3 mb-5"
      >
        {quickActions.map(({ label, icon: Icon, color, path }) => (
          <motion.button
            key={label}
            whileTap={{ scale: 0.93 }}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-2"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
              <Icon size={20} className="text-white" />
            </div>
            <span className="text-white/60 text-[11px] font-medium leading-tight text-center">{label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Live Ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-5"
      >
        <LiveTicker />
      </motion.div>

      {/* Active Lotteries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-white font-bold text-lg">Active Lotteries</h2>
            <p className="text-white/40 text-xs">{lotteries.length} running now</p>
          </div>
          <button
            onClick={() => navigate('/lotteries')}
            className="flex items-center gap-1 text-violet-400 text-sm font-medium"
          >
            See All <ChevronRight size={14} />
          </button>
        </div>

        {isLoadingLotteries ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-[200px] h-[160px] glass animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : lotteries.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-white/40 text-sm">No active lotteries right now</p>
            <p className="text-white/20 text-xs mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {lotteries.map((lottery) => (
              <LotteryCard key={lottery.id} lottery={lottery} compact />
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-lg">Recent Activity</h2>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-1 text-violet-400 text-sm font-medium"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        <div className="glass rounded-2xl px-4">
          {isLoadingTx ? (
            <div className="py-4 text-center text-white/40 text-sm">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-white/40 text-sm">No transactions yet</p>
              <p className="text-white/20 text-xs mt-1">Add money to get started</p>
            </div>
          ) : (
            transactions.map((tx, i) => (
              <TransactionItem key={tx.id} transaction={tx} index={i} />
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
