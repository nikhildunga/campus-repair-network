// Main Server File
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const User = require('./models/User');

const app = express();

// Connect to database (may succeed or fail; we support background retries)
let dbConnected = false;
const tryConnectDB = async () => {
  try {
    dbConnected = await connectDB();
  } catch (e) {
    dbConnected = false;
  }
};
// initial attempt
tryConnectDB();

// Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Campus Connect Repair API is running',
  });
});

// Initialize Admin User (runs once)
const initializeAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = await User.create({
        name: 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@campus.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin',
      });
      console.log('✅ Admin user created successfully');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
    }
  } catch (error) {
    console.error('Error initializing admin:', error.message);
  }
};

// Start server with port fallback support
const parsePorts = () => {
  if (process.env.PORTS) return process.env.PORTS.split(',').map(p => parseInt(p.trim(), 10)).filter(Boolean);
  const p = parseInt(process.env.PORT || '5000', 10);
  return [p];
};

const listenOnPort = (port) => new Promise((resolve, reject) => {
  const server = app.listen(port);
  server.once('listening', () => resolve({ server, port }));
  server.once('error', (err) => reject(err));
});

const start = async () => {
  const ports = parsePorts();
  let started = false;

  for (const port of ports) {
    try {
      const { server, port: used } = await listenOnPort(port);
      console.log(`\n🚀 Server running on port ${used}`);
      console.log(`📍 API URL: http://localhost:${used}`);
      console.log(`📍 Health Check: http://localhost:${used}/api/health\n`);

      // If DB is connected, initialize admin. Otherwise schedule init after DB connects.
      if (dbConnected) {
        setTimeout(initializeAdmin, 2000);
      } else {
        // retry DB in background until connected, then initialize admin
        const dbRetry = setInterval(async () => {
          await tryConnectDB();
          if (dbConnected) {
            clearInterval(dbRetry);
            initializeAdmin();
          }
        }, 5000);
      }

      started = true;
      break;
    } catch (err) {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use, trying next port...`);
        continue;
      }
      console.error('Server start error:', err.message || err);
      process.exit(1);
    }
  }

  if (!started) {
    console.error('Unable to start server on provided ports');
    process.exit(1);
  }
};

start();

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});
