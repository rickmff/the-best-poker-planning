<template>
  <div class="flex items-center justify-center w-full h-screen">
    <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
      <h2 class="mb-6 text-2xl font-semibold text-gray-600">{{ 'Invite your team' }}</h2>
      <div class="flex flex-col space-y-4">
        <template v-if="!showQRCode">
          <Button
            @click="showQR"
          >
            QR Code
          </Button>
          <Button
            @click="copyLink"
          >
            Copy to Clipboard
          </Button>
        </template>
        <div v-else class="flex justify-center">
          <qrcode-vue :value="value" :level="level" :render-as="renderAs" />
        </div>
        <Button
          @click="close"
        >
          Close
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import QrcodeVue from 'qrcode.vue'

const props = defineProps<{
  initialValue?: string
}>()

const emit = defineEmits<{
  (e: 'dismissModal'): void
}>()

const value = ref(props.initialValue || '')
const showQRCode = ref(false)
const level = ref<'L' | 'M' | 'Q' | 'H'>('H')
const renderAs = ref<'canvas' | 'svg'>('svg')

const showQR = () => {
  value.value = window.location.href
  showQRCode.value = true
}

const close = () => {
  showQRCode.value = false
  emit('dismissModal')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    close()
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}
</script>