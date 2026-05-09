const express     = require('express')
const Product     = require('../models/Product')
const Category    = require('../models/Category')
const ProductView = require('../models/ProductView')
const { authMiddleware } = require('../middleware/auth')
const router      = express.Router()

// GET /api/products — list with filters
router.get('/', async (req, res) => {
  try {
    const { category, search, min_price, max_price, brand, featured, limit = 50 } = req.query
    const filter = { is_active: true }

    if (search) filter.$text = { $search: search }
    if (brand)  filter.brand = new RegExp(brand, 'i')
    if (featured === 'true') filter.is_featured = true
    if (min_price || max_price) {
      filter.price = {}
      if (min_price) filter.price.$gte = Number(min_price)
      if (max_price) filter.price.$lte = Number(max_price)
    }

    // Resolve category slug → ObjectId
    if (category) {
      const cat = await Category.findOne({ slug: category })
      if (cat) filter.category = cat._id
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug icon')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean()

    res.json({ products, total: products.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/products/categories/all
router.get('/categories/all', async (_req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 }).lean()
    res.json(cats)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, is_active: true })
      .populate('category', 'name slug icon')
      .lean()
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(404).json({ error: 'Product not found' })
  }
})

// POST /api/products/:id/view — record view for ML
router.post('/:id/view', authMiddleware, async (req, res) => {
  try {
    await ProductView.create({ user: req.user._id, product: req.params.id })
    res.json({ success: true })
  } catch {
    res.json({ success: false })
  }
})

module.exports = router
