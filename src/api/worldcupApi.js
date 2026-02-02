import apiClient from './axios'

/**
 * 월드컵 관련 API
 */
export const worldcupApi = {
    /**
     * 월드컵 목록 조회
     * @param {Object} params - 쿼리 파라미터
     * @returns {Promise}
     */
    getWorldcups(params) {
        return apiClient.get('/worldcups', { params })
    },

    /**
     * 월드컵 상세  조회
     * @param {number|string} id - 월드컵 ID
     * @returns {Promise}
     */
    getWorldcup(id) {
        return apiClient.get(`/worldcups/${id}`)
    },

    /**
     * 월드컵 생성
     * @param {Object} data - 월드컵 데이터
     * @returns {Promise}
     */
    createWorldcup(data) {
        return apiClient.post('/worldcups', data)
    },

    /**
     * 월드컵 시작
     * @param {number|string} id - 월드컵 ID
     * @param {number} count - 라운드 수
     * @returns {Promise}
     */
    startWorldcup(id, count) {
        return apiClient.get(`/worldcups/${id}/start/${count}`)
    },

    /**
     * 월드컵 랭킹 조회
     * @param {number|string} id - 월드컵 ID
     * @returns {Promise}
     */
    getWorldcupRanking(id) {
        return apiClient.get(`/worldcups/${id}/ranking`)
    },

    /**
     * 후보 목록 조회
     * @param {number|string} worldcupId - 월드컵 ID
     * @returns {Promise}
     */
    getCandidates(worldcupId) {
        return apiClient.get(`/worldcup_candidates?worldcupId=${worldcupId}`)
    },

    /**
     * 후보 생성
     * @param {Object} data - 후보 데이터
     * @returns {Promise}
     */
    createCandidate(data) {
        return apiClient.post('/worldcup_candidates', data)
    },

    /**
     * 후보 통계 업데이트
     * @param {number|string} id - 후보 ID
     * @param {Object} data - 업데이트 데이터
     * @returns {Promise}
     */
    updateCandidateStats(id, data) {
        return apiClient.patch(`/worldcup_candidates/${id}`, data)
    },

    /**
     * 월드컵 결과 저장
     * @param {Object} data - 결과 데이터
     * @returns {Promise}
     */
    saveWorldcupResult(data) {
        return apiClient.post('/worldcup_results', data)
    }
}
