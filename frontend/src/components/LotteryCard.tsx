import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, Ticket, ChevronRight, Flame } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import type { Lottery } from '../types';

interface LotteryCardProps {
  lottery: Lottery;
  compact?: boolean;
}

const LotteryCard: React.FC<LotteryCardProps> = ({ lottery, compact = false }) => {
  const navigate = useNavigate();
  const countdown = useCountdown(lottery.draw_time);
  const soldPercent = Math.round((lottery.tickets_sold / lottery.total_tickets) * 100);
  const isHot = soldPercent > 70;
  const isAlmostFull = soldPercent > 90;

  const formatPrize = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const gradients = [
    'from-violet-600/30 to-purple-800/30',
    'from-blue-600/30 to-cyan-800/30',
    'from-emerald-600/30 to-teal-800/30',
    'from-rose-600/30 to-pink-800/30',
    'from-amber-600/30 to-orange-800/30',
  ];
  const gradient = gradients[lottery.id % gradients.length];

  if (compact) {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate(`/lotteries/${lottery.id}`)}
        className={`flex-shrink-0 w-[200px] glass cursor-pointer overflow-hidden`}
      >
        <div className={`bg-gradient-to-br ${gradient} p-4`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-white/50 mb-1">Prize Pool</p>
              <p className="text-xl font-black text-amber-400 prize-glow">{formatPrize(lottery.prize_pool)}</p>
            </div>
            {isHot && (
              <span className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 rounded-full px-2 py-0.5 text-[10px] text-orange-400 font-semibold">
                <Flame size={10} />
                HOT
              </span>
            )}
          </div>
          <p className="text-white font-semibold text-sm truncate mb-2">{lottery.name}</p>
          {countdown.isExpired ? (
            <span className="text-red-400 text-xs font-semibold">Draw Ended</span>
          ) : (
            <div className="flex items-center gap-1 text-xs text-white/60">
              <Clock size={12} />
              <span>
                {countdown.days > 0
                  ? `${countdown.days}d ${countdown.hours}h`
                  : `${String(countdown.hours).padStart(2, '0')}:${String(countdown.minutes).padStart(2, '0')}:${String(countdown.seconds).padStart(2, '0')}`}
              </span>
            </div>
          )}
        </div>
        <div className="px-4 pb-3 pt-2">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>Sold</span>
            <span>{soldPercent}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isAlmostFull ? 'bg-red-500' : isHot ? 'bg-orange-500' : 'bg-violet-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${soldPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/lotteries/${lottery.id}`)}
      className="glass cursor-pointer overflow-hidden mb-3"
    >
      <div className={`bg-gradient-to-br ${gradient} p-4`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isHot && (
                <span className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 rounded-full px-2 py-0.5 text-[10px] text-orange-400 font-semibold live-badge">
                  <Flame size={10} />
                  HOT
                </span>
              )}
              {lottery.status === 'active' && !countdown.isExpired && (
                <span className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 rounded-full px-2 py-0.5 text-[10px] text-green-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <h3 className="text-white font-bold text-lg leading-tight">{lottery.name}</h3>
            {lottery.description && (
              <p className="text-white/50 text-xs mt-0.5 line-clamp-1">{lottery.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-white/50">Prize Pool</p>
            <p className="text-2xl font-black text-amber-400 prize-glow">{formatPrize(lottery.prize_pool)}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="glass-dark rounded-xl p-2 text-center">
            <Ticket size={14} className="text-violet-400 mx-auto mb-1" />
            <p className="text-white font-semibold text-sm">₹{lottery.ticket_price}</p>
            <p className="text-white/40 text-[10px]">per ticket</p>
          </div>
          <div className="glass-dark rounded-xl p-2 text-center">
            <Users size={14} className="text-blue-400 mx-auto mb-1" />
            <p className="text-white font-semibold text-sm">{lottery.tickets_available}</p>
            <p className="text-white/40 text-[10px]">available</p>
          </div>
          <div className="glass-dark rounded-xl p-2 text-center">
            <Clock size={14} className="text-green-400 mx-auto mb-1" />
            {countdown.isExpired ? (
              <p className="text-red-400 font-semibold text-xs">Ended</p>
            ) : countdown.days > 0 ? (
              <p className="text-white font-semibold text-sm">{countdown.days}d {countdown.hours}h</p>
            ) : (
              <p className="text-white font-semibold text-sm">
                {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
              </p>
            )}
            <p className="text-white/40 text-[10px]">to draw</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-white/50">{lottery.tickets_sold} sold of {lottery.total_tickets}</span>
          <span className={`text-xs font-semibold ${isAlmostFull ? 'text-red-400' : isHot ? 'text-orange-400' : 'text-violet-400'}`}>
            {soldPercent}% full
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isAlmostFull
                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                : isHot
                ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                : 'bg-gradient-to-r from-violet-500 to-purple-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${soldPercent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-white/40 text-xs">Tap to buy tickets</span>
          <ChevronRight size={16} className="text-violet-400" />
        </div>
      </div>
    </motion.div>
  );
};

export default LotteryCard;
