import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Package, Shield, Truck, CheckCircle, Share2, Heart } from 'lucide-react'
import { api, formatPKR, discountPercent } from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Recommendations from '../components/ML/Recommendations'
import type { Product } from '../types'
import { useNavigate } from 'react-router-dom'

export default function ProductDetailPage() {
  const { id }                = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty]         = useState(1)
  const [adding, setAdding]   = useState(false)
  const [added,  setAdded]    = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [imgLoaded, setImgLoaded]   = useState(false)
  const { addItem, items }    = useCart()
  const { user }              = useAuth()
  const navigate              = useNavigate()

  useEffect(() => {
    if (!id) return
    setImgLoaded(false)
    api.get(`/products/${id}`)
      .then(r => {
        setProduct(r.data)
        api.post(`/products/${id}/view`).catch(() => {})
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="skeleton h-96 rounded-2xl" />
      <div className="space-y-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className={`skeleton rounded-lg`} style={{ height: `${28 + (i % 3) * 12}px`, width: `${60 + (i * 10) % 40}%`, animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
    </div>
  )

  if (!product) return null

  const productId    = product._id || (product as any).id || ''
  const inCart       = items.some(i => {
    const p = i.product || (i as any).products
    return (p as any)?._id === productId || (p as any)?.id === productId
  })
  const discount     = product.original_price ? discountPercent(product.original_price, product.price) : 0
  const categoryName = typeof product.category === 'object' ? (product.category as any).name : ''
  const categorySlug = typeof product.category === 'object' ? (product.category as any).slug : ''
  const imgSrc       = product.image_url || `https://placehold.co/600x450/1e3a8a/white?text=${encodeURIComponent(product.brand)}`

  const handleAddToCart = async () => {
    if (!user)  { navigate('/login'); return }
    if (inCart) { navigate('/cart');  return }
    setAdding(true)
    try { await addItem(productId, qty); setAdded(true) }
    finally { setAdding(false) }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 animate-fade-in-up">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
        {categoryName && (
          <>
            <span>/</span>
            <Link to={`/products?category=${categorySlug}`} className="hover:text-primary-600 transition-colors">{categoryName}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Image */}
        <div className="animate-fade-in-up">
          <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-[4/3] img-zoom-container">
            <img
              src={imgSrc}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              onLoad={() => setImgLoaded(true)}
            />
            {!imgLoaded && <div className="absolute inset-0 skeleton" />}

            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg discount-badge">
                -{discount}% OFF
              </span>
            )}
            {product.is_featured && (
              <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Action buttons under image */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => { setWishlisted(w => !w) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 active:scale-95
                ${wishlisted ? 'bg-red-50 border-red-300 text-red-600' : 'border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'}`}>
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
              {wishlisted ? 'Wishlisted' : 'Wishlist'}
            </button>
            <button
              onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600 text-sm font-medium transition-all duration-200 active:scale-95">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5 animate-fade-in-up-1">
          {/* Brand + badges */}
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className="text-xs text-primary-600 font-bold uppercase tracking-wider">{product.brand}</span>
              {categoryName && <span className="badge-blue">{categoryName}</span>}
              {product.is_featured && <span className="badge-yellow">⭐ Featured</span>}
              {product.stock === 0 && <span className="badge-red">Out of Stock</span>}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">{product.name}</h1>
            {product.model && <p className="text-sm text-gray-500 mt-1">Model: {product.model}</p>}
          </div>

          {/* Price block */}
          <div className="bg-gradient-to-r from-gray-50 to-primary-50/30 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-extrabold text-gray-900">{formatPKR(product.price)}</span>
              <span className="pkr-tag mb-1">PKR</span>
            </div>
            {product.original_price && (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gray-400 line-through text-sm">{formatPKR(product.original_price)}</span>
                <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-0.5 rounded-full">
                  Save {formatPKR(product.original_price - product.price)}
                </span>
              </div>
            )}
          </div>

          {/* Specs */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                Specifications
                <div className="h-px flex-1 bg-gray-200" />
              </h3>
              <div className="grid grid-cols-1 gap-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                {Object.entries(product.specs).map(([k, v], i) => (
                  <div key={k} className={`flex items-start gap-3 px-4 py-2.5 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-28 shrink-0 mt-0.5">
                      {k.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-gray-900 font-medium">{v as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qty + stock */}
          <div className="flex items-center gap-4 flex-wrap">
            {product.stock > 0 ? (
              <>
                <div className="flex items-center gap-1.5 text-green-700 text-sm font-semibold bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                  <CheckCircle className="w-4 h-4" /> In Stock ({product.stock})
                </div>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold transition-colors active:scale-90">
                    −
                  </button>
                  <span className="w-10 text-center font-bold text-sm border-x-2 border-gray-200 py-1.5">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold transition-colors active:scale-90">
                    +
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-red-600 text-sm font-semibold bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                <Package className="w-4 h-4" /> Out of Stock
              </div>
            )}
          </div>

          {/* Add to cart button */}
          <button onClick={handleAddToCart} disabled={adding || product.stock === 0}
            className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-base
                        transition-all duration-200 active:scale-[0.98] ripple shadow-sm
              ${added          ? 'bg-green-500 text-white shadow-md'
              : inCart         ? 'bg-green-100 text-green-700 border-2 border-green-300'
              : product.stock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'btn-primary hover:shadow-glow'}`}>
            {adding
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <ShoppingCart className="w-5 h-5" />}
            {added ? '✓ Added to Cart!' : inCart ? 'View Cart' : `Add to Cart — ${formatPKR(product.price * qty)}`}
          </button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Shield, text: 'Official Warranty', sub: 'Pakistani market' },
              { icon: Truck,  text: 'Fast Delivery',     sub: '2–5 business days' },
              { icon: Package,text: '7-Day Returns',     sub: 'Unused items only' },
            ].map(b => (
              <div key={b.text} className="flex flex-col items-center gap-1 text-center p-2 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                  <b.icon className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-xs font-semibold text-gray-800">{b.text}</span>
                <span className="text-xs text-gray-400">{b.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="card p-6 mb-8 animate-fade-in-up">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            About this Product
            <div className="h-px flex-1 bg-gray-200" />
          </h2>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* AI Recommendations */}
      <Recommendations productId={productId} title="Similar Products You May Like" type="product" />
    </div>
  )
}
