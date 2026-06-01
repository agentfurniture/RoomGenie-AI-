"use client"
import Link from 'next/link'

const PLANS = [
  {
    name: 'Free', price: '$0', period: '/month', highlight: false,
    features: ['3 AI designs/month', 'All 10 design styles', 'Color palettes', 'Designer tips', 'AI chat (5 msg/day)'],
    cta: 'Get Started Free', href: '/create',
  },
  {
    name: 'Pro', price: '$19', period: '/month', highlight: true,
    features: ['Unlimited AI designs', 'HD quality output', 'Before/After slider', 'Unlimited AI consultant', 'Furniture upload', 'Priority generation', 'Commercial rights'],
    cta: 'Start Pro', href: '/pricing',
  },
  {
    name: 'Studio', price: '$49', period: '/month', highlight: false,
    features: ['Everything in Pro', '5 team seats', 'API access', 'White-label exports', 'Custom styles', 'Priority support'],
    cta: 'Contact Sales', href: '/pricing',
  },
]

export default function PricingCards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, alignItems: 'center', maxWidth: 960, margin: '0 auto' }}>
      {PLANS.map(p => (
        <div key={p.name} style={{
          borderRadius: 22, padding: '32px 28px',
          background: p.highlight ? 'linear-gradient(145deg,#1e1b4b,#1a1a2e)' : 'white',
          border: p.highlight ? 'none' : '1px solid #e8eaf0',
          color: p.highlight ? 'white' : '#0f172a',
          transform: p.highlight ? 'scale(1.04)' : 'scale(1)',
          boxShadow: p.highlight ? '0 20px 60px rgba(79,124,255,0.22)' : '0 4px 20px rgba(0,0,0,0.06)',
          position: 'relative', display: 'flex', flexDirection: 'column',
        }}>
          {p.highlight && (
            <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 11, fontWeight: 800, padding: '4px 16px', borderRadius: 100, whiteSpace: 'nowrap' }}>MOST POPULAR</div>
          )}
          <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{p.name}</h3>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 46, fontWeight: 900, letterSpacing: '-2px' }}>{p.price}</span>
            <span style={{ fontSize: 14, color: p.highlight ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>{p.period}</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {p.features.map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: p.highlight ? 'rgba(255,255,255,0.75)' : '#374151' }}>
                <span style={{ color: p.highlight ? '#818cf8' : '#16a34a', fontWeight: 800, flexShrink: 0 }}>✓</span>{f}
              </li>
            ))}
          </ul>
          <Link href={p.href} style={{
            display: 'block', textAlign: 'center', textDecoration: 'none', padding: '13px', borderRadius: 12, fontWeight: 800, fontSize: 14,
            background: p.highlight ? 'linear-gradient(135deg,#4f7cff,#7c3aed)' : 'white',
            border: p.highlight ? 'none' : '1.5px solid #e2e8f0',
            color: p.highlight ? 'white' : '#374151',
            boxShadow: p.highlight ? '0 6px 20px rgba(79,124,255,0.4)' : 'none',
            transition: 'all 0.2s',
          }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
            onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>{p.cta}</Link>
        </div>
      ))}
    </div>
  )
}
