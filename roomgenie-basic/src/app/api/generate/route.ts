import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildPrompt } from '@/lib/prompts'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const formData  = await req.formData()
    const style     = (formData.get('style')     as string) || 'Modern'
    const roomType  = (formData.get('roomType')  as string) || 'Living Room'
    const prompt    = (formData.get('prompt')    as string) || ''
    const answersRaw = formData.get('answers') as string
    const dimsRaw    = formData.get('dimensions') as string
    const furniture  = formData.get('furniture') as string

    const answers    = answersRaw ? JSON.parse(answersRaw) : {}
    const dimensions = dimsRaw    ? JSON.parse(dimsRaw)    : {}
    const furnitureItems = furniture ? JSON.parse(furniture) : []

    const designPrompt = buildPrompt({ style, roomType, prompt, answers, dimensions, furnitureItems })

    // Claude generates design details + Unsplash image
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      system: `You are an expert interior designer. Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "title": "creative short design title",
  "tagline": "one evocative sentence",
  "description": "2-3 vivid sentences describing the redesigned space",
  "colors": ["#hexcode - Color Name", "#hexcode - Color Name", "#hexcode - Color Name", "#hexcode - Color Name"],
  "furniture": ["Specific furniture piece 1", "Specific furniture piece 2", "Specific furniture piece 3", "Specific furniture piece 4", "Specific furniture piece 5"],
  "tips": ["Specific actionable design tip 1", "Specific actionable design tip 2", "Specific actionable design tip 3"],
  "materials": ["Material 1", "Material 2", "Material 3"],
  "unsplashQuery": "very specific interior photo search query"
}`,
      messages: [{ role: 'user', content: `Design brief: ${designPrompt}` }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}'
    let design
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      design = JSON.parse(cleaned)
    } catch {
      design = { title: `${style} ${roomType}`, tagline: 'Your dream space awaits', description: raw, colors: [], furniture: [], tips: [], materials: [] }
    }

    const query  = encodeURIComponent(design.unsplashQuery || `${style.toLowerCase()} ${roomType.toLowerCase()} interior design`)
    const seed   = Math.floor(Math.random() * 1000)
    const image  = `https://source.unsplash.com/1600x900/?${query}&sig=${seed}`

    return NextResponse.json({ image, design, prompt: designPrompt })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    console.error('Generate error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
