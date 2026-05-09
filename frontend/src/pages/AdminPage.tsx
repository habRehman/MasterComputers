import React, { useEffect, useState, useRef } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart2, Package, ShoppingBag, Users, Plus, Edit2, Trash2,
  CheckCircle, X, Upload, Eye, TrendingUp, DollarSign,
  RefreshCw, Search, ChevronDown, AlertTriangle, Tag,
  PieChart as PieChartIcon, MapPin, Cpu, HardDrive, Zap, Activity
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { api, formatPKR, ORDER_STATUS_COLOR, CITIES } from '../utils/api'
import type { Product, Order, Category } from '../types'

const oid   = (o: any) => typeof o === 'string' ? o : (o?._id || o?.id || '')
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#84cc16','#f97316','#ec4899','#14b8a6']

// ── Stat Card ────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <div className="card p-5 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
          <p className="text-2xl font-extrabold text-gray-900">{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-${color}-50`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
      </div>
    </div>
  )
}

// ── Mini Chart Card ───────────────────────────────────────────────
function ChartCard({ title, icon: Icon, children, className = '' }: any) {
  return (
    <div className={`card p-5 ${className}`}>
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
        <Icon className="w-4 h-4 text-primary-600" /> {title}
      </h3>
      {children}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// DASHBOARD HOME
// ══════════════════════════════════════════════════════════════════
function DashboardHome() {
  const [stats,    setStats]    = useState<any>(null)
  const [orders,   setOrders]   = useState<Order[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    setError('')
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/orders'),
    ]).then(([s, o]) => {
      setStats(s.data)
      setOrders((o.data || []).slice(0, 6))
    }).catch((e) => {
      setError(e.response?.data?.error || e.message || 'Could not load admin dashboard')
    }).finally(() => setLoading(false))
  }, [])

  const ordersByStatus = ['pending','confirmed','processing','shipped','delivered','cancelled']
    .map(s => ({ name: s, count: orders.filter(o => o.status === s).length }))
    .filter(x => x.count > 0)

  if (error) {
    return (
      <div className="card p-6 border-red-200 bg-red-50 text-red-700 animate-fade-in">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-red-800 mb-1">Admin dashboard failed to load</h2>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={stats?.total_products} icon={Package}     color="blue"   sub="Active listings" />
        <StatCard label="Total Orders"   value={stats?.total_orders}   icon={ShoppingBag} color="green"  sub="All time" />
        <StatCard label="Customers"      value={stats?.total_users}    icon={Users}       color="purple" sub="Registered users" />
        <StatCard label="Revenue (PKR)"  value={stats?.total_revenue != null ? formatPKR(stats.total_revenue) : '—'} icon={DollarSign} color="orange" sub="Excluding cancelled" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary-600" /> Recent Orders
            </h2>
            <Link to="orders" className="text-xs text-primary-600 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3,4].map(i=><div key={i} className="skeleton h-12 rounded-lg"/>)}</div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map(o => (
                <div key={oid(o)} className="flex items-center justify-between py-2.5 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                  <div>
                    <p className="font-mono text-xs text-gray-500">#{oid(o).slice(0,8).toUpperCase()}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {o.user && typeof o.user === 'object' ? ((o.user as any).full_name || 'Customer') : 'Customer'} · {o.shipping_city}
                    </p>
                    <p className="text-xs text-gray-400">{o.items?.length || 0} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">{formatPKR(o.total_amount)}</p>
                    <span className={`${ORDER_STATUS_COLOR[o.status]} text-xs`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick link to Customer Analytics */}
        <div className="card p-5 flex flex-col justify-between bg-gradient-to-br from-primary-50 to-cyan-50 border-primary-100">
          <div>
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
              <Activity className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="font-bold text-gray-900 mb-1">Customer Analytics</h2>
            <p className="text-xs text-gray-500 mb-4">
              Explore 1,500 customer profiles — gender, city, brand preferences, buying power, usage type and more.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {['Gender','City','Brand','Generation','RAM','Storage','Usage','Buying Power'].map(tag => (
                <span key={tag} className="text-xs bg-white border border-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
              ))}
            </div>
          </div>
          <Link to="analytics"
            className="btn-primary text-sm flex items-center justify-center gap-2 ripple">
            <PieChartIcon className="w-4 h-4" /> View Analytics
          </Link>
        </div>
      </div>

      {/* Orders by status bar chart */}
      {ordersByStatus.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-600" /> Orders by Status
          </h2>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={ordersByStatus} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// CUSTOMER ANALYTICS — charts from adata.csv
// ══════════════════════════════════════════════════════════════════

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color ?? p.fill }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

const PIE_TOOLTIP = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  const total = payload[0].payload?.total
  const pct = total ? ((value / total) * 100).toFixed(1) : null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700">{name}</p>
      <p className="text-gray-500">{value} customers{pct ? ` (${pct}%)` : ''}</p>
    </div>
  )
}

function CustomerAnalytics() {
  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.get('/admin/customer-analytics')
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
    </div>
  )

  if (error) return (
    <div className="card p-6 border-red-200 bg-red-50 text-red-700">
      <AlertTriangle className="w-5 h-5 mb-2" />
      <p className="font-bold">Failed to load analytics</p>
      <p className="text-sm mt-1">{error}</p>
    </div>
  )

  // Attach total to each row for pie tooltip percentage
  const withTotal = (arr: any[]) => arr.map(d => ({ ...d, total: data.total }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer Analytics</h2>
          <p className="text-sm text-gray-500">{data.total.toLocaleString()} customer profiles · Pakistani market</p>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {[
            { label: 'Male',   value: data.gender.find((g:any)=>g.name==='Male')?.value   ?? 0, color: 'bg-blue-100 text-blue-700' },
            { label: 'Female', value: data.gender.find((g:any)=>g.name==='Female')?.value ?? 0, color: 'bg-pink-100 text-pink-700' },
          ].map(g => (
            <span key={g.label} className={`text-xs px-3 py-1.5 rounded-full font-semibold ${g.color}`}>
              {g.label}: {g.value}
            </span>
          ))}
        </div>
      </div>

      {/* Row 1: Gender (pie) + Buying Power (pie) + Usage Type (pie) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ChartCard title="Gender Distribution" icon={Users}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={withTotal(data.gender)} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={70} innerRadius={35}
                paddingAngle={3} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                labelLine={false} fontSize={11}>
                {data.gender.map((_:any, i:number) => <Cell key={i} fill={['#3b82f6','#ec4899'][i % 2]} />)}
              </Pie>
              <Tooltip content={<PIE_TOOLTIP />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Buying Power" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={withTotal(data.buying_power)} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={70} innerRadius={35}
                paddingAngle={3} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                labelLine={false} fontSize={11}>
                {data.buying_power.map((_:any, i:number) => <Cell key={i} fill={['#10b981','#f59e0b','#ef4444'][i % 3]} />)}
              </Pie>
              <Tooltip content={<PIE_TOOLTIP />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Usage Type" icon={Activity}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={withTotal(data.usage_type)} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={70} innerRadius={35}
                paddingAngle={3} label={({name,percent})=>`${(percent*100).toFixed(0)}%`}
                labelLine={false} fontSize={10}>
                {data.usage_type.map((_:any, i:number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<PIE_TOOLTIP />} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: City (bar) + Brand (bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Customers by City" icon={MapPin}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.city} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} width={80} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="value" name="Customers" radius={[0,4,4,0]}>
                {data.city.map((_:any, i:number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Customers by Brand" icon={Package}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.brand} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} width={55} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="value" name="Customers" radius={[0,4,4,0]}>
                {data.brand.map((_:any, i:number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Generation + Age Group */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Processor Generation Preference" icon={Cpu}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.generation} margin={{ top: 0, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false}
                angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="value" name="Customers" radius={[4,4,0,0]}>
                {data.generation.map((_:any, i:number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Age Group Distribution" icon={Users}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.age_group} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="value" name="Customers" fill="#8b5cf6" radius={[4,4,0,0]}>
                {data.age_group.map((_:any, i:number) => <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 4: RAM Type (pie) + RAM Size (bar) + Storage (bar) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ChartCard title="RAM Type" icon={Zap}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={withTotal(data.ram_type)} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={70} innerRadius={35}
                paddingAngle={4}
                label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                labelLine={false} fontSize={11}>
                {data.ram_type.map((_:any, i:number) => <Cell key={i} fill={['#3b82f6','#10b981'][i % 2]} />)}
              </Pie>
              <Tooltip content={<PIE_TOOLTIP />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="RAM Size" icon={Zap}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.ram_size} margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="value" name="Customers" radius={[4,4,0,0]}>
                {data.ram_size.map((_:any, i:number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Storage Preference" icon={HardDrive}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.storage} margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="value" name="Customers" radius={[4,4,0,0]}>
                {data.storage.map((_:any, i:number) => <Cell key={i} fill={COLORS[(i+2) % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <p className="text-center text-xs text-gray-400 pb-2">
        Based on 1,500 customer records · Pakistani market data
      </p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// PRODUCTS MANAGEMENT — full CRUD with category, specs, images
// ══════════════════════════════════════════════════════════════════
const EMPTY_PRODUCT = {
  name: '', description: '', price: '', original_price: '',
  brand: '', model: '', stock: '', image_url: '',
  category: '', is_featured: false, is_active: true,
  specs: {} as Record<string, string>
}

function AdminProducts() {
  const [products,    setProducts]    = useState<Product[]>([])
  const [categories,  setCategories]  = useState<Category[]>([])
  const [loading,     setLoading]     = useState(true)
  const [showModal,   setShowModal]   = useState(false)
  const [editing,     setEditing]     = useState<any>(EMPTY_PRODUCT)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [search,      setSearch]      = useState('')
  const [filterCat,   setFilterCat]   = useState('')
  const [specKey,     setSpecKey]     = useState('')
  const [specVal,     setSpecVal]     = useState('')
  const [deleteId,    setDeleteId]    = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=100'),
      api.get('/products/categories/all')
    ]).then(([p, c]) => {
      setProducts(p.data.products || [])
      setCategories(c.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const openAdd = () => {
    setEditing(EMPTY_PRODUCT)
    setError('')
    setShowModal(true)
  }

  const openEdit = (p: Product) => {
    setEditing({
      ...p,
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : '',
      stock: String(p.stock),
      category: oid(p.category) || (p.category as any)?._id || p.category || '',
      specs: p.specs ? (p.specs instanceof Map ? Object.fromEntries(p.specs) : p.specs) : {}
    })
    setError('')
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditing(EMPTY_PRODUCT); setError('') }

  const addSpec = () => {
    if (!specKey.trim() || !specVal.trim()) return
    setEditing((p: any) => ({ ...p, specs: { ...p.specs, [specKey.trim()]: specVal.trim() } }))
    setSpecKey(''); setSpecVal('')
  }

  const removeSpec = (key: string) => {
    setEditing((p: any) => { const s = { ...p.specs }; delete s[key]; return { ...p, specs: s } })
  }

  const save = async () => {
    if (!editing.name || !editing.price || !editing.brand || !editing.category) {
      setError('Name, price, brand and category are required.'); return
    }
    setSaving(true); setError('')
    try {
      const payload = {
        ...editing,
        price:          Number(editing.price),
        original_price: editing.original_price ? Number(editing.original_price) : null,
        stock:          Number(editing.stock) || 0,
      }
      if (oid(editing)) {
        const { data } = await api.patch(`/admin/products/${oid(editing)}`, payload)
        setProducts(ps => ps.map(p => oid(p) === oid(data) ? data : p))
      } else {
        const { data } = await api.post('/admin/products', payload)
        setProducts(ps => [data, ...ps])
      }
      closeModal()
    } catch (e: any) {
      setError(e.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  const deleteProduct = async (id: string) => {
    await api.delete(`/admin/products/${id}`)
    setProducts(ps => ps.filter(p => oid(p) !== id))
    setDeleteId(null)
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setEditing((p: any) => ({ ...p, [field]: e.target.value }))

  // Filtered list
  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
    const matchCat    = !filterCat || oid(p.category) === filterCat || (p.category as any)?._id === filterCat
    return matchSearch && matchCat
  })

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">{products.length} total · {filtered.length} shown</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 ripple">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search name or brand..." className="input-field pl-9 text-sm" />
        </div>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="input-field w-48 text-sm">
          <option value="">All Categories</option>
          {categories.map(c => <option key={oid(c)} value={oid(c)}>{c.icon} {c.name}</option>)}
        </select>
        {(search || filterCat) && (
          <button onClick={() => { setSearch(''); setFilterCat('') }}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 px-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i=><div key={i} className="skeleton h-14 rounded-lg"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No products found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Product','Category','Brand','Price (PKR)','Stock','Featured','Status','Actions'].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => {
                  const catName = typeof p.category === 'object' ? (p.category as any).name : (categories.find(c => oid(c) === p.category)?.name || '—')
                  return (
                    <tr key={oid(p)} className="hover:bg-gray-50 transition-colors table-row-hover">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <img src={p.image_url || `https://placehold.co/40x40/e5e7eb/9ca3af?text=${p.brand?.[0]||'P'}`}
                              alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[180px]">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.model || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{catName}</td>
                      <td className="px-4 py-3">
                        <span className="badge-blue">{p.brand}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">{formatPKR(p.price)}</td>
                      <td className="px-4 py-3">
                        <span className={p.stock === 0 ? 'badge-red' : p.stock <= 5 ? 'badge-yellow' : 'badge-green'}>
                          {p.stock === 0 ? 'Out of stock' : `${p.stock} units`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{p.is_featured ? '⭐' : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={p.is_active ? 'badge-green' : 'badge-gray'}>
                          {p.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(p)}
                            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <Link to={`/products/${oid(p)}`} target="_blank"
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="View on site">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button onClick={() => setDeleteId(oid(p))}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-bold text-lg text-center text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This will hide the product from the store. This action can be reversed by editing the product.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteProduct(deleteId)} className="flex-1 btn-danger ripple">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4 shadow-2xl animate-scale-in">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="font-bold text-lg text-gray-900">
                {oid(editing) ? '✏️ Edit Product' : '➕ Add New Product'}
              </h3>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[75vh] space-y-5">
              {/* Basic info */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
                    <input value={editing.name} onChange={f('name')} className="input-field" placeholder="e.g. Dell Inspiron 15 3520" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Brand *</label>
                    <input value={editing.brand} onChange={f('brand')} className="input-field" placeholder="e.g. Dell" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Model</label>
                    <input value={editing.model} onChange={f('model')} className="input-field" placeholder="e.g. Inspiron 3520" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                    <select value={editing.category} onChange={f('category')} className="input-field">
                      <option value="">— Select a category —</option>
                      {categories.map(c => (
                        <option key={oid(c)} value={oid(c)}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea value={editing.description} onChange={f('description')} rows={2}
                      className="input-field resize-none" placeholder="Brief product description..." />
                  </div>
                </div>
              </div>

              {/* Pricing & stock */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Pricing & Stock (PKR)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (PKR) *</label>
                    <input type="number" value={editing.price} onChange={f('price')} className="input-field" placeholder="145000" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Original Price <span className="text-gray-400 font-normal">(for discount)</span></label>
                    <input type="number" value={editing.original_price} onChange={f('original_price')} className="input-field" placeholder="155000" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Qty *</label>
                    <input type="number" value={editing.stock} onChange={f('stock')} className="input-field" placeholder="20" min="0" />
                  </div>
                </div>
              </div>

              {/* Image */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Product Image</h4>
                <div className="flex gap-3 items-start">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                    <input value={editing.image_url} onChange={f('image_url')} className="input-field text-sm"
                      placeholder="https://images.unsplash.com/..." />
                    <p className="text-xs text-gray-400 mt-1">Paste an Unsplash or direct image URL</p>
                  </div>
                  {editing.image_url && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      <img src={editing.image_url} alt="Preview" className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/e5e7eb/9ca3af?text=Error' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Specs */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Specifications <span className="text-gray-400 font-normal normal-case">(key → value pairs)</span>
                </h4>

                {/* Existing specs */}
                {Object.keys(editing.specs || {}).length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1.5">
                    {Object.entries(editing.specs || {}).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase w-24 shrink-0">{k}</span>
                        <span className="text-xs text-gray-700 flex-1 truncate">{v as string}</span>
                        <button onClick={() => removeSpec(k)} className="text-red-400 hover:text-red-600 shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add spec */}
                <div className="flex gap-2">
                  <input value={specKey} onChange={e=>setSpecKey(e.target.value)}
                    className="input-field text-sm flex-1" placeholder="Key (e.g. Processor)" />
                  <input value={specVal} onChange={e=>setSpecVal(e.target.value)}
                    className="input-field text-sm flex-1" placeholder="Value (e.g. Intel i5-1235U)"
                    onKeyDown={e => e.key === 'Enter' && addSpec()} />
                  <button onClick={addSpec} className="btn-primary px-3 py-2 text-sm ripple !rounded-lg flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Press Enter or click Add after each spec</p>
              </div>

              {/* Flags */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Display Options</h4>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.is_featured}
                      onChange={e => setEditing((p:any) => ({...p, is_featured: e.target.checked}))}
                      className="w-4 h-4 accent-primary-600 rounded" />
                    <span className="text-sm font-medium">⭐ Featured product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.is_active}
                      onChange={e => setEditing((p:any) => ({...p, is_active: e.target.checked}))}
                      className="w-4 h-4 accent-primary-600 rounded" />
                    <span className="text-sm font-medium">✅ Active (visible on site)</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 p-5 border-t border-gray-200">
              <button onClick={save} disabled={saving}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 ripple">
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Saving...</>
                  : <><CheckCircle className="w-4 h-4"/> {oid(editing) ? 'Save Changes' : 'Add Product'}</>}
              </button>
              <button onClick={closeModal} className="btn-outline px-6">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// ORDERS MANAGEMENT
// ══════════════════════════════════════════════════════════════════
function AdminOrders() {
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const STATUSES = ['','pending','confirmed','processing','shipped','delivered','cancelled']

  const load = async () => {
    setLoading(true)
    const q = new URLSearchParams()
    if (filter)     q.set('status', filter)
    if (cityFilter) q.set('city',   cityFilter)
    api.get(`/admin/orders${q.toString() ? '?'+q : ''}`).then(r => setOrders(r.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter, cityFilter])

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/admin/orders/${id}`, { status })
    setOrders(os => os.map(o => oid(o) === id ? {...o, status: status as any} : o))
  }

  const ADMIN_CITIES = ['', ...CITIES]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500">{orders.length} shown</p>
        </div>
        <button onClick={load} className="btn-outline flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={filter} onChange={e => { setFilter(e.target.value); setLoading(true) }} className="input-field w-44 text-sm">
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="input-field w-40 text-sm">
          {ADMIN_CITIES.map(c => <option key={c} value={c}>{c || 'All Cities'}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton h-24 rounded-xl"/>)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const userInfo = o.user && typeof o.user === 'object' ? o.user as any : null
            const isOpen   = expanded === oid(o)
            return (
              <div key={oid(o)} className="card overflow-hidden">
                <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                     onClick={() => setExpanded(isOpen ? null : oid(o))}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs text-gray-400">#{oid(o).slice(0,8).toUpperCase()}</span>
                        <span className={`${ORDER_STATUS_COLOR[o.status]} text-xs flex items-center gap-1`}>{o.status}</span>
                        <span className="text-xs text-gray-400">{new Date(o.createdAt || (o as any).created_at).toLocaleDateString('en-PK')}</span>
                      </div>
                      {userInfo && (
                        <p className="font-semibold text-sm text-gray-900">{userInfo.full_name} · {userInfo.phone}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">{o.shipping_city} · {o.items?.length || 0} items</p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                      <p className="font-bold text-gray-900">{formatPKR(o.total_amount)}</p>
                      <select value={o.status}
                        onChange={e => { e.stopPropagation(); updateStatus(oid(o), e.target.value) }}
                        onClick={e => e.stopPropagation()}
                        className="input-field text-xs w-36 py-1">
                        {STATUSES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Expanded order items */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 animate-fade-in">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Order Items</p>
                    <div className="space-y-2">
                      {o.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-gray-100">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <img src={item.image_url || `https://placehold.co/40x40/e5e7eb/9ca3af?text=${item.brand?.[0]||'P'}`}
                              alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.brand} · Qty: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-sm text-gray-900 shrink-0">{formatPKR(item.unit_price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-0.5">Delivery</p>
                        <p className="text-gray-900 font-medium">{o.shipping_city}</p>
                        <p className="text-gray-500 text-xs">{o.shipping_address}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-0.5">Payment</p>
                        <p className="text-gray-900 font-medium capitalize">{o.payment_method?.replace('_',' ')}</p>
                        {o.notes && <p className="text-gray-400 text-xs">Note: {o.notes}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// ADMIN LAYOUT  (sidebar nav + routes)
// ══════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const navLinks = [
    { to: '/admin',            label: 'Dashboard', icon: BarChart2   },
    { to: '/admin/analytics',  label: 'Analytics', icon: PieChartIcon },
    { to: '/admin/products',   label: 'Products',  icon: Package     },
    { to: '/admin/orders',     label: 'Orders',    icon: ShoppingBag },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-glow">
          <BarChart2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-xs text-gray-500">Master Computers Management</p>
        </div>
        <Link to="/" className="ml-auto text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1 transition-colors">
          <Eye className="w-3.5 h-3.5" /> View Site
        </Link>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit animate-fade-in-up-1">
        {navLinks.map(l => (
          <Link key={l.to} to={l.to}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${location.pathname === l.to
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'}`}>
            <l.icon className="w-4 h-4" /> {l.label}
          </Link>
        ))}
      </div>

      {/* Content */}
      <Routes>
        <Route index           element={<DashboardHome />} />
        <Route path="analytics" element={<CustomerAnalytics />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders"   element={<AdminOrders />} />
      </Routes>
    </div>
  )
}
