import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildChatSystemPrompt } from '@/lib/prompts'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json()
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    const messages = [
      ...(history || []).slice(-10),
      { role: 'user' as const, content: message },
    ]

    const response = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 450,
      system:     buildChatSystemPrompt(),
      messages,
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ reply })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Chat failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
