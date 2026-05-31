'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e8eaf0', boxShadow: '0 1px 20px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 900 }}>R</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#1a1a2e', letterSpacing: '-0.3px' }}>RoomGenie</span>
          <span style={{ fontWeight: 800, fontSize: 18, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 4, flex: 1, marginLeft: 32 }}>
          {[['Create', '/create'], ['Dashboard', '/dashboard'], ['Pricing', '/pricing']].map(([l, h]) => (
            <Link key={l} href={h} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#5a6478', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseOver={e => { e.currentTarget.style.background = '#f0f4ff'; e.currentTarget.style.color = '#4f7cff' }}
              onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#5a6478' }}>{l}</Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button style={{ background: 'none', border: '1px solid #e2e8f0', color: '#5a6478', fontSize: 14, fontWeight: 600, padding: '8px 18px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#4f7cff'; e.currentTarget.style.color = '#4f7cff' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#5a6478' }}>Log in</button>
          <Link href="/create" style={{ background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 14, fontWeight: 700, padding: '9px 22px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 14px rgba(79,124,255,0.35)', transition: 'all 0.15s', display: 'inline-block' }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(79,124,255,0.45)' }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(79,124,255,0.35)' }}>
            Start for Free
          </Link>
        </div>
      </div>
    </nav>
  )
}

