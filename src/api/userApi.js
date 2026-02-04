import apiClient from "@/api/axios.js";

// 사용자 정보 관련 API

export const userApi = {
  /**
   * 내 정보 조회
   * @returns {Promise} 사용자 정보 (이메일, 닉네임, ID 등)
   */
  getMyInfo() {
    return apiClient.get('/users/me')
  },

  /**
   * 닉네임 중복 체크
   * @param {string} nickname - 체크할 닉네임
   * @returns {Promise} { available: boolean }
   */
  checkNickname(nickname) {
    return apiClient.get('/users/check-nickname', {
      params: { nickname }
    })
  },

  /**
   * 닉네임 변경
   * @param {string} nickname - 새 닉네임
   * @returns {Promise} 업데이트된 사용자 정보
   */
  updateNickname(nickname) {
    return apiClient.patch('/users/me', { nickname })
  }
}