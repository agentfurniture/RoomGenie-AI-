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

// Curated direct Unsplash image IDs per style+room combo — reliable, no redirects
const STYLE_IMAGES: Record<string, string> = {
  'Modern-Living Room':       'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=85&auto=format&fit=crop',
  'Modern-Bedroom':           'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=85&auto=format&fit=crop',
  'Modern-Kitchen':           'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=85&auto=format&fit=crop',
  'Modern-Bathroom':          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=85&auto=format&fit=crop',
  'Modern-Home Office':       'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=85&auto=format&fit=crop',
  'Modern-Dining Room':       'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=1200&q=85&auto=format&fit=crop',
  'Luxury-Living Room':       'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200&q=85&auto=format&fit=crop',
  'Luxury-Bedroom':           'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=85&auto=format&fit=crop',
  'Luxury-Bathroom':          'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=85&auto=format&fit=crop',
  'Minimalist-Living Room':   'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&q=85&auto=format&fit=crop',
  'Minimalist-Bedroom':       'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=85&auto=format&fit=crop',
  'Minimalist-Kitchen':       'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1200&q=85&auto=format&fit=crop',
  'Scandinavian-Living Room': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=85&auto=format&fit=crop',
  'Scandinavian-Bedroom':     'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=1200&q=85&auto=format&fit=crop',
  'Industrial-Living Room':   'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=1200&q=85&auto=format&fit=crop',
  'Industrial-Home Office':   'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=85&auto=format&fit=crop',
  'Bohemian-Living Room':     'https://images.unsplash.com/photo-1522444195799-478538b28823?w=1200&q=85&auto=format&fit=crop',
  'Bohemian-Bedroom':         'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=1200&q=85&auto=format&fit=crop',
  'Japandi-Living Room':      'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?w=1200&q=85&auto=format&fit=crop',
  'Japandi-Bedroom':          'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&q=85&auto=format&fit=crop',
  'Classic-Living Room':      'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=1200&q=85&auto=format&fit=crop',
  'Classic-Bedroom':          'https://images.unsplash.com/photo-1560448075-bb485b067938?w=1200&q=85&auto=format&fit=crop',
}

// Fallback images per room type
const ROOM_FALLBACKS: Record<string, string> = {
  'Living Room':  'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200&q=85&auto=format&fit=crop',
  'Bedroom':      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=85&auto=format&fit=crop',
  'Kitchen':      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=85&auto=format&fit=crop',
  'Bathroom':     'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=85&auto=format&fit=crop',
  'Home Office':  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=85&auto=format&fit=crop',
  'Dining Room':  'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=1200&q=85&auto=format&fit=crop',
  'Kids Room':    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200&q=85&auto=format&fit=crop',
  'Master Suite': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=85&auto=format&fit=crop',
  'Studio':       'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&q=85&auto=format&fit=crop',
}

function getImage(style: string, roomType: string): string {
  return (
    STYLE_IMAGES[`${style}-${roomType}`] ||
    STYLE_IMAGES[`${style}-Living Room`] ||
    ROOM_FALLBACKS[roomType] ||
    'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200&q=85&auto=format&fit=crop'
  )
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

    const claudeResp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      system: `You are an expert interior designer. Respond ONLY with valid JSON (no markdown, no backticks, no extra text):
{
  "title": "short creative design title e.g. Serene Minimalist Retreat",
  "tagline": "one evocative sentence describing the design concept",
  "description": "2-3 vivid sentences describing the redesigned space in detail",
  "colors": ["#hex - Color Name", "#hex - Color Name", "#hex - Color Name", "#hex - Color Name"],
  "furniture": ["Specific furniture piece 1", "Specific piece 2", "Specific piece 3", "Specific piece 4", "Specific piece 5"],
  "tips": ["Specific actionable designer tip 1", "Tip 2", "Tip 3"],
  "materials": ["Specific material 1", "Specific material 2", "Specific material 3", "Specific material 4"]
}`,
      messages: [{
        role: 'user',
        content: `Design a ${style} ${roomType}. Style details: ${details}. ${custom ? 'Extra requirements: ' + custom : ''} Give me specific, luxury-brand-quality recommendations.`
      }],
    })

    const raw = claudeResp.content[0].type === 'text' ? claudeResp.content[0].text.trim() : '{}'
    let design: Record<string, unknown>
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      design = JSON.parse(cleaned)
    } catch {
      design = {
        title: `${style} ${roomType}`,
        tagline: 'A beautifully curated space designed just for you.',
        description: `A stunning ${style.toLowerCase()} ${roomType.toLowerCase()} with carefully selected materials and thoughtful design.`,
        colors: ['#F5F5F0 - Warm White', '#D4C5A9 - Warm Sand', '#8B7355 - Warm Taupe', '#2C2C2C - Charcoal'],
        furniture: ['Custom sofa in premium fabric', 'Designer coffee table', 'Statement floor lamp', 'Accent armchair', 'Storage ottoman'],
        tips: ['Layer lighting with multiple sources', 'Mix textures for depth and warmth', 'Keep a consistent color temperature throughout'],
        materials: ['Premium linen upholstery', 'Natural oak wood', 'Brushed brass accents', 'Merino wool textiles'],
      }
    }

    const image = getImage(style, roomType)

    return NextResponse.json({ image, design })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    console.error('Generate error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
