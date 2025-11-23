import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTracksStore = defineStore('tracks', () => {
  const tracks = ref([])
  const selectedTrackId = ref(null)
  const selectedNoteId = ref(null)
  const tempo = ref(120)
  const isPlaying = ref(false)

  const selectedTrack = computed(() =>
    tracks.value.find(t => t.id === selectedTrackId.value)
  )

  function addTrack(trackData) {
    const colorPalette = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
    const color = trackData.color || colorPalette[tracks.value.length % colorPalette.length]

    const newTrack = {
      id: trackData.id || `track-${Date.now()}`,
      name: trackData.name || `Track ${tracks.value.length + 1}`,
      type: trackData.type || 'midi',
      instrument: trackData.instrument || 'synth',
      color: color,
      volume: trackData.volume ?? -10,
      pan: trackData.pan ?? 0,
      mute: trackData.mute ?? false,
      solo: trackData.solo ?? false,
      notes: trackData.notes || [],
      effects: trackData.effects || {
        reverb: 0,
        delay: 0,
        eq: { low: 0, mid: 0, high: 0 }
      }
    }

    tracks.value.push(newTrack)
    return newTrack.id
  }

  function updateTrack(trackId, updates) {
    const index = tracks.value.findIndex(t => t.id === trackId)
    if (index !== -1) {
      tracks.value[index] = { ...tracks.value[index], ...updates }
    }
  }

  function deleteTrack(trackId) {
    tracks.value = tracks.value.filter(t => t.id !== trackId)
  }

  function addNote(trackId, noteData) {
    const track = tracks.value.find(t => t.id === trackId)
    if (!track) return

    const newNote = {
      id: noteData.id || `note-${Date.now()}`,
      note: noteData.note || 'C4',
      start: noteData.start ?? 0,
      duration: noteData.duration ?? 1,
      velocity: noteData.velocity ?? 100
    }

    track.notes.push(newNote)
    return newNote.id
  }

  function updateNote(trackId, noteId, updates) {
    const track = tracks.value.find(t => t.id === trackId)
    if (!track) return

    const noteIndex = track.notes.findIndex(n => n.id === noteId)
    if (noteIndex !== -1) {
      track.notes[noteIndex] = { ...track.notes[noteIndex], ...updates }
    }
  }

  function deleteNote(trackId, noteId) {
    const track = tracks.value.find(t => t.id === trackId)
    if (!track) return
    track.notes = track.notes.filter(n => n.id !== noteId)
  }

  function loadProject(projectData) {
    tracks.value = projectData.tracks || []
    tempo.value = projectData.tempo || 120
  }

  return {
    tracks,
    selectedTrackId,
    selectedNoteId,
    tempo,
    isPlaying,
    selectedTrack,
    addTrack,
    updateTrack,
    deleteTrack,
    addNote,
    updateNote,
    deleteNote,
    loadProject
  }
})
