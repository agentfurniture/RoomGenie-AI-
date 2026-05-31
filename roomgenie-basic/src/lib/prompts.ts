import type { QuestionnaireAnswers } from '@/components/RoomQuestionnaire'

const STYLE_DETAILS: Record<string, string> = {
  Modern:        'Clean straight lines, neutral whites and grays, contemporary furniture with metal accents, geometric shapes',
  Luxury:        'Opulent marble surfaces, gold/brass hardware, velvet textures, crystal lighting, rich jewel tones',
  Minimalist:    'Pure white walls, hidden storage, sparse carefully chosen furniture, abundant empty space, zen calm',
  Scandinavian:  'Natural birch/pine wood, white walls, hygge atmosphere, sheepskin throws, candles, organic textures',
  Industrial:    'Exposed brick walls, concrete floors, black iron pipe fixtures, Edison bulbs, reclaimed wood beams',
  Bohemian:      'Layered colorful textiles, macramé wall hangings, abundant plants, rattan furniture, eclectic patterns',
  Japandi:       'Wabi-sabi imperfection, shoji screens, bonsai, tatami mats, neutral earth tones, handmade ceramics',
  Contemporary:  'Current trends, bold accent walls, mixed materials, statement lighting, open plan, sophisticated',
  Mediterranean: 'Terracotta tiles, whitewashed walls, arched doorways, blue accents, wrought iron, lush plants',
  Futuristic:    'Smart home tech visible, LED accent lighting, glossy surfaces, minimalist floating furniture, monochrome',
}

const MOOD_MAP: Record<string, string> = {
  'Cozy & Warm':      'warm amber lighting, soft textiles, intimate scale furniture',
  'Clean & Fresh':    'bright natural light, crisp whites, airy open space',
  'Bold & Dramatic':  'deep moody colors, statement pieces, dramatic lighting',
  'Calm & Zen':       'neutral palette, natural materials, uncluttered serene space',
  'Playful & Fun':    'vibrant accent colors, playful shapes, eclectic accessories',
}

const LIGHTING_MAP: Record<string, string> = {
  'Very bright':  'floor-to-ceiling windows with abundant natural light flooding the space',
  'Moderate':     'balanced natural and artificial lighting',
  'Low light':    'warm artificial lighting with strategically placed lamps and sconces',
  'No windows':   'sophisticated artificial lighting design with layered light sources',
}

export function buildPrompt({
  style,
  roomType,
  prompt,
  answers,
  dimensions,
  furnitureItems,
}: {
  style: string
  roomType: string
  prompt: string
  answers?: QuestionnaireAnswers
  dimensions?: { width: string; length: string; height: string }
  furnitureItems?: string[]
}): string {
  const styleDetail = STYLE_DETAILS[style] || style
  const moodDetail = answers?.mood ? MOOD_MAP[answers.mood] || answers.mood : ''
  const lightingDetail = answers?.lighting ? LIGHTING_MAP[answers.lighting] || answers.lighting : ''

  const parts = [
    `Photorealistic ${style} style ${roomType} interior design.`,
    `Style: ${styleDetail}.`,
    moodDetail ? `Atmosphere: ${moodDetail}.` : '',
    lightingDetail ? `Lighting: ${lightingDetail}.` : '',
    dimensions?.width ? `Room dimensions: ${dimensions.width}ft wide × ${dimensions.length}ft long × ${dimensions.height}ft ceiling.` : '',
    answers?.material ? `Primary materials: ${answers.material}.` : '',
    answers?.density ? `Furniture density: ${answers.density}.` : '',
    answers?.occupants ? `Designed for: ${answers.occupants}.` : '',
    furnitureItems?.length ? `Include these furniture pieces: ${furnitureItems.join(', ')}.` : '',
    prompt ? `Additional requirements: ${prompt}.` : '',
    'Professional architectural photography.',
    'Interior design magazine quality like Architectural Digest.',
    'Perfect composition, photorealistic render, 8K quality.',
    'No people in the image.',
  ]

  return parts.filter(Boolean).join(' ')
}

export function buildChatSystemPrompt(): string {
  return `You are an expert luxury interior designer with 20+ years of experience working with high-end clients globally.

Your expertise includes:
- Color theory and palette creation
- Space planning and furniture layout optimization  
- Lighting design (natural and artificial)
- Material and texture pairing
- Style mixing and cohesion
- Budget-conscious design solutions
- Trend forecasting and timeless design principles

Communication style:
- Warm, encouraging, and professional
- Give specific actionable advice
- Reference real furniture brands and materials when helpful
- Use design terminology naturally
- Keep responses focused and concise (3-5 sentences unless asked for more)
- Always end with a follow-up question or suggestion to continue the conversation`
}

