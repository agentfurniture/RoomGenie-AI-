'use client'
import { useState } from 'react'
import UploadBox from './UploadBox'

const FURNITURE_SLOTS = [
  { id: 'sofa',    label: 'Sofa / Couch',    icon: '🛋️', hint: 'Main seating piece' },
  { id: 'bed',     label: 'Bed Frame',        icon: '🛏️', hint: 'Bed or headboard' },
  { id: 'table',   label: 'Dining / Coffee',  icon: '🪑', hint: 'Table or chairs' },
  { id: 'tv',      label: 'TV Setup',         icon: '📺', hint: 'TV unit or wall setup' },
  { id: 'decor',   label: 'Decor Reference',  icon: '🖼️', hint: 'Art, plants, accessories' },
]

export type FurnitureFiles = Record<string, { file: File; preview: string }>

interface FurnitureUploaderProps {
  files: FurnitureFiles
  onChange: (files: FurnitureFiles) => void
}

export default function FurnitureUploader({ files, onChange }: FurnitureUploaderProps) {
  const [expanded, setExpanded] = useState(false)
  const count = Object.keys(files).length

  return (
    <div style={{ border: '1px solid #e8eaf0', borderRadius: 16, overflow: 'hidden', background: 'white' }}>
      <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '16px 20px', background: expanded ? '#f8faff' : 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: expanded ? '1px solid #e8eaf0' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: 'white', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛋️</div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Upload Your Furniture</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{count > 0 ? `${count} item${count > 1 ? 's' : ''} uploaded` : 'AI preserves your existing pieces'}</p>
          </div>
        </div>
        <span style={{ fontSize: 18, color: '#94a3b8', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>⌄</span>
      </button>

      {expanded && (
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 18, lineHeight: 1.6 }}>Upload photos of furniture you want to keep or include. The AI will incorporate these into your design.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {FURNITURE_SLOTS.map(slot => (
              <UploadBox
                key={slot.id}
                label={slot.label}
                hint={slot.hint}
                icon={slot.icon}
                preview={files[slot.id]?.preview}
                onFile={(file, preview) => onChange({ ...files, [slot.id]: { file, preview } })}
                onClear={() => {
                  const updated = { ...files }
                  delete updated[slot.id]
                  onChange(updated)
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

