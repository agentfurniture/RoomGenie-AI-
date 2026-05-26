'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STYLES = [
  { label: 'Modern',      img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300&q=70&auto=format&fit=crop' },
  { label: 'Luxury',      img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=300&q=70&auto=format&fit=crop' },
  { label: 'Minimalist',  img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=300&q=70&auto=format&fit=crop' },
  { label: 'Scandinavian',img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=70&auto=format&fit=crop' },
  { label: 'Industrial',  img: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=300&q=70&auto=format&fit=crop' },
  { label: 'Classic',     img: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=300&q=70&auto=format&fit=crop' },
  { label: 'Bohemian',    img: 'https://images.unsplash.com/photo-1522444195799-478538b28823?w=300&q=70&auto=format&fit=crop' },
  { label: 'Japanese',    img: 'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?w=300&q=70&auto=format&fit=crop' },
]
const ROOMS = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Home Office', 'Dining Room', 'Kids Room', 'Master Suite']

export default function CreatePage() {
  const router = useRouter()
  const [style, setStyle]     = useState('Modern')
  const [room, setRoom]       = useState('Living Room')
  const [prompt, setPrompt]   = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile]       = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState<'generate' | 'chat'>('generate')
  const [msgs, setMsgs]       = useState([{ role: 'assistant', text: "Hi! I'm your AI interior design consultant. Tell me about your room and what you want to change." }])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  function onFile(f: File) { setFile(f); setPreview(URL.createObjectURL(f)) }

  async function handleGenerate() {
    setError(''); setLoading(true)
    try {
      const fd = new FormData()
      if (file) fd.append('image', file)
      fd.append('style', style); fd.append('roomType', room); fd.append('prompt', prompt)
      const res = await fetch('/api/generate', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      sessionStorage.setItem('genImage', data.image)
      sessionStorage.setItem('genStyle', style)
      sessionStorage.setItem('genRoom', room)
      if (data.design) sessionStorage.setItem('genDesign', JSON.stringify(data.design))
      router.push('/results')
    } catch { setError('Something went wrong. Please check your API key.') }
    finally { setLoading(false) }
  }

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return
    const msg = chatInput; setChatInput(''); setChatLoading(true)
    setMsgs(m => [...m, { role: 'user', text: msg }])
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg }) })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'assistant', text: data.reply || 'Sorry, something went wrong.' }])
    } catch { setMsgs(m => [...m, { role: 'assistant', text: 'Sorry, something went wrong.' }]) }
    finally { setChatLoading(false) }
  }

  const cardStyle = { background: 'linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20 } as React.CSSProperties

  return (
    <main style={{ background: '#06080f', color: 'white', minHeight: '100vh' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(6,8,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'white' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#4f7cff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, boxShadow: '0 0 18px rgba(79,124,255,0.4)' }}>✦</div>
            <span style={{ fontWeight: 900, fontSize: 17 }}>RoomGenie AI</span>
          </a>
          <a href="/dashboard" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}>Dashboard</a>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 28px 60px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 8 }}>Design Your Room</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>Upload a photo, pick a style, and let AI redesign your space.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {([['generate', '🪄  Generate Design'], ['chat', '💬  AI Consultant']] as const).map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none',
              background: tab === t ? 'white' : 'rgba(255,255,255,0.05)',
              color: tab === t ? 'black' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s',
            }}>{l}</button>
          ))}
        </div>

        {tab === 'generate' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Upload */}
              <div style={{ ...cardStyle, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}>1</div>
                  <h2 style={{ fontSize: 15, fontWeight: 700 }}>Upload Room Photo <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(optional)</span></h2>
                </div>
                {preview ? (
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                    <img src={preview} alt="Room" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
                    <button onClick={() => { setFile(null); setPreview(null) }} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✕ Remove</button>
                  </div>
                ) : (
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f) }}
                    onClick={() => document.getElementById('fi')?.click()}
                    style={{ border: `2px dashed ${dragging ? 'rgba(79,124,255,0.7)' : 'rgba(255,255,255,0.1)'}`, background: dragging ? 'rgba(79,124,255,0.08)' : 'rgba(255,255,255,0.02)', borderRadius: 14, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>📸</div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>Drop your room photo here</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>or click to browse — JPG, PNG, WEBP</p>
                    <input id="fi" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
                  </div>
                )}
              </div>

              {/* Room type */}
              <div style={{ ...cardStyle, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}>2</div>
                  <h2 style={{ fontSize: 15, fontWeight: 700 }}>Room Type</h2>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ROOMS.map(r => (
                    <button key={r} onClick={() => setRoom(r)} style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: room === r ? 'white' : 'rgba(255,255,255,0.05)', color: room === r ? 'black' : 'rgba(255,255,255,0.5)', border: room === r ? 'none' : '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s' }}>{r}</button>
                  ))}
                </div>
              </div>

              {/* Style selector */}
              <div style={{ ...cardStyle, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}>3</div>
                  <h2 style={{ fontSize: 15, fontWeight: 700 }}>Design Style</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  {STYLES.map(s => (
                    <button key={s.label} onClick={() => setStyle(s.label)} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${style === s.label ? 'white' : 'transparent'}`, padding: 0, background: 'none', transform: style === s.label ? 'scale(1.04)' : 'scale(1)', transition: 'all 0.2s', boxShadow: style === s.label ? '0 0 0 1px rgba(255,255,255,0.2),0 8px 24px rgba(0,0,0,0.4)' : 'none' }}>
                      <img src={s.img} alt={s.label} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 55%)' }} />
                      {style === s.label && <div style={{ position: 'absolute', inset: 0, background: 'rgba(79,124,255,0.18)' }} />}
                      <div style={{ position: 'absolute', bottom: 6, left: 8 }}><p style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{s.label}</p></div>
                      {style === s.label && <div style={{ position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#4f7cff', fontWeight: 900 }}>✓</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div style={{ ...cardStyle, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}>4</div>
                  <h2 style={{ fontSize: 15, fontWeight: 700 }}>Describe Your Vision <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(optional)</span></h2>
                </div>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. Warm amber lighting, walnut furniture, floor-to-ceiling curtains, cozy reading corner..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', color: 'white', fontSize: 14, lineHeight: 1.7, minHeight: 100, resize: 'none', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(79,124,255,0.4)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>💡 Be specific about colors, materials, lighting and furniture for best results.</p>
              </div>

              {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#fca5a5' }}>⚠️ {error}</div>}
            </div>

            {/* Sidebar */}
            <div style={{ position: 'sticky', top: 80 }}>
              <div style={{ ...cardStyle, padding: 22 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Design Summary</h3>
                <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 18, position: 'relative' }}>
                  <img src={STYLES.find(s => s.label === style)?.img} alt={style} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 50%)' }} />
                  <div style={{ position: 'absolute', bottom: 10, left: 12 }}><p style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{style} Style</p></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[{ l: 'Room', v: room }, { l: 'Style', v: style }, { l: 'Photo', v: file ? '✓ Uploaded' : 'AI will generate' }, { l: 'Prompt', v: prompt ? '✓ Added' : 'None' }].map(({ l, v }) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</span>
                      <span style={{ color: v.startsWith('✓') ? '#4ade80' : 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 18 }}>
                  <button onClick={handleGenerate} disabled={loading} style={{
                    width: '100%', padding: 14, borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer', border: 'none',
                    background: 'linear-gradient(135deg,#4f7cff,#8b5cf6)', color: 'white',
                    boxShadow: '0 8px 24px rgba(79,124,255,0.35)', opacity: loading ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'transform 0.15s',
                  }}
                    onMouseOver={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    {loading ? (<><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Generating...</>) : '✦  Generate Design'}
                  </button>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 10 }}>Uses 1 credit · ~10 seconds</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat */
          <div style={{ maxWidth: 680 }}>
            <div style={{ ...cardStyle, borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 520 }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg,#4f7cff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🤖</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>AI Design Consultant</p>
                  <p style={{ fontSize: 12, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />Online</p>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
                    {m.role === 'assistant' && <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#4f7cff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginTop: 2 }}>🤖</div>}
                    <div style={{ maxWidth: '80%', borderRadius: 14, padding: '10px 14px', fontSize: 14, lineHeight: 1.7, background: m.role === 'user' ? 'white' : 'rgba(255,255,255,0.06)', color: m.role === 'user' ? 'black' : 'rgba(255,255,255,0.85)', border: m.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none', borderTopLeftRadius: m.role === 'assistant' ? 4 : 14, borderTopRightRadius: m.role === 'user' ? 4 : 14 }}>{m.text}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#4f7cff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🤖</div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, borderTopLeftRadius: 4, padding: '12px 16px', display: 'flex', gap: 4 }}>
                      {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', animation: `bounce 1s ${i * 0.15}s ease-in-out infinite` }} />)}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 6 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }}
                    placeholder="Describe your room or ask for design advice..." style={{ flex: 1, background: 'none', border: 'none', color: 'white', fontSize: 14, padding: '6px 8px', outline: 'none', fontFamily: 'inherit' }} />
                  <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading} style={{ width: 34, height: 34, borderRadius: 9, background: chatInput.trim() ? 'white' : 'rgba(255,255,255,0.1)', border: 'none', color: chatInput.trim() ? 'black' : 'rgba(255,255,255,0.3)', cursor: chatInput.trim() ? 'pointer' : 'default', fontSize: 16, flexShrink: 0, transition: 'all 0.2s' }}>→</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </main>
  )
}
