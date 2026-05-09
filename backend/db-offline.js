/**
 * Offline Database System — Replaces MongoDB
 * Stores data in JSON files locally
 */

const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const DATA_DIR = path.join(__dirname, 'data')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// In-memory cache for faster access
const collections = {
  products: [],
  categories: [],
  users: [],
  carts: [],
  orders: [],
  productviews: []
}

let initialized = false

// ─── COLLECTION CLASS ───────────────────────────────────────────
class Collection {
  constructor(name) {
    this.name = name
    this.filePath = path.join(DATA_DIR, `${name}.json`)
    this.data = collections[name] || []
  }

  save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2))
  }

  load() {
    if (fs.existsSync(this.filePath)) {
      try {
        this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'))
        collections[this.name] = this.data
        return this.data
      } catch (err) {
        console.error(`[Offline DB] Error loading ${this.name}:`, err.message)
        return []
      }
    }
    return []
  }

  async find(filter = {}) {
    this.load()
    let results = [...this.data]

    for (const [key, value] of Object.entries(filter)) {
      if (key === '$text' && value.$search) {
        // Simple full-text search
        const searchTerm = value.$search.toLowerCase()
        results = results.filter(doc =>
          (doc.name && doc.name.toLowerCase().includes(searchTerm)) ||
          (doc.brand && doc.brand.toLowerCase().includes(searchTerm)) ||
          (doc.description && doc.description.toLowerCase().includes(searchTerm))
        )
      } else if (key === 'category' && value._id) {
        results = results.filter(doc => doc.category === value._id || doc.category === value)
      } else if (key === 'category') {
        results = results.filter(doc => doc.category === value)
      } else if (typeof value === 'object' && value.$gte !== undefined) {
        results = results.filter(doc => doc[key] >= value.$gte)
      } else if (typeof value === 'object' && value.$lte !== undefined) {
        results = results.filter(doc => doc[key] <= value.$lte)
      } else if (typeof value === 'object' && value instanceof RegExp) {
        results = results.filter(doc => value.test(doc[key]))
      } else if (typeof value === 'object' && value.test !== undefined) {
        results = results.filter(doc => value.test(doc[key]))
      } else {
        results = results.filter(doc => doc[key] === value)
      }
    }

    return results
  }

  async findOne(filter = {}) {
    const results = await this.find(filter)
    return results.length > 0 ? results[0] : null
  }

  async findById(id) {
    return this.findOne({ _id: id })
  }

  async create(data) {
    const doc = {
      _id: data._id || uuidv4(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.data.push(doc)
    this.save()
    return doc
  }

  async updateOne(filter, update) {
    const doc = await this.findOne(filter)
    if (!doc) return { matchedCount: 0, modifiedCount: 0 }

    const $set = update.$set || update
    Object.assign(doc, $set)
    doc.updatedAt = new Date()
    this.save()
    return { matchedCount: 1, modifiedCount: 1 }
  }

  async deleteOne(filter) {
    const index = this.data.findIndex(doc => {
      for (const [key, value] of Object.entries(filter)) {
        if (doc[key] !== value) return false
      }
      return true
    })
    if (index === -1) return { deletedCount: 0 }
    this.data.splice(index, 1)
    this.save()
    return { deletedCount: 1 }
  }

  async deleteMany(filter = {}) {
    const initialLength = this.data.length
    this.data = this.data.filter(doc => {
      for (const [key, value] of Object.entries(filter)) {
        if (doc[key] !== value) return true
      }
      return false
    })
    const deletedCount = initialLength - this.data.length
    this.save()
    return { deletedCount }
  }

  async countDocuments(filter = {}) {
    const results = await this.find(filter)
    return results.length
  }

  populate(path, select) {
    return this
  }

  sort(order) {
    return this
  }

  limit(count) {
    return this
  }

  lean() {
    return this
  }
}

// ─── OFFLINE DB CLASS ───────────────────────────────────────────
class OfflineDB {
  constructor() {
    this.products = new Collection('products')
    this.categories = new Collection('categories')
    this.users = new Collection('users')
    this.carts = new Collection('carts')
    this.orders = new Collection('orders')
    this.productviews = new Collection('productviews')
  }

  async initialize() {
    if (initialized) return
    console.log('[Offline DB] Initializing...')

    // Load existing data
    this.products.load()
    this.categories.load()
    this.users.load()
    this.carts.load()
    this.orders.load()
    this.productviews.load()

    // If no categories, seed default data
    if (this.categories.data.length === 0) {
      await this.seedData()
    }

    initialized = true
    console.log('[Offline DB] Initialized successfully')
  }

  async seedData() {
    console.log('[Offline DB] Seeding initial data...')

    // Categories
    const categories = [
      { name: 'Laptops', slug: 'laptops', icon: '💻' },
      { name: 'Desktops', slug: 'desktops', icon: '🖥️' },
      { name: 'Mobile Phones', slug: 'mobiles', icon: '📱' },
      { name: 'Monitors', slug: 'monitors', icon: '🖥' },
      { name: 'Components', slug: 'components', icon: '⚙️' },
      { name: 'Accessories', slug: 'accessories', icon: '🖱️' },
      { name: 'Networking', slug: 'networking', icon: '📡' },
      { name: 'Storage', slug: 'storage', icon: '💾' },
    ]

    for (const cat of categories) {
      await this.categories.create(cat)
    }

    // Get category IDs for products
    const catMap = {}
    for (const cat of this.categories.data) {
      catMap[cat.slug] = cat._id
    }

    // Sample products (laptops and mobiles)
    const products = [
      {
        name: 'Dell Inspiron 15 3520',
        description: 'Reliable everyday laptop ideal for students and office use.',
        price: 145000,
        original_price: 155000,
        category: catMap.laptops,
        brand: 'Dell',
        model: 'Inspiron 3520',
        stock: 20,
        image_url: 'https://www.qtechempire.com/wp-content/uploads/2024/05/dell-inspiron-15-3520-1585sg-512-w11-156-fhd-120hz-laptop-platinum-silver-i3-1215u-8gb-512gb-ssd-intel-w11-2.jpg',
        is_featured: true,
        is_active: true,
        specs: { Processor: 'Intel Core i5-1235U', RAM: '8GB DDR4', Storage: '512GB SSD', Display: '15.6" FHD', OS: 'Windows 11' }
      },
      {
        name: 'HP Pavilion 15-eg2000',
        description: 'Powerful HP Pavilion laptop for students and professionals.',
        price: 168000,
        original_price: 180000,
        category: catMap.laptops,
        brand: 'HP',
        model: 'Pavilion 15-eg2000',
        stock: 15,
        image_url: 'https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08099876.png',
        is_featured: true,
        is_active: true,
        specs: { Processor: 'Intel Core i5-1335U', RAM: '16GB DDR4', Storage: '512GB SSD', Display: '15.6" FHD IPS' }
      },
      {
        name: 'Lenovo ThinkPad E14 Gen 5',
        description: 'Business-class laptop with durable build and performance.',
        price: 210000,
        original_price: 225000,
        category: catMap.laptops,
        brand: 'Lenovo',
        model: 'ThinkPad E14 Gen 5',
        stock: 10,
        image_url: 'https://p4-ofp.static.pub/ShareResource/na/products/thinkpad/2023-e14-gen5/hero.png',
        is_featured: false,
        is_active: true,
        specs: { Processor: 'Intel Core i7-1355U', RAM: '16GB DDR4', Storage: '512GB SSD' }
      },
      {
        name: 'Samsung Galaxy A55 5G',
        description: 'Most popular mid-range phone in Pakistan.',
        price: 89000,
        original_price: 95000,
        category: catMap.mobiles,
        brand: 'Samsung',
        model: 'Galaxy A55 5G',
        stock: 50,
        image_url: 'https://d1iv6qgcmtzm6l.cloudfront.net/product_galleries/lg_PsnMQrBuP3Ah0LoaJIeAcXTCklnsokymDjKdesj4.jpg',
        is_featured: true,
        is_active: true,
        specs: { Processor: 'Exynos 1480', RAM: '8GB', Storage: '256GB', Display: '6.6" Super AMOLED 120Hz', Camera: '50MP+12MP+5MP', Battery: '5000mAh', OS: 'Android 14' }
      },
      {
        name: 'Xiaomi Redmi Note 13 Pro',
        description: 'Budget king in Pakistan. Excellent camera at an affordable price.',
        price: 65000,
        original_price: 69000,
        category: catMap.mobiles,
        brand: 'Xiaomi',
        model: 'Redmi Note 13 Pro',
        stock: 60,
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9jgysqugzQpDQBifjKlZPfKsNaHaGjIxncQ&s',
        is_featured: true,
        is_active: true,
        specs: { Processor: 'Helio G99 Ultra', RAM: '8GB', Storage: '256GB', Display: '6.67" AMOLED 120Hz', Camera: '200MP', Battery: '5100mAh', OS: 'Android 13' }
      },
      {
        name: 'Acer Aspire 5',
        description: 'Best value for money laptop in Pakistan.',
        price: 122000,
        original_price: 128000,
        category: catMap.laptops,
        brand: 'Acer',
        model: 'Aspire 5 A515',
        stock: 35,
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMMa7Lkh65NyXAfWeu5DcnfEvYm1a-OqpYEg&s',
        is_featured: true,
        is_active: true,
        specs: { Processor: 'AMD Ryzen 5 7530U', RAM: '8GB DDR4', Storage: '512GB SSD', Display: '15.6" FHD IPS', OS: 'Windows 11' }
      }
    ]

    for (const prod of products) {
      await this.products.create(prod)
    }

    // Sample users (hashed passwords)
    const bcrypt = require('bcryptjs')
    const adminHash = await bcrypt.hash('admin123', 12)
    const demoHash = await bcrypt.hash('demo1234', 12)

    await this.users.create({
      email: 'admin@mastercomputers.pk',
      password: adminHash,
      full_name: 'Admin User',
      phone: '0300-0000000',
      city: 'Lahore',
      address: 'Admin Office',
      role: 'admin'
    })

    await this.users.create({
      email: 'demo@example.com',
      password: demoHash,
      full_name: 'Demo Customer',
      phone: '0300-1234567',
      city: 'Karachi',
      address: 'Demo Address',
      role: 'customer'
    })

    console.log('[Offline DB] Data seeded successfully')
  }

  async close() {
    console.log('[Offline DB] Closing...')
  }
}

module.exports = new OfflineDB()
