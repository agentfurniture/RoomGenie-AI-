import { NextResponse } from 'next/server'

const STYLE_DETAILS: Record<string, string> = {
  Modern:        'contemporary minimalist design, clean straight lines, neutral white and grey palette, low-profile modern sofa or bed, polished hardwood floors, recessed ceiling lights',
  Luxury:        'ultra luxury opulent interior, Italian marble floors, gold and brass fixtures, velvet upholstery, crystal chandelier overhead, jewel tone walls, expensive art pieces',
  Minimalist:    'extreme minimalism, pure white walls and ceiling, single essential furniture only, polished white floor, one pendant lamp, completely empty walls, zen japanese calm',
  Scandinavian:  'nordic scandinavian hygge interior, light pine wood floors, white painted walls, cozy knit wool throw, simple light birch wood furniture, warm pendant lamp, potted plants',
  Industrial:    'urban loft industrial, exposed red brick feature wall, polished dark concrete floor, black steel pipe shelving units, Edison filament bulbs, distressed brown leather sofa, dark reclaimed wood',
  Bohemian:      'boho chic eclectic interior, layered colorful Persian and kilim rugs on floor, macrame wall hanging above, many tropical indoor plants, natural rattan and wicker furniture, warm amber candlelight',
  Japandi:       'japandi japanese scandinavian fusion interior, very low wooden platform furniture, neutral beige cream and warm grey tones, wabi-sabi unglazed clay ceramics, small bonsai tree, natural linen textiles',
  Classic:       'traditional classic european interior design, large ornate mahogany carved wood furniture, tufted deep button velvet or leather upholstery, decorative crown moulding on ceiling, antique brass chandelier, persian area rug, heavy silk floor-length drapes, dark rich hardwood floors',
  Contemporary:  'contemporary chic interior, bold geometric accent feature wall, sleek mixed metal finish furniture, large designer floor lamp, smoked glass coffee table, oversized framed abstract art, neutral warm palette',
  Mediterranean: 'mediterranean coastal villa interior, handmade terracotta tile floor, rough whitewashed plaster walls, visible arched doorway or window, hand-painted cobalt blue ceramic vases, forged wrought iron pendant lamp, large potted olive or citrus tree, warm golden afternoon sunlight streaming in',
}

const ROOM_FURNITURE: Record<string, string> = {
  'Living Room':  'large three-seater sofa facing TV, rectangular coffee table, flatscreen TV on entertainment unit, two accent armchairs, tall floor lamp, patterned area rug covering most of floor',
  'Bedroom':      'king size bed with upholstered headboard against main wall, two matching bedside tables each with table lamp, large built-in wardrobe, full length dressing mirror, layered soft bedding with decorative cushions and pillows',
  'Kitchen':      'floor-to-ceiling kitchen cabinets in two rows, thick marble or stone countertop with undermount sink, central kitchen island with three bar stools, three pendant lights hanging over island, professional range oven, large refrigerator',
  'Bathroom':     'large freestanding oval bathtub near window, separate walk-in rainfall shower with glass partition, floating double vanity with two sinks and large mirror above, wall-mounted toilet, heated towel rail, large format marble floor tiles',
  'Home Office':  'very large executive desk with leather inset top, high back ergonomic office chair, full wall of built-in floor-to-ceiling bookshelves, two computer monitors on desk, articulated desk lamp, wooden filing cabinet',
  'Dining Room':  'large eight-seater rectangular dining table with white tablecloth, upholstered dining chairs with arms, tall sideboard buffet cabinet against wall, dramatic chandelier or cluster of pendants hanging directly above table, large framed artwork on main wall',
  'Kids Room':    'single bed with colorful themed bedding and canopy, small study desk with chair and desk lamp, open cube storage shelves full of toys, bright colorful area rug, tall wardrobe with painted doors, fun educational wall mural or large world map poster',
  'Master Suite': 'oversized king bed with tall upholstered headboard and layered luxury bedding, chaise lounge chair in corner, double door walk-in wardrobe visible, elegant vanity dressing table with Hollywood mirror and stool, fresh flowers in vase on nightstand',
  'Studio':       'wall-mounted fold-down murphy bed with built-in shelves surrounding it, small compact two-seater sofa, round dining table for two, compact open-plan kitchen in background, full wall of floor to ceiling storage with sliding doors',
}

function describeDimensions(w: string, l: string, h: string): string {
  const width = parseFloat(w), length = parseFloat(l), height = parseFloat(h)
  if (!width || !length) return ''
  const sqft  = Math.round(width * length)
  const shape = width > length * 1.3 ? 'wide rectangular' : length > width * 1.3 ? 'long and narrow' : 'square proportioned'
  const ceil  = !height ? '' : height <= 8 ? 'with 8ft standard ceiling' : height <= 9 ? 'with 9ft ceiling' : height <= 10 ? 'with generous 10ft high ceiling' : height <= 12 ? 'with dramatic 12ft high ceiling' : `with soaring ${height}ft vaulted ceiling`
  return `${sqft} square foot ${shape} room, ${width} feet wide by ${length} feet long, ${ceil}`
}

async function callReplicate(prompt: string, negPrompt: string, width: number, height: number): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) { console.log('No Replicate token'); return null }

  try {
    // Create prediction using SDXL
    const createResp = await fetch('https://api.replicate.com/v1/models/stability-ai/sdxl/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=55',
      },
      body: JSON.stringify({
        input: {
          prompt,
          negative_prompt: negPrompt,
          width,
          height,
          num_inference_steps: 35,
          guidance_scale: 8,
          refine: 'expert_ensemble_refiner',
          high_noise_frac: 0.8,
        }
      })
    })

    if (!createResp.ok) {
      const err = await createResp.text()
      console.log('Replicate create failed:', createResp.status, err)
      return null
    }

    const prediction = await createResp.json()
    console.log('Replicate prediction:', prediction.id, prediction.status)

    // If synchronous response returned output already
    if (prediction.status === 'succeeded' && prediction.output?.[0]) {
      return prediction.output[0]
    }

    // Poll for result
    const predId = prediction.id
    if (!predId) return null

    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 2500))
      const pollResp = await fetch(`https://api.replicate.com/v1/predictions/${predId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!pollResp.ok) continue
      const result = await pollResp.json()
      console.log('Poll status:', result.status)
      if (result.status === 'succeeded' && result.output?.[0]) return result.output[0]
      if (result.status === 'failed' || result.status === 'canceled') {
        console.log('Replicate failed:', result.error)
        return null
      }
    }
    console.log('Replicate timed out')
    return null
  } catch (e) {
    console.log('Replicate exception:', e)
    return null
  }
}

function pollinationsUrl(prompt: string, w: number, h: number): string {
  const seed = Math.floor(Math.random() * 9999999)
  const ts   = Date.now()
  const encoded = encodeURIComponent((`${prompt} unique_id_${seed}_${ts}`).slice(0, 600))
  const neg     = encodeURIComponent('wrong room type, people, text, watermark, blurry, cartoon, sketch, painting, distorted')
  return `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&seed=${seed}&model=flux-pro&nologo=true&enhance=true&negative=${neg}&nocache=true`
}

export async function POST(req: Request) {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

    // Claude: design concept
    const claudeResp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: 'Expert interior designer. Respond ONLY valid JSON no markdown: {"title":"string","tagline":"string","description":"string","spatialNote":"string","colors":["#hex - Name"],"furniture":["item"],"tips":["tip"],"materials":["mat"]}',
      messages: [{
        role: 'user',
        content: `${style} ${roomType} design. Furniture: ${furniture}. ${dimDesc ? 'Room: ' + dimDesc + '.' : ''} ${answers.mood ? 'Mood: ' + answers.mood + '.' : ''} ${custom || ''}`
      }],
    })

    const raw = claudeResp.content[0].type === 'text' ? claudeResp.content[0].text.trim() : '{}'
    let design: Record<string, unknown>
    try { design = JSON.parse(raw.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()) }
    catch { design = { title: `${style} ${roomType}`, tagline: 'A beautiful space.', description: `A stunning ${style} ${roomType}.`, spatialNote: '', colors: [], furniture: furniture.split(', '), tips: [], materials: [] } }

    // Build highly specific render prompt
    const renderPrompt = [
      `interior design photograph, ${style} style ${roomType}`,
      `room contains: ${furniture}`,
      details,
      dimDesc ? `room dimensions ${dimDesc}` : '',
      answers.mood ? `${answers.mood} mood and atmosphere` : '',
      answers.lighting ? `${answers.lighting} natural light` : '',
      custom || '',
      'wide angle architectural photography showing entire room',
      'professional interior design render, Architectural Digest quality, 8K photorealistic',
    ].filter(Boolean).join(', ')

    const negativePrompt = [
      `not a ${roomType === 'Bedroom' ? 'living room dining room kitchen' : roomType === 'Kitchen' ? 'bedroom living room bathroom' : roomType === 'Living Room' ? 'bedroom kitchen bathroom' : 'wrong room type'}`,
      'no people, no faces, no text, no watermark, no logo',
      'not blurry, not cartoon, not painting, not sketch, not 2D',
      'not outdoor, not exterior, not garden',
      'not distorted, not deformed',
    ].join(', ')

    // Generate 3D render — try Replicate SDXL first, fall back to Pollinations
    let imageUrl: string
    console.log('Attempting Replicate for 3D render...')
    const replicateImage = await callReplicate(renderPrompt, negativePrompt, 1344, 768)
    if (replicateImage) {
      console.log('Using Replicate image:', replicateImage)
      imageUrl = replicateImage
    } else {
      console.log('Replicate failed, using Pollinations')
      imageUrl = pollinationsUrl(renderPrompt, 1344, 768)
    }

    // Generate floor plan if dimensions provided
    let floorPlanUrl: string | null = null
    if (hasDims) {
      const sqft     = Math.round(parseFloat(w) * parseFloat(l))
      const fpPrompt = `2D architectural floor plan, top-down overhead birds-eye view, ${roomType} layout, ${w}x${l} feet, ${sqft} sqft, showing ${furniture}, ${style} style furniture arrangement, accurate scale, professional CAD architectural drawing, black outlines on white background, no color fill, no 3D perspective`
      const fpNeg    = '3D perspective, people, text overlay, colored fill, watermark, blurry, cartoon, exterior'
      const fpImage  = await callReplicate(fpPrompt, fpNeg, 768, 768)
      floorPlanUrl   = fpImage || pollinationsUrl(fpPrompt, 768, 768)
    }

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
