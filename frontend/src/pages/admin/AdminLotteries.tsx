import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, X, Play, Trash2, Edit2, Trophy } from 'lucide-react';
import { getLotteries, createLottery, updateLottery, deleteLottery, performDraw } from '../../services/api';
import type { Lottery } from '../../types';
import { format } from 'date-fns';

interface LotteryForm {
  name: string;
  description: string;
  ticket_price: string;
  total_tickets: string;
  prize_pool: string;
  draw_time: string;
}

const emptyForm: LotteryForm = {
  name: '',
  description: '',
  ticket_price: '',
  total_tickets: '',
  prize_pool: '',
  draw_time: '',
};

const AdminLotteries: React.FC = () => {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<LotteryForm>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drawingId, setDrawingId] = useState<number | null>(null);

  useEffect(() => {
    loadLotteries();
  }, []);

  const loadLotteries = async () => {
    try {
      const res = await getLotteries();
      setLotteries(res.data.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.ticket_price || !form.total_tickets || !form.prize_pool || !form.draw_time) {
      toast.error('All required fields must be filled');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        ticket_price: Number(form.ticket_price),
        total_tickets: Number(form.total_tickets),
        prize_pool: Number(form.prize_pool),
        draw_time: new Date(form.draw_time).toISOString(),
      };

      if (editId) {
        await updateLottery(editId, payload);
        toast.success('Lottery updated!');
      } else {
        await createLottery(payload);
        toast.success('Lottery created!');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      loadLotteries();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Operation failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (lottery: Lottery) => {
    setForm({
      name: lottery.name,
      description: lottery.description || '',
      ticket_price: String(lottery.ticket_price),
      total_tickets: String(lottery.total_tickets),
      prize_pool: String(lottery.prize_pool),
      draw_time: format(new Date(lottery.draw_time), "yyyy-MM-dd'T'HH:mm"),
    });
    setEditId(lottery.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this lottery?')) return;
    try {
      await deleteLottery(id);
      toast.success('Lottery deleted');
      setLotteries((prev) => prev.filter((l) => l.id !== id));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Delete failed';
      toast.error(msg);
    }
  };

  const handleDraw = async (id: number) => {
    if (!confirm('Perform draw for this lottery? This cannot be undone.')) return;
    setDrawingId(id);
    try {
      const res = await performDraw(id);
      if (res.data.success) {
        toast.success(`🎉 Draw completed! Winner selected!`);
        loadLotteries();
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Draw failed';
      toast.error(msg);
    } finally {
      setDrawingId(null);
    }
  };

  return (
    <div className="px-4 pt-4 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-white">Lotteries</h1>
          <p className="text-white/40 text-sm mt-0.5">{lotteries.length} total</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 btn-primary py-2 px-4"
        >
          <Plus size={16} />
          New
        </motion.button>
      </motion.div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 glass rounded-xl animate-pulse" />)}
        </div>
      ) : lotteries.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-white/40">No lotteries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lotteries.map((lottery, i) => {
            const isPastDue = new Date(lottery.draw_time) < new Date();
            return (
              <motion.div
                key={lottery.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        lottery.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : lottery.status === 'completed'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {lottery.status.toUpperCase()}
                      </span>
                      {isPastDue && lottery.status === 'active' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                          DRAW DUE
                        </span>
                      )}
                    </div>
                    <p className="text-white font-bold text-sm truncate">{lottery.name}</p>
                    <p className="text-white/40 text-xs">
                      ₹{lottery.prize_pool.toLocaleString('en-IN')} prize · {lottery.tickets_sold}/{lottery.total_tickets} sold
                    </p>
                  </div>
                </div>

                <p className="text-white/30 text-xs mb-3">
                  Draw: {format(new Date(lottery.draw_time), 'PPP p')}
                </p>

                <div className="flex gap-2">
                  {isPastDue && lottery.status === 'active' && (
                    <button
                      onClick={() => handleDraw(lottery.id)}
                      disabled={drawingId === lottery.id}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-xl py-2 text-amber-400 text-xs font-semibold active:scale-95"
                    >
                      {drawingId === lottery.id ? (
                        <div className="w-3 h-3 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                      ) : (
                        <Trophy size={13} />
                      )}
                      Draw
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(lottery)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl py-2 text-blue-400 text-xs font-semibold active:scale-95"
                  >
                    <Edit2 size={13} />
                    Edit
                  </button>
                  {lottery.tickets_sold === 0 && (
                    <button
                      onClick={() => handleDelete(lottery.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-xl py-2 text-red-400 text-xs font-semibold active:scale-95"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[428px] bg-[#0f0f1a] border border-white/10 rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg">{editId ? 'Edit Lottery' : 'Create Lottery'}</h3>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <X size={16} className="text-white" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Lottery Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Mega Jackpot"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Description</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Optional description"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 text-xs mb-1.5 block">Ticket Price (₹) *</label>
                    <input
                      type="number"
                      value={form.ticket_price}
                      onChange={(e) => setForm((f) => ({ ...f, ticket_price: e.target.value }))}
                      placeholder="10"
                      className="input-field"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1.5 block">Total Tickets *</label>
                    <input
                      type="number"
                      value={form.total_tickets}
                      onChange={(e) => setForm((f) => ({ ...f, total_tickets: e.target.value }))}
                      placeholder="1000"
                      className="input-field"
                      min={1}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Prize Pool (₹) *</label>
                  <input
                    type="number"
                    value={form.prize_pool}
                    onChange={(e) => setForm((f) => ({ ...f, prize_pool: e.target.value }))}
                    placeholder="50000"
                    className="input-field"
                    min={1}
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Draw Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={form.draw_time}
                    onChange={(e) => setForm((f) => ({ ...f, draw_time: e.target.value }))}
                    className="input-field"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full btn-primary flex items-center justify-center gap-2 mt-5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>{editId ? 'Update Lottery' : 'Create Lottery'}</>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLotteries;
