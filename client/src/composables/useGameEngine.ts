import { ref, reactive } from 'vue'
import { io, Socket } from 'socket.io-client'
import type Game from '@/interfaces/game'
import type Player from '@/interfaces/player'

export function useGameEngine() {
  const socket = ref<Socket | null>(null)
  const room = reactive<Game>({ id: '', players: [], tickets: [] })
  const showVotes = ref(false)
  const currentVote = ref<string | null>(null)
  const error = ref<string | null>(null)

  const connect = (url: string) => {
    socket.value = io(url, {
      /* path: '/api/socket.io/' , */ transports: ['websocket']
    })
    setupSocketHandlers()
  }

  const setupSocketHandlers = () => {
    if (!socket.value) return

    socket.value.on('playerJoined', ({ player }: { player: Player }) => {
      const existingPlayerIndex = room.players.findIndex((p) => p.id === player.id)
      if (existingPlayerIndex !== -1) {
        room.players[existingPlayerIndex] = player
      } else {
        room.players.push(player)
      }
    })

    socket.value.on('playerLeft', ({ playerId }: { playerId: string }) => {
      const index = room.players.findIndex((p) => p.id === playerId)
      if (index !== -1) {
        room.players.splice(index, 1)
      }
    })

    socket.value.on('playerVoted', ({ playerId }: { playerId: string }) => {
      const player = room.players.find((p) => p.id === playerId)
      if (player) {
        player.vote = 'hidden'
      }
    })

    socket.value.on('votesRevealed', ({ players }: { players: Player[] }) => {
      room.players = players
      showVotes.value = true
    })

    socket.value.on('votesReset', () => {
      room.players.forEach((player) => {
        player.vote = null
      })
      showVotes.value = false
      currentVote.value = null
    })
  }

  const createRoom = async (roomId: string): Promise<boolean> => {
    if (!socket.value) return false

    return new Promise((resolve) => {
      socket.value?.emit(
        'createRoom',
        { id: roomId },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            room.id = roomId
            resolve(true)
          } else {
            error.value = response.error || 'Failed to create room'
            resolve(false)
          }
        }
      )
    })
  }

  const joinRoom = async (roomId: string, playerName: string): Promise<boolean> => {
    if (!socket.value) return false

    return new Promise((resolve) => {
      socket.value?.emit(
        'joinRoom',
        { id: roomId, name: playerName },
        (response: { success: boolean; error?: string; player?: Player }) => {
          if (response.success) {
            room.id = roomId
            if (response.player) {
              const existingPlayerIndex = room.players.findIndex(
                (p) => p.id === response.player?.id
              )
              if (existingPlayerIndex !== -1) {
                room.players[existingPlayerIndex] = response.player
              } else {
                room.players.push(response.player)
              }
            }
            resolve(true)
          } else {
            error.value = response.error || 'Failed to join room'
            resolve(false)
          }
        }
      )
    })
  }

  const vote = async (voteValue: string): Promise<boolean> => {
    if (!socket.value) return false

    return new Promise((resolve) => {
      socket.value?.emit('vote', voteValue, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          currentVote.value = voteValue
          const currentPlayer = room.players.find((p) => p.id === socket.value?.id)
          if (currentPlayer) {
            currentPlayer.vote = 'hidden'
          }
          resolve(true)
        } else {
          error.value = response.error || 'Failed to submit vote'
          resolve(false)
        }
      })
    })
  }

  const revealVotes = async (): Promise<boolean> => {
    if (!socket.value) return false

    return new Promise((resolve) => {
      socket.value?.emit(
        'revealVotes',
        { id: room.id },
        (response: { success: boolean; error?: string; players?: Player[] }) => {
          if (response.success && response.players) {
            room.players = response.players
            showVotes.value = true
            resolve(true)
          } else {
            error.value = response.error || 'Failed to reveal votes'
            resolve(false)
          }
        }
      )
    })
  }

  const resetVotes = async (): Promise<boolean> => {
    if (!socket.value) return false
  
    return new Promise((resolve) => {
      socket.value?.emit(
        'resetVotes',
        { id: room.id },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            room.players.forEach((player) => {
              player.vote = null
            })
            showVotes.value = false
            currentVote.value = null
            resolve(true)
          } else {
            error.value = response.error || 'Failed to reset votes'
            resolve(false)
          }
        }
      )
    })
  }

  return {
    connect,
    createRoom,
    joinRoom,
    vote,
    revealVotes,
    resetVotes,
    room,
    showVotes,
    currentVote,
    error
  }
}
