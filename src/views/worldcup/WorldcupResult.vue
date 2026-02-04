<!--
  ============================================================================
  WorldcupResult.vue - 월드컵 결과 페이지
  ============================================================================
  [페이지 개요]
  - 게임 완료 후 최종 결과 표시 (우승자, TOP 4, 선택 히스토리)
  
  [라우트]
  - 현재 경로: /worldcup/:id/result
  - 다시 하기: /worldcup/:id/play
  - 랭킹 보기: /worldcup/:id/ranking
  
  [사용하는 API]
  - GET /worldcup_results?worldcupId=:id : 결과 데이터 조회
  - GET /worldcup_candidates?worldcupId=:id : 후보 목록 조회
  
  [담당] 팀원1 - 월드컵 도메인
  ============================================================================
-->
<template>
  <div class="result-page">
    <div class="container">
      <h1 class="gradient-text text-center">🏆 월드컵 결과</h1>

      <!-- ===== 결과 콘텐츠 (데이터 있을 때) ===== -->
      <div v-if="result" class="result-content">
        <!-- ===== 우승자 섹션 ===== -->
        <!-- 최종 우승자 이미지, 이름, 통계(우승횟수/결승진출/승률) -->
        <div class="winner-section card card-glass">
          <h2>👑 우승자</h2>
          <div class="winner-card">
            <img v-if="winner" :src="getImageUrl(winner.imageUrl)" :alt="winner.name" />
            <h3>{{ winner?.name }}</h3>
            <div class="winner-stats">
              <span>총 우승: {{ winner?.winCount }}회</span>
              <span>결승 진출: {{ winner?.finalCount }}회</span>
              <span>승률: {{ calculateWinRate(winner) }}%</span>
            </div>
          </div>
        </div>

        <!-- ===== TOP 4 섹션 ===== -->
        <!-- 4강 진출자 4명을 순위별로 표시 -->
        <div class="top4-section card card-glass">
          <h2>🥇 TOP 4</h2>
          <div class="top4-grid">
            <!-- result.top4는 후보 ID 배열 → getCandidateById로 후보 객체 조회 -->
            <div
              v-for="(candidateId, index) in result.top4"
              :key="candidateId"
              class="top4-item"
            >
              <div class="rank-badge">{{ index + 1 }}</div>
              <img :src="getImageUrl(getCandidateById(candidateId)?.imageUrl)" :alt="getCandidateById(candidateId)?.name" />
              <h4>{{ getCandidateById(candidateId)?.name }}</h4>
            </div>
          </div>
        </div>

        <!-- ===== 선택 히스토리 섹션 ===== -->
        <!-- 라운드별 매치 기록 (누구 vs 누구 → 누구 선택) -->
        <div class="history-section card card-glass">
          <h2>📊 선택 히스토리</h2>
          <div class="history-timeline">
            <!-- selectionHistory: computed로 계산된 선택 기록 배열 -->
            <div
              v-for="(selection, index) in selectionHistory"
              :key="index"
              class="history-item"
            >
              <div class="round-label">{{ selection.round }}</div>
              <div class="vs-match">
                <div class="candidate-mini">
                  <img :src="getImageUrl(selection.left.imageUrl)" :alt="selection.left.name" />
                  <span>{{ selection.left.name }}</span>
                </div>
                <span class="vs">VS</span>
                <div class="candidate-mini">
                  <img :src="getImageUrl(selection.right.imageUrl)" :alt="selection.right.name" />
                  <span>{{ selection.right.name }}</span>
                </div>
              </div>
              <div class="selected">
                선택: <strong>{{ selection.selected.name }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== 액션 버튼 ===== -->
        <div class="actions">
          <router-link :to="`/worldcup/${worldcupId}/play`" class="btn btn-primary">
            다시 하기
          </router-link>
          <router-link :to="`/worldcup/${worldcupId}/ranking`" class="btn btn-outline">
            전체 랭킹 보기
          </router-link>
          <router-link to="/worldcup" class="btn btn-outline">
            목록으로
          </router-link>
        </div>
      </div>

      <!-- ===== 로딩 상태 ===== -->
      <div v-else class="loading">
        <el-icon class="is-loading" size="60"><Loading /></el-icon>
        <p>결과를 불러오는 중...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ============================================================================
 * WorldcupResult.vue - Script Section
 * ============================================================================
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'  // 로딩 스피너 아이콘
import apiClient from '@/api/axios'                 // Axios 인스턴스
import { calculateWinRate } from '@/utils/helpers'
import {getImageUrl} from "../../utils/helpers.js"; // 승률 계산 유틸

// ===== 라우터 =====
const route = useRoute()
const worldcupId = route.params.id  // URL에서 월드컵 ID 추출

// ===== 반응형 상태 =====
const result = ref(null)        // 결과 데이터 (winnerId, top4, selections)
const candidates = ref([])      // 후보 목록 (ID → 객체 매핑용)
const winner = ref(null)        // 우승자 객체

// ===== Computed =====
/**
 * 선택 히스토리 계산
 * - result.selections 배열을 라운드별 매치 정보로 변환
 * - 반환값: [{ round, left, right, selected }, ...]
 */
const selectionHistory = computed(() => {
  if (!result.value || !result.value.selections) return []
  
  const history = []
  const selections = result.value.selections
  const rounds = ['32강', '16강', '8강', '준결승', '결승']
  
  let roundIndex = 0
  let matchesInRound = 16  // 32강 = 16경기
  let currentMatch = 0
  
  for (let i = 0; i < selections.length - 1; i += 2) {
    const leftId = selections[i]
    const rightId = selections[i + 1]
    const selectedId = i + 1 < selections.length - 1 ? selections[i + 2] : selections[i + 1]
    
    history.push({
      round: rounds[roundIndex],
      left: getCandidateById(leftId),
      right: getCandidateById(rightId),
      selected: getCandidateById(selectedId)
    })
    
    currentMatch++
    if (currentMatch >= matchesInRound) {
      roundIndex++
      matchesInRound = Math.floor(matchesInRound / 2)
      currentMatch = 0
    }
  }
  
  return history
})

// ===== 라이프사이클 훅 =====
/**
 * 마운트 시 결과 및 후보 데이터 로드
 */
onMounted(async () => {
  try {
    const [resultsRes, candidatesRes] = await Promise.all([
      // 최신 결과 1개 조회
      apiClient.get(`/worldcup_results?worldcupId=${worldcupId}&_sort=createdAt&_order=desc&_limit=1`),
      apiClient.get(`/worldcup_candidates?worldcupId=${worldcupId}`)
    ])
    
    if (resultsRes.data && resultsRes.data.length > 0) {
      result.value = resultsRes.data[0]
      candidates.value = candidatesRes.data
      winner.value = getCandidateById(result.value.winnerId)
    }
  } catch (error) {
    console.error('Failed to load result:', error)
  }
})

// ===== 메서드 =====
/**
 * ID로 후보 객체 조회
 * @param {number|string} id - 후보 ID
 * @returns {Object|undefined}
 */
function getCandidateById(id) {
  return candidates.value.find(c => c.id === id)
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

.winner-section {
  text-align: center;
  padding: var(--spacing-2xl);
}

.winner-section h2 {
  margin-bottom: var(--spacing-xl);
  color: var(--primary-light);
}

.winner-card {
  max-width: 400px;
  margin: 0 auto;
}

.winner-card img {
  width: 100%;
  max-width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-xl);
}

.winner-card h3 {
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
}

.winner-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
  color: var(--text-secondary);
}

.top4-section {
  padding: var(--spacing-2xl);
}

.top4-section h2 {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  color: var(--primary-light);
}

.top4-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-lg);
}

.top4-item {
  position: relative;
  text-align: center;
}

.rank-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gradient-primary);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  z-index: 10;
}

.top4-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-sm);
}

.history-section {
  padding: var(--spacing-2xl);
}

.history-section h2 {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  color: var(--primary-light);
}

.history-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 800px;
  margin: 0 auto;
}

.history-item {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
}

.round-label {
  font-weight: bold;
  color: var(--primary-light);
  margin-bottom: var(--spacing-sm);
}

.vs-match {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.candidate-mini {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.candidate-mini img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
}

.vs {
  font-weight: bold;
  color: var(--text-muted);
}

.selected {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.selected strong {
  color: var(--primary-light);
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
  .winner-stats {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .top4-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .vs-match {
    flex-direction: column;
  }

  .candidate-mini {
    width: 100%;
  }
}
</style>
