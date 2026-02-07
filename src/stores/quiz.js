import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { quizApi } from '@/api/quizApi'
import { useAuthStore } from './auth'

/**
 * 퀴즈 스토어 (Quiz Store)
 * 퀴즈 게임 진행과 관련된 모든 상태(데이터)와 로직(함수)을 관리하는 곳입니다.
 * Pinia를 사용하여 애플리케이션 전체에서 이 데이터들에 접근할 수 있습니다.
 */
export const useQuizStore = defineStore('quiz', () => {
    // ==========================================
    // State (상태 데이터) - 변수라고 생각하면 됩니다.
    // ==========================================

    // 현재 진행 중인 퀴즈의 기본 정보 (제목, 설명 등)
    const currentQuiz = ref(null)

    // 퀴즈의 전체 문제 목록
    const questions = ref([])

    // 현재 풀고 있는 문제의 번호 (인덱스는 0부터 시작하므로 0이 1번 문제)
    const currentQuestionIndex = ref(0)

    // 사용자가 제출한 답안들의 목록
    const answers = ref([])

    // 현재 획득한 총 점수
    const score = ref(0)

    // 게임 결과에 따른 등급 (멘사, 수재 등)
    const tier = ref('')

    // 현재 문제에 배정된 남은 시간 (초 단위)
    const questionTimeRemaining = ref(0)

    // 문제별 타이머를 관리하기 위한 인터벌 ID
    const questionTimerInterval = ref(null)

    // 현재 게임이 진행 중인지 여부 (true: 진행 중, false: 종료/대기)
    const isGameActive = ref(false)

    // 시간 초과 발생 여부 플래그
    const timeoutOccurred = ref(false)

    // ==========================================
    // Getters (계산된 속성) - 기존 데이터를 가공해서 새로운 정보를 만듭니다.
    // ==========================================

    /**
     * 정답 개수 계산
     * 사용자의 답안 목록(answers) 중에서 정답(isCorrect가 true)인 것들의 개수를 셉니다.
     */
    const correctCount = computed(() => {
        return answers.value.filter(a => a.isCorrect).length
    })

    /**
     * 전체 문제 수 반환
     * 문제 목록(questions)의 길이를 반환합니다.
     */
    const totalQuestions = computed(() => {
        return questions.value.length
    })

    // ==========================================
    // Actions (동작 함수) - 데이터를 변경하거나 특정 기능을 수행합니다.
    // ==========================================

    /**
     * 현재 문제 가져오기
     * 문제 목록에서 현재 인덱스에 해당하는 문제를 반환합니다.
     * 더 이상 문제가 없으면 null을 반환합니다.
     */
    function getCurrentQuestion() {
        if (currentQuestionIndex.value < questions.value.length) {
            return questions.value[currentQuestionIndex.value]
        }
        return null
    }

    /**
     * 게임 시작
     * 게임을 초기화하고 타이머를 시작합니다.
     * 
     * @param {Object} quiz - 선택한 퀴즈 정보
     * @param {Array} questionsList - 받아온 문제 목록
     */
    function startGame(quiz, questionsList) {
        // 받아온 정보로 상태들을 초기화합니다.
        currentQuiz.value = quiz
        questions.value = questionsList
        currentQuestionIndex.value = 0
        answers.value = []
        score.value = 0
        tier.value = ''

        isGameActive.value = true

        // 첫 번째 문제 타이머 시작 (문제가 있을 경우에만)
        if (questionsList.length > 0) {
            // 문제별 제한시간 설정 (없으면 기본 10초)
            questionTimeRemaining.value = questionsList[0].timeLimit || 10
            startQuestionTimer()
        }
    }

    /**
     * 문제별 타이머 시작
     * 각 문제마다 주어진 시간을 카운트다운합니다.
     */
    function startQuestionTimer() {
        // 기존 문제 타이머 정리
        if (questionTimerInterval.value) {
            clearInterval(questionTimerInterval.value)
        }

        const currentQ = getCurrentQuestion()
        if (currentQ) {
            // 현재 문제의 제한시간으로 설정
            questionTimeRemaining.value = currentQ.timeLimit || 10
        }

        questionTimerInterval.value = setInterval(() => {
            if (questionTimeRemaining.value > 0 && isGameActive.value) {
                questionTimeRemaining.value--
            } else if (questionTimeRemaining.value === 0) {
                // 문제 시간이 다 되면 자동으로 넘어가기(스킵) 처리
                skipQuestion()
                // 시간 초과 플래그 설정 - Vue 컴포넌트에서 피드백 표시 후 이동
                timeoutOccurred.value = true
            }
        }, 1000)
    }

    /**
     * 타이머 정지
     * 게임 종료 시 사용합니다.
     */
    function stopTimers() {
        if (questionTimerInterval.value) {
            clearInterval(questionTimerInterval.value)
            questionTimerInterval.value = null
        }
    }

    /**
     * 현재 문제 타이머만 정지
     * 답 제출 시 사용 (시간 초과 이벤트 방지)
     */
    function stopQuestionTimer() {
        if (questionTimerInterval.value) {
            clearInterval(questionTimerInterval.value)
            questionTimerInterval.value = null
        }
    }

    /**
     * 정답 정규화 (비교를 쉽게 만들기)
     * 대소문자 무시, 앞뒤 공백 제거, 모든 공백 제거를 수행합니다.
     * 예: " Apple " -> "apple"
     */
    function normalizeAnswer(answer) {
        return answer.trim().toLowerCase().replace(/\s+/g, '')
    }

    /**
     * 정답 확인
     * 사용자가 입력한 답과 실제 정답을 비교하고 점수를 계산합니다.
     */
    function checkAnswer(userAnswer) {
        const question = getCurrentQuestion()
        if (!question) return { correct: false, score: 0 }

        // 사용자의 답과 정답을 정규화(통일)해서 비교합니다.
        const normalizedUser = normalizeAnswer(userAnswer)
        const normalizedCorrect = normalizeAnswer(question.answer)

        const isCorrect = normalizedUser === normalizedCorrect

        // 점수 계산 로직
        let questionScore = 0
        if (isCorrect) {
            // 정답 시 10점
            questionScore = 10
            score.value += questionScore // 총점 누적
        }

        // 답안 기록 저장
        answers.value.push({
            questionId: question.id,
            questionNumber: question.questionNumber,
            userAnswer,
            correctAnswer: question.answer,
            isCorrect,
            timeSpent: question.timeLimit - questionTimeRemaining.value, // 소요 시간
            score: questionScore
        })

        return { correct: isCorrect, score: questionScore }
    }

    /**
     * 문제 건너뛰기 (시간 초과 등)
     * 문제를 틀린 것으로 처리합니다.
     */
    function skipQuestion() {
        const question = getCurrentQuestion()
        if (!question) return

        // 오답으로 기록 추가
        answers.value.push({
            questionId: question.id,
            questionNumber: question.questionNumber,
            userAnswer: '',
            correctAnswer: question.answer,
            isCorrect: false,
            skipped: true, // 건너뜀 표시
            score: 0
        })
    }

    /**
     * 다음 문제로 이동 (내부 헬퍼 함수)
     */
    function moveToNextQuestion() {
        currentQuestionIndex.value++

        // 모든 문제를 다 풀었는지 확인
        if (currentQuestionIndex.value >= questions.value.length) {
            endGame() // 게임 종료
        } else {
            // 다음 문제 타이머 시작
            startQuestionTimer()
        }
    }

    /**
     * 시간 초과 플래그 초기화
     */
    function resetTimeoutFlag() {
        timeoutOccurred.value = false
    }

    /**
     * 다음 문제로 이동
     * 인덱스를 증가시키고 게임 종료 여부를 판단합니다.
     */
    function nextQuestion() {
        currentQuestionIndex.value++

        // 모든 문제를 다 풀었는지 확인
        if (currentQuestionIndex.value >= questions.value.length) {
            endGame() // 게임 종료
            return { finished: true }
        } else {
            // 다음 문제 타이머 시작
            startQuestionTimer()
            return { finished: false }
        }
    }

    /**
     * 게임 종료 처리
     * 타이머를 멈추고 최종 점수에 따라 등급(티어)을 결정합니다.
     */
    function endGame() {
        isGameActive.value = false
        stopTimers()

        // 최종 점수에 따른 티어 산정
        const finalScore = score.value
        if (finalScore >= 100) {
            tier.value = '멘사'
        } else if (finalScore >= 90) {
            tier.value = '수재'
        } else if (finalScore >= 60) {
            tier.value = '우등생'
        } else if (finalScore >= 40) {
            tier.value = '모범생'
        } else if (finalScore >= 20) {
            tier.value = '평범'
        } else {
            tier.value = '노력필요'
        }
    }

    /**
     * 결과 저장 API 호출
     * 게임 결과를 서버로 전송하여 저장합니다.
     */
    async function saveResult() {
        try {
            const authStore = useAuthStore()

            // 서버로 보낼 데이터 구성
            const resultData = {
                quizId: currentQuiz.value.id,
                userId: authStore.user?.id || null, // 로그인 안했으면 null
                nickname: authStore.user?.nickname || '익명', // 로그인 안했으면 '익명'
                score: score.value,
                correctCount: correctCount.value,
                totalQuestions: totalQuestions.value,
                remainingTime: 0,
                tier: tier.value,
                completedAt: new Date().toISOString() // 현재 시간
            }

            // 결과 저장 요청
            await quizApi.saveQuizResult(resultData)

            // 각 문제별 통계 업데이트 (정답률 등을 위해)
            for (const answer of answers.value) {
                if (!answer.skipped) {
                    // 해당 문제 찾기
                    const question = questions.value.find(q => q.id === answer.questionId)
                    if (question) {
                        // 문제의 통계 데이터 업데이트 요청
                        await quizApi.updateQuestionStats(question.id, {
                            correctCount: question.correctCount + (answer.isCorrect ? 1 : 0),
                            totalCount: question.totalCount + 1
                        })
                    }
                }
            }

            return { success: true, score: score.value, tier: tier.value }
        } catch (error) {
            console.error('Failed to save result:', error)
            return { success: false, error }
        }
    }

    /**
     * 게임 상태 초기화
     * 데이터를 모두 초기 상태로 되돌립니다.
     */
    function resetGame() {
        currentQuiz.value = null
        questions.value = []
        currentQuestionIndex.value = 0
        answers.value = []
        score.value = 0
        tier.value = ''
        questionTimeRemaining.value = 0
        isGameActive.value = false
        timeoutOccurred.value = false
        stopTimers()
    }

    // 외부에서 사용할 변수와 함수들을 반환합니다.
    return {
        currentQuiz,
        questions,
        currentQuestionIndex,
        answers,
        score,
        tier,
        questionTimeRemaining,
        isGameActive,
        timeoutOccurred,
        correctCount,
        totalQuestions,
        getCurrentQuestion,
        startGame,
        checkAnswer,
        skipQuestion,
        nextQuestion,
        endGame,
        saveResult,
        resetGame,
        resetTimeoutFlag,
        stopQuestionTimer
    }
})
