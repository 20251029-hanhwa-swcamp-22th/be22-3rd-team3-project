<template>
  <div class="quiz-list-page">
    <div class="container">
      <div class="page-header">
        <h1 class="gradient-text">🧠 퀴즈 게임</h1>
        <router-link to="/quiz/create" class="btn btn-primary" v-if="authStore.isAuthenticated">
          퀴즈 만들기
        </router-link>
      </div>

      <div class="filters mb-4">
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

        <el-select v-model="selectedCategory" placeholder="카테고리" size="large" @change="loadQuizzes">
          <el-option label="전체" :value="null" />
          <el-option 
            v-for="category in categories" 
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </div>

      <div v-loading="loading" class="grid grid-3">
        <router-link
          v-for="quiz in quizzes"
          :key="quiz.id"
          :to="`/quiz/${quiz.id}/play`"
          class="quiz-card card"
        >
          <div class="card-image">
            <img :src="quiz.thumbnail || '/placeholder.jpg'" :alt="quiz.title" />
          </div>
          <div class="card-body">
            <h3>{{ quiz.title }}</h3>
            <p class="card-description">{{ quiz.description }}</p>
            <div class="card-info">
              <span>📝 {{ quiz.totalQuestions }}문제</span>
              <span>⏱️ {{ quiz.totalTime }}초</span>
            </div>
            <div class="card-stats">
              <span>👁️ {{ quiz.viewCount || 0 }}</span>
              <span>🎮 {{ quiz.playCount || 0 }}</span>
            </div>
          </div>
        </router-link>
      </div>

      <div v-if="quizzes.length === 0 && !loading" class="empty-state">
        <p>퀴즈가 없습니다. 첫 번째 퀴즈를 만들어보세요!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import { Search } from '@element-plus/icons-vue'

const authStore = useAuthStore()

const quizzes = ref([])
const categories = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref(null)

onMounted(async () => {
  await loadCategories()
  await loadQuizzes()
})

async function loadCategories() {
  try {
    const response = await api.getCategories('quiz')
    categories.value = response.data
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

async function loadQuizzes() {
  loading.value = true
  try {
    const params = {}
    if (searchQuery.value) {
      params.q = searchQuery.value
    }
    if (selectedCategory.value) {
      params.categoryId = selectedCategory.value
    }
    const response = await api.getQuizzes(params)
    quizzes.value = response.data
  } catch (error) {
    console.error('Failed to load quizzes:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  loadQuizzes()
}
</script>

<style scoped>
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
