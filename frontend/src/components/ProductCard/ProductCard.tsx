import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Package, Zap } from 'lucide-react'
import { formatPKR, discountPercent } from '../../utils/api'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import type { Product } from '../../types'
import { useNavigate } from 'react-router-dom'

interface Props { product: Product; compact?: boolean }

const PLACEHOLDER: Record<string, string> = {
  laptops:     'https://placehold.co/400x300/1e3a8a/white?text=Laptop',
  mobiles:     'https://placehold.co/400x300/065f46/white?text=Mobile',
  monitors:    'https://placehold.co/400x300/7c3aed/white?text=Monitor',
  components:  'https://placehold.co/400x300/92400e/white?text=Component',
  accessories: 'https://placehold.co/400x300/be123c/white?text=Accessory',
  networking:  'https://placehold.co/400x300/0369a1/white?text=Network',
  storage:     'https://placehold.co/400x300/374151/white?text=Storage',
}

const getCategorySlug = (cat: Product['category']): string => {
  if (!cat || typeof cat === 'string') return 'laptops'
  return (cat as any).slug || 'laptops'
}

export default function ProductCard({ product, compact = false }: Props) {
  const { addItem, items } = useCart()
  const { user }           = useAuth()
  const navigate           = useNavigate()
  const [adding, setAdding] = React.useState(false)
  const [added,  setAdded]  = React.useState(false)

  const productId    = product._id || (product as any).id || ''
  const categorySlug = getCategorySlug(product.category)
  const categoryName = typeof product.category === 'object' ? (product.category as any).name : ''
  const imgSrc       = product.image_url || PLACEHOLDER[categorySlug]
  const discount     = product.original_price ? discountPercent(product.original_price, product.price) : 0
  const inCart       = items.some(i => {
    const p = i.product || (i as any).products
    return (p as any)?._id === productId || (p as any)?.id === productId
  })

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user)  { navigate('/login'); return }
    if (inCart) { navigate('/cart');  return }
    setAdding(true)
    try { await addItem(productId); setAdded(true); setTimeout(() => setAdded(false), 2000) }
    finally { setAdding(false) }
  }

  return (
    <Link to={`/products/${productId}`}
      className="product-card card flex flex-col h-full group bg-white rounded-xl border border-gray-100 overflow-hidden">

      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 img-zoom-container" style={{ height: compact ? 160 : 200 }}>
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          className="product-img w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = imgSrc }}
        />

        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 discount-badge bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            -{discount}%
          </span>
        )}
        {product.is_featured && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Star className="w-3 h-3 fill-current star-pop" /> Hot
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="bg-white text-gray-900 font-bold text-sm px-4 py-2 rounded-lg shadow-lg">Out of Stock</span>
          </div>
        )}

        {/* Quick add overlay */}
        {product.stock > 0 && !compact && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-spring p-2">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-2 rounded-lg
                         flex items-center justify-center gap-1.5 ripple shadow-lg transition-colors">
              {adding
                ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Zap className="w-3.5 h-3.5" />}
              Quick Add
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-0.5">{product.brand}</p>
        {categoryName && !compact && <p className="text-xs text-gray-400 mb-0.5">{categoryName}</p>}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2 flex-1 group-hover:text-primary-700 transition-colors duration-200">
          {product.name}
        </h3>

        {!compact && product.specs && Object.keys(product.specs).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {Object.entries(product.specs).slice(0, 2).map(([k, v]) => (
              <span key={k} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[130px] transition-colors hover:bg-primary-50 hover:text-primary-700">
                {v as string}
              </span>
            ))}
          </div>
        )}

        {/* Price + button */}
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-gray-100">
          <div>
            <p className="text-lg font-bold text-gray-900 leading-tight">{formatPKR(product.price)}</p>
            {product.original_price && (
              <p className="text-xs text-gray-400 line-through leading-tight">{formatPKR(product.original_price)}</p>
            )}
            <span className="pkr-tag mt-0.5 inline-block">PKR</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                        transition-all duration-200 active:scale-95 ripple
              ${added          ? 'bg-green-500 text-white shadow-md'
              : inCart         ? 'bg-green-100 text-green-700 border border-green-300'
              : product.stock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md'}`}>
            {adding
              ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <ShoppingCart className="w-3.5 h-3.5" />}
            {added ? '✓ Added' : inCart ? 'In Cart' : 'Add'}
          </button>
        </div>

        {/* Low stock warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-orange-600 font-medium mt-1.5 flex items-center gap-1 animate-fade-in">
            <Package className="w-3 h-3" /> Only {product.stock} left!
          </p>
        )}
      </div>
    </Link>
  )
}
