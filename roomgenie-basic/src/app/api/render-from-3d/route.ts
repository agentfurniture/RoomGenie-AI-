import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const OpenAI = (await import('openai')).default
    const openai  = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const { image, style, roomType, layoutJSON } = await req.json()
    if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

    // Build description of what's in the 3D scene from layoutJSON
    const furniture = (layoutJSON?.furniture || [])
      .filter((f: { type: string; heightFt: number }) => f.type !== 'rug' && f.heightFt > 0.8)
      .map((f: { label: string; color: string; material: string }) => `${f.label} in ${f.color} ${f.material}`)
      .slice(0, 8)
      .join(', ')

    const wallColor  = layoutJSON?.walls?.color  || 'neutral'
    const floorMat   = layoutJSON?.floor?.material || 'hardwood'
    const floorColor = layoutJSON?.floor?.color    || 'warm'
    const dims       = layoutJSON?.dimensions
    const dimStr     = dims ? `${dims.widthFt}x${dims.lengthFt}ft room` : 'room'

    // Prompt tells OpenAI to preserve the exact layout from the 3D image
    // and render it photorealistically
    const prompt = [
      `Transform this 3D room model into a photorealistic interior design photograph.`,
      `Preserve EXACTLY the same furniture layout, positions, and room proportions shown in the image.`,
      `Style: ${style}. Room type: ${roomType}. Dimensions: ${dimStr}.`,
      `Furniture to keep in same positions: ${furniture}.`,
      `Floor: ${floorMat} in ${floorColor}. Walls: ${wallColor}.`,
      `Add realistic textures, materials, lighting and shadows.`,
      `Make it look like a professional Architectural Digest interior photograph.`,
      `Wide angle shot. Perfect lighting. No people. No text.`,
    ].join(' ')

    // Convert base64 to buffer for OpenAI
    const imageBuffer = Buffer.from(image, 'base64')
    const imageFile   = new File([imageBuffer], 'room-3d.png', { type: 'image/png' })

    // Use gpt-image-1 edit endpoint — takes the 3D render as input and makes it photorealistic
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
      : item.url || ''

    return NextResponse.json({ image: imageUrl })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Render failed'
    console.error('[render-from-3d]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
