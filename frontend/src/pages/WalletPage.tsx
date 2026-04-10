import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, X, Upload, QrCode, IndianRupee, Copy, Check } from 'lucide-react';
import { getWalletBalance, requestDeposit, getTransactions } from '../services/api';
import type { Transaction } from '../types';
import { useAuth } from '../context/AuthContext';
import TransactionItem from '../components/TransactionItem';
import { TransactionSkeleton } from '../components/LoadingSkeleton';

type TxFilter = 'all' | 'deposit' | 'purchase' | 'winning';

const UPI_ID = 'luckydraw@upi';

const WalletPage: React.FC = () => {
  const { user, updateWallet } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [txFilter, setTxFilter] = useState<TxFilter>('all');
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (txFilter === 'all') setFiltered(transactions);
    else setFiltered(transactions.filter((t) => t.type === txFilter));
  }, [transactions, txFilter]);

  const loadData = async () => {
    try {
      const [walRes, txRes] = await Promise.allSettled([getWalletBalance(), getTransactions()]);
      if (walRes.status === 'fulfilled') updateWallet(walRes.value.data.data.balance);
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('UPI ID copied!');
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large. Max 5MB allowed.');
        return;
      }
      setScreenshot(file);
    }
  };

  const handleSubmitDeposit = async () => {
    const amt = Number(amount);
    if (!amt || amt < 10) {
      toast.error('Minimum deposit is ₹10');
      return;
    }
    if (!upiId.trim()) {
      toast.error('Enter your UPI ID for verification');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('amount', String(amt));
      formData.append('upi_id', upiId.trim());
      if (screenshot) formData.append('screenshot', screenshot);

      const res = await requestDeposit(formData);
      if (res.data.success) {
        toast.success('Deposit request submitted! Awaiting approval.');
        setShowDeposit(false);
        setAmount('');
        setUpiId('');
        setScreenshot(null);
        loadData();
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to submit';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];
  const txTabs: { key: TxFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'deposit', label: 'Deposits' },
    { key: 'purchase', label: 'Purchases' },
    { key: 'winning', label: 'Winnings' },
  ];

  return (
    <div className="px-4 pt-4 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl font-black text-white">Wallet</h1>
        <p className="text-white/40 text-sm mt-0.5">Manage your funds 💳</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl mb-5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent" />
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />

        <div className="relative p-5">
          <p className="text-amber-100/70 text-xs font-medium uppercase tracking-wide mb-1">Available Balance</p>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-white/80 text-xl">₹</span>
            <span className="text-white text-5xl font-black">
              {(user?.wallet ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDeposit(true)}
            className="flex items-center justify-center gap-2 bg-white text-orange-600 font-bold rounded-xl px-6 py-2.5 text-sm shadow-lg"
          >
            <Plus size={16} />
            Add Money
          </motion.button>
        </div>
      </motion.div>

      {/* Transactions */}
      <div>
        <h2 className="text-white font-bold text-lg mb-3">Transaction History</h2>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {txTabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTxFilter(key)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                txFilter === key
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/5 text-white/50 hover:text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="glass rounded-2xl px-4">
          {isLoading ? (
            <>
              <TransactionSkeleton />
              <TransactionSkeleton />
              <TransactionSkeleton />
            </>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center">
              <IndianRupee size={32} className="text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-sm">No transactions found</p>
            </div>
          ) : (
            filtered.map((tx, i) => <TransactionItem key={tx.id} transaction={tx} index={i} />)
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeposit(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[428px] bg-[#0f0f1a] border border-white/10 rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-xl">Add Money</h3>
                <button
                  onClick={() => setShowDeposit(false)}
                  className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              {/* UPI Section */}
              <div className="glass rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode size={18} className="text-violet-400" />
                  <p className="text-white font-semibold text-sm">Pay via UPI</p>
                </div>

                {/* QR Code placeholder */}
                <div className="bg-white rounded-xl p-4 flex items-center justify-center mb-3 mx-auto w-40 h-40">
                  <div className="grid grid-cols-7 gap-0.5 w-full h-full">
                    {Array.from({ length: 49 }, (_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-white/50 text-xs text-center mb-2">Scan QR code or pay to UPI ID</p>

                <div className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                  <span className="text-violet-400 font-bold text-sm">{UPI_ID}</span>
                  <button onClick={handleCopyUPI} className="p-1.5 rounded-lg bg-white/10 active:scale-90 transition-transform">
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-white/60" />}
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="text-white/60 text-sm mb-2 block">Enter Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 font-bold">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="input-field pl-8 text-lg font-bold"
                    min={10}
                  />
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(String(amt))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        amount === String(amt)
                          ? 'bg-violet-500 text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/15'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI ID input */}
              <div className="mb-4">
                <label className="text-white/60 text-sm mb-2 block">Your UPI ID (for verification)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@bank"
                  className="input-field"
                />
              </div>

              {/* Screenshot upload */}
              <div className="mb-5">
                <label className="text-white/60 text-sm mb-2 block">Upload Payment Screenshot (optional)</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                    screenshot
                      ? 'border-green-500/40 bg-green-500/10'
                      : 'border-white/20 hover:border-violet-500/40'
                  }`}
                >
                  <Upload size={20} className={`mx-auto mb-1 ${screenshot ? 'text-green-400' : 'text-white/40'}`} />
                  <p className={`text-sm ${screenshot ? 'text-green-400' : 'text-white/40'}`}>
                    {screenshot ? screenshot.name : 'Tap to upload screenshot'}
                  </p>
                  {screenshot && (
                    <p className="text-white/30 text-xs mt-0.5">
                      {(screenshot.size / 1024).toFixed(0)} KB
                    </p>
                  )}
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmitDeposit}
                disabled={isSubmitting || !amount || !upiId}
                className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Submit Deposit Request</>
                )}
              </motion.button>

              <p className="text-white/30 text-xs text-center mt-3">
                Deposits are approved within 30 minutes during business hours
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletPage;
