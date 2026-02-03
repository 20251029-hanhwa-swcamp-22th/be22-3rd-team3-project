import apiClient from './axios'

/**
 * 인증 관련 API
 * 로그인, 회원가입 등 사용자 인증과 관련된 서버 통신을 담당하는 객체입니다.
 */
export const authApi = {
    /**
     * 로그인 요청을 보냅니다.
     * 사용자가 입력한 이메일과 비밀번호를 서버로 전송하여 액세스 토큰을 받아옵니다.
     * 
     * @param {string} email - 사용자의 이메일 주소
     * @param {string} password - 사용자의 비밀번호
     * @returns {Promise} 서버의 응답을 담은 Promise 객체 (성공 시 토큰 포함)
     */
    login(email, password) {
        // apiClient.post: HTTP POST 요청을 보냅니다.
        // 첫 번째 인자 '/login': 요청을 보낼 API 엔드포인트(주소)입니다.
        // 두 번째 인자 { email, password }: 서버로 보낼 데이터(Body)입니다.
        return apiClient.post('/login', { email, password })
    },

    /**
     * 회원가입 요청을 보냅니다.
     * 새로운 사용자의 정보를 서버에 등록합니다.
     * 
     * @param {string} email - 등록할 이메일 주소
     * @param {string} password - 설정할 비밀번호
     * @param {string} nickname - 사용할 닉네임
     * @returns {Promise} 서버의 응답을 담은 Promise 객체
     */
    register(email, password, nickname) {
        // 회원가입 정보(이메일, 비밀번호, 닉네임)를 객체로 묶어서 '/register' 주소로 POST 요청을 보냅니다.
        return apiClient.post('/register', { email, password, nickname })
    }
}
