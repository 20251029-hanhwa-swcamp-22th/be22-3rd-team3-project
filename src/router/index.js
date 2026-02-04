import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/auth/Login.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/auth/Register.vue')
    },
    // Worldcup routes
    {
        path: '/worldcup',
        name: 'WorldcupList',
        component: () => import('../views/worldcup/WorldcupList.vue')
    },
    {
        path: '/worldcup/:id',
        name: 'WorldcupDetail',
        component: () => import('../views/worldcup/WorldcupDetail.vue')
    },
    {
        path: '/worldcup/:id/play',
        name: 'WorldcupGame',
        component: () => import('../views/worldcup/WorldcupGame.vue')
    },
    {
        path: '/worldcup/:id/result',
        name: 'WorldcupResult',
        component: () => import('../views/worldcup/WorldcupResult.vue')
    },
    {
        path: '/worldcup/ranking',
        name: 'WorldcupRanking',
        component: () => import('../views/worldcup/WorldcupRanking.vue')
    },
    {
        path: '/worldcup/create',
        name: 'WorldcupCreate',
        component: () => import('../views/create/WorldcupCreate.vue'),
        meta: { requiresAuth: true }
    },
    // Quiz routes
    {
        path: '/quiz',
        name: 'QuizList',
        component: () => import('../views/quiz/QuizList.vue')
    },
    {
        path: '/quiz/:id/play',
        name: 'QuizGame',
        component: () => import('../views/quiz/QuizGame.vue')
    },
    {
        path: '/quiz/:id/result',
        name: 'QuizResult',
        component: () => import('../views/quiz/QuizResult.vue')
    },
    {
        path: '/quiz/:id/ranking',
        name: 'QuizRanking',
        component: () => import('../views/quiz/QuizRanking.vue')
    },
    {
        path: '/quiz/create',
        name: 'QuizCreate',
        component: () => import('../views/create/QuizCreate.vue'),
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'Login', query: { redirect: to.fullPath } })
    } else {
        next()
    }
})

export default router
