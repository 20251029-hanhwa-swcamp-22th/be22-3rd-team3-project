<template>
  <div class="result-page">
    <div class="container">
      <h1 class="gradient-text text-center">🎉 퀴즈 결과</h1>

      <div v-if="result" class="result-content">
        <!-- 점수 카드 -->
        <div class="score-card card card-glass">
          <div class="tier-badge" :class="tierClass">
            {{ result.tier }}
          </div>
          <div class="score-display">
            <div class="score-value">{{ result.score }}</div>
            <div class="score-label">점</div>
          </div>
          <div class="score-details">
            <div class="detail-item">
              <span class="label">정답률</span>
              <span class="value">{{ correctRate }}%</span>
            </div>
            <div class="detail-item">
              <span class="label">정답 수</span>
              <span class="value">{{ result.correctCount }} / {{ result.totalQuestions }}</span>
            </div>
            <div class="detail-item">
              <span class="label">남은 시간</span>
              <span class="value">{{ formatTime(result.remainingTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 문제별 결과 -->
        <div class="questions-result card card-glass">
          <h2>📊 문제별 결과</h2>
          <div class="questions-list">
            <div
              v-for="(question, index) in questions"
              :key="question.id"
              class="question-result-item"
            >
              <div class="question-number">{{ index + 1 }}</div>
              <div class="question-content">
                <div class="question-text">{{ question.questionText }}</div>
                <div class="question-answer">정답: {{ question.answer }}</div>
                <div class="question-stats">
                  <span>정답률: {{ getQuestionAccuracy(question) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 티어 설명 -->
        <div class="tier-info card card-glass">
          <h2>🏅 티어 시스템</h2>
          <div class="tier-list">
            <div class="tier-item" v-for="tier in tiers" :key="tier.name">
              <div class="tier-name" :class="'tier-' + tier.name.toLowerCase()">
                {{ tier.name }}
              </div>
              <div class="tier-desc">{{ tier.description }}</div>
            </div>
          </div>
        </div>

        <!-- 액션 버튼 -->
        <div class="actions">
          <router-link :to="`/quiz/${quizId}/play`" class="btn btn-primary">
            다시 도전하기
          </router-link>
          <router-link :to="`/quiz/${quizId}/ranking`" class="btn btn-outline">
            명예의 전당
          </router-link>
          <router-link to="/quiz" class="btn btn-outline">
            목록으로
          </router-link>
        </div>
      </div>

      <div v-else class="loading">
        <el-icon class="is-loading" size="60"><Loading /></el-icon>
        <p>결과를 불러오는 중...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import apiClient from '@/api/axios'
import { quizApi } from '@/api/quizApi'
import { formatTime } from '@/utils/helpers'

const route = useRoute()
const quizId = route.params.id

const result = ref(null)
const questions = ref([])

const tiers = [
  { name: '멘사', description: '90점 이상 - 천재적인 실력!' },
  { name: '수재', description: '80-89점 - 뛰어난 실력!' },
  { name: '우등생', description: '70-79점 - 훌륭한 실력!' },
  { name: '모범생', description: '60-69점 - 좋은 실력!' },
  { name: '평범', description: '50-59점 - 평균 실력' },
  { name: '노력필요', description: '50점 미만 - 조금 더 노력해보세요!' }
]

const correctRate = computed(() => {
  if (!result.value) return 0
  return Math.round((result.value.correctCount / result.value.totalQuestions) * 100)
})

const tierClass = computed(() => {
  if (!result.value) return ''
  return 'tier-' + result.value.tier.toLowerCase().replace(/\s/g, '')
})

onMounted(async () => {
  try {
    // 최신 결과 가져오기
    const [resultsRes, questionsRes] = await Promise.all([
      apiClient.get(`/quiz_results?quizId=${quizId}&_sort=completedAt&_order=desc&_limit=1`),
      quizApi.getQuizQuestions(quizId)
    ])
    
    if (resultsRes.data && resultsRes.data.length > 0) {
      result.value = resultsRes.data[0]
      questions.value = questionsRes.data
    }
  } catch (error) {
    console.error('Failed to load result:', error)
  }
})

function getQuestionAccuracy(question) {
  if (!question.totalCount) return 0
  return Math.round((question.correctCount / question.totalCount) * 100)
}
</script>

<style scoped>
.result-page {
  padding: var(--spacing-2xl) 0;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.score-card {
  position: relative;
  text-align: center;
  padding: var(--spacing-2xl);
  overflow: hidden;
}

.tier-badge {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-full);
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: var(--spacing-lg);
}

.tier-멘사 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.tier-수재 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
.tier-우등생 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }
.tier-모범생 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; }
.tier-평범 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; }
.tier-노력필요 { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; }

.score-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.score-value {
  font-size: 5rem;
  font-weight: bold;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.score-label {
  font-size: 2rem;
  color: var(--text-secondary);
}

.score-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-lg);
  max-width: 600px;
  margin: 0 auto;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-item .label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.detail-item .value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-light);
}

.questions-result {
  padding: var(--spacing-2xl);
}

.questions-result h2 {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  color: var(--primary-light);
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 800px;
  margin: 0 auto;
}

.question-result-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
}

.question-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  color: white;
  border-radius: 50%;
  font-weight: bold;
}

.question-content {
  flex: 1;
}

.question-text {
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
}

.question-answer {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-xs);
}

.question-stats {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.tier-info {
  padding: var(--spacing-2xl);
}

.tier-info h2 {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  color: var(--primary-light);
}

.tier-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  max-width: 800px;
  margin: 0 auto;
}

.tier-item {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  text-align: center;
}

.tier-name {
  font-weight: bold;
  font-size: 1.125rem;
  margin-bottom: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  display: inline-block;
}

.tier-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  margin-top: var(--spacing-xl);
}

.loading {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .score-value {
    font-size: 3rem;
  }

  .score-label {
    font-size: 1.5rem;
  }

  .score-details {
    grid-template-columns: 1fr;
  }

  .tier-list {
    grid-template-columns: 1fr;
  }
}
</style>
