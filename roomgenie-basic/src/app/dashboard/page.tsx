'use client'
import { useState } from 'react'
import Link from 'next/link'

const PROJECTS = [
  { id: 1, title: 'Modern Living Room', style: 'Modern', room: 'Living Room', img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=500&q=75&auto=format&fit=crop', date: '2 hours ago' },
  { id: 2, title: 'Luxury Bedroom', style: 'Luxury', room: 'Bedroom', img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=75&auto=format&fit=crop', date: 'Yesterday' },
  { id: 3, title: 'Minimal Kitchen', style: 'Minimalist', room: 'Kitchen', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=75&auto=format&fit=crop', date: '3 days ago' },
  { id: 4, title: 'Scandi Home Office', style: 'Scandinavian', room: 'Office', img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&q=75&auto=format&fit=crop', date: '1 week ago' },
  { id: 5, title: 'Bohemian Living', style: 'Bohemian', room: 'Living Room', img: 'https://images.unsplash.com/photo-1522444195799-478538b28823?w=500&q=75&auto=format&fit=crop', date: '1 week ago' },
]

export default function DashboardPage() {
  const [filter, setFilter] = useState('All')
  const styles = ['All', 'Modern', 'Luxury', 'Minimalist', 'Scandinavian', 'Bohemian']
  const filtered = filter === 'All' ? PROJECTS : PROJECTS.filter(p => p.style === filter)

  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#f8faff', minHeight: '100vh' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e8eaf0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>R</div>
            <span style={{ fontWeight: 800, fontSize: 17, color: '#0f172a' }}>RoomGenie AI</span>
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/create" className="nav-link">Create</Link>
            <Link href="/pricing" className="nav-link">Pricing</Link>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>U</div>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '88px 28px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', marginBottom: 4 }}>My Dashboard</h1>
            <p style={{ fontSize: 15, color: '#64748b' }}>Manage your AI-generated room designs</p>
          </div>
          <Link href="/create" className="btn-primary" style={{ fontSize: 14, padding: '12px 24px' }}>+ New Design</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {[{ l:'Designs', v:'5', icon:'✦', c:'#4f7cff' },{ l:'Credits Used', v:'5/3', icon:'⚡', c:'#f59e0b' },{ l:'Styles Tried', v:'5', icon:'🎨', c:'#10b981' },{ l:'Plan', v:'Free', icon:'👑', c:'#8b5cf6' }].map(s => (
            <div key={s.l} style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{s.l}</span>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color: s.c, letterSpacing: '-0.5px' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Upgrade */}
        <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 20, padding: '22px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 3 }}>⚡ Upgrade to Pro for Unlimited Designs</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Go Pro for $19/month — unlimited renders, Full Studio, and more.</p>
          </div>
          <Link href="/pricing" style={{ background: 'white', color: '#4f7cff', padding: '11px 24px', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>Upgrade Now →</Link>
        </div>

        {/* Projects */}
        <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 20, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {styles.map(s => (
                <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${filter === s ? '#4f7cff' : '#e2e8f0'}`, background: filter === s ? '#f0f4ff' : 'white', color: filter === s ? '#4f7cff' : '#64748b', transition: 'all 0.15s' }}>{s}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {filtered.map(p => (
              <div key={p.id} className="dash-card">
                <div style={{ position: 'relative' }}>
                  <img src={p.img} alt={p.title} style={{ width: '100%', height: 175, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.5),transparent 50%)' }} />
                  <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#4f7cff' }}>{p.style}</div>
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
            <Link href="/create" style={{ borderRadius: 16, border: '2px dashed #c7d2fe', background: '#f8faff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 230, textDecoration: 'none', transition: 'all 0.2s' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'white', marginBottom: 12 }}>+</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#4f7cff', marginBottom: 3 }}>New Design</p>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Create with AI</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
