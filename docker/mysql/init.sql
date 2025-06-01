-- MySQL initialization script
CREATE DATABASE IF NOT EXISTS task_manager;

-- Create application user if it doesn't exist (Docker creates it, but this ensures proper setup)
CREATE USER IF NOT EXISTS 'appuser'@'%' IDENTIFIED BY 'apppassword';

-- Grant all privileges on the task_manager database to appuser
GRANT ALL PRIVILEGES ON task_manager.* TO 'appuser'@'%';

-- Allow root user to connect from any host (for admin purposes)
ALTER USER 'root'@'%' IDENTIFIED BY 'rootpassword';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Ensure changes take effect
FLUSH PRIVILEGES;

-- Use the task_manager database
USE task_manager;

-- Optional: Create some initial data structure
-- Tables will be created by TypeORM synchronization
