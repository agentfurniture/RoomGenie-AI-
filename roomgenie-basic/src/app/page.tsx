const IMGS = {
  hero:        'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1400&q=85&auto=format&fit=crop',
  heroAfter:   'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1400&q=85&auto=format&fit=crop',
  modern:      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80&auto=format&fit=crop',
  luxury:      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80&auto=format&fit=crop',
  minimalist:  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80&auto=format&fit=crop',
  scandi:      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&auto=format&fit=crop',
  industrial:  'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=600&q=80&auto=format&fit=crop',
  classic:     'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=600&q=80&auto=format&fit=crop',
  bohemian:    'https://images.unsplash.com/photo-1522444195799-478538b28823?w=600&q=80&auto=format&fit=crop',
  japanese:    'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?w=600&q=80&auto=format&fit=crop',
  bedroom:     'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=80&auto=format&fit=crop',
  kitchen:     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=80&auto=format&fit=crop',
  bathroom:    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=700&q=80&auto=format&fit=crop',
  office:      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=700&q=80&auto=format&fit=crop',
}

// ─── Reusable inline styles ────────────────────────────────────────────────
const S = {
  sectionLabel: {
    display:'inline-block',background:'rgba(79,124,255,0.1)',
    border:'1px solid rgba(79,124,255,0.25)',borderRadius:100,
    padding:'5px 16px',fontSize:12,fontWeight:700,color:'#818cf8',
    letterSpacing:'1px',textTransform:'uppercase' as const,marginBottom:16,
  },
  sectionTitle: {
    fontSize:'clamp(30px,4vw,52px)' as string,fontWeight:900,
    letterSpacing:'-1.5px',color:'white',lineHeight:1.1,
  },
  card: {
    background:'linear-gradient(145deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.01) 100%)',
    border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,overflow:'hidden' as const,
    transition:'transform 0.25s ease,border-color 0.25s ease,box-shadow 0.25s ease',
  },
  btnPrimary: {
    background:'linear-gradient(135deg,#4f7cff,#8b5cf6)',border:'none',
    color:'white',fontWeight:800,borderRadius:14,cursor:'pointer',
    boxShadow:'0 8px 28px rgba(79,124,255,0.4)',
    transition:'transform 0.15s,box-shadow 0.15s',
  },
}

function hover(el: HTMLElement, on: boolean) {
  el.style.transform = on ? 'translateY(-4px)' : 'translateY(0)'
  el.style.borderColor = on ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'
  el.style.boxShadow = on ? '0 20px 50px rgba(0,0,0,0.35)' : 'none'
}

export default function Home() {
  return (
    <main style={{background:'#06080f',color:'white',minHeight:'100vh'}}>

      {/* ══ NAV ══ */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:200,
        background:'rgba(6,8,15,0.75)',backdropFilter:'blur(24px)',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 28px',height:66,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <a href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none',color:'white'}}>
            <div style={{width:36,height:36,borderRadius:11,background:'linear-gradient(135deg,#4f7cff,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,boxShadow:'0 0 22px rgba(79,124,255,0.45)'}}>✦</div>
            <span style={{fontWeight:900,fontSize:18,letterSpacing:'-0.3px'}}>RoomGenie AI</span>
          </a>
          <div style={{display:'flex',gap:32,fontSize:14,color:'rgba(255,255,255,0.5)'}} className="hidden md:flex">
            {[['Features','#features'],['Styles','#styles'],['Gallery','#gallery'],['Pricing','#pricing']].map(([l,h])=>(
              <a key={l} href={h} style={{textDecoration:'none',color:'inherit',transition:'color 0.2s'}}
                onMouseOver={e=>e.currentTarget.style.color='white'}
                onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>{l}</a>
            ))}
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <button style={{background:'none',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',fontSize:13,fontWeight:600,padding:'9px 20px',borderRadius:10,cursor:'pointer',transition:'all 0.2s'}}
              onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.25)';e.currentTarget.style.color='white'}}
              onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.color='rgba(255,255,255,0.6)'}}>
              Sign In
            </button>
            <button style={{...S.btnPrimary,fontSize:14,padding:'10px 24px'}}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(79,124,255,0.5)'}}
              onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 8px 28px rgba(79,124,255,0.4)'}}>
              Start Free →
            </button>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{position:'relative',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'130px 24px 60px',overflow:'hidden'}}>
        {/* BG image */}
        <div style={{position:'absolute',inset:0,zIndex:0}}>
          <img src={IMGS.hero} alt="" style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.08,filter:'saturate(0.5)'}} />
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,#06080f 0%,rgba(6,8,15,0.4) 40%,rgba(6,8,15,0.9) 80%,#06080f 100%)'}} />
        </div>
        {/* Glow */}
        <div style={{position:'absolute',top:'30%',left:'50%',transform:'translateX(-50%)',width:800,height:500,background:'radial-gradient(ellipse,rgba(79,124,255,0.15) 0%,transparent 65%)',pointerEvents:'none',borderRadius:'50%',zIndex:1}} />

        {/* Badge */}
        <div className="animate-fadeup" style={{position:'relative',zIndex:2,display:'inline-flex',alignItems:'center',gap:8,background:'rgba(79,124,255,0.12)',border:'1px solid rgba(79,124,255,0.3)',borderRadius:100,padding:'6px 18px',fontSize:13,color:'rgba(255,255,255,0.75)',marginBottom:28}}>
          <span style={{color:'#fbbf24'}}>⚡</span> Powered by GPT-Image-1 &nbsp;·&nbsp; Renders in 10 seconds
        </div>

        {/* Headline */}
        <h1 className="animate-fadeup" style={{position:'relative',zIndex:2,fontSize:'clamp(42px,6.5vw,82px)',fontWeight:900,lineHeight:1.04,letterSpacing:'-2.5px',maxWidth:900,marginBottom:22,animationDelay:'0.08s'}}>
          <span style={{background:'linear-gradient(135deg,#fff 0%,#c0cfff 55%,#d8b4fe 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Transform Any Room</span>
          <br/><span style={{color:'white'}}>Into A Designer Space</span>
          <br/><span style={{background:'linear-gradient(135deg,#60a5fa,#818cf8,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Using AI</span>
        </h1>

        <p className="animate-fadeup" style={{position:'relative',zIndex:2,fontSize:18,color:'rgba(255,255,255,0.45)',maxWidth:520,lineHeight:1.75,marginBottom:36,animationDelay:'0.16s'}}>
          Upload your room photo, choose a style, get a photorealistic redesign in seconds. No skills. No software. Just magic.
        </p>

        <div className="animate-fadeup" style={{position:'relative',zIndex:2,display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center',marginBottom:44,animationDelay:'0.24s'}}>
          <button style={{...S.btnPrimary,fontSize:16,padding:'16px 38px'}}
            onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.02)';e.currentTarget.style.boxShadow='0 14px 40px rgba(79,124,255,0.55)'}}
            onMouseOut={e=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 8px 28px rgba(79,124,255,0.4)'}}>
            ✦ &nbsp;Start Designing Free
          </button>
          <button style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.13)',color:'rgba(255,255,255,0.7)',fontSize:15,fontWeight:600,padding:'16px 32px',borderRadius:14,cursor:'pointer',backdropFilter:'blur(10px)',transition:'all 0.2s'}}
            onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.color='white'}}
            onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='rgba(255,255,255,0.7)'}}>
            ▶ &nbsp;Watch Demo
          </button>
        </div>

        <div className="animate-fadeup" style={{position:'relative',zIndex:2,display:'flex',gap:24,flexWrap:'wrap',justifyContent:'center',fontSize:13,color:'rgba(255,255,255,0.3)',marginBottom:64,animationDelay:'0.3s'}}>
          {['⭐ 4.9/5 from 2,000+ users','🔒 No credit card','🎁 3 free renders/month','⚡ 10,000+ rooms designed'].map(t=>(
            <span key={t}>{t}</span>
          ))}
        </div>

        {/* ── BEFORE / AFTER HERO IMAGE ── */}
        <div className="animate-fadeup" style={{position:'relative',zIndex:2,width:'100%',maxWidth:1100,animationDelay:'0.4s'}}>
          {/* Glow border */}
          <div style={{position:'absolute',inset:-1,borderRadius:26,background:'linear-gradient(135deg,rgba(79,124,255,0.5),rgba(139,92,246,0.3),rgba(79,124,255,0.2))',filter:'blur(1px)',zIndex:0}} />

          <div style={{position:'relative',zIndex:1,borderRadius:24,overflow:'hidden',border:'1px solid rgba(79,124,255,0.25)',boxShadow:'0 40px 100px rgba(0,0,0,0.7)'}}>
            {/* Browser bar */}
            <div style={{background:'#0d1120',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'12px 20px',display:'flex',alignItems:'center',gap:12}}>
              <div style={{display:'flex',gap:6}}>
                {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{width:11,height:11,borderRadius:'50%',background:c}}/>)}
              </div>
              <div style={{flex:1,maxWidth:280,margin:'0 auto',background:'rgba(255,255,255,0.05)',borderRadius:7,padding:'4px 14px',fontSize:12,color:'rgba(255,255,255,0.25)',textAlign:'center'}}>
                roomgenie.ai/results
              </div>
            </div>

            {/* Split images */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',position:'relative'}}>
              {/* BEFORE */}
              <div style={{position:'relative',overflow:'hidden',aspectRatio:'16/9'}}>
                <img src={IMGS.hero} alt="Before room" style={{width:'100%',height:'100%',objectFit:'cover',filter:'saturate(0.4) brightness(0.6)'}} />
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,transparent 60%,#0d1120 100%)'}} />
                <div style={{position:'absolute',top:14,left:14,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',borderRadius:8,padding:'5px 13px',fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.1)',letterSpacing:'0.8px'}}>
                  BEFORE
                </div>
              </div>

              {/* Divider */}
              <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:2,background:'linear-gradient(to bottom,transparent,rgba(79,124,255,0.9),transparent)',zIndex:10,transform:'translateX(-50%)'}}>
                <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#4f7cff,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,boxShadow:'0 0 24px rgba(79,124,255,0.7)',fontWeight:700}}>
                  ✦
                </div>
              </div>

              {/* AFTER */}
              <div style={{position:'relative',overflow:'hidden',aspectRatio:'16/9'}}>
                <img src={IMGS.heroAfter} alt="After AI redesign" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to left,transparent 60%,#0d1120 100%)'}} />
                <div style={{position:'absolute',top:14,right:14,background:'rgba(79,124,255,0.2)',backdropFilter:'blur(8px)',borderRadius:8,padding:'5px 13px',fontSize:12,fontWeight:700,color:'#a0b4ff',border:'1px solid rgba(79,124,255,0.35)',letterSpacing:'0.8px'}}>
                  ✦ AI REDESIGN
                </div>
              </div>
            </div>

            {/* Status bar */}
            <div style={{background:'#0d1120',borderTop:'1px solid rgba(255,255,255,0.05)',padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
              <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                {[{i:'🎨',t:'Style: Modern Luxury'},{i:'⚡',t:'Generated in 8.3s'},{i:'✓',t:'HD 1536×1024'}].map(b=>(
                  <span key={b.t} style={{fontSize:12,color:'rgba(255,255,255,0.35)',display:'flex',alignItems:'center',gap:6}}>{b.i} {b.t}</span>
                ))}
              </div>
              <button style={{...S.btnPrimary,fontSize:12,padding:'7px 18px',borderRadius:9}}>⬇ Download HD</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{maxWidth:1200,margin:'0 auto',padding:'80px 28px'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={S.sectionLabel}>How It Works</div>
          <h2 style={S.sectionTitle}>From photo to redesign<br/>in 3 steps</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
          {[
            {num:'01',icon:'📸',title:'Upload Your Room',desc:'Snap or upload any room photo. Our AI analyzes the space, lighting, and layout instantly.'},
            {num:'02',icon:'🎨',title:'Choose a Style',desc:'Pick from 8 curated design styles. Add your own custom description for extra precision.'},
            {num:'03',icon:'✨',title:'Get AI Render',desc:'Receive a photorealistic redesign in under 10 seconds. Download in HD and share.'},
          ].map(s=>(
            <div key={s.num} style={{...S.card,padding:'36px 30px',position:'relative'}}
              onMouseOver={e=>hover(e.currentTarget as HTMLElement,true)}
              onMouseOut={e=>hover(e.currentTarget as HTMLElement,false)}>
              <div style={{position:'absolute',top:20,right:24,fontSize:68,fontWeight:900,background:'linear-gradient(135deg,rgba(79,124,255,0.2),rgba(139,92,246,0.05))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',lineHeight:1,userSelect:'none'}}>{s.num}</div>
              <div style={{fontSize:44,marginBottom:20}}>{s.icon}</div>
              <h3 style={{fontSize:20,fontWeight:800,color:'white',marginBottom:10,letterSpacing:'-0.4px'}}>{s.title}</h3>
              <p style={{fontSize:15,color:'rgba(255,255,255,0.42)',lineHeight:1.75}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ STYLES GRID WITH REAL PHOTOS ══ */}
      <section id="styles" style={{maxWidth:1200,margin:'0 auto',padding:'0 28px 80px'}}>
        <div style={{textAlign:'center',marginBottom:52}}>
          <div style={S.sectionLabel}>Design Styles</div>
          <h2 style={S.sectionTitle}>8 stunning styles to choose</h2>
          <p style={{fontSize:16,color:'rgba(255,255,255,0.35)',marginTop:12}}>Each crafted with precision AI prompts for authentic results</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {[
            {label:'Modern',img:IMGS.modern,color:'rgba(79,124,255,0.7)'},
            {label:'Luxury',img:IMGS.luxury,color:'rgba(251,191,36,0.7)'},
            {label:'Minimalist',img:IMGS.minimalist,color:'rgba(200,200,200,0.7)'},
            {label:'Scandinavian',img:IMGS.scandi,color:'rgba(34,197,94,0.7)'},
            {label:'Industrial',img:IMGS.industrial,color:'rgba(249,115,22,0.7)'},
            {label:'Classic',img:IMGS.classic,color:'rgba(180,130,60,0.7)'},
            {label:'Bohemian',img:IMGS.bohemian,color:'rgba(236,72,153,0.7)'},
            {label:'Japanese',img:IMGS.japanese,color:'rgba(16,185,129,0.7)'},
          ].map(s=>(
            <div key={s.label} style={{position:'relative',borderRadius:18,overflow:'hidden',aspectRatio:'4/3',cursor:'pointer',transition:'transform 0.25s ease,box-shadow 0.25s ease'}}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px) scale(1.01)';e.currentTarget.style.boxShadow='0 20px 50px rgba(0,0,0,0.5)'}}
              onMouseOut={e=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='none'}}>
              <img src={s.img} alt={s.label} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.4s ease'}} />
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.1) 50%,transparent 100%)'}} />
              {/* Color bar at top */}
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:s.color}} />
              <div style={{position:'absolute',bottom:14,left:14}}>
                <p style={{fontSize:15,fontWeight:800,color:'white',letterSpacing:'-0.2px'}}>{s.label}</p>
              </div>
              {/* Hover overlay */}
              <div style={{position:'absolute',inset:0,background:'rgba(79,124,255,0.15)',opacity:0,transition:'opacity 0.25s'}}
                onMouseOver={e=>e.currentTarget.style.opacity='1'}
                onMouseOut={e=>e.currentTarget.style.opacity='0'} />
            </div>
          ))}
        </div>
      </section>

      {/* ══ GALLERY ══ */}
      <section id="gallery" style={{maxWidth:1200,margin:'0 auto',padding:'0 28px 80px'}}>
        <div style={{textAlign:'center',marginBottom:52}}>
          <div style={S.sectionLabel}>Room Gallery</div>
          <h2 style={S.sectionTitle}>Design any room in your home</h2>
          <p style={{fontSize:16,color:'rgba(255,255,255,0.35)',marginTop:12}}>From bedrooms to kitchens — RoomGenie handles every space</p>
        </div>

        {/* 2-col layout */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
          {/* Big feature card */}
          <div style={{position:'relative',borderRadius:24,overflow:'hidden',gridRow:'span 2',cursor:'pointer',transition:'transform 0.25s ease'}}
            onMouseOver={e=>e.currentTarget.style.transform='scale(1.01)'}
            onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
            <img src={IMGS.bedroom} alt="AI Bedroom Design" style={{width:'100%',height:'100%',objectFit:'cover',minHeight:400}} />
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.1) 60%,transparent 100%)'}} />
            <div style={{position:'absolute',bottom:24,left:24,right:24}}>
              <div style={{display:'inline-block',background:'rgba(79,124,255,0.25)',border:'1px solid rgba(79,124,255,0.4)',borderRadius:100,padding:'3px 12px',fontSize:11,fontWeight:700,color:'#a0b4ff',letterSpacing:'0.8px',marginBottom:8}}>BEDROOM</div>
              <h3 style={{fontSize:22,fontWeight:800,color:'white',letterSpacing:'-0.5px',marginBottom:6}}>Luxury Master Suite</h3>
              <p style={{fontSize:13,color:'rgba(255,255,255,0.55)'}}>Modern Luxury style · Generated in 7.2s</p>
            </div>
            <div style={{position:'absolute',top:16,right:16,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(10px)',borderRadius:10,padding:'6px 12px',fontSize:12,color:'rgba(255,255,255,0.7)',border:'1px solid rgba(255,255,255,0.1)'}}>
              ✦ AI Render
            </div>
          </div>

          {/* Kitchen card */}
          <div style={{position:'relative',borderRadius:20,overflow:'hidden',cursor:'pointer',transition:'transform 0.25s ease'}}
            onMouseOver={e=>e.currentTarget.style.transform='scale(1.01)'}
            onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
            <img src={IMGS.kitchen} alt="AI Kitchen Design" style={{width:'100%',height:'100%',objectFit:'cover',minHeight:190}} />
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 60%)'}} />
            <div style={{position:'absolute',bottom:16,left:16}}>
              <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.5)',letterSpacing:'0.8px',marginBottom:4}}>KITCHEN</div>
              <p style={{fontSize:16,fontWeight:800,color:'white'}}>Modern Minimal Kitchen</p>
            </div>
          </div>

          {/* Bathroom card */}
          <div style={{position:'relative',borderRadius:20,overflow:'hidden',cursor:'pointer',transition:'transform 0.25s ease'}}
            onMouseOver={e=>e.currentTarget.style.transform='scale(1.01)'}
            onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
            <img src={IMGS.bathroom} alt="AI Bathroom Design" style={{width:'100%',height:'100%',objectFit:'cover',minHeight:190}} />
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 60%)'}} />
            <div style={{position:'absolute',bottom:16,left:16}}>
              <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.5)',letterSpacing:'0.8px',marginBottom:4}}>BATHROOM</div>
              <p style={{fontSize:16,fontWeight:800,color:'white'}}>Spa-Like Luxury Bath</p>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{position:'relative',borderRadius:20,overflow:'hidden',cursor:'pointer',transition:'transform 0.25s ease'}}
            onMouseOver={e=>e.currentTarget.style.transform='scale(1.01)'}
            onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
            <img src={IMGS.office} alt="AI Home Office" style={{width:'100%',height:220,objectFit:'cover'}} />
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 60%)'}} />
            <div style={{position:'absolute',bottom:16,left:16}}>
              <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.5)',letterSpacing:'0.8px',marginBottom:4}}>HOME OFFICE</div>
              <p style={{fontSize:16,fontWeight:800,color:'white'}}>Productive Workspace</p>
            </div>
          </div>

          {/* CTA card */}
          <div style={{borderRadius:20,background:'linear-gradient(135deg,rgba(79,124,255,0.15),rgba(139,92,246,0.12))',border:'1px solid rgba(79,124,255,0.2)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px',textAlign:'center',height:220}}>
            <div style={{fontSize:36,marginBottom:12}}>🏠</div>
            <p style={{fontSize:17,fontWeight:800,color:'white',marginBottom:6}}>8 Room Types</p>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.45)',marginBottom:18}}>Living rooms, dining rooms, kids rooms & more</p>
            <button style={{...S.btnPrimary,fontSize:13,padding:'9px 22px',borderRadius:10}}>Explore All →</button>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" style={{maxWidth:1200,margin:'0 auto',padding:'0 28px 80px'}}>
        <div style={{textAlign:'center',marginBottom:52}}>
          <div style={S.sectionLabel}>Features</div>
          <h2 style={S.sectionTitle}>Everything you need to design</h2>
          <p style={{fontSize:16,color:'rgba(255,255,255,0.35)',marginTop:12,maxWidth:460,margin:'12px auto 0'}}>Professional AI interior design tools — no experience required.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:16}}>
          {[
            {icon:'🏠',title:'Any Room Type',desc:'Bedrooms, living rooms, kitchens, bathrooms, home offices — all fully supported.'},
            {icon:'⚡',title:'Renders in 10 Seconds',desc:'Powered by GPT-Image-1. Photorealistic results faster than making a coffee.'},
            {icon:'🎨',title:'8 Design Styles',desc:'Modern, Luxury, Minimalist, Scandinavian, Industrial, Classic, Bohemian, Japanese.'},
            {icon:'💬',title:'AI Design Consultant',desc:'Chat with our AI for personalized advice on colors, furniture, layout and mood.'},
            {icon:'⬇️',title:'HD Downloads',desc:'Download renders at 1536×1024. Ready to share with contractors or on social media.'},
            {icon:'🔄',title:'Unlimited Iterations',desc:'Tweak the prompt and regenerate until you love it. Every time in seconds.'},
          ].map(f=>(
            <div key={f.title} style={{...S.card,padding:'28px 26px'}}
              onMouseOver={e=>hover(e.currentTarget as HTMLElement,true)}
              onMouseOut={e=>hover(e.currentTarget as HTMLElement,false)}>
              <div style={{fontSize:36,marginBottom:16}}>{f.icon}</div>
              <h3 style={{fontSize:17,fontWeight:700,color:'white',marginBottom:8,letterSpacing:'-0.2px'}}>{f.title}</h3>
              <p style={{fontSize:14,color:'rgba(255,255,255,0.4)',lineHeight:1.75}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" style={{maxWidth:1200,margin:'0 auto',padding:'0 28px 80px'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={S.sectionLabel}>Pricing</div>
          <h2 style={S.sectionTitle}>Simple, transparent pricing</h2>
          <p style={{fontSize:16,color:'rgba(255,255,255,0.35)',marginTop:12}}>Start free. Upgrade when you need more.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20,alignItems:'center'}}>
          {[
            {name:'Free',price:'$0',period:'/mo',highlight:false,popular:false,
              features:['3 AI renders/month','Basic design styles','Standard quality','5 AI chat messages','Download renders'],cta:'Get Started Free'},
            {name:'Pro',price:'$19',period:'/mo',highlight:true,popular:true,
              features:['Unlimited AI renders','All 8 design styles','HD 1536px quality','Unlimited AI chat','Priority queue','Commercial rights'],cta:'Start Pro'},
            {name:'Studio',price:'$49',period:'/mo',highlight:false,popular:false,
              features:['Everything in Pro','5 team members','White-label exports','API access','Priority support','Custom style presets'],cta:'Start Studio'},
          ].map(p=>(
            <div key={p.name} style={{
              borderRadius:24,padding:'36px 32px',
              background:p.highlight?'white':'linear-gradient(145deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.01) 100%)',
              border:p.highlight?'none':'1px solid rgba(255,255,255,0.08)',
              color:p.highlight?'black':'white',
              transform:p.highlight?'scale(1.04)':'scale(1)',
              boxShadow:p.highlight?'0 30px 80px rgba(0,0,0,0.5)':'none',
              position:'relative',display:'flex',flexDirection:'column',
            }}>
              {p.popular&&<div style={{position:'absolute',top:18,right:18,background:'linear-gradient(135deg,#4f7cff,#8b5cf6)',color:'white',fontSize:10,fontWeight:800,padding:'4px 11px',borderRadius:100,letterSpacing:'0.8px'}}>POPULAR</div>}
              <h3 style={{fontSize:24,fontWeight:900,marginBottom:2,color:p.highlight?'black':'white'}}>{p.name}</h3>
              <div style={{marginBottom:24}}>
                <span style={{fontSize:52,fontWeight:900,letterSpacing:'-2px',color:p.highlight?'black':'white'}}>{p.price}</span>
                <span style={{fontSize:15,color:p.highlight?'#777':'rgba(255,255,255,0.4)'}}>{p.period}</span>
              </div>
              <ul style={{listStyle:'none',marginBottom:28,flex:1,display:'flex',flexDirection:'column',gap:11}}>
                {p.features.map(f=>(
                  <li key={f} style={{display:'flex',alignItems:'center',gap:10,fontSize:14,color:p.highlight?'#444':'rgba(255,255,255,0.6)'}}>
                    <span style={{color:p.highlight?'#4f7cff':'#4ade80',fontWeight:800,fontSize:15}}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button style={{
                width:'100%',padding:'14px',borderRadius:14,fontWeight:800,fontSize:15,cursor:'pointer',
                background:p.highlight?'linear-gradient(135deg,#4f7cff,#8b5cf6)':'rgba(255,255,255,0.07)',
                border:p.highlight?'none':'1px solid rgba(255,255,255,0.12)',
                color:p.highlight?'white':'rgba(255,255,255,0.7)',
                boxShadow:p.highlight?'0 8px 24px rgba(79,124,255,0.4)':'none',
                transition:'transform 0.15s',
              }}
                onMouseOver={e=>e.currentTarget.style.transform='translateY(-1px)'}
                onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>{p.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA BAND ══ */}
      <section style={{maxWidth:950,margin:'0 auto',padding:'0 28px 100px'}}>
        <div style={{position:'relative',borderRadius:32,overflow:'hidden',padding:'0'}}>
          {/* BG image */}
          <img src={IMGS.heroAfter} alt="" style={{width:'100%',height:420,objectFit:'cover',display:'block'}} />
          <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(6,8,15,0.92) 0%,rgba(15,25,60,0.85) 50%,rgba(6,8,15,0.9) 100%)'}} />
          {/* Glow */}
          <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:400,height:300,background:'radial-gradient(ellipse,rgba(79,124,255,0.2) 0%,transparent 70%)',pointerEvents:'none'}} />
          <div style={{position:'absolute',inset:0,border:'1px solid rgba(79,124,255,0.2)',borderRadius:32}} />
          {/* Content */}
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'48px'}}>
            <p style={{fontSize:13,fontWeight:700,color:'#818cf8',letterSpacing:'1px',textTransform:'uppercase',marginBottom:16}}>Get Started Today</p>
            <h2 style={{fontSize:'clamp(28px,4vw,52px)',fontWeight:900,letterSpacing:'-1.5px',color:'white',marginBottom:14,lineHeight:1.1}}>
              Ready to redesign<br/>your space?
            </h2>
            <p style={{fontSize:16,color:'rgba(255,255,255,0.45)',marginBottom:36,maxWidth:420}}>
              Join 10,000+ homeowners and designers using RoomGenie AI to visualize their dream spaces.
            </p>
            <button style={{...S.btnPrimary,fontSize:16,padding:'17px 44px',borderRadius:16}}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.02)';e.currentTarget.style.boxShadow='0 16px 48px rgba(79,124,255,0.6)'}}
              onMouseOut={e=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 8px 28px rgba(79,124,255,0.4)'}}>
              ✦ &nbsp;Start Designing Free
            </button>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.25)',marginTop:16}}>
              ✓ No credit card &nbsp;·&nbsp; 3 free renders &nbsp;·&nbsp; Takes 30 seconds
            </p>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'36px 28px'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:30,height:30,borderRadius:9,background:'linear-gradient(135deg,#4f7cff,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>✦</div>
            <span style={{fontWeight:900,fontSize:16}}>RoomGenie AI</span>
          </div>
          <div style={{display:'flex',gap:28,fontSize:14,color:'rgba(255,255,255,0.35)',flexWrap:'wrap'}}>
            {[['Features','#features'],['Styles','#styles'],['Gallery','#gallery'],['Pricing','#pricing']].map(([l,h])=>(
              <a key={l} href={h} style={{textDecoration:'none',color:'inherit',transition:'color 0.2s'}}
                onMouseOver={e=>e.currentTarget.style.color='white'}
                onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}>{l}</a>
            ))}
          </div>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.2)'}}>© 2026 RoomGenie AI. All rights reserved.</p>
        </div>
      </footer>

    </main>
  )
}
