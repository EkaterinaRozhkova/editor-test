import { createRouter, createWebHistory } from 'vue-router'
import BaseEditor from '@/components/BaseEditor.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: BaseEditor,
    },
  ],
})

export default router
