const mongoose = require('mongoose')

const productViewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true })

productViewSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('ProductView', productViewSchema)
