<template>
  <div class="py-20">
    <h1 class="sr-only">The poker planning</h1>
    <div class="flex justify-center h-full w-full box-border">
      <div class="absolute top-8 left-8">
        <div v-if="votingOnName" class="font-sans text-xl">
          <p>
            Voting on: <b>{{ votingOnName }}</b>
          </p>
        </div>
      </div>

      <div
        v-if="!playerHasVoted() && !showVotes"
        class="flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-200 rounded-lg w-80 h-20 text-center cursor-default"
      >
        <span class="text-xl font-bold">Vote</span>
      </div>
      <button
        v-if="playerHasVoted() && !showVotes"
        @click="showVotesClicked()"
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white rounded-full w-80 h-20 text-center hover:bg-blue-600"
      >
        <span>Show votes!</span>
      </button>
      <button
        v-if="showVotes && countdown === 0"
        @click="startNewGame()"
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white rounded-full w-80 h-20 text-center hover:bg-green-600"
      >
        <span class="text-xl font-bold">{{ startGameMessage }}</span>
      </button>
      <button
        v-if="showVotes && countdown > 0"
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-200 rounded-full w-80 h-20 text-center cursor-default"
      >
        <span>{{ countdown }}</span>
      </button>

      <div class="flex flex-wrap justify-center items-center mt-20 space-x-8">
        <div v-for="player in players" :key="player.id" class="flex flex-col items-center">
          <div
            :class="[
              'w-16 h-20 rounded-2xl flex justify-center items-center',
              player.vote ? 'bg-teal-400' : 'bg-gray-200'
            ]"
          >
            <span v-if="showVotes && countdown === 0">{{ player.vote }}</span>
          </div>
          <div class="mt-4 text-center text-2xl text-white capitalize">
            <span>{{ player.name }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="!showVotes || (showVotes && countdown !== 0)"
        class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-wrap justify-center gap-4 max-w-3xl"
      >
        <button
          v-for="vote in ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?']"
          :key="`vote-${vote}`"
          @click="performVote(vote)"
          :disabled="currentVote === vote || countdown > 0"
          :class="[
            'w-16 h-16 rounded-full text-center font-bold text-xl',
            currentVote === vote ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          ]"
        >
          <span>{{ vote }}</span>
        </button>
      </div>
      <div
        v-if="showVotes && countdown === 0"
        class="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4"
      >
        <div class="flex flex-col justify-center items-center gap-2">
          <span class="text-2xl font-bold">Closest: {{ getClosest() }}</span>
          <span class="text-lg opacity-80">Average: {{ getAverage() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type Player from '@/interfaces/player'
import { io } from 'socket.io-client'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useTickets } from '@/composables/useTickets'
import { useGameEngine } from '@/composables/useGameEngine'

let showInstallPwa = ref(false)
const modal = ref(true)
const name = ref('')
const { votingOnName, tickets } = useTickets()
const { socket, setSocket, players, showVotes, countdown, currentVote } = useGameEngine()
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  showInstallPwa.value = true
})

onMounted(() => {
  if (joiningAGame()) {
    const route = useRoute()
    const newSocket = io(import.meta.env.VITE_APP_API_URL, {
      query: {
        roomId: route.params.id
      }
    })
    setSocket(newSocket)
  }

  const storedName = localStorage.getItem('name')
  if (storedName) {
    enteredName(storedName)
  }
})

const startGameMessage = computed(() => {
  if (!tickets.value || tickets.value.every((t: any) => t.score)) {
    return 'Start new game!'
  } else {
    return 'Vote next issue!'
  }
})
function showVotesClicked() {
  socket.value.emit('show')
}

function performVote(vote: string) {
  socket.value.emit('vote', vote)
  currentVote.value = vote
}

function startNewGame() {
  socket.value.emit('restart')
}

function emitName(name: string) {
  socket.value.emit('name', name)
}

function enteredName(updatedName: string) {
  name.value = updatedName
  emitName(updatedName)
  localStorage.setItem('name', updatedName)
  modal.value = false
}

function playerHasVoted() {
  return players.value.filter((p: Player) => p.vote !== null && p.vote !== undefined).length > 0
}

const average = computed(() => {
  let count = 0
  let total = 0
  for (const player of players.value) {
    if (player.vote && player.vote !== '?') {
      total += parseInt(player.vote)
      count++
    }
  }
  return total / count
})

function getAverage() {
  return average.value.toFixed(1).replace(/\.0+$/, '')
}

function getClosest() {
  const fib = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
  let closest = 0
  let smallestDiff = Number.MAX_VALUE
  for (const number of fib) {
    const difference = Math.abs(number - average.value)
    if (difference < smallestDiff) {
      smallestDiff = difference
      closest = number
    }
  }
  return closest
}

function joiningAGame() {
  const currentState = socket.value
  return (
    currentState && Object.keys(currentState).length === 0 && currentState.constructor === Object
  )
}
</script>
