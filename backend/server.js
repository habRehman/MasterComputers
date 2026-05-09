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

// Connect MongoDB
connectDB()

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
app.use('/api/products', require('./routes/products'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/cart', require('./routes/cart'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/ml', require('./routes/ml'))

// Health route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    db: 'MongoDB',
    service: 'Master Computers API'
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err)

  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  })
})

// IMPORTANT: only ONE PORT declaration
const PORT = process.env.PORT || 8080

// IMPORTANT: save server instance
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})

// Prevent silent crashes
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)

  server.close(() => {
    process.exit(1)
  })
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})