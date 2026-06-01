import Link from 'next/link'

export default function PricingPage() {
  const plans = [
    { name: 'Free', price: '$0', features: ['3 AI designs/month','All 8 styles','Color palettes','Designer tips','AI chat (5 msg/day)'], cta: 'Start Free', href: '/create', h: false },
    { name: 'Pro', price: '$19', features: ['Unlimited AI designs','Full Design Studio','Upload room photos','Furniture upload','Unlimited AI chat','Priority queue','Commercial rights'], cta: 'Start Pro', href: '/create', h: true },
    { name: 'Studio', price: '$49', features: ['Everything in Pro','5 team members','API access (500/mo)','White-label exports','Custom style presets','Priority support'], cta: 'Contact Sales', href: '/create', h: false },
  ]
  const faqs = [
    { q: 'Do I need design experience?', a: 'Not at all. Just describe what you want and Claude AI handles the rest.' },
    { q: 'Can I upload my own furniture?', a: 'Yes! The Full Design Studio allows you to upload furniture photos and the AI will incorporate them into your design.' },
    { q: 'How long does generation take?', a: 'Most designs are generated in 8–12 seconds. Complex designs may take slightly longer.' },
    { q: 'Can I cancel anytime?', a: 'Absolutely. No lock-in contracts. Cancel or downgrade at any time from your dashboard.' },
  ]

  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#f8faff', minHeight: '100vh' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e8eaf0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 17 }}>R</div>
            <span style={{ fontWeight: 800, fontSize: 17, color: '#0f172a' }}>RoomGenie AI</span>
          </Link>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/create" className="btn-primary" style={{ fontSize: 14, padding: '9px 20px' }}>Start Free</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 28px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-label">Pricing</div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,58px)', fontWeight: 900, letterSpacing: '-2px', color: '#0f172a', marginBottom: 14, lineHeight: 1.05 }}>Simple, Transparent Pricing</h1>
          <p style={{ fontSize: 18, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>Start free. Upgrade when you need more power.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, alignItems: 'center', marginBottom: 80 }}>
          {plans.map(p => (
            <div key={p.name} className={`price-card${p.h ? ' highlight' : ''}`} style={{ position: 'relative', transform: p.h ? 'scale(1.05)' : 'scale(1)' }}>
              {p.h && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 11, fontWeight: 800, padding: '5px 20px', borderRadius: 100, whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{p.name}</h2>
              <div style={{ marginBottom: 28 }}>
                <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-2px' }}>{p.price}</span>
                <span style={{ fontSize: 15, color: p.h ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: p.h ? 'rgba(255,255,255,0.75)' : '#374151', lineHeight: 1.4 }}>
                    <span style={{ color: p.h ? '#818cf8' : '#16a34a', fontWeight: 800, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} className={p.h ? 'btn-primary' : 'btn-secondary'} style={{ display: 'block', textAlign: 'center', padding: 14, borderRadius: 14, fontWeight: 800, fontSize: 15 }}>{p.cta}</Link>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', marginBottom: 32, textAlign: 'center' }}>FAQs</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqs.map(f => (
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
