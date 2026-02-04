<template>
  <div class="create-page">
    <div class="container">
      <div class="create-header">
        <h1 class="gradient-text">🧠 퀴즈 만들기</h1>
        <p>나만의 퀴즈를 만들어보세요!</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="create-form card card-glass"
        @submit.prevent="handleSubmit"
      >
        <h3>기본 정보</h3>
        
        <el-form-item label="제목" prop="title">
          <el-input
            v-model="form.title"
            placeholder="퀴즈 제목을 입력하세요"
            size="large"
          />
        </el-form-item>

        <el-form-item label="설명" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="퀴즈에 대한 설명을 입력하세요"
          />
        </el-form-item>

        <el-form-item label="카테고리" prop="categoryId">
          <el-select
            v-model="form.categoryId"
            placeholder="카테고리를 선택하세요"
            size="large"
            style="width: 100%"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="썸네일 이미지" prop="thumbnail">
          <ImageUploader v-model="form.thumbnail" />
        </el-form-item>

        <el-form-item label="전체 제한 시간 (초)" prop="totalTime">
          <el-input-number
            v-model="form.totalTime"
            :min="30"
            :max="600"
            :step="10"
            size="large"
          />
        </el-form-item>

        <el-divider />

        <h3>문제 목록 ({{ questions.length }}개)</h3>
        <p class="hint">최소 5개의 문제를 등록해야 합니다.</p>

        <div class="questions-list">
          <div
            v-for="(question, index) in questions"
            :key="index"
            class="question-item card"
          >
            <div class="question-header">
              <h4>문제 {{ index + 1 }}</h4>
              <el-button
                type="danger"
                size="small"
                circle
                @click="removeQuestion(index)"
                v-if="questions.length > 5"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>

            <el-form-item :label="`문제 ${index + 1} - 질문`">
              <el-input
                v-model="question.questionText"
                placeholder="문제를 입력하세요"
                type="textarea"
                :rows="2"
              />
            </el-form-item>

            <el-form-item :label="`문제 ${index + 1} - 정답`">
              <el-input
                v-model="question.answer"
                placeholder="정답을 입력하세요"
              />
            </el-form-item>

            <el-form-item :label="`문제 ${index + 1} - 제한 시간 (초)`">
              <el-input-number
                v-model="question.timeLimit"
                :min="5"
                :max="60"
                :step="5"
              />
            </el-form-item>

            <el-form-item :label="`문제 ${index + 1} - 이미지 (선택사항)`">
              <el-upload
                action="/api/upload"
                name="image"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="(res) => handleQuestionImageUpload(res, index)"
                :before-upload="beforeUpload"
              >
                <el-button size="small" type="primary">
                  이미지 업로드
                </el-button>
              </el-upload>
              <div v-if="question.questionImage" class="question-image-preview">
                <img :src="question.questionImage" alt="문제 이미지" />
              </div>
            </el-form-item>
          </div>
        </div>

        <el-button
          type="success"
          size="large"
          class="add-question-btn"
          @click="addQuestion"
        >
          <el-icon><Plus /></el-icon>
          문제 추가
        </el-button>

        <el-form-item class="submit-section">
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            native-type="submit"
            :disabled="questions.length < 5"
          >
            퀴즈 만들기
          </el-button>
          <el-button size="large" @click="$router.push('/quiz')">
            취소
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Plus, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { quizApi } from '@/api/quizApi'
import { commonApi } from '@/api/commonApi'
import apiClient from '@/api/axios'
import ImageUploader from '@/components/create/ImageUploader.vue'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)
const categories = ref([])

const form = reactive({
  title: '',
  description: '',
  categoryId: null,
  thumbnail: '',
  totalTime: 120
})

const questions = ref([])

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
})

const rules = {
  title: [
    { required: true, message: '제목을 입력해주세요', trigger: 'blur' },
    { min: 2, max: 100, message: '제목은 2-100자 사이여야 합니다', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '설명을 입력해주세요', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '카테고리를 선택해주세요', trigger: 'change' }
  ],
  thumbnail: [
    { required: true, message: '썸네일 이미지를 업로드해주세요', trigger: 'change' }
  ],
  totalTime: [
    { required: true, message: '전체 제한 시간을 설정해주세요', trigger: 'blur' }
  ]
}

onMounted(async () => {
  await loadCategories()
  // 초기 문제 5개 생성
  for (let i = 0; i < 5; i++) {
    addQuestion()
  }
})

async function loadCategories() {
  try {
    const response = await commonApi.getCategories('quiz')
    categories.value = response.data
  } catch (error) {
    console.error('Failed to load categories:', error)
    ElMessage.error('카테고리를 불러오는데 실패했습니다')
  }
}

function addQuestion() {
  questions.value.push({
    questionText: '',
    answer: '',
    timeLimit: 10,
    questionImage: null
  })
}

function removeQuestion(index) {
  if (questions.value.length <= 5) {
    ElMessage.warning('최소 5개의 문제가 필요합니다')
    return
  }
  questions.value.splice(index, 1)
}

function beforeUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('이미지 파일만 업로드 가능합니다!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('이미지 크기는 5MB를 초과할 수 없습니다!')
    return false
  }
  return true
}

function handleQuestionImageUpload(response, index) {
  questions.value[index].questionImage = response.url
  ElMessage.success('이미지 업로드 성공!')
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 문제 검증
    const validQuestions = questions.value.filter(q => q.questionText && q.answer)
    if (validQuestions.length < 5) {
      ElMessage.error('최소 5개의 문제에 질문과 정답을 모두 입력해주세요')
      return
    }

    loading.value = true

    try {
      // 퀴즈 생성
      const quizData = {
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        thumbnail: form.thumbnail,
        userId: authStore.user.id,
        totalQuestions: validQuestions.length,
        totalTime: form.totalTime,
        createdAt: new Date().toISOString(),
        viewCount: 0,
        playCount: 0
      }

      const quizResponse = await apiClient.post('/quizzes', quizData)
      const quizId = quizResponse.data.id

      // 문제 생성
      for (let i = 0; i < validQuestions.length; i++) {
        const question = validQuestions[i]
        await quizApi.createQuestion({
          quizId,
          questionNumber: i + 1,
          questionText: question.questionText,
          questionImage: question.questionImage,
          answer: question.answer,
          timeLimit: question.timeLimit,
          correctCount: 0,
          totalCount: 0
        })
      }

      ElMessage.success('퀴즈가 성공적으로 생성되었습니다!')
      router.push('/quiz')
    } catch (error) {
      console.error('Failed to create quiz:', error)
      ElMessage.error('퀴즈 생성에 실패했습니다')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.create-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.create-header p {
  color: var(--text-secondary);
  margin-top: var(--spacing-sm);
}

.create-form {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}

.create-form h3 {
  margin-bottom: var(--spacing-md);
  color: var(--primary-light);
}

.hint {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-md);
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.question-item {
  padding: var(--spacing-lg);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.question-header h4 {
  margin: 0;
  color: var(--primary-light);
}

.question-image-preview {
  margin-top: var(--spacing-sm);
  max-width: 300px;
}

.question-image-preview img {
  width: 100%;
  border-radius: var(--border-radius-sm);
}

.add-question-btn {
  width: 100%;
  margin-bottom: var(--spacing-xl);
}

.submit-section {
  margin-top: var(--spacing-2xl);
  text-align: center;
}
</style>
