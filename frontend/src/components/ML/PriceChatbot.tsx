import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, TrendingUp, ChevronDown, Sparkles } from 'lucide-react'
import { api, formatPKR } from '../../utils/api'
import type { ChatMessage } from '../../types'

const SUGGESTIONS = [
  'Price of 16GB RAM laptop?',
  'iPhone kitna hoga?',
  'Gaming laptop 32GB 1TB?',
  'Budget phone 8GB 256GB?',
  'Delivery to Lahore?',
  'Payment options?',
]

export default function PriceChatbot() {
  const [open, setOpen]           = useState(false)
  const [hasNewMsg, setHasNewMsg] = useState(false)
  const [messages, setMessages]   = useState<ChatMessage[]>([{
    id: '0', role: 'bot', timestamp: new Date(),
    text: '👋 Assalam-o-Alaikum! I\'m your Master Computers price assistant.\n\nI can predict prices for laptops and mobiles in **Pakistani Rupees** using AI!\n\nAsk me:\n• "Price of 16GB RAM 1TB laptop?"\n• "iPhone 15 kitna hoga?"\n• "Gaming PC 32GB RAM budget?"'
  }])
  const [input,   setInput]       = useState('')
  const [loading, setLoading]     = useState(false)
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) {
      setHasNewMsg(false)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const { data } = await api.post('/ml/chatbot', { message: text })
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), role: 'bot',
        text: data.response, data: data.data, timestamp: new Date()
      }
      setMessages(m => [...m, botMsg])
      if (!open) setHasNewMsg(true)
    } catch {
      setMessages(m => [...m, {
        id: (Date.now() + 1).toString(), role: 'bot', timestamp: new Date(),
        text: 'Sorry, I\'m having trouble connecting. Please check that the ML service is running.'
      }])
    } finally { setLoading(false) }
  }

  const renderMsg = (msg: ChatMessage) => {
    const isBot = msg.role === 'bot'
    return (
      <div key={msg.id} className={`flex gap-2 chat-bubble-enter ${isBot ? '' : 'flex-row-reverse'}`}>
        {isBot && (
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-md">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}
        <div className={`max-w-[82%] ${isBot ? '' : 'items-end flex flex-col'}`}>
          <div
            className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
              ${isBot
                ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                : 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-sm shadow-md'}`}
            dangerouslySetInnerHTML={{
              __html: msg.text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br/>')
            }}
          />
          {/* Price prediction card */}
          {msg.data?.predicted_price && (
            <div className="mt-2 bg-gradient-to-br from-primary-50 to-cyan-50 border border-primary-200 rounded-xl p-3 w-full animate-scale-in shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-bold text-primary-700 uppercase tracking-wide">AI Prediction</span>
                <span className="ml-auto text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">Linear Regression</span>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{formatPKR(msg.data.predicted_price)}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Range: {formatPKR(msg.data.price_range_low)} – {formatPKR(msg.data.price_range_high)}
              </p>
              {msg.data.parsed && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {msg.data.parsed.ram > 0 && (
                    <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200 font-medium">{msg.data.parsed.ram}GB RAM</span>
                  )}
                  <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200 font-medium capitalize">{msg.data.parsed.device_type}</span>
                  {msg.data.parsed.is_premium && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200 font-medium">Premium</span>
                  )}
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1 px-1">
            {msg.timestamp.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Floating action button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Pulse ring when closed */}
        {!open && <div className="fab-ring" />}

        <button
          onClick={() => setOpen(o => !o)}
          className={`relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full
                      shadow-glow flex items-center justify-center transition-all duration-300
                      hover:scale-110 active:scale-95 ${open ? 'rotate-0' : ''}`}
          aria-label="Open price chatbot"
        >
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${open ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
            <X className="w-6 h-6" />
          </div>
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${open ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}>
            <MessageCircle className="w-6 h-6" />
          </div>

          {/* Unread dot */}
          {!open && hasNewMsg && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dot-pulse" />
          )}
          {!open && !hasNewMsg && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          )}
        </button>
      </div>

      {/* Chat window */}
      <div className={`fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden
                       transition-all duration-300 origin-bottom-right
                       ${open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'}`}
           style={{ height: 520 }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm flex items-center gap-1.5">
              Price Prediction Bot <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" />
            </p>
            <p className="text-primary-200 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full dot-pulse" /> AI powered · Linear Regression
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
          {messages.map(renderMsg)}
          {loading && (
            <div className="flex gap-2 chat-bubble-enter">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                         style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className="px-3 py-2 bg-white border-t border-gray-100 overflow-x-auto shrink-0">
          <div className="flex gap-1.5" style={{ minWidth: 'max-content' }}>
            {SUGGESTIONS.slice(0, 4).map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-xs bg-primary-50 hover:bg-primary-100 text-primary-700
                           px-2.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-150
                           border border-primary-100 hover:border-primary-300 active:scale-95">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={e => { e.preventDefault(); sendMessage(input) }}
              className="flex gap-2 p-3 bg-white border-t border-gray-100 shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask price in PKR..."
            className="flex-1 input-field text-sm"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}
            className="btn-primary px-3 py-2 !rounded-lg ripple">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  )
}
