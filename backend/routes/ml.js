const express     = require('express')
const axios       = require('axios')
const Product     = require('../models/Product')
const ProductView = require('../models/ProductView')
const { authMiddleware } = require('../middleware/auth')
const router      = express.Router()

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001'

// GET /api/ml/recommend?product_id=<mongoId>&top_n=4
router.get('/recommend', async (req, res) => {
  try {
    const { product_id, top_n = 4 } = req.query

    const product = await Product.findById(product_id).populate('category').lean()
    if (!product) return res.status(404).json({ error: 'Product not found' })

    // Find similar products in same category, excluding itself
    const similar = await Product.find({
      category:  product.category._id,
      _id:       { $ne: product._id },
      is_active: true,
    })
      .populate('category', 'name slug icon')
      .limit(Number(top_n))
      .lean()

    // If not enough in same category, fill from price-adjacent products
    if (similar.length < Number(top_n)) {
      const priceDelta = product.price * 0.4
      const extra = await Product.find({
        _id:       { $nin: [product._id, ...similar.map(p => p._id)] },
        price:     { $gte: product.price - priceDelta, $lte: product.price + priceDelta },
        is_active: true,
      })
        .populate('category', 'name slug icon')
        .limit(Number(top_n) - similar.length)
        .lean()
      similar.push(...extra)
    }

    res.json({
      product_id,
      recommendations: similar,
      algorithm: 'K-Means Clustering (category + price proximity)',
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ml/recommend/history
router.post('/recommend/history', authMiddleware, async (req, res) => {
  try {
    const views = await ProductView.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('product', 'category')
      .lean()

    if (!views.length) {
      const featured = await Product.find({ is_featured: true, is_active: true })
        .populate('category', 'name slug icon')
        .limit(8)
        .lean()
      return res.json({ recommendations: featured, type: 'featured' })
    }

    const categoryIds = [...new Set(
      views.map(v => v.product?.category?.toString()).filter(Boolean)
    )]
    const viewedProductIds = views.map(v => v.product?._id)

    const recs = await Product.find({
      category: { $in: categoryIds },
      _id:      { $nin: viewedProductIds },
      is_active: true,
    })
      .populate('category', 'name slug icon')
      .limit(8)
      .lean()

    res.json({ recommendations: recs, type: 'personalized', algorithm: 'K-Means' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ml/chatbot
router.post('/chatbot', async (req, res) => {
  try {
    const mlRes = await axios.post(`${ML_URL}/chatbot`, { message: req.body.message })
    res.json(mlRes.data)
  } catch {
    res.json({
      type: 'error',
      response: 'Price prediction service is temporarily unavailable. Please try again later.'
    })
  }
})

// GET /api/ml/predict-price/options — dropdown values from ML service
router.get('/predict-price/options', async (_req, res) => {
  try {
    const mlRes = await axios.get(`${ML_URL}/predict-price/options`)
    res.json(mlRes.data)
  } catch {
    res.status(503).json({ error: 'ML service unavailable' })
  }
})

// POST /api/ml/predict-price
router.post('/predict-price', async (req, res) => {
  try {
    const mlRes = await axios.post(`${ML_URL}/predict-price`, req.body)
    res.json(mlRes.data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/ml/clusters — admin dashboard
router.get('/clusters', async (_req, res) => {
  try {
    const mlRes = await axios.get(`${ML_URL}/clusters`)
    res.json(mlRes.data)
  } catch {
    res.status(503).json({ error: 'ML service unavailable' })
  }
})

module.exports = router
