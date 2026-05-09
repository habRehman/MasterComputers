const express  = require('express')
const path     = require('path')
const fs       = require('fs')
const Product  = require('../models/Product')
const Category = require('../models/Category')
const Order    = require('../models/Order')
const User     = require('../models/User')
const { adminMiddleware } = require('../middleware/auth')
const router   = express.Router()

router.use(adminMiddleware)

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, revenueAgg] = await Promise.all([
      Product.countDocuments({ is_active: true }),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ])
    ])
    res.json({
      total_products: totalProducts,
      total_orders:   totalOrders,
      total_users:    totalUsers,
      total_revenue:  revenueAgg[0]?.total || 0,
      currency: 'PKR'
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- Products CRUD ---

// POST /api/admin/products
router.post('/products', async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PATCH /api/admin/products/:id
router.patch('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/admin/products/:id — soft delete
router.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { is_active: false })
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Orders management ---

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const { status, city } = req.query
    const filter = {}
    if (status) filter.status = status
    if (city)   filter.shipping_city = city

    const orders = await Order.find(filter)
      .populate('user', 'full_name phone email')
      .sort({ createdAt: -1 })
      .lean()
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/admin/orders/:id
router.patch('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    )
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Categories ---

// GET /api/admin/categories
router.get('/categories', async (_req, res) => {
  const cats = await Category.find().sort({ name: 1 })
  res.json(cats)
})

// POST /api/admin/categories
router.post('/categories', async (req, res) => {
  try {
    const cat = await Category.create(req.body)
    res.status(201).json(cat)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// GET /api/admin/customer-analytics  — parsed from adata.csv
router.get('/customer-analytics', (_req, res) => {
  try {
    const csvPath = path.join(__dirname, '..', 'adata.csv')
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'adata.csv not found in backend folder' })
    }

    const raw  = fs.readFileSync(csvPath, 'utf8')
    const lines = raw.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const obj = {}
      headers.forEach((h, i) => { obj[h] = vals[i] ?? '' })
      return obj
    })

    const countBy = (col) => {
      const map = {}
      rows.forEach(r => { const v = r[col]; if (v) map[v] = (map[v] || 0) + 1 })
      return Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))
    }

    // Age groups
    const ageBuckets = { '<20':0, '20-24':0, '25-29':0, '30-34':0, '35-39':0, '40-49':0, '50+':0 }
    rows.forEach(r => {
      const age = parseInt(r['Age'])
      if (isNaN(age)) return
      if (age < 20)       ageBuckets['<20']++
      else if (age < 25)  ageBuckets['20-24']++
      else if (age < 30)  ageBuckets['25-29']++
      else if (age < 35)  ageBuckets['30-34']++
      else if (age < 40)  ageBuckets['35-39']++
      else if (age < 50)  ageBuckets['40-49']++
      else                ageBuckets['50+']++
    })
    const age_group = Object.entries(ageBuckets).map(([name, value]) => ({ name, value }))

    res.json({
      total:        rows.length,
      gender:       countBy('Gender'),
      city:         countBy('City'),
      brand:        countBy('Brand'),
      generation:   countBy('Generation'),
      ram_type:     countBy('RAM_Type'),
      ram_size:     countBy('RAM_Size'),
      storage:      countBy('Storage'),
      usage_type:   countBy('Usage_Type'),
      buying_power: countBy('Buying_Power'),
      age_group,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
