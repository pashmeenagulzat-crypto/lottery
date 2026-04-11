import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, X, Clock, IndianRupee, User } from 'lucide-react';
import { getPendingDeposits, approveDeposit, rejectDeposit } from '../../services/api';
import type { DepositRequest } from '../../types';
import { format } from 'date-fns';

const AdminDeposits: React.FC = () => {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    try {
      const res = await getPendingDeposits();
      setDeposits(res.data.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await approveDeposit(id);
      toast.success('Deposit approved!');
      setDeposits((prev) => prev.filter((d) => d.id !== id));
    } catch {
      toast.error('Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject this deposit request?')) return;
    setProcessingId(id);
    try {
      await rejectDeposit(id);
      toast.success('Deposit rejected');
      setDeposits((prev) => prev.filter((d) => d.id !== id));
    } catch {
      toast.error('Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="px-4 pt-4 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl font-black text-white">Deposit Requests</h1>
        <p className="text-white/40 text-sm mt-0.5">
          {deposits.length} pending approval
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 glass rounded-xl animate-pulse" />)}
        </div>
      ) : deposits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-10 text-center"
        >
          <Clock size={36} className="text-white/20 mx-auto mb-2" />
          <p className="text-white font-semibold">No pending deposits</p>
          <p className="text-white/40 text-sm mt-1">All caught up!</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {deposits.map((deposit, i) => (
            <motion.div
              key={deposit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <User size={16} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {deposit.user_name || `User #${deposit.user_id}`}
                    </p>
                    <p className="text-white/40 text-xs">+{deposit.user_mobile}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-black text-xl">₹{Number(deposit.amount).toLocaleString('en-IN')}</p>
                  <p className="text-white/30 text-[10px]">{format(new Date(deposit.created_at), 'MMM d, h:mm a')}</p>
                </div>
              </div>

              {deposit.upi_id && (
                <div className="bg-white/5 rounded-lg px-3 py-1.5 mb-3">
                  <p className="text-white/50 text-xs">UPI: <span className="text-violet-400 font-medium">{deposit.upi_id}</span></p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(deposit.id)}
                  disabled={processingId === deposit.id}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/20 border border-green-500/30 rounded-xl py-2.5 text-green-400 font-semibold text-sm active:scale-95 transition-transform disabled:opacity-50"
                >
                  {processingId === deposit.id ? (
                    <div className="w-4 h-4 border border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                  ) : (
                    <><Check size={15} /> Approve</>
                  )}
                </button>
                <button
                  onClick={() => handleReject(deposit.id)}
                  disabled={processingId === deposit.id}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-xl py-2.5 text-red-400 font-semibold text-sm active:scale-95 transition-transform disabled:opacity-50"
                >
                  <X size={15} />
                  Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDeposits;
