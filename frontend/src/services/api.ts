import axios from 'axios';
import type { User, Lottery, Ticket, Transaction, Winner, OTPResponse, AuthResponse, ApiResponse, AdminStats, DepositRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const sendOTP = (mobile: string) =>
  api.post<OTPResponse>('/auth/send-otp', { mobile });

export const verifyOTP = (mobile: string, otp: string) =>
  api.post<AuthResponse>('/auth/verify-otp', { mobile, otp });

export const getProfile = () =>
  api.get<ApiResponse<User>>('/auth/profile');

// Lotteries
export const getLotteries = () =>
  api.get<ApiResponse<Lottery[]>>('/lotteries');

export const getLotteryById = (id: number) =>
  api.get<ApiResponse<Lottery>>(`/lotteries/${id}`);

export const createLottery = (data: Partial<Lottery>) =>
  api.post<ApiResponse<Lottery>>('/lotteries', data);

export const updateLottery = (id: number, data: Partial<Lottery>) =>
  api.put<ApiResponse<Lottery>>(`/lotteries/${id}`, data);

export const deleteLottery = (id: number) =>
  api.delete<ApiResponse<null>>(`/lotteries/${id}`);

// Tickets
export const buyTickets = (lotteryId: number, quantity: number) =>
  api.post<ApiResponse<Ticket[]>>('/tickets/buy', { lottery_id: lotteryId, quantity });

export const getMyTickets = () =>
  api.get<ApiResponse<Ticket[]>>('/tickets/my');

export const getTicketsByLottery = (lotteryId: number) =>
  api.get<ApiResponse<Ticket[]>>(`/tickets/lottery/${lotteryId}`);

// Wallet
export const getWalletBalance = () =>
  api.get<ApiResponse<{ balance: number }>>('/wallet/balance');

export const requestDeposit = (formData: FormData) =>
  api.post<ApiResponse<Transaction>>('/wallet/deposit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getTransactions = () =>
  api.get<ApiResponse<Transaction[]>>('/wallet/transactions');

export const approveDeposit = (id: number) =>
  api.post<ApiResponse<null>>(`/wallet/approve/${id}`);

export const rejectDeposit = (id: number) =>
  api.post<ApiResponse<null>>(`/wallet/reject/${id}`);

// Draw & Winners
export const performDraw = (lotteryId: number) =>
  api.post<ApiResponse<Winner>>(`/draw/${lotteryId}`);

export const getWinners = () =>
  api.get<ApiResponse<Winner[]>>('/draw/winners');

export const getLotteryWinner = (lotteryId: number) =>
  api.get<ApiResponse<Winner>>(`/draw/winners/${lotteryId}`);

// Admin
export const getAdminStats = () =>
  api.get<ApiResponse<AdminStats>>('/admin/stats');

export const getAllUsers = () =>
  api.get<ApiResponse<User[]>>('/admin/users');

export const getAllTransactions = () =>
  api.get<ApiResponse<Transaction[]>>('/admin/transactions');

export const getPendingDeposits = () =>
  api.get<ApiResponse<DepositRequest[]>>('/admin/deposits/pending');

export default api;
