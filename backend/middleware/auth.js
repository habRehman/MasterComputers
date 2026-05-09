const jwt  = require('jsonwebtoken')
const User = require('../models/User')

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized — no token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')
    const user    = await User.findById(decoded.id).select('-password')
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

const adminMiddleware = async (req, res, next) => {
  await authMiddleware(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    next()
  })
}

module.exports = { authMiddleware, adminMiddleware }
