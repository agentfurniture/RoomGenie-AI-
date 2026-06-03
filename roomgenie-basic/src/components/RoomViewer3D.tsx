'use client'
import { useEffect, useRef, useState } from 'react'

// ── Types (matches what the API returns in layoutJSON) ─────────────────────
interface FurniturePiece {
  id:        string
  type:      string
  label:     string
  color:     string
  material:  string
  xFrac:     number   // 0-1 fraction of room width from left
  yFrac:     number   // 0-1 fraction of room length from far wall
  wFrac:     number   // width as fraction of room width
  dFrac:     number   // depth as fraction of room length
  heightFt:  number
  rotation:  number   // 0 | 90 | 180 | 270
  preserved: boolean
}

interface LayoutJSON {
  dimensions: { widthFt: number; lengthFt: number; heightFt: number; sqft: number }
  furniture:  FurniturePiece[]
  floor:      { material: string; color: string }
  walls:      { color: string; material: string; accentWall?: string }
  palette:    { primary: string; secondary: string; accent: string; neutral: string }
}

interface RoomViewer3DProps {
  layoutJSON: LayoutJSON
  style:      string
  roomType:   string
  onCapture?: (dataUrl: string) => void
}

// ── Hex to RGB ──────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  if (h.length !== 6) return [0.8, 0.75, 0.7]
  const r = parseInt(h.slice(0,2),16)/255
  const g = parseInt(h.slice(2,4),16)/255
  const b = parseInt(h.slice(4,6),16)/255
  return [r, g, b]
}

// ── Style-based environment colours ────────────────────────────────────────
const STYLE_ENV: Record<string, { ambient: number; sunColor: string; skyColor: string }> = {
  Modern:        { ambient: 0.7, sunColor: '#ffffff', skyColor: '#e8eeff' },
  Luxury:        { ambient: 0.5, sunColor: '#ffe4a0', skyColor: '#fff8e8' },
  Minimalist:    { ambient: 0.9, sunColor: '#ffffff', skyColor: '#f5f5ff' },
  Scandinavian:  { ambient: 0.75,sunColor: '#fff5e0', skyColor: '#f0f5ff' },
  Industrial:    { ambient: 0.45,sunColor: '#ffd080', skyColor: '#e0ddd8' },
  Bohemian:      { ambient: 0.55,sunColor: '#ffb060', skyColor: '#f5e8d8' },
  Japandi:       { ambient: 0.65,sunColor: '#fffae0', skyColor: '#f0ede8' },
  Classic:       { ambient: 0.5, sunColor: '#ffd090', skyColor: '#f5edd8' },
  Contemporary:  { ambient: 0.72,sunColor: '#f0f0ff', skyColor: '#eaecff' },
  Mediterranean: { ambient: 0.75,sunColor: '#ffe880', skyColor: '#e8f4ff' },
}

// ── Material roughness/metalness per material type ─────────────────────────
const MAT_PROPS: Record<string, { roughness: number; metalness: number; emissive: number }> = {
  wood:    { roughness: 0.85, metalness: 0.0,  emissive: 0.0  },
  fabric:  { roughness: 0.95, metalness: 0.0,  emissive: 0.0  },
  metal:   { roughness: 0.3,  metalness: 0.85, emissive: 0.0  },
  marble:  { roughness: 0.15, metalness: 0.05, emissive: 0.0  },
  glass:   { roughness: 0.05, metalness: 0.1,  emissive: 0.0  },
  ceramic: { roughness: 0.2,  metalness: 0.05, emissive: 0.0  },
  stone:   { roughness: 0.9,  metalness: 0.0,  emissive: 0.0  },
  acrylic: { roughness: 0.1,  metalness: 0.05, emissive: 0.0  },
  nylon:   { roughness: 0.9,  metalness: 0.0,  emissive: 0.0  },
  wool:    { roughness: 1.0,  metalness: 0.0,  emissive: 0.0  },
  leather: { roughness: 0.6,  metalness: 0.0,  emissive: 0.0  },
  mesh:    { roughness: 0.8,  metalness: 0.1,  emissive: 0.0  },
  velvet:  { roughness: 1.0,  metalness: 0.0,  emissive: 0.0  },
  linen:   { roughness: 0.95, metalness: 0.0,  emissive: 0.0  },
}

function getMat(material: string) {
  const key = material.toLowerCase().split(/[\s,&]/)[0]
  return MAT_PROPS[key] || { roughness: 0.8, metalness: 0.0, emissive: 0.0 }
}

// ── Main component ──────────────────────────────────────────────────────────
export default function RoomViewer3D({ layoutJSON, style, roomType, onCapture }: RoomViewer3DProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rafRef       = useRef<number>(0)
  const angleRef     = useRef<number>(0.4)     // current horizontal orbit angle
  const vertRef      = useRef<number>(0.35)    // current vertical angle
  const dragging     = useRef(false)
  const lastPos      = useRef({ x: 0, y: 0 })
  const [loaded, setLoaded] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Dynamic import Three.js
    let three: typeof import('three')
    let renderer: import('three').WebGLRenderer
    let scene:    import('three').Scene
    let camera:   import('three').PerspectiveCamera

    async function init() {
      three = await import('three')
      const { WebGLRenderer, Scene, PerspectiveCamera, AmbientLight, DirectionalLight,
              PlaneGeometry, BoxGeometry, SphereGeometry, CylinderGeometry,
              MeshStandardMaterial, Mesh, Color, Group, DirectionalLightHelper,
              MathUtils, PCFSoftShadowMap, Vector3 } = three

      // ── Renderer ────────────────────────────────────────────────
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false })
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type    = PCFSoftShadowMap
      renderer.toneMapping       = 2 // ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1

      // ── Scene ────────────────────────────────────────────────────
      const env   = STYLE_ENV[style] || STYLE_ENV.Modern
      const bgRgb = hexToRgb(env.skyColor)
      scene = new Scene()
      scene.background = new Color(...bgRgb)

      // ── Camera ───────────────────────────────────────────────────
      const aspect = canvas.clientWidth / canvas.clientHeight
      camera = new PerspectiveCamera(55, aspect, 0.1, 200)

      const { widthFt, lengthFt, heightFt } = layoutJSON.dimensions
      // Scale: 1 unit = 1 foot
      const cx = widthFt / 2, cz = lengthFt / 2
      const camDist = Math.max(widthFt, lengthFt) * 1.1

      function updateCamera() {
        const h = angleRef.current, v = vertRef.current
        camera.position.set(
          cx + camDist * Math.sin(h) * Math.cos(v),
          heightFt * 0.5 + camDist * Math.sin(v),
          cz + camDist * Math.cos(h) * Math.cos(v)
        )
        camera.lookAt(cx, heightFt * 0.3, cz)
      }
      updateCamera()

      // ── Lights ───────────────────────────────────────────────────
      const ambient = new AmbientLight(0xffffff, env.ambient)
      scene.add(ambient)

      const sunRgb = hexToRgb(env.sunColor)
      const sun    = new DirectionalLight(new Color(...sunRgb), 1.8)
      sun.position.set(widthFt * 0.7, heightFt * 1.8, widthFt * 0.5)
      sun.castShadow = true
      sun.shadow.mapSize.width  = 2048
      sun.shadow.mapSize.height = 2048
      sun.shadow.camera.near = 0.5
      sun.shadow.camera.far  = 80
      sun.shadow.camera.left   = -widthFt
      sun.shadow.camera.right  =  widthFt
      sun.shadow.camera.top    =  lengthFt
      sun.shadow.camera.bottom = -lengthFt
      sun.shadow.bias = -0.001
      scene.add(sun)

      // Warm fill from the front
      const fill = new DirectionalLight(0xffd0a0, 0.4)
      fill.position.set(-widthFt * 0.5, heightFt * 0.5, -lengthFt * 0.8)
      scene.add(fill)

      // ── Room shell ───────────────────────────────────────────────
      const wallColor = hexToRgb(layoutJSON.walls.color || '#F5F2ED')
      const wallMat   = new MeshStandardMaterial({ color: new Color(...wallColor), roughness: 0.9 })

      const floorColor = hexToRgb(layoutJSON.floor.color || '#C4A882')
      const floorRough = layoutJSON.floor.material === 'marble' ? 0.15 : layoutJSON.floor.material === 'concrete' ? 0.95 : 0.7
      const floorMat  = new MeshStandardMaterial({ color: new Color(...floorColor), roughness: floorRough, metalness: floorRough < 0.3 ? 0.05 : 0 })

      const ceilMat = new MeshStandardMaterial({ color: new Color(1, 1, 1), roughness: 0.95 })

      const T = 0.2 // wall thickness

      // Floor
      const floor = new Mesh(new PlaneGeometry(widthFt, lengthFt), floorMat)
      floor.rotation.x = -Math.PI / 2
      floor.position.set(cx, 0, cz)
      floor.receiveShadow = true
      scene.add(floor)

      // Ceiling
      const ceil = new Mesh(new PlaneGeometry(widthFt, lengthFt), ceilMat)
      ceil.rotation.x = Math.PI / 2
      ceil.position.set(cx, heightFt, cz)
      scene.add(ceil)

      // Back wall (far, yFrac=0 side)
      const bw = new Mesh(new BoxGeometry(widthFt, heightFt, T), wallMat)
      bw.position.set(cx, heightFt/2, 0)
      bw.receiveShadow = true
      scene.add(bw)

      // Front wall opening (near, viewer side) - two side pieces with gap
      const fw1 = new Mesh(new BoxGeometry(widthFt * 0.25, heightFt, T), wallMat)
      fw1.position.set(widthFt * 0.125, heightFt/2, lengthFt)
      scene.add(fw1)
      const fw2 = new Mesh(new BoxGeometry(widthFt * 0.25, heightFt, T), wallMat)
      fw2.position.set(widthFt * 0.875, heightFt/2, lengthFt)
      scene.add(fw2)

      // Left wall
      const lw = new Mesh(new BoxGeometry(T, heightFt, lengthFt), wallMat)
      lw.position.set(0, heightFt/2, cz)
      lw.receiveShadow = true
      scene.add(lw)

      // Right wall with window cutout visual
      const rw = new Mesh(new BoxGeometry(T, heightFt, lengthFt), wallMat)
      rw.position.set(widthFt, heightFt/2, cz)
      rw.receiveShadow = true
      scene.add(rw)

      // Window on right wall (glass panel)
      const winGlass = new MeshStandardMaterial({ color: new Color(0.7, 0.85, 1), roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.3 })
      const win = new Mesh(new BoxGeometry(T * 0.5, heightFt * 0.55, lengthFt * 0.35), winGlass)
      win.position.set(widthFt, heightFt * 0.55, cz)
      scene.add(win)

      // Window frame
      const frameMat = new MeshStandardMaterial({ color: new Color(0.9, 0.9, 0.9), roughness: 0.5 })
      const wfH = new Mesh(new BoxGeometry(T * 0.8, 0.08, lengthFt * 0.37), frameMat)
      wfH.position.set(widthFt, heightFt * 0.82, cz)
      scene.add(wfH)
      const wfH2 = new Mesh(new BoxGeometry(T * 0.8, 0.08, lengthFt * 0.37), frameMat)
      wfH2.position.set(widthFt, heightFt * 0.28, cz)
      scene.add(wfH2)

      // Skirting boards
      const skirtMat = new MeshStandardMaterial({ color: new Color(0.98, 0.98, 0.98), roughness: 0.6 })
      const sk1 = new Mesh(new BoxGeometry(widthFt + T*2, 0.25, T*0.5), skirtMat)
      sk1.position.set(cx, 0.125, 0)
      scene.add(sk1)
      const sk2 = new Mesh(new BoxGeometry(T*0.5, 0.25, lengthFt), skirtMat)
      sk2.position.set(0, 0.125, cz)
      scene.add(sk2)
      const sk3 = new Mesh(new BoxGeometry(T*0.5, 0.25, lengthFt), skirtMat)
      sk3.position.set(widthFt, 0.125, cz)
      scene.add(sk3)

      // ── Furniture ───────────────────────────────────────────────
      function addFurniture(f: FurniturePiece) {
        const group = new Group()
        const x    = f.xFrac * widthFt
        const z    = f.yFrac * lengthFt
        const fw   = f.wFrac * widthFt
        const fd   = f.dFrac * lengthFt
        const fh   = Math.max(f.heightFt, 0.15)
        const [cr, cg, cb] = hexToRgb(f.color || '#8B8680')
        const matProp = getMat(f.material || 'wood')
        const mat = new MeshStandardMaterial({
          color: new Color(cr, cg, cb),
          roughness: matProp.roughness,
          metalness: matProp.metalness,
        })

        if (f.type === 'rug') {
          // Flat rug with slightly raised border
          const rug = new Mesh(new BoxGeometry(fw, 0.04, fd), mat)
          rug.position.set(x + fw/2, 0.02, z + fd/2)
          rug.receiveShadow = true
          group.add(rug)
          scene.add(group)
          return
        }

        if (f.type === 'sofa' || f.type === 'chaise') {
          // Seat
          const seat = new Mesh(new BoxGeometry(fw, fh * 0.45, fd * 0.72), mat)
          seat.position.set(fw/2, fh * 0.225, fd * 0.36)
          seat.castShadow = seat.receiveShadow = true
          group.add(seat)
          // Back
          const back = new Mesh(new BoxGeometry(fw, fh * 0.65, fd * 0.22), mat)
          back.position.set(fw/2, fh * 0.325, fd * 0.11)
          back.castShadow = back.receiveShadow = true
          group.add(back)
          // Arm left
          const al = new Mesh(new BoxGeometry(fw * 0.08, fh * 0.55, fd * 0.7), mat)
          al.position.set(fw * 0.04, fh * 0.275, fd * 0.35)
          al.castShadow = true
          group.add(al)
          // Arm right
          const ar = new Mesh(new BoxGeometry(fw * 0.08, fh * 0.55, fd * 0.7), mat)
          ar.position.set(fw * 0.96, fh * 0.275, fd * 0.35)
          ar.castShadow = true
          group.add(ar)
          // Legs
          const legMat = new MeshStandardMaterial({ color: new Color(0.2,0.15,0.1), roughness: 0.5 })
          const legH = fh * 0.12
          ;[[0.1, 0.9], [0.9, 0.9]].forEach(([lx, lz]) => {
            const leg = new Mesh(new CylinderGeometry(0.04, 0.04, legH, 6), legMat)
            leg.position.set(fw * lx, legH/2, fd * lz)
            group.add(leg)
          })
        }
        else if (f.type === 'bed' || f.type === 'murphy_bed') {
          // Base / box spring
          const base = new Mesh(new BoxGeometry(fw, fh * 0.28, fd), mat)
          base.position.set(fw/2, fh * 0.14, fd/2)
          base.castShadow = base.receiveShadow = true
          group.add(base)
          // Mattress
          const mattressMat = new MeshStandardMaterial({ color: new Color(0.97, 0.95, 0.92), roughness: 0.95 })
          const mattress = new Mesh(new BoxGeometry(fw * 0.92, fh * 0.18, fd * 0.92), mattressMat)
          mattress.position.set(fw/2, fh * 0.37, fd/2)
          mattress.castShadow = true
          group.add(mattress)
          // Headboard
          const hbMat = new MeshStandardMaterial({ color: new Color(cr,cg,cb), roughness: 0.8 })
          const hb = new Mesh(new BoxGeometry(fw, fh * 0.7, fd * 0.12), hbMat)
          hb.position.set(fw/2, fh * 0.45, fd * 0.06)
          hb.castShadow = true
          group.add(hb)
          // Pillows
          const pilMat = new MeshStandardMaterial({ color: new Color(0.95, 0.95, 0.98), roughness: 0.95 })
          ;[0.3, 0.7].forEach(px => {
            const pil = new Mesh(new BoxGeometry(fw * 0.28, fh * 0.12, fd * 0.18), pilMat)
            pil.position.set(fw * px, fh * 0.52, fd * 0.22)
            pil.castShadow = true
            group.add(pil)
          })
          // Duvet
          const duvet = new Mesh(new BoxGeometry(fw * 0.9, fh * 0.08, fd * 0.62), new MeshStandardMaterial({ color: new Color(0.93, 0.90, 0.86), roughness: 0.98 }))
          duvet.position.set(fw/2, fh * 0.5, fd * 0.6)
          group.add(duvet)
          // Legs
          const legMat2 = new MeshStandardMaterial({ color: new Color(0.22,0.16,0.10), roughness: 0.5 })
          ;[[0.05,0.95],[0.95,0.95],[0.05,0.05],[0.95,0.05]].forEach(([lx,lz]) => {
            const leg = new Mesh(new CylinderGeometry(0.045,0.045, fh*0.18, 8), legMat2)
            leg.position.set(fw*lx, fh*0.09, fd*lz)
            group.add(leg)
          })
        }
        else if (f.type === 'dining_table' || f.type === 'coffee_table' || f.type === 'island') {
          // Tabletop
          const top = new Mesh(new BoxGeometry(fw, fh * 0.07, fd), mat)
          top.position.set(fw/2, fh, fd/2)
          top.castShadow = top.receiveShadow = true
          group.add(top)
          // Apron
          const apron = new Mesh(new BoxGeometry(fw * 0.92, fh * 0.08, fd * 0.92), mat)
          apron.position.set(fw/2, fh * 0.89, fd/2)
          group.add(apron)
          // Legs
          ;[[0.08,0.08],[0.92,0.08],[0.08,0.92],[0.92,0.92]].forEach(([lx,lz]) => {
            const leg = new Mesh(new BoxGeometry(fw*0.07, fh*0.88, fw*0.07), mat)
            leg.position.set(fw*lx, fh*0.44, fd*lz)
            leg.castShadow = true
            group.add(leg)
          })
        }
        else if (f.type === 'desk') {
          const top = new Mesh(new BoxGeometry(fw, fh * 0.06, fd), mat)
          top.position.set(fw/2, fh, fd/2)
          top.castShadow = top.receiveShadow = true
          group.add(top)
          const sp = new Mesh(new BoxGeometry(fw * 0.06, fh * 0.55, fd), mat)
          sp.position.set(fw * 0.08, fh * 0.72, fd/2)
          group.add(sp)
          const sp2 = new Mesh(new BoxGeometry(fw * 0.06, fh * 0.55, fd), mat)
          sp2.position.set(fw * 0.92, fh * 0.72, fd/2)
          group.add(sp2)
          const base2 = new Mesh(new BoxGeometry(fw * 0.55, fh * 0.06, fd), mat)
          base2.position.set(fw * 0.08, fh * 0.03, fd/2)
          group.add(base2)
        }
        else if (f.type === 'chair' || f.type === 'armchair' || f.type === 'dining_chair') {
          const seat = new Mesh(new BoxGeometry(fw, fh * 0.4, fd * 0.85), mat)
          seat.position.set(fw/2, fh * 0.42, fd * 0.52)
          seat.castShadow = seat.receiveShadow = true
          group.add(seat)
          const back = new Mesh(new BoxGeometry(fw, fh * 0.55, fd * 0.1), mat)
          back.position.set(fw/2, fh * 0.7, fd * 0.07)
          back.castShadow = true
          group.add(back)
          ;[[0.15,0.1],[0.85,0.1],[0.15,0.9],[0.85,0.9]].forEach(([lx,lz]) => {
            const leg = new Mesh(new CylinderGeometry(0.03,0.03, fh*0.42, 6), mat)
            leg.position.set(fw*lx, fh*0.21, fd*lz)
            group.add(leg)
          })
        }
        else if (f.type === 'stool') {
          const seat = new Mesh(new CylinderGeometry(Math.min(fw,fd)/2 * 0.85, Math.min(fw,fd)/2 * 0.85, fh * 0.08, 16), mat)
          seat.position.set(fw/2, fh, fd/2)
          seat.castShadow = true
          group.add(seat)
          ;[[0.3,0.3],[0.7,0.3],[0.3,0.7],[0.7,0.7]].forEach(([lx,lz]) => {
            const leg = new Mesh(new CylinderGeometry(0.025,0.025, fh*0.88, 6), mat)
            leg.position.set(fw*lx, fh*0.44, fd*lz)
            group.add(leg)
          })
        }
        else if (f.type === 'bookshelf' || f.type === 'shelving' || f.type === 'wardrobe' || f.type === 'sideboard') {
          // Main carcass
          const body = new Mesh(new BoxGeometry(fw, fh, fd), mat)
          body.position.set(fw/2, fh/2, fd/2)
          body.castShadow = body.receiveShadow = true
          group.add(body)
          // Shelves visible on front
          const shelfMat = new MeshStandardMaterial({ color: new Color(cr*1.1,cg*1.1,cb*1.1), roughness: 0.8 })
          const shelfCount = Math.floor(fh / 1.2)
          for (let s = 1; s < shelfCount; s++) {
            const shelf = new Mesh(new BoxGeometry(fw * 0.94, 0.05, fd * 0.85), shelfMat)
            shelf.position.set(fw/2, (fh / shelfCount) * s, fd/2)
            group.add(shelf)
          }
        }
        else if (f.type === 'nightstand' || f.type === 'side_table') {
          const body = new Mesh(new BoxGeometry(fw, fh * 0.85, fd), mat)
          body.position.set(fw/2, fh * 0.425, fd/2)
          body.castShadow = body.receiveShadow = true
          group.add(body)
          const top2 = new Mesh(new BoxGeometry(fw * 1.02, fh * 0.08, fd * 1.02), new MeshStandardMaterial({ color: new Color(cr*1.1,cg*1.1,cb*1.1), roughness: 0.4 }))
          top2.position.set(fw/2, fh * 0.88, fd/2)
          group.add(top2)
          // Lamp on nightstand
          const lampBase = new Mesh(new CylinderGeometry(fw*0.12,fw*0.15,fh*0.06,12), new MeshStandardMaterial({ color: new Color(0.2,0.15,0.1), roughness: 0.4 }))
          lampBase.position.set(fw * 0.7, fh * 0.95, fd * 0.5)
          group.add(lampBase)
          const lampShade = new Mesh(new CylinderGeometry(fw*0.22,fw*0.28,fh*0.28,12,1,true), new MeshStandardMaterial({ color: new Color(0.96,0.88,0.7), roughness: 0.9, side: 2, emissive: new Color(0.3,0.2,0.05), emissiveIntensity: 0.4 }))
          lampShade.position.set(fw * 0.7, fh * 1.15, fd * 0.5)
          group.add(lampShade)
        }
        else if (f.type === 'tv_unit') {
          const body = new Mesh(new BoxGeometry(fw, fh, fd), mat)
          body.position.set(fw/2, fh/2, fd/2)
          body.castShadow = body.receiveShadow = true
          group.add(body)
          // TV screen on top
          const tvMat = new MeshStandardMaterial({ color: new Color(0.05,0.05,0.08), roughness: 0.05, metalness: 0.8 })
          const tv = new Mesh(new BoxGeometry(fw * 0.88, fh * 1.1, 0.08), tvMat)
          tv.position.set(fw/2, fh * 1.35, fd * 0.05)
          tv.castShadow = true
          group.add(tv)
          // Screen glow
          const screenMat = new MeshStandardMaterial({ color: new Color(0.1,0.15,0.3), emissive: new Color(0.05,0.08,0.15), emissiveIntensity: 0.6, roughness: 0.05 })
          const screen = new Mesh(new BoxGeometry(fw * 0.82, fh * 1.0, 0.02), screenMat)
          screen.position.set(fw/2, fh * 1.35, fd * 0.03)
          group.add(screen)
        }
        else if (f.type === 'floor_lamp') {
          const pole = new Mesh(new CylinderGeometry(0.04,0.04,fh*0.88,8), new MeshStandardMaterial({ color: new Color(0.8,0.7,0.5), roughness: 0.3, metalness: 0.6 }))
          pole.position.set(fw/2, fh*0.44, fd/2)
          pole.castShadow = true
          group.add(pole)
          const shade = new Mesh(new CylinderGeometry(fw*0.6,fw*0.8,fh*0.22,16,1,true), new MeshStandardMaterial({ color: new Color(0.95,0.88,0.72), roughness: 0.9, side:2, emissive: new Color(0.25,0.18,0.04), emissiveIntensity: 0.5 }))
          shade.position.set(fw/2, fh*0.92, fd/2)
          group.add(shade)
          const base3 = new Mesh(new CylinderGeometry(fw*0.4,fw*0.45,0.08,12), new MeshStandardMaterial({ color: new Color(0.3,0.25,0.2), roughness: 0.4 }))
          base3.position.set(fw/2, 0.04, fd/2)
          group.add(base3)
        }
        else if (f.type === 'bathtub') {
          const outer = new Mesh(new BoxGeometry(fw, fh, fd), mat)
          outer.position.set(fw/2, fh/2, fd/2)
          outer.castShadow = outer.receiveShadow = true
          group.add(outer)
          const innerMat = new MeshStandardMaterial({ color: new Color(0.93,0.96,0.98), roughness: 0.08 })
          const inner = new Mesh(new BoxGeometry(fw*0.82, fh*0.7, fd*0.78), innerMat)
          inner.position.set(fw/2, fh*0.65, fd/2)
          group.add(inner)
        }
        else if (f.type === 'vanity') {
          const body = new Mesh(new BoxGeometry(fw, fh * 0.6, fd), mat)
          body.position.set(fw/2, fh * 0.3, fd/2)
          body.castShadow = body.receiveShadow = true
          group.add(body)
          const mirror = new Mesh(new BoxGeometry(fw * 0.92, fh * 0.55, 0.04), new MeshStandardMaterial({ color: new Color(0.7,0.75,0.8), roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.7 }))
          mirror.position.set(fw/2, fh * 0.88, fd * 0.02)
          group.add(mirror)
        }
        else if (f.type === 'toilet') {
          const tank = new Mesh(new BoxGeometry(fw, fh * 0.5, fd * 0.35), mat)
          tank.position.set(fw/2, fh * 0.53, fd * 0.175)
          tank.castShadow = tank.receiveShadow = true
          group.add(tank)
          const bowl = new Mesh(new BoxGeometry(fw * 0.84, fh * 0.32, fd * 0.7), mat)
          bowl.position.set(fw/2, fh * 0.16, fd * 0.6)
          bowl.castShadow = true
          group.add(bowl)
        }
        else if (f.type === 'shower') {
          const base4 = new Mesh(new BoxGeometry(fw, 0.1, fd), mat)
          base4.position.set(fw/2, 0.05, fd/2)
          base4.receiveShadow = true
          group.add(base4)
          const glassMat = new MeshStandardMaterial({ color: new Color(0.8,0.9,0.95), roughness: 0.05, transparent: true, opacity: 0.35 })
          ;[[0,0.5,fw,0.06,fd],[1,0.5,0.06,fw,fd],[0.5,0,fd,fw,0.06]].forEach(() => {
            const panel = new Mesh(new BoxGeometry(fw, fh, 0.06), glassMat)
            panel.position.set(fw/2, fh/2, 0)
            group.add(panel)
          })
          const side1 = new Mesh(new BoxGeometry(0.06, fh, fd), glassMat)
          side1.position.set(0, fh/2, fd/2)
          group.add(side1)
          const side2 = new Mesh(new BoxGeometry(0.06, fh, fd), glassMat)
          side2.position.set(fw, fh/2, fd/2)
          group.add(side2)
        }
        else if (f.type === 'chaise') {
          const seat2 = new Mesh(new BoxGeometry(fw, fh * 0.38, fd), mat)
          seat2.position.set(fw/2, fh * 0.19, fd/2)
          seat2.castShadow = seat2.receiveShadow = true
          group.add(seat2)
          const back2 = new Mesh(new BoxGeometry(fw * 0.14, fh * 0.5, fd), mat)
          back2.position.set(fw * 0.07, fh * 0.45, fd/2)
          group.add(back2)
        }
        else {
          // Generic box fallback
          const box = new Mesh(new BoxGeometry(fw, fh, fd), mat)
          box.position.set(fw/2, fh/2, fd/2)
          box.castShadow = box.receiveShadow = true
          group.add(box)
        }

        // Position and rotate group
        const rotRad = (f.rotation || 0) * Math.PI / 180
        group.position.set(x, 0, z)
        group.rotation.y = rotRad
        scene.add(group)
      }

      layoutJSON.furniture.forEach(addFurniture)

      // ── Render loop ──────────────────────────────────────────────
      let lastTime = 0
      function animate(time: number) {
        rafRef.current = requestAnimationFrame(animate)
        if (autoRotate && !dragging.current) {
          angleRef.current += 0.003
        }
        updateCamera()
        renderer.render(scene, camera)

        // First frame loaded
        if (!loaded && time > 100) setLoaded(true)
        lastTime = time
      }
      rafRef.current = requestAnimationFrame(animate)
      setLoaded(true)
    }

    init().catch(console.error)

    return () => {
      cancelAnimationFrame(rafRef.current)
      renderer?.dispose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutJSON, style])

  // ── Mouse / touch drag ──────────────────────────────────────────────────
  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true
    lastPos.current  = { x: e.clientX, y: e.clientY }
    setAutoRotate(false)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    angleRef.current += dx * 0.008
    vertRef.current   = Math.max(0.05, Math.min(0.85, vertRef.current - dy * 0.006))
    lastPos.current   = { x: e.clientX, y: e.clientY }
  }
  function onPointerUp() { dragging.current = false }

  function captureImage() {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png', 0.92)
    if (onCapture) onCapture(url)
    const a = document.createElement('a')
    a.href = url; a.download = '3d-room.png'; a.click()
  }

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#1a1a2e' }}>
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: '#0f172a' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(79,124,255,0.3)', borderTopColor: '#4f7cff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 14 }} />
          <p style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter,sans-serif' }}>Building 3D room...</p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 340, display: 'block', cursor: dragging.current ? 'grabbing' : 'grab' }}
        width={800}
        height={340}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />

      {/* Overlay controls */}
      <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
        <div style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
          ✦ 3D Live
        </div>
        <button onClick={() => setAutoRotate(a => !a)} style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: autoRotate ? '#4f7cff' : 'rgba(255,255,255,0.6)', border: `1px solid ${autoRotate ? 'rgba(79,124,255,0.5)' : 'rgba(255,255,255,0.15)'}`, cursor: 'pointer' }}>
          {autoRotate ? '⟳ Auto' : '⟳ Play'}
        </button>
      </div>

      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '4px 10px', fontSize: 10, color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
        Drag to rotate
      </div>

      {/* Capture button */}
      <button onClick={captureImage} style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(79,124,255,0.85)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
        ⬇ Save PNG
      </button>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
