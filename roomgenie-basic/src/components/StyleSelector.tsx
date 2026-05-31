'use client'

const STYLES = [
  { name: 'Modern',        img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=70&fit=crop', color: '#4f7cff', desc: 'Clean lines, neutral tones' },
  { name: 'Luxury',        img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&q=70&fit=crop', color: '#f59e0b', desc: 'Opulent, premium finishes' },
  { name: 'Minimalist',    img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&q=70&fit=crop', color: '#94a3b8', desc: 'Less is more' },
  { name: 'Scandinavian',  img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=70&fit=crop', color: '#22c55e', desc: 'Natural, cozy, functional' },
  { name: 'Industrial',    img: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=400&q=70&fit=crop', color: '#f97316', desc: 'Raw materials, exposed' },
  { name: 'Bohemian',      img: 'https://images.unsplash.com/photo-1522444195799-478538b28823?w=400&q=70&fit=crop', color: '#ec4899', desc: 'Eclectic, colorful' },
  { name: 'Japandi',       img: 'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?w=400&q=70&fit=crop', color: '#10b981', desc: 'Zen, harmonious' },
  { name: 'Contemporary',  img: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=400&q=70&fit=crop', color: '#8b5cf6', desc: 'Current, sophisticated' },
  { name: 'Mediterranean', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=70&fit=crop', color: '#06b6d4', desc: 'Warm, coastal vibes' },
  { name: 'Futuristic',    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70&fit=crop', color: '#6366f1', desc: 'Tech-forward, bold' },
]

interface StyleSelectorProps {
  selected: string
  onSelect: (style: string) => void
}

export default function StyleSelector({ selected, onSelect }: StyleSelectorProps) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {STYLES.map(s => (
          <button key={s.name} onClick={() => onSelect(s.name)} style={{
            position: 'relative', borderRadius: 12, overflow: 'hidden', border: `2px solid ${selected === s.name ? s.color : '#e2e8f0'}`,
            padding: 0, cursor: 'pointer', background: 'none', transition: 'all 0.2s',
            transform: selected === s.name ? 'scale(1.04)' : 'scale(1)',
            boxShadow: selected === s.name ? `0 0 0 3px ${s.color}25, 0 8px 20px rgba(0,0,0,0.12)` : '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <img src={s.img} alt={s.name} style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: selected === s.name ? `${s.color}22` : 'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 55%)' }} />
            {selected === s.name && (
              <div style={{ position: 'absolute', top: 5, right: 5, width: 18, height: 18, borderRadius: '50%', background: s.color, color: 'white', fontSize: 9, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 8px 6px', background: 'linear-gradient(to top,rgba(0,0,0,0.7),transparent)' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'white', textAlign: 'center' }}>{s.name}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export { STYLES }

