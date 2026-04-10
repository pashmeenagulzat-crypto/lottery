import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Phone, Copy, Check, LogOut, ShieldCheck, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyReferral = () => {
    if (!user?.referral_code) return;
    navigator.clipboard.writeText(user.referral_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Referral code copied!');
    });
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const avatarLetter = (user?.name || user?.mobile || 'U')[0].toUpperCase();

  return (
    <div className="px-4 pt-4 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl font-black text-white">Profile</h1>
        <p className="text-white/40 text-sm mt-0.5">Your account details</p>
      </motion.div>

      {/* Avatar & Info */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5 mb-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-purple flex items-center justify-center text-white font-black text-2xl glow-purple">
            {avatarLetter}
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">
              {user?.name || `User ${user?.mobile?.slice(-4)}`}
            </h2>
            <div className="flex items-center gap-1.5 text-white/50 text-sm">
              <Phone size={13} />
              <span>+{user?.mobile}</span>
            </div>
            {user?.is_admin && (
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck size={13} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-semibold">Administrator</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-amber-400">₹{(user?.wallet ?? 0).toLocaleString('en-IN')}</p>
          <p className="text-white/40 text-xs mt-1">Wallet Balance</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-violet-400">
            {user?.created_at ? new Date(user.created_at).getFullYear() : '-'}
          </p>
          <p className="text-white/40 text-xs mt-1">Member Since</p>
        </div>
      </motion.div>

      {/* Referral Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-4 mb-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Gift size={16} className="text-green-400" />
          <p className="text-white font-semibold text-sm">Referral Code</p>
        </div>
        <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
          <div>
            <p className="text-green-400 font-black text-xl tracking-wider">
              {user?.referral_code || 'N/A'}
            </p>
            <p className="text-white/30 text-xs mt-0.5">Share and earn rewards</p>
          </div>
          <button
            onClick={handleCopyReferral}
            className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center active:scale-90 transition-transform"
          >
            {copied ? (
              <Check size={16} className="text-green-400" />
            ) : (
              <Copy size={16} className="text-green-400" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Admin Panel Link */}
      {user?.is_admin && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          onClick={() => navigate('/admin')}
          className="w-full glass rounded-xl p-4 flex items-center gap-3 mb-4 active:scale-98 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <ShieldCheck size={18} className="text-amber-400" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-sm">Admin Panel</p>
            <p className="text-white/40 text-xs">Manage lotteries & users</p>
          </div>
        </motion.button>
      )}

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl py-3.5 text-red-400 font-semibold transition-all"
      >
        <LogOut size={18} />
        Sign Out
      </motion.button>

      <p className="text-center text-white/20 text-xs mt-4">LuckyDraw v1.0.0</p>
    </div>
  );
};

export default ProfilePage;
