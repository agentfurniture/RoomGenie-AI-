import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { image, style, roomType, layoutJSON } = await req.json()
    if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 })

    const furniture = (layoutJSON?.furniture || [])
      .filter((f: { type: string; heightFt: number }) => f.type !== 'rug' && f.heightFt > 0.8)
      .map((f: { label: string; color: string; material: string }) => `${f.label} in ${f.color} ${f.material}`)
      .slice(0, 8).join(', ')

    const dims   = layoutJSON?.dimensions
    const dimStr = dims ? `${dims.widthFt}×${dims.lengthFt}ft, ${dims.sqft} sqft` : ''

    const prompt = [
      `Transform this 3D isometric room diagram into a photorealistic interior design photograph.`,
      `Preserve EXACTLY the same furniture layout, positions and proportions shown.`,
      `Style: ${style}. Room: ${roomType}. ${dimStr ? 'Size: ' + dimStr + '.' : ''}`,
      furniture ? `Furniture in same positions: ${furniture}.` : '',
      `Add photorealistic textures, materials, professional interior lighting and shadows.`,
      `Wide angle corner shot showing the full room. Magazine quality. No people. No text.`,
    ].filter(Boolean).join(' ')

    // Try Imagen 3 first (best for photo-realistic edits)
    const imagen3Url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`
    const imagen3Resp = await fetch(imagen3Url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances:  [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '16:9', personGeneration: 'dont_allow' }
      })
    })

    if (imagen3Resp.ok) {
      const data = await imagen3Resp.json()
      const b64  = data.predictions?.[0]?.bytesBase64Encoded
      if (b64) {
        return NextResponse.json({ image: `data:image/png;base64,${b64}` })
      }
    }

    // Fallback: Gemini 2.0 Flash with image input (send the 3D SVG as reference)
    const flashUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`
    const flashResp = await fetch(flashUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: 'image/png', data: image } },
            { text: prompt }
          ]
        }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
      })
    })

    if (flashResp.ok) {
      const data = await flashResp.json()
      for (const part of (data.candidates?.[0]?.content?.parts || [])) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          return NextResponse.json({ image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` })
        }
      }
    }

    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Render failed'
    console.error('[render-from-3d]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
