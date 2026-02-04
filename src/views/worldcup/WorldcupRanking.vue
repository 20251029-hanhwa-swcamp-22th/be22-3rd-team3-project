<!--
  ============================================================================
  WorldcupRanking.vue - 월드컵 랭킹 페이지
  ============================================================================
  [페이지 개요]
  - 해당 월드컵의 전체 후보 랭킹을 표시
  - 승률 기준으로 정렬된 후보 목록 제공
  - 우승 횟수, 결승 진출 횟수, 승률 통계 표시
  
  [라우트]
  - 현재 경로: /worldcup/:id/ranking
  - 도전하기: /worldcup/:id/play
  - 목록으로: /worldcup
  
  [사용하는 API]
  - worldcupApi.getWorldcup(id)        : 월드컵 정보 조회
  - worldcupApi.getWorldcupRanking(id) : 랭킹 조회 (승률 기준 정렬)
  
  [담당] 팀원1 - 월드컵 도메인
  ============================================================================
-->
<template>
  <div class="ranking-page">
    <div class="container">
      <!-- ===== 페이지 헤더 ===== -->
      <div class="page-header">
        <h1 class="gradient-text">📊 월드컵 랭킹</h1>
        <p v-if="worldcup">{{ worldcup.title }}</p>
      </div>

      <!-- ===== 랭킹 콘텐츠 ===== -->
      <div v-if="candidates.length > 0" class="ranking-content">
        <div class="ranking-list">
          <!-- 각 후보별 랭킹 아이템 -->
          <div
            v-for="(candidate, index) in candidates"
            :key="candidate.id"
            class="ranking-item card"
            :class="{ 'top-rank': index < 3 }"
          >
            <!-- 순위 배지 (1~3위는 특별 스타일) -->
            <div class="rank" :class="'rank-' + (index + 1)">
              {{ index + 1 }}
            </div>
            <!-- 후보 이미지 -->
            <div class="candidate-image">
              <img :src="getImageUrl(candidate.imageUrl)" :alt="candidate.name" />
            </div>
            <!-- 후보 정보 및 통계 -->
            <div class="candidate-info">
              <h3>{{ candidate.name }}</h3>
              <div class="stats">
                <div class="stat">
                  <span class="label">우승</span>
                  <span class="value">{{ candidate.winCount }}회</span>
                </div>
                <div class="stat">
                  <span class="label">승률</span>
                  <span class="value">{{ getWinRate(candidate, totalWinCount) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== 액션 버튼 ===== -->
        <div class="actions">
          <router-link :to="`/worldcup/${worldcupId}/play`" class="btn btn-primary">
            도전하기
          </router-link>
          <router-link to="/worldcup" class="btn btn-outline">
            목록으로
          </router-link>
        </div>
      </div>

      <!-- ===== 로딩 상태 ===== -->
      <div v-else class="loading">
        <el-icon class="is-loading" size="60"><Loading /></el-icon>
        <p>랭킹을 불러오는 중...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ============================================================================
 * WorldcupRanking.vue - Script Section
 * ============================================================================
 */
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'  // 로딩 아이콘
import { worldcupApi } from '@/api/worldcupApi'   // 월드컵 API
import { getImageUrl, getWinRate } from '@/utils/helpers' // 승률 계산 유틸

// ===== 라우터 =====
const route = useRoute()
const worldcupId = route.params.id  // URL에서 월드컵 ID 추출

// ===== 반응형 상태 =====
const worldcup = ref(null)    // 월드컵 정보 객체
const candidates = ref([])    // 랭킹 정렬된 후보 목록
const totalWinCount = computed(() => {
  return candidates.value.reduce((sum, c) => sum + (c.winCount || 0), 0)
})

// ===== 라이프사이클 훅 =====
/**
 * 마운트 시 월드컵 정보와 랭킹 데이터 로드
 */
onMounted(async () => {
  try {
    // 병렬로 월드컵 정보와 랭킹 조회
    const [worldcupRes, rankingRes] = await Promise.all([
      worldcupApi.getWorldcup(worldcupId),
      worldcupApi.getWorldcupRanking(worldcupId)
    ])
    
    worldcup.value = worldcupRes.data
    candidates.value = rankingRes.data
  } catch (error) {
    console.error('Failed to load ranking:', error)
  }
})
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.page-header p {
  color: var(--text-secondary);
  margin-top: var(--spacing-sm);
}

.ranking-content {
  max-width: 900px;
  margin: 0 auto;
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

.candidate-image {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.candidate-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.candidate-info {
  flex: 1;
}

.candidate-info h3 {
  margin-bottom: var(--spacing-sm);
  font-size: 1.25rem;
}

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
  font-size: 1.125rem;
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
  .ranking-item {
    flex-direction: column;
    text-align: center;
  }

  .stats {
    justify-content: center;
  }
}
</style>
