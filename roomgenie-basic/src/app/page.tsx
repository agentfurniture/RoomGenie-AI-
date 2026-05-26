'use client'
import { useState } from 'react'

const ROOMS = [
  { name: 'Living Room', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80&auto=format&fit=crop' },
  { name: 'Bedroom',     img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&auto=format&fit=crop' },
  { name: 'Kitchen',     img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&auto=format&fit=crop' },
  { name: 'Bathroom',    img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80&auto=format&fit=crop' },
  { name: 'Home Office', img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80&auto=format&fit=crop' },
  { name: 'Dining Room', img: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=600&q=80&auto=format&fit=crop' },
]

const STYLES = [
  { name: 'Modern',      img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=80&auto=format&fit=crop', color: '#4f7cff' },
  { name: 'Luxury',      img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&q=80&auto=format&fit=crop', color: '#f59e0b' },
  { name: 'Minimalist',  img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&q=80&auto=format&fit=crop', color: '#94a3b8' },
  { name: 'Scandinavian',img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80&auto=format&fit=crop', color: '#22c55e' },
  { name: 'Industrial',  img: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=400&q=80&auto=format&fit=crop', color: '#f97316' },
  { name: 'Bohemian',    img: 'https://images.unsplash.com/photo-1522444195799-478538b28823?w=400&q=80&auto=format&fit=crop', color: '#ec4899' },
  { name: 'Classic',     img: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=400&q=80&auto=format&fit=crop', color: '#d97706' },
  { name: 'Japanese',    img: 'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?w=400&q=80&auto=format&fit=crop', color: '#10b981' },
]

const GALLERY = [
  { img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=800&q=80&auto=format&fit=crop', style: 'Luxury', room: 'Living Room' },
  { img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80&auto=format&fit=crop', style: 'Modern', room: 'Bedroom' },
  { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop', style: 'Minimalist', room: 'Kitchen' },
  { img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80&auto=format&fit=crop', style: 'Scandinavian', room: 'Bathroom' },
  { img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80&auto=format&fit=crop', style: 'Industrial', room: 'Office' },
  { img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop', style: 'Bohemian', room: 'Living Room' },
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeRoom, setActiveRoom] = useState('Living Room')
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('Modern')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{ image: string; design: { title: string; description: string; colors: string[]; furniture: string[]; tips: string[] } } | null>(null)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setError(''); setGenerating(true); setResult(null)
    try {
      const fd = new FormData()
      fd.append('style', selectedStyle)
      fd.append('roomType', activeRoom)
      fd.append('prompt', prompt)
      const res = await fetch('/api/generate', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch { setError('Something went wrong. Please try again.') }
    finally { setGenerating(false) }
  }

  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#fff', color: '#1a1a2e', overflowX: 'hidden' }}>

      {/* ═══ NAV ═══ */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e8eaf0', boxShadow: '0 1px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 40 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 900 }}>R</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#1a1a2e', letterSpacing: '-0.3px' }}>RoomGenie</span>
            <span style={{ fontWeight: 800, fontSize: 18, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span>
          </a>

          <div style={{ display: 'flex', gap: 4, flex: 1 }} className="hidden md:flex">
            {[['Design Tool', '#design-tool'], ['Styles', '#styles'], ['Gallery', '#gallery'], ['Pricing', '#pricing']].map(([l, h]) => (
              <a key={l} href={h} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#5a6478', textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#f0f4ff'; e.currentTarget.style.color = '#4f7cff' }}
                onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#5a6478' }}>{l}</a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 'auto' }}>
            <button style={{ background: 'none', border: '1px solid #e2e8f0', color: '#5a6478', fontSize: 14, fontWeight: 600, padding: '8px 18px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#4f7cff'; e.currentTarget.style.color = '#4f7cff' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#5a6478' }}>Log in</button>
            <a href="#design-tool" style={{ background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 14, fontWeight: 700, padding: '9px 22px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 14px rgba(79,124,255,0.35)', transition: 'all 0.15s', display: 'inline-block' }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(79,124,255,0.45)' }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(79,124,255,0.35)' }}>
              Start for Free
            </a>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ paddingTop: 64, background: 'linear-gradient(160deg,#f8f9ff 0%,#eef2ff 40%,#fdf4ff 100%)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle,rgba(79,124,255,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, background: 'radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 100, padding: '6px 16px', fontSize: 13, fontWeight: 600, color: '#4f7cff', marginBottom: 24 }}>
              <span>✦</span> AI-Powered Interior Design
            </div>
            <h1 style={{ fontSize: 'clamp(36px,4.5vw,60px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', color: '#0f172a', marginBottom: 20 }}>
              Design Your Dream<br />
              <span style={{ background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Home with AI</span>
            </h1>
            <p style={{ fontSize: 18, color: '#64748b', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              Describe your dream room. Pick a style. Get a professional AI-generated interior design in seconds — powered by Claude AI.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}>
              <a href="#design-tool" style={{ background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 16, fontWeight: 700, padding: '14px 32px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 8px 24px rgba(79,124,255,0.35)', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 30px rgba(79,124,255,0.45)' }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(79,124,255,0.35)' }}>
                ✦ Design for Free
              </a>
              <a href="#gallery" style={{ background: 'white', color: '#1a1a2e', fontSize: 16, fontWeight: 600, padding: '14px 28px', borderRadius: 12, textDecoration: 'none', border: '1px solid #e2e8f0', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4f7cff'; (e.currentTarget as HTMLElement).style.color = '#4f7cff' }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#1a1a2e' }}>
                View Gallery →
              </a>
            </div>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {[['10K+', 'Designs Created'], ['8', 'Design Styles'], ['⭐ 4.9', 'User Rating']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>{v}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image grid */}
          <div style={{ position: 'relative', paddingBottom: 40 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=600&q=80&auto=format&fit=crop', label: 'Luxury Living Room', tall: true },
                { img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&auto=format&fit=crop', label: 'Modern Bedroom', tall: false },
                { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&auto=format&fit=crop', label: 'Minimal Kitchen', tall: false },
              ].map((item, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', gridRow: i === 0 ? 'span 2' : 'span 1', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', transition: 'transform 0.25s', cursor: 'pointer' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}>
                  <img src={item.img} alt={item.label} style={{ width: '100%', height: i === 0 ? '100%' : 180, objectFit: 'cover', display: 'block', minHeight: i === 0 ? 380 : 'auto' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 50%)' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{item.label}</span>
                  </div>
                  <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700, color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>✦ AI</div>
                </div>
              ))}
            </div>
            {/* Floating badge */}
            <div style={{ position: 'absolute', bottom: 0, left: -20, background: 'white', borderRadius: 16, padding: '12px 18px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Claude AI Design</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Generating in seconds</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DESIGN TOOL ═══ */}
      <section id="design-tool" style={{ background: '#f8faff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: '#4f7cff', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>AI Design Tool</div>
            <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#0f172a', marginBottom: 12 }}>Design Your Room Now</h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 500, margin: '0 auto' }}>Pick a room, choose a style, describe your vision — Claude AI generates your design instantly</p>
          </div>

          <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 4px 40px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e8eaf0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px' }}>

              {/* Left panel */}
              <div style={{ padding: 36, borderRight: '1px solid #f1f5f9' }}>
                {/* Step 1 - Room */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Choose Room Type</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                    {ROOMS.map(r => (
                      <button key={r.name} onClick={() => setActiveRoom(r.name)} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `2px solid ${activeRoom === r.name ? '#4f7cff' : '#e2e8f0'}`, padding: 0, cursor: 'pointer', background: 'none', transition: 'all 0.2s', boxShadow: activeRoom === r.name ? '0 0 0 3px rgba(79,124,255,0.15)' : 'none' }}>
                        <img src={r.img} alt={r.name} style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: activeRoom === r.name ? 'rgba(79,124,255,0.2)' : 'linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 60%)' }} />
                        {activeRoom === r.name && <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: '#4f7cff', color: 'white', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>}
                        <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{r.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2 - Style */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Select Design Style</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                    {STYLES.map(s => (
                      <button key={s.name} onClick={() => setSelectedStyle(s.name)} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: `2px solid ${selectedStyle === s.name ? s.color : '#e2e8f0'}`, padding: 0, cursor: 'pointer', background: 'none', transition: 'all 0.2s', transform: selectedStyle === s.name ? 'scale(1.03)' : 'scale(1)', boxShadow: selectedStyle === s.name ? `0 0 0 3px ${s.color}30` : 'none' }}>
                        <img src={s.img} alt={s.name} style={{ width: '100%', height: 64, objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: selectedStyle === s.name ? `${s.color}30` : 'linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 60%)' }} />
                        {selectedStyle === s.name && <div style={{ position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: s.color, color: 'white', fontSize: 8, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>}
                        <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{s.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3 - Prompt */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Describe Your Vision</span>
                    <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                  </div>
                  <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g. Warm lighting, oak wood furniture, large windows with city view, cozy reading nook in corner..."
                    style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', fontSize: 14, color: '#0f172a', lineHeight: 1.7, minHeight: 100, resize: 'none', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s', background: '#fafbff' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#4f7cff'}
                    onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'} />
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>💡 Tip: Be specific about colors, materials, and lighting for best results</p>
                </div>
              </div>

              {/* Right panel - summary + generate */}
              <div style={{ padding: 32, background: '#fafbff', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Design Preview</h3>

                {/* Selected style preview */}
                <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 20, position: 'relative', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                  <img src={STYLES.find(s => s.name === selectedStyle)?.img} alt={selectedStyle} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 50%)' }} />
                  <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>{selectedStyle} {activeRoom}</p>
                  </div>
                </div>

                {/* Summary */}
                <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #e8eaf0' }}>
                  {[{ l: 'Room', v: activeRoom }, { l: 'Style', v: selectedStyle }, { l: 'AI Model', v: 'Claude AI' }].map(({ l, v }) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#94a3b8' }}>{l}</span>
                      <span style={{ color: '#0f172a', fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>

                {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 14 }}>⚠️ {error}</div>}

                <button onClick={handleGenerate} disabled={generating} style={{
                  width: '100%', padding: '16px', borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: generating ? 'not-allowed' : 'pointer', border: 'none',
                  background: generating ? '#94a3b8' : 'linear-gradient(135deg,#4f7cff,#7c3aed)',
                  color: 'white', boxShadow: generating ? 'none' : '0 8px 24px rgba(79,124,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.2s', marginTop: 'auto',
                }}
                  onMouseOver={e => { if (!generating) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(79,124,255,0.45)' } }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = generating ? 'none' : '0 8px 24px rgba(79,124,255,0.35)' }}>
                  {generating ? (
                    <><div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Generating Design...</>
                  ) : (
                    <>✦ Generate AI Design</>
                  )}
                </button>
                <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>Free · Powered by Claude AI · Takes ~5 seconds</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RESULT SECTION ═══ */}
      {result && (
        <section id="result-section" style={{ background: 'white', padding: '80px 24px', borderTop: '1px solid #e8eaf0' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '6px 18px', fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 16 }}>
                <span>✓</span> AI Design Complete
              </div>
              <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', color: '#0f172a' }}>{result.design?.title || `${selectedStyle} ${activeRoom}`}</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
              <div>
                {/* Result image */}
                <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', position: 'relative', marginBottom: 20 }}>
                  <img src={result.image} alt="AI Design" style={{ width: '100%', display: 'block', minHeight: 300, objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#4f7cff', border: '1px solid rgba(79,124,255,0.2)' }}>✦ Claude AI Design</div>
                </div>

                {/* Description */}
                {result.design?.description && (
                  <div style={{ background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 16, padding: 22, marginBottom: 16 }}>
                    <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>{result.design.description}</p>
                  </div>
                )}

                {/* Colors + Furniture grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  {result.design?.colors?.length > 0 && (
                    <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 20 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Color Palette</h4>
                      {result.design.colors.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 6, background: c, border: '1px solid #e8eaf0', flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: '#374151' }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.design?.furniture?.length > 0 && (
                    <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 20 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Key Furniture</h4>
                      {result.design.furniture.map((f, i) => (
                        <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: '#4f7cff', fontWeight: 700 }}>→</span>{f}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tips */}
                {result.design?.tips?.length > 0 && (
                  <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 20 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Designer Tips</h4>
                    {result.design.tips.map((t, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.7 }}>
                        <span style={{ color: '#16a34a', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</span>{t}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 22 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Design Details</h3>
                  {[{ l: 'Style', v: selectedStyle }, { l: 'Room', v: activeRoom }, { l: 'AI Model', v: 'Claude AI' }, { l: 'Status', v: '✓ Complete' }].map(({ l, v }) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#94a3b8' }}>{l}</span>
                      <span style={{ color: l === 'Status' ? '#16a34a' : '#0f172a', fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <a href={result.image} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', padding: '14px', borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 16px rgba(79,124,255,0.3)', transition: 'all 0.2s' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
                  ⬇ Save Design Image
                </a>

                <button onClick={() => { setResult(null); document.getElementById('design-tool')?.scrollIntoView({ behavior: 'smooth' }) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'white', color: '#374151', padding: '14px', borderRadius: 14, fontWeight: 700, fontSize: 14, border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#4f7cff'; e.currentTarget.style.color = '#4f7cff' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151' }}>
                  🔄 Generate Another Design
                </button>

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: 16 }}>
                  <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.7 }}>
                    💡 <strong>Pro tip:</strong> Try describing specific materials like &quot;marble countertops&quot; or &quot;walnut wood floors&quot; for more precise results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ STYLES SECTION ═══ */}
      <section id="styles" style={{ background: '#f8faff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: '#4f7cff', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>Design Styles</div>
            <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#0f172a' }}>8 Stunning Styles</h2>
            <p style={{ fontSize: 16, color: '#64748b', marginTop: 12 }}>Click any style to use it in the design tool above</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {STYLES.map(s => (
              <div key={s.name} onClick={() => { setSelectedStyle(s.name); document.getElementById('design-tool')?.scrollIntoView({ behavior: 'smooth' }) }} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3', cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = `0 16px 40px rgba(0,0,0,0.15)` }}
                onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' }}>
                <img src={s.img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 55%)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.color }} />
                <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>{s.name}</p>
                </div>
                <div style={{ position: 'absolute', bottom: 14, right: 14, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: 'white', fontWeight: 600 }}>Use Style →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GALLERY ═══ */}
      <section id="gallery" style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: '#4f7cff', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>Inspiration Gallery</div>
            <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#0f172a' }}>Design Ideas for Every Room</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {GALLERY.map((g, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', aspectRatio: i === 0 ? '16/10' : '4/3', gridColumn: i === 0 ? 'span 2' : 'span 1' }}
                onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'scale(1.02)'; el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.15)' }}
                onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'scale(1)'; el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' }}
                onClick={() => { setSelectedStyle(g.style); setActiveRoom(g.room); document.getElementById('design-tool')?.scrollIntoView({ behavior: 'smooth' }) }}>
                <img src={g.img} alt={`${g.style} ${g.room}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%)' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{g.room}</div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>{g.style} Style</p>
                </div>
                <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: 'white' }}>Try This Style →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" style={{ background: '#f8faff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: '#4f7cff', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#0f172a' }}>Simple Pricing</h2>
            <p style={{ fontSize: 16, color: '#64748b', marginTop: 12 }}>Start free. Upgrade when you need more.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, alignItems: 'center', maxWidth: 900, margin: '0 auto' }}>
            {[
              { name: 'Free', price: '$0', period: '/mo', features: ['3 AI designs/month', 'All 8 styles', 'Design descriptions', 'Color palettes', 'Designer tips'], cta: 'Start Free', highlight: false },
              { name: 'Pro', price: '$19', period: '/mo', features: ['Unlimited designs', 'All 8 styles', 'HD image quality', 'AI chat consultant', 'Priority support', 'Commercial rights'], cta: 'Start Pro', highlight: true },
              { name: 'Studio', price: '$49', period: '/mo', features: ['Everything in Pro', '5 team members', 'API access', 'White-label', 'Custom styles', 'Priority support'], cta: 'Contact Us', highlight: false },
            ].map(p => (
              <div key={p.name} style={{ borderRadius: 20, padding: '32px 28px', background: p.highlight ? 'linear-gradient(145deg,#1a1a2e,#16213e)' : 'white', border: p.highlight ? 'none' : '1px solid #e8eaf0', color: p.highlight ? 'white' : '#0f172a', transform: p.highlight ? 'scale(1.04)' : 'scale(1)', boxShadow: p.highlight ? '0 20px 60px rgba(79,124,255,0.25)' : '0 4px 20px rgba(0,0,0,0.06)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {p.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 11, fontWeight: 800, padding: '4px 16px', borderRadius: 100, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
                <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{p.name}</h3>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-2px' }}>{p.price}</span>
                  <span style={{ fontSize: 15, color: p.highlight ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>{p.period}</span>
                </div>
                <ul style={{ listStyle: 'none', marginBottom: 28, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: p.highlight ? 'rgba(255,255,255,0.75)' : '#374151' }}>
                      <span style={{ color: p.highlight ? '#4f7cff' : '#16a34a', fontWeight: 800, fontSize: 15 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button style={{ width: '100%', padding: 14, borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer', background: p.highlight ? 'linear-gradient(135deg,#4f7cff,#7c3aed)' : 'white', border: p.highlight ? 'none' : '1.5px solid #e2e8f0', color: p.highlight ? 'white' : '#374151', boxShadow: p.highlight ? '0 4px 16px rgba(79,124,255,0.4)' : 'none', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-1.5px', color: 'white', marginBottom: 16, lineHeight: 1.1 }}>
            Start Designing Your<br />Dream Space Today
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', marginBottom: 36, lineHeight: 1.7 }}>
            Join thousands using RoomGenie AI to visualize their perfect home.
          </p>
          <a href="#design-tool" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 16, fontWeight: 700, padding: '16px 40px', borderRadius: 14, textDecoration: 'none', boxShadow: '0 8px 28px rgba(79,124,255,0.4)', transition: 'all 0.2s' }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 36px rgba(79,124,255,0.55)' }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(79,124,255,0.4)' }}>
            ✦ Design for Free
          </a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>Free · No credit card · Powered by Claude AI</p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: '#0f172a', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: 'white' }}>R</div>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'white' }}>RoomGenie AI</span>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 14, color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap' }}>
            {[['Design Tool', '#design-tool'], ['Styles', '#styles'], ['Gallery', '#gallery'], ['Pricing', '#pricing']].map(([l, h]) => (
              <a key={l} href={h} style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}
                onMouseOver={e => e.currentTarget.style.color = 'white'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>{l}</a>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>© 2026 RoomGenie AI</p>
        </div>
      </footer>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box;margin:0;padding:0} html{scroll-behavior:smooth} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15);border-radius:4px}`}</style>
    </div>
  )
}
