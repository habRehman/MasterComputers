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

console.log('[APP] Express app created, setting up middleware...')

// Middleware
app.use(helmet())
console.log('[MIDDLEWARE] helmet applied')

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}))
console.log('[MIDDLEWARE] CORS applied')

app.use(express.json())
console.log('[MIDDLEWARE] express.json applied')

app.use(morgan('dev'))
console.log('[MIDDLEWARE] morgan applied')

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path} - IP: ${req.ip}`)
  
  // Log response
  const originalSend = res.send
  res.send = function(data) {
    console.log(`[RESPONSE] ${req.method} ${req.path} - Status: ${res.statusCode}`)
    return originalSend.call(this, data)
  }
  
  next()
})

// Rate limiter
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}))

// Routes
console.log('[ROUTES] Loading routes...')
try {
  app.use('/api/products', require('./routes/products'))
  console.log('[ROUTES] ✓ products')
  app.use('/api/orders', require('./routes/orders'))
  console.log('[ROUTES] ✓ orders')
  app.use('/api/cart', require('./routes/cart'))
  console.log('[ROUTES] ✓ cart')
  app.use('/api/auth', require('./routes/auth'))
  console.log('[ROUTES] ✓ auth')
  app.use('/api/admin', require('./routes/admin'))
  console.log('[ROUTES] ✓ admin')
  app.use('/api/ml', require('./routes/ml'))
  console.log('[ROUTES] ✓ ml')
  console.log('[ROUTES] All routes loaded successfully')
} catch (routeErr) {
  console.error('[ROUTES] Failed to load routes:', routeErr.message)
  console.error(routeErr.stack)
  process.exit(1)
}

// Root route (for health checks)
app.get('/', (req, res) => {
  console.log('[ROOT] GET / called')
  res.status(200).json({
    status: 'ok',
    service: 'Master Computers API',
    db: 'MongoDB',
    timestamp: new Date().toISOString()
  })
})

// Favicon route (prevent 404 errors)
app.get('/favicon.ico', (req, res) => {
  console.log('[FAVICON] GET /favicon.ico called')
  res.status(204).end()
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

// Global error handler (must be last)
app.use((err, req, res, next) => {
  console.error('[ERROR] Caught error:', err.message)
  console.error('[ERROR] Stack:', err.stack)
  console.error('[ERROR] Route:', req.method, req.path)
  
  // Ensure response is sent
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      path: req.path
    })
  }
})

// IMPORTANT: only ONE PORT declaration
const PORT = process.env.PORT || 5000

// IMPORTANT: Start server after DB connection
let server

const startServer = async () => {
  try {
    console.log(`[SERVER] NODE_ENV: ${process.env.NODE_ENV || 'not set'}`)
    console.log(`[SERVER] PORT from env: ${process.env.PORT || 'not set'}`)
    console.log(`[SERVER] Using PORT: ${PORT}`)
    console.log(`[SERVER] FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`)
    console.log(`[SERVER] MONGODB_URI starts with: mongodb${process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(7, 40) : 'not set'}`)
    
    await connectDB()
    
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server listening on PORT ${PORT}`)
      console.log(`✅ Routes loaded: /api/products, /api/orders, /api/cart, /api/auth, /api/admin, /api/ml`)
      console.log(`✅ Health check at GET /api/health`)
      console.log(`✅ Ready to accept requests`)
    })
    
    // Set request timeout
    server.requestTimeout = 30000
    server.keepAliveTimeout = 29000
    
    server.on('clientError', (err, socket) => {
      console.error('[SERVER] Client error:', err.message)
      if (socket.writable) {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
      }
    })
    
  } catch (err) {
    console.error('❌ Failed to start server:', err.message)
    console.error(err.stack)
    process.exit(1)
  }
}

startServer()

// Prevent silent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRASH] Unhandled Rejection:', reason)
  console.error('[CRASH] Promise:', promise)
})

process.on('uncaughtException', (err) => {
  console.error('[CRASH] Uncaught Exception:', err.message)
  console.error(err.stack)
  process.exit(1)
})

process.on('SIGTERM', () => {
  console.log('[SIGNAL] SIGTERM received, gracefully shutting down...')
  if (server) {
    server.close(() => {
      console.log('[SIGNAL] Server closed')
      process.exit(0)
    })
  } else {
    process.exit(0)
  }
})

// Flush console immediately in production
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    // Keep process alive
  }, 30000)
}