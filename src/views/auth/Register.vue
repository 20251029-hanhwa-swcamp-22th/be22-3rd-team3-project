<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-card card card-glass">
        <h2 class="text-center mb-4">회원가입</h2>
        
        <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleSubmit">
          <el-form-item prop="nickname">
            <el-input 
              v-model="form.nickname" 
              placeholder="닉네임"
              size="large"
            />
          </el-form-item>
          
          <el-form-item prop="email">
            <el-input 
              v-model="form.email" 
              placeholder="이메일"
              size="large"
              type="email"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="form.password" 
              placeholder="비밀번호"
              size="large"
              type="password"
              show-password
            />
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input 
              v-model="form.confirmPassword" 
              placeholder="비밀번호 확인"
              size="large"
              type="password"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              :loading="loading"
              native-type="submit"
              style="width: 100%"
            >
              회원가입
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="auth-footer">
          <p>이미 계정이 있으신가요? <router-link to="/login">로그인</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  nickname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('비밀번호가 일치하지 않습니다'))
  } else {
    callback()
  }
}

const rules = {
  nickname: [
    { required: true, message: '닉네임을 입력해주세요', trigger: 'blur' },
    { min: 2, max: 20, message: '닉네임은 2-20자 사이여야 합니다', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '이메일을 입력해주세요', trigger: 'blur' },
    { type: 'email', message: '올바른 이메일 형식이 아닙니다', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '비밀번호를 입력해주세요', trigger: 'blur' },
    { min: 6, message: '비밀번호는 최소 6자 이상이어야 합니다', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '비밀번호 확인을 입력해주세요', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    const result = await authStore.register(form.email, form.password, form.nickname)
    loading.value = false
    
    if (result.success) {
      ElMessage.success('회원가입 성공!')
      router.push('/')
    } else {
      ElMessage.error(result.message)
    }
  })
}
</script>

<style scoped>
.auth-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  max-width: 400px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}

.auth-footer {
  text-align: center;
  margin-top: var(--spacing-lg);
  color: var(--text-secondary);
}

.auth-footer a {
  color: var(--primary-light);
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
