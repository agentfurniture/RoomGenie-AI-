/**
 * RoomGenie AI — Generation Pipeline
 * ====================================
 * Architecture (6 stages):
 *
 * [1] VISION ANALYSIS      — Claude vision reads room photo + furniture photo
 * [2] LAYOUT PLANNING      — Claude generates structured RoomLayoutJSON
 * [3] FLOOR PLAN           — SVG generated deterministically from JSON (no AI needed)
 * [4] PROMPT BUILDING      — Render prompt built from JSON data (not guessed)
 * [5] IMAGE GENERATION     — Replicate SDXL renders from the precise prompt
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
  anthropic:        import('@anthropic-ai/sdk').default,
  style:            string,
  roomType:         string,
  dims:             RoomDimensions,
  answers:          Record<string, string>,
  custom:           string,
  roomContext:      string,
  furnitureContext: string
): Promise<RoomLayoutJSON> {
  const styleKw = STYLE_KEYWORDS[style] || style

  const userContext = [
    `Style: ${style}. Room: ${roomType}.`,
    `Room dimensions: ${dims.widthFt}ft wide × ${dims.lengthFt}ft long × ${dims.heightFt}ft ceiling (${dims.sqft} sqft).`,
    answers.mood     ? `Desired mood: ${answers.mood}.`              : '',
    answers.budget   ? `Budget: ${answers.budget}.`                  : '',
    answers.lighting ? `Lighting: ${answers.lighting}.`              : '',
    answers.material ? `Materials: ${answers.material}.`             : '',
    custom           ? `CLIENT REQUEST: "${custom}"` : '',
    roomContext      ? `Existing room: ${roomContext}`                : '',
    furnitureContext ? `Preserve this furniture: ${furnitureContext}` : '',
  ].filter(Boolean).join('\n')

  const resp = await anthropic.messages.create({
    model:      'claude-sonnet-4-5',
    max_tokens: 4000,
    system: `You are a world-class interior designer. Generate a UNIQUE layout that reflects EXACTLY what the client asked for.
RULES:
- Read the client request carefully. Every word matters.
- Choose furniture, colors, and labels that DIRECTLY reflect their request.
- Kids room = bright colors, playful labels. Luxury = gold/cream/velvet. Minimalist = white/grey/clean.
- Labels must be SPECIFIC: "Rainbow Toy Shelf", "Princess Canopy Bed", not "Shelf", "Bed"
- Colors must match the mood. Use varied, realistic hex values.
- All positions are 0.0-1.0 fractions. xFrac=0=LEFT, yFrac=0=FAR wall.
- No overlaps. 3ft (≈0.2 fraction) walkways between pieces.
- Include 6-10 furniture pieces appropriate for the room and request.
- Scale correctly: in ${dims.sqft} sqft, a bed is wFrac≈${Math.min(0.55, 6.5/dims.widthFt).toFixed(2)}, dFrac≈${Math.min(0.42, 6.5/dims.lengthFt).toFixed(2)}.
Respond ONLY with valid JSON. No markdown.`,
    messages: [{
      role: 'user',
      content: `${userContext}

Return this exact JSON structure with values that match the client's request:
{
  "roomId": "r${Date.now()}",
  "roomType": "${roomType}",
  "style": "${style}",
  "dimensions": {"widthFt":${dims.widthFt},"lengthFt":${dims.lengthFt},"heightFt":${dims.heightFt},"sqft":${dims.sqft}},
  "floor": {"material":"hardwood|carpet|tile|marble","color":"#hex","pattern":"plank|herringbone|tile|none"},
  "walls": {"color":"#hex","material":"paint|plaster|wallpaper","accentWall":"describe or null"},
  "ceiling": {"color":"#hex","heightFt":${dims.heightFt},"feature":"crown moulding|plain|beams"},
  "furniture": [
    {"id":"f1","type":"bed|sofa|desk|wardrobe|shelving|rug|floor_lamp|etc",
     "label":"SPECIFIC name matching request",
     "color":"#hex matching style and request",
     "material":"fabric|wood|metal|velvet|etc",
     "xFrac":0.0,"yFrac":0.0,"wFrac":0.0,"dFrac":0.0,"heightFt":0.0,
     "rotation":0,"preserved":false,"notes":"why this piece and position"}
  ],
  "lighting": {"ambient":"describe","accent":"describe","natural":"describe"},
  "palette": {"primary":"#hex","secondary":"#hex","accent":"#hex","neutral":"#hex"},
  "styleDetails": "${styleKw}",
  "mood": "${answers.mood || custom || 'balanced and inviting'}",
  "designRationale": "2 sentences on how this reflects the client request",
  "spatialNotes": "How ${dims.sqft} sqft shaped the layout",
  "title": "Evocative title capturing the specific design",
  "tagline": "One sentence description",
  "description": "3 sentences on atmosphere, materials, and how it fulfills the request",
  "colors": ["#hex - Name","#hex - Name","#hex - Name","#hex - Name"],
  "tips": ["Specific tip for this design","Tip 2","Tip 3"],
  "materials": ["Material 1","Material 2","Material 3"]
}`
    }]
  })

  const raw = resp.content[0].type === 'text' ? resp.content[0].text : ''
  const jsonMatch = raw.replace(/```json?\n?/g,'').replace(/```\n?/g,'').trim().match(/\{[\s\S]*\}/)
  const parsed = jsonMatch ? jsonMatch[0] : ''

  try {
    const layout = JSON.parse(parsed) as RoomLayoutJSON
    layout.dimensions = dims
    console.log(`[Layout] "${layout.title}" — ${layout.furniture?.length || 0} pieces`)
    return layout
  } catch (e) {
    console.error('[Layout] Parse failed:', (e as Error).message, raw.slice(0, 200))
    // Style-aware fallback
    const fallback = getDefaultLayout(roomType, style, dims, answers)
    const styleColorMap: Record<string, string[]> = {
      'Modern':        ['#F5F5F0 - Warm White','#2C2C2C - Charcoal','#8B8680 - Warm Grey','#C4A882 - Sand'],
      'Luxury':        ['#F5EDD8 - Champagne','#C9A84C - Antique Gold','#1A1A2E - Midnight','#8B7355 - Cognac'],
      'Minimalist':    ['#FFFFFF - Pure White','#F0F0F0 - Off White','#2C2C2C - Charcoal','#E8E8E8 - Pearl'],
      'Scandinavian':  ['#FFFFFF - Nordic White','#D4BC94 - Pine','#4A6741 - Forest','#C8B898 - Birch'],
      'Industrial':    ['#2C2C2C - Iron','#B5A898 - Raw Plaster','#8B6030 - Reclaimed','#6B6B6B - Steel'],
      'Bohemian':      ['#C87040 - Terracotta','#D4A050 - Amber','#5C8A50 - Jungle','#9B4444 - Burgundy'],
      'Japandi':       ['#F2EDE5 - Washi','#C8AA80 - Bamboo','#5C4830 - Walnut','#8BA888 - Sage'],
      'Classic':       ['#F5F0E8 - Ivory','#C9A84C - Gold','#8B2020 - Crimson','#2C1810 - Mahogany'],
      'Kids Room':     ['#FF9EAF - Bubblegum','#87CEEB - Sky Blue','#98FB98 - Mint Green','#FFD700 - Sunshine'],
    }
    fallback.title       = custom ? custom.split(' ').slice(0,6).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ') : `${style} ${roomType}`
    fallback.tagline     = `A uniquely crafted ${style.toLowerCase()} ${roomType.toLowerCase()}.`
    fallback.description = `This ${style.toLowerCase()} ${roomType.toLowerCase()} ${custom ? 'features ' + custom.slice(0,80) + '. ' : ''}The ${dims.sqft} sqft space is designed for both beauty and function. ${answers.mood ? 'The ' + answers.mood + ' atmosphere flows through every detail.' : ''}`
    fallback.colors      = styleColorMap[style] || styleColorMap['Modern']
    fallback.tips        = [`Layer ${style.toLowerCase()} lighting for depth`, `Mix textures to add warmth`, `The ${dims.widthFt}×${dims.lengthFt}ft layout allows for a clear focal point`]
    fallback.materials   = { 'Luxury':['Italian marble','Brushed brass','Hand-stitched velvet'], 'Scandinavian':['Light pine','Natural linen','Sheepskin'], 'Industrial':['Reclaimed wood','Black steel','Raw concrete'], 'Bohemian':['Rattan','Cotton macramé','Persian wool'] }[style] || ['Premium fabric','Natural oak','Brushed metal']
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


// ─── STAGE 5: NANO BANANA (Google Gemini Image Generation) ───────────────────
//
// Nano Banana = Google's codename for Gemini native image generation
// Correct model strings for the Gemini API:
//   gemini-2.0-flash-preview-image-generation  = Nano Banana (fast)
//   imagen-3.0-generate-002                    = Imagen 3 (best quality, $0.03/image)
//
// API key from: aistudio.google.com → Get API Key → set as GEMINI_API_KEY in Vercel

async function generateWithNanoBanana(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) { console.log('[NanoBanana] No GEMINI_API_KEY'); return null }

  // Try Imagen 3 first (best quality for interiors, $0.03/image)
  const imagen3Result = await tryImagen3(apiKey, prompt)
  if (imagen3Result) return imagen3Result

  // Fallback: Gemini 2.0 Flash image generation (free tier)
  return await tryGeminiFlashImage(apiKey, prompt)
}

async function tryImagen3(apiKey: string, prompt: string): Promise<string | null> {
  try {
    console.log('[Imagen3] Generating interior render...')
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`

    const body = {
      instances: [{ prompt: prompt.slice(0, 2000) }],
      parameters: {
        sampleCount:     1,
        aspectRatio:     '16:9',
        safetyFilterLevel: 'block_few',
        personGeneration: 'dont_allow',
      }
    }

    const resp = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })

    if (!resp.ok) {
      const err = await resp.text()
      console.error('[Imagen3] Error:', resp.status, err.slice(0, 200))
      return null
    }

    const data = await resp.json()
    const pred  = data.predictions?.[0]
    if (pred?.bytesBase64Encoded) {
      console.log('[Imagen3] Success ✓')
      return `data:image/png;base64,${pred.bytesBase64Encoded}`
    }
    console.error('[Imagen3] No image in response:', JSON.stringify(data).slice(0, 200))
    return null
  } catch (e) {
    console.error('[Imagen3] Exception:', e)
    return null
  }
}

async function tryGeminiFlashImage(apiKey: string, prompt: string): Promise<string | null> {
  try {
    console.log('[GeminiFlash] Falling back to gemini-2.0-flash image generation...')
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`

    const body = {
      contents: [{ parts: [{ text: prompt.slice(0, 2000) }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
    }

    const resp = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })

    if (!resp.ok) {
      console.error('[GeminiFlash] Error:', resp.status, await resp.text().then(t => t.slice(0, 200)))
      return null
    }

    const data = await resp.json()
    for (const part of (data.candidates?.[0]?.content?.parts || [])) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        console.log('[GeminiFlash] Success ✓')
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
      }
    }
    console.error('[GeminiFlash] No image in response')
    return null
  } catch (e) {
    console.error('[GeminiFlash] Exception:', e)
    return null
  }
}

// Curated Unsplash fallbacks — used only if Nano Banana fails entirely
const FALLBACK_IMAGES: Record<string, string> = {
  'Modern-Living Room':    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1400&q=90&auto=format&fit=crop',
  'Modern-Bedroom':        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1400&q=90&auto=format&fit=crop',
  'Modern-Kitchen':        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=90&auto=format&fit=crop',
  'Modern-Bathroom':       'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1400&q=90&auto=format&fit=crop',
  'Luxury-Living Room':    'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1400&q=90&auto=format&fit=crop',
  'Luxury-Bedroom':        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1400&q=90&auto=format&fit=crop',
  'Luxury-Bathroom':       'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1400&q=90&auto=format&fit=crop',
  'Scandinavian-Living Room':'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&q=90&auto=format&fit=crop',
  'Scandinavian-Bedroom':  'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=1400&q=90&auto=format&fit=crop',
  'Industrial-Living Room':'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=1400&q=90&auto=format&fit=crop',
  'Bohemian-Living Room':  'https://images.unsplash.com/photo-1522444195799-478538b28823?w=1400&q=90&auto=format&fit=crop',
  'Japandi-Bedroom':       'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=90&auto=format&fit=crop',
  'Classic-Living Room':   'https://images.unsplash.com/photo-1560448075-bb485b067938?w=1400&q=90&auto=format&fit=crop',
  'Classic-Bedroom':       'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1400&q=90&auto=format&fit=crop',
  'Kids Room':             'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1400&q=90&auto=format&fit=crop',
  'Master Suite':          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1400&q=90&auto=format&fit=crop',
  'Bathroom':              'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1400&q=90&auto=format&fit=crop',
  'Kitchen':               'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=90&auto=format&fit=crop',
  'Home Office':           'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&q=90&auto=format&fit=crop',
  'Dining Room':           'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=1400&q=90&auto=format&fit=crop',
}

function getFallbackImage(style: string, roomType: string): string {
  return FALLBACK_IMAGES[`${style}-${roomType}`]
    || FALLBACK_IMAGES[roomType]
    || Object.values(FALLBACK_IMAGES).find((_,i,a)=> Object.keys(FALLBACK_IMAGES)[i].endsWith(`-${roomType}`))
    || 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1400&q=90&auto=format&fit=crop'
}

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
    console.log(`[Pipeline] ${style} ${roomType} | ${dims.widthFt}×${dims.lengthFt}ft`)

    // ── STAGE 1: Vision analysis ──────────────────────────────────────────────
    const { roomContext, furnitureContext } = await analyzeImages(anthropic, roomFile, furnFile)

    // ── STAGE 2: Layout planning ──────────────────────────────────────────────
    const layout = await planLayout(anthropic, style, roomType, dims, answers, custom, roomContext, furnitureContext)
    console.log(`[Layout] ${layout.furniture?.length || 0} pieces`)

    // ── STAGE 3: SVG floor plan ───────────────────────────────────────────────
    const svgString       = generateFloorPlanSVG(layout)
    const floorPlanDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`

    // ── STAGE 4: Build spatially-exact render prompt ──────────────────────────
    const { prompt } = buildRenderPrompt(layout)

    // ── STAGE 5: Nano Banana / Imagen 3 image generation ─────────────────────
    // Build a crisp, interior-specific prompt from layoutJSON
    // Imagen 3 and Gemini follow clear structured prompts best

    const mainFurniture = (layout.furniture || [])
      .filter((f: { type: string; heightFt: number }) => f.type !== 'rug' && f.heightFt > 1.0)
      .slice(0, 7)
      .map((f: { label: string; color: string; material: string }) => `${f.label} in ${f.color} ${f.material}`)
      .join(', ')

    const wallColor  = layout.walls?.color    || '#F5F2ED'
    const floorMat   = layout.floor?.material || 'hardwood'
    const floorColor = layout.floor?.color    || '#C4A882'
    const ceilH      = dims.heightFt
    const ceilDesc   = ceilH >= 12 ? `soaring ${ceilH}ft ceiling` : ceilH >= 10 ? `${ceilH}ft high ceiling` : `${ceilH}ft ceiling`

    // Structured prompt — Imagen 3 responds best to clear, sentence-based descriptions
    const imagePrompt = [
      `Professional architectural interior design photograph of a ${style} ${roomType}.`,
      `The room is ${dims.widthFt} feet wide by ${dims.lengthFt} feet long with a ${ceilDesc}.`,
      `Walls are painted ${wallColor}, floor is ${floorMat} in ${floorColor}.`,
      mainFurniture ? `Furniture includes: ${mainFurniture}.` : '',
      layout.styleDetails ? `Style: ${layout.styleDetails}.` : '',
      layout.mood         ? `Mood: ${layout.mood}.`           : '',
      answers.mood        ? `Atmosphere: ${answers.mood}.`    : '',
      custom              ? `${custom}.`                      : '',
      `Wide angle corner shot showing the entire room and all furniture.`,
      `Magazine-quality photorealistic render, perfect natural and artificial lighting, sharp focus, ultra detailed.`,
      `No people, no text overlays, no watermarks.`,
    ].filter(Boolean).join(' ')

    console.log('[Prompt] Interior prompt:', imagePrompt.slice(0, 150))

    let photoUrl: string = await generateWithNanoBanana(imagePrompt) || ''

    if (!photoUrl) {
      console.log('[Stage 5] All AI failed, using curated fallback')
      photoUrl = getFallbackImage(style, roomType)
    }

    console.log('[Stage 5]', photoUrl.startsWith('data:') ? 'AI image ✓' : 'Curated fallback')

    // ── STAGE 6: Return all outputs ───────────────────────────────────────────
    return NextResponse.json({
      image:         photoUrl,
      floorPlan:     floorPlanDataUrl,
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
        furniture:   (layout.furniture || []).filter((f: { type: string }) => f.type !== 'rug').map((f: { label: string }) => f.label).slice(0,6),
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
