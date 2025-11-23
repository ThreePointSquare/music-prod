import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const zoom = ref(1)
  const showMixer = ref(true)
  const mobileMenuOpen = ref(false)

  function setZoom(level) {
    zoom.value = Math.max(0.5, Math.min(3, level))
  }

  function toggleMixer() {
    showMixer.value = !showMixer.value
  }

  function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  return {
    zoom,
    showMixer,
    mobileMenuOpen,
    setZoom,
    toggleMixer,
    toggleMobileMenu
  }
})
