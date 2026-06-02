import { NextResponse } from 'next/server'

const STYLE_DETAILS: Record<string, string> = {
  Modern:        'clean straight lines, neutral white and grey palette, contemporary low-profile furniture, polished metal accents, recessed lighting',
  Luxury:        'opulent marble flooring, gold and brass fixtures, velvet upholstery, crystal chandelier, rich jewel-toned accent walls',
  Minimalist:    'pure white walls, single statement furniture, hidden storage, vast empty space, soft natural light, zen atmosphere',
  Scandinavian:  'natural birch wood, white walls, hygge warmth, sheepskin throws, pendant lighting, organic cotton textiles',
  Industrial:    'exposed red brick, polished concrete floor, black iron pipe shelving, Edison bulbs, reclaimed wood beams',
  Bohemian:      'layered Persian rugs, macramé wall hanging, abundant plants, rattan furniture, warm amber lighting, eclectic patterns',
  Japandi:       'wabi-sabi ceramics, shoji screens, low-profile wooden platform bed, bonsai tree, muted earth tones',
  Classic:       'ornate carved wood, crown moulding, silk drapes, symmetrical layout, antique brass chandeliers',
  Contemporary:  'bold geometric accent wall, oversized abstract art, mixed metal finishes, statement pendant light',
  Mediterranean: 'terracotta tile floor, whitewashed plaster walls, arched doorways, cobalt blue accents, wrought iron fixtures',
}

function describeDimensions(w: string, l: string, h: string): string {
  const width  = parseFloat(w)
  const length = parseFloat(l)
  const height = parseFloat(h)
  if (!width || !length) return ''

  const sqft   = Math.round(width * length)
  const aspect = width > length ? 'wide rectangular' : length > width * 1.3 ? 'long narrow' : 'square'

  let ceilDesc = ''
  if (height) {
    if (height <= 8)       ceilDesc = 'standard 8-foot ceiling creating an intimate cozy feel'
    else if (height <= 9)  ceilDesc = '9-foot ceiling with comfortable airy proportions'
    else if (height <= 10) ceilDesc = '10-foot ceiling with generous vertical space'
    else if (height <= 12) ceilDesc = 'dramatic 12-foot high ceiling creating a grand spacious atmosphere'
    else                   ceilDesc = `soaring ${height}-foot vaulted ceiling with dramatic vertical presence`
  }

  return [
    `${sqft} square foot ${aspect} room measuring ${width} by ${length} feet`,
    ceilDesc,
    height >= 10 ? 'tall windows stretching to the ceiling' : '',
    width >= 20 ? 'open plan layout with defined zones' : '',
    width <= 10 ? 'compact space with smart built-in storage solutions' : '',
  ].filter(Boolean).join(', ')
}

export async function POST(req: Request) {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const formData  = await req.formData()
    const style     = (formData.get('style')    as string) || 'Modern'
    const roomType  = (formData.get('roomType') as string) || 'Living Room'
    const custom    = (formData.get('prompt')   as string) || ''
    const answersRaw = formData.get('answers')   as string
    const dimsRaw    = formData.get('dimensions') as string

    let dims = { width: '', length: '', height: '' }
    try { if (dimsRaw) dims = { ...dims, ...JSON.parse(dimsRaw) } } catch { /* ignore */ }

    // Also try direct w/l/h fields from the homepage quick tool
    const w = dims.width  || (formData.get('w') as string) || ''
    const l = dims.length || (formData.get('l') as string) || ''
    const h = dims.height || (formData.get('h') as string) || ''

    let answers: Record<string, string> = {}
    try { if (answersRaw) answers = JSON.parse(answersRaw) } catch { /* ignore */ }

    const details   = STYLE_DETAILS[style] || style
    const dimDesc   = describeDimensions(w, l, h)
    const hasDims   = !!(w && l)

    // Step 1: Claude generates design concept
    const claudeResp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: `You are an expert luxury interior designer and spatial planner. Respond ONLY with valid JSON (no markdown, no backticks):
{
  "title": "evocative design title e.g. Serene Minimalist Retreat",
  "tagline": "one poetic sentence",
  "description": "3 detailed sentences about materials, atmosphere, lighting, spatial feel",
  "spatialNote": "one sentence about how the room dimensions influence the design choices (only if dimensions provided, else empty string)",
  "imagePrompt": "ultra-detailed prompt for photorealistic 3D interior render: [specific furniture placement], [materials], [lighting], [colors], perspective view showing room depth and scale",
  "colors": ["#hex - Color Name", "#hex - Color Name", "#hex - Color Name", "#hex - Color Name"],
  "furniture": ["Specific scaled item for this room size 1", "Item 2", "Item 3", "Item 4", "Item 5"],
  "tips": ["Tip specific to this room size/shape 1", "Tip 2", "Tip 3"],
  "materials": ["Material 1", "Material 2", "Material 3", "Material 4"]
}`,
      messages: [{
        role: 'user',
        content: [
          `Design a ${style} ${roomType}.`,
          `Style details: ${details}.`,
          dimDesc ? `Room dimensions: ${dimDesc}.` : '',
          answers.mood     ? `Mood: ${answers.mood}.`         : '',
          answers.budget   ? `Budget: ${answers.budget}.`     : '',
          answers.lighting ? `Lighting: ${answers.lighting}.` : '',
          answers.material ? `Materials: ${answers.material}.`: '',
          custom ? `Client requirements: ${custom}.` : '',
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
        tagline: 'A beautifully curated space designed for you.',
        description: `A stunning ${style} ${roomType} with carefully selected materials.`,
        spatialNote: '',
        imagePrompt: `photorealistic ${style} ${roomType}, ${details}, 3D perspective render`,
        colors: ['#F5F5F0 - Warm White', '#D4C5A9 - Sand', '#8B7355 - Taupe', '#2C2C2C - Charcoal'],
        furniture: ['Custom sofa', 'Coffee table', 'Floor lamp', 'Accent chair', 'Ottoman'],
        tips: ['Layer your lighting', 'Mix textures for depth', 'Keep consistent color palette'],
        materials: ['Premium linen', 'Natural oak', 'Brushed brass', 'Merino wool'],
      }
    }

    // Step 2: Build dimension-aware 3D render prompt
    const dimPromptPart = hasDims ? [
      `room is ${w} feet wide by ${l} feet long`,
      h ? `with ${h} foot ceiling height` : '',
      parseFloat(h) >= 10 ? 'showing dramatic ceiling height with tall windows' : '',
      parseFloat(w) * parseFloat(l) >= 300 ? 'spacious open layout visible in wide angle' : '',
      parseFloat(w) * parseFloat(l) <= 120 ? 'compact intimate space, smart furniture scale' : '',
    ].filter(Boolean).join(', ') : ''

    const basePrompt   = typeof design.imagePrompt === 'string' ? design.imagePrompt : ''
    const fullPrompt   = [
      `photorealistic 3D interior design render of a ${style} ${roomType}`,
      dimPromptPart,
      basePrompt,
      details,
      answers.mood     ? `${answers.mood} atmosphere` : '',
      answers.lighting ? `${answers.lighting} natural light` : '',
      custom || '',
      'professional architectural visualization, 3D perspective view showing full room depth and proportions, Architectural Digest quality, perfect lighting, ultra detailed 8K render, no people, wide angle lens showing entire room',
    ].filter(Boolean).join(', ')

    // Step 3: Generate 3D render via Pollinations (Flux model)
    const encodedPrompt = encodeURIComponent(fullPrompt.slice(0, 600))
    const seed = Math.floor(Math.random() * 999999)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1344&height=768&seed=${seed}&model=flux&nologo=true&enhance=true`

    // Step 4: If dimensions provided, also generate a 2D floor plan view
    let floorPlanUrl: string | null = null
    if (hasDims) {
      const fpPrompt = encodeURIComponent(
        `2D architectural floor plan top view of a ${roomType} ${w}x${l} feet, ${style} style furniture layout, clean lines, architectural drawing style, overhead birds eye view, furniture placement diagram, white background, professional interior design blueprint, labeled rooms`
          .slice(0, 500)
      )
      const fpSeed = Math.floor(Math.random() * 999999)
      floorPlanUrl = `https://image.pollinations.ai/prompt/${fpPrompt}?width=768&height=768&seed=${fpSeed}&model=flux&nologo=true&enhance=true`
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
