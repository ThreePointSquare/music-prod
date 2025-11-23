# ProStudio DAW

A professional web-based Digital Audio Workstation (DAW) built with Vue 3, Tone.js, and AI-powered transcription.

## Features

- **Audio Transcription**: Upload audio files or YouTube URLs and transcribe them into MIDI notes using Spotify's Basic Pitch AI
- **Professional Timeline**: Drag, edit, and arrange musical notes on a multi-track timeline
- **Real-time Playback**: Play your compositions with high-quality synthesizers powered by Tone.js
- **Multiple Instruments**: Piano, synth, bass, and more
- **AI Music Generation**: Generate music from text prompts using Anthropic's Claude
- **Mixer Controls**: Volume, pan, mute, and solo controls for each track
- **Mobile Responsive**: Works beautifully on desktop and mobile devices

## Tech Stack

**Frontend:**
- Vue 3 (Composition API)
- Vite
- Tailwind CSS
- Tone.js (Web Audio)
- Pinia (State Management)
- Lucide Icons

**Backend:**
- Vercel Serverless Functions
- Anthropic Claude API
- Replicate API (Spotify Basic Pitch)
- Vercel Blob Storage

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key
- Replicate API token
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd music-prod
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
   VITE_REPLICATE_API_TOKEN=r8_...
   BLOB_READ_WRITE_TOKEN=vercel_blob_...
   VITE_API_URL=http://localhost:3000
   ANTHROPIC_API_KEY=sk-ant-api03-...
   REPLICATE_API_TOKEN=r8_...
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Deployment to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel**

   Go to your Vercel dashboard or use the CLI:
   ```bash
   vercel env add ANTHROPIC_API_KEY
   vercel env add REPLICATE_API_TOKEN
   vercel env add BLOB_READ_WRITE_TOKEN
   ```

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Usage Guide

### Getting Started

1. **Load Demo**: Click "Load Demo" to load a sample project with piano and bass tracks
2. **Add Tracks**: Use the buttons at the bottom to add Piano, Synth, or Bass tracks
3. **Add Notes**: Click "Add Note" in any track header to create a new note
4. **Edit Notes**: Click on a note to edit its properties (pitch, start time, duration, velocity)
5. **Play**: Click the play button to hear your composition

### Uploading Audio

1. Click "Upload Audio"
2. Drag and drop an audio file or click "Choose File"
3. Alternatively, paste a YouTube or audio URL
4. The audio will be transcribed into MIDI notes and organized into tracks

### Track Controls

- **M (Mute)**: Mute a track
- **S (Solo)**: Solo a track (mute all others)
- **Track Name**: Click to rename
- **Color Indicator**: Shows track color on timeline

### Timeline

- **Grid**: Shows beats (4 beats per measure)
- **Notes**: Displayed as colored blocks
- **Click**: Select a note to edit
- **Position**: Left-right position = time, height = note in scale

### Transport Controls

- **Play/Stop**: Start or stop playback
- **BPM**: Adjust tempo (60-200 BPM)

## Project Structure

```
prostudio-daw/
├── api/                          # Vercel serverless functions
│   ├── transcribe.js            # Audio transcription endpoint
│   └── generate-music.js        # AI music generation endpoint
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css         # Tailwind styles
│   ├── components/              # Vue components (future expansion)
│   ├── composables/
│   │   ├── useAudio.js          # Tone.js audio engine
│   │   ├── useTranscription.js  # Transcription API integration
│   │   └── useGeneration.js     # Music generation API integration
│   ├── stores/
│   │   ├── tracks.js            # Tracks state management
│   │   └── ui.js                # UI state management
│   ├── views/
│   │   └── Studio.vue           # Main DAW interface
│   ├── App.vue                  # Root component
│   └── main.js                  # App entry point
├── .env                         # Environment variables (local)
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── vercel.json                 # Vercel deployment config
```

## API Documentation

### POST /api/transcribe

Transcribes audio files into MIDI notes.

**Request:**
```json
{
  "audioFile": "<file>",  // OR
  "audioUrl": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "tracks": [
    {
      "name": "Piano",
      "instrument": "piano",
      "notes": [
        { "note": "C4", "start": 0, "duration": 1, "velocity": 100 }
      ]
    }
  ],
  "originalBlobUrl": "https://..."
}
```

### POST /api/generate-music

Generates music from a text prompt.

**Request:**
```json
{
  "prompt": "A happy upbeat melody",
  "style": "pop",
  "tempo": 120
}
```

**Response:**
```json
{
  "success": true,
  "composition": {
    "tempo": 120,
    "tracks": [...]
  }
}
```

## Data Models

### Track
```typescript
interface Track {
  id: string
  name: string
  type: 'midi' | 'audio'
  instrument: 'piano' | 'synth' | 'bass'
  color: string
  volume: number    // -60 to 12 dB
  pan: number       // -1 to 1
  mute: boolean
  solo: boolean
  notes: Note[]
  effects: {
    reverb: number
    delay: number
    eq: { low: number; mid: number; high: number }
  }
}
```

### Note
```typescript
interface Note {
  id: string
  note: string      // e.g., "C4", "A#3"
  start: number     // beats
  duration: number  // beats
  velocity: number  // 0-127
}
```

## Keyboard Shortcuts

(Future feature - to be implemented)

## Known Limitations

- Audio transcription uses a simplified MIDI parsing for MVP
- Export functionality not yet implemented
- Maximum file upload size: 50MB
- Vercel free tier bandwidth limit: 100GB/month

## Roadmap

- [ ] Proper MIDI file parsing
- [ ] WAV/MIDI export
- [ ] More instruments and effects
- [ ] Project save/load to database
- [ ] User authentication
- [ ] Real-time collaboration
- [ ] Waveform visualization
- [ ] Keyboard shortcuts
- [ ] Undo/redo
- [ ] Copy/paste notes
- [ ] Quantization
- [ ] Piano roll editor
- [ ] Mixer panel with visual EQ
- [ ] VST/AU plugin support (future)

## Troubleshooting

### Audio not playing
- Ensure you've clicked a button to initialize the audio context (browser requirement)
- Check browser console for errors
- Verify Tone.js is loaded correctly

### Transcription failing
- Check that your Replicate API token is valid
- Ensure the audio file is in a supported format (MP3, WAV, etc.)
- Check Vercel function logs for errors

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (must be 18+)
- Verify all environment variables are set

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT

## Credits

- Built with [Vue 3](https://vuejs.org/)
- Audio engine: [Tone.js](https://tonejs.github.io/)
- AI: [Anthropic Claude](https://www.anthropic.com/)
- Transcription: [Spotify Basic Pitch](https://github.com/spotify/basic-pitch)
- Icons: [Lucide](https://lucide.dev/)

## Support

For issues and questions, please open a GitHub issue.