import * as Tone from 'tone'
import { ref, onUnmounted } from 'vue'

export function useAudio() {
  const synths = ref({})
  const channels = ref({})
  const mainOutput = ref(null)
  const isAudioInitialized = ref(false)

  // Detect Safari browser (especially iOS)
  function isSafari() {
    const ua = navigator.userAgent
    return /Safari/.test(ua) && !/Chrome/.test(ua) && !/Chromium/.test(ua)
  }

  function isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  }

  async function initAudio() {
    try {
      console.log('[Audio] Initializing audio context...')
      console.log('[Audio] Browser:', isSafari() ? 'Safari' : 'Other', '- Mobile:', isMobile())
      console.log('[Audio] AudioContext state before start:', Tone.context.state)

      // CRITICAL: Start Tone.js - this MUST happen from user gesture on Safari iOS
      await Tone.start()

      console.log('[Audio] AudioContext state after start:', Tone.context.state)

      // Verify AudioContext is actually running
      if (Tone.context.state !== 'running') {
        console.error('[Audio] AudioContext failed to start. State:', Tone.context.state)
        throw new Error(`AudioContext is ${Tone.context.state}, expected "running". Safari iOS requires user interaction.`)
      }

      if (!mainOutput.value) {
        mainOutput.value = new Tone.Gain(1).toDestination()
        console.log('[Audio] Main output created')
      }

      isAudioInitialized.value = true
      console.log('[Audio] Initialization complete ✓')
    } catch (error) {
      console.error('[Audio] Initialization failed:', error)
      throw new Error(`Audio initialization failed: ${error.message}`)
    }
  }

  function createInstrument(type) {
    switch(type) {
      case 'piano':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 1 }
        })
      case 'synth':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.8 }
        })
      case 'bass':
        return new Tone.MonoSynth({
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.5 }
        })
      default:
        return new Tone.PolySynth(Tone.Synth)
    }
  }

  function setupTrack(track) {
    if (synths.value[track.id]) synths.value[track.id].dispose()
    if (channels.value[track.id]) channels.value[track.id].dispose()

    const synth = createInstrument(track.instrument)
    const channel = new Tone.Channel(track.volume, track.pan)

    synth.chain(channel, mainOutput.value)
    channel.mute = track.mute

    synths.value[track.id] = synth
    channels.value[track.id] = channel
  }

  async function play(tracks, tempo) {
    try {
      // Initialize audio from user gesture (REQUIRED for Safari iOS)
      await initAudio()

      // Double-check AudioContext is running
      if (Tone.context.state !== 'running') {
        throw new Error(`Cannot play: AudioContext is ${Tone.context.state}. Try clicking Play again.`)
      }

      Tone.Transport.bpm.value = tempo
      Tone.Transport.cancel()
      Tone.Transport.position = 0

      console.log(`[Audio] Starting playback at ${tempo} BPM`)
      console.log(`[Audio] Transport state:`, Tone.Transport.state)

      tracks.forEach(track => {
        if (track.mute) return

        setupTrack(track)
        const synth = synths.value[track.id]

        console.log(`[Audio] Scheduling ${track.notes.length} notes for track: ${track.name}`)

        track.notes.forEach(note => {
          // Safari iOS prefers simpler time notation
          // Convert beats to seconds for absolute time scheduling
          const startTimeInSeconds = (note.start * 60) / tempo
          const durationInSeconds = (note.duration * 60) / tempo
          const velocity = note.velocity / 127

          // Use "+" prefix for relative time from Transport start (Safari compatible)
          const timeNotation = `+${startTimeInSeconds}`

          if (isMobile()) {
            console.log(`[Audio] Note ${note.note} @ ${startTimeInSeconds.toFixed(2)}s, dur: ${durationInSeconds.toFixed(2)}s`)
          }

          Tone.Transport.schedule((time) => {
            try {
              synth.triggerAttackRelease(note.note, durationInSeconds, time, velocity)
            } catch (err) {
              console.error(`[Audio] Failed to trigger note ${note.note}:`, err)
            }
          }, timeNotation)
        })
      })

      // Test immediate playback for Safari iOS verification
      if (isSafari() && isMobile()) {
        console.log('[Audio] Safari iOS detected - testing immediate playback...')
        try {
          const testSynth = new Tone.Synth().toDestination()
          testSynth.triggerAttackRelease("C4", "16n")
          testSynth.dispose()
          console.log('[Audio] Test playback successful ✓')
        } catch (err) {
          console.error('[Audio] Test playback failed:', err)
        }
      }

      Tone.Transport.start()
      console.log('[Audio] Transport started ✓')
    } catch (error) {
      console.error('[Audio] Error in play():', error)
      console.error('[Audio] AudioContext state:', Tone.context.state)
      console.error('[Audio] Transport state:', Tone.Transport.state)
      throw error
    }
  }

  function stop() {
    Tone.Transport.stop()
    Tone.Transport.cancel()
    Tone.Transport.position = 0
    console.log('Transport stopped and reset')
  }

  function dispose() {
    Object.values(synths.value).forEach(s => s.dispose())
    Object.values(channels.value).forEach(c => c.dispose())
    if (mainOutput.value) mainOutput.value.dispose()
  }

  onUnmounted(() => dispose())

  return { initAudio, setupTrack, play, stop, dispose }
}
