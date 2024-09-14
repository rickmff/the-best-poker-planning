<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Active Rooms</h2>
      <div v-if="isLoading" class="flex justify-center items-center h-32">
        <p class="text-gray-500">Loading rooms...</p>
      </div>
      <div v-else-if="hasError" class="text-red-500">
        {{ errorMessage }}
      </div>
      <div v-else-if="rooms.length === 0" class="text-gray-500">
        No active rooms found.
      </div>
      <ul v-else class="space-y-4">
        <li v-for="room in rooms" :key="room.id" class="border-b pb-4 last:border-b-0">
          <h3 class="font-semibold">Room ID: {{ room.id }}</h3>
          <p class="text-sm text-gray-600">Players: {{ room.playerCount }}</p>
          <p class="text-sm text-gray-600">Last Activity: {{ formatDate(room.lastActivity) }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Room {
  id: string
  playerCount: number
  lastActivity: number
}

const rooms = ref<Room[]>([])
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')

async function fetchRooms(): Promise<void> {
  try {
    const response = await fetch('/api/rooms/activated')
    if (!response.ok) {
      throw new Error('Failed to fetch rooms')
    }
    rooms.value = await response.json()
  } catch (error) {
    hasError.value = true
    errorMessage.value = 'An error occurred while fetching rooms. Please try again later.'
    console.error('Error fetching rooms:', error)
  } finally {
    isLoading.value = false
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  fetchRooms()
})
</script>