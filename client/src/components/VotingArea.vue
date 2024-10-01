<template>
    <div class="rounded-lg p-4">
        <h2 class="text-2xl font-semibold mb-4 sr-only">Voting</h2>
        <div class="grid grid-cols-9 gap-4 mb-6">
            <div class="bg-secondary rounded-lg p-4 hover:bg-gray-500 duration-300 cursor-pointer flex items-center justify-center h-40 border-2 border-border"
                v-for="option in voteOptions" :key="option" @click="vote(option)"
                :variant="currentVote === option ? 'default' : 'outline'" :disabled="showVotes">
                {{ option }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
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
</script>