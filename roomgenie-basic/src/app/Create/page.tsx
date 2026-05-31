'use client'
import { useState } from 'react'
import Link from 'next/link'
import UploadBox from '@/components/UploadBox'
import StyleSelector from '@/components/StyleSelector'
import RoomQuestionnaire, { type QuestionnaireAnswers } from '@/components/RoomQuestionnaire'
import FurnitureUploader, { type FurnitureFiles } from '@/components/FurnitureUploader'
import AIChat from '@/components/AIChat'
import BeforeAfter from '@/components/BeforeAfter'

const ROOM_TYPES = ['Living Room','Bedroom','Kitchen','Bathroom','Home Office','Dining Room','Kids Room','Master Suite','Studio']
const TABS = [
  { id: 'design',   icon: '✦', label: 'AI Design' },
  { id: 'consult',  icon: '💬', label: 'AI Consultant' },
]

type DesignResult = {
  image: string
  design: {
    title: string; tagline: string; description: string
    colors: string[]; furniture: string[]; tips: string[]; materials: string[]
  }
}

export default function CreatePage() {
  const [tab, setTab]             = useState('design')
  const [roomType, setRoomType]   = useState('Living Room')
  const [style, setStyle]         = useState('Modern')
  const [prompt, setPrompt]       = useState('')
  const [roomImg, setRoomImg]     = useState<{ file: File; preview: string } | null>(null)
  const [furniture, setFurniture] = useState<FurnitureFiles>({})
  const [answers, setAnswers]     = useState<QuestionnaireAnswers>({})
  const [dims, setDims]           = useState({ width: '', length: '', height: '' })
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [result, setResult]       = useState<DesignResult | null>(null)
  const [copied, setCopied]       = useState(false)

  async function handleGenerate() {
    setError(''); setLoading(true)
    try {
      const fd = new FormData()
      if (roomImg) fd.append('image', roomImg.file)
      fd.append('style', style)
      fd.append('roomType', roomType)
      fd.append('prompt', prompt)
      fd.append('answers', JSON.stringify(answers))
      fd.append('dimensions', JSON.stringify(dims))
      const furnitureNames = Object.keys(furniture).map(k => k)
      fd.append('furniture', JSON.stringify(furnitureNames))

      const res = await fetch('/api/generate', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
      setTimeout(() => document.getElementById('result-panel')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch { setError('Something went wrong. Please check your API key and try again.') }
    finally { setLoading(false) }
  }

  const card = { background: 'white', border: '1px solid #e8eaf0', borderRadius: 16 } as React.CSSProperties

  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#f8faff', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e8eaf0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 15 }}>R</div>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#1a1a2e' }}>RoomGenie <span style={{ background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span></span>
          </Link>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: tab === t.id ? 'white' : 'transparent',
                color: tab === t.id ? '#4f7cff' : '#64748b',
                boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}>{t.icon} {t.label}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
            <span style={{ color: '#94a3b8' }}>Free plan · 3 renders/mo</span>
            <Link href="/pricing" style={{ background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', padding: '7px 16px', borderRadius: 9, textDecoration: 'none', fontWeight: 700, fontSize: 12 }}>Upgrade Pro</Link>
          </div>
        </div>
      </nav>

      <div style={{ paddingTop: 60, maxWidth: 1400, margin: '0 auto', padding: '72px 24px 60px' }}>
        {tab === 'design' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

            {/* ── LEFT PANEL ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Room upload */}
              <div style={{ ...card, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Upload Your Room</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Optional — AI will create from scratch without a photo</p>
                  </div>
                </div>
                <UploadBox
                  label="Room Photo"
                  hint="JPG, PNG, WEBP — any angle works"
                  icon="📸"
                  preview={roomImg?.preview}
                  onFile={(file, preview) => setRoomImg({ file, preview })}
                  onClear={() => setRoomImg(null)}
                />
              </div>

              {/* Room type */}
              <div style={{ ...card, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Room Type</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ROOM_TYPES.map(r => (
                    <button key={r} onClick={() => setRoomType(r)} style={{
                      padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      border: `1.5px solid ${roomType === r ? '#4f7cff' : '#e2e8f0'}`,
                      background: roomType === r ? '#f0f4ff' : 'white',
                      color: roomType === r ? '#4f7cff' : '#64748b',
                      transition: 'all 0.15s',
                    }}>{r}</button>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div style={{ ...card, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Room Dimensions</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Optional — helps AI with furniture scale</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[['width', 'Width (ft)', '📐'], ['length', 'Length (ft)', '📏'], ['height', 'Ceiling Height', '🏠']].map(([k, label, icon]) => (
                    <div key={k}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>{icon} {label}</label>
                      <input
                        type="number" placeholder="e.g. 14"
                        value={dims[k as keyof typeof dims]}
                        onChange={e => setDims(d => ({ ...d, [k]: e.target.value }))}
                        style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#0f172a', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s', background: '#fafbff' }}
                        onFocus={e => e.currentTarget.style.borderColor = '#4f7cff'}
                        onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div style={{ ...card, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Design Style</p>
                </div>
                <StyleSelector selected={style} onSelect={setStyle} />
              </div>

              {/* Questionnaire */}
              <RoomQuestionnaire answers={answers} onChange={setAnswers} collapsed />

              {/* Furniture */}
              <FurnitureUploader files={furniture} onChange={setFurniture} />

              {/* Prompt */}
              <div style={{ ...card, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Describe Your Vision</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Any extra details, inspirations, or requirements</p>
                  </div>
                </div>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. I love warm amber lighting, want a reading nook by the window, prefer walnut wood with white walls, need hidden storage for books..."
                  style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', fontSize: 14, color: '#0f172a', lineHeight: 1.7, minHeight: 110, resize: 'none', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s', background: '#fafbff' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#4f7cff'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'} />
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>💡 Tip: Mention specific furniture brands, colors, or magazine images for reference</p>
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#dc2626' }}>
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* ── RIGHT PANEL ── */}
            <div style={{ position: 'sticky', top: 76, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Preview card */}
              <div style={{ ...card, padding: 22, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 18 }}>Design Summary</h3>

                {/* Style preview */}
                <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 18, position: 'relative' }}>
                  <img
                    src={`https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=70&fit=crop`}
                    alt={style}
                    style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 50%)' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: 'white', margin: 0 }}>{style}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{roomType}</p>
                  </div>
                </div>

                {/* Summary rows */}
                <div style={{ marginBottom: 20 }}>
                  {[
                    { l: 'Room', v: roomType },
                    { l: 'Style', v: style },
                    { l: 'Photo', v: roomImg ? '✓ Uploaded' : 'AI will create' },
                    { l: 'Furniture', v: Object.keys(furniture).length > 0 ? `${Object.keys(furniture).length} items` : 'None' },
                    { l: 'Preferences', v: Object.keys(answers).length > 0 ? `${Object.keys(answers).length}/7 answered` : 'Default' },
                    { l: 'Dimensions', v: dims.width ? `${dims.width}×${dims.length}ft` : 'Not specified' },
                  ].map(({ l, v }) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                      <span style={{ color: '#94a3b8' }}>{l}</span>
                      <span style={{ color: v.startsWith('✓') ? '#16a34a' : '#0f172a', fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Generate button */}
                <button onClick={handleGenerate} disabled={loading} style={{
                  width: '100%', padding: '16px', borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg,#4f7cff,#7c3aed)',
                  color: 'white', boxShadow: loading ? 'none' : '0 8px 24px rgba(79,124,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.2s',
                }}
                  onMouseOver={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(79,124,255,0.45)' } }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 8px 24px rgba(79,124,255,0.35)' }}>
                  {loading ? (
                    <><div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Generating Design...</>
                  ) : '✦ Generate AI Design'}
                </button>
                <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>Powered by Claude AI · ~5 seconds</p>
              </div>

              {/* Quick tips */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: 18 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>💡 Pro Tips</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Upload a room photo for best results', 'Fill the questionnaire for personalized designs', 'Be specific in your description'].map(t => (
                    <li key={t} style={{ fontSize: 12, color: '#78350f', display: 'flex', gap: 6 }}>
                      <span>→</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* ── CONSULTANT TAB ── */
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px', color: '#0f172a', marginBottom: 8 }}>AI Design Consultant</h2>
              <p style={{ fontSize: 15, color: '#64748b' }}>Get personalized interior design advice from Claude AI</p>
            </div>
            <div style={{ height: 580 }}>
              <AIChat />
            </div>
          </div>
        )}

        {/* ── RESULT SECTION ── */}
        {result && (
          <div id="result-panel" style={{ marginTop: 48 }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '6px 18px', fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 16 }}>
                <span>✓</span> AI Design Complete
              </div>
              <h2 style={{ fontSize: 'clamp(24px,3vw,40px)', fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', marginBottom: 6 }}>{result.design?.title}</h2>
              <p style={{ fontSize: 16, color: '#64748b' }}>{result.design?.tagline}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
              <div>
                {/* Before/After or just result */}
                {roomImg ? (
                  <BeforeAfter before={roomImg.preview} after={result.image} height={420} />
                ) : (
                  <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', position: 'relative' }}>
                    <img src={result.image} alt="AI Design" style={{ width: '100%', display: 'block', minHeight: 300, objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#4f7cff' }}>✦ Claude AI Design</div>
                  </div>
                )}

                {/* Description */}
                {result.design?.description && (
                  <div style={{ background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 16, padding: 22, marginTop: 20 }}>
                    <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, margin: 0 }}>{result.design.description}</p>
                  </div>
                )}

                {/* Colors + Furniture */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                  {result.design?.colors?.length > 0 && (
                    <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 20 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14, margin: '0 0 14px' }}>Color Palette</h4>
                      {result.design.colors.map((c, i) => {
                        const [hex, name] = c.includes(' - ') ? c.split(' - ') : [c, c]
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: hex.startsWith('#') ? hex : '#e2e8f0', border: '1px solid #e8eaf0', flexShrink: 0 }} />
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: 0 }}>{name}</p>
                              {hex.startsWith('#') && <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{hex}</p>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {result.design?.furniture?.length > 0 && (
                    <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 20 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 14px' }}>Key Pieces</h4>
                      {result.design.furniture.map((f, i) => (
                        <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 }}>
                          <span style={{ color: '#4f7cff', fontWeight: 800, flexShrink: 0 }}>→</span>{f}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tips */}
                {result.design?.tips?.length > 0 && (
                  <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 20, marginTop: 16 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 14px' }}>Designer Tips</h4>
                    {result.design.tips.map((t, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.7 }}>
                        <span style={{ color: '#16a34a', fontWeight: 800, flexShrink: 0 }}>✓</span>{t}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Result sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 22 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>Details</h3>
                  {[{ l: 'Style', v: style }, { l: 'Room', v: roomType }, { l: 'AI Model', v: 'Claude AI' }, { l: 'Status', v: '✓ Complete' }].map(({ l, v }) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#94a3b8' }}>{l}</span>
                      <span style={{ color: v === '✓ Complete' ? '#16a34a' : '#0f172a', fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <a href={result.image} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', padding: 14, borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 16px rgba(79,124,255,0.3)', transition: 'all 0.2s' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
                  ⬇ Save Image
                </a>

                <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{ padding: 14, borderRadius: 14, border: '1px solid #e2e8f0', background: 'white', color: copied ? '#16a34a' : '#374151', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {copied ? '✓ Link Copied!' : '🔗 Share Design'}
                </button>

                <button onClick={() => { setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={{ padding: 14, borderRadius: 14, border: '1.5px solid #4f7cff', background: '#f0f4ff', color: '#4f7cff', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                  🔄 Generate New Design
                </button>

                {result.design?.materials?.length > 0 && (
                  <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: 18 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 12px' }}>Materials Used</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {result.design.materials.map((m, i) => (
                        <span key={i} style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#4f7cff' }}>{m}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>
    </div>
  )
}
