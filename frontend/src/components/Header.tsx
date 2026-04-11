import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, ChevronLeft, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isDashboard = location.pathname === '/dashboard';
  const canGoBack = !isDashboard && location.pathname !== '/login';

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(balance ?? 0);
  };

  return (
    <header className="sticky top-0 z-40 safe-top">
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {canGoBack && !isAdmin ? (
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
              >
                <ChevronLeft size={18} className="text-white" />
              </button>
            ) : (
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
              >
                <div className="w-9 h-9 rounded-xl gradient-purple flex items-center justify-center glow-purple">
                  <Zap size={18} className="text-white" fill="white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-none">
                    {isAdmin ? 'Admin Panel' : 'LuckyDraw'}
                  </div>
                  <div className="text-[10px] text-violet-400 leading-none mt-0.5">
                    {isAdmin ? 'Management' : 'Premium Lottery'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user && !isAdmin && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/wallet')}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl px-3 py-1.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 text-sm font-bold">
                  {formatBalance(user.wallet)}
                </span>
              </motion.button>
            )}

            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
            >
              <User size={16} className="text-white/70" />
            </button>

            {!isAdmin && (
              <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform relative">
                <Bell size={16} className="text-white/70" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
