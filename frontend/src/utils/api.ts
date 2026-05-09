import axios from 'axios'

// ─── API axios instance ──────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({ baseURL: API_URL })

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('mc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Helpers ─────────────────────────────────────────────────
export const formatPKR = (amount: number): string =>
  `Rs. ${Math.round(amount).toLocaleString('en-PK')}`

export const discountPercent = (original: number, current: number): number =>
  Math.round(((original - current) / original) * 100)

export const PAYMENT_LABELS: Record<string, string> = {
  cod:           'Cash on Delivery',
  easypaisa:     'Easypaisa',
  jazzcash:      'JazzCash',
  bank_transfer: 'Bank Transfer',
}

export const ORDER_STATUS_COLOR: Record<string, string> = {
  pending:    'badge-yellow',
  confirmed:  'badge-blue',
  processing: 'badge-blue',
  shipped:    'badge-blue',
  delivered:  'badge-green',
  cancelled:  'badge-red',
}

export const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan',
  'Hyderabad', 'Gujranwala', 'Peshawar', 'Quetta', 'Sargodha', 'Sialkot',
  'Bahawalpur', 'Sukkur', 'Kandhkot', 'Sheikhupura', 'Rahim Yar Khan', 'Jhang',
  'Dera Ghazi Khan', 'Gujrat', 'Sahiwal', 'Wah Cantt', 'Mardan', 'Kasur',
  'Okara', 'Mingora', 'Nawabshah', 'Chiniot', 'Kotri', 'Kāmoke', 'Hafizabad',
  'Sadiqabad', 'Mirpur Khas', 'Burewala', 'Kohat', 'Khanewal', 'Dera Ismail Khan',
  'Turbat', 'Muzaffargarh', 'Abbotabad', 'Mandi Bahauddin', 'Shikarpur',
  'Jacobabad', 'Jhelum', 'Khanpur', 'Khairpur', 'Khuzdar', 'Pakpattan', 'Hub',
  'Daska', 'Gojra', 'Dadu', 'Muridke', 'Bahawalnagar', 'Samundri', 'Tando Allahyar',
  'Tando Adam', 'Jaranwala', 'Chishtian', 'Muzaffarabad', 'Attock', 'Vehari',
  'Kot Abdul Malik', 'Ferozwala', 'Chakwal', 'Gujranwala Cantt', 'Kamalia',
  'Umerkot', 'Ahmedpur East', 'Kot Addu', 'Wazirabad', 'Mansehra', 'Layyah',
  'Mirpur', 'Swabi', 'Chaman', 'Taxila', 'Nowshera', 'Khushab', 'Shahdadkot',
  'Mianwali', 'Kabal', 'Lodhran', 'Hasilpur', 'Bhakkar', 'Sambrial', 'Jampur',
  'Lala Musa', 'Ghari Shahu'
]
