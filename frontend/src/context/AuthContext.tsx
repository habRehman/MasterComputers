import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../utils/api'
import type { User } from '../types'

interface AuthContextType {
  user:          User | null
  loading:       boolean
  login:         (email: string, password: string) => Promise<void>
  register:      (data: RegisterData) => Promise<void>
  logout:        () => void
  updateProfile: (data: Partial<User['profile']>) => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  full_name: string
  phone: string
  city: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount: restore session from stored token
  useEffect(() => {
    const token = localStorage.getItem('mc_token')
    if (!token) { setLoading(false); return }

    api.get('/auth/profile')
      .then(res => {
        const u = res.data
        setUser({
          id:      u._id,
          email:   u.email,
          profile: {
            id:        u._id,
            full_name: u.full_name,
            phone:     u.phone  || '',
            city:      u.city   || '',
            address:   u.address || '',
            role:      u.role,
          }
        })
      })
      .catch(() => localStorage.removeItem('mc_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('mc_token', data.token)
    const u = data.user
    setUser({
      id:    u._id,
      email: u.email,
      profile: {
        id:        u._id,
        full_name: u.full_name,
        phone:     u.phone    || '',
        city:      u.city     || '',
        address:   u.address  || '',
        role:      u.role,
      }
    })
  }

  const register = async (formData: RegisterData) => {
    const { data } = await api.post('/auth/register', formData)
    // Auto-login after register
    localStorage.setItem('mc_token', data.token)
    const u = data.user
    setUser({
      id:    u._id,
      email: u.email,
      profile: {
        id:        u._id,
        full_name: u.full_name,
        phone:     u.phone   || '',
        city:      u.city    || '',
        address:   u.address || '',
        role:      u.role,
      }
    })
  }

  const logout = () => {
    localStorage.removeItem('mc_token')
    setUser(null)
  }

  const updateProfile = async (profileData: Partial<User['profile']>) => {
    const { data } = await api.patch('/auth/profile', profileData)
    setUser(u => u ? {
      ...u,
      profile: {
        id:        data._id,
        full_name: data.full_name,
        phone:     data.phone    || '',
        city:      data.city     || '',
        address:   data.address  || '',
        role:      data.role,
      }
    } : null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
