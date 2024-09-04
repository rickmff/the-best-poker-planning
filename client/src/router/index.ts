import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Game from '@/views/Game.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        auth: false,
        title: 'Planning Poker'
      }
    },
    {
      path: '/user-settings',
      name: 'UserSettings',
      component: () => import('@/views/UserSettings.vue'),
      meta: {
        auth: false,
        title: 'User Settings'
      }
    },
    {
      path: '/game/:id',
      name: 'Game',
      component: Game,
      meta: {
        auth: false,
        title: 'Planning Poker'
      }
    }
  ]
});

export default router
