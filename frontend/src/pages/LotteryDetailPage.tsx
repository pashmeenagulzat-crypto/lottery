import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Ticket, Users, Clock, Trophy, Minus, Plus, ShoppingCart, AlertCircle } from 'lucide-react';
import { getLotteryById, buyTickets, getMyTickets, getWalletBalance } from '../services/api';
import type { Lottery, Ticket as TicketType } from '../types';
import { useCountdown } from '../hooks/useCountdown';
import { useAuth } from '../context/AuthContext';
import TicketCard from '../components/TicketCard';
import { format } from 'date-fns';

const LotteryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateWallet } = useAuth();
  const [lottery, setLottery] = useState<Lottery | null>(null);
  const [myTickets, setMyTickets] = useState<TicketType[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isBuying, setIsBuying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const countdown = useCountdown(lottery?.draw_time ?? new Date().toISOString());

  useEffect(() => {
    if (id) loadData(Number(id));
  }, [id]);

  const loadData = async (lotteryId: number) => {
    try {
      const [lRes, tRes] = await Promise.allSettled([
        getLotteryById(lotteryId),
        getMyTickets(),
      ]);
      if (lRes.status === 'fulfilled') setLottery(lRes.value.data.data);
      if (tRes.status === 'fulfilled') {
        setMyTickets(tRes.value.data.data.filter((t) => t.lottery_id === lotteryId));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!lottery || !id) return;
    const totalCost = lottery.ticket_price * quantity;
    if ((user?.wallet ?? 0) < totalCost) {
      toast.error('Insufficient wallet balance. Please add money first.');
      navigate('/wallet');
      return;
    }
    setIsBuying(true);
    try {
      const res = await buyTickets(Number(id), quantity);
      if (res.data.success) {
        toast.success(`🎉 ${quantity} ticket${quantity > 1 ? 's' : ''} purchased!`);
        const walRes = await getWalletBalance();
        updateWallet(walRes.data.data.balance);
        setMyTickets((prev) => [...(res.data.data as TicketType[]), ...prev]);
        setLottery((prev) =>
          prev ? { ...prev, tickets_sold: prev.tickets_sold + quantity, tickets_available: prev.tickets_available - quantity } : prev
        );
        setQuantity(1);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Purchase failed';
      toast.error(msg);
    } finally {
      setIsBuying(false);
    }
  };

  const formatPrize = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-4">
        <div className="animate-pulse">
          <div className="h-48 bg-white/10 rounded-2xl mb-4" />
          <div className="h-6 w-48 bg-white/10 rounded mb-3" />
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white/10 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!lottery) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-white/50">Lottery not found</p>
      </div>
    );
  }

  const totalCost = lottery.ticket_price * quantity;
  const canAfford = (user?.wallet ?? 0) >= totalCost;
  const soldPercent = Math.round((lottery.tickets_sold / lottery.total_tickets) * 100);
  const maxQty = Math.min(10, lottery.tickets_available);

  return (
    <div className="px-4 pt-4 pb-4">
      {/* Prize Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl mb-5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 blur-2xl" />

        <div className="relative p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {lottery.status === 'active' && !countdown.isExpired && (
                  <span className="flex items-center gap-1 bg-green-500/30 border border-green-500/40 rounded-full px-2 py-0.5 text-[10px] text-green-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <h1 className="text-white font-black text-2xl leading-tight">{lottery.name}</h1>
              {lottery.description && (
                <p className="text-white/60 text-sm mt-1">{lottery.description}</p>
              )}
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-white/60 text-xs uppercase tracking-widest">Total Prize Pool</p>
            <p className="text-5xl font-black text-amber-400 prize-glow mt-1">
              {formatPrize(lottery.prize_pool)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Countdown */}
      {!countdown.isExpired && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-violet-400" />
            <p className="text-white/60 text-sm font-medium">Draw in</p>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { value: countdown.days, label: 'Days' },
              { value: countdown.hours, label: 'Hours' },
              { value: countdown.minutes, label: 'Mins' },
              { value: countdown.seconds, label: 'Secs' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3">
                <motion.p
                  key={value}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-white font-black text-2xl"
                >
                  {String(value).padStart(2, '0')}
                </motion.p>
                <p className="text-white/40 text-[10px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs text-center mt-2">
            Draw: {format(new Date(lottery.draw_time), 'PPP p')}
          </p>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-3 mb-4"
      >
        <div className="glass rounded-xl p-3 text-center">
          <Ticket size={16} className="text-violet-400 mx-auto mb-1" />
          <p className="text-white font-bold text-base">₹{lottery.ticket_price}</p>
          <p className="text-white/40 text-[10px]">per ticket</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Users size={16} className="text-blue-400 mx-auto mb-1" />
          <p className="text-white font-bold text-base">{lottery.tickets_available}</p>
          <p className="text-white/40 text-[10px]">available</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Trophy size={16} className="text-amber-400 mx-auto mb-1" />
          <p className="text-white font-bold text-base">{lottery.tickets_sold}</p>
          <p className="text-white/40 text-[10px]">sold</p>
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-4 mb-4"
      >
        <div className="flex justify-between text-xs text-white/50 mb-2">
          <span>Tickets Sold</span>
          <span className="font-semibold text-violet-400">{soldPercent}%</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${soldPercent}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
        <p className="text-white/30 text-xs text-center mt-2">
          {lottery.tickets_sold} of {lottery.total_tickets} tickets sold
        </p>
      </motion.div>

      {/* Buy Tickets */}
      {lottery.status === 'active' && !countdown.isExpired && lottery.tickets_available > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-4 mb-4"
        >
          <h3 className="text-white font-bold mb-4">Buy Tickets</h3>

          <div className="flex items-center justify-between mb-4">
            <span className="text-white/60 text-sm">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Minus size={16} className="text-white" />
              </button>
              <span className="text-white font-bold text-xl w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                className="w-9 h-9 rounded-xl bg-violet-500/30 border border-violet-500/40 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Plus size={16} className="text-violet-400" />
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 mb-4 flex items-center justify-between">
            <span className="text-white/50 text-sm">Total Cost</span>
            <span className="text-white font-black text-xl">₹{totalCost.toLocaleString('en-IN')}</span>
          </div>

          {!canAfford && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-4">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-xs">
                Insufficient balance. You have ₹{(user?.wallet ?? 0).toLocaleString('en-IN')}
              </p>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleBuy}
            disabled={isBuying || !canAfford}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBuying ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart size={18} />
                <span>Buy {quantity} Ticket{quantity > 1 ? 's' : ''} for ₹{totalCost.toLocaleString('en-IN')}</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {countdown.isExpired && (
        <div className="glass rounded-xl p-4 mb-4 text-center">
          <p className="text-white/60 text-sm">Draw time has passed. Results will be announced shortly.</p>
        </div>
      )}

      {/* My Tickets */}
      {myTickets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Ticket size={16} className="text-violet-400" />
            <h3 className="text-white font-bold">Your Tickets ({myTickets.length})</h3>
          </div>
          <div className="space-y-2">
            {myTickets.map((ticket, i) => (
              <TicketCard key={ticket.id} ticket={ticket} index={i} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LotteryDetailPage;
