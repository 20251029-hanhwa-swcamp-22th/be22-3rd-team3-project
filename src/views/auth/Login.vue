<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-card card card-glass">
        <h2 class="text-center mb-4">로그인</h2>
        
        <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleSubmit">
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
          
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              :loading="loading"
              native-type="submit"
              style="width: 100%"
            >
              로그인
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="auth-footer">
          <p>계정이 없으신가요? <router-link to="/register">회원가입</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const rules = {
  email: [
    { required: true, message: '이메일을 입력해주세요', trigger: 'blur' },
    { type: 'email', message: '올바른 이메일 형식이 아닙니다', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '비밀번호를 입력해주세요', trigger: 'blur' },
    { min: 6, message: '비밀번호는 최소 6자 이상이어야 합니다', trigger: 'blur' }
  ]
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    const result = await authStore.login(form.email, form.password)
    loading.value = false
    
    if (result.success) {
      ElMessage.success('로그인 성공!')
      const redirect = route.query.redirect || '/'
      router.push(redirect)
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
