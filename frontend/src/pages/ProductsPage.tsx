import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, Search as SearchIcon } from 'lucide-react'
import { api } from '../utils/api'
import ProductCard from '../components/ProductCard/ProductCard'
import type { Product, Category } from '../types'

const BRANDS = ['Dell','HP','Lenovo','ASUS','Apple','Acer','MSI','Samsung','Xiaomi','QMobile','Realme','Tecno','Haier','Audionic']
const PRICE_RANGES = [
  { label: 'Under Rs.30,000',    min: 0,      max: 30000  },
  { label: 'Rs.30,000–60,000',   min: 30000,  max: 60000  },
  { label: 'Rs.60,000–120,000',  min: 60000,  max: 120000 },
  { label: 'Rs.120,000–200,000', min: 120000, max: 200000 },
  { label: 'Above Rs.200,000',   min: 200000, max: 9999999 },
]
const SORT_OPTIONS = [
  { label: 'Newest First',    value: 'newest'    },
  { label: 'Price: Low–High', value: 'price_asc' },
  { label: 'Price: High–Low', value: 'price_desc'},
  { label: 'Featured',        value: 'featured'  },
]

export default function ProductsPage() {
  const [params, setParams]           = useSearchParams()
  const [products, setProducts]       = useState<Product[]>([])
  const [displayed, setDisplayed]     = useState<Product[]>([])
  const [categories, setCategories]   = useState<Category[]>([])
  const [loading,  setLoading]        = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [sort, setSort]               = useState('newest')
  const gridRef                       = useRef<HTMLDivElement>(null)

  const search   = params.get('search')   || ''
  const category = params.get('category') || ''
  const brand    = params.get('brand')    || ''
  const featured = params.get('featured') || ''

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams()
      if (search)   q.set('search', search)
      if (category) q.set('category', category)
      if (brand)    q.set('brand', brand)
      if (featured) q.set('featured', featured)
      q.set('limit', '60')
      const { data } = await api.get(`/products?${q}`)
      setProducts(data.products || [])
    } finally { setLoading(false) }
  }, [search, category, brand, featured])

  useEffect(() => {
    api.get('/products/categories/all').then(r => setCategories(r.data || []))
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Client-side sort
  useEffect(() => {
    const sorted = [...products]
    if (sort === 'price_asc')  sorted.sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') sorted.sort((a, b) => b.price - a.price)
    if (sort === 'featured')   sorted.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
    setDisplayed(sorted)
  }, [products, sort])

  const setFilter = (key: string, value: string) => {
    const p = new URLSearchParams(params)
    if (value) p.set(key, value); else p.delete(key)
    setParams(p)
    // Scroll grid into view on mobile
    setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }
  const clearFilters = () => setParams({})
  const hasFilters   = search || category || brand || featured

  const getCatId = (c: Category) => c._id || (c as any).id || ''

  const Sidebar = () => (
    <aside className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-widest text-gray-500">Category</h3>
        <div className="space-y-0.5">
          <button onClick={() => setFilter('category', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 font-medium
              ${!category ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
            All Categories
          </button>
          {categories.map(c => (
            <button key={getCatId(c)} onClick={() => setFilter('category', c.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center gap-2
                ${category === c.slug ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span>{c.icon}</span> {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-bold mb-3 text-xs uppercase tracking-widest text-gray-500">Brand</h3>
        <div className="flex flex-wrap gap-1.5">
          {BRANDS.map(b => (
            <button key={b} onClick={() => setFilter('brand', brand === b ? '' : b)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-150 active:scale-95
                ${brand === b
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600'}`}>
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Price ranges */}
      <div>
        <h3 className="font-bold mb-3 text-xs uppercase tracking-widest text-gray-500">Price (PKR)</h3>
        <div className="space-y-0.5">
          {PRICE_RANGES.map(r => (
            <button key={r.label}
              onClick={() => {
                const p = new URLSearchParams(params)
                p.set('min_price', r.min.toString())
                p.set('max_price', r.max.toString())
                setParams(p)
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition-colors">
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button onClick={clearFilters}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-red-600 hover:text-red-700 px-3 py-2 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
          <X className="w-3.5 h-3.5" /> Clear All Filters
        </button>
      )}
    </aside>
  )

  const currentCategoryName = categories.find(c => c.slug === category)?.name

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {search ? (
              <span className="flex items-center gap-2">
                <SearchIcon className="w-5 h-5 text-gray-400" />
                Results for "<span className="text-primary-600">{search}</span>"
              </span>
            ) : category ? (
              currentCategoryName || 'Products'
            ) : 'All Products'}
          </h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5 animate-fade-in">
              {displayed.length} product{displayed.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="input-field w-40 text-sm hidden sm:block">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {hasFilters && (
            <button onClick={clearFilters}
              className="hidden sm:flex items-center gap-1 text-sm text-red-600 hover:text-red-700 px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}

          <button onClick={() => setShowFilters(f => !f)}
            className="sm:hidden btn-outline flex items-center gap-2 text-sm ripple">
            <SlidersHorizontal className="w-4 h-4" />
            Filters {hasFilters && <span className="bg-primary-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">!</span>}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar desktop */}
        <div className="hidden sm:block w-56 shrink-0 animate-slide-in-left"><Sidebar /></div>

        {/* Mobile filter drawer */}
        <div className={`fixed inset-0 z-50 transition-all duration-300 sm:hidden ${showFilters ? 'visible' : 'invisible'}`}>
          <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${showFilters ? 'opacity-100' : 'opacity-0'}`}
               onClick={() => setShowFilters(false)} />
          <div className={`absolute right-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto shadow-2xl transition-transform duration-300
                           ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="skeleton h-72 rounded-xl" style={{ animationDelay: `${i * 40}ms` }} />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-20 animate-bounce-in">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try different filters or search terms</p>
              <button onClick={clearFilters} className="btn-primary ripple">Clear All Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {displayed.map((p, i) => (
                <div key={p._id || (p as any).id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
