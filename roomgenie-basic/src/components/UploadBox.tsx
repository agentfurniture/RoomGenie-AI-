'use client'
import { useState, useCallback } from 'react'

interface UploadBoxProps {
  label: string
  hint?: string
  onFile: (file: File, preview: string) => void
  preview?: string | null
  onClear?: () => void
  accept?: string
  icon?: string
}

export default function UploadBox({ label, hint, onFile, preview, onClear, accept = 'image/*', icon = '📸' }: UploadBoxProps) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f, URL.createObjectURL(f))
  }, [onFile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onFile(f, URL.createObjectURL(f))
  }

  const inputId = `upload-${label.replace(/\s/g, '-')}`

  if (preview) return (
    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '2px solid #4f7cff' }}>
      <img src={preview} alt="Preview" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 50%)' }} />
      <div style={{ position: 'absolute', bottom: 12, left: 14, fontSize: 13, fontWeight: 700, color: 'white' }}>{label}</div>
      {onClear && (
        <button onClick={onClear} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✕</button>
      )}
    </div>
  )

  return (
    <label htmlFor={inputId} style={{ display: 'block', cursor: 'pointer' }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{ border: `2px dashed ${dragging ? '#4f7cff' : '#d1d5db'}`, background: dragging ? '#f0f4ff' : '#fafbff', borderRadius: 14, padding: '28px 20px', textAlign: 'center', transition: 'all 0.2s' }}
        onMouseOver={e => (e.currentTarget as HTMLElement).style.borderColor = '#4f7cff'}
        onMouseOut={e => (e.currentTarget as HTMLElement).style.borderColor = dragging ? '#4f7cff' : '#d1d5db'}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 4 }}>{label}</p>
        {hint && <p style={{ fontSize: 12, color: '#9ca3af' }}>{hint}</p>}
        <div style={{ marginTop: 12, display: 'inline-block', background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '6px 16px', fontSize: 12, fontWeight: 700, color: '#4f7cff' }}>Browse Files</div>
      </div>
      <input id={inputId} type="file" accept={accept} style={{ display: 'none' }} onChange={handleChange} />
    </label>
  )
}

