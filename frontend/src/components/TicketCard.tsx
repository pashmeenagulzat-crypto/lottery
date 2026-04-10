import React from 'react';
import { motion } from 'framer-motion';
import { Ticket } from 'lucide-react';
import type { Ticket as TicketType } from '../types';
import { format } from 'date-fns';

interface TicketCardProps {
  ticket: TicketType;
  index?: number;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-900/30 to-purple-900/20"
    >
      {/* Ticket perforations */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0a0a0f]" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-[#0a0a0f]" />

      <div className="flex items-center px-6 py-3 gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
          <Ticket size={18} className="text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm font-mono tracking-wider">{ticket.ticket_number}</p>
          {ticket.lottery_name && (
            <p className="text-white/50 text-xs truncate">{ticket.lottery_name}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-white/40 text-[10px]">Purchased</p>
          <p className="text-white/60 text-xs">
            {format(new Date(ticket.purchased_at), 'MMM d, h:mm a')}
          </p>
          {ticket.lottery_status && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              ticket.lottery_status === 'active'
                ? 'bg-green-500/20 text-green-400'
                : ticket.lottery_status === 'completed'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {ticket.lottery_status}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TicketCard;
