'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'

/* ─── CONSTANTS ──────────────────────────────────────────────────── */
const STEPS = [
  { num: 1, label: 'Room' },
  { num: 2, label: 'Style' },
  { num: 3, label: 'Details' },
  { num: 4, label: 'Generate' },
]

const ROOM_TYPES = [
  { name: 'Living Room',  icon: '🛋️' },
  { name: 'Bedroom',      icon: '🛏️' },
  { name: 'Kitchen',      icon: '🍳' },
  { name: 'Bathroom',     icon: '🛁' },
  { name: 'Home Office',  icon: '💻' },
  { name: 'Dining Room',  icon: '🍽️' },
  { name: 'Kids Room',    icon: '🧸' },
  { name: 'Master Suite', icon: '✨' },
  { name: 'Studio',       icon: '🏠' },
]

const STYLES = [
  { name: 'Modern',        img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=75&auto=format&fit=crop',  desc: 'Clean lines, neutral tones' },
  { name: 'Luxury',        img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&q=75&auto=format&fit=crop',  desc: 'Opulent, premium finishes' },
  { name: 'Minimalist',    img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&q=75&auto=format&fit=crop',  desc: 'Less is more' },
  { name: 'Scandinavian',  img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=75&auto=format&fit=crop',  desc: 'Natural, cozy, functional' },
  { name: 'Industrial',    img: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=400&q=75&auto=format&fit=crop',  desc: 'Raw materials, exposed' },
  { name: 'Bohemian',      img: 'https://images.unsplash.com/photo-1522444195799-478538b28823?w=400&q=75&auto=format&fit=crop',  desc: 'Eclectic, colorful, creative' },
  { name: 'Japandi',       img: 'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?w=400&q=75&auto=format&fit=crop',  desc: 'Zen, harmonious, wabi-sabi' },
  { name: 'Classic',       img: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=400&q=75&auto=format&fit=crop',  desc: 'Timeless, traditional' },
  { name: 'Contemporary',  img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=75&auto=format&fit=crop',  desc: 'Current, sophisticated' },
  { name: 'Mediterranean', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75&auto=format&fit=crop',  desc: 'Warm, coastal vibes' },
]

const MOODS    = ['Cozy & Warm', 'Clean & Fresh', 'Bold & Dramatic', 'Calm & Zen', 'Playful & Fun', 'Sophisticated', 'Romantic', 'Energising']
const BUDGETS  = ['Under $1K', '$1K–$5K', '$5K–$15K', '$15K–$50K', '$50K+']
const LIGHTING = ['Very Bright', 'Moderate', 'Low Light', 'No Windows']
const MATERIALS= ['Wood & Natural', 'Marble & Stone', 'Metal & Glass', 'Fabric & Soft', 'Mixed Materials']

type DesignResult = {
  image: string
  design: {
    title?: string
    tagline?: string
    description?: string
    colors?: string[]
    furniture?: string[]
    tips?: string[]
    materials?: string[]
  }
}

/* ─── COMPONENT ───────────────────────────────────────────────────── */
export default function CreatePage() {
  const [step, setStep]           = useState(1)
  const [roomType, setRoomType]   = useState('Living Room')
  const [inputMode, setInputMode] = useState<'photo' | 'dimensions'>('photo')
  const [roomFile, setRoomFile]   = useState<File | null>(null)
  const [roomPreview, setRoomPrev]= useState<string | null>(null)
  const [furnFile, setFurnFile]   = useState<File | null>(null)
  const [furnPreview, setFurnPrev]= useState<string | null>(null)
  const [dims, setDims]           = useState({ w: '', l: '', h: '' })
  const [style, setStyle]         = useState('Modern')
  const [mood, setMood]           = useState('')
  const [budget, setBudget]       = useState('')
  const [lighting, setLighting]   = useState('')
  const [material, setMaterial]   = useState('')
  const [prompt, setPrompt]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState<DesignResult | null>(null)
  const [error, setError]         = useState('')
  const [copied, setCopied]       = useState(false)
  const resultRef                 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  /* File handler */
  const handleFile = useCallback((file: File, type: 'room' | 'furn') => {
    const url = URL.createObjectURL(file)
    if (type === 'room') { setRoomFile(file); setRoomPrev(url) }
    else                  { setFurnFile(file); setFurnPrev(url) }
  }, [])

  /* Drop handler */
  const onDrop = useCallback((e: React.DragEvent, type: 'room' | 'furn') => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file, type)
  }, [handleFile])

  /* Generate */
  async function generate() {
    setError(''); setLoading(true); setResult(null)
    try {
      const fd = new FormData()
      if (roomFile) fd.append('image', roomFile)
      fd.append('style', style)
      fd.append('roomType', roomType)
      const extras = [
        mood     ? `Mood: ${mood}`         : '',
        budget   ? `Budget: ${budget}`     : '',
        lighting ? `Lighting: ${lighting}` : '',
        material ? `Materials: ${material}`: '',
        prompt   ? prompt                  : '',
      ].filter(Boolean).join('. ')
      fd.append('prompt', extras)
      fd.append('answers', JSON.stringify({ mood, budget, lighting, material }))
      fd.append('dimensions', JSON.stringify({ width: dims.w, length: dims.l, height: dims.h }))
      if (furnFile) fd.append('furniture', JSON.stringify(['sofa']))

      const res  = await fetch('/api/generate', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch { setError('Something went wrong. Please check your API configuration.') }
    finally { setLoading(false) }
  }

  /* ── STYLES ── */
  const s = {
    page:    { fontFamily: 'Inter,system-ui,sans-serif', background: '#f8faff', minHeight: '100vh' } as React.CSSProperties,
    nav:     { position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e8eaf0' },
    navIn:   { maxWidth: 1280, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo:    { display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' } as React.CSSProperties,
    logoBox: { width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 17 },
    logoTxt: { fontWeight: 800, fontSize: 17, color: '#0f172a' },
    gradTxt: { background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } as React.CSSProperties,
    wrap:    { maxWidth: 900, margin: '0 auto', padding: '88px 24px 60px' },
    card:    { background: 'white', border: '1px solid #e8eaf0', borderRadius: 20, padding: '32px 36px', marginBottom: 0 } as React.CSSProperties,
    label:   { display: 'inline-block', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 100, padding: '4px 14px', fontSize: 11, fontWeight: 700, color: '#4f7cff', letterSpacing: '1px', textTransform: 'uppercase' as const },
    h2:      { fontSize: 26, fontWeight: 900, letterSpacing: '-0.8px', color: '#0f172a', marginTop: 8, marginBottom: 4 },
    sub:     { fontSize: 14, color: '#64748b', marginBottom: 28 },
    chip:    (active: boolean): React.CSSProperties => ({
      padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
      border: `1.5px solid ${active ? '#4f7cff' : '#e2e8f0'}`,
      background: active ? '#f0f4ff' : 'white',
      color: active ? '#4f7cff' : '#64748b',
      transition: 'all 0.15s',
    }),
    btnPrimary: {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white',
      fontWeight: 700, fontSize: 15, padding: '12px 28px', borderRadius: 12,
      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      boxShadow: '0 6px 20px rgba(79,124,255,0.35)',
      transition: 'transform 0.15s, box-shadow 0.15s',
    } as React.CSSProperties,
    btnSecondary: {
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'white', color: '#374151', fontWeight: 600, fontSize: 14,
      padding: '11px 24px', borderRadius: 12, border: '1.5px solid #e2e8f0',
      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
    } as React.CSSProperties,
  }

  /* ── Progress bar ── */
  const Progress = () => (
    <div style={{ marginBottom: 36 }}>
      {/* Step tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #f1f5f9', marginBottom: 0 }}>
        {STEPS.map(st => {
          const done    = step > st.num
          const active  = step === st.num
          return (
            <button key={st.num} onClick={() => { if (st.num < step) setStep(st.num) }}
              style={{
                flex: 1, padding: '14px 8px', background: 'none', border: 'none', cursor: st.num < step ? 'pointer' : 'default',
                borderBottom: active ? '3px solid #4f7cff' : done ? '3px solid #c7d2fe' : '3px solid transparent',
                position: 'relative', bottom: -2, transition: 'all 0.2s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, flexShrink: 0,
                  background: active ? 'linear-gradient(135deg,#4f7cff,#7c3aed)' : done ? '#eef2ff' : '#f8faff',
                  color: active ? 'white' : done ? '#4f7cff' : '#94a3b8',
                  border: done ? '1.5px solid #c7d2fe' : 'none',
                }}>
                  {done ? '✓' : st.num}
                </div>
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#4f7cff' : done ? '#64748b' : '#94a3b8' }}>
                  {st.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
      {/* Progress fill */}
      <div style={{ height: 2, background: '#f1f5f9', marginTop: 0 }}>
        <div style={{ height: '100%', width: `${((step - 1) / (STEPS.length - 1)) * 100}%`, background: 'linear-gradient(90deg,#4f7cff,#7c3aed)', transition: 'width 0.4s ease', borderRadius: 2 }} />
      </div>
    </div>
  )

  /* ── Upload Zone ── */
  const UploadZone = ({ type, preview, label, icon, hint }: { type: 'room' | 'furn'; preview: string | null; label: string; icon: string; hint: string }) => (
    <div>
      {preview ? (
        <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '2px solid #4f7cff' }}>
          <img src={preview} alt={label} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.5),transparent 50%)' }} />
          <button onClick={() => type === 'room' ? (setRoomFile(null), setRoomPrev(null)) : (setFurnFile(null), setFurnPrev(null))}
            style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            ✕ Remove
          </button>
          <div style={{ position: 'absolute', bottom: 12, left: 14, fontSize: 13, fontWeight: 700, color: 'white' }}>{label}</div>
        </div>
      ) : (
        <label style={{ display: 'block', cursor: 'pointer' }}>
          <div onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, type)}
            style={{ border: '2px dashed #d1d5db', background: '#fafbff', borderRadius: 14, padding: '32px 20px', textAlign: 'center', transition: 'all 0.2s' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>{hint}</p>
            <span style={{ display: 'inline-block', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '6px 16px', fontSize: 12, fontWeight: 700, color: '#4f7cff' }}>Browse Files</span>
          </div>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, type) }} />
        </label>
      )}
    </div>
  )

  /* ── Navigation buttons ── */
  const NavButtons = ({ canNext = true, nextLabel = 'Continue →', onNext }: { canNext?: boolean; nextLabel?: string; onNext?: () => void }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36, paddingTop: 28, borderTop: '1px solid #f1f5f9' }}>
      <button onClick={() => step > 1 ? setStep(step - 1) : undefined}
        style={{ ...s.btnSecondary, visibility: step === 1 ? 'hidden' : 'visible' }}>
        ← Back
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8' }}>
        Step {step} of {STEPS.length}
      </div>
      <button onClick={onNext || (() => setStep(step + 1))} disabled={!canNext}
        style={{ ...s.btnPrimary, opacity: canNext ? 1 : 0.45, cursor: canNext ? 'pointer' : 'not-allowed' }}>
        {nextLabel}
      </button>
    </div>
  )

  /* ═══════════════════════════════════════════════════════════════
     STEP 1 — ROOM
  ═══════════════════════════════════════════════════════════════ */
  const Step1 = () => (
    <div>
      <div style={s.label}>Step 1 of 4</div>
      <h2 style={s.h2}>Your Room</h2>
      <p style={s.sub}>Select room type and provide a photo or dimensions</p>

      {/* Room type */}
      <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Room Type</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 32 }}>
        {ROOM_TYPES.map(r => (
          <button key={r.name} onClick={() => setRoomType(r.name)}
            style={{ padding: '13px 12px', borderRadius: 12, border: `1.5px solid ${roomType === r.name ? '#4f7cff' : '#e2e8f0'}`, background: roomType === r.name ? '#f0f4ff' : 'white', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}>
            <span style={{ fontSize: 20 }}>{r.icon}</span>
            <span style={{ fontSize: 13, fontWeight: roomType === r.name ? 700 : 500, color: roomType === r.name ? '#4f7cff' : '#374151' }}>{r.name}</span>
            {roomType === r.name && <span style={{ marginLeft: 'auto', color: '#4f7cff', fontWeight: 800, fontSize: 14 }}>✓</span>}
          </button>
        ))}
      </div>

      {/* Photo / Dimensions toggle */}
      <div style={{ display: 'flex', gap: 0, background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {(['photo', 'dimensions'] as const).map(m => (
          <button key={m} onClick={() => setInputMode(m)}
            style={{ padding: '9px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: inputMode === m ? 'white' : 'transparent', color: inputMode === m ? '#4f7cff' : '#64748b', boxShadow: inputMode === m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s', fontFamily: 'inherit' }}>
            {m === 'photo' ? '📸 Room Photo' : '📐 Dimensions'}
          </button>
        ))}
      </div>

      {inputMode === 'photo' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <UploadZone type="room" preview={roomPreview} label="Room Photo" icon="🏠" hint="Upload your existing room — any angle works" />
          <UploadZone type="furn" preview={furnPreview} label="Furniture Reference" icon="🛋️" hint="Optional — AI will incorporate your pieces" />
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Enter your room dimensions and AI will scale the design accordingly.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[['w', 'Width (ft)', '14'], ['l', 'Length (ft)', '20'], ['h', 'Ceiling Height (ft)', '9']].map(([k, label, ph]) => (
              <div key={k}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{label}</label>
                <input type="number" placeholder={ph} value={dims[k as 'w' | 'l' | 'h']}
                  onChange={e => setDims(d => ({ ...d, [k]: e.target.value }))}
                  style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#0f172a', outline: 'none', fontFamily: 'inherit', background: '#fafbff', transition: 'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#4f7cff'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'} />
              </div>
            ))}
          </div>
        </div>
      )}

      <NavButtons nextLabel="Choose Style →" />
    </div>
  )

  /* ═══════════════════════════════════════════════════════════════
     STEP 2 — STYLE
  ═══════════════════════════════════════════════════════════════ */
  const Step2 = () => (
    <div>
      <div style={s.label}>Step 2 of 4</div>
      <h2 style={s.h2}>Design Style</h2>
      <p style={s.sub}>Choose the aesthetic that speaks to you</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        {STYLES.map(st => (
          <button key={st.name} onClick={() => setStyle(st.name)}
            style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: `2.5px solid ${style === st.name ? '#4f7cff' : '#e8eaf0'}`, padding: 0, cursor: 'pointer', background: 'none', transition: 'all 0.2s', transform: style === st.name ? 'scale(1.04)' : 'scale(1)', boxShadow: style === st.name ? '0 0 0 4px rgba(79,124,255,0.12), 0 8px 20px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.05)' }}>
            <img src={st.img} alt={st.name} style={{ width: '100%', height: 88, objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: style === st.name ? 'rgba(79,124,255,0.18)' : 'linear-gradient(to top,rgba(0,0,0,0.55),transparent 55%)' }} />
            {style === st.name && <div style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', background: '#4f7cff', color: 'white', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 6px 9px', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'white', margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{st.name}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{st.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Selected style info */}
      {style && (
        <div style={{ marginTop: 24, padding: '16px 20px', background: '#f0f4ff', borderRadius: 14, border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={STYLES.find(s => s.name === style)?.img} alt={style} style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#4f7cff', margin: 0 }}>{style} Selected</p>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{STYLES.find(s => s.name === style)?.desc}</p>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 20, color: '#4f7cff' }}>✦</div>
        </div>
      )}

      <NavButtons nextLabel="Add Details →" />
    </div>
  )

  /* ═══════════════════════════════════════════════════════════════
     STEP 3 — DETAILS
  ═══════════════════════════════════════════════════════════════ */
  const Step3 = () => (
    <div>
      <div style={s.label}>Step 3 of 4</div>
      <h2 style={s.h2}>Design Preferences</h2>
      <p style={s.sub}>Help Claude AI personalise your design — all fields are optional</p>

      {/* Mood */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Desired Mood</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {MOODS.map(m => (
            <button key={m} onClick={() => setMood(mood === m ? '' : m)} style={s.chip(mood === m)}>{m}</button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Budget Range</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BUDGETS.map(b => (
            <button key={b} onClick={() => setBudget(budget === b ? '' : b)} style={s.chip(budget === b)}>{b}</button>
          ))}
        </div>
      </div>

      {/* 2-col row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Natural Lighting</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LIGHTING.map(l => (
              <button key={l} onClick={() => setLighting(lighting === l ? '' : l)}
                style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${lighting === l ? '#4f7cff' : '#e2e8f0'}`, background: lighting === l ? '#f0f4ff' : 'white', cursor: 'pointer', fontSize: 13, fontWeight: lighting === l ? 700 : 500, color: lighting === l ? '#4f7cff' : '#64748b', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.15s' }}>
                {lighting === l ? <span style={{ color: '#4f7cff', fontWeight: 800 }}>●</span> : <span style={{ color: '#e2e8f0', fontWeight: 800 }}>○</span>}
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Preferred Materials</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MATERIALS.map(m => (
              <button key={m} onClick={() => setMaterial(material === m ? '' : m)}
                style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${material === m ? '#4f7cff' : '#e2e8f0'}`, background: material === m ? '#f0f4ff' : 'white', cursor: 'pointer', fontSize: 13, fontWeight: material === m ? 700 : 500, color: material === m ? '#4f7cff' : '#64748b', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.15s' }}>
                {material === m ? <span style={{ color: '#4f7cff', fontWeight: 800 }}>●</span> : <span style={{ color: '#e2e8f0', fontWeight: 800 }}>○</span>}
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Extra prompt */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Anything else? <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></p>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. Built-in bookshelves, a cozy reading nook by the window, hidden cable management, room for two young kids..."
          style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '13px 16px', fontSize: 14, color: '#0f172a', outline: 'none', fontFamily: 'inherit', minHeight: 100, resize: 'none', background: '#fafbff', transition: 'border-color 0.2s, box-shadow 0.2s', lineHeight: 1.7 }}
          onFocus={e => { e.currentTarget.style.borderColor = '#4f7cff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,124,255,0.1)' }}
          onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }} />
      </div>

      <NavButtons nextLabel="Review & Generate →" />
    </div>
  )

  /* ═══════════════════════════════════════════════════════════════
     STEP 4 — GENERATE
  ═══════════════════════════════════════════════════════════════ */
  const Step4 = () => {
    const summaryRows = [
      { l: 'Room Type',    v: roomType },
      { l: 'Input',        v: inputMode === 'photo' ? (roomFile ? `📸 ${roomFile.name}` : 'No photo (AI will create)') : dims.w ? `📐 ${dims.w}×${dims.l} ft, ${dims.h}ft ceiling` : 'No dimensions' },
      { l: 'Style',        v: style },
      { l: 'Mood',         v: mood         || '—' },
      { l: 'Budget',       v: budget       || '—' },
      { l: 'Lighting',     v: lighting     || '—' },
      { l: 'Materials',    v: material     || '—' },
      { l: 'Furniture',    v: furnFile ? `🛋️ ${furnFile.name}` : '—' },
    ]

    return (
      <div>
        <div style={s.label}>Step 4 of 4</div>
        <h2 style={s.h2}>Review & Generate</h2>
        <p style={s.sub}>Confirm your design brief — then let Claude AI and DALL·E 3 work their magic</p>

        {/* Design brief summary */}
        <div style={{ background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📋</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: 'white', margin: 0 }}>Your Design Brief</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>This is what Claude AI will use to generate your design</p>
            </div>
          </div>
          <div style={{ padding: '4px 0' }}>
            {summaryRows.map(({ l, v }) => (
              <div key={l} style={{ display: 'flex', alignItems: 'flex-start', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', gap: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', width: 90, flexShrink: 0, paddingTop: 1 }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: v === '—' ? '#d1d5db' : '#0f172a', lineHeight: 1.5 }}>{v}</span>
              </div>
            ))}
            {prompt && (
              <div style={{ padding: '12px 20px' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Custom Notes</span>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>"{prompt}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Style preview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{ borderRadius: 14, overflow: 'hidden', position: 'relative', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <img src={STYLES.find(s => s.name === style)?.img} alt={style} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6),transparent 50%)' }} />
            <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Style</p>
              <p style={{ fontSize: 15, fontWeight: 800, color: 'white', margin: 0 }}>{style}</p>
            </div>
          </div>
          {roomPreview ? (
            <div style={{ borderRadius: 14, overflow: 'hidden', position: 'relative', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <img src={roomPreview} alt="Your room" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6),transparent 50%)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Room</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: 0 }}>Photo Uploaded</p>
              </div>
            </div>
          ) : (
            <div style={{ borderRadius: 14, border: '2px dashed #c7d2fe', background: '#f0f4ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 140 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🤖</div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#4f7cff', margin: 0 }}>AI Will Create From Scratch</p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>No room photo — pure AI imagination</p>
            </div>
          )}
        </div>

        {/* AI note */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚡</span>
          <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.7, margin: 0 }}>
            <strong>What happens next:</strong> Claude AI crafts a detailed design concept, then DALL·E 3 generates a photorealistic render. Takes about 8–12 seconds.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#dc2626', marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Generate button */}
        <button onClick={generate} disabled={loading}
          style={{ ...s.btnPrimary, width: '100%', padding: '18px', fontSize: 16, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 14, justifyContent: 'center' }}>
          {loading ? (
            <>
              <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
              Claude AI is designing your room...
            </>
          ) : '✦ Generate My Design'}
        </button>
        <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>Claude AI + DALL·E 3 · ~10 seconds · Free</p>

        <NavButtons canNext={false} nextLabel="" />
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════
     RESULT
  ═══════════════════════════════════════════════════════════════ */
  const Result = () => {
    if (!result) return null
    const d = result.design

    return (
      <div ref={resultRef} style={{ marginTop: 40 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '7px 20px', fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 14 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Your Design is Ready
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.8px', color: '#0f172a', marginBottom: 6 }}>
            {d?.title || `${style} ${roomType}`}
          </h2>
          {d?.tagline && <p style={{ fontSize: 16, color: '#64748b' }}>{d.tagline}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 24, alignItems: 'start' }}>
          {/* Left */}
          <div>
            {/* Image */}
            <div style={{ borderRadius: 22, overflow: 'hidden', boxShadow: '0 20px 56px rgba(0,0,0,0.12)', marginBottom: 16, position: 'relative' }}>
              <img src={result.image} alt={`${style} ${roomType}`} style={{ width: '100%', display: 'block', minHeight: 280, objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.92)', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#4f7cff' }}>✦ AI Generated</div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <a href={result.image} target="_blank" rel="noopener"
                style={{ ...s.btnPrimary, flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
                ⬇ Open Full Image
              </a>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                style={s.btnSecondary}>
                {copied ? '✓ Copied!' : '🔗 Share'}
              </button>
              <button onClick={() => { setResult(null); setStep(1) }} style={s.btnSecondary}>
                🔄 Redesign
              </button>
            </div>

            {/* Description */}
            {d?.description && (
              <div style={{ background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 14, padding: '18px 22px', marginBottom: 16 }}>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, margin: 0 }}>{d.description}</p>
              </div>
            )}

            {/* Colors + Furniture */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {d?.colors && d.colors.length > 0 && (
                <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 18 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Color Palette</h4>
                  {d.colors.map((c, i) => {
                    const [hex, name] = c.includes(' - ') ? c.split(' - ') : [c, c]
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: hex.startsWith('#') ? hex : '#e2e8f0', border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }} />
                        <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{name}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              {d?.furniture && d.furniture.length > 0 && (
                <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 18 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Key Pieces</h4>
                  {d.furniture.map((f, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#374151', marginBottom: 9, display: 'flex', gap: 7, alignItems: 'flex-start', lineHeight: 1.5 }}>
                      <span style={{ color: '#4f7cff', fontWeight: 700, flexShrink: 0 }}>→</span>{f}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            {d?.tips && d.tips.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 18, marginTop: 14 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Designer Tips</h4>
                {d.tips.map((t, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 10, display: 'flex', gap: 9, lineHeight: 1.65 }}>
                    <span style={{ color: '#16a34a', fontWeight: 800, flexShrink: 0 }}>✓</span>{t}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Design Brief</h3>
              {[{ l: 'Style', v: style }, { l: 'Room', v: roomType }, { l: 'Mood', v: mood || '—' }, { l: 'AI', v: 'Claude + DALL·E 3' }, { l: 'Status', v: '✓ Complete' }].map(({ l, v }) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '9px 0', borderBottom: '1px solid #f8faff' }}>
                  <span style={{ color: '#94a3b8' }}>{l}</span>
                  <span style={{ color: v === '✓ Complete' ? '#16a34a' : '#0f172a', fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>

            {d?.materials && d.materials.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 18 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>Materials</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {d.materials.map((m, i) => (
                    <span key={i} style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#4f7cff' }}>{m}</span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => { setResult(null); setStep(1) }}
              style={{ ...s.btnPrimary, justifyContent: 'center', width: '100%' }}>
              ✦ New Design
            </button>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 14 }}>
              <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.7, margin: 0 }}>
                💡 <strong>Try again</strong> with different preferences, or go back to Step 1 to upload your actual room photo for more accurate results.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <div style={s.page}>
      {/* NAV — identical to existing site */}
      <nav style={s.nav}>
        <div style={s.navIn}>
          <Link href="/" style={s.logo}>
            <div style={s.logoBox}>R</div>
            <span style={s.logoTxt}>RoomGenie <span style={s.gradTxt}>AI</span></span>
          </Link>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/dashboard" className="nav-link" style={{ textDecoration: 'none', padding: '8px 14px', borderRadius: 9, fontSize: 14, fontWeight: 500, color: '#5a6478' }}>Dashboard</Link>
            <Link href="/pricing" className="nav-link" style={{ textDecoration: 'none', padding: '8px 14px', borderRadius: 9, fontSize: 14, fontWeight: 500, color: '#5a6478' }}>Pricing</Link>
          </div>
        </div>
      </nav>

      <div style={s.wrap}>
        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', marginBottom: 14 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
            <span>›</span>
            <span style={{ color: '#64748b', fontWeight: 500 }}>Design Studio</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', marginBottom: 6 }}>
            AI Design Studio
          </h1>
          <p style={{ fontSize: 16, color: '#64748b' }}>Complete the guided steps below — then get your photorealistic AI-generated design</p>
        </div>

        {/* Main wizard card */}
        <div style={s.card}>
          <Progress />
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
        </div>

        {/* Result — shown below the card */}
        {result && (
          <div style={{ ...s.card, marginTop: 32 }}>
            <Result />
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .nav-link:hover { background: #f0f4ff !important; color: #4f7cff !important; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}
