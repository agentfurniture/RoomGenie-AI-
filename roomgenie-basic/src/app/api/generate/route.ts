import { NextResponse } from 'next/server'

const STYLE_DETAILS: Record<string, string> = {
  Modern:        'clean lines, neutral whites and greys, contemporary furniture, metal accents',
  Luxury:        'opulent marble surfaces, gold accents, velvet textures, crystal lighting, jewel tones',
  Minimalist:    'pure white walls, hidden storage, sparse furniture, abundant empty space, zen calm',
  Scandinavian:  'natural birch wood, white walls, hygge atmosphere, sheepskin, candles, organic textures',
  Industrial:    'exposed brick, concrete floors, black iron pipes, Edison bulbs, reclaimed wood',
  Bohemian:      'layered colorful textiles, macramé wall art, abundant plants, rattan, eclectic patterns',
  Japandi:       'wabi-sabi, shoji screens, bonsai, tatami, neutral earth tones, handmade ceramics',
  Classic:       'traditional carved furniture, crown moulding, rich fabrics, symmetrical layout, antiques',
  Contemporary:  'current trends, bold accent walls, mixed materials, statement lighting, open plan',
  Mediterranean: 'terracotta tiles, whitewashed walls, arched doorways, blue accents, wrought iron',
}

export async function POST(req: Request) {
  try {
    // Import inside handler — never runs at build time
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const formData = await req.formData()
    const style    = (formData.get('style')    as string) || 'Modern'
    const roomType = (formData.get('roomType') as string) || 'Living Room'
    const custom   = (formData.get('prompt')   as string) || ''
    const details  = STYLE_DETAILS[style] || style

    const claudeResp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: `You are an expert interior designer. Respond ONLY with valid JSON (no markdown, no backticks):
{
  "title": "short creative design title",
  "tagline": "one evocative sentence",
  "description": "2-3 vivid sentences describing the redesigned space",
  "colors": ["#hex - Color Name", "#hex - Color Name", "#hex - Color Name"],
  "furniture": ["Specific item 1", "Specific item 2", "Specific item 3", "Specific item 4"],
  "tips": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"],
  "materials": ["Material 1", "Material 2", "Material 3"],
  "unsplashQuery": "specific interior photo search query e.g. modern living room luxury sofa"
}`,
      messages: [{
        role: 'user',
        content: `Design a ${style} ${roomType}. Style details: ${details}. ${custom ? 'Extra requirements: ' + custom : ''}`
      }],
    })

    const raw = claudeResp.content[0].type === 'text' ? claudeResp.content[0].text.trim() : '{}'
    let design: Record<string, unknown>
    try {
      design = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch {
      design = { title: `${style} ${roomType}`, description: raw }
    }

    const query = encodeURIComponent(
      typeof design.unsplashQuery === 'string'
        ? design.unsplashQuery
        : `${style.toLowerCase()} ${roomType.toLowerCase()} interior design`
    )
    const image = `https://source.unsplash.com/1600x900/?${query}&sig=${Date.now()}`

    return NextResponse.json({ image, design })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    console.error('Generate error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
