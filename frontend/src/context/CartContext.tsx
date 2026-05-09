import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../utils/api'
import { useAuth } from './AuthContext'
import type { CartItem } from '../types'

interface CartContextType {
  items:      CartItem[]
  total:      number
  itemCount:  number
  loading:    boolean
  addItem:    (productId: string, quantity?: number) => Promise<void>
  updateItem: (productId: string, quantity: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  clearCart:  () => Promise<void>
  refresh:    () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user }                    = useAuth()
  const [items, setItems]           = useState<CartItem[]>([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(false)

  const refresh = async () => {
    if (!user) { setItems([]); setTotal(0); return }
    setLoading(true)
    try {
      const { data } = await api.get('/cart')
      setItems(data.items || [])
      setTotal(data.total || 0)
    } finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [user])

  const addItem = async (productId: string, quantity = 1) => {
    await api.post('/cart', { product_id: productId, quantity })
    await refresh()
  }

  // MongoDB cart uses product ObjectId as the key
  const updateItem = async (productId: string, quantity: number) => {
    await api.patch(`/cart/${productId}`, { quantity })
    await refresh()
  }

  const removeItem = async (productId: string) => {
    await api.delete(`/cart/${productId}`)
    await refresh()
  }

  const clearCart = async () => {
    await api.delete('/cart')
    setItems([]); setTotal(0)
  }

  return (
    <CartContext.Provider value={{
      items, total,
      itemCount: items.reduce((s, i) => s + i.quantity, 0),
      loading, addItem, updateItem, removeItem, clearCart, refresh
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
