<template>
    <div class="bg-secondary rounded-lg p-4">
      <h2 class="text-2xl font-semibold mb-4">Players</h2>
      <ul class="space-y-2">
        <li v-for="player in players" :key="player.id" class="flex items-center justify-between">
          <span>{{ player.name }}</span>
          <span v-if="showVotes">{{ player.vote || 'No vote' }}</span>
          <span v-else-if="player.vote">Voted</span>
          <span v-else>Not voted</span>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup lang="ts">
  import type Player from '@/interfaces/player'
  
  defineProps<{
    players: Player[]
    showVotes: boolean
  }>()
  </script>