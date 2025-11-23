import { createRouter, createWebHistory } from 'vue-router'
import TiptapEditor from '@/components/TiptapEditor.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: TiptapEditor,
    },
  ],
})

export default router
