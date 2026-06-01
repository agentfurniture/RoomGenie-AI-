"use client"
import Link from 'next/link'

const LINKS = {
  Product:  [['AI Design Tool', '/create'], ['Design Styles', '/#styles'], ['Gallery', '/#gallery'], ['Pricing', '/pricing']],
  Company:  [['About', '#'], ['Blog', '#'], ['Careers', '#'], ['Contact', '#']],
  Support:  [['Help Center', '#'], ['Privacy Policy', '#'], ['Terms of Service', '#'], ['Cookie Policy', '#']],
}

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: 'white', padding: '64px 24px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 56, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>R</div>
              <span style={{ fontWeight: 800, fontSize: 18, color: 'white' }}>RoomGenie AI</span>
            </Link>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: 280, marginBottom: 24 }}>
              The AI-powered interior design platform. Transform any room into your dream space in seconds.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['𝕏', 'in', 'ig', 'yt'].map(s => (
                <a key={s} href="#" style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'all 0.18s' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(79,124,255,0.3)'; (e.currentTarget as HTMLElement).style.color = 'white' }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}>{s}</a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 18 }}>{title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.18s' }}
                      onMouseOver={e => e.currentTarget.style.color = 'white'}
                      onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>{label}</Link>
                  </li>
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
  )
}
