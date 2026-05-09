import React, { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPKR } from '../utils/api'

export default function CartPage() {
  const { items, total, updateItem, removeItem, loading } = useCart()
  const { user }    = useAuth()
  const navigate    = useNavigate()

  if (!user) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in-up">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="w-12 h-12 text-gray-300" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Please login to view cart</h2>
      <p className="text-gray-500 mb-6">Sign in to add items and checkout.</p>
      <Link to="/login" className="btn-primary px-8 ripple">Login</Link>
    </div>
  )

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton h-28 rounded-xl" style={{ animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  )

  if (items.length === 0) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center animate-bounce-in">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="w-12 h-12 text-gray-300" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Add some products to get started.</p>
      <Link to="/products" className="btn-primary px-8 ripple">Start Shopping</Link>
    </div>
  )

  const shipping     = total >= 50000 ? 0 : 500
  const freeShipLeft = 50000 - total
  const freeShipPct  = Math.min((total / 50000) * 100, 100)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 animate-fade-in-up">
        Shopping Cart
        <span className="ml-2 text-base font-normal text-gray-500">({items.length} item{items.length !== 1 ? 's' : ''})</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item, idx) => {
            const p = item.product || (item as any).products
            if (!p) return null
            const productId = (p as any)._id || (p as any).id || ''
            return (
              <div key={item._id || productId}
                className="card p-4 flex gap-4 animate-fade-in-up hover:shadow-card-hover transition-shadow"
                style={{ animationDelay: `${idx * 60}ms` }}>
                <Link to={`/products/${productId}`}
                  className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 img-zoom-container">
                  <img
                    src={(p as any).image_url || `https://placehold.co/80x80/1e3a8a/white?text=${(p as any).brand?.[0] || 'P'}`}
                    alt={(p as any).name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide">{(p as any).brand}</p>
                  <Link to={`/products/${productId}`}>
                    <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-primary-600 transition-colors">
                      {(p as any).name}
                    </p>
                  </Link>
                  <p className="text-base font-bold text-gray-900 mt-1">{formatPKR((p as any).price)}</p>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <button onClick={() => removeItem(productId)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 active:scale-90">
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Qty stepper */}
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    <button
                      onClick={() => updateItem(productId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors active:scale-90">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(productId, item.quantity + 1)}
                      disabled={item.quantity >= ((p as any).stock || 99)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors active:scale-90 disabled:opacity-40">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-sm font-bold text-primary-600">{formatPKR((p as any).price * item.quantity)}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24 animate-fade-in-up-1">
            <h2 className="font-bold text-lg mb-4 text-gray-900">Order Summary</h2>

            {/* Free shipping progress */}
            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-600 font-medium">Free shipping progress</span>
                <span className={`font-bold ${shipping === 0 ? 'text-green-600' : 'text-primary-600'}`}>
                  {shipping === 0 ? '✓ Unlocked!' : `${formatPKR(freeShipLeft)} left`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-green-500 rounded-full progress-fill transition-all duration-700"
                  style={{ width: `${freeShipPct}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5 mb-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold">{formatPKR(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                  {shipping === 0 ? '🎉 FREE' : formatPKR(shipping)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2.5 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span className="text-primary-600">{formatPKR(total + shipping)}</span>
              </div>
              <p className="text-xs text-gray-400 text-right">PKR — Pakistani Rupees</p>
            </div>

            <button onClick={() => navigate('/checkout')}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base ripple">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-4 space-y-1.5 pt-4 border-t border-gray-100">
              {[
                '💸 Cash on Delivery available',
                '📱 Easypaisa & JazzCash',
                '🏦 Bank Transfer'
              ].map(t => (
                <p key={t} className="text-xs text-gray-500 flex items-center gap-1">{t}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
