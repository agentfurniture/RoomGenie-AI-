import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const OpenAI = (await import('openai')).default
    const openai  = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const { image, style, roomType, layoutJSON } = await req.json()
    if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

    const furniture = (layoutJSON?.furniture || [])
      .filter((f: { type: string; heightFt: number }) => f.type !== 'rug' && f.heightFt > 0.8)
      .map((f: { label: string; color: string; material: string }) => `${f.label} in ${f.color} ${f.material}`)
      .slice(0, 8)
      .join(', ')

    const wallColor  = layoutJSON?.walls?.color    || 'neutral white'
    const floorMat   = layoutJSON?.floor?.material || 'hardwood'
    const floorColor = layoutJSON?.floor?.color    || 'warm wood'
    const dims       = layoutJSON?.dimensions
    const dimStr     = dims ? `${dims.widthFt}x${dims.lengthFt}ft` : ''

    const prompt = [
      `Transform this 3D room model into a photorealistic interior design photograph.`,
      `Preserve EXACTLY the same furniture layout, positions, and proportions shown in the 3D image.`,
      `Style: ${style}. Room: ${roomType}. ${dimStr ? 'Size: ' + dimStr + '.' : ''}`,
      furniture ? `Furniture in same positions: ${furniture}.` : '',
      `Floor: ${floorMat} ${floorColor}. Walls: ${wallColor}.`,
      `Add realistic textures, materials, soft shadows and professional interior lighting.`,
      `Wide angle shot showing the full room. Architectural Digest quality. No people. No text.`,
    ].filter(Boolean).join(' ')

    const imageBuffer = Buffer.from(image, 'base64')
    const imageFile   = new File([imageBuffer], 'room.png', { type: 'image/png' })

    const response = await openai.images.edit({
      model:  'gpt-image-1',
      image:  imageFile,
      prompt: prompt.slice(0, 4000),
      size:   '1536x1024' as '1024x1024',
      n:      1,
    })

    const item = response.data?.[0]
    if (!item) return NextResponse.json({ error: 'No image returned' }, { status: 500 })

    const imageUrl = item.b64_json
      ? `data:image/png;base64,${item.b64_json}`
      : (item.url || '')

    return NextResponse.json({ image: imageUrl })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Render failed'
    console.error('[render-from-3d]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
