<template>
  <div class="mypage-container">
    <div class="container">
      <div class="mypage-card card card-glass">
        <h2 class="text-center mb-4">마이페이지</h2>

        <!-- 내 정보 섹션 -->
        <div class="info-section">
          <h3>내 정보</h3>
          <div class="info-item">
            <label>이메일</label>
            <p>{{ user?.email || '-' }}</p>
          </div>
        </div>
        <el-divider />
        <!-- 닉네임 변경 섹션 -->
        <div class="nickname-section">
          <h3>닉네임 변경</h3>

          <div class="info-item">
            <label>현재 닉네임</label>
            <p>{{ user?.nickname || '-' }}</p>
          </div>
          <el-form :model="form" :rules="rules" ref="formRef">
            <el-form-item label="새 닉네임" prop="newNickname">
              <el-input
                  v-model="form.newNickname"
                  placeholder="새 닉네임을 입력하세요"
                  @input="handleNicknameInput"
                  :disabled="loading"
              >
                <template #suffix>
                  <!-- 중복 체크 상태 아이콘 -->
                  <el-icon v-if="nicknameCheckLoading" class="is-loading">
                    <Loading />
                  </el-icon>
                  <el-icon v-else-if="nicknameAvailable === true" color="green">
                    <CircleCheck />
                  </el-icon>
                  <el-icon v-else-if="nicknameAvailable === false" color="red">
                    <CircleClose />
                  </el-icon>
                </template>
              </el-input>

              <!-- 중복 체크 결과 메시지 -->
              <div class="nickname-feedback">
                <span v-if="nicknameAvailable === true" class="success">
                  ✅ 사용 가능한 닉네임입니다
                </span>
                <span v-else-if="nicknameAvailable === false" class="error">
                  ❌ 이미 사용 중인 닉네임입니다
                </span>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button
                  type="primary"
                  @click="handleUpdateNickname"
                  :loading="loading"
                  :disabled="!nicknameAvailable || !form.newNickname"
              >
                닉네임 변경
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { userApi } from '@/api/userApi'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue'
const authStore = useAuthStore()
// ========================================
// 상태 관리
// ========================================
const user = ref(null)  // 사용자 정보
const loading = ref(false)  // 전체 로딩
const nicknameCheckLoading = ref(false)  // 중복 체크 로딩
const nicknameAvailable = ref(null)  // null | true | false
const formRef = ref(null)
const form = reactive({
  newNickname: ''
})

// ========================================
// 유효성 검사 규칙
// ========================================
const rules = {
  newNickname: [
    { required: true, message: '닉네임을 입력해주세요', trigger: 'blur' },
    { min: 2, max: 20, message: '닉네임은 2-20자 사이여야 합니다', trigger: 'blur' }
  ]
}

// ========================================
// 내 정보 불러오기
// ========================================
async function fetchMyInfo() {
  try {
    const response = await userApi.getMyInfo()
    user.value = response.data
  } catch (error) {
    console.error('내 정보 조회 실패:', error)
    ElMessage.error('정보를 불러올 수 없습니다')
  }
}

// ========================================
// 닉네임 입력 시 실시간 중복 체크 (Debounce)
// ========================================
let debounceTimer = null
function handleNicknameInput() {
  // 이전 타이머 취소
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  // 입력값 초기화
  nicknameAvailable.value = null
  const newNickname = form.newNickname.trim()
  // 빈 값이거나 현재 닉네임과 같으면 체크 안 함
  if (!newNickname || newNickname === user.value?.nickname) {
    return
  }
  // 길이 체크
  if (newNickname.length < 2 || newNickname.length > 20) {
    return
  }
  // 500ms 후에 중복 체크 실행 (너무 자주 API 호출 방지)
  debounceTimer = setTimeout(async () => {
    await checkNicknameAvailability(newNickname)
  }, 500)
}

// ========================================
// 닉네임 중복 체크 API 호출
// ========================================
async function checkNicknameAvailability(nickname) {
  nicknameCheckLoading.value = true
  try {
    const response = await userApi.checkNickname(nickname)
    nicknameAvailable.value = response.data.available
  } catch (error) {
    console.error('닉네임 중복 체크 실패:', error)
    nicknameAvailable.value = null
  } finally {
    nicknameCheckLoading.value = false
  }
}

// ========================================
// 닉네임 변경 처리
// ========================================
async function handleUpdateNickname() {
  if (!formRef.value) return
  // 폼 유효성 검사
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    // 중복 체크 통과 확인
    if (nicknameAvailable.value !== true) {
      ElMessage.warning('사용 가능한 닉네임을 입력해주세요')
      return
    }
    loading.value = true
    try {
      const response = await userApi.updateNickname(form.newNickname)

      // localStorage와 auth store 동기화
      const updatedUser = response.data
      localStorage.setItem('user', JSON.stringify(updatedUser))
      authStore.user = updatedUser  // Pinia store 업데이트
      // 로컬 상태 업데이트
      user.value = updatedUser
      form.newNickname = ''
      nicknameAvailable.value = null
      ElMessage.success('닉네임이 변경되었습니다!')
    } catch (error) {
      console.error('닉네임 변경 실패:', error)
      const errorMsg = error.response?.data?.error || '닉네임 변경에 실패했습니다'
      ElMessage.error(errorMsg)
    } finally {
      loading.value = false
    }
  })
}

// ========================================
// 컴포넌트 마운트 시 내 정보 불러오기
// ========================================
onMounted(() => {
  fetchMyInfo()
})
</script>
<style scoped>
.mypage-container {
  min-height: 60vh;
  padding: var(--spacing-2xl) 0;
}
.mypage-card {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}
.info-section,
.nickname-section {
  margin-bottom: var(--spacing-lg);
}
h3 {
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}
.info-item {
  margin-bottom: var(--spacing-md);
}
.info-item label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}
.info-item p {
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0;
}
.nickname-feedback {
  margin-top: var(--spacing-xs);
  font-size: 0.85rem;
}
.nickname-feedback .success {
  color: var(--success-color, green);
}
.nickname-feedback .error {
  color: var(--error-color, red);
}
</style>