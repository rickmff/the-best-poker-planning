<template>
    <div class="container mx-auto px-4 py-8 text-white">
        <h1 class="text-3xl font-bold mb-6">Room: {{ room.id }}</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PlayerList :players="room.players" :showVotes="showVotes" />
            <VotingArea
                :voteOptions="voteOptions"
                :currentVote="currentVote"
                :showVotes="showVotes"
                @vote="vote"
                @revealVotes="revealVotes"
                @resetVotes="resetVotes"
            />
        </div>

        <TicketList :tickets="room.tickets" @voteOn="voteOnTicket" />

        <NewPlayerNotification :newPlayer="newPlayerJoined" />

        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useGameEngine } from '@/composables/useGameEngine';
import PlayerList from '@/components/PlayerList.vue';
import VotingArea from '@/components/VotingArea.vue';
import TicketList from '@/components/TicketList.vue';
import NewPlayerNotification from '@/components/NewPlayerNotification.vue';

const route = useRoute();
const {
    connect,
    joinRoom,
    room,
    showVotes,
    currentVote,
    error,
    vote: submitVote,
    revealVotes: revealVotesAction,
    resetVotes: resetVotesAction
} = useGameEngine();

const voteOptions = ref(['0', '1', '2', '3', '5', '8', '13', '21', '?']);
const newPlayerJoined = ref<string | null>(null);

onMounted(async () => {
    await connect(import.meta.env.VITE_API_URL);
    const roomId = route.params.id as string;
    const playerName = localStorage.getItem('playerName') || '';
    await joinRoom(roomId, playerName);
});

watch(() => room.players, (newPlayers, oldPlayers) => {
    if (newPlayers.length > oldPlayers.length) {
        const newPlayer = newPlayers[newPlayers.length - 1];
        if (newPlayer.name !== localStorage.getItem('playerName')) {
            newPlayerJoined.value = newPlayer.name;
            setTimeout(() => {
                newPlayerJoined.value = null;
            }, 5000);
        }
    }
}, { deep: true });

const vote = async (option: string) => {
    if (showVotes.value) return;
    await submitVote(option);
};

const revealVotes = async () => {
    await revealVotesAction();
};

const resetVotes = async () => {
    await resetVotesAction();
};

const voteOnTicket = (ticketId: string) => {
    // Implement voting on a specific ticket
};
</script>
