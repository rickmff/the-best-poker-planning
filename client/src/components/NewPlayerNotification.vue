<template>
    <div v-if="newPlayer" class="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
        {{ newPlayer }} has joined the room!
    </div>
</template>

<script setup lang="ts">
defineProps<{
    newPlayer: string | null
}>()
</script>