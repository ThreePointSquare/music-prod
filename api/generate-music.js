import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { prompt, style, tempo } = req.body

    if (!prompt || prompt.length < 3) {
      return res.status(400).json({ success: false, error: 'Invalid prompt' })
    }

    const bpm = tempo || 120

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Generate music for: "${prompt}"
        ${style ? `Style: ${style}` : ''}
        Tempo: ${bpm} BPM

        Return JSON:
        {
          "tempo": ${bpm},
          "tracks": [
            {
              "name": "Piano",
              "instrument": "piano",
              "notes": [{"note": "C4", "start": 0, "duration": 1, "velocity": 100}]
            }
          ]
        }

        Create 2-3 tracks with 10-20 notes each. Return ONLY valid JSON.`
      }]
    })

    const content = response.content[0].text
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const composition = JSON.parse(jsonMatch[0])

    return res.status(200).json({
      success: true,
      composition
    })

  } catch (error) {
    console.error('Generation error:', error)
    return res.status(500).json({
      success: false,
      error: 'Generation failed',
      details: error.message
    })
  }
}
