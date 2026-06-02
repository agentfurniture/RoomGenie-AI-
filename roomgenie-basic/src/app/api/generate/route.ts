import { NextResponse } from 'next/server'

const STYLE_DETAILS: Record<string, string> = {
  Modern:        'contemporary minimalist, clean straight lines, neutral white and grey, low-profile furniture, polished floors, recessed lights',
  Luxury:        'ultra luxury opulent, Italian marble floors, gold brass fixtures, velvet upholstery, crystal chandelier, silk curtains, jewel tone walls',
  Minimalist:    'extreme minimalism, pure white walls, sparse single furniture, polished floor, one pendant light, empty walls, zen atmosphere',
  Scandinavian:  'nordic hygge, light pine wood floors, white walls, sheepskin throw, simple birch furniture, warm pendant lamp, indoor plants',
  Industrial:    'urban loft, exposed red brick wall, polished concrete floor, black steel shelving, Edison bulbs, distressed leather, reclaimed wood',
  Bohemian:      'boho eclectic, layered colorful rugs, macrame wall hanging, tropical plants, rattan furniture, warm amber lighting, patterned cushions',
  Japandi:       'japandi fusion, low wooden platform furniture, neutral beige cream, wabi-sabi ceramics, bonsai plant, shoji screen, tatami texture',
  Classic:       'traditional classic european, ornate mahogany carved furniture, tufted velvet, crown moulding ceiling, antique brass chandelier, persian rug, silk drapes',
  Contemporary:  'contemporary chic, bold statement wall, sleek mixed-metal furniture, designer lamp, glass table, abstract art, neutral with bold accents',
  Mediterranean: 'mediterranean coastal, terracotta tile floor, whitewashed walls, arched doorway, cobalt blue ceramics, wrought iron lamp, golden sunlight',
}

const ROOM_FURNITURE: Record<string, string> = {
  'Living Room':  'large sofa, coffee table, TV entertainment unit, two armchairs, floor lamp, area rug on floor',
  'Bedroom':      'king size bed with tall headboard centered on wall, two bedside tables with lamps, large wardrobe, full length mirror, soft bedding and pillows',
  'Kitchen':      'kitchen cabinets upper and lower, marble countertop, kitchen island with bar stools, pendant lights overhead, sink, oven and refrigerator',
  'Bathroom':     'freestanding bathtub or walk-in shower, floating vanity with sink, toilet, large mirror above sink, towel rail, floor-to-ceiling tiles',
  'Home Office':  'large writing desk, ergonomic office chair, built-in bookshelves floor to ceiling, computer monitor on desk, desk lamp, filing cabinet',
  'Dining Room':  'large rectangular dining table, six dining chairs, sideboard buffet cabinet, chandelier pendant over table, wine rack in corner',
  'Kids Room':    'single bed with colorful bedding, study desk with chair, open toy storage shelves, colorful rug, wardrobe, fun wall art or mural',
  'Master Suite': 'king size bed with upholstered headboard, chaise lounge chair, walk-in wardrobe entrance, vanity dressing table with mirror, ensuite bathroom door visible',
  'Studio':       'wall-mounted murphy fold-down bed, compact sectional sofa, small dining table, open plan compact kitchen, multi-use storage wall unit',
}

function describeDimensions(w: string, l: string, h: string): string {
  const width = parseFloat(w), length = parseFloat(l), height = parseFloat(h)
  if (!width || !length) return ''
  const sqft  = Math.round(width * length)
  const shape = width > length * 1.3 ? 'wide rectangular' : length > width * 1.3 ? 'long narrow' : 'square'
  const ceil  = !height ? '' : height <= 8 ? '8ft standard ceiling' : height <= 9 ? '9ft ceiling' : height <= 10 ? '10ft high ceiling' : height <= 12 ? 'dramatic 12ft high ceiling' : `soaring ${height}ft vaulted ceiling`
  return `${sqft} sqft ${shape} room, ${width}ft wide by ${length}ft long${ceil ? ', ' + ceil : ''}`
}

async function generateWithReplicate(prompt: string, negPrompt: string, width: number, height: number): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) return null

  // Use SDXL for photorealistic interior renders
  const response = await fetch('https://api.replicate.com/v1/models/stability-ai/sdxl/predictions', {
    method: 'POST',
    headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: {
        prompt,
        negative_prompt: negPrompt,
        width,
        height,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        scheduler: 'K_EULER',
      }
    })
  })

  if (!response.ok) return null
  const prediction = await response.json()
  const predId = prediction.id
  if (!predId) return null

  // Poll for result (max 60s)
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${predId}`, {
      headers: { 'Authorization': `Token ${token}` }
    })
    const result = await poll.json()
    if (result.status === 'succeeded' && result.output?.[0]) return result.output[0]
    if (result.status === 'failed') return null
  }
  return null
}

function pollinationsUrl(prompt: string, w: number, h: number, seed: number): string {
  const encoded = encodeURIComponent(prompt.slice(0, 600))
  const neg = encodeURIComponent('wrong room, living room instead of bedroom, outdoor, people, text, watermark, blurry, cartoon')
  return `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&seed=${seed}&model=flux-pro&nologo=true&enhance=true&negative=${neg}`
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
    const furniture = ROOM_FURNITURE[roomType] || 'furniture'
    const dimDesc   = describeDimensions(w, l, h)
    const hasDims   = !!(w && l)

    // Claude generates design concept
    const claudeResp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: `You are an expert interior designer. Respond ONLY with valid JSON no markdown:
{"title":"creative title","tagline":"poetic sentence","description":"3 sentences on atmosphere and materials","spatialNote":"how dimensions shape design or empty string","colors":["#hex - Name","#hex - Name","#hex - Name","#hex - Name"],"furniture":["item1","item2","item3","item4","item5"],"tips":["tip1","tip2","tip3"],"materials":["mat1","mat2","mat3"]}`,
      messages: [{
        role: 'user',
        content: `Design a ${style} ${roomType} with ${furniture}. ${dimDesc ? 'Room: ' + dimDesc + '.' : ''} ${answers.mood ? 'Mood: ' + answers.mood + '.' : ''} ${custom || ''}`
      }],
    })

    const raw = claudeResp.content[0].type === 'text' ? claudeResp.content[0].text.trim() : '{}'
    let design: Record<string, unknown>
    try { design = JSON.parse(raw.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()) }
    catch { design = { title: `${style} ${roomType}`, tagline: 'A beautiful space.', description: `A stunning ${style} ${roomType}.`, spatialNote: '', colors: [], furniture: furniture.split(', '), tips: [], materials: [] } }

    // Build the render prompt — room type stated 3 times for emphasis
    const renderPrompt = [
      `professional interior design photograph of a ${style} ${roomType}`,
      `this is a ${roomType} interior with ${furniture}`,
      details,
      dimDesc ? `room is ${dimDesc}` : '',
      answers.mood ? `${answers.mood} atmosphere` : '',
      answers.lighting ? `${answers.lighting} natural light` : '',
      custom || '',
      `photorealistic architectural photography of ${roomType}, ultra detailed 8K`,
      'wide angle lens showing entire room, perfect lighting, Architectural Digest quality',
      'no people, no text, no watermarks, photorealistic render',
    ].filter(Boolean).join(', ')

    const negativePrompt = `wrong room type, ${roomType === 'Bedroom' ? 'no living room no sofa' : roomType === 'Kitchen' ? 'no bedroom no sofa' : 'wrong furniture'}, outdoor scene, people, text, watermark, blurry, cartoon, painting, sketch, distorted`

    // Try Replicate first (better quality), fall back to Pollinations
    const seed = Math.floor(Math.random() * 999999)
    let imageUrl: string
    const replicateResult = await generateWithReplicate(renderPrompt, negativePrompt, 1344, 768)
    imageUrl = replicateResult || pollinationsUrl(renderPrompt, 1344, 768, seed)

    // Floor plan
    let floorPlanUrl: string | null = null
    if (hasDims) {
      const sqft = Math.round(parseFloat(w) * parseFloat(l))
      const fpPrompt = `2D architectural floor plan top-down overhead view of ${style} ${roomType}, ${w}ft x ${l}ft = ${sqft} sqft, showing ${furniture}, accurate furniture placement from above, architectural drawing, clean lines, white background, black outline walls and furniture, professional blueprint style, no 3D perspective`
      const fpNeg    = `3D perspective view, people, text overlay, colored fill, watermark, blurry`
      const fpResult = await generateWithReplicate(fpPrompt, fpNeg, 768, 768)
      floorPlanUrl   = fpResult || pollinationsUrl(fpPrompt, 768, 768, seed + 1)
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
