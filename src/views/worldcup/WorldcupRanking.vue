<template>
  <div class="ranking-page">
    <div class="container">
      <div class="page-header">
        <h1 class="gradient-text">📊 월드컵 랭킹</h1>
        <p v-if="worldcup">{{ worldcup.title }}</p>
      </div>

      <div v-if="candidates.length > 0" class="ranking-content">
        <div class="ranking-list">
          <div
            v-for="(candidate, index) in candidates"
            :key="candidate.id"
            class="ranking-item card"
            :class="{ 'top-rank': index < 3 }"
          >
            <div class="rank" :class="'rank-' + (index + 1)">
              {{ index + 1 }}
            </div>
            <div class="candidate-image">
              <img :src="candidate.imageUrl" :alt="candidate.name" />
            </div>
            <div class="candidate-info">
              <h3>{{ candidate.name }}</h3>
              <div class="stats">
                <div class="stat">
                  <span class="label">우승</span>
                  <span class="value">{{ candidate.winCount }}회</span>
                </div>
                <div class="stat">
                  <span class="label">결승</span>
                  <span class="value">{{ candidate.finalCount }}회</span>
                </div>
                <div class="stat">
                  <span class="label">승률</span>
                  <span class="value">{{ calculateWinRate(candidate) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <router-link :to="`/worldcup/${worldcupId}/play`" class="btn btn-primary">
            도전하기
          </router-link>
          <router-link to="/worldcup" class="btn btn-outline">
            목록으로
          </router-link>
        </div>
      </div>

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
import { worldcupApi } from '@/api/worldcupApi'
import { calculateWinRate } from '@/utils/helpers'

const route = useRoute()
const worldcupId = route.params.id

const worldcup = ref(null)
const candidates = ref([])

onMounted(async () => {
  try {
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
