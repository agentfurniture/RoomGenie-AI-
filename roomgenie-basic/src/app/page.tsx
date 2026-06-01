'use client'
import { useState } from 'react'

const ROOMS = [
  { name: 'Living Room', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&q=80&auto=format&fit=crop' },
  { name: 'Bedroom',     img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80&auto=format&fit=crop' },
  { name: 'Kitchen',     img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80&auto=format&fit=crop' },
  { name: 'Bathroom',    img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&q=80&auto=format&fit=crop' },
  { name: 'Home Office', img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&q=80&auto=format&fit=crop' },
  { name: 'Dining Room', img: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=500&q=80&auto=format&fit=crop' },
]

const STYLES = [
  { name: 'Modern',       img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=80&auto=format&fit=crop',  color: '#4f7cff' },
  { name: 'Luxury',       img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&q=80&auto=format&fit=crop',  color: '#f59e0b' },
  { name: 'Minimalist',   img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&q=80&auto=format&fit=crop',  color: '#94a3b8' },
  { name: 'Scandinavian', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80&auto=format&fit=crop',  color: '#22c55e' },
  { name: 'Industrial',   img: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=400&q=80&auto=format&fit=crop',  color: '#f97316' },
  { name: 'Bohemian',     img: 'https://images.unsplash.com/photo-1522444195799-478538b28823?w=400&q=80&auto=format&fit=crop',  color: '#ec4899' },
  { name: 'Japandi',      img: 'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?w=400&q=80&auto=format&fit=crop',  color: '#10b981' },
  { name: 'Classic',      img: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=400&q=80&auto=format&fit=crop',  color: '#d97706' },
]

const GALLERY = [
  { img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=900&q=85&auto=format&fit=crop', style: 'Luxury', room: 'Living Room', span: 2 },
  { img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80&auto=format&fit=crop', style: 'Modern', room: 'Bedroom', span: 1 },
  { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80&auto=format&fit=crop', style: 'Minimalist', room: 'Kitchen', span: 1 },
  { img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80&auto=format&fit=crop', style: 'Scandinavian', room: 'Living Room', span: 1 },
  { img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&q=80&auto=format&fit=crop', style: 'Spa', room: 'Bathroom', span: 1 },
]

const FEATURES = [
  { icon: '📸', title: 'Upload Any Room', desc: 'Take a photo of your existing room and let AI analyze the space, dimensions, and potential.' },
  { icon: '🎨', title: '10 Design Styles', desc: 'Modern, Luxury, Scandinavian, Japandi, Industrial, Bohemian, and more — each with precision AI prompts.' },
  { icon: '⚡', title: 'Instant Results', desc: 'Get photorealistic AI-generated designs in under 10 seconds. No waiting, no queues.' },
  { icon: '💬', title: 'AI Design Consultant', desc: 'Chat with Claude AI for expert advice on colors, furniture, layout, and lighting.' },
  { icon: '🛋️', title: 'Furniture Preservation', desc: 'Upload your existing furniture and AI will incorporate it into the new design.' },
  { icon: '📐', title: 'Room Dimensions', desc: 'Enter exact dimensions so AI generates properly scaled, realistic furniture layouts.' },
]

export default function Home() {
  const [activeRoom, setActiveRoom]   = useState('Living Room')
  const [activeStyle, setActiveStyle] = useState('Modern')
  const [prompt, setPrompt]           = useState('')
  const [generating, setGenerating]   = useState(false)
  const [result, setResult]           = useState<{ image: string; design: Record<string, unknown> } | null>(null)
  const [error, setError]             = useState('')
  const [menuOpen, setMenuOpen]       = useState(false)

  async function handleGenerate() {
    setError(''); setGenerating(true); setResult(null)
    try {
      const fd = new FormData()
      fd.append('style', activeStyle)
      fd.append('roomType', activeRoom)
      fd.append('prompt', prompt)
      const res  = await fetch('/api/generate', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
      setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch { setError('Something went wrong. Please try again.') }
    finally { setGenerating(false) }
  }

  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#ffffff', color: '#0f172a', overflowX: 'hidden' }}>

      {/* ═══════════ NAV ═══════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid #f1f5f9',
        boxShadow: '0 1px 0 0 #f1f5f9, 0 4px 24px rgba(0,0,0,0.04)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', height: 68, display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 18, boxShadow: '0 4px 12px rgba(79,124,255,0.4)' }}>R</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', letterSpacing: '-0.3px' }}>RoomGenie<span style={{ background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}> AI</span></span>
          </a>

          <div style={{ display: 'flex', gap: 2, flex: 1 }}>
            {[['Features','#features'],['Styles','#styles'],['Gallery','#gallery'],['Pricing','#pricing']].map(([l,h]) => (
              <a key={l} href={h} style={{ padding: '8px 14px', borderRadius: 9, fontSize: 14, fontWeight: 500, color: '#5a6478', textDecoration: 'none', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                onMouseOver={e=>{e.currentTarget.style.background='#f0f4ff';e.currentTarget.style.color='#4f7cff'}}
                onMouseOut={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='#5a6478'}}>{l}</a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <a href="/dashboard" style={{ fontSize: 14, fontWeight: 500, color: '#5a6478', textDecoration: 'none', padding: '8px 14px', borderRadius: 9, transition: 'all 0.15s' }}
              onMouseOver={e=>{e.currentTarget.style.background='#f0f4ff';e.currentTarget.style.color='#4f7cff'}}
              onMouseOut={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='#5a6478'}}>Dashboard</a>
            <a href="/create" style={{ background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 14, fontWeight: 700, padding: '10px 24px', borderRadius: 11, textDecoration: 'none', boxShadow: '0 4px 16px rgba(79,124,255,0.4)', transition: 'all 0.15s', display: 'inline-block' }}
              onMouseOver={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-1px)';(e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(79,124,255,0.5)'}}
              onMouseOut={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0)';(e.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(79,124,255,0.4)'}}>
              Start for Free
            </a>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section style={{ paddingTop: 68, position: 'relative', overflow: 'hidden', background: 'linear-gradient(170deg,#f8f9ff 0%,#eef2ff 35%,#fdf4ff 70%,#f0f7ff 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '10%', right: '-5%', width: 600, height: 600, background: 'radial-gradient(circle,rgba(79,124,255,0.1) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(124,58,237,0.08) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '45%', width: 300, height: 300, background: 'radial-gradient(circle,rgba(236,72,153,0.06) 0%,transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 28px 80px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

            {/* LEFT */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 100, padding: '7px 18px', fontSize: 13, fontWeight: 600, color: '#4f7cff', marginBottom: 28 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f7cff', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
                Powered by Claude AI · Designs in seconds
              </div>

              <h1 style={{ fontSize: 'clamp(40px,5vw,68px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-2.5px', marginBottom: 22, color: '#0f172a' }}>
                Design Your<br />
                <span style={{ background: 'linear-gradient(135deg,#4f7cff 0%,#7c3aed 50%,#ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Dream Home</span>
                <br />with AI
              </h1>

              <p style={{ fontSize: 18, color: '#64748b', lineHeight: 1.75, marginBottom: 40, maxWidth: 500 }}>
                Upload your room, pick a style, describe your vision — get a photorealistic AI redesign in under 10 seconds. No design skills needed.
              </p>

              <div style={{ display: 'flex', gap: 14, marginBottom: 52, flexWrap: 'wrap' }}>
                <a href="#design-tool" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontWeight: 700, fontSize: 16, padding: '15px 36px', borderRadius: 14, textDecoration: 'none', boxShadow: '0 8px 28px rgba(79,124,255,0.4)', transition: 'all 0.2s' }}
                  onMouseOver={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';(e.currentTarget as HTMLElement).style.boxShadow='0 14px 40px rgba(79,124,255,0.55)'}}
                  onMouseOut={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0)';(e.currentTarget as HTMLElement).style.boxShadow='0 8px 28px rgba(79,124,255,0.4)'}}>
                  ✦ Design for Free
                </a>
                <a href="#gallery" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, padding: '15px 28px', borderRadius: 14, textDecoration: 'none', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}
                  onMouseOver={e=>{(e.currentTarget as HTMLElement).style.borderColor='#4f7cff';(e.currentTarget as HTMLElement).style.color='#4f7cff'}}
                  onMouseOut={e=>{(e.currentTarget as HTMLElement).style.borderColor='#e2e8f0';(e.currentTarget as HTMLElement).style.color='#374151'}}>
                  View Gallery →
                </a>
              </div>

              {/* Trust badges */}
              <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
                {[['10K+','Rooms Designed'],['8','Design Styles'],['⭐ 4.9','Rating']].map(([v,l]) => (
                  <div key={l}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginTop: 3 }}>{l}</div>
                  </div>
                ))}
                <div style={{ width: 1, height: 36, background: '#e2e8f0' }} />
                <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 140, lineHeight: 1.5 }}>No credit card required</div>
              </div>
            </div>

            {/* RIGHT — Image grid */}
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Large card */}
                <div style={{ gridRow: 'span 2', borderRadius: 22, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', position: 'relative', transition: 'transform 0.3s ease' }}
                  onMouseOver={e=>(e.currentTarget as HTMLElement).style.transform='scale(1.02)'}
                  onMouseOut={e=>(e.currentTarget as HTMLElement).style.transform='scale(1)'}>
                  <img src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=700&q=85&auto=format&fit=crop" alt="Luxury Living Room" style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 380, display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 50%)' }} />
                  <div style={{ position: 'absolute', bottom: 20, left: 18 }}>
                    <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: 'white', marginBottom: 6 }}>✦ AI Generated</div>
                    <p style={{ fontSize: 15, fontWeight: 800, color: 'white', margin: 0 }}>Luxury Living Room</p>
                  </div>
                </div>
                {/* Small cards */}
                {[
                  { img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80&auto=format&fit=crop', label: 'Modern Bedroom' },
                  { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80&auto=format&fit=crop', label: 'Minimal Kitchen' },
                ].map(item => (
                  <div key={item.label} style={{ borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', position: 'relative', transition: 'transform 0.3s ease' }}
                    onMouseOver={e=>(e.currentTarget as HTMLElement).style.transform='scale(1.03)'}
                    onMouseOut={e=>(e.currentTarget as HTMLElement).style.transform='scale(1)'}>
                    <img src={item.img} alt={item.label} style={{ width: '100%', height: 176, objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 50%)' }} />
                    <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: 0 }}>{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating badge */}
              <div style={{ position: 'absolute', bottom: -20, left: -20, background: 'white', borderRadius: 18, padding: '14px 20px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #f1f5f9' }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>Claude AI Design</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Results in ~8 seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ DESIGN TOOL ═══════════ */}
      <section id="design-tool" style={{ background: '#f8faff', padding: '96px 28px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 100, padding: '6px 18px', fontSize: 11, fontWeight: 700, color: '#4f7cff', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 16 }}>AI Design Tool</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#0f172a', marginBottom: 14 }}>Design Your Room Now</h2>
            <p style={{ fontSize: 17, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>Pick a room, choose a style, describe your vision — get an AI design instantly</p>
          </div>

          {/* Tool card */}
          <div style={{ background: 'white', borderRadius: 28, boxShadow: '0 8px 48px rgba(0,0,0,0.09)', border: '1px solid #e8eaf0', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px' }}>

              {/* Left */}
              <div style={{ padding: '40px 40px', borderRight: '1px solid #f1f5f9' }}>

                {/* Room type */}
                <div style={{ marginBottom: 36 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(79,124,255,0.35)' }}>1</div>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Choose Room Type</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                    {ROOMS.map(r => (
                      <button key={r.name} onClick={() => setActiveRoom(r.name)} style={{
                        position: 'relative', borderRadius: 14, overflow: 'hidden',
                        border: `2.5px solid ${activeRoom === r.name ? '#4f7cff' : '#e8eaf0'}`,
                        padding: 0, cursor: 'pointer', background: 'none', transition: 'all 0.2s',
                        boxShadow: activeRoom === r.name ? '0 0 0 4px rgba(79,124,255,0.12), 0 8px 20px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.05)',
                      }}>
                        <img src={r.img} alt={r.name} style={{ width: '100%', height: 86, objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: activeRoom === r.name ? 'rgba(79,124,255,0.18)' : 'linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 55%)' }} />
                        {activeRoom === r.name && <div style={{ position: 'absolute', top: 7, right: 7, width: 20, height: 20, borderRadius: '50%', background: '#4f7cff', color: 'white', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', padding: '6px 4px 8px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{r.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div style={{ marginBottom: 36 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(79,124,255,0.35)' }}>2</div>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Select Design Style</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                    {STYLES.map(s => (
                      <button key={s.name} onClick={() => setActiveStyle(s.name)} style={{
                        position: 'relative', borderRadius: 12, overflow: 'hidden',
                        border: `2.5px solid ${activeStyle === s.name ? s.color : '#e8eaf0'}`,
                        padding: 0, cursor: 'pointer', background: 'none', transition: 'all 0.2s',
                        transform: activeStyle === s.name ? 'scale(1.04)' : 'scale(1)',
                        boxShadow: activeStyle === s.name ? `0 0 0 3px ${s.color}20, 0 8px 20px rgba(0,0,0,0.1)` : '0 2px 6px rgba(0,0,0,0.05)',
                      }}>
                        <img src={s.img} alt={s.name} style={{ width: '100%', height: 70, objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: activeStyle === s.name ? `${s.color}20` : 'linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 55%)' }} />
                        {activeStyle === s.name && <div style={{ position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: '50%', background: s.color, color: 'white', fontSize: 8, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>}
                        <div style={{ position: 'absolute', bottom: 5, left: 0, right: 0, textAlign: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{s.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(79,124,255,0.35)' }}>3</div>
                    <div>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Describe Your Vision</span>
                      <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400, marginLeft: 8 }}>optional</span>
                    </div>
                  </div>
                  <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g. Warm amber lighting, walnut wood floors, floor-to-ceiling shelves, cozy reading nook by the window, lots of plants..."
                    style={{ width: '100%', border: '1.5px solid #e8eaf0', borderRadius: 14, padding: '16px 18px', fontSize: 14, color: '#0f172a', lineHeight: 1.7, minHeight: 110, resize: 'none', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s', background: '#fafbff' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#4f7cff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,124,255,0.1)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#e8eaf0'; e.currentTarget.style.boxShadow = 'none' }} />
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>💡 Mention specific furniture, colors, materials, or a mood you want to achieve</p>
                </div>
              </div>

              {/* Right — summary */}
              <div style={{ padding: '40px 32px', background: '#fafbff', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 22 }}>Your Design</h3>

                {/* Preview image */}
                <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 22, boxShadow: '0 8px 28px rgba(0,0,0,0.1)', position: 'relative' }}>
                  <img src={STYLES.find(s => s.name === activeStyle)?.img} alt={activeStyle} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 50%)' }} />
                  <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: 'white', margin: 0 }}>{activeStyle}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{activeRoom}</p>
                  </div>
                </div>

                {/* Summary */}
                <div style={{ background: 'white', borderRadius: 14, padding: '16px 18px', marginBottom: 22, border: '1px solid #e8eaf0' }}>
                  {[
                    { l: 'Room',     v: activeRoom },
                    { l: 'Style',    v: activeStyle },
                    { l: 'AI Model', v: 'Claude AI' },
                    { l: 'Quality',  v: 'High Quality' },
                  ].map(({ l, v }) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f8faff', fontSize: 13 }}>
                      <span style={{ color: '#94a3b8', fontWeight: 500 }}>{l}</span>
                      <span style={{ color: '#0f172a', fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#dc2626', marginBottom: 14 }}>
                    ⚠️ {error}
                  </div>
                )}

                <button onClick={handleGenerate} disabled={generating} style={{
                  width: '100%', padding: '17px', borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: generating ? 'not-allowed' : 'pointer', border: 'none',
                  background: generating ? '#94a3b8' : 'linear-gradient(135deg,#4f7cff,#7c3aed)',
                  color: 'white', boxShadow: generating ? 'none' : '0 8px 28px rgba(79,124,255,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s', marginTop: 'auto',
                }}
                  onMouseOver={e => { if (!generating) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(79,124,255,0.5)' } }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = generating ? 'none' : '0 8px 28px rgba(79,124,255,0.4)' }}>
                  {generating ? (
                    <><div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Generating Design...</>
                  ) : '✦ Generate AI Design'}
                </button>
                <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>Free · Claude AI · ~8 seconds</p>

                {/* Quick links */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>Want more options?</p>
                  <a href="/create" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: '1px solid #e8eaf0', background: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600, color: '#4f7cff', transition: 'all 0.15s' }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4f7cff'; (e.currentTarget as HTMLElement).style.background = '#f0f4ff' }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e8eaf0'; (e.currentTarget as HTMLElement).style.background = 'white' }}>
                    🔧 Full Design Studio (upload photo, furniture, dimensions)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ RESULT ═══════════ */}
      {result && (
        <section id="result" style={{ background: 'white', padding: '80px 28px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '6px 18px', fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 16 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Design Complete
              </div>
              <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', color: '#0f172a' }}>
                {(result.design as Record<string, string>)?.title || `${activeStyle} ${activeRoom}`}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }}>
              <div>
                <div style={{ borderRadius: 22, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.14)', position: 'relative', marginBottom: 20 }}>
                  <div style={{ position: 'absolute', inset: -2, background: 'linear-gradient(135deg,rgba(79,124,255,0.3),rgba(124,58,237,0.2))', borderRadius: 24, filter: 'blur(2px)', zIndex: 0 }} />
                  <img src={result.image} alt="AI Design" style={{ position: 'relative', zIndex: 1, width: '100%', display: 'block', borderRadius: 22, minHeight: 280, objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#4f7cff' }}>✦ Claude AI Design</div>
                </div>

                {(result.design as Record<string, string>)?.description && (
                  <div style={{ background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 16, padding: 24, marginBottom: 16 }}>
                    <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, margin: 0 }}>{(result.design as Record<string, string>).description}</p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {(result.design as Record<string, string[]>)?.colors?.length > 0 && (
                    <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 20 }}>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Color Palette</h4>
                      {(result.design as Record<string, string[]>).colors.map((c: string, i: number) => {
                        const [hex, name] = c.includes(' - ') ? c.split(' - ') : [c, c]
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: hex.startsWith('#') ? hex : '#e2e8f0', border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
                            <div><p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: 0 }}>{name}</p></div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {(result.design as Record<string, string[]>)?.furniture?.length > 0 && (
                    <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 20 }}>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Key Pieces</h4>
                      {(result.design as Record<string, string[]>).furniture.map((f: string, i: number) => (
                        <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 9, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: '#4f7cff', fontWeight: 700, flexShrink: 0 }}>→</span>{f}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {(result.design as Record<string, string[]>)?.tips?.length > 0 && (
                  <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 20, marginTop: 14 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Designer Tips</h4>
                    {(result.design as Record<string, string[]>).tips.map((t: string, i: number) => (
                      <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.7 }}>
                        <span style={{ color: '#16a34a', fontWeight: 800, flexShrink: 0 }}>✓</span>{t}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Result sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 18, padding: 22 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>Details</h3>
                  {[{ l: 'Style', v: activeStyle }, { l: 'Room', v: activeRoom }, { l: 'Status', v: '✓ Complete' }].map(({ l, v }) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '10px 0', borderBottom: '1px solid #f8faff' }}>
                      <span style={{ color: '#94a3b8' }}>{l}</span>
                      <span style={{ color: v.startsWith('✓') ? '#16a34a' : '#0f172a', fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <a href={result.image} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', padding: '14px', borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 16px rgba(79,124,255,0.3)', transition: 'all 0.2s' }}
                  onMouseOver={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}
                  onMouseOut={e=>(e.currentTarget as HTMLElement).style.transform='translateY(0)'}>
                  ⬇ Open Full Image
                </a>

                <button onClick={() => { setResult(null); document.getElementById('design-tool')?.scrollIntoView({ behavior: 'smooth' }) }} style={{ padding: '14px', borderRadius: 14, border: '1.5px solid #4f7cff', background: '#f0f4ff', color: '#4f7cff', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                  🔄 Generate Another
                </button>

                <a href="/create" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: 14, border: '1px solid #e8eaf0', background: 'white', color: '#374151', fontWeight: 600, fontSize: 13, textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseOver={e=>{(e.currentTarget as HTMLElement).style.borderColor='#4f7cff';(e.currentTarget as HTMLElement).style.color='#4f7cff'}}
                  onMouseOut={e=>{(e.currentTarget as HTMLElement).style.borderColor='#e8eaf0';(e.currentTarget as HTMLElement).style.color='#374151'}}>
                  🔧 Full Studio with Upload
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" style={{ background: 'white', padding: '96px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 100, padding: '6px 18px', fontSize: 11, fontWeight: 700, color: '#4f7cff', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 16 }}>Features</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#0f172a', marginBottom: 14 }}>Everything You Need to Design</h2>
            <p style={{ fontSize: 17, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>Professional AI interior design tools — no experience required.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: '#f8faff', border: '1px solid #e8eaf0', borderRadius: 20, padding: '32px 28px', transition: 'all 0.22s ease', cursor: 'default' }}
                onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-4px)'; el.style.boxShadow='0 16px 48px rgba(0,0,0,0.1)'; el.style.borderColor='#c7d2fe'; el.style.background='white' }}
                onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(0)'; el.style.boxShadow='none'; el.style.borderColor='#e8eaf0'; el.style.background='#f8faff' }}>
                <div style={{ fontSize: 40, marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 10, letterSpacing: '-0.3px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ STYLES ═══════════ */}
      <section id="styles" style={{ background: '#f8faff', padding: '96px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 100, padding: '6px 18px', fontSize: 11, fontWeight: 700, color: '#4f7cff', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 16 }}>Design Styles</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#0f172a', marginBottom: 14 }}>8 Stunning Styles</h2>
            <p style={{ fontSize: 17, color: '#64748b' }}>Click a style to use it in the design tool</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {STYLES.map(s => (
              <div key={s.name} onClick={() => { setActiveStyle(s.name); document.getElementById('design-tool')?.scrollIntoView({ behavior: 'smooth' }) }}
                style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', aspectRatio: '4/3', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-5px)'; el.style.boxShadow='0 20px 50px rgba(0,0,0,0.16)' }}
                onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(0)'; el.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)' }}>
                <img src={s.img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 55%)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.color }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: 'white', margin: 0 }}>{s.name}</p>
                  <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: 'white', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)' }}>Use →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ GALLERY ═══════════ */}
      <section id="gallery" style={{ background: 'white', padding: '96px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 100, padding: '6px 18px', fontSize: 11, fontWeight: 700, color: '#4f7cff', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 16 }}>Gallery</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#0f172a' }}>Design Inspiration</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {GALLERY.map((g, i) => (
              <div key={i} onClick={() => { setActiveStyle(g.style); setActiveRoom(g.room); document.getElementById('design-tool')?.scrollIntoView({ behavior: 'smooth' }) }}
                style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s ease', gridColumn: g.span === 2 ? 'span 2' : 'span 1', aspectRatio: g.span === 2 ? '16/9' : '4/3', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.transform='scale(1.02)'; el.style.boxShadow='0 20px 50px rgba(0,0,0,0.16)' }}
                onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.transform='scale(1)'; el.style.boxShadow='0 4px 20px rgba(0,0,0,0.08)' }}>
                <img src={g.img} alt={`${g.style} ${g.room}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%)' }} />
                <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{g.room}</p>
                  <p style={{ fontSize: 17, fontWeight: 800, color: 'white', margin: 0 }}>{g.style} Style</p>
                </div>
                <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>Try This →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section id="pricing" style={{ background: '#f8faff', padding: '96px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 100, padding: '6px 18px', fontSize: 11, fontWeight: 700, color: '#4f7cff', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 16 }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#0f172a', marginBottom: 14 }}>Simple, Transparent Pricing</h2>
            <p style={{ fontSize: 17, color: '#64748b' }}>Start free. Upgrade when you need more.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, alignItems: 'center' }}>
            {[
              { name: 'Free', price: '$0', features: ['3 AI designs/month','All 8 styles','Color palettes & tips','AI chat (5 msg/day)'], cta: 'Start Free', h: false },
              { name: 'Pro', price: '$19', features: ['Unlimited AI designs','Full Design Studio','Upload room photos','Furniture preservation','AI consultant (unlimited)','Commercial rights'], cta: 'Start Pro', h: true },
              { name: 'Studio', price: '$49', features: ['Everything in Pro','5 team members','API access','White-label exports','Custom style presets','Priority support'], cta: 'Contact Sales', h: false },
            ].map(p => (
              <div key={p.name} style={{
                borderRadius: 24, padding: '36px 32px', display: 'flex', flexDirection: 'column', position: 'relative',
                background: p.h ? 'linear-gradient(145deg,#1e1b4b,#1a1a2e)' : 'white',
                border: p.h ? 'none' : '1px solid #e8eaf0',
                color: p.h ? 'white' : '#0f172a',
                transform: p.h ? 'scale(1.05)' : 'scale(1)',
                boxShadow: p.h ? '0 24px 64px rgba(79,124,255,0.25)' : '0 4px 20px rgba(0,0,0,0.06)',
              }}>
                {p.h && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 11, fontWeight: 800, padding: '5px 20px', borderRadius: 100, whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>MOST POPULAR</div>}
                <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{p.name}</h3>
                <div style={{ marginBottom: 28 }}>
                  <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-2px' }}>{p.price}</span>
                  <span style={{ fontSize: 15, color: p.h ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>/mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: p.h ? 'rgba(255,255,255,0.75)' : '#374151', lineHeight: 1.4 }}>
                      <span style={{ color: p.h ? '#818cf8' : '#16a34a', fontWeight: 800, flexShrink: 0, fontSize: 15 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button style={{ width: '100%', padding: '15px', borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer', background: p.h ? 'linear-gradient(135deg,#4f7cff,#7c3aed)' : 'white', border: p.h ? 'none' : '1.5px solid #e2e8f0', color: p.h ? 'white' : '#374151', boxShadow: p.h ? '0 8px 24px rgba(79,124,255,0.4)' : 'none', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)', padding: '96px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse,rgba(79,124,255,0.2) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, letterSpacing: '-2px', color: 'white', marginBottom: 16, lineHeight: 1.08 }}>
            Start Designing Your<br />Dream Space Today
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', marginBottom: 40, lineHeight: 1.7 }}>
            Join 10,000+ homeowners and designers using RoomGenie AI.
          </p>
          <a href="#design-tool" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 17, fontWeight: 700, padding: '18px 48px', borderRadius: 16, textDecoration: 'none', boxShadow: '0 10px 36px rgba(79,124,255,0.5)', transition: 'all 0.2s' }}
            onMouseOver={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';(e.currentTarget as HTMLElement).style.boxShadow='0 16px 48px rgba(79,124,255,0.65)'}}
            onMouseOut={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0)';(e.currentTarget as HTMLElement).style.boxShadow='0 10px 36px rgba(79,124,255,0.5)'}}>
            ✦ Design for Free
          </a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 18 }}>Free · No credit card · Powered by Claude AI</p>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ background: '#0f172a', padding: '48px 28px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 16 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 16 }}>R</div>
                <span style={{ fontWeight: 800, fontSize: 17, color: 'white' }}>RoomGenie AI</span>
              </a>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, maxWidth: 280, marginBottom: 24 }}>AI-powered interior design. Transform any room into your dream space in seconds — powered by Claude AI.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['𝕏','in','ig'].map(s => (
                  <a key={s} href="#" style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'all 0.18s' }}
                    onMouseOver={e=>{(e.currentTarget as HTMLElement).style.background='rgba(79,124,255,0.3)';(e.currentTarget as HTMLElement).style.color='white'}}
                    onMouseOut={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.07)';(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.5)'}}>{s}</a>
                ))}
              </div>
            </div>
            {[
              { title: 'Product',  links: [['AI Design Tool','/create'],['Design Styles','#styles'],['Gallery','#gallery'],['Pricing','/pricing']] },
              { title: 'Company',  links: [['Dashboard','/dashboard'],['About','#'],['Blog','#'],['Careers','#']] },
              { title: 'Support',  links: [['Help Center','#'],['Privacy','#'],['Terms','#'],['Contact','#']] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 18 }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(([label, href]) => (
                    <li key={label}><a href={href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.18s' }}
                      onMouseOver={e=>e.currentTarget.style.color='white'}
                      onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'}>{label}</a></li>
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #4f7cff; }
        ::selection { background: rgba(79,124,255,0.15); }
      `}</style>
    </div>
  )
}
