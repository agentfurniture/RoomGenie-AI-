'use client'
import { useState, useRef } from 'react'

interface BeforeAfterProps {
  before: string
  after: string
  height?: number
}

export default function BeforeAfter({ before, after, height = 400 }: BeforeAfterProps) {
  const [pos, setPos] = useState(50)
  const ref = useRef<HTMLDivElement>(null)

  const move = (clientX: number) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    setPos(pct)
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height, borderRadius: 20, overflow: 'hidden', cursor: 'ew-resize', userSelect: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      onMouseMove={e => move(e.clientX)}
      onTouchMove={e => move(e.touches[0].clientX)}>
      {/* Before */}
      <img src={before} alt="Before" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* After */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: `${pos}%` }}>
        <img src={after} alt="After" style={{ position: 'absolute', top: 0, left: 0, width: ref.current?.offsetWidth || 800, height: '100%', objectFit: 'cover', maxWidth: 'none' }} />
      </div>
      {/* Divider */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: 3, background: 'white', transform: 'translateX(-50%)', zIndex: 10, boxShadow: '0 0 12px rgba(0,0,0,0.3)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 44, height: 44, borderRadius: '50%', background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#4f7cff' }}>⟺</div>
      </div>
      {/* Labels */}
      <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 5, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>BEFORE</div>
      <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 5, background: 'rgba(79,124,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#a0b4ff', border: '1px solid rgba(79,124,255,0.3)' }}>✦ AI AFTER</div>
    </div>
  )
}

