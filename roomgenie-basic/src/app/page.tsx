export default function Home() {
  return (
    <main className="min-h-screen bg-[#080c18] text-white">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080c18]/80 backdrop-blur-md border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm">✦</div>
            <span className="font-bold text-lg tracking-tight">RoomGenie AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
              Sign In
            </button>
            <button className="bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-violet-600/8 rounded-full blur-[100px] pointer-events-none" />

        {/* Badge */}
        <div className="relative inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-300 mb-8">
          <span className="text-yellow-400">⚡</span>
          Powered by GPT-Image-1 — Renders in under 10 seconds
        </div>

        {/* Headline */}
        <h1 className="relative text-5xl md:text-7xl font-black max-w-5xl leading-[1.05] tracking-tight mb-6">
          <span className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
            Transform Any Room
          </span>
          <br />
          <span className="text-white">Into A Designer Space</span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Using AI
          </span>
        </h1>

        {/* Sub */}
        <p className="relative text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed mb-10">
          Upload your room photo, choose a style, and get a photorealistic redesign in seconds.
          No design skills needed. No software to install.
        </p>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row gap-4 mb-12">
          <button className="flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-bold text-base hover:bg-gray-100 transition-all hover:scale-105 shadow-xl shadow-white/10">
            Start Designing Free →
          </button>
          <button className="flex items-center justify-center gap-2 border border-white/15 text-gray-300 px-8 py-4 rounded-2xl font-medium text-base hover:border-white/30 hover:text-white transition-all">
            Watch Demo
          </button>
        </div>

        {/* Social proof */}
        <div className="relative flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 mb-16">
          <span>⭐⭐⭐⭐⭐ 4.9/5 from 2,000+ users</span>
          <span className="text-gray-700">•</span>
          <span>No credit card required</span>
          <span className="text-gray-700">•</span>
          <span>3 free renders/month</span>
        </div>

        {/* Hero image mockup */}
        <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/20">
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c18] via-transparent to-transparent z-10 pointer-events-none" />
          <div className="w-full aspect-[16/7] bg-gradient-to-br from-[#0d1a3a] via-[#0a1428] to-[#050a18] flex items-center justify-center relative overflow-hidden">
            {/* Fake room render */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 to-violet-950/30" />
            <div className="relative z-10 text-center">
              <div className="text-8xl mb-4">🛋️</div>
              <p className="text-gray-500 text-sm">AI-Generated Room Render Preview</p>
            </div>
            {/* Floating UI badges */}
            <div className="absolute bottom-6 left-6 z-20 bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <div>
                  <p className="text-xs text-gray-400">AI Render Complete</p>
                  <p className="text-sm font-semibold text-white">Modern Living Room</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 right-6 z-20 bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl px-4 py-3">
              <p className="text-xs text-gray-400">Generated in</p>
              <p className="text-sm font-bold text-white">8.3 seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-4xl md:text-5xl font-black text-white">Design in 3 simple steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { num: '01', icon: '📸', title: 'Upload Room Photo', desc: 'Take or upload a photo of your existing room. Any angle, any lighting — our AI handles it.' },
            { num: '02', icon: '🎨', title: 'Choose Your Style', desc: 'Pick from 8 design styles: Modern, Luxury, Scandinavian, Industrial, Bohemian and more.' },
            { num: '03', icon: '✨', title: 'Get Your AI Render', desc: 'Receive a photorealistic redesign of your room in under 10 seconds. Download and share.' },
          ].map((s) => (
            <div key={s.num} className="bg-white/3 border border-white/8 rounded-3xl p-8 relative overflow-hidden hover:border-white/18 transition-colors">
              <div className="absolute top-4 right-5 text-6xl font-black text-white/4 select-none">{s.num}</div>
              <div className="text-4xl mb-5">{s.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl md:text-5xl font-black text-white">Everything you need</h2>
          <p className="text-gray-400 mt-4 text-lg max-w-xl mx-auto">Professional AI interior design — no experience required.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '🏠', title: 'Any Room Type', desc: 'Bedrooms, living rooms, kitchens, bathrooms, home offices — all supported.' },
            { icon: '⚡', title: 'Renders in 10 Seconds', desc: 'Powered by GPT-Image-1. Get photorealistic results faster than making a coffee.' },
            { icon: '🎨', title: '8 Design Styles', desc: 'Modern, Luxury, Minimalist, Scandinavian, Industrial, Classic, Bohemian, Japanese.' },
            { icon: '💬', title: 'AI Design Consultant', desc: 'Chat with our AI for personalized advice on colors, furniture, and layout.' },
            { icon: '⬇️', title: 'High-Res Downloads', desc: 'Download your renders at 1536×1024. Ready to share with contractors or on social media.' },
            { icon: '🔄', title: 'Unlimited Iterations', desc: 'Not satisfied? Tweak your prompt and regenerate until it\'s perfect.' },
          ].map((f) => (
            <div key={f.title} className="bg-white/3 border border-white/8 rounded-3xl p-7 hover:border-white/18 transition-colors">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STYLES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Design Styles</p>
          <h2 className="text-4xl md:text-5xl font-black text-white">8 styles to choose from</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Modern', emoji: '🏙️', color: 'from-blue-900/40 to-blue-800/20' },
            { label: 'Luxury', emoji: '✨', color: 'from-yellow-900/40 to-yellow-800/20' },
            { label: 'Minimalist', emoji: '⬜', color: 'from-gray-800/60 to-gray-700/20' },
            { label: 'Scandinavian', emoji: '🌿', color: 'from-green-900/40 to-green-800/20' },
            { label: 'Industrial', emoji: '🏗️', color: 'from-orange-900/40 to-orange-800/20' },
            { label: 'Classic', emoji: '🏛️', color: 'from-amber-900/40 to-amber-800/20' },
            { label: 'Bohemian', emoji: '🎨', color: 'from-pink-900/40 to-pink-800/20' },
            { label: 'Japanese', emoji: '🎋', color: 'from-emerald-900/40 to-emerald-800/20' },
          ].map((style) => (
            <div key={style.label} className={`bg-gradient-to-br ${style.color} border border-white/8 rounded-2xl p-6 text-center hover:border-white/25 hover:scale-[1.03] transition-all cursor-pointer`}>
              <div className="text-4xl mb-3">{style.emoji}</div>
              <p className="font-semibold text-white text-sm">{style.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-black text-white">Simple pricing</h2>
          <p className="text-gray-400 mt-4 text-lg">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-center">
          {[
            {
              name: 'Free', price: '$0', period: '/month',
              features: ['3 AI renders/month', 'Basic styles', 'Standard quality', '5 AI chat messages'],
              cta: 'Get Started', highlight: false,
            },
            {
              name: 'Pro', price: '$19', period: '/month',
              features: ['Unlimited renders', 'All 8 styles', 'HD 1536px quality', 'Unlimited AI chat', 'Priority queue', 'Commercial rights'],
              cta: 'Start Pro', highlight: true,
            },
            {
              name: 'Studio', price: '$49', period: '/month',
              features: ['Everything in Pro', '5 team seats', 'White-label exports', 'API access', 'Priority support', 'Custom presets'],
              cta: 'Start Studio', highlight: false,
            },
          ].map((plan) => (
            <div key={plan.name} className={`rounded-3xl p-8 border flex flex-col ${plan.highlight ? 'bg-white text-black border-white scale-[1.03] shadow-2xl shadow-white/10' : 'bg-white/3 border-white/10 text-white'}`}>
              {plan.highlight && (
                <div className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full self-start mb-4">Most Popular</div>
              )}
              <h3 className={`text-2xl font-black mb-1 ${plan.highlight ? 'text-black' : 'text-white'}`}>{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? 'text-gray-500' : 'text-gray-400'}`}>{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-gray-700' : 'text-gray-300'}`}>
                    <span className={plan.highlight ? 'text-black' : 'text-green-400'}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3.5 rounded-2xl font-bold text-base transition-colors ${plan.highlight ? 'bg-black text-white hover:bg-gray-900' : 'bg-white text-black hover:bg-gray-100'}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="relative bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-white/10 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-violet-600/5 pointer-events-none" />
          <h2 className="relative text-4xl md:text-5xl font-black text-white mb-4">
            Ready to redesign your space?
          </h2>
          <p className="relative text-gray-400 text-lg mb-8">
            Join thousands of homeowners using RoomGenie AI.
          </p>
          <button className="relative bg-white text-black px-10 py-4 rounded-2xl font-bold text-base hover:bg-gray-100 transition-all hover:scale-105">
            Start Designing Free →
          </button>
          <p className="relative text-gray-600 text-sm mt-4">✓ No credit card required &nbsp;·&nbsp; 3 free renders/month</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/8 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs">✦</div>
            <span className="font-bold text-sm">RoomGenie AI</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
          </div>
          <p className="text-sm text-gray-600">© 2026 RoomGenie AI. All rights reserved.</p>
        </div>
      </footer>

    </main>
  )
}
