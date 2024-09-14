<template>
  <div class="container mx-auto px-4 py-8 text-white">
    <h1 class="text-3xl font-bold mb-6">Room: {{ room.id }}</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 class="text-2xl font-semibold mb-4">Players</h2>
        <ul class="space-y-2">
          <li v-for="player in room.players" :key="player.id" class="flex items-center justify-between">
            <span>{{ player.name }}</span>
            <span v-if="showVotes">{{ player.vote || 'No vote' }}</span>
            <span v-else-if="player.vote">Voted</span>
            <span v-else>Not voted</span>
          </li>
        </ul>
      </div>

      <div>
        <h2 class="text-2xl font-semibold mb-4">Voting</h2>
        <div class="grid grid-cols-3 gap-4 mb-6 text-black">
          <Button v-for="option in voteOptions" :key="option" @click="vote(option)"
            :variant="currentVote === option ? 'default' : 'outline'"
            :disabled="showVotes">
            {{ option }}
          </Button>
        </div>
        <div class="space-x-4">
          <Button @click="revealVotes" :disabled="showVotes">Reveal Votes</Button>
          <Button @click="resetVotes" :disabled="!showVotes">Reset Votes</Button>
        </div>
      </div>
    </div>

    <div v-if="newPlayerJoined" class="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
      {{ newPlayerJoined }} has joined the room!
    </div>

    <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useGameEngine } from '@/composables/useGameEngine';
import { Button } from '@/components/ui/button';

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
  await connect(import.meta.env.BASE_URL+'/api');
  console.log("import.meta.url+'/api'", import.meta.env.BASE_URL+'/api')
  const roomId = route.params.id as string;
  const playerName = localStorage.getItem('playerName') || 'Anonymous';
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
</script>
