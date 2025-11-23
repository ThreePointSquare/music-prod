<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <!-- Transport Bar -->
    <div class="bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-4">
      <div class="flex items-center gap-4">
        <button
          @click="handlePlay"
          :class="[
            'w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg',
            isPlaying
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
          ]"
        >
          <Play v-if="!isPlaying" class="w-6 h-6 ml-0.5" />
          <Square v-else class="w-6 h-6" />
        </button>

        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400">BPM</span>
          <input
            v-model.number="tracksStore.tempo"
            type="number"
            class="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center"
            min="60"
            max="200"
          />
        </div>

        <button
          @click="loadDemo"
          class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10"
        >
          Load Demo
        </button>

        <button
          @click="showUploadModal = true"
          class="btn-primary"
        >
          <Upload class="w-4 h-4 inline mr-2" />
          Upload Audio
        </button>
      </div>
    </div>

    <!-- Timeline -->
    <div class="flex-1 overflow-auto">
      <div v-if="tracksStore.tracks.length === 0" class="flex items-center justify-center h-full p-8">
        <div class="text-center max-w-md">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
            <Volume2 class="w-10 h-10 text-purple-400" />
          </div>
          <h2 class="text-2xl font-bold mb-4">Ready to Create</h2>
          <p class="text-gray-400 mb-6">Upload audio to transcribe or load a demo</p>
        </div>
      </div>

      <div v-else>
        <div v-for="track in tracksStore.tracks" :key="track.id" class="flex border-b border-white/5 hover:bg-white/[0.02]">
          <!-- Track Header -->
          <div class="w-64 border-r border-white/5 p-4 bg-gradient-to-r from-black/20 to-transparent">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: track.color }"></div>
              <input
                v-model="track.name"
                class="flex-1 bg-transparent font-medium text-sm focus:outline-none focus:bg-white/5 px-2 py-1 rounded"
              />
            </div>

            <div class="flex gap-1.5 mb-3">
              <button
                @click="track.mute = !track.mute"
                :class="['flex-1 px-2 py-1.5 rounded text-xs font-bold', track.mute ? 'bg-red-500/90' : 'bg-white/5 hover:bg-white/10']"
              >
                M
              </button>
              <button
                @click="track.solo = !track.solo"
                :class="['flex-1 px-2 py-1.5 rounded text-xs font-bold', track.solo ? 'bg-yellow-500/90' : 'bg-white/5 hover:bg-white/10']"
              >
                S
              </button>
            </div>

            <button
              @click="addNoteToTrack(track.id)"
              class="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium"
            >
              <Plus class="w-3 h-3 inline mr-1" />
              Add Note
            </button>
          </div>

          <!-- Timeline -->
          <div class="flex-1 relative h-32 overflow-x-auto bg-gradient-to-r from-black/10 to-transparent">
            <!-- Grid -->
            <div class="absolute inset-0 flex" style="min-width: 960px">
              <div
                v-for="i in 32"
                :key="i"
                :class="['flex-1', i % 4 === 0 ? 'border-r border-white/10' : 'border-r border-white/5']"
                style="min-width: 30px"
              >
                <div v-if="i % 4 === 0" class="text-xs text-gray-600 px-2 py-1">
                  {{ Math.floor(i / 4) + 1 }}
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="relative h-full" style="min-width: 960px">
              <div
                v-for="note in track.notes"
                :key="note.id"
                @click="selectNote(track.id, note.id)"
                class="absolute cursor-pointer transition-all hover:scale-105 rounded-lg shadow-lg"
                :style="{
                  left: `${(note.start / 32) * 100}%`,
                  width: `${Math.max((note.duration / 32) * 100, 0.5)}%`,
                  bottom: '20%',
                  height: '18%',
                  background: `linear-gradient(135deg, ${track.color}, ${track.color}DD)`,
                  border: tracksStore.selectedNoteId === note.id ? `2px solid ${track.color}` : '1px solid rgba(255,255,255,0.1)'
                }"
              >
                <div class="text-xs px-2 py-1 truncate font-semibold text-white">
                  {{ note.note }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Track Bar -->
    <div class="bg-black/60 backdrop-blur-xl border-t border-white/5 p-4 flex gap-2">
      <button
        @click="addTrack('piano')"
        class="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20"
      >
        <Plus class="w-4 h-4 inline mr-1" />
        Piano
      </button>
      <button
        @click="addTrack('synth')"
        class="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20"
      >
        <Plus class="w-4 h-4 inline mr-1" />
        Synth
      </button>
      <button
        @click="addTrack('bass')"
        class="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20"
      >
        <Plus class="w-4 h-4 inline mr-1" />
        Bass
      </button>
    </div>

    <!-- Note Editor (appears when note selected) -->
    <div v-if="selectedNote" class="bg-black/80 backdrop-blur-xl border-t border-white/5 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold">Note Properties</h3>
        <button @click="tracksStore.selectedNoteId = null" class="p-1 hover:bg-white/5 rounded">
          <X class="w-4 h-4" />
        </button>
      </div>
      <div class="grid grid-cols-4 gap-4">
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Note</label>
          <input
            v-model="selectedNote.note"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Start</label>
          <input
            v-model.number="selectedNote.start"
            type="number"
            step="0.25"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Duration</label>
          <input
            v-model.number="selectedNote.duration"
            type="number"
            step="0.25"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Velocity</label>
          <input
            v-model.number="selectedNote.velocity"
            type="range"
            min="0"
            max="127"
            class="w-full accent-purple-500"
          />
        </div>
      </div>
      <button
        @click="deleteSelectedNote"
        class="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20"
      >
        Delete Note
      </button>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click="showUploadModal = false">
      <div class="glass rounded-2xl p-8 max-w-md w-full" @click.stop>
        <h2 class="text-2xl font-bold mb-6">Upload Audio</h2>

        <div
          @drop.prevent="handleDrop"
          @dragover.prevent
          class="border-2 border-dashed border-purple-500/50 rounded-xl p-12 text-center hover:border-purple-500 cursor-pointer"
        >
          <input
            ref="fileInput"
            type="file"
            accept="audio/*"
            @change="handleFileSelect"
            class="hidden"
          />

          <Upload class="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <p class="mb-2">Drop audio file or click to browse</p>
          <button @click="$refs.fileInput.click()" class="btn-primary mt-4">
            Choose File
          </button>
        </div>

        <div class="mt-6">
          <label class="block text-sm mb-2">Or paste URL</label>
          <div class="flex gap-2">
            <input
              v-model="urlInput"
              type="url"
              placeholder="https://youtube.com/..."
              class="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3"
            />
            <button @click="handleURLSubmit" class="btn-primary">
              Transcribe
            </button>
          </div>
        </div>

        <button @click="showUploadModal = false" class="mt-6 w-full btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Play, Square, Plus, Upload, Volume2, X } from 'lucide-vue-next'
import { useTracksStore } from '@/stores/tracks'
import { useAudio } from '@/composables/useAudio'
import { useTranscription } from '@/composables/useTranscription'

const tracksStore = useTracksStore()
const { play, stop } = useAudio()
const { transcribeAudio, transcribeURL } = useTranscription()

const isPlaying = ref(false)
const showUploadModal = ref(false)
const urlInput = ref('')
const fileInput = ref(null)

const selectedNote = computed(() => {
  if (!tracksStore.selectedNoteId) return null
  for (const track of tracksStore.tracks) {
    const note = track.notes.find(n => n.id === tracksStore.selectedNoteId)
    if (note) return note
  }
  return null
})

function loadDemo() {
  tracksStore.loadProject({
    tempo: 120,
    tracks: [
      {
        name: 'Piano',
        instrument: 'piano',
        notes: [
          { note: 'C4', start: 0, duration: 1, velocity: 100 },
          { note: 'E4', start: 1, duration: 1, velocity: 95 },
          { note: 'G4', start: 2, duration: 1, velocity: 90 },
          { note: 'C5', start: 3, duration: 1, velocity: 100 }
        ]
      },
      {
        name: 'Bass',
        instrument: 'bass',
        notes: [
          { note: 'C2', start: 0, duration: 4, velocity: 110 },
          { note: 'G2', start: 4, duration: 4, velocity: 105 }
        ]
      }
    ]
  })
}

async function handlePlay() {
  if (isPlaying.value) {
    stop()
    isPlaying.value = false
  } else {
    await play(tracksStore.tracks, tracksStore.tempo)
    isPlaying.value = true
  }
}

function addTrack(instrument) {
  tracksStore.addTrack({ instrument })
}

function addNoteToTrack(trackId) {
  tracksStore.addNote(trackId, {})
}

function selectNote(trackId, noteId) {
  tracksStore.selectedNoteId = noteId
}

function deleteSelectedNote() {
  if (!tracksStore.selectedNoteId) return
  for (const track of tracksStore.tracks) {
    const noteIndex = track.notes.findIndex(n => n.id === tracksStore.selectedNoteId)
    if (noteIndex !== -1) {
      tracksStore.deleteNote(track.id, tracksStore.selectedNoteId)
      tracksStore.selectedNoteId = null
      return
    }
  }
}

async function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) {
    try {
      const tracks = await transcribeAudio(file)
      tracks.forEach(track => tracksStore.addTrack(track))
      showUploadModal.value = false
    } catch (err) {
      console.error(err)
    }
  }
}

async function handleDrop(e) {
  const file = e.dataTransfer.files[0]
  if (file) {
    try {
      const tracks = await transcribeAudio(file)
      tracks.forEach(track => tracksStore.addTrack(track))
      showUploadModal.value = false
    } catch (err) {
      console.error(err)
    }
  }
}

async function handleURLSubmit() {
  if (!urlInput.value) return
  try {
    const tracks = await transcribeURL(urlInput.value)
    tracks.forEach(track => tracksStore.addTrack(track))
    showUploadModal.value = false
    urlInput.value = ''
  } catch (err) {
    console.error(err)
  }
}
</script>
