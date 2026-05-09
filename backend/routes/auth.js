const express = require('express')
const jwt     = require('jsonwebtoken')
const User    = require('../models/User')
const { authMiddleware } = require('../middleware/auth')
const router  = express.Router()

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, full_name, phone, city } = req.body
  if (!email || !password || !full_name)
    return res.status(400).json({ error: 'Email, password and full name are required' })

  try {
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ error: 'Email already registered' })

    const user  = await User.create({ email, password, full_name, phone, city })
    const token = signToken(user._id)
    res.status(201).json({ message: 'Registration successful!', token, user })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' })

  try {
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' })

    const token = signToken(user._id)
    // Remove password from response
    user.password = undefined
    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auth/profile
router.get('/profile', authMiddleware, (req, res) => {
  res.json(req.user)
})

// PATCH /api/auth/profile
router.patch('/profile', authMiddleware, async (req, res) => {
  const { full_name, phone, city, address } = req.body
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { full_name, phone, city, address },
      { new: true, runValidators: true }
    )
    res.json(user)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
