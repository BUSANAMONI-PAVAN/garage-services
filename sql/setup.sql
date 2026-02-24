-- Active: 1731386532180@@127.0.0.1@3306
-- Create the database if it does not exist
CREATE DATABASE IF NOT EXISTS garage;

-- Use the database
USE garage;

-- Create the Users table for customer login
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the GarageServiceBookings table with enhanced fields
CREATE TABLE IF NOT EXISTS GarageServiceBookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    wheeler_type VARCHAR(20) NOT NULL,
    service_type VARCHAR(50) DEFAULT 'Standard',
    cost DOUBLE NOT NULL,
    appointment_date DATETIME,
    status VARCHAR(20) DEFAULT 'Pending',
    notes TEXT,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL
);

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

-- Create the CustomerFeedback table
CREATE TABLE IF NOT EXISTS CustomerFeedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100),
    feedback_text TEXT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL
);

-- Create Settings table for application configuration
CREATE TABLE IF NOT EXISTS Settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO Settings (setting_key, setting_value) VALUES 
    ('two_wheeler_cost', '500'),
    ('three_wheeler_cost', '750'),
    ('four_wheeler_cost', '1000'),
    ('premium_discount', '10'),
    ('business_name', 'Premium Garage Services'),
    ('business_email', 'contact@garageservices.com'),
    ('business_phone', '+1-234-567-8900')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
