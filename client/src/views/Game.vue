<template>
    <div class="container mx-auto px-4 py-8 text-white">
        <h1 class="text-3xl font-bold mb-6">Room: {{ room.id }}</h1>

        <div class="grid gap-8">
            <PlayerList :players="room.players" :showVotes="showVotes" @revealVotes="revealVotes"
                @resetVotes="resetVotes" />
            <VotingResult v-if="showVotes" :votes="votes" :voteOptions="voteOptions" />
            <VotingArea v-if="!showVotes" :voteOptions="voteOptions" :currentVote="currentVote" :showVotes="showVotes" @vote="vote"/>
        </div>


        <NewPlayerNotification :newPlayer="newPlayerJoined" />

        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>

        <NameSetupModal v-if="showNameSetupModal" @nameSet="handleNameSet" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useGameEngine } from '@/composables/useGameEngine';
import PlayerList from '@/components/PlayerList.vue';
import VotingArea from '@/components/VotingArea.vue';
import VotingResult from '@/components/VotingResult.vue';
import NewPlayerNotification from '@/components/NewPlayerNotification.vue';
import NameSetupModal from '@/components/NameSetupModal.vue';

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
const showNameSetupModal = ref(false);

const votes = computed(() => {
    return room.players.reduce((acc, player) => {
        if (player.vote && player.vote !== 'hidden') {
            acc[player.vote] = (acc[player.vote] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
});

onMounted(async () => {
    await connect(import.meta.env.VITE_API_URL);
    const roomId = route.params.id as string;
    const playerName = localStorage.getItem('playerName') || '';

    if (!playerName) {
        showNameSetupModal.value = true;
    } else {
        await joinRoom(roomId, playerName);
    }
});

const handleNameSet = async (name: string) => {
    localStorage.setItem('playerName', name);
    showNameSetupModal.value = false;
    const roomId = route.params.id as string;
    await joinRoom(roomId, name);
};

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
    const success = await revealVotesAction();
    if (!success) {
        console.error(error.value);
    }
};

const resetVotes = async () => {
    const success = await resetVotesAction();
    if (success) {
        showVotes.value = false;
        currentVote.value = null;
        room.players.forEach(player => player.vote = null);
    } else {
        console.error(error.value);
    }
};
</script>