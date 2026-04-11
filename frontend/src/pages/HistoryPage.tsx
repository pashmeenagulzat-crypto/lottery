import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTransactions } from '../services/api';
import type { Transaction } from '../types';
import TransactionItem from '../components/TransactionItem';
import { TransactionSkeleton } from '../components/LoadingSkeleton';
import { History, Filter } from 'lucide-react';

type FilterType = 'all' | 'deposit' | 'purchase' | 'winning' | 'refund';

const HistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    getTransactions()
      .then((res) => setTransactions(res.data.data))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (filter === 'all') setFiltered(transactions);
    else setFiltered(transactions.filter((t) => t.type === filter));
  }, [transactions, filter]);

  const filters: { key: FilterType; label: string; emoji: string }[] = [
    { key: 'all', label: 'All', emoji: '📋' },
    { key: 'deposit', label: 'Deposits', emoji: '💰' },
    { key: 'purchase', label: 'Purchases', emoji: '🎟' },
    { key: 'winning', label: 'Winnings', emoji: '🏆' },
    { key: 'refund', label: 'Refunds', emoji: '↩️' },
  ];

  const totalWon = transactions.filter((t) => t.type === 'winning' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSpent = transactions.filter((t) => t.type === 'purchase' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="px-4 pt-4 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl font-black text-white">History</h1>
        <p className="text-white/40 text-sm mt-0.5">All your transactions</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3 mb-5"
      >
        <div className="glass rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">Total Won 🏆</p>
          <p className="text-amber-400 font-black text-xl">₹{totalWon.toLocaleString('en-IN')}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">Total Spent 🎟</p>
          <p className="text-red-400 font-black text-xl">₹{totalSpent.toLocaleString('en-IN')}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filters.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === key
                ? 'bg-violet-600 text-white shadow-lg'
                : 'bg-white/5 text-white/50 hover:text-white/70'
            }`}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="glass rounded-2xl px-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => <TransactionSkeleton key={i} />)}
          </>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center">
            <History size={36} className="text-white/20 mx-auto mb-2" />
            <p className="text-white/40 text-sm">No transactions found</p>
          </div>
        ) : (
          filtered.map((tx, i) => <TransactionItem key={tx.id} transaction={tx} index={i} />)
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
