const express = require('express')
const Cart    = require('../models/Cart')
const Product = require('../models/Product')
const { authMiddleware } = require('../middleware/auth')
const router  = express.Router()

const getPopulatedCart = (userId) =>
  Cart.findOne({ user: userId })
    .populate('items.product', 'name price image_url stock brand')
    .lean()

// GET /api/cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cart  = await getPopulatedCart(req.user._id)
    const items = cart?.items || []
    const total = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0)
    res.json({ items, total, currency: 'PKR' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/cart — add / update item
router.post('/', authMiddleware, async (req, res) => {
  const { product_id, quantity = 1 } = req.body
  try {
    const product = await Product.findById(product_id)
    if (!product) return res.status(404).json({ error: 'Product not found' })

    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) cart = new Cart({ user: req.user._id, items: [] })

    const existing = cart.items.find(i => i.product.toString() === product_id)
    if (existing) {
      existing.quantity = quantity
    } else {
      cart.items.push({ product: product_id, quantity })
    }
    await cart.save()
    res.json(await getPopulatedCart(req.user._id))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PATCH /api/cart/:productId — update quantity
router.patch('/:productId', authMiddleware, async (req, res) => {
  const { quantity } = req.body
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ error: 'Cart not found' })

    if (quantity < 1) {
      cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId)
    } else {
      const item = cart.items.find(i => i.product.toString() === req.params.productId)
      if (item) item.quantity = quantity
    }
    await cart.save()
    res.json(await getPopulatedCart(req.user._id))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/cart/:productId — remove one item
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (cart) {
      cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId)
      await cart.save()
    }
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/cart — clear entire cart
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] })
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
