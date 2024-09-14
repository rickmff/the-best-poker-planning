import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Game from '@/views/Game.vue'
import NotFound from '@/views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Planning Poker'
    }
  },
  {
    path: '/game/:id',
    name: 'Game',
    component: Game,
    meta: {
      title: 'Planning Poker'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin.vue'),
    meta: {
      title: 'Planning Poker Admin'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '404 Not Found'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.url),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || 'Planning Poker'
  next()
})

export default router