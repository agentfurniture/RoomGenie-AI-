// ── PASTE THIS BLOCK to replace the <Result /> function in create/page.tsx ──
// Find "function Result()" in your create/page.tsx and replace the entire function

  function Result() {
    if (!result) return null
    const d = result.design
    const hasDims = result.hasDimensions
    const dims    = result.dimensions

    return (
      <div ref={resultRef} style={{ marginTop:36, borderTop:'2px solid #e0e7ff', paddingTop:36 }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:100, padding:'6px 18px', fontSize:13, fontWeight:700, color:'#16a34a', marginBottom:14 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#16a34a', display:'inline-block' }} /> Your AI Design is Ready
          </div>
          <h2 style={{ fontSize:28, fontWeight:900, letterSpacing:'-0.8px', color:'#0f172a', marginBottom:6 }}>{d?.title || `${style} ${roomType}`}</h2>
          {d?.tagline && <p style={{ fontSize:16, color:'#64748b' }}>{d.tagline}</p>}
          {hasDims && dims && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:10, background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:100, padding:'4px 14px', fontSize:12, fontWeight:600, color:'#4f7cff' }}>
              📐 {dims.w}×{dims.l} ft · {dims.sqft} sq ft {dims.h ? `· ${dims.h}ft ceiling` : ''}
            </div>
          )}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:22, alignItems:'start' }}>
          <div>
            {/* ── 3D ROOM RENDER ── */}
            <div style={{ marginBottom: hasDims && result.floorPlan ? 16 : 18 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <div style={{ width:24, height:24, borderRadius:7, background:'linear-gradient(135deg,#4f7cff,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'white' }}>🏠</div>
                <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>3D Room Render</span>
                <span style={{ fontSize:12, color:'#94a3b8' }}>— AI-generated photorealistic view</span>
              </div>
              <div style={{ borderRadius:20, overflow:'hidden', boxShadow:'0 20px 56px rgba(0,0,0,.12)', position:'relative' }}>
                <img src={result.image} alt={`${style} ${roomType} 3D render`}
                  style={{ width:'100%', display:'block', minHeight:280, objectFit:'cover' }}
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200&q=85&auto=format&fit=crop' }} />
                <div style={{ position:'absolute', top:14, right:14, background:'rgba(255,255,255,.92)', borderRadius:10, padding:'6px 14px', fontSize:12, fontWeight:700, color:'#4f7cff' }}>✦ AI Generated</div>
                {hasDims && dims && (
                  <div style={{ position:'absolute', bottom:14, left:14, background:'rgba(0,0,0,.65)', backdropFilter:'blur(8px)', borderRadius:10, padding:'6px 14px', fontSize:12, fontWeight:600, color:'white' }}>
                    📐 {dims.w}×{dims.l}ft · {dims.sqft} sq ft
                  </div>
                )}
              </div>
            </div>

            {/* ── FLOOR PLAN ── */}
            {hasDims && result.floorPlan && (
              <div style={{ marginBottom:18 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <div style={{ width:24, height:24, borderRadius:7, background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'white' }}>📐</div>
                  <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>2D Floor Plan Layout</span>
                  <span style={{ fontSize:12, color:'#94a3b8' }}>— furniture placement for your dimensions</span>
                </div>
                <div style={{ borderRadius:16, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,.08)', border:'1px solid #e8eaf0', position:'relative' }}>
                  <img src={result.floorPlan} alt="Floor plan layout"
                    style={{ width:'100%', display:'block', minHeight:200, objectFit:'cover' }}
                    onError={e => (e.currentTarget.style.display = 'none')} />
                  <div style={{ position:'absolute', top:12, right:12, background:'rgba(16,185,129,.15)', backdropFilter:'blur(8px)', border:'1px solid rgba(16,185,129,.3)', borderRadius:9, padding:'5px 12px', fontSize:11, fontWeight:700, color:'#059669' }}>
                    📐 Floor Plan View
                  </div>
                </div>
                <p style={{ fontSize:12, color:'#94a3b8', marginTop:8, paddingLeft:4 }}>
                  ⓘ AI-generated layout based on {dims?.w}×{dims?.l}ft dimensions. Use as inspiration for furniture placement.
                </p>
              </div>
            )}

            {/* No dimensions note */}
            {!hasDims && (
              <div style={{ background:'#f0f4ff', border:'1px solid #c7d2fe', borderRadius:12, padding:'12px 16px', marginBottom:16, display:'flex', gap:10, alignItems:'center' }}>
                <span style={{ fontSize:16 }}>📐</span>
                <p style={{ fontSize:13, color:'#4f7cff', margin:0, fontWeight:500 }}>
                  <strong>Want a floor plan too?</strong> Go back to Step 1 and enter your room dimensions — the AI will generate both a 3D render AND a 2D floor plan layout.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
              <a href={result.image} target="_blank" rel="noopener" style={{ ...btnPrimary, flex:1, justifyContent:'center', textDecoration:'none' }}>⬇ Save 3D Render</a>
              {result.floorPlan && (
                <a href={result.floorPlan} target="_blank" rel="noopener" style={{ ...btnSecondary, textDecoration:'none' }}>⬇ Floor Plan</a>
              )}
              <button onClick={()=>{ navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(()=>setCopied(false),2000) }} style={btnSecondary}>
                {copied?'✓ Copied!':'🔗 Share'}
              </button>
              <button onClick={()=>{ setResult(null); setStep(0); window.scrollTo({top:0,behavior:'smooth'}) }} style={btnSecondary}>🔄 Restart</button>
            </div>

            {/* Description */}
            {d?.description && (
              <div style={{ background:'#f8faff', border:'1px solid #e0e7ff', borderRadius:14, padding:'18px 22px', marginBottom:14 }}>
                <p style={{ fontSize:15, color:'#374151', lineHeight:1.8, margin:0 }}>{d.description}</p>
                {d?.spatialNote && typeof d.spatialNote === 'string' && d.spatialNote && (
                  <p style={{ fontSize:13, color:'#4f7cff', lineHeight:1.7, margin:'10px 0 0', fontStyle:'italic', borderTop:'1px solid #e0e7ff', paddingTop:10 }}>
                    📐 {d.spatialNote}
                  </p>
                )}
              </div>
            )}

            {/* Colors + Furniture */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {d?.colors && (d.colors as string[]).length > 0 && (
                <div style={{ background:'white', border:'1px solid #e8eaf0', borderRadius:14, padding:18 }}>
                  <h4 style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 12px' }}>Color Palette</h4>
                  {(d.colors as string[]).map((c,i) => {
                    const [hex,name] = c.includes(' - ') ? c.split(' - ') : [c,c]
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:9, marginBottom:9 }}>
                        <div style={{ width:24, height:24, borderRadius:7, background:hex.startsWith('#')?hex:'#e2e8f0', border:'1px solid rgba(0,0,0,.08)', flexShrink:0 }} />
                        <span style={{ fontSize:12, color:'#374151' }}>{name}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              {d?.furniture && (d.furniture as string[]).length > 0 && (
                <div style={{ background:'white', border:'1px solid #e8eaf0', borderRadius:14, padding:18 }}>
                  <h4 style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 12px' }}>Key Pieces</h4>
                  {(d.furniture as string[]).map((f,i) => (
                    <div key={i} style={{ fontSize:12, color:'#374151', marginBottom:8, display:'flex', gap:7, lineHeight:1.5 }}>
                      <span style={{ color:'#4f7cff', fontWeight:700, flexShrink:0 }}>→</span>{f}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {d?.tips && (d.tips as string[]).length > 0 && (
              <div style={{ background:'white', border:'1px solid #e8eaf0', borderRadius:14, padding:18, marginTop:12 }}>
                <h4 style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 12px' }}>Designer Tips</h4>
                {(d.tips as string[]).map((t,i) => (
                  <div key={i} style={{ fontSize:13, color:'#374151', marginBottom:10, display:'flex', gap:9, lineHeight:1.65 }}>
                    <span style={{ color:'#16a34a', fontWeight:800, flexShrink:0 }}>✓</span>{t}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:'white', border:'1px solid #e8eaf0', borderRadius:16, padding:20 }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:'#0f172a', margin:'0 0 16px' }}>Design Brief</h3>
              {[
                {l:'Style',  v:style},
                {l:'Room',   v:roomType},
                {l:'Size',   v: hasDims && dims ? `${dims.w}×${dims.l}ft (${dims.sqft} sq ft)` : 'Not specified'},
                {l:'Ceiling',v: dims?.h ? `${dims.h} ft` : '—'},
                {l:'AI',     v:'Claude + Pollinations'},
                {l:'Status', v:'✓ Complete'},
              ].map(({l,v}) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'8px 0', borderBottom:'1px solid #f8faff' }}>
                  <span style={{ color:'#94a3b8' }}>{l}</span>
                  <span style={{ color:v==='✓ Complete'?'#16a34a':'#0f172a', fontWeight:700, textAlign:'right', maxWidth:130 }}>{v}</span>
                </div>
              ))}
            </div>

            {d?.materials && (d.materials as string[]).length > 0 && (
              <div style={{ background:'white', border:'1px solid #e8eaf0', borderRadius:14, padding:18 }}>
                <h4 style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 10px' }}>Materials</h4>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                  {(d.materials as string[]).map((m,i) => (
                    <span key={i} style={{ background:'#f0f4ff', border:'1px solid #c7d2fe', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600, color:'#4f7cff' }}>{m}</span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={()=>{ setResult(null); setStep(0); window.scrollTo({top:0,behavior:'smooth'}) }}
              style={{ ...btnPrimary, justifyContent:'center', width:'100%' }}>✦ New Design</button>

            {!hasDims && (
              <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:14 }}>
                <p style={{ fontSize:12, color:'#166534', lineHeight:1.7, margin:0 }}>
                  📐 <strong>Add dimensions</strong> next time to get a personalised floor plan layout alongside your 3D render.
                </p>
              </div>
            )}

            <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:12, padding:14 }}>
              <p style={{ fontSize:12, color:'#92400e', lineHeight:1.7, margin:0 }}>
                💡 <strong>Tip:</strong> Upload your actual room photo in Step 1 for more accurate proportional results.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
