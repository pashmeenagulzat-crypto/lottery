import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Ticket, Wallet, History, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/lotteries', icon: Ticket, label: 'Lotteries' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/winners', icon: Trophy, label: 'Winners' },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[428px] z-50 safe-bottom">
      <div className="mx-3 mb-3 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-2 py-2 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-violet-400' : 'text-white/40 hover:text-white/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-violet-500/20 rounded-lg -m-1"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Icon
                      size={20}
                      className={`relative z-10 transition-all duration-200 ${
                        isActive ? 'text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' : ''
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-medium transition-all duration-200 ${
                      isActive ? 'text-violet-400' : ''
                    }`}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-dot"
                      className="w-1 h-1 rounded-full bg-violet-400"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
