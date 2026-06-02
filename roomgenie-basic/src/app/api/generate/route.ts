import { NextResponse } from 'next/server'

const STYLE_DETAILS: Record<string, string> = {
  Modern:        'contemporary minimalist, clean straight lines, neutral white and grey, low-profile modern furniture, polished hardwood floors, recessed ceiling lights',
  Luxury:        'ultra luxury opulent, Italian marble floors, gold brass fixtures, deep velvet upholstery, crystal chandelier, jewel tone walls, expensive art',
  Minimalist:    'extreme minimalism, pure white walls, single essential furniture only, polished white floor, one pendant lamp, empty walls, zen calm',
  Scandinavian:  'nordic hygge, light pine wood floors, white walls, sheepskin throw, simple birch furniture, warm pendant lamp, indoor potted plants',
  Industrial:    'urban loft, exposed red brick feature wall, polished concrete floor, black steel shelving, Edison filament bulbs, distressed brown leather, reclaimed wood',
  Bohemian:      'boho eclectic, layered colorful Persian rugs, macrame wall hanging, many tropical plants, natural rattan furniture, warm amber lighting, patterned cushions',
  Japandi:       'japandi fusion, very low wooden platform furniture, neutral beige cream tones, wabi-sabi unglazed ceramics, small bonsai, shoji screen, natural linen',
  Classic:       'traditional classic european, large ornate mahogany carved wood furniture, tufted button velvet upholstery, crown moulding ceiling, antique brass chandelier, persian rug, heavy silk drapes, dark hardwood floor',
  Contemporary:  'contemporary chic, bold geometric accent wall, sleek mixed-metal furniture, designer floor lamp, smoked glass table, oversized abstract art',
  Mediterranean: 'mediterranean coastal, handmade terracotta tile floor, rough whitewashed plaster walls, arched doorway, cobalt blue ceramics, wrought iron lamp, large potted olive tree, golden sunlight',
}

const ROOM_FURNITURE: Record<string, string> = {
  'Living Room':  'large three-seater sofa, rectangular coffee table, flatscreen TV on wall unit, two accent armchairs, tall floor lamp, patterned area rug',
  'Bedroom':      'king size bed with tall upholstered headboard against main wall, two matching bedside tables with table lamps, large built-in wardrobe, full length mirror, soft layered bedding with decorative pillows',
  'Kitchen':      'floor-to-ceiling kitchen cabinets, thick marble countertop, central kitchen island with three bar stools, three pendant lights over island, professional range oven, large refrigerator',
  'Bathroom':     'large freestanding oval bathtub, separate walk-in shower with glass partition, floating double vanity with large mirror above, heated towel rail, large format marble tiles on floor and walls',
  'Home Office':  'large executive desk, high back ergonomic chair, floor-to-ceiling bookshelves on one wall, dual monitors on desk, articulated desk lamp, filing cabinet',
  'Dining Room':  'large eight-seater rectangular dining table, upholstered dining chairs, tall sideboard buffet cabinet, dramatic chandelier directly above table, large framed artwork on main wall',
  'Kids Room':    'single bed with colorful themed bedding, small study desk with chair, open cube toy storage shelves, bright colorful rug, tall wardrobe, fun educational wall mural',
  'Master Suite': 'oversized king bed with tall upholstered headboard, chaise lounge chair in corner, double door walk-in wardrobe visible, elegant vanity dressing table with mirror and stool',
  'Studio':       'wall-mounted murphy fold-down bed with built-in shelves, compact two-seater sofa, round dining table for two, compact open-plan kitchen in background, full wall storage with sliding doors',
}

function describeDimensions(w: string, l: string, h: string): string {
  const width = parseFloat(w), length = parseFloat(l), height = parseFloat(h)
  if (!width || !length) return ''
  const sqft  = Math.round(width * length)
  const shape = width > length * 1.3 ? 'wide rectangular' : length > width * 1.3 ? 'long and narrow' : 'square proportioned'
  const ceil  = !height ? '' : height <= 8 ? 'with 8ft ceiling' : height <= 10 ? `with ${height}ft high ceiling` : `with soaring ${height}ft ceiling`
  return `${sqft} sqft ${shape}, ${width}ft wide by ${length}ft long ${ceil}`.trim()
}

async function replicateSDXL(prompt: string, negPrompt: string, width: number, height: number): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) return null

  try {
    const createResp = await fetch('https://api.replicate.com/v1/models/stability-ai/sdxl/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=60',
      },
      body: JSON.stringify({
        input: {
          prompt,
          negative_prompt: negPrompt,
          width,
          height,
          num_inference_steps: 40,
          guidance_scale: 9,
          refine: 'expert_ensemble_refiner',
          high_noise_frac: 0.8,
          apply_watermark: false,
        }
      })
    })

    if (!createResp.ok) {
      console.error('Replicate create error:', createResp.status, await createResp.text())
      return null
    }

    const prediction = await createResp.json()

    // Synchronous result (Prefer: wait worked)
    if (prediction.status === 'succeeded' && prediction.output?.[0]) {
      return prediction.output[0]
    }

    // Poll if still processing
    const predId = prediction.id
    if (!predId) return null

    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${predId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await poll.json()
      if (result.status === 'succeeded' && result.output?.[0]) return result.output[0]
      if (result.status === 'failed' || result.status === 'canceled') {
        console.error('Replicate failed:', result.error)
        return null
      }
    }
    return null
  } catch (e) {
    console.error('Replicate exception:', e)
    return null
  }
}

export async function POST(req: Request) {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const formData   = await req.formData()
    const style      = (formData.get('style')    as string) || 'Modern'
    const roomType   = (formData.get('roomType') as string) || 'Living Room'
    const custom     = (formData.get('prompt')   as string) || ''
    const dimsRaw    = formData.get('dimensions') as string
    const answersRaw = formData.get('answers')   as string

    let dims = { width: '', length: '', height: '' }
    try { if (dimsRaw) dims = { ...dims, ...JSON.parse(dimsRaw) } } catch { /**/ }
    const w = dims.width || '', l = dims.length || '', h = dims.height || ''

    let answers: Record<string, string> = {}
    try { if (answersRaw) answers = JSON.parse(answersRaw) } catch { /**/ }

    const details   = STYLE_DETAILS[style] || style
    const furniture = ROOM_FURNITURE[roomType] || 'appropriate furniture'
    const dimDesc   = describeDimensions(w, l, h)
    const hasDims   = !!(w && l)

    // Claude: design concept
    const claudeResp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      system: 'Expert interior designer. Respond ONLY valid JSON no markdown: {"title":"string","tagline":"string","description":"string","spatialNote":"string","colors":["#hex - Name","#hex - Name","#hex - Name"],"furniture":["item1","item2","item3","item4"],"tips":["tip1","tip2","tip3"],"materials":["mat1","mat2","mat3"]}',
      messages: [{
        role: 'user',
        content: `${style} ${roomType}. Contains: ${furniture}. ${dimDesc ? 'Size: ' + dimDesc + '.' : ''} ${answers.mood ? 'Mood: ' + answers.mood + '.' : ''} ${custom || ''}`
      }],
    })

    const raw = claudeResp.content[0].type === 'text' ? claudeResp.content[0].text.trim() : '{}'
    let design: Record<string, unknown>
    try { design = JSON.parse(raw.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()) }
    catch { design = { title: `${style} ${roomType}`, tagline: 'A beautiful space.', description: `A stunning ${style} ${roomType}.`, spatialNote: '', colors: [], furniture: furniture.split(', '), tips: [], materials: [] } }

    // THE CORE DESIGN THEME — shared between both images for consistency
    const coreTheme = [
      style,
      details,
      dimDesc ? `room is ${dimDesc}` : '',
      answers.mood ? `${answers.mood} atmosphere` : '',
      answers.lighting ? `${answers.lighting} natural lighting` : '',
      custom || '',
    ].filter(Boolean).join(', ')

    // ── IMAGE 1: 3D PHOTOREALISTIC RENDER ──────────────────────────
    const render3dPrompt = [
      `ultra photorealistic interior design photograph of a ${style} ${roomType}`,
      `this room contains exactly: ${furniture}`,
      coreTheme,
      `wide angle shot of entire ${roomType} from corner showing all furniture clearly`,
      'professional architectural photography, 8K ultra detailed render',
      'Architectural Digest magazine quality, perfect balanced lighting',
      'no people, no text, no watermarks',
    ].join('. ')

    const render3dNeg = [
      `wrong room type, not a ${roomType}`,
      roomType === 'Bedroom' ? 'no living room sofa no coffee table' : '',
      roomType === 'Kitchen' ? 'no bedroom no sofa no bed' : '',
      roomType === 'Living Room' ? 'no bed no bedroom furniture' : '',
      'no people, no faces, no text, no watermark, no logo',
      'not blurry, not cartoon, not painting, not sketch',
      'not outdoor, not exterior, not distorted',
    ].filter(Boolean).join(', ')

    // ── IMAGE 2: 2D FLOOR PLAN ─────────────────────────────────────
    // Only generate if dimensions entered
    let floorPlanPrompt = ''
    let floorPlanNeg    = ''
    if (hasDims) {
      const sqft = Math.round(parseFloat(w) * parseFloat(l))
      floorPlanPrompt = [
        `2D architectural floor plan top-down overhead birds-eye view of ${style} ${roomType}`,
        `exact room dimensions: ${w} feet wide by ${l} feet long, total ${sqft} square feet`,
        h ? `ceiling height ${h} feet` : '',
        `furniture layout includes: ${furniture}`,
        `${style} interior design furniture arrangement and placement`,
        'precise scale architectural drawing viewed directly from above',
        'clean black line work on pure white background',
        'professional CAD architectural blueprint style, walls shown as thick black lines',
        'furniture shown as 2D plan view outlines, labelled, no color fill',
        'no 3D perspective, flat 2D overhead view only',
      ].filter(Boolean).join(', ')

      floorPlanNeg = [
        'no 3D perspective view, no isometric view',
        'not a room photograph, not a render',
        'no people, no text overlays, no watermark',
        'no color fills, no shading, black and white only',
        'not blurry, not exterior, not outdoor',
      ].join(', ')
    }

    // Generate both images in parallel using Replicate
    const [replicateRender, replicateFloorPlan] = await Promise.all([
      replicateSDXL(render3dPrompt, render3dNeg, 1344, 768),
      hasDims ? replicateSDXL(floorPlanPrompt, floorPlanNeg, 768, 768) : Promise.resolve(null),
    ])

    // Fallback to Pollinations only if Replicate fails
    const seed = Date.now()
    const imageUrl    = replicateRender    || `https://image.pollinations.ai/prompt/${encodeURIComponent(render3dPrompt.slice(0, 500))}?width=1344&height=768&seed=${seed}&model=flux-pro&nologo=true&enhance=true&nocache=true`
    const floorPlanUrl = hasDims
      ? (replicateFloorPlan || `https://image.pollinations.ai/prompt/${encodeURIComponent(floorPlanPrompt.slice(0, 500))}?width=768&height=768&seed=${seed + 1}&model=flux-pro&nologo=true&enhance=true&nocache=true`)
      : null

    return NextResponse.json({
      image:         imageUrl,
      floorPlan:     floorPlanUrl,
      hasDimensions: hasDims,
      dimensions:    hasDims ? { w, l, h, sqft: Math.round(parseFloat(w) * parseFloat(l)) } : null,
      design,
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    console.error('Generate error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
