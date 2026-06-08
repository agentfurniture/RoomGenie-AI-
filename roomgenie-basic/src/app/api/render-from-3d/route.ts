import { NextResponse } from 'next/server'

/**
 * render-from-3d — Takes the 3D SVG capture and makes it photorealistic
 * Uses Nano Banana (Gemini 2.5 Flash Image) image editing
 * GEMINI_API_KEY required in Vercel environment variables
 */
export async function POST(req: Request) {
  try {
    const { image, style, roomType, layoutJSON } = await req.json()
    if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 })

    // Build description from layoutJSON
    const furniture = (layoutJSON?.furniture || [])
      .filter((f: { type: string; heightFt: number }) => f.type !== 'rug' && f.heightFt > 0.8)
      .map((f: { label: string; color: string; material: string }) => `${f.label} in ${f.color} ${f.material}`)
      .slice(0, 8).join(', ')

    const wallColor  = layoutJSON?.walls?.color    || 'neutral white'
    const floorMat   = layoutJSON?.floor?.material || 'hardwood'
    const dims       = layoutJSON?.dimensions
    const dimStr     = dims ? `${dims.widthFt}×${dims.lengthFt}ft, ${dims.sqft} sqft` : ''

    const prompt = [
      `Transform this 3D room diagram into a photorealistic interior design photograph.`,
      `IMPORTANT: Preserve the EXACT same furniture layout and positions shown in the image.`,
      `Style: ${style}. Room type: ${roomType}. ${dimStr ? 'Dimensions: ' + dimStr + '.' : ''}`,
      furniture ? `Furniture (keep in same positions): ${furniture}.` : '',
      `Materials: ${floorMat} floor, ${wallColor} walls.`,
      `Add realistic textures, accurate lighting, shadows, reflections.`,
      `Wide angle professional interior photography shot. Architectural Digest quality.`,
      `No people. No text. No watermarks.`,
    ].filter(Boolean).join(' ')

    console.log('[render-from-3d] Editing with Nano Banana (gemini-2.5-flash-image)...')

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`

    const body = {
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data:     image,  // base64 PNG of the SVG capture
            }
          },
          { text: prompt }
        ]
      }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
      }
    }

    const resp = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      console.error('[render-from-3d] Nano Banana error:', resp.status, errText.slice(0,200))
      return NextResponse.json({ error: `Nano Banana error: ${resp.status}` }, { status: 500 })
    }

    const data = await resp.json()

    // Extract image from response
    const candidates = data.candidates || []
    for (const candidate of candidates) {
      for (const part of (candidate.content?.parts || [])) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
          console.log('[render-from-3d] Nano Banana success ✓')
          return NextResponse.json({ image: imageUrl })
        }
        if (part.fileData?.fileUri) {
          return NextResponse.json({ image: part.fileData.fileUri })
        }
      }
    }

    console.error('[render-from-3d] No image in response:', JSON.stringify(data).slice(0,300))
    return NextResponse.json({ error: 'No image returned from Nano Banana' }, { status: 500 })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Render failed'
    console.error('[render-from-3d]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
