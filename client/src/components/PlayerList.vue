<template>
    <div class="rounded-lg p-4 border border-border">
        <h2 class="text-2xl font-semibold mb-4 text-center sr-only">Players</h2>
        <ul class="grid grid-cols-6 gap-2">
            <li v-for="player in players" :key="player.id"
                class="flex flex-col items-center border-border rounded-lg p-2 border">
                <span>{{ player.name }}</span>
                <div class="flex items-center justify-center bg-secondary rounded-lg h-40 w-32 m-2">
                    <span v-if="showVotes" class="text-xl">{{ player.vote || 'No vote' }}</span>
                    <span v-else-if="player.vote === 'hidden'">Voted</span>
                    <span v-else>Voting...</span>
                </div>
            </li>
        </ul>
    </div>
    <div class="space-x-4 mx-4">
        <Button @click="revealVotes" :disabled="showVotes">Reveal Votes</Button>
        <Button @click="resetVotes" :disabled="!showVotes">Reset Votes</Button>
    </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type Player from '@/interfaces/player'

defineProps<{
    players: Player[]
    showVotes: boolean
}>()

const emit = defineEmits<{
    (e: 'revealVotes'): void
    (e: 'resetVotes'): void
}>()

const revealVotes = () => emit('revealVotes')
const resetVotes = () => emit('resetVotes')
</script>