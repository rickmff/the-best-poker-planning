<template>
    <div class="absolute top-0 left-2/4 font-mono -translate-x-1/2 flex flex-col items-center justify-center h-screen text-white">
        <h1 class="relative text-7xl mb-10">
            <span class="absolute bottom-5 -left-20 text-3xl text-white/50">The</span> Poker planning
        </h1>

        <div v-if="!showJoinForm" class="flex flex-col gap-4">
            <Button variant="outline" size="xl" class="bg-secondary border-border rounded-full hover:bg-secondary/80"
                @click="createRoom">
                <span v-if="!isLoading" class="text-3xl text-white/80">Create room</span>
                <Loader2 v-else class="w-8 h-8 animate-spin" />
            </Button>
            <Button variant="outline" size="xl" class="bg-secondary border-border rounded-full hover:bg-secondary/80"
                @click="showJoinForm = true">
                <span class="text-3xl text-white/80">Join room</span>
            </Button>
        </div>

        <form v-else @submit.prevent="joinRoom" class="flex flex-col gap-4">
            <Input v-model="roomId" placeholder="Room ID" class="text-xl p-2 rounded" />
            <Input v-model="playerName" placeholder="Your Name" class="text-xl p-2 rounded" />
            <Button type="submit" variant="outline" size="xl"
                class="bg-secondary border-border rounded-full hover:bg-secondary/80">
                <span v-if="!isLoading" class="text-3xl text-white/80">Join</span>
                <Loader2 v-else class="w-8 h-8 animate-spin" />
            </Button>
        </form>

        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameEngine } from '@/composables/useGameEngine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-vue-next';

const router = useRouter();
const { connect, createRoom: createGameRoom, joinRoom: joinGameRoom, error: gameError } = useGameEngine();

const showJoinForm = ref(false);
const roomId = ref('');
const playerName = ref('');
const isLoading = ref(false);
const error = computed(() => gameError.value);

connect(import.meta.env.VITE_API_URL);

const createRoom = async () => {
    isLoading.value = true;
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const success = await createGameRoom(roomId);
    isLoading.value = false;
    if (success) {
        router.push({ name: 'Game', params: { id: roomId } });
    }
};

const joinRoom = async () => {
    if (!roomId.value || !playerName.value) {
        console.error(error);
        return;
    }
    isLoading.value = true;
    const success = await joinGameRoom(roomId.value, playerName.value);
    isLoading.value = false;
    if (success) {
        router.push({ name: 'Game', params: { id: roomId.value } });
    }
};
</script>