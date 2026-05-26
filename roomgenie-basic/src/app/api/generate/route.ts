import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const styleDetails: Record<string, string> = {
  Modern:       'Clean lines, neutral palette, contemporary furniture, minimalist decor',
  Luxury:       'Opulent finishes, marble surfaces, gold accents, velvet textures, statement lighting',
  Minimalist:   'White walls, sparse furniture, hidden storage, abundant negative space, calm atmosphere',
  Scandinavian: 'Natural wood, white walls, cozy textures, functional furniture, hygge atmosphere',
  Industrial:   'Exposed brick, concrete floors, metal pipe fixtures, Edison bulbs, raw materials',
  Classic:      'Traditional furniture, crown molding, rich fabrics, symmetrical layout, antique accents',
  Bohemian:     'Layered textiles, eclectic decor, plants, warm earth tones, mixed patterns',
  Japanese:     'Tatami, shoji screens, minimal furniture, natural materials, zen atmosphere',
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const style    = (formData.get('style')    as string) || 'Modern'
    const roomType = (formData.get('roomType') as string) || 'Room'
    const custom   = (formData.get('prompt')   as string) || ''

    const details = styleDetails[style] || style

    const prompt = [
      `Photorealistic ${style} ${roomType} interior design.`,
      `Style: ${details}.`,
      custom ? `Additional details: ${custom}.` : '',
      'Professional architectural photography, magazine quality.',
      'Perfect lighting, ultra detailed, 8K quality.',
      'No people in the image.',
    ].filter(Boolean).join(' ')

    const response = await openai.images.generate({
      model:   'gpt-image-1',
      prompt,
      size:    '1536x1024' as '1024x1024',
      quality: 'high',
    })

    if (!response.data || response.data.length === 0) {
      return NextResponse.json({ error: 'No image returned from API' }, { status: 500 })
    }

    const imgData = response.data[0]
    const imageUrl = imgData.url ?? (imgData.b64_json ? `data:image/png;base64,${imgData.b64_json}` : null)

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL in response' }, { status: 500 })
    }

    return NextResponse.json({ image: imageUrl })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    console.error('Generate error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
