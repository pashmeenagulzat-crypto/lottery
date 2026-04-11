# 🎯 LuckyDraw — Premium Lottery Web Application

A full-stack, mobile-first premium lottery platform built with React (TypeScript), Node.js/Express, and MySQL. Inspired by Dream11 / MPL / Winzo — featuring glassmorphism UI, Framer Motion animations, real-time updates via Socket.io, and a complete admin panel.

---

## 🚀 Features

### User Features
- **OTP Login/Signup** — Mobile number + 6-digit OTP authentication
- **Wallet System** — Add money via UPI, track balance, buy tickets
- **Lottery Participation** — Browse active lotteries, buy multiple tickets
- **Real-time Updates** — Live ticket availability, winner announcements via Socket.io
- **Transaction History** — Full record of deposits, purchases, and winnings
- **Winners Board** — Public showcase of past winners with confetti effect
- **PWA Support** — Installable like a native app on mobile devices

### Admin Features
- **Admin Dashboard** — Stats: total users, revenue, active lotteries, pending deposits
- **Lottery Management** — Create, edit, delete lotteries with prize pool config
- **Deposit Approval** — Approve/reject user UPI deposit requests
- **User Management** — View all users, wallet balances, activity
- **Manual Draw / Auto-Draw** — CRON job auto-draws at configured draw time
- **Profit Tracking** — Built-in commission model (prize pool < total collection)

### Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MySQL (mysql2) |
| Auth | OTP + JWT (7-day sessions) |
| Real-time | Socket.io |
| Scheduling | node-cron (auto-draw) |

---

## 📋 Prerequisites

- Node.js ≥ 18
- MySQL ≥ 8.0
- npm ≥ 9

---

## ⚙️ Setup Instructions

### 1. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE lottery_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema and seed data
mysql -u root -p lottery_db < backend/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and fill in your MySQL credentials and JWT secret

# Start backend
npm run dev   # development (with nodemon)
# or
npm start     # production
```

Backend runs on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Frontend runs on **http://localhost:5173** (proxies `/api` to backend)

---

## 🔧 Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=lottery_db

JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

CORS_ORIGIN=*          # Set to frontend URL in production
OTP_EXPIRY_MINUTES=10
```

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `users` | User accounts (mobile, wallet, referral) |
| `otp_verifications` | OTP codes with expiry |
| `lotteries` | Lottery games (price, tickets, prize, draw time) |
| `tickets` | Purchased tickets linked to user + lottery |
| `transactions` | Deposits, purchases, winnings |
| `winners` | Draw results |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to mobile |
| POST | `/api/auth/verify-otp` | Verify OTP, get JWT |
| GET | `/api/auth/profile` | Get user profile |

### Lotteries
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lotteries` | List all active lotteries |
| GET | `/api/lotteries/:id` | Get single lottery |
| POST | `/api/lotteries` | Create lottery (admin) |
| PUT | `/api/lotteries/:id` | Update lottery (admin) |
| DELETE | `/api/lotteries/:id` | Delete lottery (admin) |

### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tickets/buy` | Buy tickets (deducts wallet) |
| GET | `/api/tickets/my` | My purchased tickets |
| GET | `/api/tickets/lottery/:id` | All tickets for lottery (admin) |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/balance` | Get wallet balance |
| POST | `/api/wallet/deposit` | Request deposit (pending approval) |
| GET | `/api/wallet/transactions` | Transaction history |
| POST | `/api/wallet/approve/:id` | Approve deposit (admin) |
| POST | `/api/wallet/reject/:id` | Reject deposit (admin) |

### Draw
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/draw/:lotteryId` | Perform draw manually (admin) |
| GET | `/api/draw/winners` | All winners (public) |
| GET | `/api/draw/winners/:lotteryId` | Winner for specific lottery |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/transactions` | All transactions |
| GET | `/api/admin/deposits/pending` | Pending deposit requests |

---

## 👤 Default Admin Account

The seed data creates an admin user:
- **Mobile**: `9999999999`
- Login via OTP like any other user
- Admin panel available at `/admin`

---

## 💰 Profit Model

Admin creates lotteries with `prize_pool < ticket_price × total_tickets`:

```
Example:
  100 tickets × ₹50 = ₹5,000 collected
  Prize pool = ₹4,000
  Platform profit = ₹1,000 (20%)
```

---

## 📱 Project Structure

```
lottery/
├── backend/
│   ├── config/
│   │   └── database.js         # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js   # OTP + JWT auth
│   │   ├── lotteryController.js
│   │   ├── ticketController.js # Atomic ticket purchase
│   │   ├── walletController.js # Deposit management
│   │   ├── drawController.js   # Random winner selection
│   │   └── adminController.js  # Admin stats & management
│   ├── middlewares/
│   │   ├── auth.js             # JWT verification
│   │   └── rateLimiter.js      # OTP + API rate limiting
│   ├── routes/                 # Express route definitions
│   ├── utils/
│   │   ├── otpGenerator.js     # Cryptographically secure OTP
│   │   ├── ticketGenerator.js  # Unique ticket numbers
│   │   └── cronJobs.js         # Auto-draw scheduler
│   ├── schema.sql              # Database schema + seed data
│   ├── server.js               # Express + Socket.io entrypoint
│   └── .env.example
│
└── frontend/
    └── src/
        ├── components/         # Reusable UI components
        ├── pages/              # Route pages
        │   └── admin/          # Admin panel pages
        ├── context/            # Auth context
        ├── hooks/              # useCountdown, useSocket
        ├── services/           # Axios API client + Socket.io
        └── types/              # TypeScript interfaces
```

---

## 🔒 Security Features

- JWT tokens with 7-day expiry
- OTP expires in 10 minutes
- Rate limiting: 5 OTP requests / 10 minutes per IP
- API rate limit: 100 requests / 15 minutes
- Atomic wallet operations (MySQL transactions prevent double-spend)
- Input validation on all endpoints
- Admin-only middleware on protected routes

---

## ⚡ Real-time Events (Socket.io)

| Event | Trigger |
|-------|---------|
| `lottery_updated` | Ticket purchased, lottery created/updated |
| `new_winner` | Draw completed |
| `ticket_sold` | Any ticket purchase |
| `deposit_approved` | Admin approves deposit |

---

## 🎨 UI Design

- **Dark theme** — `#0a0a0f` background
- **Glassmorphism** — `backdrop-blur`, translucent cards
- **Gradients** — Purple/violet to pink, gold to orange
- **Animations** — Framer Motion page transitions, hover effects
- **Mobile-first** — Max-width 428px layout (native app feel)
- **Bottom Navigation** — Home, Lotteries, Wallet, History, Profile

