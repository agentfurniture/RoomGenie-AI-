import Link from 'next/link'

const PLANS = [
  {
    name: 'Free', price: '$0', period: '/month', highlight: false,
    features: ['3 AI designs/month','All 10 design styles','AI design descriptions','Color palettes','Designer tips','AI chat (5 messages/day)'],
    cta: 'Get Started Free', href: '/create',
  },
  {
    name: 'Pro', price: '$19', period: '/month', highlight: true,
    features: ['Unlimited AI designs','All 10 design styles','HD quality output','Before/After comparison','Unlimited AI consultant','Furniture upload (5 items)','Priority generation','Commercial usage rights','Download designs'],
    cta: 'Start Pro Today', href: '/create',
  },
  {
    name: 'Studio', price: '$49', period: '/month', highlight: false,
    features: ['Everything in Pro','5 team seats','White-label exports','API access (500 calls/mo)','Custom style presets','Client presentation mode','Priority support','Advanced analytics'],
    cta: 'Contact Sales', href: '/create',
  },
]

const FAQS = [
  { q: 'Do I need design experience?', a: 'Not at all. RoomGenie AI handles all the design work — just describe what you want and let Claude AI do the rest.' },
  { q: 'Can I upload my own furniture?', a: 'Yes! Pro and Studio plans allow you to upload furniture images and the AI will incorporate them into your design.' },
  { q: 'How long does generation take?', a: 'Most designs are generated in 5–10 seconds. Complex designs with furniture uploads may take slightly longer.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. No lock-in contracts. Cancel or downgrade at any time from your dashboard.' },
]

export default function PricingPage() {
  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#f8faff', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e8eaf0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>R</div>
            <span style={{ fontWeight: 800, fontSize: 17, color: '#1a1a2e' }}>RoomGenie AI</span>
          </Link>
          <Link href="/create" style={{ background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', padding: '9px 22px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Start for Free</Link>
        </div>
      </nav>

      <div style={{ paddingTop: 100, maxWidth: 1280, margin: '0 auto', padding: '100px 24px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-block', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: '#4f7cff', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>Pricing</div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 900, letterSpacing: '-2px', color: '#0f172a', marginBottom: 16, lineHeight: 1.05 }}>Simple, Transparent Pricing</h1>
          <p style={{ fontSize: 18, color: '#64748b', maxWidth: 500, margin: '0 auto' }}>Start free. Upgrade when you need more power.</p>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, alignItems: 'center', maxWidth: 1000, margin: '0 auto 80px' }}>
          {PLANS.map(p => (
            <div key={p.name} style={{
              borderRadius: 24, padding: '36px 32px',
              background: p.highlight ? 'linear-gradient(145deg,#1e1b4b,#1a1a2e)' : 'white',
              border: p.highlight ? 'none' : '1px solid #e8eaf0',
              color: p.highlight ? 'white' : '#0f172a',
              transform: p.highlight ? 'scale(1.05)' : 'scale(1)',
              boxShadow: p.highlight ? '0 24px 60px rgba(79,124,255,0.25)' : '0 4px 20px rgba(0,0,0,0.06)',
              position: 'relative', display: 'flex', flexDirection: 'column',
            }}>
              {p.highlight && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 11, fontWeight: 800, padding: '5px 18px', borderRadius: 100, whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>MOST POPULAR</div>}
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>{p.name}</h2>
              <div style={{ marginBottom: 28 }}>
                <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-2px' }}>{p.price}</span>
                <span style={{ fontSize: 15, color: p.highlight ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>{p.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: p.highlight ? 'rgba(255,255,255,0.75)' : '#374151', lineHeight: 1.5 }}>
                    <span style={{ color: p.highlight ? '#818cf8' : '#16a34a', fontWeight: 800, flexShrink: 0, fontSize: 15 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} style={{
                display: 'block', textAlign: 'center', textDecoration: 'none', padding: '14px', borderRadius: 14, fontWeight: 800, fontSize: 15,
                background: p.highlight ? 'linear-gradient(135deg,#4f7cff,#7c3aed)' : 'white',
                border: p.highlight ? 'none' : '1.5px solid #e2e8f0',
                color: p.highlight ? 'white' : '#374151',
                boxShadow: p.highlight ? '0 8px 24px rgba(79,124,255,0.4)' : 'none',
                transition: 'all 0.2s',
              }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>{p.cta}</Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', marginBottom: 36, textAlign: 'center' }}>FAQs</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FAQS.map(f => (
              <div key={f.q} style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: '20px 24px' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{f.q}</p>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

