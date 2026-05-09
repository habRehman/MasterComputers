/**
 * Master Computers E-Commerce — Express.js Backend
 * MongoDB + JWT Edition · Pakistani Market
 */
require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const rateLimit  = require('express-rate-limit')
const connectDB  = require('./middleware/db')

// Connect to MongoDB
connectDB()

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ──────────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }))
app.use(express.json())
app.use(morgan('dev'))
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }))

// ── Routes ──────────────────────────────────────────────────
app.use('/api/products', require('./routes/products'))
app.use('/api/orders',   require('./routes/orders'))
app.use('/api/cart',     require('./routes/cart'))
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/admin',    require('./routes/admin'))
app.use('/api/ml',       require('./routes/ml'))

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', db: 'MongoDB', service: 'Master Computers API' })
)

// ── Global error handler ───────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

app.listen(PORT, () =>
  console.log(`[Server] Running on http://localhost:${PORT}`)
)
