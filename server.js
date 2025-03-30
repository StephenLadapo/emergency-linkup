
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ul_emergency_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1 as test');
    res.json({ success: true, message: 'Database connection successful', data: rows });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

// Register user endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, fullName, studentNumber } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, full_name, student_number) VALUES (?, ?, ?, ?)',
      [email, password, fullName, studentNumber]
    );
    
    // For a real application, you should hash the password before storing it
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // In a real app, you would generate a JWT token here
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        studentNumber: user.student_number
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// Send confirmation email endpoint (simulation)
app.post('/api/send-confirmation', async (req, res) => {
  try {
    const { email, fullName } = req.body;
    
    // In a real application, you would integrate with an email service here
    console.log(`Sending confirmation email to ${email} for ${fullName}`);
    
    // Log the attempt in the database
    await pool.execute(
      'INSERT INTO email_logs (recipient, subject, status) VALUES (?, ?, ?)',
      [email, 'Registration Confirmation', 'sent']
    );
    
    res.json({ success: true, message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

// SQL script to create the database and tables
const setupDatabaseScript = `
CREATE DATABASE IF NOT EXISTS ul_emergency_system;
USE ul_emergency_system;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  student_number VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Script to create the database and tables if they don't exist
const setupDatabase = async () => {
  try {
    console.log('Setting up database...');
    
    // Connect to MySQL without specifying a database
    const tempPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Execute the setup script
    console.log('Creating database and tables...');
    await tempPool.query(setupDatabaseScript);
    console.log('Database setup complete!');
    
    await tempPool.end();
  } catch (error) {
    console.error('Database setup error:', error);
  }
};

// Run the database setup script when the server starts
setupDatabase();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
