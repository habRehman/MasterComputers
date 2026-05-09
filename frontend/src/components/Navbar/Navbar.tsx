import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Search, Monitor, LogOut, LayoutDashboard, ChevronDown, TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

const CATEGORIES = [
  { label: '💻 Laptops',     slug: 'laptops'     },
  { label: '📱 Mobiles',     slug: 'mobiles'     },
  { label: '🖥 Monitors',    slug: 'monitors'    },
  { label: '⚙️ Components',  slug: 'components'  },
  { label: '🖱️ Accessories', slug: 'accessories' },
  { label: '📡 Networking',  slug: 'networking'  },
  { label: '💾 Storage',     slug: 'storage'     },
]

export default function Navbar() {
  const { user, logout }    = useAuth()
  const { itemCount }       = useCart()
  const navigate            = useNavigate()
  const location            = useLocation()
  const [menuOpen, setMenuOpen]   = useState(false)
  const [userOpen, setUserOpen]   = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [scrolled, setScrolled]   = useState(false)
  const [cartBump, setCartBump]   = useState(false)
  const prevCount               = useRef(itemCount)
  const userMenuRef             = useRef<HTMLDivElement>(null)

  // Bump animation when cart count increases
  useEffect(() => {
    if (itemCount > prevCount.current) {
      setCartBump(true)
      setTimeout(() => setCartBump(false), 400)
    }
    prevCount.current = itemCount
  }, [itemCount])

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on navigation
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`)
      setSearchVal('')
    }
  }

  const isAdmin = user?.profile?.role === 'admin'

  return (
    <nav className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-200'}`}>
      {/* Pakistan strip */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-green-700 text-white text-xs text-center py-1.5 font-medium tracking-wide">
        🇵🇰&nbsp; Pakistan's Trusted Computer Store — Free Delivery on orders above Rs. 50,000
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="bg-primary-600 group-hover:bg-primary-700 p-1.5 rounded-lg transition-colors duration-200">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-gray-900 text-sm leading-tight">Master Computers</p>
              <p className="text-xs text-gray-500 leading-tight">Pakistan's Tech Store</p>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search laptops, phones, accessories..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           transition-all duration-200"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2">
            {/* Price Predictor */}
            <Link to="/price-predictor"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
              <TrendingUp className="w-4 h-4" />
              Price Predictor
            </Link>
            {/* Cart */}
            <Link to="/cart"
              className={`relative p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50
                          ${cartBump ? 'animate-wiggle' : ''}`}>
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5
                                  rounded-full flex items-center justify-center font-bold
                                  transition-transform duration-200 ${cartBump ? 'scale-125' : 'scale-100'}`}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200
                             hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-sm"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-bold">
                      {user.profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-gray-700 font-medium max-w-[100px] truncate">
                    {user.profile?.full_name || 'Account'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${userOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                <div className={`absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50
                                 transition-all duration-200 origin-top-right
                                 ${userOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="font-semibold text-sm text-gray-900 truncate">{user.profile?.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  {[
                    { to: '/orders',  icon: ShoppingCart,    label: 'My Orders' },
                    { to: '/profile', icon: User,            label: 'Profile' },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors">
                      <item.icon className="w-4 h-4" /> {item.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 font-semibold transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-gray-100 mt-1">
                    <button onClick={() => { logout(); setUserOpen(false) }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-700 hover:text-primary-600 font-medium px-3 py-1.5 transition-colors underline-grow">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-4 ripple">Register</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(o => !o)}
              className="sm:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Category nav — desktop */}
        <div className="hidden sm:flex items-center gap-1 pb-2 overflow-x-auto">
          {CATEGORIES.map(c => (
            <Link
              key={c.slug}
              to={`/products?category=${c.slug}`}
              className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full transition-all duration-200 font-medium
                ${location.search.includes(c.slug)
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-spring
                         ${menuOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchVal} onChange={e => setSearchVal(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </form>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <Link key={c.slug} to={`/products?category=${c.slug}`}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-full text-gray-700 transition-colors capitalize">
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
