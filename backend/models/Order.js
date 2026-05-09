const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:       String,   // snapshot at time of order
  brand:      String,
  image_url:  String,
  quantity:   { type: Number, required: true, min: 1 },
  unit_price: { type: Number, required: true },
})

const orderSchema = new mongoose.Schema({
  user:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:            [orderItemSchema],
  total_amount:     { type: Number, required: true },   // PKR
  status: {
    type: String,
    enum: ['pending','confirmed','processing','shipped','delivered','cancelled'],
    default: 'pending',
  },
  shipping_city:    { type: String, required: true },
  shipping_address: { type: String, required: true },
  payment_method: {
    type: String,
    enum: ['cod','easypaisa','jazzcash','bank_transfer'],
    default: 'cod',
  },
  notes: { type: String, default: '' },
}, { timestamps: true })

orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ status: 1 })

module.exports = mongoose.model('Order', orderSchema)
