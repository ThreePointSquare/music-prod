import { put } from '@vercel/blob'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { audioUrl, audioFile } = req.body

    if (!audioUrl && !audioFile) {
      return res.status(400).json({ success: false, error: 'No audio provided' })
    }

    // Store file in Vercel Blob
    let blobUrl
    if (audioFile) {
      const blob = await put(`audio/${Date.now()}.mp3`, audioFile, { access: 'public' })
      blobUrl = blob.url
    } else {
      blobUrl = audioUrl
    }

    // Call Replicate API for Basic Pitch transcription
    const transcriptionResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'spotify/basic-pitch:9d5a47a22c39c9b030634fad0c5d13780eb4c37e18e4bdfa71a2c30dcf0e3b3e',
        input: { audio_url: blobUrl }
      })
    })

    const prediction = await transcriptionResponse.json()

    // Poll for completion
    let result = prediction
    let attempts = 0
    while ((result.status === 'starting' || result.status === 'processing') && attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const statusResponse = await fetch(result.urls.get, {
        headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
      })
      result = await statusResponse.json()
      attempts++
    }

    if (result.status !== 'succeeded') {
      throw new Error('Transcription failed')
    }

    // Get MIDI data
    const midiData = result.output.midi_file
    // For MVP, create mock notes - you can add proper MIDI parsing later
    const rawNotes = [
      { note: 60, time: 0, duration: 1, velocity: 100 },
      { note: 64, time: 1, duration: 1, velocity: 95 }
    ]

    // Use Claude to organize into tracks
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Organize these MIDI notes into musical tracks:
        ${JSON.stringify(rawNotes)}

        Return JSON:
        {
          "tracks": [
            {
              "name": "Piano",
              "instrument": "piano",
              "notes": [{"note": "C4", "start": 0, "duration": 1, "velocity": 100}]
            }
          ]
        }

        Return ONLY valid JSON.`
      }]
    })

    const content = claudeResponse.content[0].text
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const organizedTracks = JSON.parse(jsonMatch[0])

    return res.status(200).json({
      success: true,
      tracks: organizedTracks.tracks,
      originalBlobUrl: blobUrl
    })

  } catch (error) {
    console.error('Transcription error:', error)
    return res.status(500).json({
      success: false,
      error: 'Transcription failed',
      details: error.message
    })
  }
}
