<template>
    <div class="mt-8 bg-secondary rounded-lg p-4">
        <h2 class="text-2xl font-semibold mb-4">Tickets</h2>
        <ul class="space-y-2">
            <li v-for="ticket in tickets" :key="ticket.id" class="flex items-center justify-between">
                <span>{{ ticket.name }}</span>
                <div>
                    <span v-if="ticket.score">Score: {{ ticket.score }}</span>
                    <Button @click="voteOn(ticket.id)" :variant="ticket.votingOn ? 'default' : 'outline'">
                        {{ ticket.votingOn ? 'Voting' : 'Vote' }}
                    </Button>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import type Ticket from '@/interfaces/tickets'
import { Button } from '@/components/ui/button'

defineProps<{
    tickets: Ticket[]
}>()

const emit = defineEmits<{
    (e: 'voteOn', ticketId: string): void
}>()

const voteOn = (ticketId: string) => emit('voteOn', ticketId)
</script>