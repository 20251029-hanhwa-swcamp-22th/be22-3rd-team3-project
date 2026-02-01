<template>
  <div class="worldcup-game-page">
    <div class="container">
      <div class="game-header">
        <h2>{{ worldcup?.title }}</h2>
        <div class="progress-info">
          <span>{{ roundName }}</span>
          <span>{{ progress.current }} / {{ progress.total }}</span>
        </div>
      </div>

      <div class="progress-bar mb-4">
        <div class="progress-fill" :style="{ width: progress.percentage + '%' }"></div>
      </div>

      <div v-if="!gameFinished && currentMatch" class="match-container">
        <div class="candidates">
          <div class="candidate-card card" @click="selectCandidate(currentMatch.left)">
            <img :src="currentMatch.left.imageUrl" :alt="currentMatch.left.name" />
            <h3>{{ currentMatch.left.name }}</h3>
          </div>

          <div class="vs-divider">VS</div>

          <div class="candidate-card card" @click="selectCandidate(currentMatch.right)">
            <img :src="currentMatch.right.imageUrl" :alt="currentMatch.right.name" />
            <h3>{{ currentMatch.right.name }}</h3>
          </div>
        </div>
      </div>

      <div v-if="gameFinished" class="result-container">
        <h2 class="gradient-text">🏆 우승자!</h2>
        <div class="winner-card card">
          <img :src="winner?.imageUrl" :alt="winner?.name" />
          <h3>{{ winner?.name }}</h3>
        </div>
        <div class="result-actions">
          <router-link :to="`/worldcup/${worldcupId}/result`" class="btn btn-primary">
            결과 보기
          </router-link>
          <router-link to="/worldcup" class="btn btn-outline">
            목록으로
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorldcupStore } from '../../stores/worldcup'
import api from '../../services/api'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const worldcupStore = useWorldcupStore()

const worldcupId = route.params.id
const worldcup = ref(null)
const gameFinished = ref(false)
const winner = ref(null)

const currentMatch = computed(() => worldcupStore.getCurrentMatch())
const roundName = computed(() => worldcupStore.roundName)
const progress = computed(() => worldcupStore.getProgress())

onMounted(async () => {
  try {
    const [worldcupRes, candidatesRes] = await Promise.all([
      api.getWorldcup(worldcupId),
      api.startWorldcup(worldcupId, 32)
    ])
    
    worldcup.value = worldcupRes.data
    worldcupStore.startGame(worldcup.value, candidatesRes.data)
  } catch (error) {
    ElMessage.error('월드컵을 불러오는데 실패했습니다')
    router.push('/worldcup')
  }
})

function selectCandidate(candidate) {
  const result = worldcupStore.selectCandidate(candidate)
  
  if (result.finished) {
    gameFinished.value = true
    winner.value = result.winner
    worldcupStore.saveResult(result.winner)
  }
}
</script>

<style scoped>
.game-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.progress-info {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);
  color: var(--text-secondary);
}

.match-container {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.candidates {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--spacing-xl);
  align-items: center;
  width: 100%;
  max-width: 1000px;
}

.candidate-card {
  cursor: pointer;
  text-align: center;
  padding: var(--spacing-xl);
  transition: all var(--transition-normal);
}

.candidate-card:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
}

.candidate-card img {
  width: 100%;
  max-width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-md);
}

.vs-divider {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-light);
}

.result-container {
  text-align: center;
  padding: var(--spacing-2xl);
}

.winner-card {
  max-width: 400px;
  margin: var(--spacing-xl) auto;
  padding: var(--spacing-xl);
}

.winner-card img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-md);
}

.result-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-top: var(--spacing-xl);
}

@media (max-width: 768px) {
  .candidates {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .vs-divider {
    transform: rotate(90deg);
  }

  .candidate-card img {
    max-width: 200px;
    height: 200px;
  }
}
</style>
