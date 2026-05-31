'use client'
import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user' | 'assistant'; text: string }

const SUGGESTIONS = [
  'What colors work for a small living room?',
  'How do I make my bedroom feel luxurious?',
  'Best lighting for a home office?',
  'How to mix modern and rustic styles?',
]

export default function AIChat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', text: "Hi! I'm your AI interior design consultant powered by Claude. I can help with color palettes, furniture layout, lighting, and style advice. What would you like to design today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function send(text?: string) {
    const msg = text || input
    if (!msg.trim() || loading) return
    setInput('')
    setLoading(true)
    setMsgs(m => [...m, { role: 'user', text: msg }])
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg }) })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'assistant', text: data.reply || 'Sorry, something went wrong.' }])
    } catch {
      setMsgs(m => [...m, { role: 'assistant', text: 'Connection error. Please try again.' }])
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderRadius: 20, border: '1px solid #e8eaf0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8faff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>AI Design Consultant</p>
          <p style={{ fontSize: 12, color: '#16a34a', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            Powered by Claude AI
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, marginTop: 2 }}>🤖</div>
            )}
            <div style={{
              maxWidth: '78%', borderRadius: 16, padding: '11px 15px', fontSize: 14, lineHeight: 1.7,
              background: m.role === 'user' ? 'linear-gradient(135deg,#4f7cff,#7c3aed)' : '#f8faff',
              color: m.role === 'user' ? 'white' : '#374151',
              border: m.role === 'assistant' ? '1px solid #e8eaf0' : 'none',
              borderTopLeftRadius: m.role === 'assistant' ? 4 : 16,
              borderTopRightRadius: m.role === 'user' ? 4 : 16,
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</div>
            <div style={{ background: '#f8faff', border: '1px solid #e8eaf0', borderRadius: 16, borderTopLeftRadius: 4, padding: '13px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#94a3b8', animation: `bounce 1s ${i * 0.15}s ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {msgs.length === 1 && (
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#f0f4ff', border: '1px solid #c7d2fe', color: '#4f7cff', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'}
              onMouseOut={e => e.currentTarget.style.background = '#f0f4ff'}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', gap: 8, background: '#f8faff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 6, transition: 'border-color 0.2s' }}
          onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = '#4f7cff'}
          onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Ask about colors, furniture, lighting..."
            style={{ flex: 1, background: 'none', border: 'none', color: '#0f172a', fontSize: 14, padding: '6px 10px', outline: 'none', fontFamily: 'inherit' }} />
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{ width: 36, height: 36, borderRadius: 10, background: input.trim() ? 'linear-gradient(135deg,#4f7cff,#7c3aed)' : '#e2e8f0', border: 'none', color: 'white', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, transition: 'all 0.2s' }}>→</button>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </div>
  )
}

