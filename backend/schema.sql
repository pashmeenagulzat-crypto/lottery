-- Lottery Application Database Schema
-- Run this file to set up the database

CREATE DATABASE IF NOT EXISTS lottery_db;
USE lottery_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mobile VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),
  wallet DECIMAL(10,2) DEFAULT 0.00,
  is_admin BOOLEAN DEFAULT FALSE,
  referral_code VARCHAR(20) UNIQUE,
  referred_by VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP Verifications
CREATE TABLE IF NOT EXISTS otp_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mobile VARCHAR(15) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lotteries
CREATE TABLE IF NOT EXISTS lotteries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  ticket_price DECIMAL(10,2) NOT NULL,
  total_tickets INT NOT NULL,
  tickets_sold INT DEFAULT 0,
  prize_pool DECIMAL(10,2) NOT NULL,
  draw_time TIMESTAMP NOT NULL,
  status ENUM('active', 'drawing', 'completed', 'cancelled') DEFAULT 'active',
  image_url VARCHAR(500),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lottery_id INT NOT NULL,
  ticket_number VARCHAR(20) NOT NULL,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (lottery_id) REFERENCES lotteries(id),
  UNIQUE KEY unique_ticket (lottery_id, ticket_number)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('deposit', 'withdrawal', 'ticket_purchase', 'winning', 'refund') NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  reference VARCHAR(200),
  upi_id VARCHAR(100),
  screenshot_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Winners
CREATE TABLE IF NOT EXISTS winners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lottery_id INT NOT NULL,
  user_id INT NOT NULL,
  ticket_number VARCHAR(20) NOT NULL,
  prize_amount DECIMAL(10,2) NOT NULL,
  announced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lottery_id) REFERENCES lotteries(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sample admin user (mobile: 9999999999, OTP based login)
INSERT IGNORE INTO users (mobile, name, is_admin, wallet, referral_code)
VALUES ('9999999999', 'Admin', TRUE, 0, 'ADMIN001');

-- Sample lottery
INSERT IGNORE INTO lotteries (name, description, ticket_price, total_tickets, prize_pool, draw_time, status, created_by)
VALUES ('Mega Jackpot', 'Win big with our daily Mega Jackpot lottery!', 50.00, 100, 4000.00, DATE_ADD(NOW(), INTERVAL 1 DAY), 'active', 1);
