'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResultsPage() {
  const [image, setImage]   = useState('')
  const [style, setStyle]   = useState('')
  const [room, setRoom]     = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const img = sessionStorage.getItem('genImage')
    const s   = sessionStorage.getItem('genStyle')
    const r   = sessionStorage.getItem('genRoom')
    if (!img) { router.push('/create'); return }
    setImage(img); setStyle(s || 'Modern'); setRoom(r || 'Room')
  }, [router])

  function handleDownload() {
    const a = document.createElement('a')
    a.href = image
    a.download = `roomgenie-${style.toLowerCase()}-${Date.now()}.jpg`
    a.target = '_blank'; a.click()
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (!image) return (
    <main style={{ background: '#06080f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #4f7cff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  const cardStyle = { background: 'linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20 } as React.CSSProperties

  return (
    <main style={{ background: '#06080f', color: 'white', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(6,8,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'white' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#4f7cff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>✦</div>
            <span style={{ fontWeight: 900, fontSize: 17 }}>RoomGenie AI</span>
          </a>
          <a href="/create" style={{ background: 'linear-gradient(135deg,#4f7cff,#8b5cf6)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, padding: '9px 20px', borderRadius: 10 }}>+ New Design</a>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 28px 60px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>
          <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}
            onMouseOver={e => e.currentTarget.style.color = 'white'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>Home</a>
          <span>›</span>
          <a href="/create" style={{ textDecoration: 'none', color: 'inherit' }}
            onMouseOver={e => e.currentTarget.style.color = 'white'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>Create</a>
          <span>›</span>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Result</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
          {/* Image side */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>AI Render Complete</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>✓ HD 1536×1024</span>
            </div>

            {/* Result image */}
            <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ position: 'absolute', inset: -1, background: 'linear-gradient(135deg,rgba(79,124,255,0.35),rgba(139,92,246,0.2))', borderRadius: 22, filter: 'blur(1px)', zIndex: 0 }} />
              <img src={image} alt={`${style} ${room}`} style={{ position: 'relative', zIndex: 1, width: '100%', display: 'block', borderRadius: 22 }} />
              <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 14px', fontSize: 13, fontWeight: 700 }}>
                {style} {room}
              </div>
              <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2, background: 'rgba(79,124,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(79,124,255,0.35)', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#a0b4ff' }}>
                ✦ AI Generated
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <button onClick={handleDownload} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#4f7cff,#8b5cf6)', border: 'none', color: 'white', fontSize: 14, fontWeight: 800, padding: 14, borderRadius: 14, cursor: 'pointer', boxShadow: '0 8px 24px rgba(79,124,255,0.35)', transition: 'transform 0.15s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                ⬇ Download HD
              </button>
              <button onClick={handleCopy} style={{ padding: '14px 20px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: copied ? '#4ade80' : 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                {copied ? '✓ Copied!' : '🔗 Share'}
              </button>
              <a href="/create" style={{ padding: '14px 20px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}>
                🔄 Regenerate
              </a>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ ...cardStyle, padding: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Design Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[{ l: 'Style', v: style }, { l: 'Room Type', v: room }, { l: 'Resolution', v: '1536 × 1024' }, { l: 'Model', v: 'GPT-Image-1' }, { l: 'Quality', v: 'High' }].map(({ l, v }) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...cardStyle, padding: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Try More Styles</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 16, lineHeight: 1.6 }}>See how this room looks in a different style.</p>
              <a href="/create" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', background: 'linear-gradient(135deg,#4f7cff,#8b5cf6)', color: 'white', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 12, boxShadow: '0 4px 18px rgba(79,124,255,0.35)', transition: 'transform 0.15s' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
                ✦ New Generation
              </a>
            </div>

            <div style={{ background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.18)', borderRadius: 16, padding: 18 }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                💡 <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Pro tip:</strong> Add specific furniture names, color codes, or mood keywords in the custom prompt for even more precise results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

