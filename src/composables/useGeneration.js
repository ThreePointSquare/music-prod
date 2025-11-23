import { ref } from 'vue'
import axios from 'axios'

export function useGeneration() {
  const isGenerating = ref(false)
  const error = ref(null)

  async function generateMusic(prompt, options = {}) {
    isGenerating.value = true
    error.value = null

    try {
      const response = await axios.post('/api/generate-music', {
        prompt,
        style: options.style,
        tempo: options.tempo
      })

      return response.data.composition
    } catch (err) {
      error.value = err.response?.data?.error || 'Generation failed'
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  return { isGenerating, error, generateMusic }
}
