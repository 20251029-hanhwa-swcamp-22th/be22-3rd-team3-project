import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/authApi'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(email, password) {
    try {
      const response = await authApi.login(email, password)

      token.value = response.data.accessToken
      user.value = response.data.user

      // localStorage에 토큰과 사용자 정보 저장
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      // ⭐ 로그인 시간 저장 (타임스탬프)
      localStorage.setItem('loginTime', Date.now().toString())

      // ⭐ 세션 ID 생성 및 저장 (브라우저 재시작 감지용)
      const sessionId = Date.now() + '-' + Math.random()
      sessionStorage.setItem('sessionId', sessionId)  // 브라우저 닫으면 삭제됨
      localStorage.setItem('sessionId', sessionId)    // 영구 보관

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: '이메일 또는 비밀번호가 일치하지 않습니다.'
      }
    }
  }

  async function register(email, password, nickname) {
    try {
      const response = await authApi.register(email, password, nickname)
      token.value = response.data.accessToken
      user.value = response.data.user

      // localStorage에 토큰과 사용자 정보 저장
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      // ⭐ 로그인 시간 저장 (타임스탬프)
      localStorage.setItem('loginTime', Date.now().toString())

      // ⭐ 세션 ID 생성 및 저장 (브라우저 재시작 감지용)
      const sessionId = Date.now() + '-' + Math.random()
      sessionStorage.setItem('sessionId', sessionId)  // 브라우저 닫으면 삭제됨
      localStorage.setItem('sessionId', sessionId)    // 영구 보관

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: '회원가입할 수 없습니다. 이메일, 닉네임 또는 비밀번호를 확인해주세요.'
      }
    }
  }

  function logout() {
    token.value = null
    user.value = null

    // localStorage 정리
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('sessionId')
    localStorage.removeItem('loginTime')

    // sessionStorage 정리
    sessionStorage.removeItem('sessionId')
  }

  function initAuth() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    const savedSessionId = localStorage.getItem('sessionId')      // 영구 보관된 세션 ID
    const currentSessionId = sessionStorage.getItem('sessionId')  // 현재 브라우저 세션 ID
    const loginTime = localStorage.getItem('loginTime')

    // 1. 데이터 존재 여부 체크
    if (!savedToken || !savedUser || !savedSessionId || !loginTime) {
      logout()
      return
    }

    // 2. 브라우저 재시작 체크 (세션 ID 비교)
    // sessionStorage는 브라우저 닫으면 삭제되므로, 재시작 시 null이 됨
    if (savedSessionId !== currentSessionId) {
      logout()
      return
    }

    // 3. 오래된 로그인 체크 (타임스탬프)
    // 7일 이상 지나면 자동 로그아웃
    const sevenDays = 7 * 24 * 60 * 60 * 1000  // 7일 (밀리초)
    if (Date.now() - parseInt(loginTime) > sevenDays) {
      logout()
      return
    }

    // 모든 검증 통과 → 자동 로그인
    try {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    } catch (e) {
      // JSON 파싱 에러 시 로그아웃 (데이터 손상)
      logout()
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
