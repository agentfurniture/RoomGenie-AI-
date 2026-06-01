import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const STYLE_DETAILS: Record<string, string> = {
  Modern:        'clean lines, neutral whites/greys, contemporary furniture, minimal clutter, metal accents',
  Luxury:        'opulent marble surfaces, gold brass accents, velvet textures, crystal chandeliers, jewel tones',
  Minimalist:    'pure white walls, hidden storage, only essential furniture, vast empty space, zen calm',
  Scandinavian:  'natural birch wood, white walls, hygge atmosphere, sheepskin, candles, organic textures',
  Industrial:    'exposed brick, concrete floors, black iron pipes, Edison bulbs, reclaimed wood beams',
  Bohemian:      'layered colorful textiles, macramé wall art, abundant plants, rattan, eclectic patterns',
  Japandi:       'wabi-sabi imperfection, shoji screens, bonsai, tatami, neutral earth tones, handmade ceramics',
  Classic:       'traditional carved furniture, crown moulding, rich fabrics, symmetrical layout, antique accents',
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const style    = (formData.get('style')    as string) || 'Modern'
    const roomType = (formData.get('roomType') as string) || 'Living Room'
    const custom   = (formData.get('prompt')   as string) || ''
    const details  = STYLE_DETAILS[style] || style

    // Step 1: Claude generates design details
    const claudeResp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      system: `You are an expert interior designer. Respond ONLY with valid JSON, no markdown, no backticks:
{"title":"short creative title","tagline":"one evocative sentence","description":"2-3 vivid sentences about the redesigned space","colors":["#hex - Color Name","#hex - Color Name","#hex - Color Name"],"furniture":["item1","item2","item3","item4"],"tips":["tip1","tip2","tip3"],"materials":["material1","material2","material3"],"imagePrompt":"ultra-specific photorealistic interior photo description for DALL-E"}`,
      messages: [{ role: 'user', content: `Design a ${style} ${roomType}. Style: ${details}. ${custom ? 'Extra: ' + custom : ''}` }],
    })

    const raw = claudeResp.content[0].type === 'text' ? claudeResp.content[0].text.trim() : '{}'
    let design: Record<string, unknown>
    try {
      design = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch {
      design = { title: `${style} ${roomType}`, description: raw }
    }

    // Step 2: DALL-E 3 generates the image
    const imgPrompt = [
      `Photorealistic ${style} interior design of a ${roomType}.`,
      `Style details: ${details}.`,
      typeof design.imagePrompt === 'string' ? design.imagePrompt : '',
      custom || '',
      'Professional architectural photography, Architectural Digest quality.',
      'Perfect lighting, ultra detailed render, no people.',
    ].filter(Boolean).join(' ')

    let imageUrl: string
    try {
      const imgResp = await openai.images.generate({
        model: 'dall-e-3',
        prompt: imgPrompt,
        size: '1792x1024',
        quality: 'hd',
        n: 1,
      })
      imageUrl = imgResp.data[0]?.url || `https://source.unsplash.com/1600x900/?${encodeURIComponent(style + ' ' + roomType + ' interior')}`
    } catch {
      // Fallback to Unsplash if DALL-E fails
      const q = encodeURIComponent(`${style.toLowerCase()} ${roomType.toLowerCase()} interior design`)
      imageUrl = `https://source.unsplash.com/1600x900/?${q}&sig=${Date.now()}`
    }

    return NextResponse.json({ image: imageUrl, design })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    console.error('Generate error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
