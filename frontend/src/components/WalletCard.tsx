import React from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WalletCardProps {
  balance: number;
  showActions?: boolean;
}

const WalletCard: React.FC<WalletCardProps> = ({ balance, showActions = true }) => {
  const navigate = useNavigate();

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount ?? 0);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent" />

      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-amber-100/80 text-sm font-medium">Wallet Balance</p>
            <motion.div
              key={balance}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-baseline gap-1 mt-1"
            >
              <span className="text-white/80 text-lg font-medium">₹</span>
              <span className="text-white text-4xl font-black tracking-tight">
                {formatBalance(balance)}
              </span>
            </motion.div>
          </div>
          <div className="bg-white/20 rounded-2xl p-2.5">
            <TrendingUp size={22} className="text-white" />
          </div>
        </div>

        {showActions && (
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/wallet')}
              className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl py-2.5 text-white font-semibold text-sm transition-all"
            >
              <Plus size={16} />
              Add Money
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/history')}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-2.5 text-white/80 font-semibold text-sm transition-all"
            >
              Transactions
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletCard;
