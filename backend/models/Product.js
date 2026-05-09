const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  description:    { type: String, default: '' },
  price:          { type: Number, required: true, min: 0 },       // PKR
  original_price: { type: Number, default: null },
  category:       { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand:          { type: String, required: true, trim: true },
  model:          { type: String, default: '' },
  stock:          { type: Number, default: 0, min: 0 },
  image_url:      { type: String, default: null },
  specs:          { type: Map, of: String, default: {} },
  is_featured:    { type: Boolean, default: false },
  is_active:      { type: Boolean, default: true },
}, { timestamps: true })

// Full-text search index
productSchema.index({ name: 'text', brand: 'text', description: 'text' })
productSchema.index({ category: 1 })
productSchema.index({ price: 1 })
productSchema.index({ brand: 1 })
productSchema.index({ is_featured: 1, is_active: 1 })

module.exports = mongoose.model('Product', productSchema)
