import { NextResponse } from 'next/server'

const STYLE_DETAILS: Record<string, string> = {
  Modern:        'clean straight lines, neutral white and grey palette, contemporary low-profile furniture, polished metal accents, recessed lighting',
  Luxury:        'opulent marble flooring and surfaces, gold and brass fixtures, velvet upholstery, crystal chandelier, rich jewel-toned accent walls',
  Minimalist:    'pure white walls, single statement furniture piece, hidden storage, vast empty negative space, soft natural light, zen atmosphere',
  Scandinavian:  'natural birch and pine wood, white walls, hygge warmth, sheepskin throws, pendant lighting, organic cotton textiles',
  Industrial:    'exposed red brick wall, polished concrete floor, black iron pipe shelving, Edison vintage bulbs, reclaimed distressed wood beams',
  Bohemian:      'layered Persian rugs, macramé wall hanging, abundant tropical plants, rattan furniture, warm amber lighting, eclectic mixed patterns',
  Japandi:       'wabi-sabi imperfect ceramics, natural shoji paper screens, low-profile wooden platform bed, bonsai tree, muted earth tones',
  Classic:       'ornate carved wood furniture, crown moulding ceiling details, silk drapes, symmetrical layout, antique brass chandeliers',
  Contemporary:  'bold geometric accent wall, oversized abstract art, mixed metal finishes, statement pendant light, open plan layout',
  Mediterranean: 'terracotta tile floor, whitewashed plaster walls, arched doorways, cobalt blue accents, wrought iron fixtures, lush potted plants',
}

export async function POST(req: Request) {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const OpenAI    = (await import('openai')).default

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const formData = await req.formData()
    const style    = (formData.get('style')    as string) || 'Modern'
    const roomType = (formData.get('roomType') as string) || 'Living Room'
    const custom   = (formData.get('prompt')   as string) || ''
    const details  = STYLE_DETAILS[style] || style

    // Step 1: Claude generates rich design details
    const claudeResp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      system: `You are an expert luxury interior designer. Respond ONLY with valid JSON (no markdown, no backticks):
{
  "title": "evocative design title e.g. Serene Minimalist Retreat",
  "tagline": "one poetic sentence describing the concept",
  "description": "3 detailed sentences describing materials, atmosphere, lighting, and feel",
  "imagePrompt": "ultra-detailed DALL-E prompt: photorealistic interior design render of a [style] [room], [specific details about furniture placement, materials, lighting, colors, textures], architectural photography, 8K, magazine quality, no people",
  "colors": ["#hex - Color Name", "#hex - Color Name", "#hex - Color Name", "#hex - Color Name"],
  "furniture": ["Brand-quality specific item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
  "tips": ["Specific actionable tip 1", "Tip 2", "Tip 3"],
  "materials": ["Premium material 1", "Material 2", "Material 3", "Material 4"]
}`,
      messages: [{
        role: 'user',
        content: `Design a ${style} ${roomType}. Style: ${details}. ${custom ? 'Client requirements: ' + custom : ''}`
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
        imagePrompt: `photorealistic ${style} ${roomType} interior design, ${details}, architectural photography, 8K quality`,
        colors: ['#F5F5F0 - Warm White', '#D4C5A9 - Sand', '#8B7355 - Taupe', '#2C2C2C - Charcoal'],
        furniture: ['Custom sofa', 'Coffee table', 'Floor lamp', 'Accent chair', 'Storage ottoman'],
        tips: ['Layer your lighting', 'Mix textures for depth', 'Keep a consistent color palette'],
        materials: ['Premium linen', 'Natural oak', 'Brushed brass', 'Wool textiles'],
      }
    }

    // Step 2: Build a rich DALL-E prompt from Claude's output
    const imagePrompt = [
      typeof design.imagePrompt === 'string' ? design.imagePrompt : '',
      `Photorealistic interior design render. ${style} style ${roomType}.`,
      details,
      custom || '',
      'Professional architectural photography, interior design magazine quality like Architectural Digest.',
      'Perfect natural and artificial lighting, ultra detailed, 8K resolution.',
      'Wide angle shot showing the full room. No people, no text.',
    ].filter(Boolean).join(' ')

    // Step 3: DALL-E 3 generates the actual room render
    const imgResp = await openai.images.generate({
      model:   'dall-e-3',
      prompt:  imagePrompt.slice(0, 4000), // DALL-E prompt limit
      size:    '1792x1024',
      quality: 'hd',
      n:       1,
    })

    const imageUrl = imgResp.data[0]?.url
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image generation failed — no URL returned' }, { status: 500 })
    }

    return NextResponse.json({ image: imageUrl, design })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    console.error('Generate error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
