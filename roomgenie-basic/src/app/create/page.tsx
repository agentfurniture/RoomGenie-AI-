'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'

/* ─── TYPES ───────────────────────────────────────────────────────── */
type LayoutJSON = {
  dimensions: { widthFt: number; lengthFt: number; heightFt: number; sqft: number }
  furniture:  Array<{ id: string; type: string; label: string; color: string; material: string; xFrac: number; yFrac: number; wFrac: number; dFrac: number; heightFt: number; rotation: number; preserved: boolean; notes: string }>
  floor:   { material: string; color: string }
  walls:   { color: string; material: string; accentWall?: string }
  palette: { primary: string; secondary: string; accent: string; neutral: string }
}

function hexToRgb(hex: string): [number, number, number] {
  const h = (hex || '#888888').replace('#', '')
  if (h.length !== 6) return [0.5, 0.5, 0.5]
  return [parseInt(h.slice(0,2),16)/255, parseInt(h.slice(2,4),16)/255, parseInt(h.slice(4,6),16)/255]
}

/* ─── 3D ROOM VIEWER ─────────────────────────────────────────────── */
// ─── COLOR UTILITIES ──────────────────────────────────────────────────────────
function parseHex(hex: string): [number, number, number] {
  const h = (hex || '#8B8680').replace('#', '').padEnd(6, '0')
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]
}
function rgb(hex: string, lighten = 0, darken = 0): string {
  const [r,g,b] = parseHex(hex)
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + lighten * 255 - darken * 255)))
  return `rgb(${f(r)},${f(g)},${f(b)})`
}
function rgba(hex: string, alpha: number, lighten = 0, darken = 0): string {
  const [r,g,b] = parseHex(hex)
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + lighten * 255 - darken * 255)))
  return `rgba(${f(r)},${f(g)},${f(b)},${alpha})`
}
function toHex(r: number, g: number, b: number): string {
  return '#' + [r,g,b].map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')
}
function lightenHex(hex: string, amt: number): string {
  const [r,g,b] = parseHex(hex)
  return toHex(r + amt*255, g + amt*255, b + amt*255)
}
function darkenHex(hex: string, amt: number): string {
  const [r,g,b] = parseHex(hex)
  return toHex(r - amt*255, g - amt*255, b - amt*255)
}
function mixHex(hex1: string, hex2: string, t: number): string {
  const [r1,g1,b1]=parseHex(hex1), [r2,g2,b2]=parseHex(hex2)
  return toHex(r1+(r2-r1)*t, g1+(g2-g1)*t, b1+(b2-b1)*t)
}

// Number badge colors — distinct per index
const BADGE_COLORS = ['#e53e3e','#dd6b20','#d69e2e','#38a169','#3182ce','#805ad5','#d53f8c','#2b6cb0','#276749','#744210']
function badgeColor(i: number) { return BADGE_COLORS[i % BADGE_COLORS.length] }

// ─── ISOMETRIC 3D ROOM VIEWER ─────────────────────────────────────────────────
function RoomViewer3D({ layoutJSON, style, roomType, onCapture }: {
  layoutJSON: LayoutJSON; style: string; roomType: string; onCapture?: (b64: string) => void
}) {
  const svgRef   = useRef<SVGSVGElement>(null)
  const rafRef   = useRef<number>(0)
  const degRef   = useRef<number>(225)  // start angle showing front-left corner like reference
  const [deg, setDeg]       = useState(225)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  const lastTsRef = useRef(0)

  useEffect(() => {
    function tick(ts: number) {
      const delta = ts - lastTsRef.current
      lastTsRef.current = ts
      if (!pausedRef.current && delta < 200) {
        degRef.current = (degRef.current + 0.35) % 360
        setDeg(Math.round(degRef.current))
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const VW = 700, VH = 480
  const { widthFt: W, lengthFt: L, heightFt: H } = layoutJSON.dimensions
  const wallC  = layoutJSON.walls.color  || '#F2EDE8'
  const floorC = layoutJSON.floor.color  || '#C4A882'
  const floorMat = layoutJSON.floor.material || 'hardwood'

  // Convert 3D room coords → SVG 2D via isometric-style projection with Y-rotation
  function proj(rx: number, ry: number, rz: number): [number, number] {
    const rad = degRef.current * Math.PI / 180
    const cx = W/2, cz = L/2
    const dx = rx - cx, dz = rz - cz
    const rx2 = dx * Math.cos(rad) - dz * Math.sin(rad) + cx
    const rz2 = dx * Math.sin(rad) + dz * Math.cos(rad) + cz
    // Isometric projection
    const sc  = Math.min(VW/(W+L+2)*0.68, VH/(H+(W+L)*0.45+2)*0.78)
    const ix  = (rx2 - rz2) * 0.65 * sc
    const iy  = (rx2 + rz2) * 0.30 * sc - ry * sc
    return [VW/2 + ix, VH*0.70 + iy]
  }

  function P(pts: [number,number][], fill: string, stroke: string, sw = 0.8, op = 1, dash = '') {
    return <polygon points={pts.map(p=>p.join(',')).join(' ')}
      fill={fill} stroke={stroke} strokeWidth={sw} opacity={op} strokeDasharray={dash}/>
  }

  // Determine visible walls based on rotation angle
  const a = degRef.current % 360
  const showBackWall  = true  // always visible
  const showLeftWall  = a < 180
  const showRightWall = a >= 180

  // ── ROOM SHELL ──────────────────────────────────────────────────────────────
  function Shell() {
    const f00=proj(0,0,0), fW0=proj(W,0,0), fWL=proj(W,0,L), f0L=proj(0,0,L)
    const c00=proj(0,H,0), cW0=proj(W,H,0), cWL=proj(W,H,L), c0L=proj(0,H,L)

    // Floor with wood grain or tile pattern
    const floorFill = lightenHex(floorC, 0.08)
    const floorLines: JSX.Element[] = []
    if (floorMat === 'hardwood' || floorMat === 'wood') {
      for (let i = 0; i <= W * 2; i++) {
        const x = i * 0.5
        if (x > W) break
        const a2 = proj(x,0,0), b2 = proj(x,0,L)
        floorLines.push(<line key={`fh${i}`} x1={a2[0]} y1={a2[1]} x2={b2[0]} y2={b2[1]} stroke={darkenHex(floorC,0.08)} strokeWidth="0.5" opacity="0.35"/>)
      }
      for (let j = 0; j <= L; j += 1.5) {
        const a2 = proj(0,0,j), b2 = proj(W,0,j)
        floorLines.push(<line key={`fv${j}`} x1={a2[0]} y1={a2[1]} x2={b2[0]} y2={b2[1]} stroke={darkenHex(floorC,0.05)} strokeWidth="0.4" opacity="0.25"/>)
      }
    } else if (floorMat === 'tile' || floorMat === 'marble') {
      for (let i = 0; i <= W; i += 2) {
        const a2=proj(i,0,0),b2=proj(i,0,L)
        floorLines.push(<line key={`ti${i}`} x1={a2[0]} y1={a2[1]} x2={b2[0]} y2={b2[1]} stroke={darkenHex(floorC,0.12)} strokeWidth="0.8" opacity="0.4"/>)
      }
      for (let j = 0; j <= L; j += 2) {
        const a2=proj(0,0,j),b2=proj(W,0,j)
        floorLines.push(<line key={`tj${j}`} x1={a2[0]} y1={a2[1]} x2={b2[0]} y2={b2[1]} stroke={darkenHex(floorC,0.12)} strokeWidth="0.8" opacity="0.4"/>)
      }
    }

    // Wall panel moulding helper
    function wallPanel(pts: [number,number][], inset = 0.07) {
      // Returns inner rectangle slightly inset from the face for decorative panel
      const xs = pts.map(p=>p[0]), ys = pts.map(p=>p[1])
      const cxp = xs.reduce((a,b)=>a+b,0)/pts.length
      const cyp = ys.reduce((a,b)=>a+b,0)/pts.length
      const inner = pts.map(p => [cxp + (p[0]-cxp)*(1-inset), cyp + (p[1]-cyp)*(1-inset)] as [number,number])
      return <polygon points={inner.map(p=>p.join(',')).join(' ')} fill="none" stroke={rgba(wallC,0.35,0,-0.08)} strokeWidth="0.7"/>
    }

    // Back wall faces
    const backWall1 = [f00,fW0,cW0,c00]
    const leftWall  = [f0L,f00,c00,c0L]
    const rightWall = [fW0,fWL,cWL,cW0]

    // Window on back wall (centered upper third)
    const wWall = 'back'
    const winX0=W*.3, winX1=W*.7, winY0=H*.22, winY1=H*.80
    const wp=[proj(winX0,winY0,0),proj(winX1,winY0,0),proj(winX1,winY1,0),proj(winX0,winY1,0)]
    const winMid = [(wp[0][0]+wp[2][0])/2, (wp[0][1]+wp[2][1])/2] as [number,number]
    // Window frame subdivisions
    const wmidX = (winX0+winX1)/2
    const wH3 = winY0+(winY1-winY0)*0.45
    const winPanes = [
      [proj(winX0,winY0,0),proj(wmidX,winY0,0),proj(wmidX,wH3,0),proj(winX0,wH3,0)],
      [proj(wmidX,winY0,0),proj(winX1,winY0,0),proj(winX1,wH3,0),proj(wmidX,wH3,0)],
      [proj(winX0,wH3,0),proj(wmidX,wH3,0),proj(wmidX,winY1,0),proj(winX0,winY1,0)],
      [proj(wmidX,wH3,0),proj(winX1,wH3,0),proj(winX1,winY1,0),proj(wmidX,winY1,0)],
    ]

    // Ceiling
    const ceilPts = [c00,cW0,cWL,c0L]

    return (
      <g>
        {/* Floor */}
        <polygon points={[f00,fW0,fWL,f0L].map(p=>p.join(',')).join(' ')} fill={floorFill} stroke={darkenHex(floorC,0.2)} strokeWidth="1.5"/>
        {floorLines}

        {/* Back wall */}
        {showBackWall && <>
          <polygon points={backWall1.map(p=>p.join(',')).join(' ')} fill={rgb(wallC,0.03)} stroke={darkenHex(wallC,0.12)} strokeWidth="1"/>
          {/* Wall panels - elegant grid like reference image */}
          {[0,1,2].map(col => {
            const x0=W*(.08+col*.3), x1=W*(.28+col*.3)
            const pts: [number,number][] = [proj(x0,H*.08,0),proj(x1,H*.08,0),proj(x1,H*.88,0),proj(x0,H*.88,0)]
            return <g key={col}>
              <polygon points={pts.map(p=>p.join(',')).join(' ')} fill="none" stroke={rgba(wallC,0.4,0,0.07)} strokeWidth="1"/>
              {wallPanel(pts, 0.08)}
            </g>
          })}
          {/* Window */}
          <polygon points={wp.map(p=>p.join(',')).join(' ')} fill="rgba(200,230,255,0.18)" stroke={rgba(wallC,0.9,0,0.05)} strokeWidth="1.5"/>
          {winPanes.map((pane,i)=><polygon key={i} points={pane.map(p=>p.join(',')).join(' ')} fill="rgba(180,220,255,0.14)" stroke={rgba(wallC,0.7,0,0.05)} strokeWidth="0.8"/>)}
          {/* Window frame - outer */}
          <polygon points={wp.map(p=>p.join(',')).join(' ')} fill="none" stroke={darkenHex(wallC,0.15)} strokeWidth="1.8"/>
          {/* Curtains */}
          {[{x:winX0-W*.04,w:W*.06},{x:winX1,w:W*.06}].map((c2,ci)=>{
            const ct=[proj(c2.x,winY0*.8,0),proj(c2.x+c2.w,winY0*.8,0),proj(c2.x+c2.w,winY1,0),proj(c2.x,winY1,0)]
            return <polygon key={ci} points={ct.map(p=>p.join(',')).join(' ')}
              fill="rgba(180,140,80,0.6)" stroke="rgba(150,110,50,0.5)" strokeWidth="0.6"/>
          })}
        </>}

        {/* Left wall */}
        {showLeftWall && <>
          <polygon points={leftWall.map(p=>p.join(',')).join(' ')} fill={rgb(wallC,0.06)} stroke={darkenHex(wallC,0.15)} strokeWidth="1"/>
          {[0,1].map(row=>([H*.1+row*H*.5]).map(y0=>{
            const pts2: [number,number][]=[proj(0,y0,L*.1),proj(0,y0,L*.9),proj(0,y0+H*.35,L*.9),proj(0,y0+H*.35,L*.1)]
            return<g key={`lw${row}`}><polygon points={pts2.map(p=>p.join(',')).join(' ')} fill="none" stroke={rgba(wallC,0.35,0,0.06)} strokeWidth="0.7"/>{wallPanel(pts2)}</g>
          }))}
        </>}

        {/* Right wall */}
        {showRightWall && <>
          <polygon points={rightWall.map(p=>p.join(',')).join(' ')} fill={rgb(wallC,0,0.02)} stroke={darkenHex(wallC,0.12)} strokeWidth="1"/>
        </>}

        {/* Skirting boards */}
        <polygon points={[f00,fW0,proj(W,.14,0),proj(0,.14,0)].map(p=>p.join(',')).join(' ')} fill={lightenHex(wallC,0.1)} stroke={darkenHex(wallC,0.1)} strokeWidth="0.6"/>
        {showLeftWall && <polygon points={[f0L,f00,proj(0,.14,0),proj(0,.14,L)].map(p=>p.join(',')).join(' ')} fill={lightenHex(wallC,0.12)} stroke={darkenHex(wallC,0.1)} strokeWidth="0.6"/>}

        {/* Ceiling */}
        <polygon points={ceilPts.map(p=>p.join(',')).join(' ')} fill="rgba(255,255,255,0.55)" stroke={darkenHex(wallC,0.08)} strokeWidth="0.8"/>
        {/* Ceiling edges */}
        <line x1={c00[0]} y1={c00[1]} x2={cW0[0]} y2={cW0[1]} stroke={darkenHex(wallC,0.15)} strokeWidth="1.5"/>
        <line x1={c00[0]} y1={c00[1]} x2={c0L[0]} y2={c0L[1]} stroke={darkenHex(wallC,0.15)} strokeWidth="1.5"/>
        <line x1={cW0[0]} y1={cW0[1]} x2={cWL[0]} y2={cWL[1]} stroke={darkenHex(wallC,0.1)} strokeWidth="0.8" strokeDasharray="5,3"/>
        <line x1={c0L[0]} y1={c0L[1]} x2={cWL[0]} y2={cWL[1]} stroke={darkenHex(wallC,0.1)} strokeWidth="0.8" strokeDasharray="5,3"/>
        {/* Vertical wall edges */}
        <line x1={f00[0]} y1={f00[1]} x2={c00[0]} y2={c00[1]} stroke={darkenHex(wallC,0.22)} strokeWidth="2"/>
        <line x1={fW0[0]} y1={fW0[1]} x2={cW0[0]} y2={cW0[1]} stroke={darkenHex(wallC,0.12)} strokeWidth="1.2"/>
        <line x1={f0L[0]} y1={f0L[1]} x2={c0L[0]} y2={c0L[1]} stroke={darkenHex(wallC,0.12)} strokeWidth="1.2"/>

        {/* Ceiling recessed lights */}
        {[.25,.5,.75].map((xf,i)=>{
          const p2=proj(xf*W,H,L*.5)
          const lp=proj(xf*W,H*.92,L*.5)
          return <g key={i}>
            <ellipse cx={p2[0]} cy={p2[1]} rx={5} ry={2.5} fill="#fff8e8" stroke="#e0d090" strokeWidth="0.5"/>
            <ellipse cx={lp[0]} cy={lp[1]} rx={20} ry={8} fill="rgba(255,248,200,0.06)"/>
          </g>
        })}

        {/* Dimension labels */}
        {(()=>{
          const a2=proj(0,0,L), b2=proj(W,0,L)
          const mid: [number,number] = [(a2[0]+b2[0])/2,(a2[1]+b2[1])/2]
          return <text x={mid[0]} y={mid[1]+18} textAnchor="middle" fontSize="11" fill={darkenHex(floorC,0.35)} fontFamily="Arial,sans-serif" fontWeight="600">{W} ft</text>
        })()}
        {(()=>{
          const a2=proj(0,0,0), b2=proj(0,0,L)
          const mid: [number,number] = [(a2[0]+b2[0])/2-18,(a2[1]+b2[1])/2]
          return <text x={mid[0]} y={mid[1]} textAnchor="middle" fontSize="11" fill={darkenHex(floorC,0.35)} fontFamily="Arial,sans-serif" fontWeight="600" transform={`rotate(-32,${mid[0]},${mid[1]})`}>{L} ft</text>
        })()}
      </g>
    )
  }

  // ── FURNITURE PIECES ────────────────────────────────────────────────────────
  function FurniturePiece({ f, idx }: { f: LayoutJSON['furniture'][0]; idx: number }) {
    const x=f.xFrac*W, z=f.yFrac*L
    const fw=Math.max(f.wFrac*W, 0.12), fd=Math.max(f.dFrac*L, 0.12)
    const fh=Math.max(f.heightFt, 0.1)
    const fc=f.color||'#8B8680'
    const mat=(f.material||'').toLowerCase()
    const shiny = ['marble','metal','glass','chrome','brass','gold'].some(m=>mat.includes(m))
    const warm  = ['wood','walnut','oak','cherry','mahogany'].some(m=>mat.includes(m))

    // Color variations for realistic faces
    const topC  = lightenHex(fc, shiny ? 0.25 : 0.14)
    const leftC = darkenHex(fc, 0.10)
    const rightC= darkenHex(fc, 0.18)
    const bc     = badgeColor(idx)

    // Common face helpers
    const top  = [proj(x,fh,z), proj(x+fw,fh,z), proj(x+fw,fh,z+fd), proj(x,fh,z+fd)]
    const left = [proj(x,0,z+fd), proj(x+fw,0,z+fd), proj(x+fw,fh,z+fd), proj(x,fh,z+fd)]
    const right= [proj(x+fw,0,z), proj(x+fw,0,z+fd), proj(x+fw,fh,z+fd), proj(x+fw,fh,z)]

    // Badge position — top center of furniture
    const bpt  = proj(x+fw*.5, fh+.25, z+fd*.5)

    const badge = <g>
      <circle cx={bpt[0]} cy={bpt[1]} r={9} fill={bc} stroke="white" strokeWidth="1.5" opacity="0.95"/>
      <text x={bpt[0]} y={bpt[1]+3.5} textAnchor="middle" fontSize="9" fill="white" fontFamily="Arial,sans-serif" fontWeight="800">{idx+1}</text>
    </g>

    if (f.type==='rug') {
      const rpts=[proj(x,.03,z),proj(x+fw,.03,z),proj(x+fw,.03,z+fd),proj(x,.03,z+fd)]
      const rmid=proj(x+fw*.5,.03,z+fd*.5)
      return <g>
        <polygon points={rpts.map(p=>p.join(',')).join(' ')} fill={rgba(fc,0.7)} stroke={darkenHex(fc,0.2)} strokeWidth="0.8" strokeDasharray="3,2"/>
        {/* Rug border */}
        {(()=>{
          const ins=0.08
          const ir=[proj(x+fw*ins,.04,z+fd*ins),proj(x+fw*(1-ins),.04,z+fd*ins),proj(x+fw*(1-ins),.04,z+fd*(1-ins)),proj(x+fw*ins,.04,z+fd*(1-ins))]
          return <polygon points={ir.map(p=>p.join(',')).join(' ')} fill="none" stroke={darkenHex(fc,0.15)} strokeWidth="0.5"/>
        })()}
        <text x={rmid[0]} y={rmid[1]+3} textAnchor="middle" fontSize="8" fill={darkenHex(fc,0.45)} fontFamily="Arial,sans-serif">{f.label}</text>
      </g>
    }

    // Plant
    if (f.type==='plant'||f.type==='floor_plant') {
      const stem=proj(x+fw*.5,0,z+fd*.5)
      const top2=proj(x+fw*.5,fh,z+fd*.5)
      const pot=[proj(x+fw*.3,0,z+fd*.3),proj(x+fw*.7,0,z+fd*.3),proj(x+fw*.7,fh*.3,z+fd*.7),proj(x+fw*.3,fh*.3,z+fd*.7)]
      return <g>
        {P(pot,'#8B6A3E','#6B4A1E',.8)}
        <line x1={stem[0]} y1={stem[1]} x2={top2[0]} y2={top2[1]} stroke="#4a7c40" strokeWidth="1.5"/>
        {[0,.3,.6,1].map(t=>{
          const lp=proj(x+fw*.5,fh*t+fh*.3,z+fd*.5)
          return[-.35,-.2,.2,.35].map((dx2,li)=>{
            const lx2=proj(x+fw*.5+dx2,fh*(t+.15)+fh*.3,z+fd*.5+Math.abs(dx2)*.3)
            return <line key={`${t}${li}`} x1={lp[0]} y1={lp[1]} x2={lx2[0]} y2={lx2[1]} stroke={`hsl(${115+li*8},55%,${30+t*15}%)`} strokeWidth="2.5" strokeLinecap="round"/>
          })
        })}
      </g>
    }

    // Floor lamp
    if (f.type==='floor_lamp') {
      const base=proj(x+fw*.5,0,z+fd*.5)
      const top2=proj(x+fw*.5,fh*.88,z+fd*.5)
      const shade0=proj(x+fw*.15,fh*.72,z+fd*.2)
      const shade1=proj(x+fw*.85,fh*.72,z+fd*.2)
      const shade2=proj(x+fw*.85,fh,z+fd*.8)
      const shade3=proj(x+fw*.15,fh,z+fd*.8)
      return <g>
        <polygon points={[shade0,shade1,shade2,shade3].map(p=>p.join(',')).join(' ')} fill="rgba(240,220,160,0.82)" stroke="rgba(180,150,80,0.6)" strokeWidth="0.8"/>
        <line x1={base[0]} y1={base[1]} x2={top2[0]} y2={top2[1]} stroke="#a08060" strokeWidth="1.8" strokeLinecap="round"/>
        <ellipse cx={base[0]} cy={base[1]} rx={7} ry={3} fill="#7a6040" stroke="#5a4020" strokeWidth="0.7"/>
        <ellipse cx={proj(x+fw*.5,fh*.9,z+fd*.5)[0]} cy={proj(x+fw*.5,fh*.9,z+fd*.5)[1]} rx={16} ry={7} fill="rgba(255,240,180,0.12)"/>
        {badge}
      </g>
    }

    // Chandelier
    if (f.type==='chandelier') {
      const cp=proj(x+fw*.5,fh,z+fd*.5)
      const arms=6
      return <g>
        <ellipse cx={cp[0]} cy={cp[1]} rx={12} ry={6} fill="rgba(220,180,80,0.9)" stroke="#c0a040" strokeWidth="0.8"/>
        {Array.from({length:arms},(_,i)=>{
          const angle=i/arms*Math.PI*2
          const ep=proj(x+fw*.5+Math.cos(angle)*fw*.4,fh-.8,z+fd*.5+Math.sin(angle)*fd*.4)
          return <g key={i}>
            <line x1={cp[0]} y1={cp[1]} x2={ep[0]} y2={ep[1]} stroke="#c8a040" strokeWidth="0.8"/>
            <circle cx={ep[0]} cy={ep[1]} r={3} fill="rgba(255,240,160,0.95)" stroke="#e0b840" strokeWidth="0.5"/>
          </g>
        })}
        <circle cx={cp[0]} cy={cp[1]} r={6} fill="rgba(220,180,80,0.95)" stroke="#a07820" strokeWidth="1"/>
        {badge}
      </g>
    }

    // Sofa / chaise
    if (f.type==='sofa'||f.type==='chaise') {
      const armH=fh*.52, seatH=fh*.4, backH=fh
      // Back
      const back=[proj(x,backH*.35,z),proj(x+fw,backH*.35,z),proj(x+fw,backH,z),proj(x,backH,z)]
      const backTop=[proj(x,backH,z),proj(x+fw,backH,z),proj(x+fw,backH,z+fd*.2),proj(x,backH,z+fd*.2)]
      // Seat
      const seat=proj(x,seatH,z)
      const seatFace=[proj(x,seatH,z+fd*.65),proj(x+fw,seatH,z+fd*.65),proj(x+fw,0,z+fd*.65),proj(x,0,z+fd*.65)]
      const seatTop=[proj(x,seatH,z+fd*.1),proj(x+fw,seatH,z+fd*.1),proj(x+fw,seatH,z+fd*.65),proj(x,seatH,z+fd*.65)]
      // Arms
      const arm1=[proj(x,0,z),proj(x+fw*.09,0,z),proj(x+fw*.09,armH,z+fd*.7),proj(x,armH,z+fd*.7)]
      const arm2=[proj(x+fw*.91,0,z),proj(x+fw,0,z),proj(x+fw,armH,z+fd*.7),proj(x+fw*.91,armH,z+fd*.7)]
      // Cushions
      const cushW=fw/3
      return <g>
        {P(back, leftC, darkenHex(fc,.25),.8)}
        {P(backTop, topC, darkenHex(fc,.18),.7)}
        {P(seatFace, leftC, darkenHex(fc,.2),.8)}
        {P(seatTop, topC, darkenHex(fc,.15),.8)}
        {[0,1,2].map(ci=>{
          const cx2=x+cushW*ci+cushW*.05
          const cushTop=[proj(cx2,seatH+.08,z+fd*.12),proj(cx2+cushW*.9,seatH+.08,z+fd*.12),proj(cx2+cushW*.9,seatH+.08,z+fd*.58),proj(cx2,seatH+.08,z+fd*.58)]
          return <polygon key={ci} points={cushTop.map(p=>p.join(',')).join(' ')} fill={mixHex(fc,'#ffffff',0.15)} stroke={darkenHex(fc,.15)} strokeWidth=".5"/>
        })}
        {P(arm1, rightC, darkenHex(fc,.22),.8)}
        {P(arm2, rightC, darkenHex(fc,.22),.8)}
        {/* Legs */}
        {[[.08,.9],[.92,.9],[.08,.2],[.92,.2]].map(([lx,lz],li)=>{
          const legTop=proj(x+fw*lx,fh*.12,z+fd*lz)
          const legBot=proj(x+fw*lx,0,z+fd*lz)
          return <line key={li} x1={legTop[0]} y1={legTop[1]} x2={legBot[0]} y2={legBot[1]} stroke={darkenHex(fc,.3)} strokeWidth="1.5"/>
        })}
        {badge}
      </g>
    }

    // Bed
    if (f.type==='bed'||f.type==='murphy_bed') {
      const mattH=fh*.42, baseH=fh*.22
      // Platform
      const platFront=[proj(x,baseH,z+fd*.9),proj(x+fw,baseH,z+fd*.9),proj(x+fw,0,z+fd*.9),proj(x,0,z+fd*.9)]
      const platTop=[proj(x,baseH,z),proj(x+fw,baseH,z),proj(x+fw,baseH,z+fd*.9),proj(x,baseH,z+fd*.9)]
      // Mattress
      const mattFront=[proj(x+fw*.03,mattH,z+fd*.88),proj(x+fw*.97,mattH,z+fd*.88),proj(x+fw*.97,baseH,z+fd*.88),proj(x+fw*.03,baseH,z+fd*.88)]
      const mattTop=[proj(x+fw*.03,mattH,z+fw*.06),proj(x+fw*.97,mattH,z+fw*.06),proj(x+fw*.97,mattH,z+fd*.88),proj(x+fw*.03,mattH,z+fd*.88)]
      const mattLeft=[proj(x+fw*.03,baseH,z+fw*.06),proj(x+fw*.03,baseH,z+fd*.88),proj(x+fw*.03,mattH,z+fd*.88),proj(x+fw*.03,mattH,z+fw*.06)]
      // Headboard
      const hbFront=[proj(x,fh*.7,z+fd*.08),proj(x+fw,fh*.7,z+fd*.08),proj(x+fw,baseH,z+fd*.08),proj(x,baseH,z+fd*.08)]
      const hbTop=[proj(x,fh,z),proj(x+fw,fh,z),proj(x+fw,fh*.7,z+fd*.08),proj(x,fh*.7,z+fd*.08)]
      const hbPanel=[proj(x+fw*.06,fh*.92,z+fd*.04),proj(x+fw*.94,fh*.92,z+fd*.04),proj(x+fw*.94,baseH+.3,z+fd*.06),proj(x+fw*.06,baseH+.3,z+fd*.06)]
      // Pillows
      const pilC = lightenHex('#F5F5F0', 0.02)
      // Duvet
      const duvTop=[proj(x+fw*.04,mattH+.1,z+fd*.2),proj(x+fw*.96,mattH+.1,z+fd*.2),proj(x+fw*.96,mattH+.1,z+fd*.86),proj(x+fw*.04,mattH+.1,z+fd*.86)]
      return <g>
        {P(platFront, rightC, darkenHex(fc,.22),.9)}
        {P(platTop, topC, darkenHex(fc,.15),.9)}
        {P(hbFront, leftC, darkenHex(fc,.2),.95)}
        {P(hbTop, topC, darkenHex(fc,.15),.95)}
        <polygon points={hbPanel.map(p=>p.join(',')).join(' ')} fill="none" stroke={rgba(fc,0.5,0,0.1)} strokeWidth="0.7"/>
        {P(mattFront, '#F0EDE8', '#D0CCC8',.9)}
        {P(mattTop, '#F5F2EF', '#D8D4D0',.95)}
        {P(mattLeft, '#E8E5E0', '#C8C4C0',.9)}
        {P(duvTop, mixHex('#F0EDE8','#E8E0D4',0.5), darkenHex('#E8E0D4',0.08),.95)}
        {[.22,.62].map((px2,pi)=>{
          const pilW=fw*.22, pilD=fd*.16
          const pil=[proj(x+fw*px2,mattH+.18,z+fd*.12),proj(x+fw*px2+pilW,mattH+.18,z+fd*.12),proj(x+fw*px2+pilW,mattH+.18,z+fd*.12+pilD),proj(x+fw*px2,mattH+.18,z+fd*.12+pilD)]
          return <polygon key={pi} points={pil.map(p=>p.join(',')).join(' ')} fill={pilC} stroke="#D0CDCA" strokeWidth=".6"/>
        })}
        {badge}
      </g>
    }

    // Dining / coffee table
    if (['dining_table','coffee_table','island','side_table'].includes(f.type)) {
      const legH=fh*.88
      return <g>
        {P(right, rightC, darkenHex(fc,.22),.85)}
        {P(left,  leftC,  darkenHex(fc,.2),.85)}
        {P(top,   topC,   darkenHex(fc,.15),.9)}
        {/* Table legs */}
        {[[.08,.1],[.92,.1],[.08,.9],[.92,.9]].map(([lx,lz],li)=>{
          const lt=proj(x+fw*lx,legH,z+fd*lz), lb=proj(x+fw*lx,0,z+fd*lz)
          return<line key={li} x1={lt[0]} y1={lt[1]} x2={lb[0]} y2={lb[1]} stroke={darkenHex(fc,.28)} strokeWidth="1.8"/>
        })}
        {badge}
      </g>
    }

    // Desk
    if (f.type==='desk') {
      return <g>
        {P(right, rightC, darkenHex(fc,.22),.85)}
        {P(left,  leftC,  darkenHex(fc,.2),.85)}
        {P(top,   topC,   darkenHex(fc,.15),.9)}
        {[.05,.95].map((lx,li)=>{
          const lt=proj(x+fw*lx,fh*.92,z), lb=proj(x+fw*lx,0,z)
          const lt2=proj(x+fw*lx,fh*.92,z+fd), lb2=proj(x+fw*lx,0,z+fd)
          return <g key={li}>
            <line x1={lt[0]} y1={lt[1]} x2={lb[0]} y2={lb[1]} stroke={darkenHex(fc,.25)} strokeWidth="2"/>
            <line x1={lt2[0]} y1={lt2[1]} x2={lb2[0]} y2={lb2[1]} stroke={darkenHex(fc,.25)} strokeWidth="2"/>
          </g>
        })}
        {/* Monitor */}
        {(()=>{
          const mW=fw*.35, mH=fh*.55
          const mon=[proj(x+fw*.55,fh,z+fd*.15),proj(x+fw*.55+mW,fh,z+fd*.15),proj(x+fw*.55+mW,fh+mH,z+fd*.15),proj(x+fw*.55,fh+mH,z+fd*.15)]
          return<>
            <polygon points={mon.map(p=>p.join(',')).join(' ')} fill="rgba(10,15,30,.92)" stroke="#333" strokeWidth=".7"/>
            <polygon points={mon.slice(0,4).map((p,i)=>{
              const sc=0.08; const cx3=mon.reduce((a,b)=>[a[0]+b[0]/4,a[1]+b[1]/4],[0,0] as [number,number])
              return [cx3[0]+(p[0]-cx3[0])*(1-sc),cx3[1]+(p[1]-cx3[1])*(1-sc)].join(',')
            }).join(' ')} fill="rgba(20,80,160,.7)" stroke="none"/>
          </>
        })()}
        {badge}
      </g>
    }

    // Chair / armchair
    if (['chair','armchair','dining_chair','stool'].includes(f.type)) {
      const seatH2=fh*.42
      const seatFace2=[proj(x,seatH2,z+fd*.8),proj(x+fw,seatH2,z+fd*.8),proj(x+fw,0,z+fd*.8),proj(x,0,z+fd*.8)]
      const seatTop2=[proj(x,seatH2,z+fd*.1),proj(x+fw,seatH2,z+fd*.1),proj(x+fw,seatH2,z+fd*.8),proj(x,seatH2,z+fd*.8)]
      const backFace=[proj(x,fh,z+fd*.08),proj(x+fw,fh,z+fd*.08),proj(x+fw,seatH2,z+fd*.08),proj(x,seatH2,z+fd*.08)]
      return <g>
        {P(seatFace2, leftC, darkenHex(fc,.2),.85)}
        {P(seatTop2, topC, darkenHex(fc,.15),.9)}
        {f.type!=='stool'&&P(backFace, rightC, darkenHex(fc,.2),.85)}
        {[[.15,.15],[.85,.15],[.15,.85],[.85,.85]].map(([lx,lz],li)=>{
          const lt=proj(x+fw*lx,seatH2,z+fd*lz), lb=proj(x+fw*lx,0,z+fd*lz)
          return<line key={li} x1={lt[0]} y1={lt[1]} x2={lb[0]} y2={lb[1]} stroke={darkenHex(fc,.3)} strokeWidth="1.2"/>
        })}
        {badge}
      </g>
    }

    // Bookshelf / wardrobe / cabinet / sideboard
    if (['bookshelf','shelving','wardrobe','sideboard','cabinets_lower','tv_unit'].includes(f.type)) {
      const shCount=Math.max(2,Math.floor(fh/1.1))
      return <g>
        {P(right, rightC, darkenHex(fc,.22),.9)}
        {P(left,  darkenHex(fc,.06), darkenHex(fc,.2),.9)}
        {P(top,   topC, darkenHex(fc,.15),.9)}
        {Array.from({length:shCount-1},(_,si)=>{
          const sy=(si+1)*fh/shCount
          const sl=[proj(x,sy,z+fd),proj(x+fw,sy,z+fd)]
          return<line key={si} x1={sl[0][0]} y1={sl[0][1]} x2={sl[1][0]} y2={sl[1][1]} stroke={lightenHex(fc,.08)} strokeWidth="0.6"/>
        })}
        {/* Cabinet door handles */}
        {(()=>{
          const hm=proj(x+fw*.5,fh*.48,z+fd)
          return<circle cx={hm[0]} cy={hm[1]} r={2.5} fill={shiny?lightenHex(fc,.3):'#c8b080'} stroke="#a09060" strokeWidth=".5"/>
        })()}
        {f.type==='tv_unit'&&(()=>{
          const tv=[proj(x+fw*.1,fh,z+fd*.1),proj(x+fw*.9,fh,z+fd*.1),proj(x+fw*.9,fh+1.4,z+fd*.1),proj(x+fw*.1,fh+1.4,z+fd*.1)]
          const scr=[proj(x+fw*.12,fh+.06,z+fd*.08),proj(x+fw*.88,fh+.06,z+fd*.08),proj(x+fw*.88,fh+1.28,z+fd*.08),proj(x+fw*.12,fh+1.28,z+fd*.08)]
          return<>
            <polygon points={tv.map(p=>p.join(',')).join(' ')} fill="rgba(8,12,25,.95)" stroke="#222" strokeWidth=".8"/>
            <polygon points={scr.map(p=>p.join(',')).join(' ')} fill="rgba(15,60,140,.75)" stroke="none"/>
          </>
        })()}
        {badge}
      </g>
    }

    // Nightstand / dresser
    if (['nightstand','dresser','side_table_small'].includes(f.type)) {
      return <g>
        {P(right, rightC, darkenHex(fc,.22),.9)}
        {P(left,  leftC,  darkenHex(fc,.2),.9)}
        {P(top, shiny?lightenHex(fc,.22):topC, darkenHex(fc,.15),.95)}
        {/* Lamp on nightstand */}
        {(()=>{
          const lbp=proj(x+fw*.7,fh,z+fd*.5)
          const ltp=proj(x+fw*.7,fh+.9,z+fd*.5)
          const ls0=proj(x+fw*.55,fh+.9,z+fd*.3), ls1=proj(x+fw*.85,fh+.9,z+fd*.3)
          const ls2=proj(x+fw*.85,fh+.9+.8,z+fd*.7), ls3=proj(x+fw*.55,fh+.9+.8,z+fd*.7)
          return<>
            <line x1={lbp[0]} y1={lbp[1]} x2={ltp[0]} y2={ltp[1]} stroke="#9a8060" strokeWidth="1"/>
            <polygon points={[ls0,ls1,ls2,ls3].map(p=>p.join(',')).join(' ')} fill="rgba(255,230,150,0.8)" stroke="rgba(200,170,80,0.6)" strokeWidth=".6"/>
          </>
        })()}
        {badge}
      </g>
    }

    // Bathtub
    if (f.type==='bathtub') {
      const outer=[proj(x,fh,z),proj(x+fw,fh,z),proj(x+fw,fh,z+fd),proj(x,fh,z+fd)]
      const inner=[proj(x+fw*.08,fh*.72,z+fd*.1),proj(x+fw*.92,fh*.72,z+fd*.1),proj(x+fw*.92,fh*.72,z+fd*.9),proj(x+fw*.08,fh*.72,z+fd*.9)]
      return <g>
        {P(right, rightC, darkenHex(fc,.2),.9)}
        {P(left,  leftC,  darkenHex(fc,.18),.9)}
        {P(outer, topC, darkenHex(fc,.15),.9)}
        <polygon points={inner.map(p=>p.join(',')).join(' ')} fill="rgba(200,230,245,0.6)" stroke="#a0c8e0" strokeWidth=".7"/>
        {badge}
      </g>
    }

    // Toilet
    if (f.type==='toilet') {
      const tank=[proj(x,fh*.5,z),proj(x+fw,fh*.5,z),proj(x+fw,fh,z),proj(x,fh,z)]
      const bowl=[proj(x+fw*.08,fh*.3,z+fd*.2),proj(x+fw*.92,fh*.3,z+fd*.2),proj(x+fw*.92,fh*.3,z+fd*.95),proj(x+fw*.08,fh*.3,z+fd*.95)]
      return <g>
        {P([proj(x,0,z),proj(x+fw,0,z),proj(x+fw,fh*.5,z),proj(x,fh*.5,z)], leftC, darkenHex(fc,.2),.9)}
        {P(tank, topC, darkenHex(fc,.15),.9)}
        {P(bowl, lightenHex(fc,.1), darkenHex(fc,.12),.9)}
        {badge}
      </g>
    }

    // Vanity
    if (f.type==='vanity') {
      const mirH=fh*.7
      const mir=[proj(x,fh*.55,z+fd*.05),proj(x+fw,fh*.55,z+fd*.05),proj(x+fw,fh*.55+mirH,z+fd*.05),proj(x,fh*.55+mirH,z+fd*.05)]
      return <g>
        {P(right, rightC, darkenHex(fc,.22),.9)}
        {P(left,  leftC,  darkenHex(fc,.2),.9)}
        {P(top,   topC,   darkenHex(fc,.15),.9)}
        <polygon points={mir.map(p=>p.join(',')).join(' ')} fill="rgba(180,210,225,0.55)" stroke="rgba(160,190,210,0.8)" strokeWidth=".8"/>
        {badge}
      </g>
    }

    // Shower
    if (f.type==='shower') {
      const glass=[proj(x,0,z+fd*.9),proj(x+fw,0,z+fd*.9),proj(x+fw,fh,z+fd*.9),proj(x,fh,z+fd*.9)]
      const glassR=[proj(x+fw*.9,0,z),proj(x+fw*.9,0,z+fd*.9),proj(x+fw*.9,fh,z+fd*.9),proj(x+fw*.9,fh,z)]
      const base=[proj(x,0,z),proj(x+fw,0,z),proj(x+fw,.12,z+fd),proj(x,.12,z+fd)]
      return <g>
        {P(base, lightenHex(fc,.1), darkenHex(fc,.15),.9)}
        {P(glass, 'rgba(180,220,240,0.22)', 'rgba(150,200,230,0.7)',1)}
        {P(glassR, 'rgba(180,220,240,0.18)', 'rgba(150,200,230,0.5)',.8)}
        {badge}
      </g>
    }

    // Generic fallback — still looks decent
    return <g>
      {P(right, rightC, darkenHex(fc,.22),.88)}
      {P(left,  leftC,  darkenHex(fc,.2),.88)}
      {P(top,   topC,   darkenHex(fc,.15),.92)}
      {badge}
    </g>
  }

  // Sort back-to-front (painter's algorithm)
  const sorted = [...layoutJSON.furniture].sort((a,b) => {
    const rad=degRef.current*Math.PI/180
    const da=(a.xFrac+a.wFrac/2)*Math.sin(rad)+(a.yFrac+a.dFrac/2)*Math.cos(rad)
    const db=(b.xFrac+b.wFrac/2)*Math.sin(rad)+(b.yFrac+b.dFrac/2)*Math.cos(rad)
    return da-db
  })

  function captureForPhoto() {
    if(!svgRef.current||!onCapture)return
    const xml=new XMLSerializer().serializeToString(svgRef.current)
    const img=new Image()
    img.onload=()=>{
      const c=document.createElement('canvas'); c.width=VW; c.height=VH
      const ctx=c.getContext('2d')!
      ctx.fillStyle=lightenHex(wallC,.12); ctx.fillRect(0,0,VW,VH)
      ctx.drawImage(img,0,0)
      onCapture(c.toDataURL('image/png',1.0).split(',')[1])
    }
    img.src=`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(xml)))}`
  }

  const bgGrad = `linear-gradient(145deg, ${lightenHex(wallC,.16)} 0%, ${lightenHex(wallC,.06)} 100%)`

  return (
    <div style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${darkenHex(wallC,.06)}` }}>
      {/* Header bar */}
      <div style={{ background:bgGrad, padding:'8px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${darkenHex(wallC,.08)}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ background:'linear-gradient(135deg,#4f7cff,#7c3aed)', color:'white', borderRadius:7, padding:'3px 9px', fontSize:11, fontWeight:800 }}>3D Room</span>
          <span style={{ fontSize:11, color:darkenHex(wallC,.4), fontFamily:'inherit' }}>Linked · {W}′ × {L}′ · {H}ft ceiling</span>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={()=>{ pausedRef.current=!paused; setPaused(p=>!p) }}
            style={{ background: paused?'rgba(79,124,255,.15)':'rgba(79,124,255,.9)', border:`1px solid ${paused?'rgba(79,124,255,.4)':'rgba(79,124,255,.6)'}`, borderRadius:7, padding:'4px 11px', fontSize:11, fontWeight:700, color:paused?'#4f7cff':'white', cursor:'pointer', fontFamily:'inherit' }}>
            {paused ? '▶ Rotate' : '⏸ Pause'}
          </button>
          {onCapture && (
            <button onClick={captureForPhoto}
              style={{ background:'rgba(245,158,11,.88)', border:'none', borderRadius:7, padding:'4px 11px', fontSize:11, fontWeight:700, color:'white', cursor:'pointer', fontFamily:'inherit' }}>
              📸 Photo
            </button>
          )}
        </div>
      </div>

      {/* SVG viewport */}
      <div style={{ position:'relative', background:bgGrad }}>
        <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} width="100%" height="430"
          xmlns="http://www.w3.org/2000/svg" style={{ display:'block' }}>
          <defs>
            <radialGradient id="floorLight" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,240,0.12)"/>
              <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
            </radialGradient>
          </defs>
          <Shell/>
          {sorted.map((f,i)=>(
            <FurniturePiece key={f.id} f={f} idx={layoutJSON.furniture.findIndex(fi=>fi.id===f.id)}/>
          ))}
          {/* Ambient floor glow */}
          <ellipse cx={VW/2} cy={VH*.68} rx={VW*.4} ry={VH*.15} fill="url(#floorLight)"/>
        </svg>
      </div>

      {/* Furniture legend */}
      <div style={{ background:'white', borderTop:`1px solid ${darkenHex(wallC,.06)}`, padding:'10px 16px' }}>
        <div style={{ fontSize:10, fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.9px', marginBottom:8 }}>Furniture Legend</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'5px 12px' }}>
          {layoutJSON.furniture.map((f,i)=>(
            <div key={f.id} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
              <span style={{ width:16, height:16, borderRadius:4, background:badgeColor(i), color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:800, flexShrink:0 }}>{i+1}</span>
              <span style={{ width:10, height:10, borderRadius:2, background:f.color||'#888', border:'1px solid rgba(0,0,0,.1)', flexShrink:0 }}/>
              <span style={{ color:'#374151', lineHeight:1.3 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 2D FLOOR PLAN ────────────────────────────────────────────────────────────
function FloorPlan2D({ layoutJSON, style: styleProp, roomType: roomTypeProp }: {
  layoutJSON: LayoutJSON; style?: string; roomType?: string
}) {
  const MAIN_W=640, MAIN_H=520
  const LEGEND_W=160
  const TOTAL_W=MAIN_W+LEGEND_W
  const MARGIN_T=50, MARGIN_L=52, MARGIN_B=44, MARGIN_R=28
  const rW=MAIN_W-MARGIN_L-MARGIN_R, rH=MAIN_H-MARGIN_T-MARGIN_B
  const ox=MARGIN_L, oy=MARGIN_T
  const { widthFt:W, lengthFt:L } = layoutJSON.dimensions
  const scX=rW/W, scY=rH/L
  const wallC=layoutJSON.walls.color||'#F0EDE8'
  const floorC=layoutJSON.floor.color||'#C4A882'
  const floorMat=layoutJSON.floor.material||'hardwood'

  // Lighten/darken hex for SVG fills
  function lh(hex: string, a=.5): string {
    const[r,g,b]=parseHex(hex); const f=(v:number)=>Math.round(Math.min(v+a*255,255))
    return`#${f(r).toString(16).padStart(2,'0')}${f(g).toString(16).padStart(2,'0')}${f(b).toString(16).padStart(2,'0')}`
  }
  function dh(hex: string, a=.25): string {
    const[r,g,b]=parseHex(hex); const f=(v:number)=>Math.round(Math.max(v-a*255,0))
    return`#${f(r).toString(16).padStart(2,'0')}${f(g).toString(16).padStart(2,'0')}${f(b).toString(16).padStart(2,'0')}`
  }

  // Pixel coords from room coords
  const px = (x: number) => ox + x * scX
  const py = (z: number) => oy + z * scY

  // Floor pattern
  const floorPattern: JSX.Element[] = []
  if (floorMat==='hardwood'||floorMat==='wood') {
    for (let i=0;i<W*2;i++) {
      const x=i*0.5
      if(x>W) break
      floorPattern.push(<line key={`h${i}`} x1={px(x)} y1={oy} x2={px(x)} y2={oy+rH} stroke={dh(floorC,.06)} strokeWidth=".5" opacity=".4"/>)
    }
  } else if (floorMat==='tile'||floorMat==='marble') {
    for(let i=0;i<=W;i+=2) floorPattern.push(<line key={`ti${i}`} x1={px(i)} y1={oy} x2={px(i)} y2={oy+rH} stroke={dh(floorC,.1)} strokeWidth=".7" opacity=".4"/>)
    for(let j=0;j<=L;j+=2) floorPattern.push(<line key={`tj${j}`} x1={ox} y1={py(j)} x2={ox+rW} y2={py(j)} stroke={dh(floorC,.1)} strokeWidth=".7" opacity=".4"/>)
  }

  // Tick marks
  const hTicks=Array.from({length:Math.floor(W/2)+1},(_,i)=>{
    const x=px(i*2)
    return<g key={i}><line x1={x} y1={oy-8} x2={x} y2={oy-3} stroke="#888" strokeWidth="1"/><text x={x} y={oy-12} textAnchor="middle" fontSize="9" fill="#888" fontFamily="Arial,sans-serif">{i*2}'</text></g>
  })
  const vTicks=Array.from({length:Math.floor(L/2)+1},(_,i)=>{
    const y=py(i*2)
    return<g key={i}><line x1={ox-8} y1={y} x2={ox-3} y2={y} stroke="#888" strokeWidth="1"/><text x={ox-11} y={y} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="#888" fontFamily="Arial,sans-serif">{i*2}'</text></g>
  })

  // Door swing (bottom-right corner)
  const dX=px(W)-scX*2.5, dY=py(L), dR=scX*2.5

  function renderFP(f: LayoutJSON['furniture'][0], idx: number) {
    const fpx=px(f.xFrac*W), fpy=py(f.yFrac*L)
    const fpw=f.wFrac*W*scX, fph=f.dFrac*L*scY
    if(fpw<3||fph<3) return null
    const cx2=fpx+fpw/2, cy2=fpy+fph/2
    const bc=badgeColor(idx)
    const fs=Math.max(7.5,Math.min(11,fpw/7))
    const lbl=f.label.length>16?f.label.slice(0,15)+'…':f.label.toUpperCase()
    const fc2=f.color||'#8B8680'

    // Badge helper
    const badge2=(bx: number,by: number)=>(
      <g>
        <circle cx={bx} cy={by} r={7.5} fill={bc} stroke="white" strokeWidth="1.2"/>
        <text x={bx} y={by+3} textAnchor="middle" fontSize="8" fill="white" fontFamily="Arial,sans-serif" fontWeight="800">{idx+1}</text>
      </g>
    )

    if(f.type==='rug'){
      return<g key={f.id}>
        <rect x={fpx} y={fpy} width={fpw} height={fph} fill={rgba(fc2,0.55)} stroke={fc2} strokeWidth="1" strokeDasharray="4,3" rx="3"/>
        <rect x={fpx+4} y={fpy+4} width={fpw-8} height={fph-8} fill="none" stroke={dh(fc2,.1)} strokeWidth=".5" rx="2"/>
      </g>
    }
    if(f.type==='plant'||f.type==='floor_plant'){
      return<g key={f.id}>
        <circle cx={cx2} cy={cy2} r={Math.min(fpw,fph)/2} fill="rgba(60,140,60,0.7)" stroke="#2d6a2d" strokeWidth="1"/>
        {[0,72,144,216,288].map((a3,i)=>{
          const lx2=cx2+Math.cos(a3*Math.PI/180)*fpw*.38
          const ly=cy2+Math.sin(a3*Math.PI/180)*fph*.38
          return<ellipse key={i} cx={(cx2+lx2)/2} cy={(cy2+ly)/2} rx={fpw*.14} ry={fpw*.07} fill="rgba(50,130,50,0.8)" transform={`rotate(${a3},${(cx2+lx2)/2},${(cy2+ly)/2})`}/>
        })}
        {badge2(fpx+fpw-8,fpy+8)}
      </g>
    }
    if(f.type==='chandelier'){
      return<g key={f.id}>
        <circle cx={cx2} cy={cy2} r={Math.min(fpw,fph)/2} fill="rgba(220,180,80,0.3)" stroke="#c0a040" strokeWidth="1.5" strokeDasharray="3,2"/>
        <circle cx={cx2} cy={cy2} r={Math.min(fpw,fph)*.18} fill="rgba(220,180,80,0.8)" stroke="#a07820" strokeWidth="1"/>
        {badge2(fpx+fpw-8,fpy+8)}
      </g>
    }
    if(f.type==='bathtub'){
      return<g key={f.id}>
        <ellipse cx={cx2} cy={cy2} rx={fpw/2} ry={fph/2} fill={lh(fc2,.55)} stroke={dh(fc2,.18)} strokeWidth="1.5"/>
        <ellipse cx={cx2} cy={cy2+fph*.1} rx={fpw*.42} ry={fph*.36} fill="rgba(200,230,245,0.6)" stroke={dh(fc2,.1)} strokeWidth=".7"/>
        <circle cx={cx2} cy={fpy+fph*.12} r={fpw*.07} fill={dh(fc2,.15)}/>
        <text x={cx2} y={cy2+3} textAnchor="middle" fontSize={fs-1} fill={dh(fc2,.45)} fontFamily="Arial,sans-serif" fontWeight="700">{lbl}</text>
        {badge2(fpx+fpw-9,fpy+9)}
      </g>
    }
    if(f.type==='toilet'){
      return<g key={f.id}>
        <rect x={fpx} y={fpy} width={fpw} height={fph*.3} fill={lh(fc2,.55)} stroke={dh(fc2,.18)} strokeWidth="1.2" rx="2"/>
        <ellipse cx={cx2} cy={fpy+fph*.68} rx={fpw*.44} ry={fph*.3} fill={lh(fc2,.58)} stroke={dh(fc2,.18)} strokeWidth="1.2"/>
        {badge2(fpx+fpw-8,fpy+8)}
      </g>
    }
    if(f.type==='shower'){
      return<g key={f.id}>
        <rect x={fpx} y={fpy} width={fpw} height={fph} fill="rgba(190,225,240,0.3)" stroke="rgba(140,195,220,0.9)" strokeWidth="1.5" rx="2"/>
        <line x1={fpx} y1={fpy} x2={fpx+fpw} y2={fpy+fph} stroke="rgba(140,195,220,0.4)" strokeWidth=".6"/>
        <line x1={fpx+fpw} y1={fpy} x2={fpx} y2={fpy+fph} stroke="rgba(140,195,220,0.4)" strokeWidth=".6"/>
        <circle cx={fpx+fpw*.2} cy={fpy+fph*.2} r={fpw*.1} fill="rgba(100,170,200,0.6)" stroke="rgba(80,150,190,0.8)" strokeWidth=".8"/>
        {badge2(fpx+fpw-9,fpy+9)}
      </g>
    }
    if(f.type==='bed'||f.type==='murphy_bed'){
      return<g key={f.id}>
        <rect x={fpx} y={fpy} width={fpw} height={fph} fill={lh(fc2,.52)} stroke={dh(fc2,.2)} strokeWidth="1.5" rx="3"/>
        <rect x={fpx} y={fpy} width={fpw} height={fph*.18} fill={dh(fc2,.06)} stroke="none" rx="2"/>
        {[.2,.62].map((ppx,pi)=><ellipse key={pi} cx={fpx+fpw*ppx} cy={fpy+fph*.12} rx={fpw*.14} ry={fph*.07} fill={lh(fc2,.3)} stroke={dh(fc2,.1)} strokeWidth=".7"/>)}
        <rect x={fpx+fpw*.04} y={fpy+fph*.22} width={fpw*.92} height={fph*.72} fill={lh(fc2,.62)} stroke="none" rx="2"/>
        {fpw>35&&fph>22&&<text x={cx2} y={cy2+4} textAnchor="middle" fontSize={fs} fill={dh(fc2,.5)} fontFamily="Arial,sans-serif" fontWeight="700">{lbl}</text>}
        {badge2(fpx+fpw-9,fpy+9)}
      </g>
    }
    if(f.type==='sofa'||f.type==='chaise'){
      return<g key={f.id}>
        <rect x={fpx} y={fpy} width={fpw} height={fph} fill={lh(fc2,.5)} stroke={dh(fc2,.2)} strokeWidth="1.5" rx="4"/>
        <rect x={fpx} y={fpy} width={fpw} height={fph*.24} fill={dh(fc2,.06)} stroke="none" rx="3"/>
        {[0,1,2].map(ci=><rect key={ci} x={fpx+fpw/3*ci+2} y={fpy+fph*.26} width={fpw/3-4} height={fph*.65} fill={lh(fc2,.08)} stroke={dh(fc2,.1)} strokeWidth=".5" rx="3"/>)}
        {fpw>35&&fph>20&&<text x={cx2} y={cy2+4} textAnchor="middle" fontSize={fs} fill={dh(fc2,.5)} fontFamily="Arial,sans-serif">{lbl}</text>}
        {badge2(fpx+fpw-9,fpy+9)}
      </g>
    }
    // Default labelled box
    return<g key={f.id}>
      <rect x={fpx} y={fpy} width={fpw} height={fph} fill={lh(fc2,.52)} stroke={dh(fc2,.2)} strokeWidth="1.5" rx="2"/>
      {fpw>24&&fph>14&&<text x={cx2} y={cy2+4} textAnchor="middle" fontSize={fs} fill={dh(fc2,.5)} fontFamily="Arial,sans-serif" fontWeight="600">{lbl}</text>}
      {badge2(fpx+fpw-9,fpy+9)}
    </g>
  }

  return (
    <div style={{ borderRadius:16, overflow:'hidden', border:'1px solid #e8eaf0' }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${lh(wallC,.1)},${lh(wallC,.06)})`, padding:'8px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #e8eaf0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'white', borderRadius:7, padding:'3px 9px', fontSize:11, fontWeight:800 }}>Floor Plan</span>
          <span style={{ fontSize:11, color:'#64748b', fontFamily:'inherit' }}>Linked · Top View</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:20, padding:'3px 10px', fontSize:10, fontWeight:700, color:'#16a34a' }}>
          📐 Top View
        </div>
      </div>

      {/* SVG with side legend */}
      <svg viewBox={`0 0 ${TOTAL_W} ${MAIN_H}`} width="100%" xmlns="http://www.w3.org/2000/svg"
        style={{ display:'block', background:'#FAFAF8' }}>
        {/* Title */}
        <text x={MAIN_W/2} y={30} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1a1a2e" fontFamily="Arial,sans-serif">
          {styleProp} {roomTypeProp} · {W}′ × {L}′ · {layoutJSON.dimensions.sqft} sq ft
        </text>

        {/* Ticks */}
        {hTicks}{vTicks}

        {/* Floor */}
        <rect x={ox} y={oy} width={rW} height={rH} fill={lh(floorC,.72)} stroke="none"/>
        {floorPattern}

        {/* Walls */}
        <rect x={ox} y={oy} width={rW} height={rH} fill="none" stroke="#1a1a2e" strokeWidth="5" rx="1"/>

        {/* Inner wall line (thickness effect) */}
        <rect x={ox+4} y={oy+4} width={rW-8} height={rH-8} fill="none" stroke={lh(wallC,.2)} strokeWidth="1" opacity="0.5"/>

        {/* Door swing */}
        <line x1={dX} y1={dY} x2={dX+dR} y2={dY} stroke="#444" strokeWidth="2.5" strokeLinecap="round"/>
        <path d={`M${dX} ${dY} A${dR} ${dR} 0 0 1 ${dX} ${dY-dR}`} fill="none" stroke="#666" strokeWidth="1" strokeDasharray="4,2"/>

        {/* Window on top wall */}
        <rect x={px(W*.3)} y={oy-1} width={px(W*.7)-px(W*.3)} height={5} fill="rgba(180,220,255,0.7)" stroke="rgba(100,160,220,0.8)" strokeWidth="1"/>

        {/* Furniture */}
        {layoutJSON.furniture.map((f,i)=>renderFP(f,i))}

        {/* Dimension arrows */}
        <defs><marker id="ar2" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L0,7 L7,3.5 z" fill="#555"/></marker></defs>
        <line x1={ox} y1={oy+rH+26} x2={ox+rW} y2={oy+rH+26} stroke="#555" strokeWidth="1.2" markerStart="url(#ar2)" markerEnd="url(#ar2)"/>
        <text x={ox+rW/2} y={oy+rH+40} textAnchor="middle" fontSize="11" fill="#555" fontFamily="Arial,sans-serif" fontWeight="600">{W} ft</text>
        <line x1={ox+rW+24} y1={oy} x2={ox+rW+24} y2={oy+rH} stroke="#555" strokeWidth="1.2" markerStart="url(#ar2)" markerEnd="url(#ar2)"/>
        <text x={ox+rW+38} y={oy+rH/2} textAnchor="middle" fontSize="11" fill="#555" fontFamily="Arial,sans-serif" fontWeight="600" transform={`rotate(-90,${ox+rW+38},${oy+rH/2})`}>{L} ft</text>

        {/* ── SIDE LEGEND ── */}
        <rect x={MAIN_W} y={0} width={LEGEND_W} height={MAIN_H} fill="#f8fafc"/>
        <line x1={MAIN_W} y1={0} x2={MAIN_W} y2={MAIN_H} stroke="#e2e8f0" strokeWidth="1"/>
        <text x={MAIN_W+12} y={24} fontSize="10" fontWeight="800" fill="#64748b" fontFamily="Arial,sans-serif" letterSpacing="0.8">FLOOR PLAN</text>
        <text x={MAIN_W+12} y={36} fontSize="10" fontWeight="800" fill="#64748b" fontFamily="Arial,sans-serif" letterSpacing="0.8">LEGEND</text>
        {layoutJSON.furniture.map((f,i)=>{
          const ly=52+i*20
          if(ly>MAIN_H-10) return null
          const bc2=badgeColor(i)
          return <g key={f.id}>
            <circle cx={MAIN_W+14} cy={ly} r={7} fill={bc2} stroke="white" strokeWidth="1"/>
            <text x={MAIN_W+14} y={ly+3} textAnchor="middle" fontSize="7.5" fill="white" fontFamily="Arial,sans-serif" fontWeight="800">{i+1}</text>
            <rect x={MAIN_W+25} y={ly-5} width={10} height={10} fill={lh(f.color||'#888',.5)} stroke={dh(f.color||'#888',.15)} strokeWidth="1" rx="2"/>
            <text x={MAIN_W+38} y={ly+3} fontSize="9.5" fill="#374151" fontFamily="Arial,sans-serif">{f.label.length>14?f.label.slice(0,13)+'…':f.label}</text>
          </g>
        })}
      </svg>
    </div>
  )
}


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
  floorPlan: string | null
  hasDimensions: boolean
  dimensions: { w: string; l: string; h: string; sqft: number } | null
  layoutJSON: LayoutJSON | null
  design: {
    title?: string; tagline?: string; description?: string; spatialNote?: string
    colors?: string[]; furniture?: string[]; tips?: string[]; materials?: string[]
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
    const d    = result.design
    const dims = result.dimensions
    const lj   = result.layoutJSON
    const [activeTab, setActiveTab] = useState<'3d'|'plan'>('3d')

    if (!lj) return (
      <div style={{ textAlign:'center', padding:40, color:'#64748b' }}>
        No layout data. Please regenerate your design.
      </div>
    )

    return (
      <div ref={resultRef} style={{ marginTop:36, borderTop:'2px solid #e0e7ff', paddingTop:32 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:100, padding:'5px 16px', fontSize:12, fontWeight:700, color:'#16a34a', marginBottom:10 }}>
            <span style={{ width:7,height:7,borderRadius:'50%',background:'#16a34a',display:'inline-block' }}/> 2 Views Generated · Linked
          </div>
          <h2 style={{ fontSize:24, fontWeight:900, letterSpacing:'-.6px', color:'#0f172a', margin:'0 0 5px' }}>
            {d?.title || `${style} ${roomType}`}
          </h2>
          <p style={{ fontSize:14, color:'#64748b', margin:'0 0 10px' }}>{d?.tagline || 'A beautifully designed space'}</p>
          {dims && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:100, padding:'4px 14px', fontSize:12, fontWeight:600, color:'#4f7cff' }}>
              📐 {dims.w}×{dims.l}ft · {dims.sqft} sq ft · {dims.h}ft ceiling
            </div>
          )}
        </div>

        {/* Side-by-side badges */}
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:18, flexWrap:'wrap' }}>
          {[
            ['2','linear-gradient(135deg,#4f7cff,#7c3aed)','3D Room Viewer','Rotating · Draggable'],
            ['3','linear-gradient(135deg,#10b981,#059669)','Floor Plan','All furniture labelled'],
          ].map(([n,color,label,sub])=>(
            <div key={n} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 14px', background:'white', borderRadius:10, border:'1.5px solid #e8eaf0', fontSize:12, fontWeight:700, color:'#0f172a', boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
              <span style={{ width:22,height:22,borderRadius:6,background:color,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,flexShrink:0 }}>{n}</span>
              <div>
                <div style={{ fontWeight:700, color:'#0f172a' }}>{label}</div>
                <div style={{ fontSize:10, color:'#94a3b8', fontWeight:400 }}>{sub}</div>
              </div>
              <span style={{ fontSize:10, color:'#16a34a', fontWeight:700, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:20, padding:'2px 7px' }}>Linked</span>
            </div>
          ))}
        </div>

        {/* Tab selector — only 2 tabs */}
        <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:12, padding:4, marginBottom:16 }}>
          {([
            ['3d','3D','3D Room Viewer','Rotating isometric','linear-gradient(135deg,#4f7cff,#7c3aed)'],
            ['plan','2D','Floor Plan','All furniture labelled','linear-gradient(135deg,#10b981,#059669)'],
          ] as const).map(([id,icon,label,sub,color])=>(
            <button key={id} onClick={()=>setActiveTab(id)}
              style={{ flex:1, padding:'12px 8px', background:activeTab===id?'white':'transparent', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit', transition:'all .2s', boxShadow:activeTab===id?'0 2px 10px rgba(0,0,0,.07)':'none' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <div style={{ width:26,height:26,borderRadius:8,background:activeTab===id?color:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:activeTab===id?'white':'#94a3b8',fontWeight:800,transition:'all .2s' }}>{icon}</div>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:activeTab===id?'#0f172a':'#64748b' }}>{label}</div>
                  <div style={{ fontSize:10, color:'#94a3b8' }}>{sub}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── 3D TAB ── */}
        {activeTab==='3d' && (
          <div>
            <RoomViewer3D layoutJSON={lj} style={style} roomType={roomType}/>
            {dims && <div style={{ marginTop:6, fontSize:11, color:'#64748b', textAlign:'center' }}>
              📐 {dims.w}×{dims.l}ft · {dims.sqft} sq ft · {dims.h}ft ceiling
            </div>}
            <div style={{ marginTop:10, background:'#f0f4ff', border:'1px solid #c7d2fe', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#4f7cff', lineHeight:1.7 }}>
              💡 <strong>Pause</strong> to stop rotation · Furniture numbered and colour-coded · Switch to <strong>Floor Plan</strong> for the top-down layout
            </div>
          </div>
        )}

        {/* ── FLOOR PLAN TAB ── */}
        {activeTab==='plan' && (
          <div>
            <FloorPlan2D layoutJSON={lj} style={style} roomType={roomType}/>
            <div style={{ marginTop:10, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#166534', lineHeight:1.7 }}>
              💡 Every piece of furniture is numbered and colour-coded to match the <strong>3D Viewer</strong> legend. Dimensions shown to scale.
            </div>
          </div>
        )}

        {/* Description */}
        {d?.description && (
          <div style={{ marginTop:16, background:'#f8faff', border:'1px solid #e0e7ff', borderRadius:14, padding:'16px 20px' }}>
            <p style={{ fontSize:14, color:'#374151', lineHeight:1.8, margin:0 }}>{d.description}</p>
            {d.spatialNote && <p style={{ fontSize:13, color:'#4f7cff', lineHeight:1.7, margin:'10px 0 0', fontStyle:'italic', borderTop:'1px solid #e0e7ff', paddingTop:10 }}>📐 {d.spatialNote}</p>}
          </div>
        )}

        {/* Details grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:14 }}>
          {d?.colors && (d.colors as string[]).length>0 && (
            <div style={{ background:'white', border:'1px solid #e8eaf0', borderRadius:12, padding:14 }}>
              <h4 style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 10px' }}>Palette</h4>
              {(d.colors as string[]).map((c,i)=>{
                const[hex,name]=c.includes(' - ')?c.split(' - '):[c,c]
                return<div key={i} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
                  <div style={{ width:20,height:20,borderRadius:5,background:hex.startsWith('#')?hex:'#e2e8f0',border:'1px solid rgba(0,0,0,.08)',flexShrink:0 }}/>
                  <span style={{ fontSize:11, color:'#374151' }}>{name}</span>
                </div>
              })}
            </div>
          )}
          {d?.materials && (d.materials as string[]).length>0 && (
            <div style={{ background:'white', border:'1px solid #e8eaf0', borderRadius:12, padding:14 }}>
              <h4 style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 10px' }}>Materials</h4>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {(d.materials as string[]).map((m,i)=><span key={i} style={{ background:'#f0f4ff', border:'1px solid #c7d2fe', borderRadius:20, padding:'3px 9px', fontSize:10, fontWeight:600, color:'#4f7cff' }}>{m}</span>)}
              </div>
            </div>
          )}
          <div style={{ background:'white', border:'1px solid #e8eaf0', borderRadius:12, padding:14 }}>
            <h4 style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 10px' }}>Design Brief</h4>
            {[['Style',style],['Room',roomType],['Size',dims?`${dims.w}×${dims.l}ft`:'—'],['Ceiling',dims?.h?`${dims.h}ft`:'—'],['AI','Claude']].map(([l,v])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:11, padding:'4px 0', borderBottom:'1px solid #f8faff' }}>
                <span style={{ color:'#94a3b8' }}>{l}</span>
                <span style={{ color:'#0f172a', fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {d?.tips && (d.tips as string[]).length>0 && (
          <div style={{ background:'white', border:'1px solid #e8eaf0', borderRadius:12, padding:14, marginTop:12 }}>
            <h4 style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 10px' }}>Designer Tips</h4>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              {(d.tips as string[]).map((t,i)=><div key={i} style={{ fontSize:12, color:'#374151', display:'flex', gap:7, lineHeight:1.6 }}><span style={{ color:'#16a34a', fontWeight:800, flexShrink:0 }}>✓</span>{t}</div>)}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:10, marginTop:16, flexWrap:'wrap' }}>
          <button onClick={()=>{navigator.clipboard.writeText(window.location.href);setCopied(true);setTimeout(()=>setCopied(false),2000)}}
            style={{...s.btnSecondary}}>
            {copied?'✓ Copied!':'🔗 Share'}
          </button>
          <button onClick={()=>{setResult(null);setStep(0);window.scrollTo({top:0,behavior:'smooth'})}}
            style={{ ...s.btnPrimary, flex:1, justifyContent:'center' }}>
            ✦ Generate New Design
          </button>
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
