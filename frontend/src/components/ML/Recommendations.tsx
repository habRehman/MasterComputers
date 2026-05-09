import React, { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { api } from '../../utils/api'
import ProductCard from '../ProductCard/ProductCard'
import type { Product } from '../../types'

interface Props {
  productId?: string
  title?:     string
  type?:      'product' | 'history'
}

export default function Recommendations({ productId, title = 'Recommended For You', type = 'product' }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        if (type === 'product' && productId) {
          const { data } = await api.get(`/ml/recommend?product_id=${productId}&top_n=4`)
          setProducts(data.recommendations || [])
        } else {
          const { data } = await api.post('/ml/recommend/history', {})
          setProducts(data.recommendations || [])
        }
      } catch { setProducts([]) }
      finally  { setLoading(false) }
    }
    fetch()
  }, [productId, type])

  if (loading) return (
    <div className="my-8">
      <div className="skeleton h-6 w-56 mb-4 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-64 rounded-xl" />)}
      </div>
    </div>
  )

  if (!products.length) return null

  return (
    <section className="my-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
          K-Means AI
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(p => (
          <ProductCard key={p._id || (p as any).id} product={p} compact />
        ))}
      </div>
    </section>
  )
}
