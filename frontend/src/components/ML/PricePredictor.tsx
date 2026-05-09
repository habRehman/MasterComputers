/**
 * PricePredictor.tsx
 * ─────────────────────────────────────────────────────────────────
 * Laptop price prediction form using the CSV-trained Ridge model.
 * Options are fetched live from GET /api/ml/predict-price/options.
 * Prediction is posted to POST /api/ml/predict-price.
 */

import React, { useState, useEffect } from 'react'
import {
  Cpu, HardDrive, Monitor, Layers, Zap,
  TrendingUp, RotateCcw, ChevronDown, Loader2,
  PackageSearch, ShieldCheck,
} from 'lucide-react'
import { api, formatPKR } from '../../utils/api'

// ─── Types ────────────────────────────────────────────────────────
interface Options {
  brand:             string[]
  processor:         string[]
  CPU:               string[]
  Ram:               string[]
  Ram_type:          string[]
  ROM:               string[]
  ROM_type:          string[]
  GPU:               string[]
  display_size:      number[]
  OS:                string[]
}

interface PredictionResult {
  predicted_price:   number
  price_range_low:   number
  price_range_high:  number
  r2:                number
  mae:               number
  specs:             Record<string, unknown>
}

interface FormState {
  brand:             string
  processor:         string
  CPU:               string
  Ram:               string
  Ram_type:          string
  ROM:               string
  ROM_type:          string
  GPU:               string
  display_size:      string
  resolution_width:  string
  resolution_height: string
  OS:                string
  warranty:          string
}

// ─── Default form state ───────────────────────────────────────────
const DEFAULT_FORM: FormState = {
  brand:             'Dell',
  processor:         '11th Gen Intel Core i5',
  CPU:               'Hexa Core, 12 Threads',
  Ram:               '8GB',
  Ram_type:          'DDR4',
  ROM:               '512GB',
  ROM_type:          'SSD',
  GPU:               'Intel Iris Xe Graphics',
  display_size:      '15.6',
  resolution_width:  '1920',
  resolution_height: '1080',
  OS:                'Windows 11 OS',
  warranty:          '1',
}

// ─── Helper: Styled Select ────────────────────────────────────────
interface SelectFieldProps {
  label: string
  icon:  React.ReactNode
  name:  keyof FormState
  value: string
  options: string[]
  onChange: (name: keyof FormState, value: string) => void
}

function SelectField({ label, icon, name, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(name, e.target.value)}
          className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5
                     text-sm text-gray-800 font-medium shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                     hover:border-gray-300 transition-colors pr-8"
        >
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export default function PricePredictor() {
  const [options,    setOptions]    = useState<Options | null>(null)
  const [form,       setForm]       = useState<FormState>(DEFAULT_FORM)
  const [result,     setResult]     = useState<PredictionResult | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [fetching,   setFetching]   = useState(true)
  const [error,      setError]      = useState<string | null>(null)

  // Fetch dropdown options from ML service on mount
  useEffect(() => {
    setFetching(true)
    api.get('/ml/predict-price/options')
      .then(({ data }) => {
        setOptions(data)
        // Seed form with first option from each dropdown
        setForm(prev => ({
          ...prev,
          brand:      data.brand?.[0]      ?? prev.brand,
          processor:  data.processor?.[0]  ?? prev.processor,
          CPU:        data.CPU?.[0]        ?? prev.CPU,
          Ram:        data.Ram?.[0]        ?? prev.Ram,
          Ram_type:   data.Ram_type?.[0]   ?? prev.Ram_type,
          ROM:        data.ROM?.[0]        ?? prev.ROM,
          ROM_type:   data.ROM_type?.[0]   ?? prev.ROM_type,
          GPU:        data.GPU?.[0]        ?? prev.GPU,
          display_size: String(data.display_size?.[0] ?? prev.display_size),
          OS:         data.OS?.[0]         ?? prev.OS,
        }))
      })
      .catch(() => {
        // Use static fallback options if ML service is offline
        setOptions({
          brand:        ['Dell','HP','Asus','Lenovo','MSI','Acer','Samsung'],
          processor:    ['6th Gen Intel Core i5','8th Gen Intel Core i5','10th Gen Intel Core i5',
                         '11th Gen Intel Core i5','12th Gen Intel Core i5','13th Gen Intel Core i5',
                         '6th Gen Intel Core i7','8th Gen Intel Core i7','10th Gen Intel Core i7',
                         '11th Gen Intel Core i7','12th Gen Intel Core i7','13th Gen Intel Core i7'],
          CPU:          ['Quad Core, 8 Threads','Hexa Core, 12 Threads','Octa Core, 16 Threads'],
          Ram:          ['8GB','16GB'],
          Ram_type:     ['DDR4'],
          ROM:          ['256GB','512GB','1024GB'],
          ROM_type:     ['SSD'],
          GPU:          ['Intel HD Graphics','Intel UHD Graphics','Intel Iris Xe Graphics',
                         'NVIDIA GeForce MX110','NVIDIA GeForce GTX 1050'],
          display_size: [14.0, 15.6],
          OS:           ['Windows 10 OS','Windows 11 OS'],
        })
      })
      .finally(() => setFetching(false))
  }, [])

  const handleChange = (name: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }))
    setResult(null)
    setError(null)
  }

  const handlePredict = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload = {
        ...form,
        display_size:       parseFloat(form.display_size),
        resolution_width:   parseInt(form.resolution_width),
        resolution_height:  parseInt(form.resolution_height),
        warranty:           parseInt(form.warranty),
      }
      const { data } = await api.post('/ml/predict-price', payload)
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Prediction failed. Is the ML service running?')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm(DEFAULT_FORM)
    setResult(null)
    setError(null)
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <p className="text-sm font-medium">Loading predictor options…</p>
      </div>
    )
  }

  const resolutionOptions = ['1366x768', '1920x768', '1920x1080']

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-primary-100">
          <TrendingUp className="w-3.5 h-3.5" />
          AI Price Prediction · Ridge Regression
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mt-2">Laptop Price Estimator</h2>
        <p className="text-sm text-gray-500">Select your laptop specifications to get an instant price estimate in PKR</p>
      </div>

      {/* Form Grid */}
      {options && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5">
          {/* Row 1: Brand + OS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Brand"
              icon={<PackageSearch className="w-3.5 h-3.5" />}
              name="brand"
              value={form.brand}
              options={options.brand}
              onChange={handleChange}
            />
            <SelectField
              label="Operating System"
              icon={<Monitor className="w-3.5 h-3.5" />}
              name="OS"
              value={form.OS}
              options={options.OS}
              onChange={handleChange}
            />
          </div>

          {/* Row 2: Processor + CPU Cores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Processor / Generation"
              icon={<Cpu className="w-3.5 h-3.5" />}
              name="processor"
              value={form.processor}
              options={options.processor}
              onChange={handleChange}
            />
            <SelectField
              label="CPU Core Config"
              icon={<Layers className="w-3.5 h-3.5" />}
              name="CPU"
              value={form.CPU}
              options={options.CPU}
              onChange={handleChange}
            />
          </div>

          {/* Row 3: RAM + RAM Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="RAM Size"
              icon={<Zap className="w-3.5 h-3.5" />}
              name="Ram"
              value={form.Ram}
              options={options.Ram}
              onChange={handleChange}
            />
            <SelectField
              label="RAM Type"
              icon={<Zap className="w-3.5 h-3.5" />}
              name="Ram_type"
              value={form.Ram_type}
              options={options.Ram_type}
              onChange={handleChange}
            />
          </div>

          {/* Row 4: Storage + Storage Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Storage (ROM)"
              icon={<HardDrive className="w-3.5 h-3.5" />}
              name="ROM"
              value={form.ROM}
              options={options.ROM}
              onChange={handleChange}
            />
            <SelectField
              label="Storage Type"
              icon={<HardDrive className="w-3.5 h-3.5" />}
              name="ROM_type"
              value={form.ROM_type}
              options={options.ROM_type}
              onChange={handleChange}
            />
          </div>

          {/* Row 5: GPU */}
          <SelectField
            label="GPU / Graphics Card"
            icon={<Monitor className="w-3.5 h-3.5" />}
            name="GPU"
            value={form.GPU}
            options={options.GPU}
            onChange={handleChange}
          />

          {/* Row 6: Display Size + Resolution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" />
                Display Size (inches)
              </label>
              <div className="relative">
                <select
                  value={form.display_size}
                  onChange={e => handleChange('display_size', e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5
                             text-sm text-gray-800 font-medium shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                             hover:border-gray-300 transition-colors pr-8"
                >
                  {options.display_size.map(s => (
                    <option key={s} value={s}>{s}"</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" />
                Resolution
              </label>
              <div className="relative">
                <select
                  value={`${form.resolution_width}x${form.resolution_height}`}
                  onChange={e => {
                    const [w, h] = e.target.value.split('x')
                    handleChange('resolution_width', w)
                    handleChange('resolution_height', h)
                  }}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5
                             text-sm text-gray-800 font-medium shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                             hover:border-gray-300 transition-colors pr-8"
                >
                  {resolutionOptions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 7: Warranty */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Warranty (years)
            </label>
            <div className="relative">
              <select
                value={form.warranty}
                onChange={e => handleChange('warranty', e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5
                           text-sm text-gray-800 font-medium shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                           hover:border-gray-300 transition-colors pr-8 sm:w-48"
              >
                {[1, 2, 3].map(y => (
                  <option key={y} value={y}>{y} year{y > 1 ? 's' : ''}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handlePredict}
          disabled={loading}
          className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Predicting…</>
            : <><TrendingUp className="w-4 h-4" /> Predict Price</>
          }
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          ⚠ {error}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="bg-gradient-to-br from-primary-50 to-cyan-50 border border-primary-200 rounded-2xl p-5 sm:p-6 animate-scale-in shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-bold text-primary-700 uppercase tracking-wide">AI Price Prediction</span>
            <span className="ml-auto text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full font-medium border border-primary-200">
              Ridge Regression
            </span>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-0.5">Estimated Price</p>
            <p className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {formatPKR(result.predicted_price)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Range: <span className="font-semibold text-gray-700">{formatPKR(result.price_range_low)}</span>
              {' '} – {' '}
              <span className="font-semibold text-gray-700">{formatPKR(result.price_range_high)}</span>
            </p>
          </div>

          {/* Model metrics */}
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-2.5 flex flex-col items-center min-w-[90px]">
              <span className="text-xs text-gray-400 font-medium">Model R²</span>
              <span className="text-lg font-bold text-primary-700">{result.r2}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-2.5 flex flex-col items-center min-w-[130px]">
              <span className="text-xs text-gray-400 font-medium">Avg. Error (MAE)</span>
              <span className="text-lg font-bold text-primary-700">
                {result.mae ? formatPKR(Math.round(result.mae)) : '—'}
              </span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-2.5 flex flex-col items-center min-w-[90px]">
              <span className="text-xs text-gray-400 font-medium">Dataset</span>
              <span className="text-lg font-bold text-primary-700">1,700</span>
            </div>
          </div>

          {/* Spec tags */}
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(result.specs).map(([k, v]) =>
              v !== null && v !== undefined && String(v).trim() !== '' ? (
                <span key={k}
                  className="text-xs bg-white px-2.5 py-1 rounded-full border border-gray-200 font-medium text-gray-700 shadow-sm">
                  {String(v)}
                </span>
              ) : null
            )}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-400">
        Predictions are based on 1,700 laptop listings · Pakistani market prices (PKR)
      </p>
    </div>
  )
}
