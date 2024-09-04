<template>
    <div class="flex items-center justify-center min-h-screen bg-primary text-white">
        <h1 class="text-4xl mb-8 sr-only">User Settings</h1>
        <form @submit.prevent="createRoom" class="w-full max-w-md">
            <div class="flex">
                <div class="mb-6">
                    <label for="name" class="block mb-2 sr-only">Your Name</label>
                    <Input v-model="name" id="name" placeholder="Enter your name" required />
                </div>
                <div class="mb-6">
                    <label for="color" class="block mb-2 sr-only">Choose Your Color</label>
                    <input v-model="color" type="color" id="color" class="h-full w-10 rounded-md cursor-pointer" />
                </div>
            </div>
            <Button type="submit" class="w-full" size="lg">
                Continue
                <Loader2 v-if="isLoading" class="ml-2 h-4 w-4 animate-spin" />
            </Button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { io } from 'socket.io-client'
import { useGameEngine } from '@/composables/useGameEngine'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-vue-next'

const router = useRouter()
const { socket, setSocket } = useGameEngine()
const name = ref('')
const color = ref('#ffffff')
const isLoading = ref(false)

onMounted(() => {
    const storedName = localStorage.getItem('userName')
    if (storedName) {
        name.value = storedName
    }
    const storedColor = localStorage.getItem('userColor')
    if (storedColor) {
        color.value = storedColor
    }
})

function createRoom() {
    isLoading.value = true
    localStorage.setItem('userName', name.value)
    localStorage.setItem('userColor', color.value)

    const newSocket = io(import.meta.env.VITE_API_URL, {
        transports: ['websocket']
    })
    setSocket(newSocket)

    socket.value.emit('setUserInfo', { name: name.value, color: color.value })

    socket.value.on('room', (roomId: string) => {
        isLoading.value = false
        router.push({ path: `/game/${roomId}` })
    })

    setTimeout(() => {
        if (isLoading.value) {
            alert("Looks like there's a problem connecting you to the server 😕")
            isLoading.value = false
        }
    }, 5000)
}
</script>