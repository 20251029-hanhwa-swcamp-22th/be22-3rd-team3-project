<!--
  ============================================================================
  WorldcupGame.vue - 월드컵 게임 진행 페이지
  ============================================================================
  
  [페이지 개요]
  - 실제 월드컵 토너먼트 게임이 진행되는 핵심 페이지
  - 32강 → 16강 → 8강 → 4강 → 결승 순으로 진행
  - 두 후보 중 하나를 선택하면 다음 라운드에 진출
  
  [라우트]
  - 현재 경로: /worldcup/:id/play
  - 결과 보기 클릭 시: /worldcup/:id/result
  - 목록으로 클릭 시: /worldcup
  
  [사용하는 API]
  - worldcupApi.getWorldcup(id)       : 월드컵 정보 조회
  - worldcupApi.startWorldcup(id, 32) : 게임 시작 (32명 후보 셔플하여 반환)
  
  [사용하는 Store]
  - worldcupStore.startGame()         : 게임 초기화
  - worldcupStore.selectCandidate()   : 후보 선택 처리
  - worldcupStore.saveResult()        : 결과 저장
  
  [담당] 팀원1 - 월드컵 도메인
  ============================================================================
-->
<template>
  <div class="worldcup-game-page">
    <!-- ===== 파티클 효과 ===== -->
    <!-- 게임 우승 시 색종이 효과 표시 (3초 동안) -->
    <ParticleEffect v-if="showParticles" type="confetti" :duration="3000" @complete="showParticles = false" />
    
    <div class="container">
      <!-- ===== 게임 헤더 (라운드 정보) ===== -->
      <!-- 월드컵 제목, 현재 라운드명, 진행률 표시 -->
      <div class="game-header">
        <h2 class="game-title">{{ worldcup?.title }}</h2>
        <!-- 현재 라운드 배지 (32강, 16강, 8강, 4강, 결승) -->
        <div class="round-badge">{{ roundName }}</div>
        <!-- 진행률 프로그레스 바 -->
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress.percentage + '%' }"></div>
          </div>
          <!-- 현재 매치 / 총 매치 수 표시 -->
          <span class="progress-text">{{ progress.current }} / {{ progress.total }}</span>
        </div>
      </div>

      <!-- ===== 매치 컨테이너 (게임 진행 중) ===== -->
      <!-- 게임이 끝나지 않았고 현재 매치가 있을 때만 표시 -->
      <div v-if="!gameFinished && currentMatch" class="match-container">
        <div class="candidates">
          <!-- 왼쪽 후보 카드 -->
          <!-- selected: 이 카드가 선택됨, dimmed: 상대 카드가 선택됨 -->
          <div 
            class="candidate-card"
            :class="{ 'selected': selectedCard === 'left', 'dimmed': selectedCard === 'right' }"
            @click="selectCandidate(currentMatch.left, 'left')"
          >
            <img :src="currentMatch.left.imageUrl" :alt="currentMatch.left.name" />
            <h3>{{ currentMatch.left.name }}</h3>
          </div>

          <!-- VS 배지 (애니메이션 적용) -->
          <div class="vs-badge">VS</div>

          <!-- 오른쪽 후보 카드 -->
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

      <!-- ===== 결과 컨테이너 (게임 종료 시) ===== -->
      <!-- 최종 우승자 표시 + 결과 보기/목록으로 버튼 -->
      <div v-if="gameFinished" class="result-container">
        <h2 class="winner-title bounce-in">🏆 우승자!</h2>
        <!-- 우승자 카드 -->
        <div class="winner-card">
          <img :src="winner?.imageUrl" :alt="winner?.name" />
          <h3>{{ winner?.name }}</h3>
        </div>
        <!-- 액션 버튼들 -->
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
/**
 * ============================================================================
 * WorldcupGame.vue - Script Section
 * ============================================================================
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorldcupStore } from '@/stores/worldcup'  // 월드컵 게임 상태 관리
import { worldcupApi } from '@/api/worldcupApi'       // 월드컵 API
import { ElMessage } from 'element-plus'              // 에러 메시지 표시용
import ParticleEffect from '@/components/ParticleEffect.vue'  // 파티클 효과 컴포넌트

// ===== 라우터 & 스토어 =====
const route = useRoute()
const router = useRouter()
const worldcupStore = useWorldcupStore()

// ===== 반응형 상태 (Reactive State) =====
const worldcupId = route.params.id   // URL에서 월드컵 ID 추출
const worldcup = ref(null)           // 월드컵 정보 객체
const gameFinished = ref(false)      // 게임 종료 여부
const winner = ref(null)             // 최종 우승자 객체
const selectedCard = ref(null)       // 현재 선택된 카드 ('left' | 'right' | null)
const showParticles = ref(false)     // 파티클 효과 표시 여부

// ===== Computed (Store에서 가져오는 값) =====
/**
 * 현재 매치 정보 - { left: 후보1, right: 후보2 }
 */
const currentMatch = computed(() => worldcupStore.getCurrentMatch())

/**
 * 현재 라운드명 - '32강', '16강', '8강', '4강', '결승'
 */
const roundName = computed(() => worldcupStore.roundName)

/**
 * 진행률 정보 - { current: 현재 매치, total: 총 매치, percentage: 퍼센트 }
 */
const progress = computed(() => worldcupStore.getProgress())

// ===== 라이프사이클 훅 =====
/**
 * 컴포넌트 마운트 시 실행
 * 1. 월드컵 정보 조회
 * 2. 게임 시작 API 호출 (32명 후보 셔플)
 * 3. Store에 게임 초기화
 */
onMounted(async () => {
  try {
    // 병렬로 월드컵 정보와 게임 시작 API 호출
    const [worldcupRes, candidatesRes] = await Promise.all([
      worldcupApi.getWorldcup(worldcupId),        // 월드컵 상세 정보
      worldcupApi.startWorldcup(worldcupId, 32)   // 32강용 후보 셔플
    ])
    
    worldcup.value = worldcupRes.data
    // Store에 게임 상태 초기화 (월드컵 정보 + 셔플된 후보 목록)
    worldcupStore.startGame(worldcup.value, candidatesRes.data)
  } catch (error) {
    ElMessage.error('월드컵을 불러오는데 실패했습니다')
    router.push('/worldcup')  // 에러 시 목록 페이지로 이동
  }
})

// ===== 메서드 =====
/**
 * 후보 선택 핸들러
 * @param {Object} candidate - 선택된 후보 객체
 * @param {string} side - 선택된 위치 ('left' | 'right')
 * 
 * [동작 흐름]
 * 1. 선택 애니메이션 표시 (selectedCard 설정)
 * 2. 600ms 후 Store에 선택 처리
 * 3. 게임 종료 시 우승자 저장 + 파티클 효과
 */
function selectCandidate(candidate, side) {
  selectedCard.value = side  // 선택 애니메이션 트리거
  
  // 애니메이션 완료 후 다음 로직 실행
  setTimeout(() => {
    const result = worldcupStore.selectCandidate(candidate)
    
    // 게임이 끝났으면 결과 처리
    if (result.finished) {
      gameFinished.value = true
      winner.value = result.winner
      worldcupStore.saveResult(result.winner)  // 결과 저장 (통계 업데이트)
      showParticles.value = true               // 축하 파티클 효과
    }
    
    selectedCard.value = null  // 애니메이션 리셋
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
