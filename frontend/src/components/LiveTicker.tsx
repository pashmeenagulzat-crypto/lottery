import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

const ACTIVITIES = [
  { user: 'Raj***', action: 'bought 3 tickets for', lottery: 'Mega Jackpot' },
  { user: 'Pri***', action: 'just won', lottery: '₹50,000 prize!' },
  { user: 'Vik***', action: 'bought 1 ticket for', lottery: 'Daily Lucky Draw' },
  { user: 'Sun***', action: 'bought 5 tickets for', lottery: 'Weekend Bumper' },
  { user: 'Amo***', action: 'just won', lottery: '₹10,000 prize!' },
  { user: 'Kir***', action: 'bought 2 tickets for', lottery: 'Mega Jackpot' },
  { user: 'Mee***', action: 'bought 1 ticket for', lottery: 'Evening Special' },
  { user: 'Rah***', action: 'just won', lottery: '₹25,000 prize!' },
];

const LiveTicker: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ACTIVITIES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const item = ACTIVITIES[current];

  return (
    <div className="glass rounded-xl px-3 py-2 flex items-center gap-2 overflow-hidden">
      <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
        <Zap size={12} className="text-violet-400" fill="currentColor" />
      </div>
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={current}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xs text-white/70 whitespace-nowrap"
          >
            <span className="text-violet-400 font-semibold">{item.user}</span>{' '}
            {item.action}{' '}
            <span className="text-amber-400 font-semibold">{item.lottery}</span>
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="flex-shrink-0 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[10px] text-green-400 font-medium">LIVE</span>
      </div>
    </div>
  );
};

export default LiveTicker;
