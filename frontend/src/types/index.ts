export interface User {
  id: number;
  mobile: string;
  name: string | null;
  wallet: number;
  is_admin: boolean;
  referral_code: string;
  referred_by: number | null;
  created_at: string;
}

export interface Lottery {
  id: number;
  name: string;
  description: string | null;
  ticket_price: number;
  total_tickets: number;
  tickets_sold: number;
  tickets_available: number;
  prize_pool: number;
  draw_time: string;
  status: 'active' | 'completed' | 'cancelled';
  image_url: string | null;
  created_by: number;
  created_by_name: string | null;
  created_at: string;
}

export interface Ticket {
  id: number;
  user_id: number;
  lottery_id: number;
  ticket_number: string;
  purchased_at: string;
  lottery_name?: string;
  lottery_prize_pool?: number;
  lottery_draw_time?: string;
  lottery_status?: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'deposit' | 'purchase' | 'winning' | 'refund';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'rejected';
  reference_id: string | null;
  upi_id: string | null;
  screenshot_url: string | null;
  created_at: string;
}

export interface Winner {
  id: number;
  lottery_id: number;
  user_id: number;
  ticket_id: number;
  prize_amount: number;
  drawn_at: string;
  lottery_name: string;
  ticket_number: string;
  winner_mobile: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  otp?: string; // dev only
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  activeLotteries: number;
  pendingDeposits: number;
  totalTicketsSold: number;
  totalPrizesAwarded: number;
}

export interface DepositRequest {
  id: number;
  user_id: number;
  amount: number;
  upi_id: string;
  screenshot_url: string | null;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  user_mobile: string;
  user_name: string | null;
}
