import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Trophy, RefreshCw, Clock } from 'lucide-react';
import type { Transaction } from '../types';
import { format } from 'date-fns';

interface TransactionItemProps {
  transaction: Transaction;
  index?: number;
}

const typeConfig = {
  deposit: {
    icon: ArrowDownLeft,
    label: 'Deposit',
    color: 'text-green-400',
    bg: 'bg-green-500/15',
    border: 'border-green-500/20',
    sign: '+',
  },
  purchase: {
    icon: ArrowUpRight,
    label: 'Ticket Purchase',
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/20',
    sign: '-',
  },
  winning: {
    icon: Trophy,
    label: 'Prize Won',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/20',
    sign: '+',
  },
  refund: {
    icon: RefreshCw,
    label: 'Refund',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/20',
    sign: '+',
  },
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, index = 0 }) => {
  const config = typeConfig[transaction.type] || typeConfig.deposit;
  const Icon = config.icon;
  const isPending = transaction.status === 'pending';
  const isRejected = transaction.status === 'rejected';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0"
    >
      <div className={`w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0`}>
        {isPending ? (
          <Clock size={18} className="text-yellow-400" />
        ) : (
          <Icon size={18} className={config.color} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{transaction.description || config.label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-white/40 text-xs">
            {format(new Date(transaction.created_at), 'MMM d, h:mm a')}
          </p>
          {isPending && (
            <span className="text-[10px] font-semibold bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">
              Pending
            </span>
          )}
          {isRejected && (
            <span className="text-[10px] font-semibold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
              Rejected
            </span>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-sm ${
          isRejected
            ? 'text-white/30 line-through'
            : isPending
            ? 'text-yellow-400'
            : config.color
        }`}>
          {config.sign}₹{Number(transaction.amount).toLocaleString('en-IN')}
        </p>
      </div>
    </motion.div>
  );
};

export default TransactionItem;
