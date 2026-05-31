'use client'
import { useState } from 'react'
import Link from 'next/link'

const MOCK_PROJECTS = [
  { id: 1, title: 'Modern Living Room', style: 'Modern', room: 'Living Room', img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=600&q=80&auto=format&fit=crop', date: '2 hours ago' },
  { id: 2, title: 'Luxury Bedroom Suite', style: 'Luxury', room: 'Bedroom', img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&auto=format&fit=crop', date: 'Yesterday' },
  { id: 3, title: 'Minimalist Kitchen', style: 'Minimalist', room: 'Kitchen', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&auto=format&fit=crop', date: '3 days ago' },
  { id: 4, title: 'Scandi Home Office', style: 'Scandinavian', room: 'Home Office', img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80&auto=format&fit=crop', date: '1 week ago' },
  { id: 5, title: 'Bohemian Living Space', style: 'Bohemian', room: 'Living Room', img: 'https://images.unsplash.com/photo-1522444195799-478538b28823?w=600&q=80&auto=format&fit=crop', date: '1 week ago' },
  { id: 6, title: 'Industrial Loft', style: 'Industrial', room: 'Living Room', img: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=600&q=80&auto=format&fit=crop', date: '2 weeks ago' },
]

const STATS = [
  { label: 'Designs Created', value: '6', icon: '✦', color: '#4f7cff' },
  { label: 'Credits Used', value: '6/3', icon: '⚡', color: '#f59e0b', sub: 'Free plan' },
  { label: 'Styles Tried', value: '6', icon: '🎨', color: '#10b981' },
  { label: 'Saved Designs', value: '4', icon: '❤️', color: '#ec4899' },
]

export default function DashboardPage() {
  const [view, setView]     = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState('All')
  const styles = ['All', 'Modern', 'Luxury', 'Minimalist', 'Scandinavian', 'Bohemian', 'Industrial']

  const filtered = filter === 'All' ? MOCK_PROJECTS : MOCK_PROJECTS.filter(p => p.style === filter)

  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#f8faff', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e8eaf0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>R</div>
            <span style={{ fontWeight: 800, fontSize: 17, color: '#1a1a2e' }}>RoomGenie AI</span>
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['Create', '/create'], ['Pricing', '/pricing']].map(([l, h]) => (
              <Link key={l} href={h} style={{ padding: '8px 16px', borderRadius: 9, fontSize: 14, fontWeight: 500, color: '#5a6478', textDecoration: 'none', background: '#f1f5f9', transition: 'all 0.15s' }}>{l}</Link>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 800 }}>U</div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '88px 24px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', marginBottom: 4 }}>My Dashboard</h1>
            <p style={{ fontSize: 15, color: '#64748b' }}>Manage your AI-generated room designs</p>
          </div>
          <Link href="/create" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', padding: '12px 24px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(79,124,255,0.35)', transition: 'all 0.2s' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
            onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
            + New Design
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 36 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{s.label}</span>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
              {s.sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Upgrade banner */}
        <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 20, padding: '24px 28px', marginBottom: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 17, fontWeight: 800, color: 'white', marginBottom: 4 }}>⚡ Upgrade to Pro for Unlimited Designs</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>You&apos;ve used your 3 free renders. Go Pro for $19/month — no limits.</p>
          </div>
          <Link href="/pricing" style={{ background: 'white', color: '#4f7cff', padding: '11px 24px', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: 14, flexShrink: 0, transition: 'all 0.2s' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
            onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
            Upgrade Now →
          </Link>
        </div>

        {/* Projects section */}
        <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 20, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {styles.map(s => (
                <button key={s} onClick={() => setFilter(s)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: `1.5px solid ${filter === s ? '#4f7cff' : '#e2e8f0'}`,
                  background: filter === s ? '#f0f4ff' : 'white',
                  color: filter === s ? '#4f7cff' : '#64748b',
                  transition: 'all 0.15s',
                }}>{s}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['grid', 'list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: view === v ? '#f0f4ff' : 'white', color: view === v ? '#4f7cff' : '#94a3b8', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {v === 'grid' ? '⊞' : '☰'}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {view === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {filtered.map(p => (
                <div key={p.id} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e8eaf0', cursor: 'pointer', transition: 'all 0.22s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)' }}
                  onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={p.img} alt={p.title} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 55%)' }} />
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#4f7cff' }}>{p.style}</div>
                    <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: 'white', margin: 0 }}>{p.title}</p>
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 13, color: '#374151', fontWeight: 600, margin: 0 }}>{p.room}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{p.date}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>♥</button>
                      <button style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f7cff' }}>⬇</button>
                    </div>
                  </div>
                </div>
              ))}

              {/* New design card */}
              <Link href="/create" style={{ borderRadius: 16, border: '2px dashed #c7d2fe', background: '#f8faff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240, textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4f7cff'; (e.currentTarget as HTMLElement).style.background = '#f0f4ff' }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#c7d2fe'; (e.currentTarget as HTMLElement).style.background = '#f8faff' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white', marginBottom: 14, boxShadow: '0 4px 16px rgba(79,124,255,0.3)' }}>+</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#4f7cff', marginBottom: 4 }}>New Design</p>
                <p style={{ fontSize: 13, color: '#94a3b8' }}>Create with AI</p>
              </Link>
            </div>
          ) : (
            /* List view */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', border: '1px solid #f1f5f9', borderRadius: 14, cursor: 'pointer', transition: 'all 0.18s', background: 'white' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.borderColor = '#c7d2fe'}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9'}>
                  <img src={p.img} alt={p.title} style={{ width: 72, height: 56, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 3px' }}>{p.title}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{p.room} · {p.style} · {p.date}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>View</button>
                    <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', fontSize: 12, fontWeight: 600, color: '#4f7cff', cursor: 'pointer' }}>⬇</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

