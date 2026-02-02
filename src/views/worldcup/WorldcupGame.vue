<template>
  <div class="worldcup-game-page">
    <ParticleEffect v-if="showParticles" type="confetti" :duration="3000" @complete="showParticles = false" />
    
    <div class="container">
      <!-- 라운드 정보 -->
      <div class="game-header">
        <h2 class="game-title">{{ worldcup?.title }}</h2>
        <div class="round-badge">{{ roundName }}</div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress.percentage + '%' }"></div>
          </div>
          <span class="progress-text">{{ progress.current }} / {{ progress.total }}</span>
        </div>
      </div>

      <!-- 매치 -->
      <div v-if="!gameFinished && currentMatch" class="match-container">
        <div class="candidates">
          <div 
            class="candidate-card"
            :class="{ 'selected': selectedCard === 'left', 'dimmed': selectedCard === 'right' }"
            @click="selectCandidate(currentMatch.left, 'left')"
          >
            <img :src="currentMatch.left.imageUrl" :alt="currentMatch.left.name" />
            <h3>{{ currentMatch.left.name }}</h3>
          </div>

          <div class="vs-badge">VS</div>

          <div 
            class="candidate-card"
            :class="{ 'selected': selectedCard === 'right', 'dimmed': selectedCard === 'left' }"
            @click="selectCandidate(currentMatch.right, 'right')"
          >
            <img :src="currentMatch.right.imageUrl" :alt="currentMatch.right.name" />
            <h3>{{ currentMatch.right.name }}</h3>
          </div>
        </div>
      </div>

      <!-- 결과 -->
      <div v-if="gameFinished" class="result-container">
        <h2 class="winner-title bounce-in">🏆 우승자!</h2>
        <div class="winner-card">
          <img :src="winner?.imageUrl" :alt="winner?.name" />
          <h3>{{ winner?.name }}</h3>
        </div>
        <div class="result-actions">
          <router-link :to="`/worldcup/${worldcupId}/result`" class="btn btn-primary btn-lg">
            결과 보기
          </router-link>
          <router-link to="/worldcup" class="btn btn-secondary btn-lg">
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
import { useWorldcupStore } from '@/stores/worldcup'
import { worldcupApi } from '@/api/worldcupApi'
import { ElMessage } from 'element-plus'
import ParticleEffect from '@/components/ParticleEffect.vue'

const route = useRoute()
const router = useRouter()
const worldcupStore = useWorldcupStore()

const worldcupId = route.params.id
const worldcup = ref(null)
const gameFinished = ref(false)
const winner = ref(null)
const selectedCard = ref(null)
const showParticles = ref(false)

const currentMatch = computed(() => worldcupStore.getCurrentMatch())
const roundName = computed(() => worldcupStore.roundName)
const progress = computed(() => worldcupStore.getProgress())

onMounted(async () => {
  try {
    const [worldcupRes, candidatesRes] = await Promise.all([
      worldcupApi.getWorldcup(worldcupId),
      worldcupApi.startWorldcup(worldcupId, 32)
    ])
    
    worldcup.value = worldcupRes.data
    worldcupStore.startGame(worldcup.value, candidatesRes.data)
  } catch (error) {
    ElMessage.error('월드컵을 불러오는데 실패했습니다')
    router.push('/worldcup')
  }
})

function selectCandidate(candidate, side) {
  selectedCard.value = side
  
  setTimeout(() => {
    const result = worldcupStore.selectCandidate(candidate)
    
    if (result.finished) {
      gameFinished.value = true
      winner.value = result.winner
      worldcupStore.saveResult(result.winner)
      showParticles.value = true
    }
    
    selectedCard.value = null
  }, 600)
}
</script>

<style scoped>
.worldcup-game-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFE8F5 0%, #FFF5FA 100%);
  padding: 2rem 0;
}

.game-header {
  text-align: center;
  margin-bottom: 3rem;
}

.game-title {
  font-size: 2rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #FFB3D9, #FF8CC5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.round-badge {
  display: inline-block;
  background: linear-gradient(135deg, #FFB3D9, #FF8CC5);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 16px rgba(255, 140, 197, 0.3);
}

.progress-container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 12px;
  background: white;
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFB3D9, #FF8CC5);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 600;
  color: #666;
  min-width: 80px;
}

/* 매치 */
.match-container {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.candidates {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 3rem;
  align-items: center;
  max-width: 1000px;
  width: 100%;
}

.candidate-card {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.candidate-card:hover {
  transform: translateY(-12px) scale(1.05);
  box-shadow: 0 20px 40px rgba(255, 179, 217, 0.4);
}

.candidate-card.selected {
  transform: scale(1.15) rotate(3deg);
  box-shadow: 0 24px 48px rgba(255, 140, 197, 0.5);
  z-index: 10;
}

.candidate-card.dimmed {
  opacity: 0.3;
  filter: grayscale(100%);
  transform: scale(0.9);
}

.candidate-card img {
  width: 100%;
  height: 320px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 1rem;
}

.candidate-card h3 {
  text-align: center;
  font-size: 1.3rem;
  color: #2D2D2D;
}

.vs-badge {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #FFB3D9, #D4BBFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

/* 결과 */
.result-container {
  text-align: center;
  padding: 3rem 0;
}

.winner-title {
  font-size: 3rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #FFB3D9, #FF8CC5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.winner-card {
  max-width: 400px;
  margin: 0 auto 2rem;
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(255, 179, 217, 0.3);
}

.winner-card img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 1rem;
}

.winner-card h3 {
  font-size: 1.8rem;
}

.result-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .candidates {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .vs-badge {
    transform: rotate(90deg);
  }
  
  .candidate-card img {
    height: 240px;
  }
}
</style>
