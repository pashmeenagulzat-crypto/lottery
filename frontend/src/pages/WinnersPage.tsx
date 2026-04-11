import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Medal } from 'lucide-react';
import { getWinners } from '../services/api';
import type { Winner } from '../types';
import ConfettiEffect from '../components/ConfettiEffect';
import { format } from 'date-fns';

const WinnersPage: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    getWinners()
      .then((res) => setWinners(res.data.data))
      .finally(() => setIsLoading(false));

    const timer = setTimeout(() => setShowConfetti(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const maskMobile = (mobile: string) => {
    if (!mobile || mobile.length < 6) return mobile;
    return mobile.slice(0, 2) + '****' + mobile.slice(-4);
  };

  const formatPrize = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy size={20} className="text-amber-400" fill="currentColor" />;
    if (index === 1) return <Medal size={20} className="text-slate-300" fill="currentColor" />;
    if (index === 2) return <Medal size={20} className="text-amber-600" fill="currentColor" />;
    return <Star size={18} className="text-violet-400" />;
  };

  const getRankGradient = (index: number) => {
    if (index === 0) return 'from-amber-500/20 to-yellow-600/10 border-amber-500/30';
    if (index === 1) return 'from-slate-400/20 to-slate-600/10 border-slate-400/30';
    if (index === 2) return 'from-amber-700/20 to-amber-800/10 border-amber-700/30';
    return 'from-violet-500/10 to-purple-600/5 border-violet-500/20';
  };

  return (
    <div className="px-4 pt-4 pb-4">
      {showConfetti && <ConfettiEffect />}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-gold glow-gold mb-3 shadow-xl">
          <Trophy size={32} className="text-white" fill="white" />
        </div>
        <h1 className="text-2xl font-black text-white">Hall of Winners</h1>
        <p className="text-white/40 text-sm mt-0.5">Celebrating our lucky champions 🎉</p>
      </motion.div>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl mb-5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-rose-500/30" />
        <div className="absolute inset-0 border border-amber-500/20 rounded-2xl" />
        <div className="relative p-4 text-center">
          <p className="text-amber-400 font-black text-3xl prize-glow">
            {winners.length > 0
              ? `₹${winners.reduce((s, w) => s + Number(w.prize_amount), 0).toLocaleString('en-IN')}`
              : '₹0'}
          </p>
          <p className="text-white/50 text-xs mt-1">Total prizes awarded to {winners.length} winners</p>
        </div>
      </motion.div>

      {/* Winners List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 glass rounded-xl animate-pulse" />
          ))}
        </div>
      ) : winners.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <div className="text-6xl mb-3">🎰</div>
          <p className="text-white font-semibold">No winners yet!</p>
          <p className="text-white/40 text-sm mt-1">Be the first to win big</p>
        </div>
      ) : (
        <div className="space-y-3">
          {winners.map((winner, i) => (
            <motion.div
              key={winner.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`relative overflow-hidden rounded-2xl border bg-gradient-to-r ${getRankGradient(i)} p-4`}
            >
              {i < 3 && (
                <div className="absolute top-2 right-2 text-3xl opacity-20">
                  {['🥇', '🥈', '🥉'][i]}
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  i === 0 ? 'bg-amber-500/20' : i === 1 ? 'bg-slate-400/20' : 'bg-amber-600/20'
                }`}>
                  {getRankIcon(i)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">
                    {maskMobile(winner.winner_mobile)}
                  </p>
                  <p className="text-white/50 text-xs truncate">{winner.lottery_name}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">
                    Ticket: {winner.ticket_number}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-amber-400 font-black text-lg prize-glow">
                    {formatPrize(winner.prize_amount)}
                  </p>
                  <p className="text-white/30 text-[10px]">
                    {format(new Date(winner.drawn_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WinnersPage;
