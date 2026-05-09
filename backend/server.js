/**
 * Master Computers E-Commerce — Express.js Backend
 * Production-ready (Railway + Render compatible)
 */

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const connectDB = require('./middleware/db')

const app = express()

// Railway / Render proxy fix
app.set('trust proxy', 1)

// Middleware
app.use(helmet())

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}))

app.use(express.json())
app.use(morgan('dev'))

// Rate limiter
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}))

// Routes
try {
  app.use('/api/products', require('./routes/products'))
  app.use('/api/orders', require('./routes/orders'))
  app.use('/api/cart', require('./routes/cart'))
  app.use('/api/auth', require('./routes/auth'))
  app.use('/api/admin', require('./routes/admin'))
  app.use('/api/ml', require('./routes/ml'))
  console.log('[ROUTES] All routes loaded successfully')
} catch (routeErr) {
  console.error('[ROUTES] Failed to load routes:', routeErr.message)
  console.error(routeErr.stack)
  process.exit(1)
}

// Root route (for health checks)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Master Computers API',
    db: 'MongoDB'
  })
})

// Health route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    db: 'MongoDB',
    service: 'Master Computers API'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack || err.message)
  console.error('   Route:', req.method, req.path)
  console.error('   URL:', req.originalUrl)

  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    path: req.path
  })
})

// IMPORTANT: only ONE PORT declaration
const PORT = process.env.PORT || 8080

// IMPORTANT: Start server after DB connection
let server

const startServer = async () => {
  try {
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`[SERVER] PORT: ${PORT}`)
    console.log(`[SERVER] FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`)
    
    await connectDB()
    
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on http://0.0.0.0:${PORT}`)
      console.log(`✅ Routes loaded: /api/products, /api/orders, /api/cart, /api/auth, /api/admin, /api/ml`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err.message)
    console.error(err.stack)
    process.exit(1)
  }
}

startServer()

// Prevent silent crashes
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)

  if (server) server.close(() => {
    process.exit(1)
  })
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})