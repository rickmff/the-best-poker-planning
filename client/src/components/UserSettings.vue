<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-secondary rounded p-5 w-full max-w-md">
        <h2 class="text-2xl mb-4 text-white">Enter Your Details</h2>
        <form @submit.prevent="saveUserInfo" class="w-full">
          <div class="flex gap-3">
            <div class="mb-6 flex-grow">
              <label for="name" class="block mb-2 sr-only">Your Name</label>
              <Input v-model="name" id="name" placeholder="Enter your name" required />
            </div>
            <div class="mb-6">
              <label for="color" class="block mb-2 sr-only">Choose Your Color</label>
              <input v-model="color" type="color" id="color" class="h-full w-10 rounded-md cursor-pointer" />
            </div>
          </div>
          <Button type="submit" class="w-full" size="lg">
            Continue
            <Loader2 v-if="isLoading" class="ml-2 h-4 w-4 animate-spin" />
          </Button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Loader2 } from 'lucide-vue-next'
  
  const name = ref('')
  const color = ref('#ffffff')
  const isLoading = ref(false)
  
  const emit = defineEmits<{
    (e: 'save', name: string, color: string): void
  }>()
  
  function saveUserInfo() {
    isLoading.value = true
    emit('save', name.value, color.value)
  }
  </script>