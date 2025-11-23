import { ref } from 'vue'
import axios from 'axios'

export function useTranscription() {
  const isTranscribing = ref(false)
  const progress = ref(0)
  const error = ref(null)

  async function transcribeAudio(file) {
    isTranscribing.value = true
    error.value = null
    progress.value = 0

    try {
      const formData = new FormData()
      formData.append('audioFile', file)

      const response = await axios.post('/api/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      })

      return response.data.tracks
    } catch (err) {
      error.value = err.response?.data?.error || 'Transcription failed'
      throw err
    } finally {
      isTranscribing.value = false
    }
  }

  async function transcribeURL(url) {
    isTranscribing.value = true
    error.value = null

    try {
      const response = await axios.post('/api/transcribe', { audioUrl: url })
      return response.data.tracks
    } catch (err) {
      error.value = err.response?.data?.error || 'Transcription failed'
      throw err
    } finally {
      isTranscribing.value = false
    }
  }

  return { isTranscribing, progress, error, transcribeAudio, transcribeURL }
}
