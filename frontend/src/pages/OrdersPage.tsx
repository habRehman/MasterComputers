import React, { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle, Package, Clock, Truck, XCircle, ArrowLeft, MapPin, CreditCard } from 'lucide-react'
import { api, formatPKR, ORDER_STATUS_COLOR, PAYMENT_LABELS } from '../utils/api'
import type { Order } from '../types'

const STATUS_META: Record<string, { icon: React.ReactNode; color: string }> = {
  pending:    { icon: <Clock    className="w-4 h-4" />, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  confirmed:  { icon: <CheckCircle className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  processing: { icon: <Package  className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  shipped:    { icon: <Truck    className="w-4 h-4" />, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  delivered:  { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-600 bg-green-50 border-green-200' },
  cancelled:  { icon: <XCircle  className="w-4 h-4" />, color: 'text-red-600 bg-red-50 border-red-200' },
}

const oid    = (o: any)  => o?._id || o?.id || ''
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { dateStyle: 'medium' })

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || STATUS_META.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
      {meta.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function OrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { id }                = useParams<{ id?: string }>()
  const [searchParams]        = useSearchParams()
  const justPlaced            = searchParams.get('success') === '1'

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(r.data || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton h-28 rounded-xl" style={{ animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  )

  if (id) {
    const order = orders.find(o => oid(o) === id)
    if (!order) return (
      <div className="text-center py-20 animate-fade-in-up">
        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="font-semibold text-gray-700">Order not found</p>
        <Link to="/orders" className="text-primary-600 text-sm hover:underline mt-2 block">← Back to Orders</Link>
      </div>
    )
    return <OrderDetail order={order} justPlaced={justPlaced} />
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 animate-fade-in-up">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 animate-bounce-in">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Start shopping to place your first order.</p>
          <Link to="/products" className="btn-primary px-8 ripple">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, idx) => (
            <Link key={oid(order)} to={`/orders/${oid(order)}`}
              className="card p-5 block hover:shadow-card transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up"
              style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-start justify-between mb-3 gap-3">
                <div>
                  <p className="font-mono text-xs text-gray-400 mb-0.5">#{oid(order).slice(0, 8).toUpperCase()}</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {order.shipping_city} ·{' '}
                    {fmtDate(order.createdAt || (order as any).created_at)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900 mb-1">{formatPKR(order.total_amount)}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* Item thumbnails */}
              {order.items && order.items.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {order.items.slice(0, 5).map((item, i) => (
                    <div key={i} className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      <img src={item.image_url || `https://placehold.co/40x40/e5e7eb/9ca3af?text=${item.brand?.[0] || 'P'}`}
                        alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {order.items.length > 5 && (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                      <span className="text-xs text-gray-500 font-medium">+{order.items.length - 5}</span>
                    </div>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function OrderDetail({ order, justPlaced }: { order: Order; justPlaced: boolean }) {
  const steps       = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
  const currentStep = order.status === 'cancelled' ? -1 : steps.indexOf(order.status)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">

      {/* Success banner */}
      {justPlaced && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-center gap-4 animate-bounce-in">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="font-bold text-green-900 text-lg">Order Placed Successfully! 🎉</p>
            <p className="text-green-700 text-sm">Shukriya for shopping with Master Computers 🇵🇰</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-3 animate-fade-in-up">
        <div>
          <Link to="/orders" className="text-xs text-primary-600 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> My Orders
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            Order #{oid(order).slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(order.createdAt || (order as any).created_at).toLocaleDateString('en-PK', { dateStyle: 'full' })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Progress stepper */}
      {order.status !== 'cancelled' && (
        <div className="card p-5 mb-5 animate-fade-in-up-1">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Order Progress</h2>
          <div className="relative">
            {/* Track */}
            <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-green-500 rounded-full connector-fill"
                style={{ '--fill-width': `${(currentStep / (steps.length - 1)) * 100}%` } as React.CSSProperties}
              />
            </div>

            <div className="relative flex justify-between">
              {steps.map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-500
                    ${i < currentStep  ? 'bg-primary-600 border-primary-600 text-white shadow-md scale-100'
                    : i === currentStep ? 'bg-white border-primary-600 text-primary-600 shadow-glow animate-pulse-glow scale-110'
                    : 'bg-white border-gray-300 text-gray-400 scale-90'}`}>
                    {i < currentStep
                      ? <CheckCircle className="w-4 h-4" />
                      : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <span className={`text-xs capitalize font-medium hidden sm:block transition-colors duration-300
                    ${i <= currentStep ? 'text-primary-600' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-5 mb-4 animate-fade-in-up-2">
        <h2 className="font-bold text-gray-900 mb-4">Items Ordered</h2>
        <div className="divide-y divide-gray-50">
          {order.items?.map((item, idx) => (
            <div key={item._id || idx} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                <img src={item.image_url || `https://placehold.co/48x48/e5e7eb/9ca3af?text=${item.brand?.[0] || 'P'}`}
                  alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">{item.brand} · Qty: {item.quantity} × {formatPKR(item.unit_price)}</p>
              </div>
              <span className="font-bold text-sm text-gray-900 shrink-0">{formatPKR(item.quantity * item.unit_price)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center font-bold text-gray-900 pt-3 border-t border-gray-200 mt-1">
          <span>Total</span>
          <span className="text-lg text-primary-600">{formatPKR(order.total_amount)}</span>
        </div>
      </div>

      {/* Delivery + payment */}
      <div className="grid sm:grid-cols-2 gap-4 animate-fade-in-up-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Delivery Address</h3>
          </div>
          <p className="font-semibold text-gray-900">{order.shipping_city}</p>
          <p className="text-sm text-gray-600 mt-0.5">{order.shipping_address}</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Payment</h3>
          </div>
          <p className="font-semibold text-gray-900">{PAYMENT_LABELS[order.payment_method]}</p>
          {order.notes && <p className="text-xs text-gray-500 mt-1">Note: {order.notes}</p>}
        </div>
      </div>
    </div>
  )
}
