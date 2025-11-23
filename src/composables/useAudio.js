import * as Tone from 'tone'
import { ref, onUnmounted } from 'vue'

export function useAudio() {
  const synths = ref({})
  const channels = ref({})
  const mainOutput = ref(null)

  async function initAudio() {
    await Tone.start()
    if (!mainOutput.value) {
      mainOutput.value = new Tone.Gain(1).toDestination()
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
      await initAudio()

      Tone.Transport.bpm.value = tempo
      Tone.Transport.cancel()
      Tone.Transport.position = 0

      console.log(`Starting playback at ${tempo} BPM`)

      tracks.forEach(track => {
        if (track.mute) return

        setupTrack(track)
        const synth = synths.value[track.id]

        console.log(`Scheduling ${track.notes.length} notes for track: ${track.name}`)

        track.notes.forEach(note => {
          // note.start is in beats (quarter notes)
          // Convert to bars:beats:sixteenths notation for Transport.schedule
          const bar = Math.floor(note.start / 4)
          const beat = note.start % 4
          const position = `${bar}:${beat}:0`

          // note.duration is in beats (quarter notes)
          // Convert to seconds based on current tempo
          const durationInSeconds = (note.duration * 60) / tempo

          const velocity = note.velocity / 127

          console.log(`Scheduling note ${note.note} at ${position} for ${durationInSeconds}s`)

          Tone.Transport.schedule((time) => {
            synth.triggerAttackRelease(note.note, durationInSeconds, time, velocity)
          }, position)
        })
      })

      Tone.Transport.start()
      console.log('Transport started')
    } catch (error) {
      console.error('Error in play():', error)
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
