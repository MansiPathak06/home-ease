const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const societyLeadRoutes = require('./routes/societyLeadRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/vendor', require('./routes/vendorRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/reviews', reviewRoutes);
app.use('/api/vendors', require('./routes/vendorPublicRoutes'));
app.use('/api/society-leads', societyLeadRoutes);
app.use('/api/payment', paymentRoutes);
// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Service Marketplace API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Service Marketplace API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      vendor: '/api/vendor',
      user: '/api/user',
      vendors: '/api/vendors'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const http = require('http');
const { setupTrackingServer } = require('./controllers/trackingServer');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();

    // Create HTTP server (required for WebSocket)
    const server = http.createServer(app);

    // Attach WebSocket tracking server
    setupTrackingServer(server);

    server.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API URL: http://localhost:${PORT}`);
      console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`📍 Tracking WS: ws://localhost:${PORT}/tracking`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = app;