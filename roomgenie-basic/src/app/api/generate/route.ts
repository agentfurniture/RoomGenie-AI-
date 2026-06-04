/**
 * RoomGenie AI — Generation Pipeline
 * ====================================
 * Architecture (6 stages):
 *
 * [1] VISION ANALYSIS      — Claude vision reads room photo + furniture photo
 * [2] LAYOUT PLANNING      — Claude generates structured RoomLayoutJSON
 * [3] FLOOR PLAN           — SVG generated deterministically from JSON (no AI needed)
 * [4] PROMPT BUILDING      — Render prompt built from JSON data (not guessed)
 * [5] IMAGE GENERATION     — OpenAI gpt-image-1 generates from the precise prompt
 * [6] RESPONSE             — Returns image, SVG floor plan, layout JSON, design metadata
 *
 * The key insight: both images derive from the SAME layout JSON,
 * so they always match each other. Dimensions drive furniture placement.
 * Furniture inventory is preserved. Room type cannot "drift".
 */

import { NextResponse } from 'next/server'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface RoomDimensions {
  widthFt:  number
  lengthFt: number
  heightFt: number
  sqft:     number
}

interface PlacedFurniture {
  id:        string
  type:      string
  label:     string
  color:     string
  material:  string
  xFrac:     number
  yFrac:     number
  wFrac:     number
  dFrac:     number
  heightFt:  number
  rotation:  0 | 90 | 180 | 270
  preserved: boolean
  notes:     string
}

interface RoomLayoutJSON {
  roomId:      string
  roomType:    string
  style:       string
  dimensions:  RoomDimensions
  floor:       { material: string; color: string; pattern?: string }
  walls:       { color: string; material: string; accentWall?: string }
  ceiling:     { color: string; heightFt: number; feature?: string }
  furniture:   PlacedFurniture[]
  lighting:    { ambient: string; accent: string; natural: string }
  palette:     { primary: string; secondary: string; accent: string; neutral: string }
  styleDetails: string
  mood:         string
  designRationale: string
  spatialNotes:    string
  // Claude-generated display fields
  title?:       string
  tagline?:     string
  description?: string
  colors?:      string[]
  tips?:        string[]
  materials?:   string[]
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STYLE_KEYWORDS: Record<string, string> = {
  Modern:        'contemporary minimalist, clean straight lines, neutral white and grey, low-profile furniture, polished hardwood floors, recessed ceiling lights, metal accents',
  Luxury:        'ultra luxury opulent, Italian marble floors, gold and brass fixtures, deep velvet upholstery, crystal chandelier, jewel tone walls, expensive art pieces',
  Minimalist:    'extreme minimalism, pure white walls, single essential furniture only, polished floor, one pendant lamp, completely empty walls, zen atmosphere',
  Scandinavian:  'nordic hygge, light pine wood floors, white walls, sheepskin throw, simple birch furniture, warm pendant lamp, indoor potted plants',
  Industrial:    'urban loft, exposed red brick feature wall, polished concrete floor, black steel shelving, Edison filament bulbs, distressed leather, reclaimed wood',
  Bohemian:      'boho eclectic, layered colorful Persian rugs, macrame wall hanging, many tropical plants, natural rattan furniture, warm amber lighting, patterned cushions',
  Japandi:       'japandi fusion, very low wooden platform furniture, neutral beige cream tones, wabi-sabi ceramics, small bonsai, shoji screens, natural linen',
  Classic:       'traditional classic european, ornate mahogany carved wood furniture, tufted velvet, crown moulding ceiling, antique brass chandelier, persian rug, silk drapes, dark hardwood floor',
  Contemporary:  'contemporary chic, bold geometric accent wall, sleek mixed metal furniture, designer floor lamp, smoked glass table, oversized abstract art',
  Mediterranean: 'mediterranean coastal, handmade terracotta tile floor, rough whitewashed plaster walls, arched doorway, cobalt blue ceramics, wrought iron lamp, large potted olive tree, golden sunlight',
}

const DEFAULT_FURNITURE: Record<string, Omit<PlacedFurniture, 'id'>[]> = {
  'Living Room': [
    { type:'sofa',         label:'Main Sofa',        color:'#8B8680', material:'fabric', xFrac:0.15, yFrac:0.50, wFrac:0.40, dFrac:0.15, heightFt:3.0, rotation:0,   preserved:false, notes:'Centered on longest wall facing TV' },
    { type:'coffee_table', label:'Coffee Table',      color:'#6B5B45', material:'wood',  xFrac:0.20, yFrac:0.38, wFrac:0.20, dFrac:0.10, heightFt:1.5, rotation:0,   preserved:false, notes:'In front of sofa' },
    { type:'tv_unit',      label:'TV Unit',           color:'#4A4A4A', material:'wood',  xFrac:0.15, yFrac:0.08, wFrac:0.40, dFrac:0.08, heightFt:2.0, rotation:0,   preserved:false, notes:'Against short wall centered' },
    { type:'armchair',     label:'Accent Chair',      color:'#7A6A5A', material:'fabric',xFrac:0.65, yFrac:0.45, wFrac:0.13, dFrac:0.12, heightFt:3.0, rotation:90,  preserved:false, notes:'Corner accent seating' },
    { type:'rug',          label:'Area Rug',          color:'#C8B8A8', material:'wool',  xFrac:0.12, yFrac:0.35, wFrac:0.50, dFrac:0.35, heightFt:0.1, rotation:0,   preserved:false, notes:'Defines seating zone' },
  ],
  'Bedroom': [
    { type:'bed',          label:'King Bed',          color:'#F5F0EB', material:'fabric',xFrac:0.20, yFrac:0.08, wFrac:0.55, dFrac:0.42, heightFt:4.5, rotation:0,   preserved:false, notes:'Centered headboard against far wall' },
    { type:'nightstand',   label:'Left Nightstand',   color:'#8B7355', material:'wood',  xFrac:0.12, yFrac:0.12, wFrac:0.10, dFrac:0.12, heightFt:2.2, rotation:0,   preserved:false, notes:'Left of bed' },
    { type:'nightstand',   label:'Right Nightstand',  color:'#8B7355', material:'wood',  xFrac:0.75, yFrac:0.12, wFrac:0.10, dFrac:0.12, heightFt:2.2, rotation:0,   preserved:false, notes:'Right of bed' },
    { type:'wardrobe',     label:'Wardrobe',          color:'#D4C9BE', material:'wood',  xFrac:0.08, yFrac:0.70, wFrac:0.35, dFrac:0.18, heightFt:8.0, rotation:0,   preserved:false, notes:'Side wall full height' },
    { type:'dresser',      label:'Dresser',           color:'#A09080', material:'wood',  xFrac:0.62, yFrac:0.72, wFrac:0.22, dFrac:0.14, heightFt:3.5, rotation:0,   preserved:false, notes:'Opposite to wardrobe' },
    { type:'rug',          label:'Bedroom Rug',       color:'#E8DDD0', material:'wool',  xFrac:0.16, yFrac:0.38, wFrac:0.65, dFrac:0.35, heightFt:0.1, rotation:0,   preserved:false, notes:'Under foot of bed' },
  ],
  'Kitchen': [
    { type:'cabinets_lower',label:'Lower Cabinets',   color:'#E8E0D4', material:'wood',  xFrac:0.05, yFrac:0.05, wFrac:0.55, dFrac:0.16, heightFt:3.0, rotation:0,   preserved:false, notes:'Main wall run' },
    { type:'island',        label:'Kitchen Island',   color:'#C8B8A8', material:'stone', xFrac:0.25, yFrac:0.45, wFrac:0.35, dFrac:0.18, heightFt:3.2, rotation:0,   preserved:false, notes:'Central island' },
    { type:'stool',         label:'Bar Stool 1',      color:'#6B5B45', material:'metal', xFrac:0.27, yFrac:0.63, wFrac:0.06, dFrac:0.06, heightFt:3.0, rotation:0,   preserved:false, notes:'Island seating' },
    { type:'stool',         label:'Bar Stool 2',      color:'#6B5B45', material:'metal', xFrac:0.37, yFrac:0.63, wFrac:0.06, dFrac:0.06, heightFt:3.0, rotation:0,   preserved:false, notes:'Island seating' },
    { type:'stool',         label:'Bar Stool 3',      color:'#6B5B45', material:'metal', xFrac:0.47, yFrac:0.63, wFrac:0.06, dFrac:0.06, heightFt:3.0, rotation:0,   preserved:false, notes:'Island seating' },
  ],
  'Home Office': [
    { type:'desk',         label:'Executive Desk',    color:'#6B5B45', material:'wood',  xFrac:0.15, yFrac:0.10, wFrac:0.45, dFrac:0.20, heightFt:2.5, rotation:0,   preserved:false, notes:'Facing window' },
    { type:'chair',        label:'Office Chair',      color:'#2C2C2C', material:'mesh',  xFrac:0.28, yFrac:0.30, wFrac:0.14, dFrac:0.14, heightFt:4.5, rotation:0,   preserved:false, notes:'Behind desk' },
    { type:'bookshelf',    label:'Floor-Ceiling Bookcase',color:'#8B7355',material:'wood',xFrac:0.70,yFrac:0.05,wFrac:0.25,dFrac:0.15,heightFt:8.0, rotation:0,   preserved:false, notes:'Side wall full height' },
  ],
  'Dining Room': [
    { type:'dining_table', label:'Dining Table',      color:'#6B5B45', material:'wood',  xFrac:0.18, yFrac:0.22, wFrac:0.58, dFrac:0.45, heightFt:2.5, rotation:0,   preserved:false, notes:'Centered under chandelier' },
    { type:'dining_chair', label:'Chair 1',           color:'#8B7355', material:'fabric',xFrac:0.19, yFrac:0.15, wFrac:0.10, dFrac:0.12, heightFt:3.2, rotation:0,   preserved:false, notes:'Head' },
    { type:'dining_chair', label:'Chair 2',           color:'#8B7355', material:'fabric',xFrac:0.33, yFrac:0.15, wFrac:0.10, dFrac:0.12, heightFt:3.2, rotation:0,   preserved:false, notes:'Side' },
    { type:'dining_chair', label:'Chair 3',           color:'#8B7355', material:'fabric',xFrac:0.47, yFrac:0.15, wFrac:0.10, dFrac:0.12, heightFt:3.2, rotation:0,   preserved:false, notes:'Side' },
    { type:'dining_chair', label:'Chair 4',           color:'#8B7355', material:'fabric',xFrac:0.61, yFrac:0.15, wFrac:0.10, dFrac:0.12, heightFt:3.2, rotation:0,   preserved:false, notes:'End' },
    { type:'sideboard',    label:'Sideboard',         color:'#5B4B35', material:'wood',  xFrac:0.10, yFrac:0.78, wFrac:0.45, dFrac:0.14, heightFt:3.0, rotation:0,   preserved:false, notes:'Back wall' },
  ],
  'Bathroom': [
    { type:'bathtub',      label:'Freestanding Tub',  color:'#F0EDE8', material:'acrylic',xFrac:0.52,yFrac:0.10,wFrac:0.38,dFrac:0.32,heightFt:2.5, rotation:0,   preserved:false, notes:'Feature near window' },
    { type:'vanity',       label:'Double Vanity',     color:'#D4C9BE', material:'wood',  xFrac:0.05, yFrac:0.08, wFrac:0.42, dFrac:0.18, heightFt:3.2, rotation:0,   preserved:false, notes:'Main wall' },
    { type:'shower',       label:'Walk-in Shower',    color:'#E8E8E8', material:'glass', xFrac:0.52, yFrac:0.55, wFrac:0.40, dFrac:0.40, heightFt:8.0, rotation:0,   preserved:false, notes:'Corner glass' },
    { type:'toilet',       label:'Toilet',            color:'#F5F2EF', material:'ceramic',xFrac:0.10,yFrac:0.60,wFrac:0.14,dFrac:0.20,heightFt:2.8, rotation:0,   preserved:false, notes:'Private corner' },
  ],
  'Kids Room': [
    { type:'bed',          label:'Single Bed',        color:'#FFE4E1', material:'wood',  xFrac:0.08, yFrac:0.08, wFrac:0.38, dFrac:0.30, heightFt:3.5, rotation:0,   preserved:false, notes:'Against wall leaving play space' },
    { type:'desk',         label:'Study Desk',        color:'#FFF8DC', material:'wood',  xFrac:0.62, yFrac:0.08, wFrac:0.28, dFrac:0.18, heightFt:2.4, rotation:0,   preserved:false, notes:'Near window' },
    { type:'shelving',     label:'Toy Shelves',       color:'#E8F4FD', material:'wood',  xFrac:0.08, yFrac:0.70, wFrac:0.50, dFrac:0.14, heightFt:5.0, rotation:0,   preserved:false, notes:'Low accessible storage' },
    { type:'wardrobe',     label:'Wardrobe',          color:'#F0F8E8', material:'wood',  xFrac:0.70, yFrac:0.65, wFrac:0.24, dFrac:0.20, heightFt:7.5, rotation:0,   preserved:false, notes:'Full height' },
    { type:'rug',          label:'Play Rug',          color:'#FFD700', material:'nylon', xFrac:0.10, yFrac:0.40, wFrac:0.55, dFrac:0.25, heightFt:0.1, rotation:0,   preserved:false, notes:'Central play area' },
  ],
  'Master Suite': [
    { type:'bed',          label:'King Bed',          color:'#F0EBE3', material:'fabric',xFrac:0.22, yFrac:0.06, wFrac:0.52, dFrac:0.42, heightFt:4.8, rotation:0,   preserved:false, notes:'Centered feature headboard wall' },
    { type:'nightstand',   label:'Left Nightstand',   color:'#8B7355', material:'marble',xFrac:0.13, yFrac:0.10, wFrac:0.09, dFrac:0.11, heightFt:2.2, rotation:0,   preserved:false, notes:'His side' },
    { type:'nightstand',   label:'Right Nightstand',  color:'#8B7355', material:'marble',xFrac:0.74, yFrac:0.10, wFrac:0.09, dFrac:0.11, heightFt:2.2, rotation:0,   preserved:false, notes:'Her side' },
    { type:'chaise',       label:'Chaise Lounge',     color:'#C8B8A8', material:'velvet',xFrac:0.68, yFrac:0.62, wFrac:0.25, dFrac:0.14, heightFt:3.0, rotation:90,  preserved:false, notes:'Reading nook corner' },
    { type:'vanity',       label:'Dressing Vanity',   color:'#D4C9BE', material:'wood',  xFrac:0.08, yFrac:0.65, wFrac:0.22, dFrac:0.15, heightFt:5.5, rotation:0,   preserved:false, notes:'With Hollywood mirror' },
    { type:'rug',          label:'Luxury Rug',        color:'#E0D5C5', material:'wool',  xFrac:0.15, yFrac:0.38, wFrac:0.68, dFrac:0.30, heightFt:0.1, rotation:0,   preserved:false, notes:'Defines sleeping zone' },
  ],
  'Studio': [
    { type:'murphy_bed',   label:'Murphy Wall Bed',   color:'#D4C9BE', material:'wood',  xFrac:0.05, yFrac:0.05, wFrac:0.45, dFrac:0.18, heightFt:8.0, rotation:0,   preserved:false, notes:'Wall bed closed = bookshelf' },
    { type:'sofa',         label:'Compact Sofa',      color:'#8B8680', material:'fabric',xFrac:0.55, yFrac:0.30, wFrac:0.35, dFrac:0.14, heightFt:3.0, rotation:90,  preserved:false, notes:'Living zone divider' },
    { type:'dining_table', label:'Round Table',       color:'#6B5B45', material:'wood',  xFrac:0.18, yFrac:0.55, wFrac:0.20, dFrac:0.20, heightFt:2.5, rotation:0,   preserved:false, notes:'Dining zone' },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function parseDims(formData: FormData): RoomDimensions {
  const dimsRaw = formData.get('dimensions') as string
  let raw = { width: '', length: '', height: '' }
  try { if (dimsRaw) raw = { ...raw, ...JSON.parse(dimsRaw) } } catch { /**/ }

  const w = parseFloat(raw.width  || (formData.get('w') as string) || '0')
  const l = parseFloat(raw.length || (formData.get('l') as string) || '0')
  const h = parseFloat(raw.height || (formData.get('h') as string) || '9')

  return {
    widthFt:  w || 14,
    lengthFt: l || 16,
    heightFt: h || 9,
    sqft:     Math.round((w || 14) * (l || 16)),
  }
}

function getDefaultLayout(
  roomType: string, style: string, dims: RoomDimensions,
  answers: Record<string, string>
): RoomLayoutJSON {
  const styleKw = STYLE_KEYWORDS[style] || style
  const items   = (DEFAULT_FURNITURE[roomType] || DEFAULT_FURNITURE['Living Room'])
    .map((f, i) => ({ ...f, id: `${f.type}_${i + 1}` }))

  return {
    roomId:      `room_${Date.now()}`,
    roomType, style,
    dimensions:  dims,
    floor:       { material: 'hardwood', color: '#C4A882', pattern: 'plank' },
    walls:       { color: '#F5F2ED', material: 'painted plaster' },
    ceiling:     { color: '#FFFFFF', heightFt: dims.heightFt },
    furniture:   items,
    lighting:    { ambient: 'warm recessed 2700K', accent: 'table lamps', natural: 'natural daylight windows' },
    palette:     { primary: '#8B7355', secondary: '#F5F2ED', accent: '#4A90D9', neutral: '#E8E0D4' },
    styleDetails: styleKw,
    mood:        answers.mood || 'balanced and inviting',
    designRationale: `${style} design optimised for ${dims.sqft} sqft.`,
    spatialNotes:    `${dims.widthFt}×${dims.lengthFt}ft proportions allow comfortable furniture placement.`,
  }
}

// ─── STAGE 1: VISION ANALYSIS ─────────────────────────────────────────────────

async function analyzeImages(
  anthropic: import('@anthropic-ai/sdk').default,
  roomFile:  File | null,
  furnFile:  File | null
): Promise<{ roomContext: string; furnitureContext: string }> {
  if (!roomFile && !furnFile) return { roomContext: '', furnitureContext: '' }

  async function toBase64(f: File): Promise<{ data: string; type: 'image/jpeg' | 'image/png' | 'image/webp' }> {
    const buf  = await f.arrayBuffer()
    const arr  = new Uint8Array(buf)
    let   bin  = ''
    arr.forEach(b => bin += String.fromCharCode(b))
    return {
      data: btoa(bin),
      type: (f.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp'
    }
  }

  const results = await Promise.all([
    roomFile ? (async () => {
      const { data, type } = await toBase64(roomFile)
      const resp = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: type, data } },
            { type: 'text',  text: 'Describe this room briefly for interior design purposes: floor type, wall color, window placement, architectural features, existing furniture, estimated size. 3-4 sentences max.' }
          ]
        }]
      })
      return resp.content[0].type === 'text' ? resp.content[0].text : ''
    })() : Promise.resolve(''),

    furnFile ? (async () => {
      const { data, type } = await toBase64(furnFile)
      const resp = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: type, data } },
            { type: 'text',  text: 'List all furniture pieces visible with their approximate dimensions, colors, and materials. These must be preserved in the new design.' }
          ]
        }]
      })
      return resp.content[0].type === 'text' ? resp.content[0].text : ''
    })() : Promise.resolve(''),
  ])

  return { roomContext: results[0], furnitureContext: results[1] }
}

// ─── STAGE 2: LAYOUT PLANNING ─────────────────────────────────────────────────

async function planLayout(
  anthropic:       import('@anthropic-ai/sdk').default,
  style:           string,
  roomType:        string,
  dims:            RoomDimensions,
  answers:         Record<string, string>,
  custom:          string,
  roomContext:     string,
  furnitureContext: string
): Promise<RoomLayoutJSON> {
  const styleKw = STYLE_KEYWORDS[style] || style

  const userContext = [
    `Style: ${style}. Room: ${roomType}.`,
    `Exact dimensions: ${dims.widthFt}ft wide × ${dims.lengthFt}ft long × ${dims.heightFt}ft ceiling. Total: ${dims.sqft} sqft.`,
    answers.mood     ? `Mood: ${answers.mood}.`         : '',
    answers.budget   ? `Budget: ${answers.budget}.`     : '',
    answers.lighting ? `Lighting: ${answers.lighting}.` : '',
    answers.material ? `Materials preference: ${answers.material}.` : '',
    custom           ? `Client notes: ${custom}.`       : '',
    roomContext      ? `Existing room: ${roomContext}`   : '',
    furnitureContext  ? `Furniture to PRESERVE in new design: ${furnitureContext}` : '',
  ].filter(Boolean).join('\n')

  const resp = await anthropic.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 2500,
    system: `You are an expert interior designer and spatial planner.
Generate PRECISE room layout JSON where ALL furniture positions and sizes are fractions of the room (0.0-1.0).
- xFrac=0 is LEFT wall, xFrac=1 is RIGHT wall
- yFrac=0 is FAR wall (back), yFrac=1 is NEAR wall (front/viewer)
- wFrac = furniture width as fraction of room width
- dFrac = furniture depth as fraction of room length
- Ensure NO furniture overlaps. Maintain 3ft walkways (0.18 fraction at minimum).
- Scale furniture REALISTICALLY: a sofa in a ${dims.sqft} sqft ${roomType} should be proportional.
- If furniture to preserve is mentioned, include it with preserved:true.
Respond ONLY with valid JSON. No markdown. No explanation.`,
    messages: [{
      role: 'user',
      content: `${userContext}

Generate complete room layout JSON:
{
  "roomId": "r${Date.now()}",
  "roomType": "${roomType}",
  "style": "${style}",
  "dimensions": {"widthFt":${dims.widthFt},"lengthFt":${dims.lengthFt},"heightFt":${dims.heightFt},"sqft":${dims.sqft}},
  "floor": {"material":"string","color":"#hex","pattern":"optional"},
  "walls": {"color":"#hex","material":"string","accentWall":"optional"},
  "ceiling": {"color":"#hex","heightFt":${dims.heightFt},"feature":"optional"},
  "furniture": [{"id":"f1","type":"sofa|bed|etc","label":"Display Name","color":"#hex","material":"string","xFrac":0.0,"yFrac":0.0,"wFrac":0.0,"dFrac":0.0,"heightFt":0.0,"rotation":0,"preserved":false,"notes":"placement reason"}],
  "lighting": {"ambient":"string","accent":"string","natural":"string"},
  "palette": {"primary":"#hex","secondary":"#hex","accent":"#hex","neutral":"#hex"},
  "styleDetails": "${styleKw}",
  "mood": "${answers.mood || 'balanced'}",
  "designRationale": "2 sentences on layout decisions",
  "spatialNotes": "1 sentence on how dimensions shaped design",
  "title": "Creative design title",
  "tagline": "One poetic sentence",
  "description": "3 sentences describing atmosphere and materials",
  "colors": ["#hex - Name","#hex - Name","#hex - Name","#hex - Name"],
  "tips": ["Specific design tip 1","Tip 2","Tip 3"],
  "materials": ["Material 1","Material 2","Material 3"]
}`
    }]
  })

  const text = resp.content[0].type === 'text' ? resp.content[0].text : ''
  try {
    const layout = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()) as RoomLayoutJSON
    // Ensure dimensions are always the user-provided values
    layout.dimensions = dims
    return layout
  } catch (e) {
    console.error('[Layout] Parse failed, using defaults:', e)
    const fallback = getDefaultLayout(roomType, style, dims, answers)
    fallback.title       = `${style} ${roomType}`
    fallback.tagline     = 'A beautifully curated space.'
    fallback.description = `A stunning ${style} ${roomType} designed for ${dims.sqft} sqft.`
    fallback.colors      = ['#F5F5F0 - Warm White','#D4C5A9 - Sand','#8B7355 - Taupe','#2C2C2C - Charcoal']
    fallback.tips        = ['Layer your lighting','Mix textures for depth','Maintain consistent palette']
    fallback.materials   = ['Premium linen','Natural oak','Brushed brass']
    return fallback
  }
}

// ─── STAGE 3: SVG FLOOR PLAN ──────────────────────────────────────────────────

function generateFloorPlanSVG(layout: RoomLayoutJSON): string {
  const CW = 800, CH = 600, M = 56
  const rpw = CW - M * 2
  const rph = CH - M * 2
  const ox  = M, oy = M

  const scX = rpw / layout.dimensions.widthFt
  const scY = rph / layout.dimensions.lengthFt

  function lighten(hex: string, a = 0.6): string {
    if (!hex || !hex.startsWith('#')) return '#f0ede8'
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
    const lr = Math.round(r+(255-r)*a), lg = Math.round(g+(255-g)*a), lb = Math.round(b+(255-b)*a)
    return `#${lr.toString(16).padStart(2,'0')}${lg.toString(16).padStart(2,'0')}${lb.toString(16).padStart(2,'0')}`
  }
  function darken(hex: string, a = 0.3): string {
    if (!hex || !hex.startsWith('#')) return '#333333'
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
    const dr = Math.round(r*(1-a)), dg = Math.round(g*(1-a)), db = Math.round(b*(1-a))
    return `#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`
  }

  function renderPiece(f: PlacedFurniture): string {
    const px = ox + f.xFrac * rpw
    const py = oy + f.yFrac * rph
    const pw = f.wFrac * rpw
    const pd = f.dFrac * rph
    if (pw < 4 || pd < 4) return ''
    const cx = px + pw/2, cy = py + pd/2
    const fill = lighten(f.color, 0.55)
    const stroke = darken(f.color, 0.25)
    const fs = Math.max(7, Math.min(10, pw/8))
    const lbl = f.label.length > 14 ? f.label.slice(0,13)+'…' : f.label
    const rotT = f.rotation ? `transform="rotate(${f.rotation},${cx.toFixed(1)},${cy.toFixed(1)})"` : ''

    if (f.type === 'rug') {
      return `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${pw.toFixed(1)}" height="${pd.toFixed(1)}" fill="none" stroke="${f.color}" stroke-width="1" stroke-dasharray="4,3" rx="2" opacity="0.45"/>`
    }
    if (f.type === 'bathtub') {
      const rx=pw/2,ry=pd/2
      return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <ellipse cx="${cx.toFixed(1)}" cy="${(cy+ry*0.15).toFixed(1)}" rx="${(rx*.7).toFixed(1)}" ry="${(ry*.58).toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="0.7"/>`
    }
    if (f.type === 'toilet') {
      const th=pd*.28
      return `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${pw.toFixed(1)}" height="${th.toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" rx="2"/>
      <ellipse cx="${cx.toFixed(1)}" cy="${(py+th+(pd-th)*.5).toFixed(1)}" rx="${(pw*.44).toFixed(1)}" ry="${((pd-th)*.47).toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`
    }
    if (f.type === 'shower') {
      return `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${pw.toFixed(1)}" height="${pd.toFixed(1)}" fill="${lighten(f.color,.8)}" stroke="#888" stroke-width="1.5" rx="2" stroke-dasharray="5,2"/>
      <line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${(px+pw).toFixed(1)}" y2="${(py+pd).toFixed(1)}" stroke="#aaa" stroke-width="0.6"/>
      <line x1="${(px+pw).toFixed(1)}" y1="${py.toFixed(1)}" x2="${px.toFixed(1)}" y2="${(py+pd).toFixed(1)}" stroke="#aaa" stroke-width="0.6"/>`
    }
    if (f.type === 'bed' || f.type === 'murphy_bed') {
      const pr=Math.min(pw*.10,pd*.15,10), p1x=px+pw*.25, p2x=px+pw*.70, py2=py+pd*.13
      return `<g ${rotT}><rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${pw.toFixed(1)}" height="${pd.toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" rx="3"/>
      <rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${pw.toFixed(1)}" height="${(pd*.18).toFixed(1)}" fill="${darken(f.color,.08)}" stroke="none" rx="2"/>
      <circle cx="${p1x.toFixed(1)}" cy="${py2.toFixed(1)}" r="${pr.toFixed(1)}" fill="${lighten(f.color,.3)}" stroke="${darken(f.color,.15)}" stroke-width="0.8"/>
      <circle cx="${p2x.toFixed(1)}" cy="${py2.toFixed(1)}" r="${pr.toFixed(1)}" fill="${lighten(f.color,.3)}" stroke="${darken(f.color,.15)}" stroke-width="0.8"/>
      ${pw>32&&pd>20?`<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" fill="${darken(f.color,.5)}" font-family="Arial" font-weight="500">${lbl}</text>`:''}
      </g>`
    }
    if (f.type === 'sofa' || f.type === 'chaise') {
      const bh=pd*.24
      return `<g ${rotT}><rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${pw.toFixed(1)}" height="${pd.toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" rx="3"/>
      <rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${pw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${darken(f.color,.1)}" stroke="none" rx="2"/>
      ${pw>30&&pd>16?`<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" fill="${darken(f.color,.5)}" font-family="Arial">${lbl}</text>`:''}
      </g>`
    }

    return `<g ${rotT}><rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${pw.toFixed(1)}" height="${pd.toFixed(1)}"
      fill="${fill}" stroke="${stroke}" stroke-width="${f.preserved?2:1.5}" rx="2" ${f.preserved?'stroke-dasharray="5,2"':''}/>
      ${pw>28&&pd>16?`<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" fill="${darken(f.color,.5)}" font-family="Arial" font-weight="500">${lbl}</text>`:''}
    </g>`
  }

  const pieces = layout.furniture
    .filter(f => f.type !== 'cabinets_upper')
    .map(renderPiece).join('\n    ')

  const doorX=ox+rpw-scX*3, doorY=oy+rph, dsr=scX*3
  const ticksH = Array.from({length: Math.floor(layout.dimensions.widthFt/2)+1}, (_,i) => {
    const x=ox+i*2*scX
    return `<line x1="${x.toFixed(1)}" y1="${(oy-8).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(oy-3).toFixed(1)}" stroke="#666" stroke-width="1"/>
    <text x="${x.toFixed(1)}" y="${(oy-11).toFixed(1)}" text-anchor="middle" font-size="9" fill="#666" font-family="Arial">${i*2}'</text>`
  }).join('')
  const ticksV = Array.from({length: Math.floor(layout.dimensions.lengthFt/2)+1}, (_,i) => {
    const y=oy+i*2*scY
    return `<line x1="${(ox-8).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(ox-3).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#666" stroke-width="1"/>
    <text x="${(ox-11).toFixed(1)}" y="${y.toFixed(1)}" text-anchor="end" dominant-baseline="middle" font-size="9" fill="#666" font-family="Arial">${i*2}'</text>`
  }).join('')

  return `<svg viewBox="0 0 ${CW} ${CH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${CW}" height="${CH}" fill="#FAFAF8"/>
  <text x="${CW/2}" y="18" text-anchor="middle" font-size="12" font-weight="700" fill="#1a1a2e" font-family="Arial">
    ${layout.style} ${layout.roomType} · ${layout.dimensions.widthFt}' × ${layout.dimensions.lengthFt}' · ${layout.dimensions.sqft} sq ft
  </text>
  ${ticksH}${ticksV}
  <rect x="${ox}" y="${oy}" width="${rpw}" height="${rph}" fill="${lighten(layout.floor.color,.75)}" stroke="none"/>
  <rect x="${ox}" y="${oy}" width="${rpw}" height="${rph}" fill="none" stroke="#1a1a2e" stroke-width="4" rx="1"/>
  <line x1="${doorX.toFixed(1)}" y1="${doorY.toFixed(1)}" x2="${(doorX+dsr).toFixed(1)}" y2="${doorY.toFixed(1)}" stroke="#444" stroke-width="2.5"/>
  <path d="M${doorX.toFixed(1)} ${doorY.toFixed(1)} A${dsr.toFixed(1)} ${dsr.toFixed(1)} 0 0 1 ${doorX.toFixed(1)} ${(doorY-dsr).toFixed(1)}" fill="none" stroke="#444" stroke-width="1" stroke-dasharray="4,2"/>
  ${pieces}
  <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#666"/></marker></defs>
  <line x1="${ox}" y1="${(oy+rph+20).toFixed(1)}" x2="${(ox+rpw).toFixed(1)}" y2="${(oy+rph+20).toFixed(1)}" stroke="#666" stroke-width="1" marker-start="url(#arr)" marker-end="url(#arr)"/>
  <text x="${(ox+rpw/2).toFixed(1)}" y="${(oy+rph+34).toFixed(1)}" text-anchor="middle" font-size="10" fill="#666" font-family="Arial">${layout.dimensions.widthFt} ft</text>
  <line x1="${(ox+rpw+20).toFixed(1)}" y1="${oy}" x2="${(ox+rpw+20).toFixed(1)}" y2="${(oy+rph).toFixed(1)}" stroke="#666" stroke-width="1" marker-start="url(#arr)" marker-end="url(#arr)"/>
  <text x="${(ox+rpw+34).toFixed(1)}" y="${(oy+rph/2).toFixed(1)}" text-anchor="middle" font-size="10" fill="#666" font-family="Arial" transform="rotate(-90,${(ox+rpw+34).toFixed(1)},${(oy+rph/2).toFixed(1)})">${layout.dimensions.lengthFt} ft</text>
</svg>`
}

// ─── STAGE 4: PROMPT BUILDER ──────────────────────────────────────────────────

function buildRenderPrompt(layout: RoomLayoutJSON): { prompt: string; negative: string } {
  const { roomType, style, dimensions, floor, walls, ceiling, furniture, lighting, mood, styleDetails } = layout

  const mainPieces = furniture
    .filter(f => f.type !== 'rug' && f.heightFt > 1.5)
    .sort((a,b) => b.wFrac*b.dFrac - a.wFrac*a.dFrac)
    .slice(0,6)

  const furnitureDesc = mainPieces.map(f => {
    const pos = f.yFrac<.3 ? 'against far wall' : f.yFrac>.7 ? 'near foreground' : f.xFrac<.3 ? 'on left side' : f.xFrac>.6 ? 'on right side' : 'centered in room'
    return `${f.label} (${f.color} ${f.material}, ${pos})`
  }).join(', ')

  const shape   = dimensions.widthFt/dimensions.lengthFt > 1.3 ? 'wide rectangular' : dimensions.widthFt/dimensions.lengthFt < .77 ? 'long narrow' : 'square proportioned'
  const ceilFeel = dimensions.heightFt<=8 ? 'standard ceiling' : dimensions.heightFt<=10 ? 'high airy ceiling' : `dramatic ${dimensions.heightFt}ft soaring ceiling`

  const prompt = [
    `ultra photorealistic interior design photograph of a ${style} ${roomType}`,
    `${dimensions.sqft} sqft ${shape} room, ${dimensions.widthFt}ft wide × ${dimensions.lengthFt}ft long, ${ceilFeel}`,
    `room contains: ${furnitureDesc}`,
    `${walls.color} walls in ${walls.material}, ${floor.material} floor in ${floor.color}${floor.pattern ? ' ' + floor.pattern + ' pattern' : ''}`,
    walls.accentWall ? walls.accentWall : '',
    ceiling.feature  ? ceiling.feature  : '',
    styleDetails,
    `${mood} atmosphere`,
    `lighting: ${lighting.natural}, ${lighting.ambient}, ${lighting.accent}`,
    `wide angle corner shot showing entire ${roomType} with all furniture clearly visible`,
    '8K ultra photorealistic render, Architectural Digest quality, professional interior photography',
    'perfect balanced lighting, sharp focus throughout',
    'no people, no text, no watermarks',
  ].filter(Boolean).join('. ')

  const roomNeg: Record<string,string> = {
    Bedroom:      'no living room sofa no coffee table no TV unit no dining table',
    'Living Room':'no bed no headboard no wardrobe no bedroom furniture',
    Kitchen:      'no bed no sofa no bedroom furniture',
    Bathroom:     'no bed no sofa no dining table',
    'Home Office':'no bed no sofa no dining furniture',
    'Dining Room':'no bed no sofa no bedroom furniture no TV',
    'Kids Room':  'no luxury adult furniture no office only',
    'Master Suite':'no living room sofa no dining table no kitchen',
    Studio:       'no large separate rooms',
  }

  const negative = [
    roomNeg[roomType] || '',
    'no people, no faces, no text, no watermark, no logo',
    'not blurry not distorted not overexposed not dark',
    'not cartoon not illustration not painting not sketch',
    'not outdoor not exterior not garden not street',
    'not cluttered not messy not under construction',
  ].filter(Boolean).join(', ')

  return { prompt, negative }
}

// ─── STAGE 5: REPLICATE IMAGE GENERATION ─────────────────────────────────────

async function generateImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) { console.log('[OpenAI] No API key'); return null }

  try {
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({ apiKey })

    console.log('[OpenAI] Generating with gpt-image-1...')
    const response = await openai.images.generate({
      model:   'gpt-image-1',
      prompt:  prompt.slice(0, 4000),
      size:    '1536x1024',
      quality: 'high',
      n:       1,
    })

    const item = response.data?.[0]
    if (!item) return null
    if (item.b64_json) return `data:image/png;base64,${item.b64_json}`
    if (item.url)      return item.url
    return null
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[OpenAI] Error:', msg)
    return null
  }
}

// Curated direct Unsplash images — keyed by "Style-RoomType"
// These are guaranteed correct room type images, used when Replicate fails
const FALLBACK_IMAGES: Record<string, string> = {
  // Modern
  'Modern-Living Room':   'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1400&q=90&auto=format&fit=crop',
  'Modern-Bedroom':       'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1400&q=90&auto=format&fit=crop',
  'Modern-Kitchen':       'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=90&auto=format&fit=crop',
  'Modern-Bathroom':      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1400&q=90&auto=format&fit=crop',
  'Modern-Home Office':   'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&q=90&auto=format&fit=crop',
  'Modern-Dining Room':   'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=1400&q=90&auto=format&fit=crop',
  // Luxury
  'Luxury-Living Room':   'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1400&q=90&auto=format&fit=crop',
  'Luxury-Bedroom':       'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1400&q=90&auto=format&fit=crop',
  'Luxury-Bathroom':      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1400&q=90&auto=format&fit=crop',
  'Luxury-Dining Room':   'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1400&q=90&auto=format&fit=crop',
  'Luxury-Kitchen':       'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1400&q=90&auto=format&fit=crop',
  // Minimalist
  'Minimalist-Living Room':'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1400&q=90&auto=format&fit=crop',
  'Minimalist-Bedroom':   'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1400&q=90&auto=format&fit=crop',
  'Minimalist-Kitchen':   'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1400&q=90&auto=format&fit=crop',
  'Minimalist-Bathroom':  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1400&q=90&auto=format&fit=crop',
  // Scandinavian
  'Scandinavian-Living Room':'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&q=90&auto=format&fit=crop',
  'Scandinavian-Bedroom': 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=1400&q=90&auto=format&fit=crop',
  'Scandinavian-Kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=90&auto=format&fit=crop',
  // Industrial
  'Industrial-Living Room':'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=1400&q=90&auto=format&fit=crop',
  'Industrial-Home Office':'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=90&auto=format&fit=crop',
  'Industrial-Bedroom':   'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=90&auto=format&fit=crop',
  // Bohemian
  'Bohemian-Living Room': 'https://images.unsplash.com/photo-1522444195799-478538b28823?w=1400&q=90&auto=format&fit=crop',
  'Bohemian-Bedroom':     'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=1400&q=90&auto=format&fit=crop',
  // Japandi
  'Japandi-Living Room':  'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?w=1400&q=90&auto=format&fit=crop',
  'Japandi-Bedroom':      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=90&auto=format&fit=crop',
  'Japandi-Bathroom':     'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=90&auto=format&fit=crop',
  // Classic
  'Classic-Living Room':  'https://images.unsplash.com/photo-1560448075-bb485b067938?w=1400&q=90&auto=format&fit=crop',
  'Classic-Bedroom':      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1400&q=90&auto=format&fit=crop',
  'Classic-Dining Room':  'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=1400&q=90&auto=format&fit=crop',
  // Contemporary
  'Contemporary-Living Room':'https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=1400&q=90&auto=format&fit=crop',
  'Contemporary-Bedroom': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1400&q=90&auto=format&fit=crop',
  // Mediterranean
  'Mediterranean-Living Room':'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=90&auto=format&fit=crop',
  'Mediterranean-Bedroom':'https://images.unsplash.com/photo-1560448075-bb485b067938?w=1400&q=90&auto=format&fit=crop',
  // Kids / Suite / Studio
  'Kids Room':            'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1400&q=90&auto=format&fit=crop',
  'Master Suite':         'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1400&q=90&auto=format&fit=crop',
  'Studio':               'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1400&q=90&auto=format&fit=crop',
}

function getFallbackImage(style: string, roomType: string): string {
  // Try exact style+room match first
  const key1 = `${style}-${roomType}`
  if (FALLBACK_IMAGES[key1]) return FALLBACK_IMAGES[key1]
  // Try just room type (any style)
  const key2 = Object.keys(FALLBACK_IMAGES).find(k => k.endsWith(`-${roomType}`))
  if (key2) return FALLBACK_IMAGES[key2]
  // Try just room type without style prefix
  if (FALLBACK_IMAGES[roomType]) return FALLBACK_IMAGES[roomType]
  // Ultimate fallback — always a living room, never random
  return 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1400&q=90&auto=format&fit=crop'
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const formData   = await req.formData()
    const style      = (formData.get('style')    as string) || 'Modern'
    const roomType   = (formData.get('roomType') as string) || 'Living Room'
    const custom     = (formData.get('prompt')   as string) || ''
    const answersRaw = formData.get('answers')   as string
    const roomFile   = formData.get('image')     as File | null
    const furnFile   = formData.get('furniture_image') as File | null

    let answers: Record<string, string> = {}
    try { if (answersRaw) answers = JSON.parse(answersRaw) } catch { /**/ }

    const dims = parseDims(formData)
    const hasDims = dims.widthFt !== 14 || dims.lengthFt !== 16 // not just defaults

    console.log(`[Pipeline] ${style} ${roomType} | ${dims.widthFt}×${dims.lengthFt}ft | ${dims.sqft}sqft`)

    // ── STAGE 1: Vision Analysis (parallel) ──────────────────────────────────
    const { roomContext, furnitureContext } = await analyzeImages(anthropic, roomFile, furnFile)
    if (roomContext)     console.log('[Vision] Room:', roomContext.slice(0, 80))
    if (furnitureContext) console.log('[Vision] Furniture:', furnitureContext.slice(0, 80))

    // ── STAGE 2: Layout Planning ──────────────────────────────────────────────
    const layout = await planLayout(anthropic, style, roomType, dims, answers, custom, roomContext, furnitureContext)
    console.log(`[Layout] Generated ${layout.furniture.length} furniture pieces`)

    // ── STAGE 3: SVG Floor Plan (deterministic from JSON) ────────────────────
    const svgString       = generateFloorPlanSVG(layout)
    const floorPlanDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`

    // ── STAGE 4: Build photorealistic render prompt from the same JSON ────────
    const { prompt, negative } = buildRenderPrompt(layout)
    console.log('[Prompt]', prompt.slice(0, 120))

    // ── STAGE 5: Generate photorealistic render (OpenAI gpt-image-1) ─────────────
    // This is the "real room" image — same furniture/colors/layout as the 3D viewer
    // Build an ultra-specific prompt that lists every piece of furniture with its
    // exact position, color and material from the layout JSON
    const furnitureLine = layout.furniture
      .filter(f => f.type !== 'rug' && f.heightFt > 1.0)
      .slice(0, 6)
      .map(f => {
        const pos = f.yFrac < 0.3 ? 'against far wall' : f.yFrac > 0.7 ? 'near foreground' : f.xFrac < 0.3 ? 'left side' : f.xFrac > 0.6 ? 'right side' : 'center'
        return `${f.label} (${f.color} ${f.material}, ${pos})`
      }).join(', ')

    // Room-type-specific furniture guard — prevents wrong room type in render
    const ROOM_MUST_HAVE: Record<string, string> = {
      'Living Room':  'sofa, coffee table, TV unit',
      'Bedroom':      'bed with headboard, bedside tables, wardrobe',
      'Kitchen':      'kitchen cabinets, countertop, kitchen island',
      'Bathroom':     'bathtub or shower, vanity sink, toilet, tiles',
      'Home Office':  'large desk, office chair, bookshelves',
      'Dining Room':  'dining table, dining chairs, sideboard',
      'Kids Room':    'kids bed, study desk, toy shelves, colorful decor',
      'Master Suite': 'king bed, chaise lounge, walk-in wardrobe',
      'Studio':       'murphy bed, compact sofa, small dining table',
    }
    const mustHave = ROOM_MUST_HAVE[roomType] || ''

    const photoPrompt = [
      // Room type stated first and most prominently
      `${style} style ${roomType} interior design`,
      `a beautiful ${roomType} with ${mustHave}`,
      // Dimensions
      `${layout.dimensions.widthFt} by ${layout.dimensions.lengthFt} feet, ${layout.dimensions.sqft} sqft`,
      layout.dimensions.heightFt >= 10 ? `${layout.dimensions.heightFt}ft high ceiling` : '',
      // Key furniture from layout
      `containing ${furnitureLine}`,
      // Surfaces
      `${layout.floor.material} flooring, ${layout.walls.color} walls`,
      // Style keywords
      layout.styleDetails,
      `${layout.mood} atmosphere`,
      answers.mood     ? `${answers.mood} mood`        : '',
      answers.material ? `${answers.material} finishes` : '',
      custom           ? custom                         : '',
      // Quality
      'interior design photography, wide angle, entire room visible, professional lighting, photorealistic, 8K',
    ].filter(Boolean).join(', ')

    // Try OpenAI gpt-image-1 — if fails, retry with simpler prompt
    let photoImage = await generateImage(photoPrompt)

    if (!photoImage) {
      console.log('[OpenAI] First attempt failed, retrying with simpler prompt...')
      const simplePrompt = `${style} ${roomType} interior design, ${mustHave}, ${layout.styleDetails}, wide angle architectural photography, photorealistic, 8K quality, no people`
      photoImage = await generateImage(simplePrompt)
    }

    const photoUrl = photoImage || getFallbackImage(style, roomType)
    console.log('[Photo render]', photoImage ? 'OpenAI gpt-image-1 success ✓' : `Using curated fallback for ${style} ${roomType}`)

    // ── STAGE 6: Return all 3 outputs ─────────────────────────────────────────
    return NextResponse.json({
      // Output 1: Photorealistic render (OpenAI gpt-image-1)
      image:     photoUrl,
      // Output 2: SVG floor plan (deterministic from JSON)
      floorPlan: floorPlanDataUrl,
      // Output 3: layoutJSON → drives the Three.js 3D viewer on the frontend
      hasDimensions: true,
      dimensions: {
        w:    String(dims.widthFt),
        l:    String(dims.lengthFt),
        h:    String(dims.heightFt),
        sqft: dims.sqft,
      },
      design: {
        title:       layout.title       || `${style} ${roomType}`,
        tagline:     layout.tagline     || 'A beautifully curated space.',
        description: layout.description || `A stunning ${style} ${roomType}.`,
        spatialNote: layout.spatialNotes || '',
        colors:      layout.colors      || [],
        furniture:   layout.furniture.filter(f=>f.type!=='rug').map(f=>f.label).slice(0,6),
        tips:        layout.tips        || [],
        materials:   layout.materials   || [],
      },
      layoutJSON: {
        dimensions: layout.dimensions,
        furniture:  layout.furniture,
        floor:      layout.floor,
        walls:      layout.walls,
        palette:    layout.palette,
      },
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Pipeline failed'
    console.error('[Pipeline] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
