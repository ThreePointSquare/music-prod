<template>
  <div class="min-h-screen">
    <nav class="bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Volume2 class="w-6 h-6" />
        </div>
        <h1 class="text-xl font-bold">ProStudio DAW</h1>
      </div>
    </nav>

    <Studio />
  </div>
</template>

<script setup>
import { Volume2 } from 'lucide-vue-next'
import Studio from './views/Studio.vue'
</script>
