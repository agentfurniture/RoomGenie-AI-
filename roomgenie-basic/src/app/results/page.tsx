'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Design = {
  title?: string; tagline?: string; description?: string
  colors?: string[]; furniture?: string[]; tips?: string[]; materials?: string[]
}

export default function ResultsPage() {
  const [image, setImage]   = useState('')
  const [style, setStyle]   = useState('')
  const [room, setRoom]     = useState('')
  const [design, setDesign] = useState<Design | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const img = sessionStorage.getItem('genImage')
    const s   = sessionStorage.getItem('genStyle')
    const r   = sessionStorage.getItem('genRoom')
    const d   = sessionStorage.getItem('genDesign')
    if (!img) { router.push('/create'); return }
    setImage(img); setStyle(s || 'Modern'); setRoom(r || 'Room')
    if (d) { try { setDesign(JSON.parse(d)) } catch { /* ignore */ } }
  }, [router])

  if (!image) return (
    <div style={{ background: '#f8faff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spin" style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#4f7cff', borderRadius: '50%' }} />
    </div>
  )

  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#f8faff', minHeight: '100vh' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e8eaf0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>R</div>
            <span style={{ fontWeight: 800, fontSize: 17, color: '#0f172a' }}>RoomGenie AI</span>
          </Link>
          <Link href="/create" className="btn-primary" style={{ fontSize: 13, padding: '9px 20px' }}>+ New Design</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 28px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link> ›
          <Link href="/create" style={{ textDecoration: 'none', color: 'inherit' }}>Create</Link> ›
          <span style={{ color: '#64748b' }}>Result</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '6px 18px', fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 14 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> AI Design Complete
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-1px', color: '#0f172a' }}>{design?.title || `${style} ${room}`}</h1>
          {design?.tagline && <p style={{ fontSize: 16, color: '#64748b', marginTop: 6 }}>{design.tagline}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: 26, alignItems: 'start' }}>
          <div>
            <div style={{ borderRadius: 22, overflow: 'hidden', boxShadow: '0 20px 56px rgba(0,0,0,0.12)', marginBottom: 18, position: 'relative' }}>
              <img src={image} alt={`${style} ${room}`} style={{ width: '100%', display: 'block', minHeight: 280, objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.92)', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#4f7cff' }}>✦ Claude AI</div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              <a href={image} target="_blank" rel="noopener" className="btn-primary" style={{ flex: 1, justifyContent: 'center', textAlign: 'center' }}>⬇ Open Full Image</a>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="btn-secondary">
                {copied ? '✓ Copied!' : '🔗 Share'}
              </button>
              <Link href="/create" className="btn-secondary">🔄 New</Link>
            </div>

            {design?.description && (
              <div style={{ background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 14, padding: 22, marginBottom: 16 }}>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, margin: 0 }}>{design.description}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {design?.colors && design.colors.length > 0 && (
                <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 18 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Color Palette</h4>
                  {design.colors.map((c, i) => {
                    const [hex, name] = c.includes(' - ') ? c.split(' - ') : [c, c]
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 7, background: hex.startsWith('#') ? hex : '#e2e8f0', border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#374151' }}>{name}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              {design?.furniture && design.furniture.length > 0 && (
                <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 18 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Key Pieces</h4>
                  {design.furniture.map((f, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#374151', marginBottom: 8, display: 'flex', gap: 7 }}>
                      <span style={{ color: '#4f7cff', fontWeight: 700 }}>→</span>{f}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {design?.tips && design.tips.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 18, marginTop: 14 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Designer Tips</h4>
                {design.tips.map((t, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 10, display: 'flex', gap: 9, lineHeight: 1.65 }}>
                    <span style={{ color: '#16a34a', fontWeight: 800, flexShrink: 0 }}>✓</span>{t}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>Details</h3>
              {[{ l: 'Style', v: style }, { l: 'Room', v: room }, { l: 'AI', v: 'Claude AI' }, { l: 'Status', v: '✓ Complete' }].map(({ l, v }) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '10px 0', borderBottom: '1px solid #f8faff' }}>
                  <span style={{ color: '#94a3b8' }}>{l}</span>
                  <span style={{ color: v === '✓ Complete' ? '#16a34a' : '#0f172a', fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
            <Link href="/create" className="btn-primary" style={{ justifyContent: 'center', textAlign: 'center' }}>✦ New Design</Link>
            {design?.materials && design.materials.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 18 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>Materials</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {design.materials.map((m, i) => (
                    <span key={i} style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#4f7cff' }}>{m}</span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.7, margin: 0 }}>
                💡 <strong>Pro tip:</strong> Upload your actual room photo in the <Link href="/create" style={{ color: '#4f7cff', fontWeight: 700 }}>Full Studio</Link> for more accurate results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
