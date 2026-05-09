import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Monitor, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CITIES } from '../utils/api'

export function LoginPage() {
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const { login }             = useAuth()
  const navigate              = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(form.email, form.password); navigate('/') }
    catch (err: any) { setError(err.response?.data?.error || 'Login failed. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-12">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl animate-float pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-56 h-56 bg-cyan-400/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Monitor className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Welcome back!</h1>
          <p className="text-blue-200 mt-1">Sign in to your Master Computers account</p>
        </div>

        <div className="card p-8 animate-fade-in-up-1 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field" placeholder="you@example.com" required autoFocus />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-200 animate-shake">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base ripple">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold underline-grow">
              Create one
            </Link>
          </p>
        </div>
        <p className="text-center text-xs text-blue-300 mt-4 animate-fade-in-up-2">🇵🇰 Master Computers — Pakistan's Tech Store</p>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const [form,    setForm]    = useState({ email:'', password:'', full_name:'', phone:'', city:'' })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const { register }          = useAuth()
  const navigate              = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await register(form)
      setSuccess(true)
      setTimeout(() => navigate('/'), 1500)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed.')
    } finally { setLoading(false) }
  }

  const f = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-12">
      <div className="absolute top-20 right-20 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl animate-float pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Monitor className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Create Account</h1>
          <p className="text-blue-200 mt-1">Join Master Computers — Pakistan's Tech Store</p>
        </div>

        <div className="card p-8 animate-fade-in-up-1 shadow-2xl">
          {success ? (
            <div className="text-center py-8 animate-bounce-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="font-bold text-xl text-gray-900">Welcome aboard! 🎉</h3>
              <p className="text-gray-500 text-sm mt-2">Taking you to the store...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                <input type="text" value={form.full_name} onChange={f('full_name')}
                  className="input-field" placeholder="Muhammad Ali" required autoFocus />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                <input type="email" value={form.email} onChange={f('email')}
                  className="input-field" placeholder="you@example.com" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={f('phone')}
                    className="input-field" placeholder="03XX-XXXXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                  <select value={form.city} onChange={f('city')} className="input-field">
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={f('password')}
                    className="input-field pr-10" placeholder="Min. 6 characters" required minLength={6} />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-200">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base ripple">
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </span>
                  : 'Create Account'}
              </button>
            </form>
          )}
          <p className="text-center text-sm text-gray-600 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold underline-grow">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
