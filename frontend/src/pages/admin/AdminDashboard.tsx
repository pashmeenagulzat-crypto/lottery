import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, DollarSign, Ticket, Clock, TrendingUp, ChevronRight, BarChart2 } from 'lucide-react';
import { getAdminStats, getPendingDeposits } from '../../services/api';
import type { AdminStats, DepositRequest } from '../../types';
import { StatCardSkeleton } from '../../components/LoadingSkeleton';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingDeposits, setPendingDeposits] = useState<DepositRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getAdminStats(), getPendingDeposits()])
      .then(([statsRes, depRes]) => {
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
        if (depRes.status === 'fulfilled') setPendingDeposits(depRes.value.data.data.slice(0, 5));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'from-green-500 to-emerald-600', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        { label: 'Active Lotteries', value: stats.activeLotteries.toString(), icon: Ticket, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
        { label: 'Pending Deposits', value: stats.pendingDeposits.toString(), icon: Clock, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
      ]
    : [];

  const adminMenus = [
    { label: 'Manage Lotteries', desc: 'Create, edit & draw', path: '/admin/lotteries', icon: Ticket, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Manage Users', desc: 'View user accounts', path: '/admin/users', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Deposit Requests', desc: `${pendingDeposits.length} pending`, path: '/admin/deposits', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Analytics', desc: 'Revenue & stats', path: '/admin/analytics', icon: BarChart2, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="px-4 pt-4 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
        <p className="text-white/40 text-sm mt-0.5">System overview & management</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {isLoading
          ? [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
          : statCards.map(({ label, value, icon: Icon, color, bg, border }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className={`${bg} border ${border} rounded-2xl p-4`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="text-white font-black text-xl leading-none">{value}</p>
                <p className="text-white/40 text-xs mt-1">{label}</p>
              </motion.div>
            ))}
      </div>

      {/* Revenue chart placeholder */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-4 mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-green-400" />
            <h3 className="text-white font-semibold text-sm">Revenue Overview</h3>
          </div>
          <div className="flex items-end gap-2 h-20">
            {[40, 65, 55, 80, 70, 90, 75].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="flex-1 rounded-t-lg bg-gradient-to-t from-violet-600 to-purple-400"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <span key={d} className="text-white/30 text-[10px] flex-1 text-center">{d}</span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Menu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h3 className="text-white font-bold mb-3">Quick Actions</h3>
        <div className="space-y-2">
          {adminMenus.map(({ label, desc, path, icon: Icon, color, bg }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="w-full glass rounded-xl p-3.5 flex items-center gap-3 active:scale-98 transition-transform"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div className="text-left flex-1">
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-white/40 text-xs">{desc}</p>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
