import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Phone, MapPin, Home, Save, LogOut, Package, ShoppingCart, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CITIES } from '../utils/api'

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: user?.profile?.full_name || '',
    phone:     user?.profile?.phone     || '',
    city:      user?.profile?.city      || '',
    address:   user?.profile?.address   || '',
  })
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  if (!user) { navigate('/login'); return null }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await updateProfile(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { setError('Failed to update profile. Please try again.') }
    finally { setSaving(false) }
  }

  const f = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [field]: e.target.value }))

  const initials = (form.full_name || user.email || 'U').split(' ')
    .map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">

      {/* Profile header card */}
      <div className="card p-6 mb-5 animate-fade-in-up">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl
                            flex items-center justify-center text-white text-xl font-extrabold shadow-glow">
              {initials}
            </div>
            {user.profile?.role === 'admin' && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                <Shield className="w-3 h-3 text-yellow-900" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {form.full_name || 'Your Account'}
            </h1>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
            {form.city && (
              <p className="text-xs text-primary-600 font-medium mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {form.city}
              </p>
            )}
            {user.profile?.role === 'admin' && (
              <span className="badge-yellow text-xs mt-1">Admin</span>
            )}
          </div>

          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50
                       px-3 py-1.5 border border-red-200 rounded-xl transition-all duration-200 active:scale-95 shrink-0">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-6 mb-5 animate-fade-in-up-1">
        <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          Edit Profile
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Full name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={form.full_name} onChange={f('full_name')}
                className="input-field pl-10" placeholder="Muhammad Ali" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" value={form.phone} onChange={f('phone')}
                className="input-field pl-10" placeholder="03XX-XXXXXXX" />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={form.city} onChange={f('city')} className="input-field pl-10">
                <option value="">Select your city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Delivery Address</label>
            <div className="relative">
              <Home className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea value={form.address} onChange={f('address')}
                className="input-field pl-10 resize-none" rows={3}
                placeholder="House #, Street, Area" />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-200 animate-fade-in">
              {error}
            </p>
          )}
          {saved && (
            <p className="text-sm text-green-700 bg-green-50 px-3 py-2.5 rounded-lg border border-green-200 flex items-center gap-2 animate-bounce-in">
              ✅ Profile updated successfully!
            </p>
          )}

          <button type="submit" disabled={saving}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 ripple">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in-up-2">
        <Link to="/orders"
          className="card p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-3">
            <Package className="w-5 h-5 text-primary-600" />
          </div>
          <p className="font-semibold text-sm text-gray-900">My Orders</p>
          <p className="text-xs text-gray-500 mt-0.5">Track your purchases</p>
        </Link>

        <Link to="/cart"
          className="card p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="font-semibold text-sm text-gray-900">My Cart</p>
          <p className="text-xs text-gray-500 mt-0.5">View saved items</p>
        </Link>
      </div>
    </div>
  )
}
