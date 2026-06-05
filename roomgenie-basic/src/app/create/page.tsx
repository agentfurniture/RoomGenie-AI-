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
// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────
function hx(hex: string): [number,number,number] {
  const h=(hex||'#888888').replace('#','')
  if(h.length!==6)return[.55,.5,.48]
  return[parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255]
}
function lx(hex:string,a=0.18):string{
  const[r,g,b]=hx(hex);const f=(v:number)=>Math.round(Math.min((v+a)*255,255))
  return`rgb(${f(r)},${f(g)},${f(b)})`
}
function dx(hex:string,a=0.15):string{
  const[r,g,b]=hx(hex);const f=(v:number)=>Math.round(Math.max((v-a)*255,0))
  return`rgb(${f(r)},${f(g)},${f(b)})`
}
function mx(hex:string,a=0.08):string{
  const[r,g,b]=hx(hex);const f=(v:number)=>Math.round(Math.min((v+a)*255,255))
  return`rgb(${f(r)},${f(g)},${f(b)})`
}

// ─── ISOMETRIC 3D ROOM VIEWER ─────────────────────────────────────────────────
function RoomViewer3D({ layoutJSON, style, roomType, onCapture }: {
  layoutJSON: LayoutJSON; style: string; roomType: string; onCapture?: (b64: string) => void
}) {
  const svgRef    = useRef<SVGSVGElement>(null)
  const rafIdRef  = useRef<number>(0)
  const angleRef  = useRef<number>(0)
  const [angleDeg, setAngleDeg] = useState(0)
  const [spinning, setSpinning] = useState(true)
  const spinRef = useRef(true)

  // Auto-rotate
  useEffect(() => {
    let last = 0
    function tick(ts: number) {
      if (spinRef.current) {
        const delta = ts - last
        if (delta > 16) {
          angleRef.current = (angleRef.current + 0.4) % 360
          setAngleDeg(Math.round(angleRef.current))
          last = ts
        }
      }
      rafIdRef.current = requestAnimationFrame(tick)
    }
    rafIdRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafIdRef.current)
  }, [])

  const VW = 680, VH = 460
  const { widthFt: W, lengthFt: L, heightFt: H } = layoutJSON.dimensions
  const wallC  = layoutJSON.walls.color  || '#F0EDE8'
  const floorC = layoutJSON.floor.color  || '#C4A882'
  const floorMat = layoutJSON.floor.material || 'hardwood'

  // Isometric projection — rotates around Y axis
  function project(rx: number, ry: number, rz: number): [number, number] {
    const rad = (angleRef.current * Math.PI) / 180
    // Rotate around room center
    const cx2 = W / 2, cz2 = L / 2
    const dx2 = rx - cx2, dz2 = rz - cz2
    const rx2 = dx2 * Math.cos(rad) - dz2 * Math.sin(rad) + cx2
    const rz2 = dx2 * Math.sin(rad) + dz2 * Math.cos(rad) + cz2
    const scale = Math.min(VW / (W + L + 4) * 0.72, VH / (H + (W + L) * 0.5 + 4) * 0.82)
    const ix = (rx2 - rz2) * 0.7 * scale
    const iy = (rx2 + rz2) * 0.32 * scale - ry * scale
    return [VW / 2 + ix, VH * 0.68 + iy]
  }

  function poly(pts:[number,number][], fill:string, stroke:string, sw=1, opacity=1, dash='') {
    return <polygon points={pts.map(p=>p.join(',')).join(' ')}
      fill={fill} stroke={stroke} strokeWidth={sw} opacity={opacity} strokeDasharray={dash}/>
  }

  // Room shell
  function shell() {
    const f00=project(0,0,0),fW0=project(W,0,0),fWL=project(W,0,L),f0L=project(0,0,L)
    const c00=project(0,H,0),cW0=project(W,H,0),cWL=project(W,H,L),c0L=project(0,H,L)

    // Determine which walls face viewer based on angle
    const a = ((angleRef.current % 360) + 360) % 360

    // Floor texture lines
    const floorLines: JSX.Element[] = []
    if (floorMat === 'hardwood' || floorMat === 'wood') {
      for (let i = 1; i < W * 2; i++) {
        const x = i * 0.5
        if (x <= W) floorLines.push(<line key={`fl${i}`}
          x1={project(x,0,0)[0]} y1={project(x,0,0)[1]}
          x2={project(x,0,L)[0]} y2={project(x,0,L)[1]}
          stroke={dx(floorC,0.08)} strokeWidth="0.4" opacity="0.45"/>)
      }
    }

    // Wall panels
    const wallPanels: JSX.Element[] = []
    if (a < 180) {
      // Back wall (far, z=0)
      wallPanels.push(<g key="bw">{poly([f00,fW0,cW0,c00], dx(wallC,0.04), dx(wallC,0.15),1.2)}
        {/* Panel moulding */}
        {[0.25,0.5,0.75].map(xf=>{
          const x=xf*W
          const b0=project(x-W*.1,H*.15,0),b1=project(x+W*.1,H*.15,0)
          const b2=project(x+W*.1,H*.72,0),b3=project(x-W*.1,H*.72,0)
          return<polygon key={xf} points={[b0,b1,b2,b3].map(p=>p.join(',')).join(' ')} fill="none" stroke={dx(wallC,0.12)} strokeWidth="0.7" opacity="0.5"/>
        })}
      </g>)
    }
    if (a >= 180 || true) {
      // Side wall (z=L)
      wallPanels.push(<g key="sw">{poly([f0L,f00,c00,c0L], lx(wallC,0.04), dx(wallC,0.15),1.2)}</g>)
    }

    return (
      <g>
        {/* Floor */}
        {poly([f00,fW0,fWL,f0L], lx(floorC,0.05), dx(floorC,0.2),1.5)}
        {floorLines}
        {/* Walls */}
        {wallPanels}
        {/* Ceiling edges */}
        <line x1={c00[0]} y1={c00[1]} x2={cW0[0]} y2={cW0[1]} stroke={dx(wallC,0.1)} strokeWidth="1.5"/>
        <line x1={c00[0]} y1={c00[1]} x2={c0L[0]} y2={c0L[1]} stroke={dx(wallC,0.1)} strokeWidth="1.5"/>
        <line x1={cW0[0]} y1={cW0[1]} x2={cWL[0]} y2={cWL[1]} stroke={dx(wallC,0.08)} strokeWidth="0.8" strokeDasharray="4,2"/>
        <line x1={c0L[0]} y1={c0L[1]} x2={cWL[0]} y2={cWL[1]} stroke={dx(wallC,0.08)} strokeWidth="0.8" strokeDasharray="4,2"/>
        {/* Vertical edges */}
        <line x1={f00[0]} y1={f00[1]} x2={c00[0]} y2={c00[1]} stroke={dx(wallC,0.2)} strokeWidth="1.5"/>
        <line x1={fW0[0]} y1={fW0[1]} x2={cW0[0]} y2={cW0[1]} stroke={dx(wallC,0.12)} strokeWidth="1"/>
        <line x1={f0L[0]} y1={f0L[1]} x2={c0L[0]} y2={c0L[1]} stroke={dx(wallC,0.12)} strokeWidth="1"/>
        {/* Window */}
        {(()=>{
          const wy0=H*.22,wy1=H*.82,wz0=L*.35,wz1=L*.65
          const wp=[project(W,wy0,wz0),project(W,wy0,wz1),project(W,wy1,wz1),project(W,wy1,wz0)]
          return<>
            {poly(wp,'rgba(180,220,255,0.22)','rgba(180,220,255,0.8)',1.2)}
            <line x1={project(W,wy0,(wz0+wz1)/2)[0]} y1={project(W,wy0,(wz0+wz1)/2)[1]} x2={project(W,wy1,(wz0+wz1)/2)[0]} y2={project(W,wy1,(wz0+wz1)/2)[1]} stroke="rgba(200,230,255,0.7)" strokeWidth="0.8"/>
          </>
        })()}
        {/* Skirting */}
        {poly([f00,fW0,project(W,.12,0),project(0,.12,0)], dx(wallC,0.02),dx(wallC,0.15),.6)}
        {poly([f00,f0L,project(0,.12,L),project(0,.12,0)], lx(wallC,0.06),dx(wallC,0.12),.6)}
        {/* Ceiling spot lights */}
        {[.25,.5,.75].map((xf,i)=>{
          const p=project(xf*W,H,L*.5)
          return<g key={i}>
            <ellipse cx={p[0]} cy={p[1]} rx={4} ry={2} fill="rgba(255,250,220,0.9)" stroke="rgba(200,190,160,0.5)" strokeWidth="0.5"/>
            <ellipse cx={p[0]} cy={p[1]+3} rx={12} ry={6} fill="rgba(255,248,200,0.08)"/>
          </g>
        })}
      </g>
    )
  }

  // Render one furniture piece as isometric box
  function renderPiece(f: LayoutJSON['furniture'][0], idx: number) {
    const x=f.xFrac*W, z=f.yFrac*L
    const fw=Math.max(f.wFrac*W,.1), fd=Math.max(f.dFrac*L,.1)
    const fh=Math.max(f.heightFt,.1)
    const fc=f.color||'#8B8680'
    const num=idx+1

    if(f.type==='rug'){
      const ps=[project(x,.01,z),project(x+fw,.01,z),project(x+fw,.01,z+fd),project(x,.01,z+fd)]
      const mid=project(x+fw/2,.01,z+fd/2)
      return<g key={f.id}>
        {poly(ps,fc+'55',dx(fc,.1),1,.8,'4,3')}
        <text x={mid[0]} y={mid[1]+3} textAnchor="middle" fontSize="7" fill={dx(fc,.4)} fontFamily="Arial,sans-serif">{f.label}</text>
      </g>
    }

    // Box faces
    const t=[project(x,fh,z),project(x+fw,fh,z),project(x+fw,fh,z+fd),project(x,fh,z+fd)]
    const lf=[project(x,0,z+fd),project(x+fw,0,z+fd),project(x+fw,fh,z+fd),project(x,fh,z+fd)]
    const rf=[project(x+fw,0,z),project(x+fw,0,z+fd),project(x+fw,fh,z+fd),project(x+fw,fh,z)]
    const mid=project(x+fw/2,fh,z+fd/2)

    // Number badge position (top center)
    const badge=project(x+fw/2,fh+.2,z+fd/2)

    return<g key={f.id}>
      {/* Left face */}
      {poly(lf, dx(fc,.12), dx(fc,.25), .7)}
      {/* Right face */}
      {poly(rf, dx(fc,.06), dx(fc,.22), .7)}
      {/* Top face */}
      {poly(t, lx(fc,.12), dx(fc,.18), .8)}

      {/* Special details */}
      {(f.type==='bed'||f.type==='murphy_bed')&&<>
        {/* Headboard */}
        {poly([project(x,0,z),project(x+fw,0,z),project(x+fw,fh*.7,z),project(x,fh*.7,z)],dx(fc,.04),dx(fc,.2),.7)}
        {/* Pillows */}
        {[.25,.65].map((px,pi)=>{
          const pw=fw*.22,pd=fd*.2,ph=fh*.15
          const pps=[project(x+fw*px,fh,z+fd*.08),project(x+fw*px+pw,fh,z+fd*.08),project(x+fw*px+pw,fh,z+fd*.08+pd),project(x+fw*px,fh,z+fd*.08+pd)]
          return<polygon key={pi} points={pps.map(p=>p.join(',')).join(' ')} fill="rgba(250,248,245,0.9)" stroke={dx(fc,.15)} strokeWidth=".5"/>
        })}
      </>}
      {(f.type==='sofa'||f.type==='chaise')&&<>
        {/* Back cushion strip */}
        {poly([project(x,fh*.5,z),project(x+fw,fh*.5,z),project(x+fw,fh,z),project(x,fh,z)],dx(fc,.04),dx(fc,.2),.6)}
        {/* Seat cushions */}
        {[0,1,2].map(ci=>{
          const cw=fw/3
          const cs=[project(x+cw*ci,fh*.45,z+fd*.1),project(x+cw*(ci+1),fh*.45,z+fd*.1),project(x+cw*(ci+1),fh*.45,z+fd*.85),project(x+cw*ci,fh*.45,z+fd*.85)]
          return<polygon key={ci} points={cs.map(p=>p.join(',')).join(' ')} fill={mx(fc,.06)} stroke={dx(fc,.15)} strokeWidth=".5"/>
        })}
      </>}
      {['dining_table','coffee_table','island','desk'].includes(f.type)&&<>
        {/* Legs */}
        {[[.08,.08],[.92,.08],[.08,.92],[.92,.92]].map(([lx2,lz2],li)=>{
          const leg=[project(x+fw*lx2,0,z+fd*lz2),project(x+fw*lx2+.05,0,z+fd*lz2),project(x+fw*lx2+.05,fh*.88,z+fd*lz2),project(x+fw*lx2,fh*.88,z+fd*lz2)]
          return<polygon key={li} points={leg.map(p=>p.join(',')).join(' ')} fill={dx(fc,.08)} stroke={dx(fc,.2)} strokeWidth=".4"/>
        })}
      </>}
      {['bookshelf','wardrobe','sideboard','cabinets_lower','tv_unit'].includes(f.type)&&<>
        {/* Shelves */}
        {Array.from({length:Math.floor(fh/1.2)},(_,si)=>{
          const sy=(si+1)*fh/Math.ceil(fh/1.2)
          return<line key={si} x1={project(x,sy,z+fd)[0]} y1={project(x,sy,z+fd)[1]} x2={project(x+fw,sy,z+fd)[0]} y2={project(x+fw,sy,z+fd)[1]} stroke={lx(fc,.08)} strokeWidth=".6"/>
        })}
        {f.type==='tv_unit'&&<>
          {/* TV screen */}
          {poly([project(x+fw*.1,fh,z+fd*.08),project(x+fw*.9,fh,z+fd*.08),project(x+fw*.9,fh+1.2,z+fd*.08),project(x+fw*.1,fh+1.2,z+fd*.08)],'rgba(15,20,40,0.92)','rgba(40,50,80,0.8)',.8)}
        </>}
      </>}

      {/* Furniture number badge */}
      <circle cx={badge[0]} cy={badge[1]} r={8} fill={`hsl(${(num*47)%360},60%,42%)`} stroke="white" strokeWidth="1.2"/>
      <text x={badge[0]} y={badge[1]+3} textAnchor="middle" fontSize="8" fill="white" fontFamily="Arial,sans-serif" fontWeight="700">{num}</text>
    </g>
  }

  // Sort back-to-front (painter's algorithm) based on current angle
  const sorted = [...layoutJSON.furniture].sort((a,b)=>{
    const rad=(angleRef.current*Math.PI)/180
    const depthA=(a.xFrac+a.wFrac/2)*Math.sin(rad)+(a.yFrac+a.dFrac/2)*Math.cos(rad)
    const depthB=(b.xFrac+b.wFrac/2)*Math.sin(rad)+(b.yFrac+b.dFrac/2)*Math.cos(rad)
    return depthA-depthB
  })

  function captureForPhoto() {
    if(!svgRef.current||!onCapture)return
    const xml=new XMLSerializer().serializeToString(svgRef.current)
    const b64svg=btoa(unescape(encodeURIComponent(xml)))
    const img=new Image(); img.width=VW; img.height=VH
    img.onload=()=>{
      const c=document.createElement('canvas'); c.width=VW; c.height=VH
      const ctx=c.getContext('2d')!
      ctx.fillStyle=lx(wallC,.12); ctx.fillRect(0,0,VW,VH)
      ctx.drawImage(img,0,0)
      onCapture(c.toDataURL('image/png',1.0).split(',')[1])
    }
    img.src=`data:image/svg+xml;base64,${b64svg}`
  }

  return (
    <div style={{ position:'relative' }}>
      {/* Controls */}
      <div style={{ position:'absolute', top:8, left:8, zIndex:5, display:'flex', gap:5 }}>
        <div style={{ background:'rgba(15,23,42,.75)', backdropFilter:'blur(8px)', borderRadius:7, padding:'4px 10px', fontSize:11, fontWeight:700, color:'white', border:'1px solid rgba(255,255,255,.15)' }}>
          ✦ 3D Room
        </div>
        <button onClick={()=>{ spinRef.current=!spinning; setSpinning(s=>!s) }}
          style={{ background: spinning?'rgba(79,124,255,.85)':'rgba(15,23,42,.75)', backdropFilter:'blur(8px)', borderRadius:7, padding:'4px 10px', fontSize:11, fontWeight:700, color:'white', border:`1px solid ${spinning?'rgba(79,124,255,.5)':'rgba(255,255,255,.15)'}`, cursor:'pointer', fontFamily:'inherit' }}>
          {spinning ? '⏸ Pause' : '▶ Rotate'}
        </button>
      </div>
      {onCapture && (
        <button onClick={captureForPhoto}
          style={{ position:'absolute', bottom:8, right:120, zIndex:5, background:'rgba(245,158,11,.9)', borderRadius:7, padding:'5px 12px', fontSize:11, fontWeight:700, color:'white', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
          📸 Make Photo from This View
        </button>
      )}
      <button onClick={()=>{
        const xml=new XMLSerializer().serializeToString(svgRef.current!)
        const a=document.createElement('a'); a.href='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml); a.download='3d-view.svg'; a.click()
      }} style={{ position:'absolute', bottom:8, right:8, zIndex:5, background:'rgba(79,124,255,.85)', borderRadius:7, padding:'5px 12px', fontSize:11, fontWeight:700, color:'white', border:'none', cursor:'pointer', fontFamily:'inherit' }}>⬇ Save</button>

      {/* 3D SVG */}
      <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} width="100%" height="400" xmlns="http://www.w3.org/2000/svg"
        style={{ display:'block', borderRadius:12, background:`linear-gradient(160deg,${lx(wallC,.18)},${lx(wallC,.08)})` }}>
        {shell()}
        {sorted.map((f,i) => renderPiece(f, layoutJSON.furniture.findIndex(fi=>fi.id===f.id)))}
      </svg>

      {/* Furniture legend */}
      <div style={{ marginTop:10, background:'rgba(255,255,255,.96)', border:'1px solid #e8eaf0', borderRadius:10, padding:'10px 14px' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:8 }}>Furniture Legend</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:'4px 16px' }}>
          {layoutJSON.furniture.map((f,i)=>(
            <div key={f.id} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
              <span style={{ width:16, height:16, borderRadius:4, background:`hsl(${(i+1)*47%360},60%,42%)`, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:800, flexShrink:0 }}>{i+1}</span>
              <span style={{ width:10, height:10, borderRadius:2, background:f.color, border:'1px solid rgba(0,0,0,.1)', flexShrink:0 }}/>
              <span style={{ color:'#374151', lineHeight:1.4 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 2D FLOOR PLAN ────────────────────────────────────────────────────────────
function FloorPlan2D({ layoutJSON, style: styleProp, roomType: roomTypeProp }: { layoutJSON: LayoutJSON; style?: string; roomType?: string }) {
  const PW=680, PH=500
  const { widthFt: W, lengthFt: L } = layoutJSON.dimensions
  const MARGIN=60
  const rw=PW-MARGIN*2, rh=PH-MARGIN*2
  const scX=rw/W, scY=rh/L
  const ox=MARGIN, oy=MARGIN
  const wallC=layoutJSON.walls.color||'#F0EDE8'
  const floorC=layoutJSON.floor.color||'#C4A882'

  function lx2(hex:string,a=.55):string{const[r,g,b]=hx(hex);const f=(v:number)=>Math.round(Math.min((v+a)*255,255));return`#${f(r).toString(16).padStart(2,'0')}${f(g).toString(16).padStart(2,'0')}${f(b).toString(16).padStart(2,'0')}`}
  function dx2(hex:string,a=.3):string{const[r,g,b]=hx(hex);const f=(v:number)=>Math.round(Math.max((v-a)*255,0));return`#${f(r).toString(16).padStart(2,'0')}${f(g).toString(16).padStart(2,'0')}${f(b).toString(16).padStart(2,'0')}`}

  function renderFP(f: LayoutJSON['furniture'][0], idx: number) {
    const px=ox+f.xFrac*rw, py=oy+f.yFrac*rh
    const pw=f.wFrac*rw, ph2=f.dFrac*rh
    if(pw<4||ph2<4)return null
    const cx2=px+pw/2, cy=py+ph2/2
    const num=idx+1
    const fs=Math.max(8,Math.min(12,pw/6))
    const lbl=f.label.length>14?f.label.slice(0,13)+'…':f.label

    if(f.type==='rug'){
      return<g key={f.id}>
        <rect x={px} y={py} width={pw} height={ph2} fill={f.color+'44'} stroke={f.color} strokeWidth="1" strokeDasharray="5,3" rx="2"/>
      </g>
    }
    if(f.type==='bathtub'){
      return<g key={f.id}>
        <ellipse cx={cx2} cy={cy} rx={pw/2} ry={ph2/2} fill={lx2(f.color,.5)} stroke={dx2(f.color,.2)} strokeWidth="1.5"/>
        <ellipse cx={cx2} cy={cy+ph2*.12} rx={pw*.42} ry={ph2*.38} fill="none" stroke={dx2(f.color,.1)} strokeWidth=".8"/>
        <circle cx={cx2} cy={py+ph2*.12} r={pw*.08} fill={dx2(f.color,.2)}/>
        <text x={cx2} y={cy+4} textAnchor="middle" fontSize={fs-1} fill={dx2(f.color,.4)} fontFamily="Arial,sans-serif">{lbl}</text>
        <circle cx={px+pw-8} cy={py+8} r={7} fill={`hsl(${num*47%360},60%,42%)`} stroke="white" strokeWidth="1"/>
        <text x={px+pw-8} y={py+12} textAnchor="middle" fontSize="7" fill="white" fontFamily="Arial,sans-serif" fontWeight="700">{num}</text>
      </g>
    }
    if(f.type==='toilet'){
      return<g key={f.id}>
        <rect x={px} y={py} width={pw} height={ph2*.32} fill={lx2(f.color,.5)} stroke={dx2(f.color,.2)} strokeWidth="1.2" rx="2"/>
        <ellipse cx={cx2} cy={py+ph2*.68} rx={pw*.44} ry={ph2*.3} fill={lx2(f.color,.55)} stroke={dx2(f.color,.2)} strokeWidth="1.2"/>
        <circle cx={px+pw-7} cy={py+7} r={6} fill={`hsl(${num*47%360},60%,42%)`} stroke="white" strokeWidth="1"/>
        <text x={px+pw-7} y={py+11} textAnchor="middle" fontSize="7" fill="white" fontFamily="Arial,sans-serif" fontWeight="700">{num}</text>
      </g>
    }
    if(f.type==='bed'||f.type==='murphy_bed'){
      return<g key={f.id}>
        <rect x={px} y={py} width={pw} height={ph2} fill={lx2(f.color,.5)} stroke={dx2(f.color,.2)} strokeWidth="1.5" rx="3"/>
        <rect x={px} y={py} width={pw} height={ph2*.2} fill={dx2(f.color,.08)} stroke={dx2(f.color,.2)} strokeWidth=".8" rx="2"/>
        {[.22,.62].map((pxf,pi)=><ellipse key={pi} cx={px+pw*pxf} cy={py+ph2*.15} rx={pw*.14} ry={ph2*.08} fill={lx2(f.color,.3)} stroke={dx2(f.color,.1)} strokeWidth=".6"/>)}
        {pw>30&&ph2>20&&<text x={cx2} y={cy+4} textAnchor="middle" fontSize={fs} fill={dx2(f.color,.5)} fontFamily="Arial,sans-serif" fontWeight="600">{lbl}</text>}
        <circle cx={px+pw-8} cy={py+8} r={7} fill={`hsl(${num*47%360},60%,42%)`} stroke="white" strokeWidth="1"/>
        <text x={px+pw-8} y={py+12} textAnchor="middle" fontSize="7" fill="white" fontFamily="Arial,sans-serif" fontWeight="700">{num}</text>
      </g>
    }
    if(f.type==='sofa'||f.type==='chaise'){
      return<g key={f.id}>
        <rect x={px} y={py} width={pw} height={ph2} fill={lx2(f.color,.5)} stroke={dx2(f.color,.22)} strokeWidth="1.5" rx="3"/>
        <rect x={px} y={py} width={pw} height={ph2*.26} fill={dx2(f.color,.08)} stroke="none" rx="2"/>
        {[0,1,2].map(ci=><rect key={ci} x={px+pw/3*ci+pw*.015} y={py+ph2*.28} width={pw/3-pw*.03} height={ph2*.62} fill={lx2(f.color,.06)} stroke={dx2(f.color,.1)} strokeWidth=".5" rx="2"/>)}
        {pw>30&&ph2>20&&<text x={cx2} y={cy+4} textAnchor="middle" fontSize={fs} fill={dx2(f.color,.5)} fontFamily="Arial,sans-serif">{lbl}</text>}
        <circle cx={px+pw-8} cy={py+8} r={7} fill={`hsl(${num*47%360},60%,42%)`} stroke="white" strokeWidth="1"/>
        <text x={px+pw-8} y={py+12} textAnchor="middle" fontSize="7" fill="white" fontFamily="Arial,sans-serif" fontWeight="700">{num}</text>
      </g>
    }
    // Default box
    return<g key={f.id}>
      <rect x={px} y={py} width={pw} height={ph2} fill={lx2(f.color,.52)} stroke={dx2(f.color,.22)} strokeWidth="1.5" rx="2"/>
      {pw>28&&ph2>16&&<text x={cx2} y={cy+4} textAnchor="middle" fontSize={fs} fill={dx2(f.color,.5)} fontFamily="Arial,sans-serif" fontWeight="500">{lbl}</text>}
      <circle cx={px+pw-8} cy={py+8} r={7} fill={`hsl(${num*47%360},60%,42%)`} stroke="white" strokeWidth="1"/>
      <text x={px+pw-8} y={py+12} textAnchor="middle" fontSize="7" fill="white" fontFamily="Arial,sans-serif" fontWeight="700">{num}</text>
    </g>
  }

  // Door swing
  const doorX=ox+rw-scX*3, doorY=oy+rh, doorR=scX*3
  // Tick marks every 2ft
  const hTicks=Array.from({length:Math.floor(W/2)+1},(_,i)=>{
    const x=ox+i*2*scX
    return<g key={i}><line x1={x} y1={oy-8} x2={x} y2={oy-3} stroke="#888" strokeWidth="1"/><text x={x} y={oy-11} textAnchor="middle" fontSize="9" fill="#888" fontFamily="Arial,sans-serif">{i*2}'</text></g>
  })
  const vTicks=Array.from({length:Math.floor(L/2)+1},(_,i)=>{
    const y=oy+i*2*scY
    return<g key={i}><line x1={ox-8} y1={y} x2={ox-3} y2={y} stroke="#888" strokeWidth="1"/><text x={ox-11} y={y} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="#888" fontFamily="Arial,sans-serif">{i*2}'</text></g>
  })

  return(
    <div>
      <svg viewBox={`0 0 ${PW} ${PH}`} width="100%" xmlns="http://www.w3.org/2000/svg" style={{display:'block',borderRadius:12,border:'1px solid #e8eaf0'}}>
        <rect width={PW} height={PH} fill="#FAFAF8"/>
        <text x={PW/2} y={oy-22} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1a1a2e" fontFamily="Arial,sans-serif">
          {styleProp||''} {roomTypeProp||''} · {W}′ × {L}′ · {layoutJSON.dimensions.sqft} sq ft
        </text>
        {hTicks}{vTicks}
        {/* Floor */}
        <rect x={ox} y={oy} width={rw} height={rh} fill={lx2(floorC,.72)} stroke="none"/>
        {/* Floor lines */}
        {(layoutJSON.floor.material==='hardwood'||layoutJSON.floor.material==='wood')&&
          Array.from({length:Math.floor(W*2)},(_,i)=>{
            const x=ox+i*scX*.5
            return x<=ox+rw?<line key={i} x1={x} y1={oy} x2={x} y2={oy+rh} stroke={dx2(floorC,.08)} strokeWidth=".4" opacity=".4"/>:null
          })
        }
        {/* Walls */}
        <rect x={ox} y={oy} width={rw} height={rh} fill="none" stroke="#1a1a2e" strokeWidth="5" rx="1"/>
        {/* Door swing */}
        <line x1={doorX} y1={doorY} x2={doorX+doorR} y2={doorY} stroke="#444" strokeWidth="2.5"/>
        <path d={`M${doorX} ${doorY} A${doorR} ${doorR} 0 0 1 ${doorX} ${doorY-doorR}`} fill="none" stroke="#666" strokeWidth="1" strokeDasharray="4,2"/>
        {/* Furniture */}
        {layoutJSON.furniture.map((f,i)=>renderFP(f,i))}
        {/* Dimension arrows */}
        <defs><marker id="arr2d" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#555"/></marker></defs>
        <line x1={ox} y1={oy+rh+22} x2={ox+rw} y2={oy+rh+22} stroke="#555" strokeWidth="1" markerStart="url(#arr2d)" markerEnd="url(#arr2d)"/>
        <text x={ox+rw/2} y={oy+rh+36} textAnchor="middle" fontSize="11" fill="#555" fontFamily="Arial,sans-serif">{W} ft</text>
        <line x1={ox+rw+22} y1={oy} x2={ox+rw+22} y2={oy+rh} stroke="#555" strokeWidth="1" markerStart="url(#arr2d)" markerEnd="url(#arr2d)"/>
        <text x={ox+rw+36} y={oy+rh/2} textAnchor="middle" fontSize="11" fill="#555" fontFamily="Arial,sans-serif" transform={`rotate(-90,${ox+rw+36},${oy+rh/2})`}>{L} ft</text>
      </svg>
      {/* Legend */}
      <div style={{marginTop:10,background:'white',border:'1px solid #e8eaf0',borderRadius:10,padding:'10px 14px'}}>
        <div style={{fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:8}}>Floor Plan Legend</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'4px 16px'}}>
          {layoutJSON.furniture.map((f,i)=>(
            <div key={f.id} style={{display:'flex',alignItems:'center',gap:6,fontSize:11}}>
              <span style={{width:16,height:16,borderRadius:3,background:`hsl(${(i+1)*47%360},60%,42%)`,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:800,flexShrink:0}}>{i+1}</span>
              <span style={{width:12,height:12,borderRadius:2,background:lx2(f.color,.5),border:`1.5px solid ${dx2(f.color,.2)}`,flexShrink:0}}/>
              <span style={{color:'#374151',lineHeight:1.4}}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
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
    const [rendering, setRendering] = useState(false)
    const [photoUrl, setPhotoUrl]   = useState<string>(result.image)
    const [activeTab, setActiveTab] = useState<'photo'|'3d'|'plan'>('photo')

    async function handleCapture(b64: string) {
      setRendering(true); setActiveTab('photo')
      try {
        const res  = await fetch('/api/render-from-3d', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ image:b64, style, roomType, layoutJSON:result?.layoutJSON })
        })
        const data = await res.json()
        if (data.image) setPhotoUrl(data.image)
      } catch(e) { console.error(e) }
      finally { setRendering(false) }
    }

    const badge = (n: string, color: string, label: string) => (
      <div style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 12px', background:'white', borderRadius:9, border:'1.5px solid #e8eaf0', fontSize:12, fontWeight:700, color:'#0f172a' }}>
        <span style={{ width:22, height:22, borderRadius:6, background:color, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800 }}>{n}</span>
        {label}
        <span style={{ fontSize:10, color:'#16a34a', marginLeft:2, fontWeight:600 }}>Linked</span>
      </div>
    )

    return (
      <div ref={resultRef} style={{ marginTop:36, borderTop:'2px solid #e0e7ff', paddingTop:32 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:100, padding:'5px 16px', fontSize:12, fontWeight:700, color:'#16a34a', marginBottom:12 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#16a34a', display:'inline-block' }}/> All Views Linked · {d?.title || `${style} ${roomType}`}
          </div>
          <h2 style={{ fontSize:24, fontWeight:900, letterSpacing:'-.6px', color:'#0f172a', margin:'0 0 5px' }}>
            {d?.title || `${style} ${roomType}`}
          </h2>
          <p style={{ fontSize:14, color:'#64748b', margin:'0 0 10px' }}>{d?.tagline || 'Changes in one view automatically update the others'}</p>
          {dims && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:100, padding:'4px 14px', fontSize:12, fontWeight:600, color:'#4f7cff' }}>
              📐 {dims.w}×{dims.l}ft · {dims.sqft} sq ft · {dims.h}ft ceiling
            </div>
          )}
        </div>

        {/* View badges */}
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {badge('1','linear-gradient(135deg,#f59e0b,#ef4444)','Photo Render')}
          <div style={{ display:'flex', alignItems:'center', color:'#c7d2fe', fontSize:18 }}>↔</div>
          {badge('2','linear-gradient(135deg,#4f7cff,#7c3aed)','3D Room')}
          <div style={{ display:'flex', alignItems:'center', color:'#c7d2fe', fontSize:18 }}>↔</div>
          {badge('3','linear-gradient(135deg,#10b981,#059669)','Floor Plan')}
        </div>

        {/* Tab selector */}
        <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:12, padding:4, marginBottom:16 }}>
          {([
            ['photo','📸','Photo Render','AI Generated','linear-gradient(135deg,#f59e0b,#ef4444)'],
            ['3d','3D','3D Room Viewer','Drag · Rotate · Orbit','linear-gradient(135deg,#4f7cff,#7c3aed)'],
            ['plan','2D','Floor Plan','All furniture labelled','linear-gradient(135deg,#10b981,#059669)'],
          ] as const).map(([id,icon,label,sub,color])=>(
            <button key={id} onClick={()=>setActiveTab(id as typeof activeTab)}
              style={{ flex:1, padding:'10px 8px', background:activeTab===id?'white':'transparent', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit', transition:'all .2s', boxShadow:activeTab===id?'0 2px 10px rgba(0,0,0,.07)':'none' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                <div style={{ width:22, height:22, borderRadius:7, background:activeTab===id?color:'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:activeTab===id?'white':'#94a3b8', fontWeight:800, transition:'all .2s' }}>{icon}</div>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:activeTab===id?'#0f172a':'#64748b' }}>{label}</div>
                  <div style={{ fontSize:10, color:'#94a3b8' }}>{sub}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── PHOTO TAB ── */}
        {activeTab==='photo' && (
          <div>
            <div style={{ borderRadius:16, overflow:'hidden', boxShadow:'0 12px 40px rgba(0,0,0,.12)', position:'relative' }}>
              {rendering && (
                <div style={{ position:'absolute', inset:0, background:'rgba(15,23,42,.78)', backdropFilter:'blur(4px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:10, borderRadius:16 }}>
                  <div style={{ width:36, height:36, border:'3px solid rgba(245,158,11,.3)', borderTopColor:'#f59e0b', borderRadius:'50%', animation:'spin .8s linear infinite', marginBottom:14 }}/>
                  <p style={{ fontSize:14, fontWeight:700, color:'white', margin:0 }}>Rendering from 3D view…</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,.55)', marginTop:5 }}>OpenAI is making your layout photorealistic</p>
                </div>
              )}
              <img src={photoUrl} alt={`${style} ${roomType}`}
                style={{ width:'100%', display:'block', maxHeight:520, objectFit:'cover', opacity:rendering?.4:1, transition:'opacity .3s' }}
                onError={e=>{(e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200&q=85&auto=format&fit=crop'}}/>
              {/* Room details overlay */}
              <div style={{ position:'absolute', top:14, left:14, background:'rgba(255,255,255,.92)', backdropFilter:'blur(10px)', borderRadius:12, padding:'12px 16px', minWidth:160 }}>
                <div style={{ fontSize:11, fontWeight:800, color:'#0f172a', marginBottom:8 }}>Room Details</div>
                {[
                  ['📐','Size', dims?`${dims.w}' x ${dims.l}'`:'—'],
                  ['⬜','Area', dims?`${dims.sqft} sq ft`:'—'],
                  ['↕','Ceiling', dims?`${dims.h} ft`:'—'],
                  ['🎨','Style', style],
                  ['🔗','Views', 'All Linked'],
                ].map(([icon,label,val])=>(
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', gap:16, fontSize:11, padding:'3px 0', borderBottom:'1px solid #f1f5f9' }}>
                    <span style={{ color:'#94a3b8' }}>{icon} {label}</span>
                    <span style={{ color:'#0f172a', fontWeight:600 }}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={{ position:'absolute', top:14, right:14, background:'rgba(245,158,11,.88)', borderRadius:9, padding:'5px 12px', fontSize:11, fontWeight:700, color:'white' }}>✦ AI Generated</div>
              {dims && <div style={{ position:'absolute', bottom:14, left:14, background:'rgba(0,0,0,.6)', backdropFilter:'blur(8px)', borderRadius:8, padding:'4px 12px', fontSize:11, fontWeight:600, color:'white' }}>{dims.w}×{dims.l}ft · {dims.sqft} sq ft</div>}
            </div>
            <div style={{ display:'flex', gap:10, marginTop:12 }}>
              <a href={photoUrl} target="_blank" rel="noopener"
                style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'11px', borderRadius:12, background:'linear-gradient(135deg,#f59e0b,#ef4444)', color:'white', fontWeight:700, fontSize:13, textDecoration:'none' }}>
                ⬇ Save Render
              </a>
              <button onClick={()=>{navigator.clipboard.writeText(window.location.href);setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{...s.btnSecondary,fontSize:13}}>
                {copied?'✓ Copied!':'🔗 Share'}
              </button>
              <button onClick={()=>{setResult(null);setStep(0);window.scrollTo({top:0,behavior:'smooth'})}} style={{...s.btnSecondary,fontSize:13}}>
                🔄 Redesign
              </button>
            </div>
            <div style={{ marginTop:10, background:'#f0f4ff', border:'1px solid #c7d2fe', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#4f7cff', lineHeight:1.6 }}>
              💡 Switch to <strong>3D Room</strong> tab to orbit, then click <strong>📸 Make Photo from This View</strong> to regenerate a matching photorealistic render from that exact angle.
            </div>
          </div>
        )}

        {/* ── 3D TAB ── */}
        {activeTab==='3d' && lj && (
          <div>
            <RoomViewer3D layoutJSON={lj} style={style} roomType={roomType} onCapture={handleCapture}/>
            {dims && <div style={{ marginTop:6, fontSize:11, color:'#64748b', textAlign:'center' }}>📐 {dims.w}×{dims.l}ft · {dims.sqft} sq ft · {dims.h}ft ceiling</div>}
          </div>
        )}

        {/* ── FLOOR PLAN TAB ── */}
        {activeTab==='plan' && lj && (
          <div>
            <FloorPlan2D layoutJSON={lj} style={style} roomType={roomType}/>
            <div style={{ display:'flex', gap:10, marginTop:12 }}>
              <button onClick={()=>{
                const svg=document.querySelector('svg[data-floorplan]')
                if(!svg)return
                const xml=new XMLSerializer().serializeToString(svg)
                const a=document.createElement('a'); a.href='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml); a.download='floor-plan.svg'; a.click()
              }} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'11px', borderRadius:12, background:'linear-gradient(135deg,#10b981,#059669)', color:'white', fontWeight:700, fontSize:13, border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                ⬇ Save Floor Plan
              </button>
            </div>
          </div>
        )}

        {/* Design details */}
        {d?.description && (
          <div style={{ marginTop:16, background:'#f8faff', border:'1px solid #e0e7ff', borderRadius:14, padding:'16px 20px' }}>
            <p style={{ fontSize:14, color:'#374151', lineHeight:1.8, margin:0 }}>{d.description}</p>
            {d.spatialNote && <p style={{ fontSize:13, color:'#4f7cff', lineHeight:1.7, margin:'10px 0 0', fontStyle:'italic', borderTop:'1px solid #e0e7ff', paddingTop:10 }}>📐 {d.spatialNote}</p>}
          </div>
        )}

        {/* Color / Furniture / Materials grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:14 }}>
          {d?.colors && (d.colors as string[]).length>0 && (
            <div style={{ background:'white', border:'1px solid #e8eaf0', borderRadius:12, padding:14 }}>
              <h4 style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 10px' }}>Palette</h4>
              {(d.colors as string[]).map((c,i)=>{
                const[hex,name]=c.includes(' - ')?c.split(' - '):[c,c]
                return<div key={i} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
                  <div style={{ width:20, height:20, borderRadius:5, background:hex.startsWith('#')?hex:'#e2e8f0', border:'1px solid rgba(0,0,0,.08)', flexShrink:0 }}/>
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
            {[['Style',style],['Room',roomType],['Size',dims?`${dims.w}×${dims.l}ft`:'—'],['Ceiling',dims?.h?`${dims.h}ft`:'—'],['AI','Claude + OpenAI']].map(([l,v])=>(
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

        {/* Export row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginTop:16, padding:'14px', background:'#f8faff', borderRadius:12, border:'1px solid #e0e7ff' }}>
          {[
            ['🔄','All Views Auto-Sync','Change anything, update everywhere'],
            ['⚡','Real-Time Updates','Furniture linked across all views'],
            ['⬇','Export Options','Save 2D, 3D, or HD render'],
          ].map(([icon,title,sub])=>(
            <div key={title} style={{ textAlign:'center', padding:'8px 4px' }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
              <div style={{ fontSize:12, fontWeight:700, color:'#0f172a', marginBottom:2 }}>{title}</div>
              <div style={{ fontSize:11, color:'#64748b' }}>{sub}</div>
            </div>
          ))}
        </div>

        <button onClick={()=>{setResult(null);setStep(0);window.scrollTo({top:0,behavior:'smooth'})}}
          style={{ ...s.btnPrimary, justifyContent:'center', width:'100%', marginTop:14 }}>
          ✦ Generate New Design
        </button>
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
