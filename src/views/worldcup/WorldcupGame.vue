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
      <div v-if="!gameFinished && currentMatch" class="match-container" :class="{ 'final-match': roundName === '결승' }">
        <!-- 결승전 FINAL 배경 텍스트 -->
        <div v-if="roundName === '결승'" class="final-background">FINAL</div>
        
        <div class="candidates">
          <!-- 왼쪽 후보 카드 -->
          <!-- 부드러운 2단계 애니메이션: 쳐내기 → 확대 -->
          <div 
            class="candidate-card"
            :class="{
              'push-left': selectedCard === 'left',
              'fly-out-left': selectedCard === 'right' || selectedCard === 'right-expand',
              'winner-expand': selectedCard === 'left-expand',
              'final-card': roundName === '결승'
            }"
            @click="selectCandidate(currentMatch.left, 'left')"
          >
            <img :src="getImageUrl(currentMatch.left.imageUrl)" :alt="currentMatch.left.name" />
            <h3>{{ currentMatch.left.name }}</h3>
          </div>

          <!-- VS 배지 (애니메이션 적용) -->
          <!-- 확대 시 숨김 -->
          <div 
            class="vs-badge" 
            :class="{ 
              'hidden': selectedCard === 'left-expand' || selectedCard === 'right-expand',
              'final-vs': roundName === '결승'
            }"
          >VS</div>

          <!-- 오른쪽 후보 카드 -->
          <div 
            class="candidate-card"
            :class="{
              'push-right': selectedCard === 'right',
              'fly-out-right': selectedCard === 'left' || selectedCard === 'left-expand',
              'winner-expand': selectedCard === 'right-expand',
              'final-card': roundName === '결승'
            }"
            @click="selectCandidate(currentMatch.right, 'right')"
          >
            <img :src="getImageUrl(currentMatch.right.imageUrl)" :alt="currentMatch.right.name" />
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
          <img :src="getImageUrl(winner?.imageUrl)" :alt="winner?.name" />
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

const SERVER_URL = 'http://localhost:3000'

// ===== 헬퍼 함수 =====
/**
 * 이미지 URL 포맷팅
 * - 상대 경로(/uploads/...)를 절대 URL로 변환
 * - 이미 http로 시작하는 경우 그대로 반환
 */
function getImageUrl(url) {
  if (!url) return '/placeholder.jpg'
  if (url.startsWith('http')) return url
  // 슬래시가 없으면 추가
  return url.startsWith('/') ? `${SERVER_URL}${url}` : `${SERVER_URL}/${url}`
}

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
 * 1. 1단계(600ms): 부드러운 쳐내기 애니메이션 (scale 1.3 유지)
 * 2. 2단계(1000ms): 끊김 없이 중앙 확대 (scale 1.3 유지)
 * 3. Store에 선택 처리 및 다음 매치로 전환
 * 4. 게임 종료 시 우승자 저장 + 파티클 효과
 */
function selectCandidate(candidate, side) {
  // 중복 클릭 방지
  if (selectedCard.value !== null) return
  
  // 쳐내기 애니메이션 시작 (1000ms)
  selectedCard.value = side
  
  // 1000ms 후: 바로 다음 매치로 전환
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
  }, 1000)
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
  position: relative;
}

/* 결승전 배경 번쩍이는 효과 */
.match-container.final-match {
  animation: final-flash 4s ease-in-out infinite;
}

@keyframes final-flash {
  0%, 100% {
    background: radial-gradient(circle at center, rgba(255, 215, 0, 0.05) 0%, transparent 70%);
  }
  50% {
    background: radial-gradient(circle at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
  }
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

/* 결승전 카드 - 황금색 빛나는 테두리 */
.candidate-card.final-card {
  border: 3px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #FFD700, #FFA500, #FFD700) border-box;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 0 30px rgba(255, 215, 0, 0.4),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
  animation: golden-glow 3s ease-in-out infinite;
}

@keyframes golden-glow {
  0%, 100% {
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.12),
      0 0 30px rgba(255, 215, 0, 0.4),
      inset 0 0 20px rgba(255, 215, 0, 0.1);
  }
  50% {
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.12),
      0 0 50px rgba(255, 215, 0, 0.8),
      inset 0 0 30px rgba(255, 215, 0, 0.2);
  }
}

.candidate-card.final-card:hover {
  transform: translateY(-12px) scale(1.05);
  box-shadow: 
    0 20px 40px rgba(255, 215, 0, 0.5),
    0 0 60px rgba(255, 215, 0, 1);
}

/* ===== 부드럽게 연결된 2단계 선택 애니메이션 ===== */
/* 
 * Phase 1 (600ms): 쳐내기 - 선택된 카드 scale 1.3으로 확대하며 반대편 밀어냄
 * Phase 2 (1000ms): 확대 - 끊김 없이 중앙으로 이동하며 scale 1.3 유지
 * 핵심: 크기가 처음부터 끝까지 1.3으로 일정
 */

/* Phase 1: 왼쪽 선택 시 쳐내기 (600ms) */
.candidate-card.push-left {
  animation: push-left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  z-index: 10;
}

/* Phase 1: 오른쪽 선택 시 쳐내기 (600ms) */
.candidate-card.push-right {
  animation: push-right 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  z-index: 10;
}

/* Phase 2: 중앙 확대 (1000ms) - 쳐내기 위치부터 부드럽게 연결 */
.candidate-card.winner-expand {
  animation: expand-to-center 1s cubic-bezier(0.34, 1.1, 0.64, 1) forwards;
  z-index: 100;
}

/* 쳐내진 카드 - 화면 밖으로 날아감 (왼쪽) */
.candidate-card.fly-out-left {
  animation: fly-out-left 0.6s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
  z-index: 5;
}

/* 쳐내진 카드 - 화면 밖으로 날아감 (오른쪽) */
.candidate-card.fly-out-right {
  animation: fly-out-right 0.6s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
  z-index: 5;
}

/* VS 배지 숨김 */
.vs-badge.hidden {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

/* ===== Keyframes ===== */

/* Phase 1: 왼쪽 쳐내기 - scale 1.3으로 확대 */
@keyframes push-left {
  0% {
    transform: translateX(0) scale(1);
  }
  100% {
    /* 오른쪽으로 70% 이동하며 확대 (크기 1.3) */
    transform: translateX(65%) scale(1.5);
  }
}

/* Phase 1: 오른쪽 쳐내기 - scale 1.3으로 확대 */
@keyframes push-right {
  0% {
    transform: translateX(0) scale(1);
  }
  100% {
    /* 왼쪽으로 70% 이동하며 확대 (크기 1.3) */
    transform: translateX(-65%) scale(1.5);
  }
}

/* Phase 2: 쳐낸 위치에서 유지 (중앙 이동 없음) */
@keyframes expand-to-center {
  0% {
    /* 쳐내기 애니메이션 끝 상태 유지 */
    transform: scale(1.3);
  }
  100% {
    /* 그대로 유지 */
    transform: scale(1.3);
  }
}

/* 왼쪽으로 날아감 */
@keyframes fly-out-left {
  0% {
    transform: translateX(0) rotate(0deg) scale(1);
    opacity: 1;
  }
  20% {
    /* 살짝 오른쪽으로 밀림 */
    transform: translateX(10%) scale(0.95);
  }
  100% {
    /* 왼쪽으로 날아감 */
    transform: translateX(-150%) rotate(-20deg) scale(0.6);
    opacity: 0;
  }
}

/* 오른쪽으로 날아감 */
@keyframes fly-out-right {
  0% {
    transform: translateX(0) rotate(0deg) scale(1);
    opacity: 1;
  }
  20% {
    /* 살짝 왼쪽으로 밀림 */
    transform: translateX(-10%) scale(0.95);
  }
  100% {
    /* 오른쪽으로 날아감 */
    transform: translateX(150%) rotate(20deg) scale(0.6);
    opacity: 0;
  }
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

/* ===== 결승전 특별 효과 ===== */

/* FINAL 배경 텍스트 */
.final-background {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 15rem;
  font-weight: 900;
  color: rgba(255, 215, 0, 0.08);
  letter-spacing: 2rem;
  z-index: 1;
  pointer-events: none;
  text-shadow: 0 0 80px rgba(255, 215, 0, 0.3);
  animation: final-glow 3s ease-in-out infinite;
}

@keyframes final-glow {
  0%, 100% { 
    opacity: 0.08;
    text-shadow: 0 0 80px rgba(255, 215, 0, 0.3);
  }
  50% { 
    opacity: 0.15;
    text-shadow: 0 0 120px rgba(255, 215, 0, 0.5);
  }
}

/* 결승전 VS 뱃지 - 더 크고 화려하게 */
.vs-badge.final-vs {
  font-size: 4rem;
  background: linear-gradient(135deg, #FFD700, #FFA500, #FFD700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: final-vs-shine 2s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
}

@keyframes final-vs-shine {
  0%, 100% { 
    transform: scale(1) rotate(0deg);
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
  }
  50% { 
    transform: scale(1.2) rotate(5deg);
    filter: drop-shadow(0 0 40px rgba(255, 215, 0, 1));
  }
}


/* 결과 */
.result-container {
  text-align: center;
  padding: 3rem 0;
}

/* 타이틀과 카드를 앞으로 */
.result-container > * {
  position: relative;
  z-index: 1;
}

.winner-title {
  font-size: 3rem;
  margin-bottom: 2rem;
  /* 황금빛으로 변경 */
  background: linear-gradient(135deg, #FFD700, #FFA500, #FFD700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
  animation: title-glow 2s ease-in-out infinite;
}

@keyframes title-glow {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(255, 215, 0, 1));
  }
}

.winner-card {
  max-width: 400px;
  margin: 0 auto 2rem;
  background: white;
  border-radius: 24px;
  padding: 2rem;
  /* 황금색 빛나는 테두리 */
  border: 3px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #FFD700, #FFA500, #FFD700) border-box;
  box-shadow: 
    0 20px 40px rgba(255, 179, 217, 0.3),
    0 0 30px rgba(255, 215, 0, 0.4),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
  animation: winner-golden-glow 3s ease-in-out infinite;
}

@keyframes winner-golden-glow {
  0%, 100% {
    box-shadow: 
      0 20px 40px rgba(255, 179, 217, 0.3),
      0 0 30px rgba(255, 215, 0, 0.4),
      inset 0 0 20px rgba(255, 215, 0, 0.1);
  }
  50% {
    box-shadow: 
      0 20px 40px rgba(255, 179, 217, 0.3),
      0 0 50px rgba(255, 215, 0, 0.8),
      inset 0 0 30px rgba(255, 215, 0, 0.2);
  }
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
