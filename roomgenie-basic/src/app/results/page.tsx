'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Design = {
  title: string
  tagline: string
  description: string
  colors: string[]
  furniture: string[]
  tips: string[]
  materials: string[]
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

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (!image) return (
    <main style={{ background: '#f8faff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTop: '3px solid #4f7cff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  const card = { background: 'white', border: '1px solid #e8eaf0', borderRadius: 18 } as React.CSSProperties

  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#f8faff', minHeight: '100vh' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e8eaf0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>R</div>
            <span style={{ fontWeight: 800, fontSize: 17, color: '#0f172a' }}>RoomGenie AI</span>
          </Link>
          <Link href="/create" style={{ background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, padding: '9px 20px', borderRadius: 10 }}>+ New Design</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 28px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
          <span>›</span>
          <Link href="/create" style={{ textDecoration: 'none', color: 'inherit' }}>Create</Link>
          <span>›</span>
          <span style={{ color: '#64748b' }}>Result</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '6px 18px', fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> AI Design Complete
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', marginBottom: 6 }}>
            {design?.title || `${style} ${room}`}
          </h1>
          {design?.tagline && <p style={{ fontSize: 16, color: '#64748b' }}>{design.tagline}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }}>
          <div>
            <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.12)', marginBottom: 20 }}>
              <div style={{ position: 'absolute', inset: -2, background: 'linear-gradient(135deg,rgba(79,124,255,0.25),rgba(124,58,237,0.15))', borderRadius: 24, filter: 'blur(2px)', zIndex: 0 }} />
              <img src={image} alt={`${style} ${room}`} style={{ position: 'relative', zIndex: 1, width: '100%', display: 'block', borderRadius: 22, minHeight: 300, objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: 10, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                {style} · {room}
              </div>
              <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2, background: 'rgba(79,124,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(79,124,255,0.25)', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#4f7cff' }}>
                ✦ Claude AI
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <a href={image} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', border: 'none', color: 'white', fontSize: 14, fontWeight: 800, padding: 14, borderRadius: 14, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(79,124,255,0.3)' }}>⬇ Open Full Image</a>
              <button onClick={handleCopy} style={{ padding: '14px 20px', borderRadius: 14, border: '1px solid #e2e8f0', background: 'white', color: copied ? '#16a34a' : '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                {copied ? '✓ Copied!' : '🔗 Share'}
              </button>
              <Link href="/create" style={{ padding: '14px 20px', borderRadius: 14, border: '1px solid #e2e8f0', background: 'white', color: '#374151', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                🔄 Redesign
              </Link>
            </div>

            {design?.description && (
              <div style={{ background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 16, padding: 24, marginBottom: 16 }}>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, margin: 0 }}>{design.description}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {design?.colors && design.colors.length > 0 && (
                <div style={{ ...card, padding: 20 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Color Palette</h4>
                  {design.colors.map((c, i) => {
                    const [hex, name] = c.includes(' - ') ? c.split(' - ') : [c, c]
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: hex.startsWith('#') ? hex : '#e2e8f0', border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{name}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              {design?.furniture && design.furniture.length > 0 && (
                <div style={{ ...card, padding: 20 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Key Pieces</h4>
                  {design.furniture.map((f, i) => (
                    <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 9, display: 'flex', gap: 8 }}>
                      <span style={{ color: '#4f7cff', fontWeight: 700 }}>→</span>{f}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {design?.tips && design.tips.length > 0 && (
              <div style={{ ...card, padding: 20, marginTop: 14 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Designer Tips</h4>
                {design.tips.map((t, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 12, display: 'flex', gap: 10, lineHeight: 1.7 }}>
                    <span style={{ color: '#16a34a', fontWeight: 800, flexShrink: 0 }}>✓</span>{t}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ ...card, padding: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>Details</h3>
              {[{ l: 'Style', v: style }, { l: 'Room', v: room }, { l: 'AI Model', v: 'Claude AI' }, { l: 'Status', v: '✓ Complete' }].map(({ l, v }) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '10px 0', borderBottom: '1px solid #f8faff' }}>
                  <span style={{ color: '#94a3b8' }}>{l}</span>
                  <span style={{ color: v === '✓ Complete' ? '#16a34a' : '#0f172a', fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>

            <Link href="/create" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', padding: 14, borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center', boxShadow: '0 4px 16px rgba(79,124,255,0.3)' }}>
              ✦ New Design
            </Link>

            {design?.materials && design.materials.length > 0 && (
              <div style={{ ...card, padding: 18 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Materials</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {design.materials.map((m, i) => (
                    <span key={i} style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#4f7cff' }}>{m}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: 16 }}>
              <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.7, margin: 0 }}>
                💡 <strong>Pro tip:</strong> Try the full Design Studio at <Link href="/create" style={{ color: '#4f7cff', fontWeight: 700 }}>/create</Link> to upload your room photo and furniture for more accurate results.
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>
    </div>
  )
}
