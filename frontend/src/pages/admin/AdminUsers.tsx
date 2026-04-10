import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, ShieldCheck } from 'lucide-react';
import { getAllUsers } from '../../services/api';
import type { User } from '../../types';
import { format } from 'date-fns';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllUsers()
      .then((res) => {
        setUsers(res.data.data);
        setFiltered(res.data.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(users);
    } else {
      setFiltered(
        users.filter(
          (u) =>
            u.mobile.includes(search) ||
            (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
        )
      );
    }
  }, [search, users]);

  const totalBalance = users.reduce((s, u) => s + Number(u.wallet), 0);

  return (
    <div className="px-4 pt-4 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl font-black text-white">Users</h1>
        <p className="text-white/40 text-sm mt-0.5">{users.length} total users</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass rounded-xl p-3">
          <p className="text-white/40 text-xs mb-1">Total Users</p>
          <p className="text-white font-black text-2xl">{users.length}</p>
        </div>
        <div className="glass rounded-xl p-3">
          <p className="text-white/40 text-xs mb-1">Total Wallet Balance</p>
          <p className="text-amber-400 font-black text-xl">₹{totalBalance.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          placeholder="Search by mobile or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* User List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 glass rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Users size={32} className="text-white/20 mx-auto mb-2" />
          <p className="text-white/40 text-sm">No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold flex-shrink-0">
                {(user.name || user.mobile)[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-white font-semibold text-sm truncate">
                    {user.name || `User #${user.id}`}
                  </p>
                  {user.is_admin && <ShieldCheck size={13} className="text-amber-400 flex-shrink-0" />}
                </div>
                <p className="text-white/40 text-xs">+{user.mobile}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-amber-400 font-bold text-sm">₹{Number(user.wallet).toLocaleString('en-IN')}</p>
                <p className="text-white/30 text-[10px]">
                  {format(new Date(user.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
