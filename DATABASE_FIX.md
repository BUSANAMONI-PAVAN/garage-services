# Database Connection Fix - Quick Guide

## Issue
"Access denied for user 'root'@'localhost' (using password: YES)"

## Solution Steps

### 1. ✅ Created `.env` file
I've created the `.env` file with default settings. The MySQL password is currently set to **empty**.

### 2. Find Your MySQL Root Password

**Common scenarios:**
- **No password set**: Leave `JAVA_DB_PASSWORD=` empty (already configured)
- **Password set during installation**: Update the `.env` file with your password
- **Don't remember password**: See "Reset Password" section below

### 3. Update `.env` File (if needed)

Open `.env` and update line 15:
```
JAVA_DB_PASSWORD=your_actual_mysql_password
```

### 4. Setup the Database

You need to run the setup SQL script. Choose one method:

#### Option A: Using MySQL Command Line (if in PATH)
```powershell
mysql -u root -p < sql\setup.sql
```

#### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to localhost (enter your root password)
3. Open `sql/setup.sql`
4. Click Execute (⚡ icon)

#### Option C: Using PowerShell with Full MySQL Path
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < sql\setup.sql
```
(Adjust path if your MySQL is installed elsewhere)

### 5. Verify Database Creation

Connect to MySQL and run:
```sql
SHOW DATABASES;
USE garage;
SHOW TABLES;
```

You should see:
- Database: `garage`
- Tables: `GarageServiceBookings`, `CustomerFeedback`

---

## Reset MySQL Root Password (if forgotten)

1. Stop MySQL service:
```powershell
Stop-Service MySQL80
```

2. Start MySQL in safe mode (skip grant tables):
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --skip-grant-tables
```

3. In another PowerShell window, connect and reset:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root
```

Then run:
```sql
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
FLUSH PRIVILEGES;
EXIT;
```

4. Stop the safe mode MySQL (Ctrl+C in first window)

5. Start MySQL service normally:
```powershell
Start-Service MySQL80
```

6. Update `.env` with your new password

---

## Quick Test

After setup, restart your Java application. The database error should be resolved!
