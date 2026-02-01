import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor to add auth token
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// API endpoints
const api = {
    // Base axios instance
    ...apiClient,

    // Authentication
    login: (email, password) => apiClient.post('/login', { email, password }),
    register: (email, password, nickname) => apiClient.post('/register', { email, password, nickname }),

    // Worldcups
    getWorldcups: (params) => apiClient.get('/worldcups', { params }),
    getWorldcup: (id) => apiClient.get(`/worldcups/${id}`),
    createWorldcup: (data) => apiClient.post('/worldcups', data),
    startWorldcup: (id, count) => apiClient.get(`/worldcups/${id}/start/${count}`),
    getWorldcupRanking: (id) => apiClient.get(`/worldcups/${id}/ranking`),

    // Worldcup Candidates
    getCandidates: (worldcupId) => apiClient.get(`/worldcup_candidates?worldcupId=${worldcupId}`),
    createCandidate: (data) => apiClient.post('/worldcup_candidates', data),
    updateCandidateStats: (id, data) => apiClient.patch(`/worldcup_candidates/${id}`, data),

    // Worldcup Results
    saveWorldcupResult: (data) => apiClient.post('/worldcup_results', data),

    // Quizzes
    getQuizzes: (params) => apiClient.get('/quizzes', { params }),
    getQuiz: (id) => apiClient.get(`/quizzes/${id}`),
    createQuiz: (data) => apiClient.post('/quizzes', data),
    startQuiz: (id) => apiClient.get(`/quizzes/${id}/start`),
    getQuizRanking: (id) => apiClient.get(`/quizzes/${id}/ranking`),

    // Quiz Questions
    getQuestions: (quizId) => apiClient.get(`/quiz_questions?quizId=${quizId}`),
    getQuizQuestions: (quizId) => apiClient.get(`/quiz_questions?quizId=${quizId}`),
    createQuestion: (data) => apiClient.post('/quiz_questions', data),
    updateQuestionStats: (id, data) => apiClient.patch(`/quiz_questions/${id}`, data),

    // Quiz Results
    saveQuizResult: (data) => apiClient.post('/quiz_results', data),

    // Categories
    getCategories: (type) => apiClient.get(`/categories?type=${type}`),

    // File upload
    uploadImage: (file) => {
        const formData = new FormData()
        formData.append('image', file)
        return apiClient.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    uploadMultipleImages: (files) => {
        const formData = new FormData()
        files.forEach(file => {
            formData.append('images', file)
        })
        return apiClient.post('/upload-multiple', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }
}

export default api
