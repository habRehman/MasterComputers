import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface Props {
  children:  React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (adminOnly && user.profile?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center text-2xl">
          !
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin access required</h1>
        <p className="text-gray-600 mb-6">
          You are logged in as {user.email}, but this account is not an admin account.
          Please logout and sign in with the seeded admin account.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link to="/login" className="btn-primary">Go to Login</Link>
          <Link to="/" className="btn-outline">Go Home</Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">Admin: admin@mastercomputers.pk / admin123</p>
      </div>
    )
  }

  return <>{children}</>
}