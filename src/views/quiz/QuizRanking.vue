<template>
  <div class="ranking-page">
    <div class="container">
      <div class="page-header">
        <h1 class="gradient-text">🏆 명예의 전당</h1>
        <p v-if="quiz">{{ quiz.title }}</p>
      </div>

      <!-- 랭킹 데이터가 있을 때만 보여줍니다 -->
      <div v-if="rankings.length > 0" class="ranking-content">
        <!-- 1, 2, 3등을 강조해서 보여주는 포디움(시상대) 영역 -->
        <!-- 최소 3명 이상의 데이터가 있을 때만 표시합니다 -->
        <div class="podium" v-if="rankings.length >= 3">
          <!-- 2등 은메달 -->
          <div class="podium-item second">
            <div class="rank-badge silver">2</div>
            <div class="player-info">
              <div class="nickname">{{ rankings[1].nickname }}</div>
              <div class="score">{{ rankings[1].score }}점</div>
              <div class="tier">{{ rankings[1].tier }}</div>
            </div>
          </div>

          <!-- 1등 금메달 -->
          <div class="podium-item first">
            <div class="rank-badge gold">1</div>
            <div class="player-info">
              <div class="nickname">{{ rankings[0].nickname }}</div>
              <div class="score">{{ rankings[0].score }}점</div>
              <div class="tier">{{ rankings[0].tier }}</div>
            </div>
          </div>

          <!-- 3등 동메달 -->
          <div class="podium-item third">
            <div class="rank-badge bronze">3</div>
            <div class="player-info">
              <div class="nickname">{{ rankings[2].nickname }}</div>
              <div class="score">{{ rankings[2].score }}점</div>
              <div class="tier">{{ rankings[2].tier }}</div>
            </div>
          </div>
        </div>

        <!-- 전체 랭킹 리스트 영역 -->
        <div class="ranking-list">
          <div
            v-for="(result, index) in rankings"
            :key="result.id"
            class="ranking-item card"
            :class="{ 'top-rank': index < 3 }"
          >
            <!-- 순위 표시 (1,2,3등은 특별한 스타일 적용) -->
            <div class="rank" :class="'rank-' + (index + 1)">
              {{ index + 1 }}
            </div>
            
            <div class="player-details">
              <div class="player-name">
                <h3>{{ result.nickname }}</h3>
                <!-- 티어에 따라 다른 색상의 배지를 보여줍니다 -->
                <span class="tier-badge" :class="getTierClass(result.tier)">
                  {{ result.tier }}
                </span>
              </div>
              
              <!-- 상세 기록 표시 -->
              <div class="stats">
                <div class="stat">
                  <span class="label">점수</span>
                  <span class="value">{{ result.score }}</span>
                </div>
                <div class="stat">
                  <span class="label">정답</span>
                  <span class="value">{{ result.correctCount }}/{{ result.totalQuestions }}</span>
                </div>
                <div class="stat">
                  <span class="label">정답률</span>
                  <span class="value">{{ getCorrectRate(result) }}%</span>
                </div>
                <div class="stat">
                  <span class="label">남은 시간</span>
                  <span class="value">{{ formatTime(result.remainingTime) }}</span>
                </div>
                <div class="stat">
                  <span class="label">완료일</span>
                  <span class="value">{{ formatDate(result.completedAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <router-link :to="`/quiz/${quizId}/play`" class="btn btn-primary">
            도전하기
          </router-link>
          <router-link to="/quiz" class="btn btn-outline">
            목록으로
          </router-link>
        </div>
      </div>

      <!-- 로딩 중 화면 -->
      <div v-else class="loading">
        <el-icon class="is-loading" size="60"><Loading /></el-icon>
        <p>랭킹을 불러오는 중...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { quizApi } from '@/api/quizApi'
import { formatTime, formatDate } from '@/utils/helpers'

const route = useRoute()
const quizId = route.params.id

// ==========================================
// State (상태 데이터)
// ==========================================

const quiz = ref(null) // 퀴즈 정보
const rankings = ref([]) // 랭킹 목록

// ==========================================
// Lifecycle Hooks
// ==========================================

onMounted(async () => {
  try {
    // 퀴즈 정보와 랭킹 정보를 동시에 가져옵니다.
    const [quizRes, rankingRes] = await Promise.all([
      quizApi.getQuiz(quizId),
      quizApi.getQuizRanking(quizId)
    ])
    
    quiz.value = quizRes.data
    rankings.value = rankingRes.data
  } catch (error) {
    console.error('Failed to load ranking:', error)
  }
})

// ==========================================
// Helper Functions (보조 함수들)
// ==========================================

/**
 * 정답률 계산 함수
 * (정답 수 / 전체 문제 수) * 100
 */
function getCorrectRate(result) {
  return Math.round((result.correctCount / result.totalQuestions) * 100)
}

/**
 * 티어에 맞는 CSS 클래스 이름을 반환합니다.
 * 예: "멘사" -> "tier-멘사" (CSS에서 색상 스타일링에 사용됨)
 */
function getTierClass(tier) {
  return 'tier-' + tier.toLowerCase().replace(/\s/g, '')
}
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.page-header p {
  color: var(--text-secondary);
  margin-top: var(--spacing-sm);
}

.ranking-content {
  max-width: 1000px;
  margin: 0 auto;
}

.podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
  min-width: 200px;
}

.podium-item.first {
  order: 2;
  padding-top: var(--spacing-2xl);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%);
}

.podium-item.second {
  order: 1;
  padding-top: var(--spacing-xl);
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.2) 0%, rgba(128, 128, 128, 0.2) 100%);
}

.podium-item.third {
  order: 3;
  padding-top: var(--spacing-xl);
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(139, 69, 19, 0.2) 100%);
}

.rank-badge {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: var(--spacing-md);
  color: white;
}

.rank-badge.gold {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
}

.rank-badge.silver {
  background: linear-gradient(135deg, #C0C0C0 0%, #808080 100%);
  box-shadow: 0 4px 15px rgba(192, 192, 192, 0.5);
}

.rank-badge.bronze {
  background: linear-gradient(135deg, #CD7F32 0%, #8B4513 100%);
  box-shadow: 0 4px 15px rgba(205, 127, 50, 0.5);
}

.player-info {
  text-align: center;
}

.player-info .nickname {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
}

.player-info .score {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-light);
  margin-bottom: var(--spacing-xs);
}

.player-info .tier {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
}

.ranking-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.ranking-item.top-rank {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.rank {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.rank-1 {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: white;
  font-size: 2rem;
}

.rank-2 {
  background: linear-gradient(135deg, #C0C0C0 0%, #808080 100%);
  color: white;
  font-size: 1.75rem;
}

.rank-3 {
  background: linear-gradient(135deg, #CD7F32 0%, #8B4513 100%);
  color: white;
  font-size: 1.75rem;
}

.player-details {
  flex: 1;
}

.player-name {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.player-name h3 {
  margin: 0;
  font-size: 1.25rem;
}

.tier-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: bold;
}

.tier-멘사 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.tier-수재 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
.tier-우등생 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }
.tier-모범생 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; }
.tier-평범 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; }
.tier-노력필요 { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; }

.stats {
  display: flex;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat .label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.stat .value {
  font-size: 1rem;
  font-weight: bold;
  color: var(--primary-light);
}

.actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.loading {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .podium {
    flex-direction: column;
    align-items: stretch;
  }

  .podium-item {
    order: initial !important;
  }

  .ranking-item {
    flex-direction: column;
    text-align: center;
  }

  .player-name {
    flex-direction: column;
  }

  .stats {
    justify-content: center;
  }
}
</style>
