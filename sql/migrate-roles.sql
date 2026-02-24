USE garage;

-- ============================================================
-- Migration: Role-Based Access Control + OTP Authentication
-- ============================================================

-- 1. Add 'role' column to Users  (Customer, Worker, Manager)
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='Users' AND COLUMN_NAME='role');
SET @sql = IF(@col = 0, "ALTER TABLE Users ADD COLUMN role ENUM('Customer','Worker','Manager') NOT NULL DEFAULT 'Customer'", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 2. Add 'approval_status' for workers  (Pending / Approved / Rejected)
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='Users' AND COLUMN_NAME='approval_status');
SET @sql = IF(@col = 0, "ALTER TABLE Users ADD COLUMN approval_status ENUM('Pending','Approved','Rejected') DEFAULT NULL", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 3. Add OTP columns
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='Users' AND COLUMN_NAME='otp');
SET @sql = IF(@col = 0, 'ALTER TABLE Users ADD COLUMN otp VARCHAR(6) DEFAULT NULL', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='Users' AND COLUMN_NAME='otp_expires');
SET @sql = IF(@col = 0, 'ALTER TABLE Users ADD COLUMN otp_expires DATETIME DEFAULT NULL', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 4. Make password nullable (Customers login via OTP, no password needed)
ALTER TABLE Users MODIFY COLUMN password VARCHAR(255) NULL;

-- 5. Make username nullable (Customers use email only)
ALTER TABLE Users MODIFY COLUMN username VARCHAR(50) NULL;

-- 6. Drop UNIQUE constraint on username if it exists (so multiple NULLs are allowed)
--    We'll add a conditional unique index instead
SET @idx = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='Users' AND INDEX_NAME='username');
SET @sql = IF(@idx > 0, 'ALTER TABLE Users DROP INDEX username', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add unique index that only applies to non-null usernames
-- MySQL doesn't support partial indexes, so we rely on app logic for null usernames

-- 7. Add 'assigned_worker_id' to bookings so managers can assign workers
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='GarageServiceBookings' AND COLUMN_NAME='assigned_worker_id');
SET @sql = IF(@col = 0, 'ALTER TABLE GarageServiceBookings ADD COLUMN assigned_worker_id INT NULL', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 8. Seed the Manager account (username: peeter, password: bcrypt hash of 'peeter')
--    bcrypt hash for 'peeter' generated with cost 10
INSERT INTO Users (username, password, full_name, email, phone, role, approval_status)
VALUES ('peeter', '$2b$10$lExtN5Fuub217rPJ/jlu1uIOqDehLGgZsn.Tt1lzHqb/fS0sBwQqq', 'Manager Peeter', 'manager@garage.com', '+91-0000000000', 'Manager', 'Approved')
ON DUPLICATE KEY UPDATE role='Manager', approval_status='Approved';

SELECT 'Role-based migration complete!' AS result;
