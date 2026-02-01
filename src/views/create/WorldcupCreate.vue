<template>
  <div class="create-page">
    <div class="container">
      <div class="create-header">
        <h1 class="gradient-text">🏆 월드컵 만들기</h1>
        <p>나만의 이상형 월드컵을 만들어보세요!</p>
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
            placeholder="월드컵 제목을 입력하세요"
            size="large"
          />
        </el-form-item>

        <el-form-item label="설명" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="월드컵에 대한 설명을 입력하세요"
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

        <el-divider />

        <h3>후보 등록 ({{ candidates.length }}개)</h3>
        <p class="hint">최소 32개의 후보를 등록해야 합니다.</p>

        <div class="candidates-grid">
          <div
            v-for="(candidate, index) in candidates"
            :key="index"
            class="candidate-item card"
          >
            <el-button
              type="danger"
              size="small"
              circle
              class="remove-btn"
              @click="removeCandidate(index)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
            
            <div class="candidate-image">
              <img v-if="candidate.imageUrl" :src="candidate.imageUrl" alt="후보 이미지" />
              <div v-else class="placeholder">이미지 없음</div>
            </div>
            
            <el-input
              v-model="candidate.name"
              placeholder="후보 이름"
              size="small"
              class="mt-2"
            />
            
            <el-upload
              action="http://localhost:3000/upload"
              name="image"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="(res) => handleCandidateImageUpload(res, index)"
              :before-upload="beforeUpload"
            >
              <el-button size="small" type="primary" class="mt-1">
                이미지 업로드
              </el-button>
            </el-upload>
          </div>

          <div class="add-candidate-btn card" @click="addCandidate">
            <el-icon size="40"><Plus /></el-icon>
            <p>후보 추가</p>
          </div>
        </div>

        <el-form-item class="submit-section">
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            native-type="submit"
            :disabled="candidates.length < 32"
          >
            월드컵 만들기
          </el-button>
          <el-button size="large" @click="$router.push('/worldcup')">
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
import { useAuthStore } from '../../stores/auth'
import { Plus, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '../../services/api'
import ImageUploader from '../../components/create/ImageUploader.vue'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)
const categories = ref([])

const form = reactive({
  title: '',
  description: '',
  categoryId: null,
  thumbnail: ''
})

const candidates = ref([])

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
  ]
}

onMounted(async () => {
  await loadCategories()
  // 초기 후보 32개 생성
  for (let i = 0; i < 32; i++) {
    candidates.value.push({ name: '', imageUrl: '' })
  }
})

async function loadCategories() {
  try {
    const response = await api.getCategories('worldcup')
    categories.value = response.data
  } catch (error) {
    console.error('Failed to load categories:', error)
    ElMessage.error('카테고리를 불러오는데 실패했습니다')
  }
}

function addCandidate() {
  candidates.value.push({ name: '', imageUrl: '' })
}

function removeCandidate(index) {
  if (candidates.value.length <= 32) {
    ElMessage.warning('최소 32개의 후보가 필요합니다')
    return
  }
  candidates.value.splice(index, 1)
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

function handleCandidateImageUpload(response, index) {
  candidates.value[index].imageUrl = response.url
  ElMessage.success('이미지 업로드 성공!')
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 후보 검증
    const validCandidates = candidates.value.filter(c => c.name && c.imageUrl)
    if (validCandidates.length < 32) {
      ElMessage.error('최소 32개의 후보에 이름과 이미지를 모두 입력해주세요')
      return
    }

    loading.value = true

    try {
      // 월드컵 생성
      const worldcupData = {
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        thumbnail: form.thumbnail,
        userId: authStore.user.id,
        createdAt: new Date().toISOString(),
        viewCount: 0,
        playCount: 0
      }

      const worldcupResponse = await api.post('/worldcups', worldcupData)
      const worldcupId = worldcupResponse.data.id

      // 후보 생성
      for (const candidate of validCandidates) {
        await api.createCandidate({
          worldcupId,
          name: candidate.name,
          imageUrl: candidate.imageUrl,
          winCount: 0,
          appearCount: 0,
          finalCount: 0
        })
      }

      ElMessage.success('월드컵이 성공적으로 생성되었습니다!')
      router.push('/worldcup')
    } catch (error) {
      console.error('Failed to create worldcup:', error)
      ElMessage.error('월드컵 생성에 실패했습니다')
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
  max-width: 1000px;
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

.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.candidate-item {
  position: relative;
  padding: var(--spacing-md);
  text-align: center;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 10;
}

.candidate-image {
  width: 100%;
  height: 120px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  background: var(--bg-tertiary);
  margin-bottom: var(--spacing-sm);
}

.candidate-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.add-candidate-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 2px dashed var(--border-color);
}

.add-candidate-btn:hover {
  border-color: var(--primary-light);
  background: var(--bg-hover);
}

.add-candidate-btn p {
  margin-top: var(--spacing-sm);
  color: var(--text-secondary);
}

.submit-section {
  margin-top: var(--spacing-2xl);
  text-align: center;
}

.mt-1 {
  margin-top: var(--spacing-xs);
}

.mt-2 {
  margin-top: var(--spacing-sm);
}
</style>
