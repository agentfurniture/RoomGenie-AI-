import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const styleDetails: Record<string, string> = {
  Modern:        'Clean lines, neutral palette, contemporary furniture, minimalist decor',
  Luxury:        'Opulent finishes, marble surfaces, gold accents, velvet textures, statement lighting',
  Minimalist:    'White walls, sparse furniture, hidden storage, abundant negative space, calm atmosphere',
  Scandinavian:  'Natural wood, white walls, cozy textures, functional furniture, hygge atmosphere',
  Industrial:    'Exposed brick, concrete floors, metal pipe fixtures, Edison bulbs, raw materials',
  Classic:       'Traditional furniture, crown molding, rich fabrics, symmetrical layout, antique accents',
  Bohemian:      'Layered textiles, eclectic decor, plants, warm earth tones, mixed patterns',
  Japanese:      'Tatami, shoji screens, minimal furniture, natural materials, zen atmosphere',
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const style    = (formData.get('style')    as string) || 'Modern'
    const roomType = (formData.get('roomType') as string) || 'Room'
    const custom   = (formData.get('prompt')   as string) || ''
    const details  = styleDetails[style] || style

    // Use Claude to generate a detailed design description + Unsplash image suggestion
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: `You are an expert interior designer. When given a room type and style, respond ONLY with a valid JSON object, no markdown, no backticks. Format:
{
  "title": "short design title",
  "description": "2-3 sentence vivid description of the redesigned room",
  "colors": ["color1", "color2", "color3"],
  "furniture": ["item1", "item2", "item3", "item4"],
  "tips": ["tip1", "tip2", "tip3"],
  "unsplashQuery": "specific search query for this exact room style e.g. modern living room interior"
}`,
      messages: [{
        role: 'user',
        content: `Design a ${style} ${roomType}. Style details: ${details}. ${custom ? `Extra requirements: ${custom}` : ''}`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    let design
    try {
      design = JSON.parse(text)
    } catch {
      design = { title: `${style} ${roomType}`, description: text, colors: [], furniture: [], tips: [] }
    }

    // Use Unsplash source for a relevant room image (no API key needed)
    const query = encodeURIComponent(design.unsplashQuery || `${style} ${roomType} interior`)
    const imageUrl = `https://source.unsplash.com/1600x900/?${query}`

    return NextResponse.json({ image: imageUrl, design })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    console.error('Generate error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
