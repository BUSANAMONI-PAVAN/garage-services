USE garage;

-- Add missing columns to GarageServiceBookings (ignore errors if they already exist)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='GarageServiceBookings' AND COLUMN_NAME='user_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE GarageServiceBookings ADD COLUMN user_id INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='GarageServiceBookings' AND COLUMN_NAME='phone');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE GarageServiceBookings ADD COLUMN phone VARCHAR(20) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='GarageServiceBookings' AND COLUMN_NAME='service_type');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE GarageServiceBookings ADD COLUMN service_type VARCHAR(50) DEFAULT "Standard"', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='GarageServiceBookings' AND COLUMN_NAME='appointment_date');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE GarageServiceBookings ADD COLUMN appointment_date DATETIME NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='GarageServiceBookings' AND COLUMN_NAME='status');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE GarageServiceBookings ADD COLUMN status VARCHAR(20) DEFAULT "Pending"', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='GarageServiceBookings' AND COLUMN_NAME='notes');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE GarageServiceBookings ADD COLUMN notes TEXT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add order_id column for unique transaction/order IDs
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='GarageServiceBookings' AND COLUMN_NAME='order_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE GarageServiceBookings ADD COLUMN order_id VARCHAR(20) NULL UNIQUE', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add assigned_worker_id column for worker assignment
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='GarageServiceBookings' AND COLUMN_NAME='assigned_worker_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE GarageServiceBookings ADD COLUMN assigned_worker_id INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add missing columns to CustomerFeedback
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='CustomerFeedback' AND COLUMN_NAME='user_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CustomerFeedback ADD COLUMN user_id INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='CustomerFeedback' AND COLUMN_NAME='name');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CustomerFeedback ADD COLUMN name VARCHAR(100) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='garage' AND TABLE_NAME='CustomerFeedback' AND COLUMN_NAME='rating');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CustomerFeedback ADD COLUMN rating INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Create Notifications table for in-app alerts
CREATE TABLE IF NOT EXISTS Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'General',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    actor_id INT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_user_read_created (user_id, is_read, created_at),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES GarageServiceBookings(id) ON DELETE SET NULL,
    FOREIGN KEY (actor_id) REFERENCES Users(id) ON DELETE SET NULL
);

SELECT 'Migration complete!' AS result;
