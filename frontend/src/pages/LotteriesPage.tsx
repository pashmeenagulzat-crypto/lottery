import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { getLotteries } from '../services/api';
import type { Lottery } from '../types';
import LotteryCard from '../components/LotteryCard';
import { LotteryCardSkeleton } from '../components/LoadingSkeleton';
import { useSocket } from '../hooks/useSocket';

type FilterTab = 'all' | 'active' | 'completed';

const LotteriesPage: React.FC = () => {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [filtered, setFiltered] = useState<Lottery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLotteries();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [lotteries, activeTab, search]);

  const loadLotteries = async () => {
    try {
      const res = await getLotteries();
      setLotteries(res.data.data);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    let list = [...lotteries];
    if (activeTab === 'active') list = list.filter((l) => l.status === 'active');
    if (activeTab === 'completed') list = list.filter((l) => l.status === 'completed');
    if (search) {
      list = list.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()));
    }
    setFiltered(list);
  };

  useSocket({
    lottery_updated: (data: unknown) => {
      const d = data as { action: string; lottery?: Lottery; lotteryId?: number };
      if (d.action === 'created' && d.lottery) {
        setLotteries((prev) => [d.lottery!, ...prev]);
      } else if (d.action === 'updated' && d.lottery) {
        setLotteries((prev) => prev.map((l) => (l.id === d.lottery!.id ? d.lottery! : l)));
      } else if (d.action === 'deleted' && d.lotteryId) {
        setLotteries((prev) => prev.filter((l) => l.id !== d.lotteryId));
      }
    },
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="px-4 pt-4 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl font-black text-white">Lotteries</h1>
        <p className="text-white/40 text-sm mt-0.5">Pick your lucky draw 🎯</p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          placeholder="Search lotteries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 bg-white/5 rounded-xl p-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === key
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <>
          <LotteryCardSkeleton />
          <LotteryCardSkeleton />
          <LotteryCardSkeleton />
        </>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-10 text-center"
        >
          <div className="text-5xl mb-3">🎰</div>
          <p className="text-white font-semibold">No lotteries found</p>
          <p className="text-white/40 text-sm mt-1">Try a different filter or search term</p>
        </motion.div>
      ) : (
        <div>
          {filtered.map((lottery, i) => (
            <motion.div
              key={lottery.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <LotteryCard lottery={lottery} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LotteriesPage;
