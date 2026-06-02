import { NextResponse } from 'next/server'

const STYLE_DETAILS: Record<string, string> = {
  Modern:        'clean straight lines, neutral white and grey palette, contemporary low-profile furniture, polished metal accents, recessed lighting',
  Luxury:        'opulent marble flooring, gold and brass fixtures, velvet upholstery, crystal chandelier, rich jewel-toned accent walls',
  Minimalist:    'pure white walls, single statement furniture, hidden storage, vast empty space, soft natural light, zen atmosphere',
  Scandinavian:  'natural birch wood, white walls, hygge warmth, sheepskin throws, pendant lighting, organic cotton textiles',
  Industrial:    'exposed red brick, polished concrete floor, black iron pipe shelving, Edison bulbs, reclaimed wood beams',
  Bohemian:      'layered Persian rugs, macramé wall hanging, abundant plants, rattan furniture, warm amber lighting, eclectic patterns',
  Japandi:       'wabi-sabi ceramics, shoji paper screens, low-profile wooden bed, bonsai tree, muted earth tones',
  Classic:       'ornate carved wood, crown moulding, silk drapes, symmetrical layout, antique brass chandeliers',
  Contemporary:  'bold geometric accent wall, oversized abstract art, mixed metal finishes, statement pendant light',
  Mediterranean: 'terracotta tile floor, whitewashed plaster walls, arched doorways, cobalt blue accents, wrought iron fixtures',
}

export async function POST(req: Request) {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const formData = await req.formData()
    const style    = (formData.get('style')    as string) || 'Modern'
    const roomType = (formData.get('roomType') as string) || 'Living Room'
    const custom   = (formData.get('prompt')   as string) || ''
    const details  = STYLE_DETAILS[style] || style

    // Step 1: Claude generates design concept + optimised image prompt
    const claudeResp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      system: `You are an expert luxury interior designer. Respond ONLY with valid JSON (no markdown, no backticks):
{
  "title": "evocative design title e.g. Serene Minimalist Retreat",
  "tagline": "one poetic sentence",
  "description": "3 detailed sentences about materials, atmosphere, lighting, feel",
  "imagePrompt": "ultra-detailed Stable Diffusion prompt for photorealistic interior: [room type], [style], [specific furniture pieces], [materials], [lighting], [colors], photorealistic, 8K, interior design, architectural photography, no people, wide angle",
  "colors": ["#hex - Color Name", "#hex - Color Name", "#hex - Color Name", "#hex - Color Name"],
  "furniture": ["Specific item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
  "tips": ["Actionable tip 1", "Tip 2", "Tip 3"],
  "materials": ["Material 1", "Material 2", "Material 3", "Material 4"]
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
        description: `A stunning ${style} ${roomType} with carefully selected materials and thoughtful design.`,
        imagePrompt: `photorealistic ${style} ${roomType}, ${details}, architectural photography, 8K, no people`,
        colors: ['#F5F5F0 - Warm White', '#D4C5A9 - Sand', '#8B7355 - Taupe', '#2C2C2C - Charcoal'],
        furniture: ['Custom sofa', 'Coffee table', 'Floor lamp', 'Accent chair', 'Ottoman'],
        tips: ['Layer your lighting sources', 'Mix textures for depth', 'Keep a consistent color palette'],
        materials: ['Premium linen', 'Natural oak', 'Brushed brass', 'Merino wool'],
      }
    }

    // Step 2: Build image prompt
    const basePrompt = typeof design.imagePrompt === 'string' ? design.imagePrompt : ''
    const fullPrompt = [
      basePrompt,
      `photorealistic ${style} ${roomType} interior design`,
      details,
      custom || '',
      'architectural photography, interior design magazine, perfect lighting, 8K, ultra detailed, no people, wide angle room view',
    ].filter(Boolean).join(', ')

    // Step 3: Pollinations AI — free, no API key, real AI image generation
    // Uses Stable Diffusion XL under the hood
    const encodedPrompt = encodeURIComponent(fullPrompt.slice(0, 500))
    const seed = Math.floor(Math.random() * 999999)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1344&height=768&seed=${seed}&model=flux&nologo=true&enhance=true`

    return NextResponse.json({ image: imageUrl, design })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    console.error('Generate error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
