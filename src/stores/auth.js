import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token') || null)

    const isAuthenticated = computed(() => !!token.value)

    async function login(email, password) {
        try {
            const response = await api.post('/login', { email, password })
            token.value = response.data.accessToken
            user.value = response.data.user
            localStorage.setItem('token', token.value)
            localStorage.setItem('user', JSON.stringify(user.value))
            return { success: true }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data || '로그인에 실패했습니다.'
            }
        }
    }

    async function register(email, password, nickname) {
        try {
            const response = await api.post('/register', {
                email,
                password,
                nickname
            })
            token.value = response.data.accessToken
            user.value = response.data.user
            localStorage.setItem('token', token.value)
            localStorage.setItem('user', JSON.stringify(user.value))
            return { success: true }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data || '회원가입에 실패했습니다.'
            }
        }
    }

    function logout() {
        token.value = null
        user.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    function initAuth() {
        const savedToken = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')
        if (savedToken && savedUser) {
            token.value = savedToken
            user.value = JSON.parse(savedUser)
        }
    }

    return {
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout,
        initAuth
    }
})
