<template>
    <div class="bg-secondary rounded-lg p-4">
        <h2 class="text-2xl font-semibold mb-4">Voting</h2>
        <div class="grid grid-cols-3 gap-4 mb-6">
            <Button v-for="option in voteOptions" :key="option" @click="vote(option)"
                :variant="currentVote === option ? 'default' : 'outline'" :disabled="showVotes">
                {{ option }}
            </Button>
        </div>
        <div class="space-x-4">
            <Button @click="revealVotes" :disabled="showVotes">Reveal Votes</Button>
            <Button @click="resetVotes" :disabled="!showVotes">Reset Votes</Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

defineProps<{
    voteOptions: string[]
    currentVote: string | null
    showVotes: boolean
}>()

const emit = defineEmits<{
    (e: 'vote', option: string): void
    (e: 'revealVotes'): void
    (e: 'resetVotes'): void
}>()

const vote = (option: string) => emit('vote', option)
const revealVotes = () => emit('revealVotes')
const resetVotes = () => emit('resetVotes')
</script>