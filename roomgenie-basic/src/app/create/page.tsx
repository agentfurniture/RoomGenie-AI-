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
function RoomViewer3D({ layoutJSON, style, roomType }: { layoutJSON: LayoutJSON; style: string; roomType: string }) {
  const mountRef  = useRef<HTMLDivElement>(null)
  const rafRef    = useRef<number>(0)
  const angleRef  = useRef(0.65)   // start at a corner angle matching photo render
  const vertRef   = useRef(0.22)   // eye-level — not bird's eye
  const dragging  = useRef(false)
  const lastPos   = useRef({ x: 0, y: 0 })
  const autoRef   = useRef(true)
  const [auto, setAuto]   = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    let disposed = false
    let raf = 0

    ;(async () => {
      const THREE = await import('three')
      if (disposed) return

      const W_PX = mount.offsetWidth || 500
      const H_PX = 400

      const canvas = document.createElement('canvas')
      canvas.style.cssText = `width:100%;height:${H_PX}px;display:block;cursor:grab;`
      mount.appendChild(canvas)
      if (disposed) { mount.removeChild(canvas); return }

      const { widthFt: W, lengthFt: L, heightFt: H } = layoutJSON.dimensions
      const cx = W / 2, cz = L / 2

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
      renderer.setSize(W_PX, H_PX)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type    = THREE.PCFSoftShadowMap
      renderer.toneMapping       = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.25

      const scene = new THREE.Scene()
      // Use the actual wall color from layoutJSON for background — matches photo render
      const wallRgb = hexToRgb(layoutJSON.walls.color || '#F5F2ED')
      scene.background = new THREE.Color(...wallRgb).multiplyScalar(1.15)
      scene.fog = new THREE.FogExp2(new THREE.Color(...wallRgb), 0.018)

      // Eye-level perspective camera — matches photorealistic render angle
      const camera = new THREE.PerspectiveCamera(58, W_PX / H_PX, 0.1, 200)
      // Closer distance for eye-level immersive view
      const dist = Math.max(W, L) * 1.05

      function updateCam() {
        const a = angleRef.current, v = vertRef.current
        camera.position.set(
          cx + dist * Math.sin(a) * Math.cos(v),
          H  * 0.35 + dist * Math.sin(v),  // eye height ~35% up the wall
          cz + dist * Math.cos(a) * Math.cos(v)
        )
        camera.lookAt(cx, H * 0.28, cz)  // look slightly below center for natural perspective
      }
      updateCam()

      // ── Lighting matching the photorealistic render ────────────────────────
      // Warm ambient base
      scene.add(new THREE.AmbientLight(0xfff8f0, 0.55))

      // Main key light — warm, from upper corner (matches window light in photo)
      const key = new THREE.DirectionalLight(0xfff0d0, 2.2)
      key.position.set(W * 0.8, H * 2.5, -L * 0.3)
      key.castShadow = true
      key.shadow.mapSize.set(2048, 2048)
      key.shadow.camera.left   = -W * 1.8
      key.shadow.camera.right  =  W * 1.8
      key.shadow.camera.top    =  L * 1.8
      key.shadow.camera.bottom = -L * 1.8
      key.shadow.bias = -0.001
      key.shadow.radius = 3
      scene.add(key)

      // Soft fill from opposite side — prevents harsh shadows
      const fill = new THREE.DirectionalLight(0xe8f0ff, 0.7)
      fill.position.set(-W * 0.6, H * 1.2, L * 0.8)
      scene.add(fill)

      // Warm bounce light from floor
      const bounce = new THREE.HemisphereLight(0xfff5e0, hexToRgb(layoutJSON.floor.color || '#C4A882').join(',') as unknown as number, 0.4)
      scene.add(bounce)

      // ── Room shell ────────────────────────────────────────────────────────
      function mkMat(color: string, roughness = 0.85, metalness = 0) {
        return new THREE.MeshStandardMaterial({ color: new THREE.Color(...hexToRgb(color)), roughness, metalness })
      }
      function addBox(w: number, h: number, d: number, x: number, y: number, z: number, m: import('three').Material, sh = true) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
        mesh.position.set(x, y, z)
        if (sh) { mesh.castShadow = true; mesh.receiveShadow = true }
        scene.add(mesh); return mesh
      }

      // Use actual colors from layoutJSON
      const wallColor  = layoutJSON.walls.color  || '#F5F2ED'
      const floorColor = layoutJSON.floor.color  || '#C4A882'
      const isMarble   = layoutJSON.floor.material === 'marble'
      const isConcrete = layoutJSON.floor.material === 'concrete'

      const wallM  = mkMat(wallColor,  0.92, 0)
      const floorM = mkMat(floorColor, isMarble ? 0.08 : isConcrete ? 0.98 : 0.72, isMarble ? 0.06 : 0)
      const ceilM  = mkMat('#FAFAFA', 0.96, 0)

      // Floor
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, L), floorM)
      fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0, cz); fl.receiveShadow = true; scene.add(fl)

      // Ceiling
      const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, L), ceilM)
      cl.rotation.x = Math.PI / 2; cl.position.set(cx, H, cz); scene.add(cl)

      // Back wall (full)
      addBox(W + 0.36, H, 0.18, cx, H/2, 0, wallM)
      // Left wall (full)
      addBox(0.18, H, L, 0, H/2, cz, wallM)
      // Right wall (with window cutout — invisible segment replaced by glass)
      const winBottom = H * 0.22, winTop = H * 0.82, winStart = cz - L * 0.18, winEnd = cz + L * 0.18
      // Right wall — below window
      addBox(0.18, winBottom, L, W, winBottom/2, cz, wallM)
      // Right wall — above window
      addBox(0.18, H - winTop, L, W, winTop + (H-winTop)/2, cz, wallM)
      // Right wall — left of window
      addBox(0.18, winTop - winBottom, winStart, W, winBottom + (winTop-winBottom)/2, winStart/2, wallM)
      // Right wall — right of window
      const rightSegLen = L - winEnd
      addBox(0.18, winTop - winBottom, rightSegLen, W, winBottom + (winTop-winBottom)/2, winEnd + rightSegLen/2, wallM)

      // Window glass
      const glassM = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.75, 0.90, 1.0), roughness: 0.03, metalness: 0.05, transparent: true, opacity: 0.22 })
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.08, winTop - winBottom, winEnd - winStart), glassM)
      win.position.set(W, winBottom + (winTop-winBottom)/2, cx); scene.add(win)

      // Window frame
      const frameM = mkMat('#E8E8E8', 0.5)
      addBox(0.12, 0.06, winEnd-winStart+0.1, W, winBottom, cx, frameM, false)
      addBox(0.12, 0.06, winEnd-winStart+0.1, W, winTop, cx, frameM, false)
      addBox(0.12, winTop-winBottom, 0.06, W, winBottom+(winTop-winBottom)/2, winStart, frameM, false)
      addBox(0.12, winTop-winBottom, 0.06, W, winBottom+(winTop-winBottom)/2, winEnd, frameM, false)

      // Front wall — partial (split with viewing gap)
      addBox(W * 0.18, H, 0.18, W * 0.09, H/2, L, wallM)
      addBox(W * 0.18, H, 0.18, W * 0.91, H/2, L, wallM)
      addBox(W * 0.64, H * 0.22, 0.18, cx, H * 0.89, L, wallM)  // header

      // Skirting boards
      const skM = mkMat(wallColor, 0.6)
      addBox(W, 0.12, 0.06, cx, 0.06, 0.03, skM, false)
      addBox(0.06, 0.12, L, 0.03, 0.06, cz, skM, false)
      addBox(0.06, 0.12, L, W-0.03, 0.06, cz, skM, false)

      // Ceiling recessed light strips
      const lightStripM = new THREE.MeshStandardMaterial({ color: new THREE.Color(1,1,0.9), emissive: new THREE.Color(0.5,0.45,0.2), emissiveIntensity: 0.6 })
      ;[W*0.25, W*0.5, W*0.75].forEach(lx => {
        const ls = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), lightStripM)
        ls.position.set(lx, H - 0.03, cz); scene.add(ls)
        // Point light from each ceiling fixture
        const pl = new THREE.PointLight(0xfff5e0, 0.35, W * 1.8)
        pl.position.set(lx, H - 0.15, cz); scene.add(pl)
      })

      // Accent wall — if specified in layout
      if (layoutJSON.walls.accentWall) {
        const accentColor = layoutJSON.palette?.accent || '#4f7cff'
        const accentM = mkMat(accentColor, 0.88)
        // Apply accent to back wall (a panel)
        addBox(W * 0.55, H * 0.72, 0.06, cx, H * 0.42, 0.12, accentM, false)
      }

      // ── Furniture ─────────────────────────────────────────────────────────
      layoutJSON.furniture.forEach(f => {
        const fw = Math.max(f.wFrac * W, 0.15)
        const fd = Math.max(f.dFrac * L, 0.15)
        const fh = Math.max(f.heightFt, 0.15)
        const x  = f.xFrac * W
        const z  = f.yFrac * L
        const [r, g, b] = hexToRgb(f.color || '#8B8680')
        const mat = (f.material || '').toLowerCase()
        const isShiny = ['metal','glass','marble','ceramic','chrome','brass','gold'].some(m => mat.includes(m))
        const isFabric = ['fabric','velvet','linen','wool','cotton','leather'].some(m => mat.includes(m))
        const fm = new THREE.MeshStandardMaterial({
          color:     new THREE.Color(r, g, b),
          roughness: isShiny ? 0.15 : isFabric ? 0.92 : 0.78,
          metalness: isShiny ? 0.65 : 0,
        })
        const grp = new THREE.Group()

        if (f.type === 'rug') {
          const rg = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.03, fd), fm)
          rg.position.set(fw/2, 0.015, fd/2); rg.receiveShadow = true; grp.add(rg)

        } else if (f.type === 'sofa' || f.type === 'chaise') {
          const seat = new THREE.Mesh(new THREE.BoxGeometry(fw, fh*.42, fd*.68), fm)
          seat.position.set(fw/2, fh*.21, fd*.38); seat.castShadow=seat.receiveShadow=true; grp.add(seat)
          const bk = new THREE.Mesh(new THREE.BoxGeometry(fw, fh*.60, fd*.20), fm)
          bk.position.set(fw/2, fh*.34, fd*.10); bk.castShadow=true; grp.add(bk)
          ;[0.05, 0.95].forEach(ax => {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(fw*.08, fh*.48, fd*.68), fm)
            arm.position.set(fw*ax, fh*.27, fd*.38); arm.castShadow=true; grp.add(arm)
          })
          // Seat cushions
          const cushM = new THREE.MeshStandardMaterial({ color: new THREE.Color(Math.min(r*1.08,1),Math.min(g*1.08,1),Math.min(b*1.08,1)), roughness: 0.95 })
          const cushW = (fw - fw*.18) / 3
          for (let ci = 0; ci < 3; ci++) {
            const cush = new THREE.Mesh(new THREE.BoxGeometry(cushW*.92, fh*.12, fd*.60), cushM)
            cush.position.set(fw*.09 + cushW*ci + cushW/2, fh*.38, fd*.35); grp.add(cush)
          }
          // Legs
          const legM2 = new THREE.MeshStandardMaterial({ color: new THREE.Color(.2,.14,.08), roughness: 0.4, metalness: 0.1 })
          ;[[.08,.88],[.92,.88],[.08,.12],[.92,.12]].forEach(([lx,lz]) => {
            const lg = new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,fh*.12,8), legM2)
            lg.position.set(fw*lx, fh*.06, fd*lz); grp.add(lg)
          })

        } else if (f.type === 'bed' || f.type === 'murphy_bed') {
          // Platform / base
          const base = new THREE.Mesh(new THREE.BoxGeometry(fw, fh*.22, fd), fm)
          base.position.set(fw/2, fh*.11, fd/2); base.castShadow=base.receiveShadow=true; grp.add(base)
          // Mattress
          const mattM = new THREE.MeshStandardMaterial({ color: new THREE.Color(.96,.94,.91), roughness: 0.95 })
          const matt = new THREE.Mesh(new THREE.BoxGeometry(fw*.94, fh*.14, fd*.95), mattM)
          matt.position.set(fw/2, fh*.33, fd/2); matt.castShadow=true; grp.add(matt)
          // Headboard — tall feature matching photo renders
          const hb = new THREE.Mesh(new THREE.BoxGeometry(fw, fh*.72, fd*.10), fm)
          hb.position.set(fw/2, fh*.47, fd*.05); hb.castShadow=true; grp.add(hb)
          // Headboard detail panel
          const hbDetail = new THREE.MeshStandardMaterial({ color: new THREE.Color(Math.min(r*.85,1),Math.min(g*.85,1),Math.min(b*.85,1)), roughness: 0.7 })
          const hbP = new THREE.Mesh(new THREE.BoxGeometry(fw*.88, fh*.56, fd*.04), hbDetail)
          hbP.position.set(fw/2, fh*.47, fd*.06); grp.add(hbP)
          // Pillows
          const pilM = new THREE.MeshStandardMaterial({ color: new THREE.Color(.97,.96,1), roughness: 0.96 })
          ;[.25,.52,.75].forEach(px => {
            const pil = new THREE.Mesh(new THREE.BoxGeometry(fw*.22, fh*.10, fd*.14), pilM)
            pil.position.set(fw*px, fh*.46, fd*.16); pil.castShadow=true; grp.add(pil)
          })
          // Duvet
          const duvM = new THREE.MeshStandardMaterial({ color: new THREE.Color(.93,.90,.86), roughness: 0.97 })
          const duv = new THREE.Mesh(new THREE.BoxGeometry(fw*.92, fh*.06, fd*.65), duvM)
          duv.position.set(fw/2, fh*.46, fd*.57); grp.add(duv)
          // Bed legs
          const blM = new THREE.MeshStandardMaterial({ color: new THREE.Color(.22,.16,.10), roughness: 0.45 })
          ;[[.05,.94],[.95,.94],[.05,.06],[.95,.06]].forEach(([lx,lz]) => {
            const lg = new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,fh*.16,8), blM)
            lg.position.set(fw*lx, fh*.08, fd*lz); grp.add(lg)
          })

        } else if (['dining_table','coffee_table','island'].includes(f.type)) {
          // Tabletop
          const top = new THREE.Mesh(new THREE.BoxGeometry(fw, fh*.07, fd), fm)
          top.position.set(fw/2, fh, fd/2); top.castShadow=top.receiveShadow=true; grp.add(top)
          // Apron
          const ap = new THREE.Mesh(new THREE.BoxGeometry(fw*.92, fh*.06, fd*.92), fm)
          ap.position.set(fw/2, fh*.89, fd/2); grp.add(ap)
          // Tapered legs
          ;[[.08,.09],[.92,.09],[.08,.91],[.92,.91]].forEach(([lx,lz]) => {
            const lg = new THREE.Mesh(new THREE.BoxGeometry(fw*.065, fh*.86, fw*.065), fm)
            lg.position.set(fw*lx, fh*.43, fd*lz); lg.castShadow=true; grp.add(lg)
          })

        } else if (f.type === 'desk') {
          const top = new THREE.Mesh(new THREE.BoxGeometry(fw, fh*.06, fd), fm)
          top.position.set(fw/2, fh, fd/2); top.castShadow=top.receiveShadow=true; grp.add(top)
          ;[.07,.93].forEach(lx => {
            const sp = new THREE.Mesh(new THREE.BoxGeometry(fw*.07, fh*.93, fd), fm)
            sp.position.set(fw*lx, fh*.465, fd/2); sp.castShadow=true; grp.add(sp)
          })
          // Monitor suggestion on desk
          const monM = new THREE.MeshStandardMaterial({ color: new THREE.Color(.08,.08,.1), roughness:.05, metalness:.8 })
          const mon = new THREE.Mesh(new THREE.BoxGeometry(fw*.3, fh*.45, .06), monM)
          mon.position.set(fw*.55, fh*1.28, fd*.15); mon.castShadow=true; grp.add(mon)

        } else if (['chair','armchair','dining_chair'].includes(f.type)) {
          const seat = new THREE.Mesh(new THREE.BoxGeometry(fw, fh*.36, fd*.80), fm)
          seat.position.set(fw/2, fh*.40, fd*.50); seat.castShadow=seat.receiveShadow=true; grp.add(seat)
          const back = new THREE.Mesh(new THREE.BoxGeometry(fw, fh*.50, fd*.10), fm)
          back.position.set(fw/2, fh*.66, fd*.05); back.castShadow=true; grp.add(back)
          ;[[.15,.12],[.85,.12],[.15,.88],[.85,.88]].forEach(([lx,lz]) => {
            const lg = new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,fh*.38,8), fm)
            lg.position.set(fw*lx, fh*.19, fd*lz); grp.add(lg)
          })

        } else if (f.type === 'stool') {
          const seat = new THREE.Mesh(new THREE.CylinderGeometry(Math.min(fw,fd)*.42, Math.min(fw,fd)*.42, fh*.09, 16), fm)
          seat.position.set(fw/2, fh, fd/2); seat.castShadow=true; grp.add(seat)
          ;[[.3,.3],[.7,.3],[.3,.7],[.7,.7]].forEach(([lx,lz]) => {
            const lg = new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,fh*.88,8), fm)
            lg.position.set(fw*lx, fh*.44, fd*lz); grp.add(lg)
          })

        } else if (['bookshelf','shelving','wardrobe','sideboard','cabinets_lower'].includes(f.type)) {
          const body = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), fm)
          body.position.set(fw/2, fh/2, fd/2); body.castShadow=body.receiveShadow=true; grp.add(body)
          // Face frame
          const frameM2 = new THREE.MeshStandardMaterial({ color: new THREE.Color(Math.min(r*.88,1),Math.min(g*.88,1),Math.min(b*.88,1)), roughness:.6 })
          addBox(fw, fh, 0.04, fw/2, fh/2, fd+.02, frameM2 as import('three').Material, false)
          // Shelves visible through front
          const shCount = Math.max(2, Math.floor(fh / 1.0))
          const shM = new THREE.MeshStandardMaterial({ color: new THREE.Color(Math.min(r*1.12,1),Math.min(g*1.12,1),Math.min(b*1.12,1)), roughness: .75 })
          for (let s = 1; s < shCount; s++) {
            const sh = new THREE.Mesh(new THREE.BoxGeometry(fw*.92, 0.04, fd*.84), shM)
            sh.position.set(fw/2, (fh/shCount)*s, fd/2); grp.add(sh)
          }
          // Handle
          const hndM = new THREE.MeshStandardMaterial({ color: new THREE.Color(.7,.65,.5), roughness:.2, metalness:.7 })
          const hnd = new THREE.Mesh(new THREE.BoxGeometry(fw*.35, .04, .04), hndM)
          hnd.position.set(fw/2, fh*.52, fd+.04); grp.add(hnd)

        } else if (f.type === 'tv_unit') {
          const body = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), fm)
          body.position.set(fw/2, fh/2, fd/2); body.castShadow=body.receiveShadow=true; grp.add(body)
          // TV screen floating above
          const tvM = new THREE.MeshStandardMaterial({ color: new THREE.Color(.04,.04,.07), roughness:.03, metalness:.9 })
          const tv = new THREE.Mesh(new THREE.BoxGeometry(fw*.88, fh*1.1, .07), tvM)
          tv.position.set(fw/2, fh*1.32, fd*.04); tv.castShadow=true; grp.add(tv)
          // Screen glow
          const scM = new THREE.MeshStandardMaterial({ color: new THREE.Color(.06,.10,.22), emissive: new THREE.Color(.03,.06,.14), emissiveIntensity:.8 })
          grp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(fw*.82, fh*1.01, .02), scM), { position: new THREE.Vector3(fw/2, fh*1.32, fd*.02) }))

        } else if (['nightstand','side_table','dresser'].includes(f.type)) {
          const body = new THREE.Mesh(new THREE.BoxGeometry(fw, fh*.82, fd), fm)
          body.position.set(fw/2, fh*.41, fd/2); body.castShadow=body.receiveShadow=true; grp.add(body)
          const topM3 = new THREE.MeshStandardMaterial({ color: new THREE.Color(Math.min(r*1.14,1),Math.min(g*1.14,1),Math.min(b*1.14,1)), roughness: isShiny ? .1 : .4 })
          grp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(fw*1.02, fh*.07, fd*1.02), topM3), { position: new THREE.Vector3(fw/2, fh*.87, fd/2) }))
          // Table lamp
          const lpM2 = new THREE.MeshStandardMaterial({ color: new THREE.Color(.22,.16,.10), roughness:.35, metalness:.4 })
          grp.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(fw*.09,fw*.12,fh*.06,10), lpM2), { position: new THREE.Vector3(fw*.7,fh*.94,fd*.5) }))
          const shadeM2 = new THREE.MeshStandardMaterial({ color: new THREE.Color(.96,.88,.7), roughness:.9, side:THREE.DoubleSide, emissive:new THREE.Color(.3,.18,.05), emissiveIntensity:.5 })
          grp.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(fw*.19,fw*.25,fh*.27,12,1,true), shadeM2), { position: new THREE.Vector3(fw*.7,fh*1.15,fd*.5) }))

        } else if (f.type === 'floor_lamp') {
          const poleM2 = new THREE.MeshStandardMaterial({ color: new THREE.Color(.78,.68,.48), roughness:.25, metalness:.7 })
          grp.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,fh*.88,8), poleM2), { position: new THREE.Vector3(fw/2,fh*.44,fd/2) }))
          const lsM2 = new THREE.MeshStandardMaterial({ color: new THREE.Color(.96,.89,.74), roughness:.9, side:THREE.DoubleSide, emissive:new THREE.Color(.28,.17,.04), emissiveIntensity:.55 })
          grp.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(fw*.5,fw*.7,fh*.21,14,1,true), lsM2), { position: new THREE.Vector3(fw/2,fh*.91,fd/2) }))
          grp.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(fw*.32,fw*.38,.06,12), poleM2), { position: new THREE.Vector3(fw/2,.03,fd/2) }))

        } else if (f.type === 'bathtub') {
          const outer = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), fm)
          outer.position.set(fw/2,fh/2,fd/2); outer.castShadow=outer.receiveShadow=true; grp.add(outer)
          const iM2 = new THREE.MeshStandardMaterial({ color:new THREE.Color(.94,.97,.99), roughness:.06, metalness:.04 })
          grp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(fw*.82,fh*.70,fd*.78), iM2), { position:new THREE.Vector3(fw/2,fh*.65,fd/2) }))

        } else if (f.type === 'vanity') {
          const body = new THREE.Mesh(new THREE.BoxGeometry(fw, fh*.58, fd), fm)
          body.position.set(fw/2, fh*.29, fd/2); body.castShadow=body.receiveShadow=true; grp.add(body)
          const mirM2 = new THREE.MeshStandardMaterial({ color:new THREE.Color(.72,.78,.85), roughness:.03, transparent:true, opacity:.62 })
          grp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(fw*.9, fh*.54, .04), mirM2), { position:new THREE.Vector3(fw/2,fh*.87,fd*.02) }))
          // Mirror frame
          const mfM = mkMat('#C8B8A8', 0.4)
          grp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(fw*.94, fh*.58, .06), mfM), { position:new THREE.Vector3(fw/2,fh*.87,fd*.01) }))

        } else if (f.type === 'toilet') {
          const tk = new THREE.Mesh(new THREE.BoxGeometry(fw, fh*.48, fd*.34), fm)
          tk.position.set(fw/2,fh*.52,fd*.17); tk.castShadow=true; grp.add(tk)
          grp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(fw*.82,fh*.30,fd*.68), fm), { position:new THREE.Vector3(fw/2,fh*.15,fd*.58) }))

        } else if (f.type === 'shower') {
          const gM2 = new THREE.MeshStandardMaterial({ color:new THREE.Color(.8,.92,.96), roughness:.04, transparent:true, opacity:.26 })
          grp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(fw,fh,.06), gM2), { position:new THREE.Vector3(fw/2,fh/2,0) }))
          grp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.06,fh,fd), gM2), { position:new THREE.Vector3(0,fh/2,fd/2) }))
          grp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.06,fh,fd), gM2), { position:new THREE.Vector3(fw,fh/2,fd/2) }))
          grp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(fw,.08,fd), fm), { position:new THREE.Vector3(fw/2,.04,fd/2) }))
          // Shower head
          const shhdM = new THREE.MeshStandardMaterial({ color:new THREE.Color(.75,.7,.6), roughness:.2, metalness:.7 })
          grp.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.06,12), shhdM), { position:new THREE.Vector3(fw*.25,fh*.88,fd*.25) }))

        } else {
          // Generic fallback with subtle detail
          const body = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), fm)
          body.position.set(fw/2,fh/2,fd/2); body.castShadow=body.receiveShadow=true; grp.add(body)
        }

        grp.position.set(x, 0, z)
        grp.rotation.y = (f.rotation || 0) * Math.PI / 180
        scene.add(grp)
      })

      setReady(true)

      // Pointer handlers
      function onDown(e: PointerEvent) { dragging.current=true; lastPos.current={x:e.clientX,y:e.clientY}; autoRef.current=false; setAuto(false); canvas.setPointerCapture(e.pointerId) }
      function onMove(e: PointerEvent) {
        if(!dragging.current) return
        angleRef.current += (e.clientX-lastPos.current.x)*.007
        vertRef.current   = Math.max(.02, Math.min(.75, vertRef.current-(e.clientY-lastPos.current.y)*.005))
        lastPos.current   = {x:e.clientX,y:e.clientY}
      }
      function onUp() { dragging.current=false }
      canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove)
      canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointerleave',onUp)

      const ro = new ResizeObserver(() => { const w=mount.offsetWidth||500; renderer.setSize(w,H_PX); camera.aspect=w/H_PX; camera.updateProjectionMatrix() })
      ro.observe(mount)

      function animate() {
        if(disposed) return
        raf=requestAnimationFrame(animate)
        if(autoRef.current&&!dragging.current) angleRef.current+=.003
        updateCam()
        renderer.render(scene,camera)
      }
      raf=requestAnimationFrame(animate)

      return () => {
        disposed=true; cancelAnimationFrame(raf)
        canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove)
        canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointerleave',onUp)
        ro.disconnect(); renderer.dispose()
        if(canvas.parentNode) canvas.parentNode.removeChild(canvas)
      }
    })()

    return () => { disposed=true; cancelAnimationFrame(rafRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutJSON])

  function saveImg() {
    const c = mountRef.current?.querySelector('canvas') as HTMLCanvasElement|null
    if(!c) return; const a=document.createElement('a'); a.href=c.toDataURL('image/png',.92); a.download='3d-room.png'; a.click()
  }

  return (
    <div ref={mountRef} style={{ position:'relative', borderRadius:16, overflow:'hidden', background:'#1a1a2e', minHeight:400 }}>
      {!ready && (
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:10, background:'#0f172a' }}>
          <div style={{ width:32, height:32, border:'3px solid rgba(79,124,255,.25)', borderTopColor:'#4f7cff', borderRadius:'50%', animation:'spin .8s linear infinite', marginBottom:12 }} />
          <p style={{ fontSize:12, color:'#475569', fontFamily:'inherit' }}>Building 3D room…</p>
        </div>
      )}
      {ready && (<>
        <div style={{ position:'absolute', top:10, left:10, display:'flex', gap:6, zIndex:5 }}>
          <div style={{ background:'rgba(0,0,0,.55)', backdropFilter:'blur(8px)', borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700, color:'white', border:'1px solid rgba(255,255,255,.12)' }}>✦ 3D Live</div>
          <button onClick={()=>{ autoRef.current=!auto; setAuto(a=>!a) }} style={{ background:'rgba(0,0,0,.55)', backdropFilter:'blur(8px)', borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700, color:auto?'#4f7cff':'rgba(255,255,255,.5)', border:`1px solid ${auto?'rgba(79,124,255,.4)':'rgba(255,255,255,.12)'}`, cursor:'pointer', fontFamily:'inherit' }}>{auto?'⟳ Auto':'▶ Play'}</button>
        </div>
        <div style={{ position:'absolute', top:10, right:10, zIndex:5, background:'rgba(0,0,0,.5)', backdropFilter:'blur(8px)', borderRadius:8, padding:'4px 10px', fontSize:10, color:'rgba(255,255,255,.4)', border:'1px solid rgba(255,255,255,.08)' }}>Drag to orbit</div>
        <button onClick={saveImg} style={{ position:'absolute', bottom:10, right:10, zIndex:5, background:'rgba(79,124,255,.85)', borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:700, color:'white', border:'none', cursor:'pointer', fontFamily:'inherit' }}>⬇ Save PNG</button>
      </>)}
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
    const [activeView, setActiveView] = useState<'photo'|'3d'|'plan'>('photo')

    return (
      <div ref={resultRef} style={{ marginTop: 36, borderTop: '2px solid #e0e7ff', paddingTop: 36 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '6px 18px', fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> 3 Views Generated
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.8px', color: '#0f172a', marginBottom: 5 }}>
            {d?.title || `${style} ${roomType}`}
          </h2>
          {d?.tagline && <p style={{ fontSize: 15, color: '#64748b' }}>{d.tagline}</p>}
          {dims && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 100, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: '#4f7cff' }}>
              📐 {dims.w}×{dims.l}ft · {dims.sqft} sq ft{dims.h ? ` · ${dims.h}ft ceiling` : ''}
            </div>
          )}
        </div>

        {/* ── 3 VIEW TABS ── */}
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 14, padding: 4, marginBottom: 16 }}>
          {([
            ['photo', '📸', 'Photorealistic',  'AI render', 'linear-gradient(135deg,#f59e0b,#ef4444)'],
            ['3d',    '3D', '3D Room Viewer',  'Drag to orbit', 'linear-gradient(135deg,#4f7cff,#7c3aed)'],
            ['plan',  '2D', 'Floor Plan',      'Top-down layout', 'linear-gradient(135deg,#10b981,#059669)'],
          ] as const).map(([id, icon, label, sub, color]) => (
            <button key={id} onClick={() => setActiveView(id as 'photo'|'3d'|'plan')}
              style={{ flex: 1, padding: '11px 8px', background: activeView === id ? 'white' : 'transparent', border: 'none', borderRadius: 11, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', boxShadow: activeView === id ? '0 2px 10px rgba(0,0,0,.07)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: activeView === id ? color : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: activeView === id ? 'white' : '#94a3b8', fontWeight: 800, transition: 'all .2s' }}>{icon}</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: activeView === id ? '#0f172a' : '#64748b' }}>{label}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{sub}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── PHOTO RENDER ── */}
        {activeView === 'photo' && (
          <div>
            <div style={{ borderRadius: 18, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,.14)', position: 'relative' }}>
              <img src={result.image} alt={`${style} ${roomType}`}
                style={{ width: '100%', display: 'block', maxHeight: 480, objectFit: 'cover' }}
                onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200&q=85&auto=format&fit=crop' }} />
              <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', borderRadius: 9, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: 'white', border: '1px solid rgba(255,255,255,.15)' }}>
                📸 Photorealistic Render
              </div>
              <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(245,158,11,.85)', borderRadius: 9, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: 'white' }}>
                ✦ AI Generated
              </div>
              {dims && (
                <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '4px 12px', fontSize: 11, fontWeight: 600, color: 'white' }}>
                  {dims.w}×{dims.l}ft · {dims.sqft} sq ft
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <a href={result.image} target="_blank" rel="noopener"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 12, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                ⬇ Save Render
              </a>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                style={{ ...s.btnSecondary, fontSize: 13 }}>
                {copied ? '✓ Copied!' : '🔗 Share'}
              </button>
              <button onClick={() => { setResult(null); setStep(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{ ...s.btnSecondary, fontSize: 13 }}>
                🔄 Redesign
              </button>
            </div>
            <div style={{ marginTop: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
              💡 Photorealistic render based on your exact style, room type, dimensions and furniture preferences. Switch to <strong>3D Viewer</strong> to orbit interactively, or <strong>Floor Plan</strong> for the layout.
            </div>
          </div>
        )}

        {/* ── 3D VIEWER ── */}
        {activeView === '3d' && (
          <div>
            {result.layoutJSON ? (
              <RoomViewer3D layoutJSON={result.layoutJSON} style={style} roomType={roomType} />
            ) : (
              <div style={{ borderRadius: 16, background: '#0f172a', height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 14 }}>
                3D data not available — please regenerate
              </div>
            )}
            {dims && <div style={{ marginTop: 8, fontSize: 11, color: '#64748b', textAlign: 'center' }}>📐 {dims.w}×{dims.l}ft · {dims.sqft} sq ft{dims.h ? ` · ${dims.h}ft ceiling` : ''}</div>}
            <div style={{ marginTop: 10, background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#4f7cff', lineHeight: 1.6 }}>
              💡 <strong>Drag</strong> to orbit · <strong>▶ Play</strong> for auto-rotation · <strong>⬇ Save PNG</strong> to capture the current view
            </div>
          </div>
        )}

        {/* ── FLOOR PLAN ── */}
        {activeView === 'plan' && (
          <div>
            {result.floorPlan ? (
              <>
                <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,.08)', border: '1px solid #e8eaf0', position: 'relative', background: '#FAFAF8' }}>
                  <img src={result.floorPlan} alt="2D floor plan" style={{ width: '100%', display: 'block' }}
                    onError={e => (e.currentTarget.style.display = 'none')} />
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(16,185,129,.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 8, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#059669' }}>📐 Top View</div>
                </div>
                <a href={result.floorPlan} target="_blank" rel="noopener" download="floor-plan.svg"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 12, padding: '11px', borderRadius: 12, background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  ⬇ Save Floor Plan
                </a>
              </>
            ) : (
              <div style={{ borderRadius: 16, background: '#f8faff', border: '1px solid #e8eaf0', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13 }}>
                Floor plan not available
              </div>
            )}
            <div style={{ marginTop: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#166534', lineHeight: 1.6 }}>
              💡 Floor plan is generated from the same layout data as the 3D viewer — furniture positions match exactly.
            </div>
          </div>
        )}

        {/* Description + spatial note */}
        {d?.description && (
          <div style={{ background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, margin: 0 }}>{d.description}</p>
            {typeof d.spatialNote === 'string' && d.spatialNote && (
              <p style={{ fontSize: 13, color: '#4f7cff', lineHeight: 1.7, margin: '10px 0 0', fontStyle: 'italic', borderTop: '1px solid #e0e7ff', paddingTop: 10 }}>📐 {d.spatialNote}</p>
            )}
          </div>
        )}

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16 }}>
          {/* Colors */}
          {d?.colors && (d.colors as string[]).length > 0 && (
            <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 16 }}>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Color Palette</h4>
              {(d.colors as string[]).map((c, i) => {
                const [hex, name] = c.includes(' - ') ? c.split(' - ') : [c, c]
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: hex.startsWith('#') ? hex : '#e2e8f0', border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: '#374151' }}>{name}</span>
                  </div>
                )
              })}
            </div>
          )}
          {/* Furniture */}
          {d?.furniture && (d.furniture as string[]).length > 0 && (
            <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 16 }}>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Key Pieces</h4>
              {(d.furniture as string[]).map((f, i) => (
                <div key={i} style={{ fontSize: 11, color: '#374151', marginBottom: 7, display: 'flex', gap: 6, lineHeight: 1.5 }}>
                  <span style={{ color: '#4f7cff', fontWeight: 700, flexShrink: 0 }}>→</span>{f}
                </div>
              ))}
            </div>
          )}
          {/* Materials + Brief */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {d?.materials && (d.materials as string[]).length > 0 && (
              <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 16 }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>Materials</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(d.materials as string[]).map((m, i) => (
                    <span key={i} style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: '#4f7cff' }}>{m}</span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 16 }}>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>Design Brief</h4>
              {[
                { l: 'Style',   v: style },
                { l: 'Room',    v: roomType },
                { l: 'Size',    v: dims ? `${dims.w}×${dims.l}ft` : '—' },
                { l: 'Ceiling', v: dims?.h ? `${dims.h}ft` : '—' },
                { l: 'AI',      v: 'Claude + Replicate' },
              ].map(({ l, v }) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '5px 0', borderBottom: '1px solid #f8faff' }}>
                  <span style={{ color: '#94a3b8' }}>{l}</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        {d?.tips && (d.tips as string[]).length > 0 && (
          <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Designer Tips</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {(d.tips as string[]).map((t, i) => (
                <div key={i} style={{ fontSize: 12, color: '#374151', display: 'flex', gap: 8, lineHeight: 1.6 }}>
                  <span style={{ color: '#16a34a', fontWeight: 800, flexShrink: 0 }}>✓</span>{t}
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => { setResult(null); setStep(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          style={{ ...s.btnPrimary, justifyContent: 'center', width: '100%' }}>
          ✦ Start New Design
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
