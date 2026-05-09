const express = require('express')
const Order   = require('../models/Order')
const Cart    = require('../models/Cart')
const Product = require('../models/Product')
const { authMiddleware } = require('../middleware/auth')
const router  = express.Router()

const CITIES = ['Karachi','Lahore','Islamabad','Peshawar','Quetta','Multan',
                'Faisalabad','Rawalpindi','Sialkot','Hyderabad']

// GET /api/orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean()
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/orders — place order from cart
router.post('/', authMiddleware, async (req, res) => {
  const { shipping_city, shipping_address, payment_method = 'cod', notes } = req.body

  if (!CITIES.includes(shipping_city))
    return res.status(400).json({ error: `We deliver to: ${CITIES.join(', ')}` })

  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name brand image_url price stock')

    if (!cart?.items?.length)
      return res.status(400).json({ error: 'Your cart is empty' })

    // Stock check
    for (const item of cart.items) {
      if (!item.product) continue
      if (item.product.stock < item.quantity)
        return res.status(400).json({
          error: `"${item.product.name}" only has ${item.product.stock} in stock`
        })
    }

    const total = cart.items.reduce(
      (s, i) => s + (i.product?.price || 0) * i.quantity, 0
    )

    // Snapshot items so order is self-contained
    const orderItems = cart.items.map(i => ({
      product:    i.product._id,
      name:       i.product.name,
      brand:      i.product.brand,
      image_url:  i.product.image_url,
      quantity:   i.quantity,
      unit_price: i.product.price,
    }))

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total_amount: total,
      shipping_city,
      shipping_address,
      payment_method,
      notes,
    })

    // Decrement stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      })
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] })

    res.status(201).json({
      order,
      message: 'Order placed successfully! Shukriya for shopping with Master Computers. 🇵🇰'
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/orders/cities
router.get('/cities', (_req, res) => res.json(CITIES))

module.exports = router
