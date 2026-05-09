import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Truck, CreditCard, Headphones, TrendingUp, Sparkles, ChevronDown } from 'lucide-react'
import { api } from '../utils/api'
import ProductCard from '../components/ProductCard/ProductCard'
import Recommendations from '../components/ML/Recommendations'
import type { Product } from '../types'

// Simple intersection observer hook for scroll animations
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

const HERO_CATEGORIES = [
  { label: 'Laptops',     slug: 'laptops',     emoji: '💻', color: 'from-blue-600 to-blue-800' },
  { label: 'Mobiles',     slug: 'mobiles',     emoji: '📱', color: 'from-emerald-600 to-emerald-800' },
  { label: 'Monitors',    slug: 'monitors',    emoji: '🖥',  color: 'from-purple-600 to-purple-800' },
  { label: 'Components',  slug: 'components',  emoji: '⚙️', color: 'from-orange-600 to-orange-800' },
  { label: 'Accessories', slug: 'accessories', emoji: '🖱️', color: 'from-red-600 to-red-800' },
  { label: 'Storage',     slug: 'storage',     emoji: '💾', color: 'from-gray-600 to-gray-800' },
]

const FEATURES = [
  { icon: Truck,       title: 'Nationwide Delivery',    desc: 'Karachi, Lahore, Islamabad & 7 more cities' },
  { icon: CreditCard,  title: 'COD & Digital Payments', desc: 'JazzCash, Easypaisa, Bank Transfer' },
  { icon: ShieldCheck, title: 'Genuine Products',       desc: 'Official warranty on all items' },
  { icon: Headphones,  title: '7-Day Returns',          desc: 'Hassle-free return policy' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [heroReady, setHeroReady] = useState(false)

  const featuredSection = useInView()
  const featuresSection = useInView()
  const categoriesSection = useInView()

  useEffect(() => {
    // Small delay so hero animation feels intentional
    const t = setTimeout(() => setHeroReady(true), 100)
    api.get('/products?featured=true&limit=8')
      .then(r => setFeatured(r.data.products || []))
      .finally(() => setLoading(false))
    return () => clearTimeout(t)
  }, [])

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero-gradient text-white relative overflow-hidden min-h-[480px] flex items-center">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20 relative z-10 w-full">
          <div className="max-w-2xl">
            {/* Tags */}
            <div className={`flex flex-wrap items-center gap-2 mb-5 transition-all duration-700 ${heroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="glass text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                🇵🇰 Pakistan's No.1 Tech Store
              </span>
              <span className="glass text-cyan-200 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 animate-spin-slow" /> AI-Powered
              </span>
            </div>

            {/* Headline */}
            <h1 className={`text-4xl lg:text-5xl font-extrabold leading-tight mb-4 transition-all duration-700 delay-100 ${heroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              Master Computers<br />
              <span className="text-gradient">Pakistan's Tech Hub</span>
            </h1>

            <p className={`text-blue-200 text-lg mb-8 leading-relaxed transition-all duration-700 delay-200 ${heroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              Laptops, Mobiles, Components & Accessories — all with official warranty,
              best prices in PKR, and fast delivery across Pakistan.
            </p>

            {/* CTAs */}
            <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-300 ${heroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <Link to="/products"
                className="ripple bg-white text-primary-700 hover:bg-primary-50 font-bold px-6 py-3 rounded-xl
                           flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/products?featured=true"
                className="ripple glass text-white border border-white/30 font-semibold px-6 py-3 rounded-xl
                           flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5">
                <TrendingUp className="w-4 h-4" /> Best Sellers
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 scroll-bounce">
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ── Features strip ───────────────────────────────────── */}
      <div ref={featuresSection.ref} className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 stagger-children">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className={`flex items-center gap-3 py-4 px-4 transition-all duration-500
                  ${featuresSection.inView ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <f.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Categories ──────────────────────────────────────── */}
        <div ref={categoriesSection.ref} className="mb-12">
          <h2 className={`text-2xl font-bold text-gray-900 mb-5 transition-all duration-500 ${categoriesSection.inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            Shop by Category
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {HERO_CATEGORIES.map((c, i) => (
              <Link key={c.slug} to={`/products?category=${c.slug}`}
                className={`category-card bg-gradient-to-br ${c.color} text-white rounded-xl p-4 text-center
                            cursor-pointer shadow-md
                            ${categoriesSection.inView ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className="text-3xl mb-2 animate-float" style={{ animationDelay: `${i * 200}ms` }}>{c.emoji}</div>
                <p className="text-xs font-semibold">{c.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Featured products ────────────────────────────────── */}
        <div ref={featuredSection.ref} className="mb-4">
          <div className={`flex items-center justify-between mb-5 transition-all duration-500 ${featuredSection.inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              ⭐ Featured Products
            </h2>
            <Link to="/products?featured=true"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 underline-grow transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-72 rounded-xl" style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
              {featured.map((p, i) => (
                <div key={p._id || (p as any).id}
                  className={`${featuredSection.inView ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 60}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── AI Recommendations ──────────────────────────────── */}
        <Recommendations type="history" title="Recommended For You" />

        {/* ── Local brands banner ─────────────────────────────── */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 my-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-4xl animate-float">🇵🇰</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Supporting Pakistani Brands</h3>
              <p className="text-gray-600 text-sm mt-1">
                We stock local brands including <strong>QMobile</strong>, <strong>Haier</strong>,
                <strong> Audionic</strong> — supporting Pakistan's tech industry.
              </p>
            </div>
            <Link to="/products?brand=QMobile" className="btn-primary whitespace-nowrap ripple">
              Explore Local Brands
            </Link>
          </div>
        </div>

        {/* ── ML promo banner ──────────────────────────────────── */}
        <div className="hero-gradient text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-900/30 pointer-events-none" />
          <div className="text-4xl animate-float relative z-10">🤖</div>
          <div className="flex-1 relative z-10">
            <h3 className="font-bold text-lg">AI Price Prediction</h3>
            <p className="text-blue-200 text-sm mt-1">
              Not sure how much to budget? Our Linear Regression AI predicts prices based on current
              Pakistani market data. Try the chatbot in the corner!
            </p>
          </div>
          <div className="glass px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm relative z-10">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span className="font-bold text-white">96.2%</span>
            <span className="text-blue-300 text-xs">accuracy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
