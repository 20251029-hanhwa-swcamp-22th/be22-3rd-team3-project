<template>
  <div class="quiz-game-page">
    <div class="container">
      <!-- 게임 헤더: 퀴즈 제목과 통계(문제 수, 점수, 시간)를 보여줍니다 -->
      <div class="game-header" v-if="quiz">
        <h2>{{ quiz.title }}</h2>
        <div class="game-stats">
          <div class="stat-item">
            <span class="label">문제</span>
            <!-- 현재 문제 번호 / 전체 문제 수 -->
            <span class="value">{{ currentQuestionIndex + 1 }} / {{ quizStore.totalQuestions }}</span>
          </div>
          <div class="stat-item">
            <span class="label">점수</span>
            <span class="value">{{ quizStore.score }}</span>
          </div>
        </div>
      </div>

      <!-- 진행바: 전체 문제 중 얼마나 풀었는지 시각적으로 보여줍니다 -->
      <div class="progress-bar mb-4">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <!-- 게임 진행 중: 문제가 있을 때만 보여줍니다 -->
      <div v-if="!gameFinished && currentQuestion" class="question-container card card-glass">
        <div class="question-header">
          <h3>문제 {{ currentQuestionIndex + 1 }}</h3>
          <!-- 문제별 제한시간 타이머 -->
          <div class="question-timer">
            <el-icon><Timer /></el-icon>
            <span>{{ formatTime(quizStore.questionTimeRemaining) }}</span>
          </div>
        </div>

        <div class="question-text">
          {{ currentQuestion.questionText }}
        </div>

        <!-- 문제 이미지가 있는 경우에만 이미지를 표시합니다 -->
        <div class="question-image" v-if="currentQuestion.questionImage">
          <img :src="getImageUrl(currentQuestion.questionImage)" :alt="'문제 ' + (currentQuestionIndex + 1)" />
        </div>

        <div class="answer-section">
          <!-- 정답 입력창 -->
          <!-- 엔터키를 누르면(@keyup.enter) 바로 제출됩니다 -->
          <el-input
            v-model="userAnswer"
            placeholder="정답을 입력하세요"
            size="large"
            :disabled="answerSubmitted"
            @keyup.enter="submitAnswer"
            ref="answerInput"
          />

          <div class="action-buttons">
            <!-- 제출 버튼: 정답을 입력했을 때만 활성화됩니다 -->
            <el-button
              type="primary"
              size="large"
              @click="submitAnswer"
              :disabled="!userAnswer || answerSubmitted"
            >
              제출
            </el-button>

            <!-- 건너뛰기 버튼: 현재 문제를 포기하고 넘어갑니다 -->
            <el-button
              type="info"
              size="large"
              @click="skipQuestion"
              :disabled="answerSubmitted"
            >
              건너뛰기
            </el-button>
          </div>
        </div>
      </div>

      <!-- 정답/오답 피드백: 화면 중앙에 고정 표시 -->
      <div v-if="answerSubmitted" class="feedback-overlay">
        <div class="feedback" :class="{ correct: isCorrect, incorrect: !isCorrect }">
          <div class="feedback-icon">
            <el-icon v-if="isCorrect" size="60"><CircleCheck /></el-icon>
            <el-icon v-else size="60"><CircleClose /></el-icon>
          </div>
          <div class="feedback-text">
            <h3 v-if="isCorrect">정답입니다!</h3>
            <h3 v-else>오답입니다</h3>
            <p>정답: {{ currentQuestion.answer }}</p>
            <p v-if="isCorrect">+{{ lastScore }}점</p>
          </div>
        </div>
      </div>

      <!-- 게임 종료: 모든 문제를 풀거나 시간이 다 되었을 때 -->
      <div v-if="gameFinished" class="result-container">
        <h2 class="gradient-text">🎉 퀴즈 완료!</h2>
        <div class="result-card card card-glass">
          <div class="result-stats">
            <div class="stat-box">
              <div class="stat-label">최종 점수</div>
              <div class="stat-value">{{ finalScore }}점</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">정답률</div>
              <div class="stat-value">{{ correctRate }}%</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">티어</div>
              <div class="stat-value tier">{{ quizStore.tier }}</div>
            </div>
          </div>

          <div class="result-details">
            <p>정답: {{ quizStore.correctCount }} / {{ quizStore.totalQuestions }}</p>
          </div>

          <div class="result-actions">
            <!-- 결과 상세 페이지로 이동 -->
            <router-link :to="`/quiz/${quizId}/result`" class="btn btn-primary">
              상세 결과 보기
            </router-link>
            <router-link to="/quiz" class="btn btn-outline">
              목록으로
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import { Timer, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { quizApi } from '@/api/quizApi'
import {formatTime, getImageUrl} from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
// Pinia 스토어를 사용하여 게임 상태를 관리합니다.
const quizStore = useQuizStore()

// URL에서 퀴즈 ID를 추출합니다.
const quizId = route.params.id

// ==========================================
// State (상태 데이터)
// ==========================================

const quiz = ref(null) // 퀴즈 기본 정보
const userAnswer = ref('') // 사용자가 입력한 정답
const answerSubmitted = ref(false) // 정답 제출 여부 (중복 제출 방지 및 UI 표시용)
const isCorrect = ref(false) // 현재 문제 정답 여부
const lastScore = ref(0) // 방금 획득한 점수
const gameFinished = ref(false) // 게임 종료 여부
const answerInput = ref(null) // 입력창 DOM 참조 (포커스 이동용)
const finalScoreValue = ref(0) // 최종 점수 저장용

// ==========================================
// Computed Properties (계산된 속성)
// ==========================================

// 스토어에서 현재 문제 정보를 가져옵니다.
const currentQuestion = computed(() => quizStore.getCurrentQuestion())
const currentQuestionIndex = computed(() => quizStore.currentQuestionIndex)

// 상단 진행바의 너비(%)를 계산합니다.
const progress = computed(() => {
  if (!quizStore.totalQuestions) return 0
  return ((currentQuestionIndex.value + 1) / quizStore.totalQuestions) * 100
})

// 정답률을 계산합니다.
const correctRate = computed(() => {
  if (!quizStore.totalQuestions) return 0
  return Math.round((quizStore.correctCount / quizStore.totalQuestions) * 100)
})

// 최종 점수를 계산합니다 (correctCount 기반)
const finalScore = computed(() => {
  return quizStore.correctCount * 10
})

// ==========================================
// Watchers (감시자)
// ==========================================

// 시간 초과 감지 및 피드백 표시
watch(() => quizStore.timeoutOccurred, (newValue) => {
  if (newValue) {
    // 시간 초과 발생 시 피드백 표시
    answerSubmitted.value = true
    isCorrect.value = false
    lastScore.value = 0
    
    ElMessage.warning('시간 초과!')
    
    // 2초 후 다음 문제로 이동
    setTimeout(() => {
      quizStore.resetTimeoutFlag()
      moveToNextQuestion()
    }, 2000)
  }
})

// 게임 종료 감지 및 플레이 카운트 증가
watch(gameFinished, (newVal) => {
  if (newVal) {
    quizApi.increasePlayCount(quizId).catch(err => console.error('Play count update failed:', err));
  }
})

// ==========================================
// Lifecycle Hooks
// ==========================================

// 컴포넌트 마운트 시 게임을 초기화하고 시작합니다.
onMounted(async () => {
  try {
    // 퀴즈 정보와 문제 목록을 동시에 가져옵니다.
    const [quizRes, questionsRes] = await Promise.all([
      quizApi.getQuiz(quizId),
      quizApi.startQuiz(quizId)
    ])

    quiz.value = quizRes.data
    // 스토어의 startGame 액션을 호출하여 게임을 시작합니다.
    quizStore.startGame(quiz.value, questionsRes.data)

    // 화면이 다 그려진 후(nextTick) 첫 문제 입력창에 커서를 위치시킵니다.
    await nextTick()
    answerInput.value?.focus()

    // 조회수 증가
    quizApi.increaseViewCount(quizId).catch(err => console.error('View count update failed:', err));
  } catch (error) {
    console.error('Failed to load quiz:', error)
    ElMessage.error('퀴즈를 불러오는데 실패했습니다')
    router.push('/quiz')
  }
})

// 컴포넌트가 사라질 때 게임 상태를 초기화합니다.
onUnmounted(() => {
  quizStore.resetGame()
})

// ==========================================
// Methods (함수)
// ==========================================

/**
 * 정답 제출 처리
 * 사용자가 입력한 답을 확인하고 피드백을 보여줍니다.
 */
async function submitAnswer() {
  if (!userAnswer.value || answerSubmitted.value) return

  // 즉시 타이머 정지 (시간 초과 이벤트 방지)
  quizStore.stopQuestionTimer()
  
  answerSubmitted.value = true // 제출 상태로 변경

  // 스토어의 checkAnswer 함수로 정답 확인
  const result = quizStore.checkAnswer(userAnswer.value)
  isCorrect.value = result.correct
  lastScore.value = result.score

  if (result.correct) {
    ElMessage.success('정답입니다!')
  } else {
    ElMessage.error('오답입니다')
  }

  // 2초 동안 결과를 보여주고 다음 문제로 넘어갑니다.
  setTimeout(() => {
    moveToNextQuestion()
  }, 2000)
}

/**
 * 문제 건너뛰기
 * 현재 문제를 푼 것으로 처리하지 않고(오답 처리) 넘어갑니다.
 */
function skipQuestion() {
  // 타이머 정지
  quizStore.stopQuestionTimer()
  
  quizStore.skipQuestion()
  moveToNextQuestion()
  ElMessage.info('문제를 건너뛰었습니다')
}

/**
 * 다음 문제로 이동 처리
 * 다음 문제를 불러오거나 게임을 종료합니다.
 */
async function moveToNextQuestion() {
  // 상태 초기화
  userAnswer.value = ''
  answerSubmitted.value = false
  isCorrect.value = false

  // 다음 문제로 이동하기 전에 먼저 종료 체크
  // currentQuestionIndex는 0부터 시작하므로
  // index가 9(10번째 문제)이고 totalQuestions가 10이면 마지막 문제
  if (quizStore.currentQuestionIndex + 1 >= quizStore.totalQuestions) {
    // endGame() 호출 - 티어 산정 수행
    quizStore.endGame()
    
    // 점수를 로컬 변수에 확실하게 저장 (gameFinished 전에!)
    // quizStore.score를 우선 사용
    const currentScore = quizStore.score
    const calculatedScore = quizStore.correctCount * 10
    finalScoreValue.value = currentScore !== undefined && currentScore !== null ? currentScore : calculatedScore
    
    console.log('게임 종료 - 점수 저장:', {
      storeScore: currentScore,
      calculatedScore: calculatedScore,
      finalScore: finalScoreValue.value,
      correctCount: quizStore.correctCount
    })
    
    // 점수 설정 후 UI 업데이트를 기다림
    await nextTick()
    
    // 마지막 문제를 완료했으면 바로 종료 처리
    gameFinished.value = true
    await quizStore.saveResult()
    return  // 더 이상 진행하지 않음
  }

  // 아직 문제가 남았으면 다음 문제로 이동
  const nextResult = quizStore.nextQuestion()

  if (!nextResult.finished) {
    // 다음 문제가 있으면 입력창에 포커스를 줍니다.
    await nextTick()
    answerInput.value?.focus()
  }
}
</script>

<style scoped>
.game-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.game-header h2 {
  margin-bottom: var(--spacing-md);
}

.game-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.stat-item .label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-item .value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-light);
}

.stat-item .timer {
  color: var(--success);
}

.stat-item .timer.warning {
  color: var(--danger);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.question-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.question-header h3 {
  margin: 0;
  color: var(--primary-light);
}

.question-timer {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 1.25rem;
  font-weight: bold;
}

.question-image {
  width: 100%;
  max-width: 250px;
  margin: 0 auto var(--spacing-lg);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.question-image img {
  width: 100%;
  height: auto;
}

.question-text {
  font-size: 1.5rem;
  font-weight: 500;
  text-align: center;
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.answer-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

/* 피드백 오버레이 - 화면 전체를 덮는 반투명 배경 */
.feedback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
}

/* 피드백 카드 */
.feedback {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  text-align: center;
  min-width: 300px;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.3s ease-in-out;
}

.feedback.correct {
  background: #67c23a;
  border: 2px solid var(--success);
  color: white;
}

.feedback.incorrect {
  background: #f56c6c;
  border: 2px solid var(--danger);
  color: white;
}

.feedback-icon {
  margin-bottom: var(--spacing-md);
  color: white;
}

.feedback.correct .feedback-icon {
  color: white;
}

.feedback.incorrect .feedback-icon {
  color: white;
}

.feedback-text h3 {
  margin-bottom: var(--spacing-sm);
}

.feedback-text p {
  margin: var(--spacing-xs) 0;
  font-size: 1.125rem;
}

.result-container {
  text-align: center;
  padding: var(--spacing-2xl);
}

.result-card {
  max-width: 600px;
  margin: var(--spacing-xl) auto;
  padding: var(--spacing-2xl);
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-box {
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-light);
}

.stat-value.large {
  font-size: 3rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-value.tier {
  color: var(--warning);
}

.result-details {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
}

.result-details p {
  margin: var(--spacing-sm) 0;
  font-size: 1.125rem;
}

.result-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

@media (max-width: 768px) {
  .game-stats {
    gap: var(--spacing-md);
  }

  .stat-item .value {
    font-size: 1.25rem;
  }

  .question-text {
    font-size: 1.25rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons button {
    width: 100%;
  }
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

</style>
