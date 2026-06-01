'use client'
import { useState } from 'react'

const ROOMS = [
  { name: 'Living Room', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=75&auto=format&fit=crop' },
  { name: 'Bedroom',     img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=75&auto=format&fit=crop' },
  { name: 'Kitchen',     img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=75&auto=format&fit=crop' },
  { name: 'Bathroom',    img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=75&auto=format&fit=crop' },
  { name: 'Home Office', img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=75&auto=format&fit=crop' },
  { name: 'Dining Room', img: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=400&q=75&auto=format&fit=crop' },
]

const STYLES = [
  { name: 'Modern',       img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300&q=75&auto=format&fit=crop',  c: '#4f7cff' },
  { name: 'Luxury',       img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=300&q=75&auto=format&fit=crop',  c: '#f59e0b' },
  { name: 'Minimalist',   img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=300&q=75&auto=format&fit=crop',  c: '#94a3b8' },
  { name: 'Scandinavian', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=75&auto=format&fit=crop',  c: '#22c55e' },
  { name: 'Industrial',   img: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=300&q=75&auto=format&fit=crop',  c: '#f97316' },
  { name: 'Bohemian',     img: 'https://images.unsplash.com/photo-1522444195799-478538b28823?w=300&q=75&auto=format&fit=crop',  c: '#ec4899' },
  { name: 'Japandi',      img: 'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?w=300&q=75&auto=format&fit=crop',  c: '#10b981' },
  { name: 'Classic',      img: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=300&q=75&auto=format&fit=crop',  c: '#d97706' },
]

type DesignResult = {
  image: string
  design: { title?: string; description?: string; colors?: string[]; furniture?: string[]; tips?: string[] }
}

export default function Home() {
  const [room, setRoom]       = useState('Living Room')
  const [style, setStyle]     = useState('Modern')
  const [prompt, setPrompt]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<DesignResult | null>(null)
  const [error, setError]     = useState('')

  async function generate() {
    setError(''); setLoading(true); setResult(null)
    try {
      const fd = new FormData()
      fd.append('style', style); fd.append('roomType', room); fd.append('prompt', prompt)
      const res  = await fetch('/api/generate', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
      setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#fff', color: '#0f172a' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', height: 66, display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 18, boxShadow: '0 4px 12px rgba(79,124,255,0.4)' }}>R</div>
            <span style={{ fontWeight: 900, fontSize: 18, color: '#0f172a', letterSpacing: '-0.3px' }}>RoomGenie <span className="grad">AI</span></span>
          </a>
          <div style={{ display: 'flex', gap: 2, flex: 1 }}>
            {[['Features','#features'],['Styles','#styles'],['Gallery','#gallery'],['Pricing','#pricing']].map(([l,h]) => (
              <a key={l} href={h} className="nav-link">{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <a href="/dashboard" className="nav-link">Dashboard</a>
            <a href="/create" className="btn-primary" style={{ fontSize: 14, padding: '10px 22px' }}>Start for Free</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 66, background: 'linear-gradient(160deg,#f8f9ff 0%,#eef2ff 40%,#fdf4ff 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15%', right: '-5%', width: 600, height: 600, background: 'radial-gradient(circle,rgba(79,124,255,0.1),transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-8%', width: 450, height: 450, background: 'radial-gradient(circle,rgba(124,58,237,0.07),transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 28px 80px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 100, padding: '7px 18px', fontSize: 13, fontWeight: 600, color: '#4f7cff', marginBottom: 28 }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f7cff', display: 'inline-block' }} />
              Powered by Claude AI · Designs in seconds
            </div>
            <h1 style={{ fontSize: 'clamp(38px,5vw,66px)', fontWeight: 900, lineHeight: 1.07, letterSpacing: '-2.5px', marginBottom: 22 }}>
              Design Your<br /><span className="grad-pink">Dream Home</span><br />with AI
            </h1>
            <p style={{ fontSize: 18, color: '#64748b', lineHeight: 1.75, marginBottom: 40, maxWidth: 500 }}>
              Upload your room, pick a style, describe your vision — get a photorealistic AI redesign in seconds. No skills needed.
            </p>
            <div style={{ display: 'flex', gap: 14, marginBottom: 52, flexWrap: 'wrap' }}>
              <a href="#design-tool" className="btn-primary" style={{ fontSize: 16, padding: '15px 36px' }}>✦ Design for Free</a>
              <a href="#gallery" className="btn-secondary" style={{ fontSize: 15, padding: '15px 28px' }}>View Gallery →</a>
            </div>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
              {[['10K+','Rooms Designed'],['8','Design Styles'],['⭐ 4.9','User Rating']].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginTop: 3 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero images */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="gallery-card" style={{ gridRow: 'span 2', borderRadius: 22 }}>
                <img src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=600&q=85&auto=format&fit=crop" alt="Luxury room" style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 380, display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.65),transparent 50%)' }} />
                <div style={{ position: 'absolute', bottom: 18, left: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: 'white', marginBottom: 5, display: 'inline-block' }}>✦ AI</div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: 'white', margin: 0 }}>Luxury Living Room</p>
                </div>
              </div>
              {[
                { img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80&auto=format&fit=crop', label: 'Modern Bedroom' },
                { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80&auto=format&fit=crop', label: 'Minimal Kitchen' },
              ].map(item => (
                <div key={item.label} className="gallery-card" style={{ borderRadius: 18 }}>
                  <img src={item.img} alt={item.label} style={{ width: '100%', height: 178, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.55),transparent 50%)' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'white', margin: 0 }}>{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Floating badge */}
            <div style={{ position: 'absolute', bottom: -18, left: -18, background: 'white', borderRadius: 18, padding: '12px 18px', boxShadow: '0 10px 36px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #f1f5f9' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>Claude AI Design</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Results in ~8 seconds</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DESIGN TOOL */}
      <section id="design-tool" style={{ background: '#f8faff', padding: '96px 28px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">AI Design Tool</div>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,46px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 12 }}>Design Your Room Now</h2>
            <p style={{ fontSize: 17, color: '#64748b', maxWidth: 460, margin: '0 auto' }}>Pick a room, choose a style, describe your vision — Claude AI generates your design instantly</p>
          </div>

          <div style={{ background: 'white', borderRadius: 28, boxShadow: '0 8px 48px rgba(0,0,0,0.08)', border: '1px solid #e8eaf0', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px' }}>

              {/* Left */}
              <div style={{ padding: '40px', borderRight: '1px solid #f1f5f9' }}>
                {/* Step 1 */}
                <div style={{ marginBottom: 36 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>Choose Room Type</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 11 }}>
                    {ROOMS.map(r => (
                      <button key={r.name} onClick={() => setRoom(r.name)} className={`picker-btn${room === r.name ? ' active' : ''}`} style={{ borderColor: room === r.name ? '#4f7cff' : undefined }}>
                        <img src={r.img} alt={r.name} style={{ width: '100%', height: 82, objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: room === r.name ? 'rgba(79,124,255,0.15)' : 'linear-gradient(to top,rgba(0,0,0,0.5),transparent 55%)' }} />
                        {room === r.name && <div style={{ position: 'absolute', top: 7, right: 7, width: 20, height: 20, borderRadius: '50%', background: '#4f7cff', color: 'white', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', padding: '6px 4px 8px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{r.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ marginBottom: 36 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>Select Design Style</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                    {STYLES.map(s => (
                      <button key={s.name} onClick={() => setStyle(s.name)} className={`picker-btn${style === s.name ? ' active' : ''}`} style={{ borderColor: style === s.name ? s.c : undefined, transform: style === s.name ? 'scale(1.04)' : undefined }}>
                        <img src={s.img} alt={s.name} style={{ width: '100%', height: 70, objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: style === s.name ? `${s.c}22` : 'linear-gradient(to top,rgba(0,0,0,0.55),transparent 55%)' }} />
                        {style === s.name && <div style={{ position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: '50%', background: s.c, color: 'white', fontSize: 8, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>}
                        <div style={{ position: 'absolute', bottom: 5, left: 0, right: 0, textAlign: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{s.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3 */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>Describe Your Vision <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>optional</span></span>
                  </div>
                  <textarea className="input-field" value={prompt} onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g. Warm amber lighting, walnut wood floors, large windows, cozy reading nook, lots of plants..."
                    style={{ minHeight: 108 }} />
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>💡 Mention specific furniture, colors, materials, or mood for better results</p>
                </div>
              </div>

              {/* Right — summary */}
              <div style={{ padding: '40px 30px', background: '#fafbff', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Your Design</h3>
                <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', position: 'relative' }}>
                  <img src={STYLES.find(s => s.name === style)?.img} alt={style} style={{ width: '100%', height: 155, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6),transparent 50%)' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: 'white', margin: 0 }}>{style}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{room}</p>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid #e8eaf0' }}>
                  {[{ l: 'Room', v: room }, { l: 'Style', v: style }, { l: 'AI', v: 'Claude + DALL·E 3' }].map(({ l, v }) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8faff', fontSize: 13 }}>
                      <span style={{ color: '#94a3b8' }}>{l}</span>
                      <span style={{ fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>
                {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#dc2626', marginBottom: 14 }}>⚠️ {error}</div>}
                <button onClick={generate} disabled={loading} className="btn-primary"
                  style={{ width: '100%', padding: 16, fontSize: 15, marginTop: 'auto', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading
                    ? <><div className="spin" style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />Generating...</>
                    : '✦ Generate AI Design'
                  }
                </button>
                <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>Claude AI · ~8 seconds · Free</p>
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #f1f5f9' }}>
                  <a href="/create" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: '1px solid #e8eaf0', background: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600, color: '#4f7cff', transition: 'background 0.15s' }}>
                    🔧 Full Studio — upload photo, furniture & more
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESULT */}
      {result && (
        <section id="result" style={{ background: 'white', padding: '80px 28px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '6px 18px', fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 14 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Design Ready
              </div>
              <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-1px' }}>{result.design?.title || `${style} ${room}`}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
              <div>
                <div style={{ borderRadius: 22, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', marginBottom: 18, position: 'relative' }}>
                  <img src={result.image} alt="AI Design" style={{ width: '100%', display: 'block', minHeight: 280, objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.92)', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#4f7cff' }}>✦ Claude AI</div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                  <a href={result.image} target="_blank" rel="noopener" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>⬇ Open Full Image</a>
                  <button onClick={() => { setResult(null); document.getElementById('design-tool')?.scrollIntoView({ behavior: 'smooth' }) }} className="btn-secondary">🔄 New Design</button>
                </div>
                {result.design?.description && (
                  <div style={{ background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 14, padding: 20, marginBottom: 14 }}>
                    <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, margin: 0 }}>{result.design.description}</p>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {result.design?.colors && result.design.colors.length > 0 && (
                    <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 18 }}>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Colors</h4>
                      {result.design.colors.map((c, i) => {
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
                  {result.design?.furniture && result.design.furniture.length > 0 && (
                    <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 18 }}>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Key Pieces</h4>
                      {result.design.furniture.map((f, i) => (
                        <div key={i} style={{ fontSize: 12, color: '#374151', marginBottom: 8, display: 'flex', gap: 7 }}>
                          <span style={{ color: '#4f7cff', fontWeight: 700 }}>→</span>{f}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {result.design?.tips && result.design.tips.length > 0 && (
                  <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 18, marginTop: 12 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Designer Tips</h4>
                    {result.design.tips.map((t, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 10, display: 'flex', gap: 9, lineHeight: 1.65 }}>
                        <span style={{ color: '#16a34a', fontWeight: 800, flexShrink: 0 }}>✓</span>{t}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 16px' }}>Details</h3>
                  {[{ l: 'Style', v: style }, { l: 'Room', v: room }, { l: 'Status', v: '✓ Complete' }].map(({ l, v }) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '9px 0', borderBottom: '1px solid #f8faff' }}>
                      <span style={{ color: '#94a3b8' }}>{l}</span>
                      <span style={{ color: v === '✓ Complete' ? '#16a34a' : '#0f172a', fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <a href="/create" className="btn-primary" style={{ justifyContent: 'center', textAlign: 'center' }}>🔧 Full Studio</a>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 14 }}>
                  <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.7, margin: 0 }}>💡 For even better results, upload your actual room photo in the <a href="/create" style={{ color: '#4f7cff', fontWeight: 700 }}>Full Studio</a>.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section id="features" style={{ background: 'white', padding: '96px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-label">Features</div>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,46px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 12 }}>Everything You Need to Design</h2>
          <p style={{ fontSize: 17, color: '#64748b', maxWidth: 460, margin: '0 auto 56px' }}>Professional AI tools — no experience required.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, textAlign: 'left' }}>
            {[
              { icon: '📸', title: 'Upload Any Room', desc: 'Take a photo of your room and let AI analyze the space, dimensions, and style potential.' },
              { icon: '🎨', title: '8 Design Styles', desc: 'Modern, Luxury, Scandinavian, Japandi, Industrial, Bohemian — each with precision AI prompts.' },
              { icon: '⚡', title: 'Results in 8 Seconds', desc: 'Photorealistic AI-generated designs powered by DALL·E 3 + Claude AI.' },
              { icon: '💬', title: 'AI Design Consultant', desc: 'Chat with Claude AI for expert advice on colors, furniture, layout, and lighting.' },
              { icon: '🛋️', title: 'Furniture Preservation', desc: 'Upload your existing furniture and AI will incorporate it into the new design.' },
              { icon: '📐', title: 'Room Dimensions', desc: 'Enter exact dimensions so AI generates properly scaled, realistic layouts.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div style={{ fontSize: 38, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 9, letterSpacing: '-0.2px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STYLES */}
      <section id="styles" style={{ background: '#f8faff', padding: '96px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-label">Design Styles</div>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,46px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 12 }}>8 Stunning Styles</h2>
          <p style={{ fontSize: 17, color: '#64748b', marginBottom: 48 }}>Click any style to use it in the design tool</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {STYLES.map(s => (
              <div key={s.name} className="gallery-card" onClick={() => { setStyle(s.name); document.getElementById('design-tool')?.scrollIntoView({ behavior: 'smooth' }) }} style={{ aspectRatio: '4/3', borderRadius: 18 }}>
                <img src={s.img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.68),transparent 55%)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.c }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: 'white', margin: 0 }}>{s.name}</p>
                  <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: 'white', fontWeight: 600 }}>Use →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" style={{ background: 'white', padding: '96px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-label">Gallery</div>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,46px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 48 }}>Design Inspiration</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, textAlign: 'left' }}>
            {[
              { img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=900&q=85&auto=format&fit=crop', style: 'Luxury', room: 'Living Room', span: 2 },
              { img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80&auto=format&fit=crop', style: 'Modern', room: 'Bedroom', span: 1 },
              { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80&auto=format&fit=crop', style: 'Minimalist', room: 'Kitchen', span: 1 },
              { img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80&auto=format&fit=crop', style: 'Scandinavian', room: 'Living Room', span: 1 },
              { img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&q=80&auto=format&fit=crop', style: 'Japandi', room: 'Bathroom', span: 1 },
            ].map((g, i) => (
              <div key={i} className="gallery-card" onClick={() => { setStyle(g.style); document.getElementById('design-tool')?.scrollIntoView({ behavior: 'smooth' }) }}
                style={{ gridColumn: g.span === 2 ? 'span 2' : 'span 1', aspectRatio: g.span === 2 ? '16/9' : '4/3', borderRadius: 20 }}>
                <img src={g.img} alt={`${g.style} ${g.room}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.65),transparent 50%)' }} />
                <div style={{ position: 'absolute', bottom: 18, left: 18 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{g.room}</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>{g.style} Style</p>
                </div>
                <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: 'white' }}>Try This →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: '#f8faff', padding: '96px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-label">Pricing</div>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,46px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 12 }}>Simple, Transparent Pricing</h2>
          <p style={{ fontSize: 17, color: '#64748b', marginBottom: 60 }}>Start free. Upgrade when you need more.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, alignItems: 'center' }}>
            {[
              { name: 'Free', price: '$0', features: ['3 AI designs/month','All 8 styles','Color palettes & tips','AI chat (5 msg/day)'], cta: 'Start Free', href: '/create', h: false },
              { name: 'Pro', price: '$19', features: ['Unlimited AI designs','Full Design Studio','Upload room photos','Furniture upload','Unlimited AI consultant','Commercial rights'], cta: 'Start Pro', href: '/create', h: true },
              { name: 'Studio', price: '$49', features: ['Everything in Pro','5 team members','API access','White-label exports','Custom presets','Priority support'], cta: 'Contact Sales', href: '/pricing', h: false },
            ].map(p => (
              <div key={p.name} className={`price-card${p.h ? ' highlight' : ''}`} style={{ position: 'relative', transform: p.h ? 'scale(1.05)' : 'scale(1)' }}>
                {p.h && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 11, fontWeight: 800, padding: '5px 20px', borderRadius: 100, whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
                <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{p.name}</h3>
                <div style={{ marginBottom: 28 }}>
                  <span style={{ fontSize: 50, fontWeight: 900, letterSpacing: '-2px' }}>{p.price}</span>
                  <span style={{ fontSize: 15, color: p.h ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>/mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 11, textAlign: 'left' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: p.h ? 'rgba(255,255,255,0.75)' : '#374151', lineHeight: 1.4 }}>
                      <span style={{ color: p.h ? '#818cf8' : '#16a34a', fontWeight: 800, flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <a href={p.href} className={p.h ? 'btn-primary' : 'btn-secondary'} style={{ display: 'block', textAlign: 'center', padding: 14, borderRadius: 14, fontWeight: 800, fontSize: 15 }}>{p.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', padding: '96px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse,rgba(79,124,255,0.18),transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(30px,5vw,54px)', fontWeight: 900, letterSpacing: '-2px', color: 'white', marginBottom: 16, lineHeight: 1.08 }}>Start Designing Your Dream Space Today</h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', marginBottom: 40, lineHeight: 1.7 }}>Join 10,000+ homeowners and designers using RoomGenie AI.</p>
          <a href="#design-tool" className="btn-primary" style={{ fontSize: 17, padding: '18px 48px' }}>✦ Design for Free</a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 18 }}>Free · No credit card · Powered by Claude AI</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', padding: '52px 28px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 16 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 16 }}>R</div>
                <span style={{ fontWeight: 800, fontSize: 17, color: 'white' }}>RoomGenie AI</span>
              </a>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, maxWidth: 270, marginBottom: 22 }}>AI-powered interior design. Transform any room into your dream space in seconds.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['𝕏','in','ig'].map(s => (
                  <a key={s} href="#" className="social-icon">{s}</a>
                ))}
              </div>
            </div>
            {[
              { title: 'Product',  links: [['AI Design Tool','/create'],['Full Studio','/create'],['Pricing','/pricing'],['Dashboard','/dashboard']] },
              { title: 'Company',  links: [['About','#'],['Blog','#'],['Careers','#'],['Contact','#']] },
              { title: 'Support',  links: [['Help','#'],['Privacy','#'],['Terms','#'],['API','#']] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 18 }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(([label, href]) => (
                    <li key={label}><a href={href} className="footer-link">{label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>© 2026 RoomGenie AI. All rights reserved.</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>Powered by Claude AI & Anthropic</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
