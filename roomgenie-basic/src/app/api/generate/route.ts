import { NextResponse } from 'next/server'

// Very specific style details that force the right aesthetic
const STYLE_DETAILS: Record<string, string> = {
  Modern:        'contemporary minimalist design, clean straight lines, neutral whites greys blacks, low-profile modern furniture, polished concrete or hardwood floors, recessed ceiling lights, floor-to-ceiling windows',
  Luxury:        'ultra luxury opulent interior, Italian marble floors, gold brass fixtures and hardware, deep velvet sofa, crystal chandelier, silk curtains, dark jewel tone walls, expensive art on walls',
  Minimalist:    'extreme minimalism, pure white walls and ceiling, single bed or sofa only, no clutter, polished white floor, one pendant light, absolutely empty walls, zen japanese influence',
  Scandinavian:  'nordic scandinavian hygge interior, light pine wood floors, white walls, cozy knit throws, simple birch wood furniture, warm pendant lamps, sheepskin rug, indoor plants',
  Industrial:    'urban loft industrial style, exposed red brick feature wall, polished concrete floor, black steel pipe shelving, Edison filament bulbs, distressed leather sofa, reclaimed wood accents',
  Bohemian:      'boho chic eclectic interior, layered colorful Persian rugs on floor, macrame wall hanging, tropical plants everywhere, rattan and wicker furniture, warm orange amber lighting, patterned cushions',
  Japandi:       'japandi japanese scandinavian fusion, low wooden platform furniture, neutral beige cream tones, wabi-sabi clay ceramics, bonsai plant, shoji screen divider, tatami mat texture floor',
  Classic:       'traditional classic european interior, ornate mahogany carved wood furniture, tufted leather or velvet upholstery, crown moulding ceiling, antique brass chandelier, persian rug, silk drapes, dark rich wood floors',
  Contemporary:  'contemporary chic interior, bold statement wall art, sleek furniture mixed metals, designer floor lamp, open shelving, glass coffee table, abstract art, neutral palette with bold accents',
  Mediterranean: 'mediterranean coastal interior, terracotta tile floor, whitewashed textured walls, arched doorway visible, cobalt blue ceramic accents, wrought iron lamp, olive tree pot plant, warm golden sunlight',
}

// Room-specific furniture lists to force correct room type in render
const ROOM_FURNITURE: Record<string, string> = {
  'Living Room':  'large sofa, coffee table, TV unit, armchairs, floor lamp, bookshelf, area rug',
  'Bedroom':      'king size bed with headboard, bedside tables with lamps, wardrobe, dresser mirror, bed linen, pillows',
  'Kitchen':      'kitchen cabinets, countertop, kitchen island, bar stools, pendant lights over island, sink, appliances',
  'Bathroom':     'bathtub or walk-in shower, vanity sink unit, toilet, large mirror, towel rail, bathroom tiles floor to ceiling',
  'Home Office':  'large desk, ergonomic office chair, bookshelves, computer monitor, desk lamp, storage cabinets',
  'Dining Room':  'large dining table, dining chairs, sideboard cabinet, pendant light over table, wine rack',
  'Kids Room':    'single bed with colorful bedding, study desk, toy storage shelves, colorful rug, wardrobe, fun wall art',
  'Master Suite': 'king size bed, sitting area with chaise lounge, walk-in wardrobe doors, vanity dressing table, ensuite bathroom door',
  'Studio':       'murphy wall bed, compact sofa, small dining table, open plan kitchen, storage solutions, multifunctional furniture',
}

function buildRenderPrompt(style: string, roomType: string, details: string, dimDesc: string, custom: string, imagePrompt: string): string {
  const furniture = ROOM_FURNITURE[roomType] || 'appropriate furniture for the room type'

  return [
    // Force room type first and most prominently
    `INTERIOR DESIGN PHOTOGRAPH: ${roomType.toUpperCase()} - this is a ${roomType}, not any other room type`,
    `${style} style ${roomType} with ${furniture}`,
    details,
    dimDesc ? `room dimensions: ${dimDesc}` : '',
    imagePrompt || '',
    custom || '',
    // Quality enhancers
    'photorealistic 3D render, architectural visualization, professional interior photography',
    'wide angle shot of the ENTIRE room showing all furniture clearly',
    'perfect interior lighting, 8K ultra detailed, Architectural Digest magazine quality',
    'NO people, NO text, NO watermarks',
    // Negative guidance baked into prompt
    `definitely a ${roomType} with ${furniture.split(',')[0]} as the main furniture piece`,
  ].filter(Boolean).join('. ')
}

function buildFloorPlanPrompt(style: string, roomType: string, w: string, l: string, h: string, furniture: string): string {
  const sqft = Math.round(parseFloat(w) * parseFloat(l))
  return [
    `2D architectural floor plan, top-down birds-eye view, ${roomType} layout`,
    `room size exactly ${w} feet wide by ${l} feet long, ${sqft} square feet total`,
    h ? `ceiling height ${h} feet` : '',
    `${style} style furniture placement: ${furniture}`,
    'clean architectural drawing, overhead view, furniture shown as outlines',
    'white background, black lines, professional CAD-style floor plan',
    'scale accurate furniture placement, walls shown clearly, no 3D perspective',
    'interior design blueprint style, top view only',
  ].filter(Boolean).join(', ')
}

function describeDimensions(w: string, l: string, h: string): string {
  const width  = parseFloat(w)
  const length = parseFloat(l)
  const height = parseFloat(h)
  if (!width || !length) return ''
  const sqft   = Math.round(width * length)
  const shape  = width > length * 1.3 ? 'wide rectangular' : length > width * 1.3 ? 'long narrow' : 'square proportioned'
  let ceilDesc = ''
  if (height) {
    if (height <= 8)       ceilDesc = '8-foot standard ceiling'
    else if (height <= 9)  ceilDesc = '9-foot ceiling'
    else if (height <= 10) ceilDesc = '10-foot high ceiling'
    else if (height <= 12) ceilDesc = 'dramatic 12-foot ceiling height'
    else                   ceilDesc = `soaring ${height}-foot vaulted ceiling`
  }
  return [
    `${sqft} square foot ${shape} room`,
    `${width} feet wide by ${length} feet long`,
    ceilDesc,
  ].filter(Boolean).join(', ')
}

export async function POST(req: Request) {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const formData   = await req.formData()
    const style      = (formData.get('style')    as string) || 'Modern'
    const roomType   = (formData.get('roomType') as string) || 'Living Room'
    const custom     = (formData.get('prompt')   as string) || ''
    const answersRaw = formData.get('answers')   as string
    const dimsRaw    = formData.get('dimensions') as string

    let dims = { width: '', length: '', height: '' }
    try { if (dimsRaw) dims = { ...dims, ...JSON.parse(dimsRaw) } } catch { /* ignore */ }
    const w = dims.width  || (formData.get('w') as string) || ''
    const l = dims.length || (formData.get('l') as string) || ''
    const h = dims.height || (formData.get('h') as string) || ''

    let answers: Record<string, string> = {}
    try { if (answersRaw) answers = JSON.parse(answersRaw) } catch { /* ignore */ }

    const details  = STYLE_DETAILS[style] || style
    const dimDesc  = describeDimensions(w, l, h)
    const hasDims  = !!(w && l)
    const furniture = ROOM_FURNITURE[roomType] || 'furniture'

    // Step 1: Claude generates design concept
    const claudeResp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      system: `You are an expert interior designer. Respond ONLY with valid JSON (no markdown):
{
  "title": "evocative design title",
  "tagline": "one poetic sentence",
  "description": "3 sentences about materials, lighting, atmosphere for this specific ${roomType}",
  "spatialNote": "one sentence about how dimensions affect design (empty string if no dimensions)",
  "imagePrompt": "extremely specific Flux image prompt for a ${roomType} - must describe: specific ${ROOM_FURNITURE[roomType] || 'furniture'}, exact colors, materials, lighting direction, camera angle showing full ${roomType}",
  "colors": ["#hex - Name", "#hex - Name", "#hex - Name", "#hex - Name"],
  "furniture": ["specific scaled item 1", "item 2", "item 3", "item 4", "item 5"],
  "tips": ["specific tip 1", "tip 2", "tip 3"],
  "materials": ["material 1", "material 2", "material 3"]
}`,
      messages: [{
        role: 'user',
        content: [
          `Design a ${style} ${roomType}.`,
          `Must contain: ${furniture}.`,
          dimDesc ? `Room: ${dimDesc}.` : '',
          answers.mood     ? `Mood: ${answers.mood}.`         : '',
          answers.budget   ? `Budget: ${answers.budget}.`     : '',
          answers.lighting ? `Lighting: ${answers.lighting}.` : '',
          answers.material ? `Materials: ${answers.material}.`: '',
          custom ? `Client: ${custom}.` : '',
        ].filter(Boolean).join(' ')
      }],
    })

    const raw = claudeResp.content[0].type === 'text' ? claudeResp.content[0].text.trim() : '{}'
    let design: Record<string, unknown>
    try {
      design = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch {
      design = {
        title: `${style} ${roomType}`,
        tagline: 'A beautifully curated space.',
        description: `A stunning ${style} ${roomType}.`,
        spatialNote: '',
        imagePrompt: '',
        colors: ['#F5F5F0 - Warm White', '#D4C5A9 - Sand', '#8B7355 - Taupe', '#2C2C2C - Charcoal'],
        furniture: furniture.split(', '),
        tips: ['Layer lighting', 'Mix textures', 'Consistent palette'],
        materials: ['Premium linen', 'Natural oak', 'Brushed brass'],
      }
    }

    // Step 2: Build highly specific 3D render prompt
    const renderPrompt = buildRenderPrompt(
      style, roomType, details, dimDesc, custom,
      typeof design.imagePrompt === 'string' ? design.imagePrompt : ''
    )

    // Step 3: Generate 3D render — Flux model with strong negative prompt
    const encodedRender  = encodeURIComponent(renderPrompt.slice(0, 600))
    const negativePrompt = encodeURIComponent('wrong room type, outdoor, people, text, watermark, blurry, cartoon, painting, drawing')
    const seed3d  = Math.floor(Math.random() * 999999)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedRender}?width=1344&height=768&seed=${seed3d}&model=flux&nologo=true&enhance=true&negative=${negativePrompt}`

    // Step 4: Floor plan (only if dimensions entered)
    let floorPlanUrl: string | null = null
    if (hasDims) {
      const fpPrompt  = buildFloorPlanPrompt(style, roomType, w, l, h, furniture)
      const encodedFP = encodeURIComponent(fpPrompt.slice(0, 500))
      const negFP     = encodeURIComponent('3D, perspective, people, text, watermark, colored')
      const seedFP    = Math.floor(Math.random() * 999999)
      floorPlanUrl = `https://image.pollinations.ai/prompt/${encodedFP}?width=768&height=768&seed=${seedFP}&model=flux&nologo=true&enhance=true&negative=${negFP}`
    }

    return NextResponse.json({
      image: imageUrl,
      floorPlan: floorPlanUrl,
      hasDimensions: hasDims,
      dimensions: hasDims ? { w, l, h, sqft: Math.round(parseFloat(w) * parseFloat(l)) } : null,
      design,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    console.error('Generate error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
