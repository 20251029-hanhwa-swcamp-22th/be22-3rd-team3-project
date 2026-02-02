import apiClient from './axios'

/**
 * 퀴즈 관련 API
 */
export const quizApi = {
    /**
     * 퀴즈 목록 조회
     * @param {Object} params - 쿼리 파라미터
     * @returns {Promise}
     */
    getQuizzes(params) {
        return apiClient.get('/quizzes', { params })
    },

    /**
     * 퀴즈 상세 조회
     * @param {number|string} id - 퀴즈 ID
     * @returns {Promise}
     */
    getQuiz(id) {
        return apiClient.get(`/quizzes/${id}`)
    },

    /**
     * 퀴즈 생성
     * @param {Object} data - 퀴즈 데이터
     * @returns {Promise}
     */
    createQuiz(data) {
        return apiClient.post('/quizzes', data)
    },

    /**
     * 퀴즈 시작
     * @param {number|string} id - 퀴즈 ID
     * @returns {Promise}
     */
    startQuiz(id) {
        return apiClient.get(`/quizzes/${id}/start`)
    },

    /**
     * 퀴즈 랭킹 조회
     * @param {number|string} id - 퀴즈 ID
     * @returns {Promise}
     */
    getQuizRanking(id) {
        return apiClient.get(`/quizzes/${id}/ranking`)
    },

    /**
     * 퀴즈 문제 목록 조회
     * @param {number|string} quizId - 퀴즈 ID
     * @returns {Promise}
     */
    getQuestions(quizId) {
        return apiClient.get(`/quiz_questions?quizId=${quizId}`)
    },

    /**
     * 퀴즈 문제 목록 조회 (alias)
     * @param {number|string} quizId - 퀴즈 ID
     * @returns {Promise}
     */
    getQuizQuestions(quizId) {
        return apiClient.get(`/quiz_questions?quizId=${quizId}`)
    },

    /**
     * 퀴즈 문제 생성
     * @param {Object} data - 문제 데이터
     * @returns {Promise}
     */
    createQuestion(data) {
        return apiClient.post('/quiz_questions', data)
    },

    /**
     * 문제 통계 업데이트
     * @param {number|string} id - 문제 ID
     * @param {Object} data - 업데이트 데이터
     * @returns {Promise}
     */
    updateQuestionStats(id, data) {
        return apiClient.patch(`/quiz_questions/${id}`, data)
    },

    /**
     * 퀴즈 결과 저장
     * @param {Object} data - 결과 데이터
     * @returns {Promise}
     */
    saveQuizResult(data) {
        return apiClient.post('/quiz_results', data)
    }
}
