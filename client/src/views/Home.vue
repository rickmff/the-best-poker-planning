<template>
  <canvas
    ref="canvasRef"
    :width="canvasSize.width"
    :height="canvasSize.height"
    class="particle-canvas"
  />
  <div
    class="absolute top-0 left-2/4 font-mono -translate-x-1/2 flex flex-col items-center justify-center h-screen text-white"
  >
    <h1 class="relative text-7xl mb-10">
      <span class="absolute bottom-5 -left-20 text-3xl text-white/50">The</span> Poker planning
    </h1>

    <Button
      variant="outline"
      size="xl"
      class="bg-secondary border-border rounded-full hover:bg-secondary/80"
      @click="startGame()"
    >
      <span v-if="!clickedStart" class="text-3xl text-white/80">Create room</span>
      <Loader2 v-if="clickedStart" class="w-8 h-8 animate-spin" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
import { io } from 'socket.io-client'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useGameEngine } from '@/composables/useGameEngine'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'

const { socket, setSocket } = useGameEngine()
const clickedStart = ref(false)
const hasStarted = ref(false)

function startGame() {
  clickedStart.value = true
  setTimeout(() => {
    if (!hasStarted.value) {
      alert("Looks like there's a problem connecting you to the server 😕")
    }
  }, 5000)
  const newSocket = io(import.meta.env.VITE_APP_API_URL)
  setSocket(newSocket)
  socket.value.on('room', (roomId: string) => {
    hasStarted.value = true
    router.push({ path: `/game/${roomId}` })
  })
}
class Particle {
  private x: number = 0
  private y: number = 0
  private speed: number = 0.1
  private opacity: number = 1
  private fadeDelay: number
  private fadeStart: number
  private fadingOut: boolean

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D
  ) {
    this.reset()
    this.y = Math.random() * canvas.height
    this.fadeDelay = Math.random() * 600 + 100
    this.fadeStart = Date.now() + this.fadeDelay
    this.fadingOut = false
  }

  reset(): void {
    this.x = Math.random() * this.canvas.width
    this.y = Math.random() * this.canvas.height
    this.speed = Math.random() / 5 + 0.1
    this.opacity = 1
    this.fadeDelay = Math.random() * 600 + 100
    this.fadeStart = Date.now() + this.fadeDelay
    this.fadingOut = false
  }

  update(): void {
    this.y -= this.speed
    if (this.y < 0) {
      this.reset()
    }
    if (!this.fadingOut && Date.now() > this.fadeStart) {
      this.fadingOut = true
    }
    if (this.fadingOut) {
      this.opacity -= 0.008
      if (this.opacity <= 0) {
        this.reset()
      }
    }
  }

  draw(): void {
    this.ctx.fillStyle = `rgba(${255 - Math.random() * 255}, 255, 255, ${this.opacity})`
    this.ctx.fillRect(this.x, this.y, 0.4, Math.random() * 2 + 1)
  }
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasSize = ref({
  width: window.innerWidth,
  height: window.innerHeight
})

const particleCount = computed(() =>
  Math.floor((canvasSize.value.width * canvasSize.value.height) / 4000)
)

let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let animationFrameId: number | null = null

const updateCanvasSize = (): void => {
  canvasSize.value = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  if (canvasRef.value) {
    canvasRef.value.width = canvasSize.value.width
    canvasRef.value.height = canvasSize.value.height
  }
}

const initParticles = (): void => {
  particles = []
  if (canvasRef.value && ctx) {
    for (let i = 0; i < particleCount.value; i++) {
      particles.push(new Particle(canvasRef.value, ctx))
    }
  }
}

const animate = (): void => {
  if (ctx && canvasRef.value) {
    ctx.clearRect(0, 0, canvasSize.value.width, canvasSize.value.height)
    particles.forEach((particle) => {
      particle.update()
      particle.draw()
    })
    animationFrameId = requestAnimationFrame(animate)
  }
}

const onResize = (): void => {
  updateCanvasSize()
  initParticles()
}

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      updateCanvasSize()
      initParticles()
      animate()
      window.addEventListener('resize', onResize)
    }
  }
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped lang="scss">
@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@for $i from 1 through 6 {
  .word:nth-child(#{$i}) {
    filter: blur(20px);
    opacity: 0;
    animation:
      1.5s ease-out #{$i * 0.2 + 1}s forwards fadingIn,
      1.5s ease-out #{$i * -0.2 + 5}s forwards fadingOut;
  }
}

@keyframes fadingIn {
  0% {
    filter: blur(20px);
    opacity: 0;
  }
  100% {
    filter: blur(0px);
    opacity: 0.9;
  }
}

@keyframes fadingOut {
  0% {
    filter: blur(0px);
    opacity: 0.9;
  }
  100% {
    filter: blur(20px);
    opacity: 0;
  }
}
</style>
