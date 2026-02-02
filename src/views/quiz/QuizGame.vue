<template>
  <div class="quiz-game-page">
    <div class="container">
      <!-- 게임 헤더 -->
      <div class="game-header" v-if="quiz">
        <h2>{{ quiz.title }}</h2>
        <div class="game-stats">
          <div class="stat-item">
            <span class="label">문제</span>
            <span class="value">{{ currentQuestionIndex + 1 }} / {{ quizStore.totalQuestions }}</span>
          </div>
          <div class="stat-item">
            <span class="label">점수</span>
            <span class="value">{{ quizStore.score }}</span>
          </div>
          <div class="stat-item">
            <span class="label">남은 시간</span>
            <span class="value timer" :class="{ warning: quizStore.remainingTime < 10 }">
              {{ formatTime(quizStore.remainingTime) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 진행바 -->
      <div class="progress-bar mb-4">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <!-- 게임 진행 중 -->
      <div v-if="!gameFinished && currentQuestion" class="question-container card card-glass">
        <div class="question-header">
          <h3>문제 {{ currentQuestionIndex + 1 }}</h3>
          <div class="question-timer">
            <el-icon><Timer /></el-icon>
            <span>{{ formatTime(quizStore.questionTimeRemaining) }}</span>
          </div>
        </div>

        <div class="question-image" v-if="currentQuestion.questionImage">
          <img :src="currentQuestion.questionImage" :alt="'문제 ' + (currentQuestionIndex + 1)" />
        </div>

        <div class="question-text">
          {{ currentQuestion.questionText }}
        </div>

        <div class="answer-section">
          <el-input
            v-model="userAnswer"
            placeholder="정답을 입력하세요"
            size="large"
            :disabled="answerSubmitted"
            @keyup.enter="submitAnswer"
            ref="answerInput"
          />
          
          <div class="action-buttons">
            <el-button
              type="primary"
              size="large"
              @click="submitAnswer"
              :disabled="!userAnswer || answerSubmitted"
            >
              제출
            </el-button>
            <el-button
              type="warning"
              size="large"
              @click="passQuestion"
              :disabled="answerSubmitted || quizStore.passCount >= 3"
            >
              패스 ({{ 3 - quizStore.passCount }})
            </el-button>
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

        <!-- 정답/오답 피드백 -->
        <div v-if="answerSubmitted" class="feedback" :class="{ correct: isCorrect, incorrect: !isCorrect }">
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

      <!-- 게임 종료 -->
      <div v-if="gameFinished" class="result-container">
        <h2 class="gradient-text">🎉 퀴즈 완료!</h2>
        <div class="result-card card card-glass">
          <div class="result-stats">
            <div class="stat-box">
              <div class="stat-label">최종 점수</div>
              <div class="stat-value large">{{ quizStore.score }}</div>
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
            <p>남은 시간: {{ formatTime(quizStore.remainingTime) }}</p>
          </div>

          <div class="result-actions">
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import { Timer, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { quizApi } from '@/api/quizApi'
import { formatTime } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const quizStore = useQuizStore()

const quizId = route.params.id
const quiz = ref(null)
const userAnswer = ref('')
const answerSubmitted = ref(false)
const isCorrect = ref(false)
const lastScore = ref(0)
const gameFinished = ref(false)
const answerInput = ref(null)

const currentQuestion = computed(() => quizStore.getCurrentQuestion())
const currentQuestionIndex = computed(() => quizStore.currentQuestionIndex)
const progress = computed(() => {
  if (!quizStore.totalQuestions) return 0
  return ((currentQuestionIndex.value + 1) / quizStore.totalQuestions) * 100
})
const correctRate = computed(() => {
  if (!quizStore.totalQuestions) return 0
  return Math.round((quizStore.correctCount / quizStore.totalQuestions) * 100)
})

onMounted(async () => {
  try {
    const [quizRes, questionsRes] = await Promise.all([
      quizApi.getQuiz(quizId),
      quizApi.startQuiz(quizId)
    ])
    
    quiz.value = quizRes.data
    quizStore.startGame(quiz.value, questionsRes.data)
    
    // 첫 문제 입력창에 포커스
    await nextTick()
    answerInput.value?.focus()
  } catch (error) {
    console.error('Failed to load quiz:', error)
    ElMessage.error('퀴즈를 불러오는데 실패했습니다')
    router.push('/quiz')
  }
})

onUnmounted(() => {
  quizStore.resetGame()
})

async function submitAnswer() {
  if (!userAnswer.value || answerSubmitted.value) return
  
  answerSubmitted.value = true
  
  const result = quizStore.checkAnswer(userAnswer.value)
  isCorrect.value = result.correct
  lastScore.value = result.score
  
  if (result.correct) {
    ElMessage.success('정답입니다!')
  } else {
    ElMessage.error('오답입니다')
  }
  
  // 2초 후 다음 문제로
  setTimeout(() => {
    moveToNextQuestion()
  }, 2000)
}

function passQuestion() {
  if (quizStore.passCount >= 3) {
    ElMessage.warning('패스 횟수를 모두 사용했습니다')
    return
  }
  
  quizStore.passQuestion()
  moveToNextQuestion()
  ElMessage.info('문제를 패스했습니다')
}

function skipQuestion() {
  quizStore.skipQuestion()
  moveToNextQuestion()
  ElMessage.info('문제를 건너뛰었습니다')
}

async function moveToNextQuestion() {
  userAnswer.value = ''
  answerSubmitted.value = false
  isCorrect.value = false
  
  const nextResult = quizStore.nextQuestion()
  
  if (nextResult.finished) {
    gameFinished.value = true
    await quizStore.saveResult()
  } else {
    // 다음 문제 입력창에 포커스
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
  max-width: 500px;
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

.feedback {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  text-align: center;
}

.feedback.correct {
  background: rgba(103, 194, 58, 0.1);
  border: 2px solid var(--success);
}

.feedback.incorrect {
  background: rgba(245, 108, 108, 0.1);
  border: 2px solid var(--danger);
}

.feedback-icon {
  margin-bottom: var(--spacing-md);
}

.feedback.correct .feedback-icon {
  color: var(--success);
}

.feedback.incorrect .feedback-icon {
  color: var(--danger);
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
</style>
