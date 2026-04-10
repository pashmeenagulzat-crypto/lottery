import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Zap, Phone, Shield, ChevronRight, ArrowLeft } from 'lucide-react';
import { sendOTP, verifyOTP } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Step = 'phone' | 'otp';

const LoginPage: React.FC = () => {
  const [step, setStep] = useState<Step>('phone');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    setIsLoading(true);
    try {
      const res = await sendOTP(`91${mobile}`);
      if (res.data.success) {
        if (res.data.otp) {
          setDevOtp(res.data.otp);
          toast.success(`OTP: ${res.data.otp}`, { duration: 10000, icon: '🔑' });
        } else {
          toast.success('OTP sent successfully!');
        }
        setStep('otp');
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to send OTP';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value.slice(-1);
    setOtp(newOtp);
    if (value && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
      setTimeout(() => handleVerifyOTP(newOtp.join('')), 100);
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpStr?: string) => {
    const otpValue = otpStr || otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Enter all 6 digits');
      return;
    }
    setIsLoading(true);
    try {
      const res = await verifyOTP(`91${mobile}`, otpValue);
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        toast.success('Welcome to LuckyDraw! 🎉');
        navigate(res.data.data.user.is_admin ? '/admin' : '/dashboard');
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid OTP';
      toast.error(message);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-container relative overflow-hidden animated-bg flex flex-col">
      {/* Background decorative elements */}
      <div className="absolute top-[-80px] left-[-80px] w-[280px] h-[280px] rounded-full bg-violet-600/20 blur-[80px]" />
      <div className="absolute top-[30%] right-[-60px] w-[200px] h-[200px] rounded-full bg-pink-600/15 blur-[60px]" />
      <div className="absolute bottom-[10%] left-[10%] w-[180px] h-[180px] rounded-full bg-blue-600/15 blur-[60px]" />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full particle"
          style={{
            left: `${10 + i * 12}%`,
            top: `${15 + (i % 3) * 20}%`,
            backgroundColor: ['#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899'][i % 4],
            animationDuration: `${3 + i}s`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      <div className="flex-1 flex flex-col justify-center px-6 py-8 relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-purple glow-purple mb-4 shadow-2xl">
            <Zap size={36} className="text-white" fill="white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            Lucky<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Draw</span>
          </h1>
          <p className="text-white/50 text-base">India's Premium Lottery Platform</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            {['🏆 Daily Draws', '💰 Big Prizes', '⚡ Instant Win'].map((item) => (
              <span key={item} className="text-xs text-white/40">{item}</span>
            ))}
          </div>
        </motion.div>

        {/* Card */}
        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="glass p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Phone size={20} className="text-violet-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Enter Mobile Number</h2>
                  <p className="text-white/40 text-sm">We'll send you a verification code</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-5">
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-3 flex items-center gap-2 flex-shrink-0">
                  <span className="text-lg">🇮🇳</span>
                  <span className="text-white font-semibold text-sm">+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                  placeholder="10-digit mobile number"
                  className="input-field"
                  autoFocus
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSendOTP}
                disabled={isLoading || mobile.length !== 10}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </motion.button>

              <p className="text-center text-white/30 text-xs mt-4">
                By continuing, you agree to our{' '}
                <span className="text-violet-400 cursor-pointer">Terms & Conditions</span>
                {' '}and{' '}
                <span className="text-violet-400 cursor-pointer">Privacy Policy</span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="glass p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); }}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"
                >
                  <ArrowLeft size={16} className="text-white" />
                </button>
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Shield size={20} className="text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">Verify OTP</h2>
                    <p className="text-white/40 text-sm">Sent to +91 {mobile}</p>
                  </div>
                </div>
              </div>

              {devOtp && (
                <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-amber-400 text-xs">🔑 Dev OTP:</span>
                  <span className="text-amber-400 font-bold text-sm tracking-widest">{devOtp}</span>
                </div>
              )}

              <div className="flex gap-2 justify-center mb-6">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border transition-all duration-200 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                      digit
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-white/20 focus:border-violet-500'
                    }`}
                  />
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleVerifyOTP()}
                disabled={isLoading || otp.some((d) => !d)}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Login</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </motion.button>

              <button
                onClick={handleSendOTP}
                disabled={isLoading}
                className="w-full mt-3 text-violet-400 text-sm py-2 hover:text-violet-300 transition-colors"
              >
                Resend OTP
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoginPage;
