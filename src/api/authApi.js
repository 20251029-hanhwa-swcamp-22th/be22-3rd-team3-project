import apiClient from './axios'

/**
 * 인증 관련 API
 */
export const authApi = {
    /**
     * 로그인
     * @param {string} email - 이메일
     * @param {string} password - 비밀번호
     * @returns {Promise}
     */
    login(email, password) {
        return apiClient.post('/login', { email, password })
    },

    /**
     * 회원가입
     * @param {string} email - 이메일
     * @param {string} password - 비밀번호
     * @param {string} nickname - 닉네임
     * @returns {Promise}
     */
    register(email, password, nickname) {
        return apiClient.post('/register', { email, password, nickname })
    }
}
