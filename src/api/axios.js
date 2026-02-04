import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let routerInstance = null;

// Axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor - 인증 토큰 추가
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - 에러 처리
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')

            if (routerInstance){
              routerInstance.push('/login')
            } else{
              window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export const setRouter = (router) => {
  routerInstance = router
}

export default apiClient
