import React from 'react'
import { Link } from 'react-router-dom'
import { Monitor, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary-600 p-1.5 rounded-lg">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Master Computers</p>
                <p className="text-xs text-gray-500">Pakistan's Tech Store</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Pakistan's trusted destination for laptops, mobiles, components and accessories
              — all with official warranty and best PKR prices.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#"
                   className="w-8 h-8 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Categories</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['💻', 'Laptops',     'laptops'],
                ['📱', 'Mobiles',     'mobiles'],
                ['🖥', 'Monitors',    'monitors'],
                ['⚙️', 'Components',  'components'],
                ['🖱️', 'Accessories', 'accessories'],
                ['💾', 'Storage',     'storage'],
              ].map(([emoji, label, slug]) => (
                <li key={slug as string}>
                  <Link to={`/products?category=${slug}`}
                        className="hover:text-white transition-colors flex items-center gap-1.5">
                    <span>{emoji}</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Customer Care</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Track Order',       '/orders'],
                ['Return Policy',     '#'],
                ['Warranty Claims',   '#'],
                ['Payment Options',   '#'],
                ['Delivery Areas',    '#'],
                ['Bulk / Corporate',  '#'],
              ].map(([label, href]) => (
                <li key={label as string}>
                  <Link to={href as string} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                <span>COMSATS UNIVERSITY ISLAMABAD<br />VEHARI CAMPUS</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <span>0300-6065822</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <span>info@mastercomputers.pk</span>
              </li>
            </ul>

            {/* Payment methods */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">We Accept</p>
              <div className="flex flex-wrap gap-2">
                {['COD', 'Easypaisa', 'JazzCash', 'Bank'].map(m => (
                  <span key={m} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Master Computers. All rights reserved. 🇵🇰</p>
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            AI-Powered · K-Means Recommendations · Linear Regression Price Prediction
          </p>
        </div>
      </div>
    </footer>
  )
}
