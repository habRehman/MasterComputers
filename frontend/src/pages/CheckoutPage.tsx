import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, MapPin, CreditCard, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { api, formatPKR, CITIES, PAYMENT_LABELS } from '../utils/api'

const PAYMENT_ICONS: Record<string, string> = {
  cod: '💸', easypaisa: '📱', jazzcash: '📱', bank_transfer: '🏦'
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    shipping_city: '', shipping_address: '', payment_method: 'cod', notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const shipping = total >= 50000 ? 0 : 500

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.shipping_city || !form.shipping_address) {
      setError('Please fill all required fields.'); return
    }
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/orders', form)
      await clearCart()
      navigate(`/orders/${data.order._id || data.order.id}?success=1`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.')
    } finally { setLoading(false) }
  }

  if (items.length === 0) { navigate('/cart'); return null }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 animate-fade-in-up">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-6">
        {/* Left — 3 cols */}
        <div className="md:col-span-3 space-y-5">

          {/* Shipping */}
          <div className="card p-5 animate-fade-in-up">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2 text-gray-900">
              <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-600" />
              </div>
              Delivery Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
                <select value={form.shipping_city}
                  onChange={e => setForm(f => ({ ...f, shipping_city: e.target.value }))}
                  className="input-field" required>
                  <option value="">— Select your city —</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Address *</label>
                <textarea value={form.shipping_address}
                  onChange={e => setForm(f => ({ ...f, shipping_address: e.target.value }))}
                  className="input-field resize-none" rows={3}
                  placeholder="House #, Street, Area, City" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Order Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="input-field" placeholder="Any special instructions..." />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-5 animate-fade-in-up-1">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2 text-gray-900">
              <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-primary-600" />
              </div>
              Payment Method
            </h2>
            <div className="space-y-2">
              {Object.entries(PAYMENT_LABELS).map(([val, label]) => (
                <label key={val}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${form.payment_method === val
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value={val}
                    checked={form.payment_method === val}
                    onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                    className="accent-primary-600" />
                  <span className="text-lg">{PAYMENT_ICONS[val]}</span>
                  <span className="font-medium text-sm flex-1">{label}</span>
                  {val === 'cod' && <span className="badge-green text-xs">Recommended</span>}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right — 2 cols */}
        <div className="md:col-span-2">
          <div className="card p-5 sticky top-24 animate-fade-in-up-2">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary-600" /> Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const p = item.product || (item as any).products
                if (!p) return null
                const pid = (p as any)._id || (p as any).id || ''
                return (
                  <div key={item._id || pid}
                    className="flex justify-between items-center text-sm py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img src={(p as any).image_url || 'https://placehold.co/32x32/e5e7eb/9ca3af?text=P'}
                          alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-900 font-medium truncate text-xs">{(p as any).name}</p>
                        <p className="text-gray-400 text-xs">×{item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900 ml-2 shrink-0 text-xs">
                      {formatPKR((p as any).price * item.quantity)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-3 border-t border-gray-200 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span className="font-medium">{formatPKR(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                  {shipping === 0 ? 'FREE 🎉' : formatPKR(shipping)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary-600">{formatPKR(total + shipping)}</span>
              </div>
              <p className="text-xs text-gray-400 text-right">in Pakistani Rupees (PKR)</p>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-200 animate-fade-in">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 mt-4 text-base ripple">
              {loading
                ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing Order...</>
                : <><CheckCircle className="w-5 h-5" /> Place Order</>}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              🔒 Secure checkout — your data is safe
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
