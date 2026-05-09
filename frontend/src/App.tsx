import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }      from './context/AuthContext'
import { CartProvider }      from './context/CartContext'
import Navbar                from './components/Navbar/Navbar'
import Footer                from './components/UI/Footer'
import ProtectedRoute        from './components/UI/ProtectedRoute'
import PriceChatbot          from './components/ML/PriceChatbot'
import PricePredictor        from './components/ML/PricePredictor'

import HomePage              from './pages/HomePage'
import ProductsPage          from './pages/ProductsPage'
import ProductDetailPage     from './pages/ProductDetailPage'
import CartPage              from './pages/CartPage'
import CheckoutPage          from './pages/CheckoutPage'
import OrdersPage            from './pages/OrdersPage'
import ProfilePage           from './pages/ProfilePage'
import AdminPage             from './pages/AdminPage'
import { LoginPage, RegisterPage } from './pages/AuthPages'

class AdminErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800">
            <h1 className="text-xl font-bold mb-2">Admin panel crashed</h1>
            <p className="text-sm mb-4">The admin panel hit a runtime error instead of rendering a blank page.</p>
            <pre className="text-xs whitespace-pre-wrap bg-white border border-red-100 rounded-xl p-3 overflow-auto">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <PriceChatbot />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Auth pages - no navbar/footer */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Main layout */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/products"     element={<Layout><ProductsPage /></Layout>} />
            <Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />
            <Route path="/cart"         element={<Layout><CartPage /></Layout>} />

            <Route path="/checkout" element={
              <Layout>
                <ProtectedRoute><CheckoutPage /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/orders" element={
              <Layout>
                <ProtectedRoute><OrdersPage /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/orders/:id" element={
              <Layout>
                <ProtectedRoute><OrdersPage /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/profile" element={
              <Layout>
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
              </Layout>
            } />

            {/* Admin - nested routes */}
            <Route path="/admin/*" element={
              <Layout>
                <ProtectedRoute adminOnly>
                  <AdminErrorBoundary><AdminPage /></AdminErrorBoundary>
                </ProtectedRoute>
              </Layout>
            } />

            {/* ML Price Predictor */}
            <Route path="/price-predictor" element={<Layout><PricePredictor /></Layout>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}