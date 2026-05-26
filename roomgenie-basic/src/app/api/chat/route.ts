import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert luxury interior designer with 20 years of experience.
Give specific, actionable advice about color palettes, furniture layout, lighting, textures, storage, and decor.
Keep responses to 3-5 sentences — concise but full of value. Be encouraging and creative.`,
        },
        { role: 'user', content: message },
      ],
      max_tokens: 350,
      temperature: 0.75,
    })

    return NextResponse.json({ reply: completion.choices[0].message.content })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Chat failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

