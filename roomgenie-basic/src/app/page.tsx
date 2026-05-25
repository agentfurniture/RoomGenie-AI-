export default function Home() {
  const roomGraphics = [
    {
      title: 'Modern living room',
      style: 'AI redesign',
      src: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=85',
    },
    {
      title: 'Luxury bedroom',
      style: 'Soft retreat',
      src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85',
    },
    {
      title: 'Bright kitchen',
      style: 'Clean function',
      src: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=85',
    },
  ]

  const styleGraphics = [
    {
      label: 'Modern',
      src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
    },
    {
      label: 'Luxury',
      src: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85',
    },
    {
      label: 'Minimalist',
      src: 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&w=900&q=85',
    },
    {
      label: 'Scandinavian',
      src: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=85',
    },
  ]

  return (
    <main className="min-h-screen" style={{ background: '#06080f', color: 'white' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(6,8,15,0.7)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #4f7cff, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, boxShadow: '0 0 20px rgba(79,124,255,0.4)',
            }}>✦</div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>RoomGenie AI</span>
          </a>

          {/* Links */}
          <div style={{ display: 'flex', gap: 32, fontSize: 14, color: 'rgba(255,255,255,0.55)' }} className="hidden md:flex">
            {['Features', 'How It Works', 'Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.color = 'white')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              >{l}</a>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 14, cursor: 'pointer', padding: '8px 16px', borderRadius: 10 }}>
              Sign In
            </button>
            <button style={{
              background: 'linear-gradient(135deg, #4f7cff, #8b5cf6)',
              border: 'none', color: 'white', fontSize: 14, fontWeight: 700,
              padding: '10px 22px', borderRadius: 12, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(79,124,255,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(79,124,255,0.45)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,124,255,0.35)'; }}
            >
              Start Free →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 60px', overflow: 'hidden' }}>

        {/* Background glows */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse, rgba(79,124,255,0.13) 0%, transparent 65%)', pointerEvents: 'none', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '40%', left: '20%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '30%', right: '15%', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(79,200,255,0.06) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />

        {/* Floating particles */}
        {[
          { top: '25%', left: '10%', size: 6, color: '#4f7cff', delay: '0s' },
          { top: '60%', left: '8%', size: 4, color: '#8b5cf6', delay: '1s' },
          { top: '35%', right: '12%', size: 5, color: '#4f7cff', delay: '0.5s' },
          { top: '70%', right: '10%', size: 4, color: '#c084fc', delay: '1.5s' },
          { top: '15%', left: '35%', size: 3, color: '#60a5fa', delay: '2s' },
          { top: '80%', left: '45%', size: 4, color: '#818cf8', delay: '0.8s' },
        ].map((p, i) => (
          <div key={i} className="animate-float" style={{
            position: 'absolute', width: p.size, height: p.size, borderRadius: '50%',
            background: p.color, opacity: 0.6, animationDelay: p.delay,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            ...('right' in p ? { right: p.right } : { left: p.left }), top: p.top,
          }} />
        ))}

        {/* Badge */}
        <div className="animate-slide-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.25)',
          borderRadius: 100, padding: '6px 16px', fontSize: 13, color: 'rgba(255,255,255,0.75)',
          marginBottom: 28, backdropFilter: 'blur(10px)',
        }}>
          <span style={{ color: '#fbbf24', fontSize: 14 }}>⚡</span>
          Powered by GPT-Image-1 &nbsp;·&nbsp; Photorealistic renders in 10 seconds
        </div>

        {/* Headline */}
        <h1 className="animate-slide-up" style={{ fontSize: 'clamp(40px, 6.5vw, 80px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2.5px', maxWidth: 900, marginBottom: 24, animationDelay: '0.1s' }}>
          <span style={{ background: 'linear-gradient(135deg, #fff 0%, #c0d0ff 60%, #d8b4fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Transform Any Room
          </span>
          <br />
          <span style={{ color: 'white' }}>Into A Designer Space</span>
          <br />
          <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Using AI
          </span>
        </h1>

        {/* Sub */}
        <p className="animate-slide-up" style={{ fontSize: 19, color: 'rgba(255,255,255,0.45)', maxWidth: 560, lineHeight: 1.7, marginBottom: 36, animationDelay: '0.2s' }}>
          Upload your room photo, choose a style, and get a photorealistic redesign instantly.
          No design skills. No software. Just stunning results.
        </p>

        {/* CTAs */}
        <div className="animate-slide-up" style={{ display: 'flex', gap: 14, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center', animationDelay: '0.3s' }}>
          <button style={{
            background: 'linear-gradient(135deg, #4f7cff, #8b5cf6)',
            border: 'none', color: 'white', fontSize: 16, fontWeight: 700,
            padding: '16px 36px', borderRadius: 16, cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(79,124,255,0.4)',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(79,124,255,0.5)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(79,124,255,0.4)'; }}
          >
            ✦ &nbsp;Start Designing Free
          </button>
          <button style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 600,
            padding: '16px 32px', borderRadius: 16, cursor: 'pointer', backdropFilter: 'blur(10px)',
            transition: 'background 0.2s, color 0.2s, border-color 0.2s',
          }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            ▶ &nbsp;Watch Demo
          </button>
        </div>

        {/* Trust badges */}
        <div className="animate-slide-up" style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 60, animationDelay: '0.35s' }}>
          <span>⭐⭐⭐⭐⭐ &nbsp;4.9/5 rating</span>
          <span style={{ color: 'rgba(255,255,255,0.12)' }}>|</span>
          <span>🔒 No credit card</span>
          <span style={{ color: 'rgba(255,255,255,0.12)' }}>|</span>
          <span>🎁 3 free renders/month</span>
          <span style={{ color: 'rgba(255,255,255,0.12)' }}>|</span>
          <span>⚡ 10,000+ rooms designed</span>
        </div>

        {/* Hero Visual — Before/After */}
        <div className="roomgenie-graphic-grid animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {roomGraphics.map((room, index) => (
            <article key={room.title} className={`roomgenie-graphic-card ${index === 0 ? 'is-featured' : ''}`}>
              <img src={room.src} alt={`${room.title} interior design preview`} loading={index === 0 ? 'eager' : 'lazy'} />
              <div className="roomgenie-graphic-overlay">
                <span>{room.style}</span>
                <h3>{room.title}</h3>
              </div>
            </article>
          ))}
        </div>

        <div className="animate-slide-up" style={{ width: '100%', maxWidth: 1100, animationDelay: '0.45s', position: 'relative' }}>
          {/* Glow behind card */}
          <div style={{ position: 'absolute', inset: '-2px', background: 'linear-gradient(135deg, rgba(79,124,255,0.3), rgba(139,92,246,0.2), rgba(79,124,255,0.1))', borderRadius: 28, filter: 'blur(1px)', zIndex: 0 }} />

          <div style={{
            position: 'relative', zIndex: 1,
            borderRadius: 26, overflow: 'hidden',
            background: 'linear-gradient(145deg, #0d1528 0%, #080e1e 50%, #0a0c18 100%)',
            border: '1px solid rgba(79,124,255,0.2)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
          }}>
            {/* App chrome bar */}
            <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ff5f57', '#ffbd2e', '#28ca41'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', maxWidth: 320, margin: '0 auto' }}>
                roomgenie.ai/create
              </div>
            </div>

            {/* Before / After split */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, position: 'relative' }}>

              {/* BEFORE */}
              <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #1a1008 0%, #0f0a04 100%)' }} />
                {/* Rough room illustration */}
                <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%', position: 'absolute' }}>
                  {/* Floor */}
                  <rect x="0" y="200" width="400" height="100" fill="#2a1e10" />
                  {/* Back wall */}
                  <rect x="0" y="0" width="400" height="210" fill="#1e1408" />
                  {/* Side wall shadow */}
                  <polygon points="0,0 80,40 80,260 0,300" fill="#16100600" />
                  {/* Window */}
                  <rect x="140" y="30" width="120" height="90" fill="#1a2a3a" rx="3" />
                  <rect x="145" y="35" width="52" height="80" fill="#1e3550" />
                  <rect x="200" y="35" width="55" height="80" fill="#1e3550" />
                  <line x1="197" y1="35" x2="197" y2="115" stroke="#2a4a6a" strokeWidth="6" />
                  <line x1="145" y1="75" x2="258" y2="75" stroke="#2a4a6a" strokeWidth="4" />
                  {/* Old sofa */}
                  <rect x="60" y="170" width="200" height="60" fill="#4a3520" rx="4" />
                  <rect x="60" y="145" width="200" height="35" fill="#5a4228" rx="4" />
                  <rect x="60" y="145" width="22" height="85" fill="#4a3520" rx="3" />
                  <rect x="238" y="145" width="22" height="85" fill="#4a3520" rx="3" />
                  {/* Floor lamp */}
                  <rect x="295" y="100" width="4" height="105" fill="#3a3030" />
                  <ellipse cx="297" cy="98" rx="20" ry="12" fill="#4a3a30" />
                  {/* Old table */}
                  <rect x="130" y="230" width="80" height="10" fill="#3a2a18" rx="2" />
                  <rect x="135" y="240" width="6" height="25" fill="#3a2a18" />
                  <rect x="199" y="240" width="6" height="25" fill="#3a2a18" />
                  {/* Worn carpet */}
                  <ellipse cx="200" cy="245" rx="120" ry="25" fill="#2a1e14" opacity="0.7" />
                  {/* Cracks on wall */}
                  <line x1="30" y1="20" x2="45" y2="60" stroke="#2a1e0e" strokeWidth="1" />
                  <line x1="350" y1="50" x2="360" y2="100" stroke="#2a1e0e" strokeWidth="1" />
                </svg>
                {/* Overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 70%, #080e1e 100%)' }} />
                {/* Label */}
                <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', letterSpacing: '0.5px' }}>
                  BEFORE
                </div>
              </div>

              {/* DIVIDER */}
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, transparent, rgba(79,124,255,0.8), transparent)', zIndex: 10, transform: 'translateX(-50%)' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4f7cff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, boxShadow: '0 0 20px rgba(79,124,255,0.6)' }}>✦</div>
              </div>

              {/* AFTER */}
              <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #0a1428 0%, #060d20 100%)' }} />
                {/* Luxury room illustration */}
                <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%', position: 'absolute' }}>
                  {/* Floor - marble */}
                  <defs>
                    <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1a1e2e" />
                      <stop offset="100%" stopColor="#0d1020" />
                    </linearGradient>
                    <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d1530" />
                      <stop offset="100%" stopColor="#08101e" />
                    </linearGradient>
                    <linearGradient id="sofaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2a3a6a" />
                      <stop offset="100%" stopColor="#1a2a50" />
                    </linearGradient>
                    <linearGradient id="lampGlow" x1="0.5" y1="0" x2="0.5" y2="1">
                      <stop offset="0%" stopColor="#ffe4a0" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#ffe4a0" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id="ceilLight" cx="50%" cy="0%" r="60%">
                      <stop offset="0%" stopColor="rgba(255,220,150,0.12)" />
                      <stop offset="100%" stopColor="rgba(255,220,150,0)" />
                    </radialGradient>
                  </defs>
                  {/* Walls */}
                  <rect x="0" y="0" width="400" height="300" fill="url(#wallGrad)" />
                  {/* Ceiling light effect */}
                  <ellipse cx="200" cy="10" rx="200" ry="100" fill="url(#ceilLight)" />
                  {/* Floor */}
                  <rect x="0" y="205" width="400" height="95" fill="url(#floorGrad)" />
                  {/* Floor lines (tile) */}
                  {[0,80,160,240,320].map(x => <line key={x} x1={x} y1="205" x2={x + 40} y2="300" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
                  <line x1="0" y1="240" x2="400" y2="240" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  {/* Large window with glow */}
                  <rect x="110" y="20" width="180" height="140" fill="#0a1828" rx="6" />
                  <rect x="116" y="26" width="82" height="128" fill="#0e2040" />
                  <rect x="202" y="26" width="82" height="128" fill="#0e2040" />
                  {/* Window light rays */}
                  <polygon points="116,26 198,26 150,205 90,205" fill="rgba(100,160,255,0.04)" />
                  <polygon points="202,26 284,26 310,205 240,205" fill="rgba(100,160,255,0.04)" />
                  {/* Window cross */}
                  <line x1="198" y1="26" x2="198" y2="154" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
                  <line x1="116" y1="90" x2="284" y2="90" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                  {/* Curtains */}
                  <path d="M 108 16 Q 90 80 95 160 L 110 160 L 110 16 Z" fill="rgba(80,90,160,0.35)" />
                  <path d="M 292 16 Q 310 80 305 160 L 290 160 L 290 16 Z" fill="rgba(80,90,160,0.35)" />
                  {/* Modern sofa */}
                  <rect x="55" y="175" width="210" height="55" fill="url(#sofaGrad)" rx="6" />
                  <rect x="55" y="155" width="210" height="30" fill="#2e4070" rx="5" />
                  <rect x="55" y="155" width="18" height="75" fill="#263660" rx="4" />
                  <rect x="247" y="155" width="18" height="75" fill="#263660" rx="4" />
                  {/* Sofa cushions */}
                  <rect x="73" y="158" width="60" height="24" fill="#344880" rx="4" />
                  <rect x="140" y="158" width="60" height="24" fill="#344880" rx="4" />
                  <rect x="207" y="158" width="40" height="24" fill="#344880" rx="4" opacity="0.8" />
                  {/* Coffee table */}
                  <rect x="120" y="228" width="120" height="8" fill="#c8a070" rx="3" />
                  <rect x="125" y="236" width="8" height="20" fill="#b89060" rx="2" />
                  <rect x="227" y="236" width="8" height="20" fill="#b89060" rx="2" />
                  {/* Table items */}
                  <circle cx="160" cy="226" r="6" fill="#2a4080" opacity="0.8" />
                  <rect x="175" y="221" width="30" height="4" fill="rgba(255,255,255,0.2)" rx="2" />
                  <rect x="175" y="227" width="22" height="3" fill="rgba(255,255,255,0.12)" rx="2" />
                  {/* Floor lamp */}
                  <rect x="304" y="90" width="3" height="120" fill="#8a8aaa" />
                  <ellipse cx="305.5" cy="88" rx="16" ry="9" fill="#6a6a9a" />
                  <ellipse cx="305.5" cy="86" rx="12" ry="6" fill="#ffe4a0" opacity="0.7" />
                  {/* Lamp glow */}
                  <ellipse cx="305" cy="130" rx="60" ry="80" fill="url(#lampGlow)" />
                  {/* Plant */}
                  <rect x="32" y="210" width="20" height="25" fill="#3a2a20" rx="2" />
                  <ellipse cx="42" cy="205" rx="22" ry="26" fill="#1a4020" />
                  <ellipse cx="32" cy="215" rx="14" ry="16" fill="#224a28" />
                  <ellipse cx="52" cy="210" rx="14" ry="18" fill="#1e4822" />
                  {/* Wall art */}
                  <rect x="310" y="40" width="60" height="80" fill="#0d1830" rx="4" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <ellipse cx="340" cy="80" rx="20" ry="25" fill="rgba(79,124,255,0.3)" />
                  <ellipse cx="340" cy="75" rx="12" ry="14" fill="rgba(139,92,246,0.25)" />
                  {/* Rug */}
                  <ellipse cx="195" cy="250" rx="130" ry="22" fill="rgba(79,100,180,0.2)" />
                  <ellipse cx="195" cy="250" rx="110" ry="17" fill="rgba(79,100,180,0.1)" stroke="rgba(79,124,255,0.2)" strokeWidth="1" />
                </svg>
                {/* Overlay left edge */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, transparent 70%, #080e1e 100%)' }} />
                {/* AI label */}
                <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(79,124,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: '#a0b4ff', border: '1px solid rgba(79,124,255,0.3)', letterSpacing: '0.5px' }}>
                  ✦ AI REDESIGN
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 20 }}>
                {[{ icon: '🎨', label: 'Style: Modern Luxury' }, { icon: '⚡', label: 'Generated in 8.3s' }, { icon: '✓', label: 'HD 1536px' }].map(b => (
                  <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    <span>{b.icon}</span> {b.label}
                  </div>
                ))}
              </div>
              <button style={{ background: 'linear-gradient(135deg, #4f7cff, #8b5cf6)', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, padding: '7px 18px', borderRadius: 8, cursor: 'pointer' }}>
                ⬇ Download
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-block', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: '#818cf8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
            How It Works
          </div>
          <h2 style={{ fontSize: 'clamp(30px,4vw,52px)', fontWeight: 900, letterSpacing: '-1.5px', color: 'white' }}>Design in 3 simple steps</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            { num: '01', icon: '📸', title: 'Upload Room Photo', desc: 'Take or upload a photo of your room. Any angle, any lighting — our AI understands the space.' },
            { num: '02', icon: '🎨', title: 'Pick a Design Style', desc: 'Choose from 8 stunning styles. Modern, Luxury, Scandinavian, Bohemian, Industrial, and more.' },
            { num: '03', icon: '✨', title: 'Get AI Render', desc: 'Receive a photorealistic redesign in under 10 seconds. Download in HD and share anywhere.' },
          ].map((s, i) => (
            <div key={i} className="card-hover" style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 24, padding: '36px 32px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 20, right: 24, fontSize: 70, fontWeight: 900, background: 'linear-gradient(135deg, rgba(79,124,255,0.2), rgba(139,92,246,0.05))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1, userSelect: 'none' }}>
                {s.num}
              </div>
              <div style={{ fontSize: 44, marginBottom: 20 }}>{s.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 10, letterSpacing: '-0.4px' }}>{s.title}</h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-block', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: '#818cf8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
            Features
          </div>
          <h2 style={{ fontSize: 'clamp(30px,4vw,52px)', fontWeight: 900, letterSpacing: '-1.5px', color: 'white', marginBottom: 14 }}>Everything you need to design</h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)', maxWidth: 480, margin: '0 auto' }}>Professional AI interior design tools — no experience required.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {[
            { icon: '🏠', title: 'Any Room Type', desc: 'Bedrooms, living rooms, kitchens, bathrooms, home offices — all fully supported.' },
            { icon: '⚡', title: 'Renders in 10 Seconds', desc: 'Powered by GPT-Image-1. Photorealistic results faster than making coffee.' },
            { icon: '🎨', title: '8 Design Styles', desc: 'Modern, Luxury, Minimalist, Scandinavian, Industrial, Classic, Bohemian, Japanese.' },
            { icon: '💬', title: 'AI Design Consultant', desc: 'Chat with our AI for personalized advice on colors, furniture, and layout.' },
            { icon: '⬇️', title: 'HD Downloads', desc: 'Download renders at 1536×1024 resolution. Ready to share with contractors or social media.' },
            { icon: '🔄', title: 'Unlimited Iterations', desc: 'Tweak the prompt and regenerate as many times as you want until it\'s perfect.' },
          ].map((f, i) => (
            <div key={i} className="card-hover" style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, padding: '28px 26px',
            }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STYLES GRID ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(28px,3.5vw,46px)', fontWeight: 900, letterSpacing: '-1.5px', color: 'white', marginBottom: 10 }}>8 stunning design styles</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }}>Each style is crafted with precise AI prompts for authentic results</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { emoji: '🏙️', label: 'Modern', color: 'rgba(79,124,255,0.15)', border: 'rgba(79,124,255,0.25)' },
            { emoji: '✨', label: 'Luxury', color: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' },
            { emoji: '⬜', label: 'Minimalist', color: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
            { emoji: '🌿', label: 'Scandinavian', color: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
            { emoji: '🏗️', label: 'Industrial', color: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)' },
            { emoji: '🏛️', label: 'Classic', color: 'rgba(180,130,60,0.12)', border: 'rgba(180,130,60,0.25)' },
            { emoji: '🎨', label: 'Bohemian', color: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)' },
            { emoji: '🎋', label: 'Japanese', color: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
          ].map((s, i) => (
            <div key={i} className="card-hover" style={{
              background: s.color, border: `1px solid ${s.border}`,
              borderRadius: 18, padding: '24px 20px', textAlign: 'center', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{s.emoji}</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <div className="style-image-grid">
          {styleGraphics.map((style) => (
            <article key={style.label} className="card-hover style-image-card">
              <img src={style.src} alt={`${style.label} interior design style`} loading="lazy" />
              <div>
                <p>{style.label}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-block', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: '#818cf8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
            Pricing
          </div>
          <h2 style={{ fontSize: 'clamp(30px,4vw,52px)', fontWeight: 900, letterSpacing: '-1.5px', color: 'white', marginBottom: 12 }}>Simple, transparent pricing</h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)' }}>Start free. Upgrade when you need more.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'center' }}>
          {[
            { name: 'Free', price: '$0', period: '/month', features: ['3 AI renders/month', 'Basic design styles', 'Standard quality', '5 AI chat messages', 'Download renders'], cta: 'Get Started Free', highlight: false },
            { name: 'Pro', price: '$19', period: '/month', features: ['Unlimited AI renders', 'All 8 design styles', 'HD 1536px quality', 'Unlimited AI chat', 'Priority queue', 'Commercial usage rights'], cta: 'Start Pro', highlight: true },
            { name: 'Studio', price: '$49', period: '/month', features: ['Everything in Pro', '5 team members', 'White-label exports', 'API access (500 calls)', 'Priority support', 'Custom style presets'], cta: 'Start Studio', highlight: false },
          ].map((plan, i) => (
            <div key={i} style={{
              borderRadius: 24, padding: '36px 32px',
              background: plan.highlight ? 'white' : 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.07)',
              color: plan.highlight ? 'black' : 'white',
              transform: plan.highlight ? 'scale(1.04)' : 'scale(1)',
              boxShadow: plan.highlight ? '0 30px 80px rgba(0,0,0,0.4)' : 'none',
              position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}>
              {plan.highlight && (
                <div style={{ position: 'absolute', top: 20, right: 20, background: 'black', color: 'white', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 100, letterSpacing: '0.5px' }}>POPULAR</div>
              )}
              <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4, color: plan.highlight ? 'black' : 'white' }}>{plan.name}</h3>
              <div style={{ marginBottom: 28 }}>
                <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-2px', color: plan.highlight ? 'black' : 'white' }}>{plan.price}</span>
                <span style={{ fontSize: 15, color: plan.highlight ? '#666' : 'rgba(255,255,255,0.4)' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', marginBottom: 28, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: plan.highlight ? '#444' : 'rgba(255,255,255,0.6)' }}>
                    <span style={{ color: plan.highlight ? '#4f7cff' : '#4ade80', fontWeight: 700, fontSize: 16 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button style={{
                width: '100%', padding: '14px', borderRadius: 14, fontWeight: 800, fontSize: 15,
                background: plan.highlight ? 'linear-gradient(135deg, #4f7cff, #8b5cf6)' : 'rgba(255,255,255,0.07)',
                border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)',
                color: plan.highlight ? 'white' : 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                boxShadow: plan.highlight ? '0 8px 24px rgba(79,124,255,0.4)' : 'none',
                transition: 'transform 0.15s',
              }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >{plan.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ position: 'relative', borderRadius: 32, overflow: 'hidden', padding: '80px 48px', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(79,124,255,0.15) 0%, rgba(139,92,246,0.12) 50%, rgba(79,124,255,0.08) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(79,124,255,0.2)', borderRadius: 32 }} />
          {/* Glowing orb */}
          <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 200, background: 'radial-gradient(ellipse, rgba(79,124,255,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, letterSpacing: '-1.5px', color: 'white', marginBottom: 14, lineHeight: 1.1 }}>
              Ready to transform<br />your space?
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', marginBottom: 36, maxWidth: 440, margin: '0 auto 36px' }}>
              Join 10,000+ homeowners and designers using RoomGenie AI to visualize their dream spaces.
            </p>
            <button style={{
              background: 'linear-gradient(135deg, #4f7cff, #8b5cf6)',
              border: 'none', color: 'white', fontSize: 16, fontWeight: 800,
              padding: '18px 44px', borderRadius: 16, cursor: 'pointer',
              boxShadow: '0 10px 40px rgba(79,124,255,0.45)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              display: 'inline-block',
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 16px 50px rgba(79,124,255,0.55)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(79,124,255,0.45)'; }}
            >
              Start Designing Free →
            </button>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>
              ✓ No credit card &nbsp;·&nbsp; 3 free renders &nbsp;·&nbsp; Takes 30 seconds to start
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #4f7cff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✦</div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>RoomGenie AI</span>
          </div>
          <div style={{ display: 'flex', gap: 28, fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
            {['Features', 'Pricing', 'How It Works'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}
                onMouseOver={e => e.currentTarget.style.color = 'white'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >{l}</a>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>© 2026 RoomGenie AI</p>
        </div>
      </footer>

    </main>
  )
}
