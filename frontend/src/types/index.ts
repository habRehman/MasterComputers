export interface Category {
  _id:  string
  id?:  string      // alias for _id used in some responses
  name: string
  slug: string
  icon: string
}

export interface Product {
  _id:            string
  id?:            string
  name:           string
  description:    string
  price:          number
  original_price?: number
  category:       Category | string
  brand:          string
  model:          string
  stock:          number
  image_url?:     string
  specs:          Record<string, string>
  is_featured:    boolean
  is_active:      boolean
  createdAt:      string
}

export interface CartItem {
  _id:        string
  product:    Pick<Product, '_id'|'name'|'price'|'image_url'|'stock'|'brand'>
  // legacy flat keys used by cart page
  product_id?: string
  products?:   Pick<Product, '_id'|'name'|'price'|'image_url'|'stock'|'brand'>
  quantity:   number
}

export interface OrderItem {
  _id:        string
  product:    string
  name:       string
  brand:      string
  image_url?: string
  quantity:   number
  unit_price: number
}

export interface Order {
  _id:              string
  id?:              string
  user:             string | { full_name: string; phone: string }
  items:            OrderItem[]
  total_amount:     number
  status:           'pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled'
  shipping_city:    string
  shipping_address: string
  payment_method:   'cod'|'easypaisa'|'jazzcash'|'bank_transfer'
  notes?:           string
  createdAt:        string
}

export interface Profile {
  id:        string
  full_name: string
  phone:     string
  city:      string
  address:   string
  role:      'customer' | 'admin'
}

export interface User {
  id:       string
  email:    string
  profile?: Profile
}

export interface ChatMessage {
  id:        string
  role:      'user' | 'bot'
  text:      string
  data?:     PricePrediction
  timestamp: Date
}

export interface PricePrediction {
  predicted_price:   number
  price_range_low:   number
  price_range_high:  number
  currency:          string
  parsed?: {
    ram:         number
    storage:     number
    device_type: string
    is_premium:  boolean
  }
}
