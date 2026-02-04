<template>
  <div class="quiz-list-page">
    <ExitTransition ref="exitTransition" color="#D4BBFF" />
    <div class="container">
      <div class="page-header">
        <h1 class="gradient-text">🧠 퀴즈 게임</h1>
        <!-- 로그인을 한 사용자에게만 '퀴즈 만들기' 버튼을 보여줍니다 -->
        <router-link to="/quiz/create" class="btn btn-primary" v-if="authStore.isAuthenticated">
          퀴즈 만들기
        </router-link>
      </div>

      <!-- 검색 및 필터 영역 -->
      <div class="filters mb-4">
        <!-- 검색어 입력 필드 (엔터키를 치거나 입력이 멈추면 자동으로 처리됨) -->
        <el-input
          v-model="searchQuery"
          placeholder="검색..."
          size="large"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><search /></el-icon>
          </template>
        </el-input>

        <!-- 카테고리 선택 박스 -->
        <el-select v-model="selectedCategory" placeholder="카테고리" size="large" @change="loadQuizzes">
          <el-option label="전체" :value="null" />
          <!-- categories 배열을 순회하며 옵션을 생성합니다 -->
          <el-option 
            v-for="category in categories" 
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </div>

      <!-- 퀴즈 목록 표시 (로딩 중일 때는 로딩 표시) -->
      <div v-loading="loading" class="grid grid-3">
        <!-- 각 퀴즈 카드를 클릭하면 상세 페이지로 이동합니다 -->
        <router-link
          v-for="(quiz, index) in quizzes"
          :key="quiz.id"
          :to="`/quiz/${quiz.id}/play`"
          class="quiz-card card drop-in"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click.prevent="handleNavigation(`/quiz/${quiz.id}/play`)"
        >
          <div class="card-image">
            <!-- 썸네일이 없으면 기본 이미지를 보여줍니다 -->
            <img :src="getImageUrl(quiz.thumbnail || '/placeholder.jpg')" :alt="quiz.title" />
          </div>
          <div class="card-body">
            <h3>{{ quiz.title }}</h3>
            <p class="card-description">{{ quiz.description }}</p>
            <div class="card-info">
              <span>📝 {{ quiz.totalQuestions }}문제</span>
            </div>
            <div class="card-stats">
              <span>👁️ {{ quiz.viewCount || 0 }}</span>
              <span>🎮 {{ quiz.playCount || 0 }}</span>
            </div>
          </div>
        </router-link>
      </div>

      <!-- 퀴즈가 하나도 없을 때 보여줄 메시지 -->
      <div v-if="quizzes.length === 0 && !loading" class="empty-state">
        <p>퀴즈가 없습니다. 첫 번째 퀴즈를 만들어보세요!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { quizApi } from '@/api/quizApi'
import { commonApi } from '@/api/commonApi'
import { Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import ExitTransition from '@/components/ExitTransition.vue'
import {getImageUrl} from "@/utils/helpers.js";

// 인증 상태 관리를 위한 스토어 사용
const authStore = useAuthStore()
const router = useRouter()
const exitTransition = ref(null)

// ==========================================
// State (상태 데이터)
// ==========================================

const quizzes = ref([]) // 불러온 퀴즈 목록
const categories = ref([]) // 카테고리 목록
const loading = ref(false) // 로딩 중 상태 표시
const searchQuery = ref('') // 검색어
const selectedCategory = ref(null) // 선택된 카테고리 ID

// ==========================================
// Lifecycle Hooks (생명주기 훅)
// ==========================================

// 컴포넌트가 화면에 나타나면 실행됩니다.
onMounted(async () => {
  await loadCategories() // 카테고리 정보 불러오기
  await loadQuizzes() // 퀴즈 목록 불러오기
})

// ==========================================
// Methods (함수)
// ==========================================

/**
 * 카테고리 목록을 서버에서 가져옵니다.
 */
async function loadCategories() {
  try {
    const response = await commonApi.getCategories('quiz')
    categories.value = response.data
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

/**
 * 퀴즈 목록을 서버에서 가져옵니다.
 * 검색어와 카테고리 필터를 적용하여 요청합니다.
 */
async function loadQuizzes() {
  loading.value = true // 로딩 시작
  try {
    // 검색 조건 설정
    const params = {}
    if (searchQuery.value) {
      params.q = searchQuery.value // 검색어 포함
    }
    if (selectedCategory.value) {
      params.categoryId = selectedCategory.value // 카테고리 필터
    }
    
    // API 요청
    const response = await quizApi.getQuizzes(params)
    quizzes.value = response.data
  } catch (error) {
    console.error('Failed to load quizzes:', error)
  } finally {
    loading.value = false // 로딩 종료 (성공하든 실패하든)
  }
}

/**
 * 검색어가 입력될 때 실행되는 함수
 * 입력될 때마다 퀴즈 목록을 다시 불러옵니다.
 */
function handleSearch() {
  loadQuizzes()
}

async function handleNavigation(path) {
  if (exitTransition.value) {
    await exitTransition.value.trigger()
  }
  router.push(path)
}
</script>

<style scoped>
/* 퀴즈 페이지 전체 배경 */
.quiz-list-page {
  min-height: 100vh;
  background: #D4BBFF;  /* 보라색 배경 */
  padding: var(--spacing-xl) 0;
}

/* 카드 떨어지는 애니메이션 */
.drop-in {
  animation: dropIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

@keyframes dropIn {
  0% {
    opacity: 0;
    transform: translateY(-50px) scale(0.8);
  }
  70% {
    transform: translateY(5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.filters {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.quiz-card {
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: all var(--transition-normal);
}

.card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.quiz-card:hover .card-image img {
  transform: scale(1.1);
}

.card-body {
  padding: var(--spacing-md);
}

.card-body h3 {
  margin-bottom: var(--spacing-sm);
  font-size: 1.25rem;
}

.card-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-info {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  font-size: 0.875rem;
  color: var(--text-primary);
}

.card-stats {
  display: flex;
  gap: var(--spacing-md);
  font-size: 0.875rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
