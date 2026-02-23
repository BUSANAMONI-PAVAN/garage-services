-- Active: 1731386532180@@127.0.0.1@3306
-- Create the database if it does not exist
CREATE DATABASE IF NOT EXISTS garage;

-- Use the database
USE garage;

-- Create the GarageServiceBookings table
CREATE TABLE IF NOT EXISTS GarageServiceBookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    wheeler_type VARCHAR(20) NOT NULL,
    cost DOUBLE NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the CustomerFeedback table
CREATE TABLE IF NOT EXISTS CustomerFeedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_text TEXT NOT NULL,
    feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
