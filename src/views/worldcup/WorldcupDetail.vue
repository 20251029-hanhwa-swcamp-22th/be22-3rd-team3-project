<!--
  ============================================================================
  WorldcupDetail.vue - 월드컵 정보 페이지
  ============================================================================
  [페이지 개요]
  - 월드컵 플레이 전 정보를 표시
  - 라운드 선택(8강/16강/32강) 기능 제공
  - 플레이 버튼으로 게임 시작
  
  [라우트]
  - 현재 경로: /worldcup/:id
  - 플레이 버튼: /worldcup/:id/play?round=선택값
  - 랭킹 보기: /worldcup/:id/ranking
  
  [사용하는 API]
  - worldcupApi.getWorldcup(id)    : 월드컵 정보 조회
  - worldcupApi.getCandidates(id)  : 후보 목록 조회 (라운드 옵션 결정용)
  
  [담당] 팀원1 - 월드컵 도메인
  ============================================================================
-->
<template>
  <div class="worldcup-detail-page">
    <ExitTransition ref="exitTransition" color="#FFB3D9"/>
    <div class="container">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading">
        <el-icon class="is-loading" size="60"><Loading /></el-icon>
        <p>월드컵 정보를 불러오는 중...</p>
      </div>

      <!-- 월드컵 정보 -->
      <div v-else-if="worldcup" class="detail-content">
        <!-- 뒤로가기 버튼 -->
        <div class="back-link">
          <router-link to="/worldcup" class="btn-back">
            <el-icon><ArrowLeft /></el-icon>
            목록으로
          </router-link>
        </div>

        <!-- 메인 카드 -->
        <div class="detail-card card card-glass">
          <!-- 썸네일 -->
          <div class="thumbnail-section">
            <img :src="getImageUrl(worldcup.thumbnail)" :alt="worldcup.title" class="thumbnail" />
          </div>

          <!-- 정보 섹션 -->
          <div class="info-section">
            <h1 class="title gradient-text">{{ worldcup.title }}</h1>
            <p class="description">{{ worldcup.description }}</p>

            <!-- 통계 -->
            <div class="stats">
              <div class="stat-item">
                <span class="stat-icon">👁️</span>
                <span class="stat-value">{{ worldcup.viewCount || 0 }}</span>
                <span class="stat-label">조회수</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🎮</span>
                <span class="stat-value">{{ worldcup.playCount || 0 }}</span>
                <span class="stat-label">플레이</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">👥</span>
                <span class="stat-value">{{ candidatesCount }}</span>
                <span class="stat-label">후보</span>
              </div>
            </div>

            <!-- 라운드 선택 -->
            <div class="round-selection">
              <label class="round-label">라운드 선택</label>
              <el-select 
                v-model="selectedRound" 
                placeholder="라운드를 선택하세요"
                size="large"
                class="round-select"
              >
                <el-option 
                  v-for="option in roundOptions" 
                  :key="option.value" 
                  :label="option.label" 
                  :value="option.value"
                />
              </el-select>
            </div>

            <!-- 액션 버튼 -->
            <div class="actions">
              <el-button 
                type="primary" 
                size="large" 
                class="play-btn"
                @click="startGame"
              >
                🎮 플레이 시작
              </el-button>
              <router-link :to="`/worldcup/${worldcupId}/ranking`" class="btn btn-outline">
                📊 랭킹 보기
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 에러 상태 -->
      <div v-else class="error-state">
        <p>월드컵을 찾을 수 없습니다.</p>
        <router-link to="/worldcup" class="btn btn-primary">목록으로 돌아가기</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ============================================================================
 * WorldcupDetail.vue - Script Section
 * ============================================================================
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loading, ArrowLeft } from '@element-plus/icons-vue'
import { worldcupApi } from '@/api/worldcupApi'
import { getImageUrl } from '@/utils/helpers'
import ExitTransition from '@/components/ExitTransition.vue'

// ===== Router =====
const route = useRoute()
const router = useRouter()
const worldcupId = route.params.id

// ===== Refs =====
const exitTransition = ref(null)
const worldcup = ref(null)
const candidates = ref([])
const loading = ref(true)
const selectedRound = ref(16)  // 기본값: 16강

// ===== Computed =====
const candidatesCount = computed(() => candidates.value.length)

// 라운드 옵션 (후보 수에 따라 동적 결정)
const roundOptions = computed(() => {
  const count = candidatesCount.value
  const options = []
  
  if (count >= 8) options.push({ label: '8강 (8명)', value: 8 })
  if (count >= 16) options.push({ label: '16강 (16명)', value: 16 })
  if (count >= 32) options.push({ label: '32강 (32명)', value: 32 })
  
  return options
})

// ===== Lifecycle =====
onMounted(async () => {
  try {
    // 월드컵 정보와 후보 목록 병렬 로드
    const [worldcupRes, candidatesRes] = await Promise.all([
      worldcupApi.getWorldcup(worldcupId),
      worldcupApi.getCandidates(worldcupId)
    ])
    
    worldcup.value = worldcupRes.data
    candidates.value = candidatesRes.data
    
    // 후보 수에 맞는 기본 라운드 설정
    const count = candidates.value.length
    if (count >= 32) {
      selectedRound.value = 32
    } else if (count >= 16) {
      selectedRound.value = 16
    } else if (count >= 8) {
      selectedRound.value = 8
    }
  } catch (error) {
    console.error('Failed to load worldcup:', error)
  } finally {
    loading.value = false
  }
})

// ===== Methods =====
async function startGame() {
  if (exitTransition.value) {
    await exitTransition.value.trigger()
  }
  router.push(`/worldcup/${worldcupId}/play?round=${selectedRound.value}`)
}
</script>

<style scoped>
.worldcup-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFE8F5 0%, #FFF5FA 100%);
  padding: var(--spacing-xl) 0;
}

.loading {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

.back-link {
  margin-bottom: var(--spacing-lg);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color var(--transition-fast);
}

.btn-back:hover {
  color: var(--primary-light);
}

.detail-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl);
  max-width: 1000px;
  margin: 0 auto;
}

.thumbnail-section {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.thumbnail {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.title {
  font-size: 2rem;
  margin: 0;
}

.description {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
}

.stats {
  display: flex;
  gap: var(--spacing-xl);
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--primary-light);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.round-selection {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.round-label {
  font-weight: 600;
  color: var(--text-primary);
}

.round-select {
  width: 100%;
}

.actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.play-btn {
  flex: 1;
  font-size: 1.125rem;
  padding: var(--spacing-md) var(--spacing-xl);
}

.error-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

.error-state p {
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 768px) {
  .detail-card {
    grid-template-columns: 1fr;
  }
  
  .thumbnail {
    height: 250px;
  }
  
  .stats {
    justify-content: center;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>
