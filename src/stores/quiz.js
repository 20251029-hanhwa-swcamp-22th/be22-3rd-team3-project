import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { quizApi } from '@/api/quizApi'
import { useAuthStore } from './auth'

export const useQuizStore = defineStore('quiz', () => {
    const currentQuiz = ref(null)
    const questions = ref([])
    const currentQuestionIndex = ref(0)
    const answers = ref([])
    const passCount = ref(0)
    const score = ref(0)
    const tier = ref('')
    const remainingTime = ref(0)
    const questionTimeRemaining = ref(0)
    const timerInterval = ref(null)
    const questionTimerInterval = ref(null)
    const isGameActive = ref(false)

    const correctCount = computed(() => {
        return answers.value.filter(a => a.isCorrect).length
    })

    const totalQuestions = computed(() => {
        return questions.value.length
    })

    function getCurrentQuestion() {
        if (currentQuestionIndex.value < questions.value.length) {
            return questions.value[currentQuestionIndex.value]
        }
        return null
    }

    function startGame(quiz, questionsList) {
        currentQuiz.value = quiz
        questions.value = questionsList
        currentQuestionIndex.value = 0
        answers.value = []
        passCount.value = 0
        score.value = 0
        tier.value = ''
        remainingTime.value = quiz.totalTime || 120
        isGameActive.value = true

        // Start main timer
        startMainTimer()

        // Start question timer
        if (questionsList.length > 0) {
            questionTimeRemaining.value = questionsList[0].timeLimit || 10
            startQuestionTimer()
        }
    }

    function startMainTimer() {
        if (timerInterval.value) {
            clearInterval(timerInterval.value)
        }

        timerInterval.value = setInterval(() => {
            if (remainingTime.value > 0 && isGameActive.value) {
                remainingTime.value--
            } else if (remainingTime.value === 0) {
                endGame()
            }
        }, 1000)
    }

    function startQuestionTimer() {
        if (questionTimerInterval.value) {
            clearInterval(questionTimerInterval.value)
        }

        const currentQ = getCurrentQuestion()
        if (currentQ) {
            questionTimeRemaining.value = currentQ.timeLimit || 10
        }

        questionTimerInterval.value = setInterval(() => {
            if (questionTimeRemaining.value > 0 && isGameActive.value) {
                questionTimeRemaining.value--
            } else if (questionTimeRemaining.value === 0) {
                // Auto skip when time runs out
                skipQuestion()
            }
        }, 1000)
    }

    function stopTimers() {
        if (timerInterval.value) {
            clearInterval(timerInterval.value)
            timerInterval.value = null
        }
        if (questionTimerInterval.value) {
            clearInterval(questionTimerInterval.value)
            questionTimerInterval.value = null
        }
    }

    function normalizeAnswer(answer) {
        return answer.trim().toLowerCase().replace(/\s+/g, '')
    }

    function checkAnswer(userAnswer) {
        const question = getCurrentQuestion()
        if (!question) return { correct: false, score: 0 }

        const normalizedUser = normalizeAnswer(userAnswer)
        const normalizedCorrect = normalizeAnswer(question.answer)

        const isCorrect = normalizedUser === normalizedCorrect

        // Calculate score for this question
        let questionScore = 0
        if (isCorrect) {
            questionScore = 10 + (questionTimeRemaining.value * 2)
            score.value += questionScore
        }

        answers.value.push({
            questionId: question.id,
            questionNumber: question.questionNumber,
            userAnswer,
            correctAnswer: question.answer,
            isCorrect,
            timeSpent: question.timeLimit - questionTimeRemaining.value,
            score: questionScore
        })

        return { correct: isCorrect, score: questionScore }
    }

    function passQuestion() {
        const question = getCurrentQuestion()
        if (!question) return

        passCount.value++

        // Add to end of questions
        questions.value.push(question)
    }

    function skipQuestion() {
        const question = getCurrentQuestion()
        if (!question) return

        answers.value.push({
            questionId: question.id,
            questionNumber: question.questionNumber,
            userAnswer: '',
            correctAnswer: question.answer,
            isCorrect: false,
            skipped: true,
            score: 0
        })
    }

    function nextQuestion() {
        currentQuestionIndex.value++

        // Check if all questions are answered
        if (currentQuestionIndex.value >= questions.value.length) {
            endGame()
            return { finished: true }
        } else {
            // Start timer for next question
            startQuestionTimer()
            return { finished: false }
        }
    }

    function endGame() {
        isGameActive.value = false
        stopTimers()

        // Calculate final tier
        const finalScore = score.value
        if (finalScore >= 180) {
            tier.value = '멘사'
        } else if (finalScore >= 140) {
            tier.value = '수재'
        } else if (finalScore >= 100) {
            tier.value = '우등생'
        } else if (finalScore >= 60) {
            tier.value = '모범생'
        } else if (finalScore >= 30) {
            tier.value = '평범'
        } else {
            tier.value = '노력필요'
        }
    }

    async function saveResult() {
        try {
            const authStore = useAuthStore()

            const resultData = {
                quizId: currentQuiz.value.id,
                userId: authStore.user?.id || null,
                nickname: authStore.user?.nickname || '익명',
                score: score.value,
                correctCount: correctCount.value,
                totalQuestions: totalQuestions.value,
                remainingTime: remainingTime.value,
                tier: tier.value,
                completedAt: new Date().toISOString()
            }

            await quizApi.saveQuizResult(resultData)

            // Update question stats
            for (const answer of answers.value) {
                if (!answer.skipped) {
                    const question = questions.value.find(q => q.id === answer.questionId)
                    if (question) {
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

    function resetGame() {
        currentQuiz.value = null
        questions.value = []
        currentQuestionIndex.value = 0
        answers.value = []
        passCount.value = 0
        score.value = 0
        tier.value = ''
        remainingTime.value = 0
        questionTimeRemaining.value = 0
        isGameActive.value = false
        stopTimers()
    }

    return {
        currentQuiz,
        questions,
        currentQuestionIndex,
        answers,
        passCount,
        score,
        tier,
        remainingTime,
        questionTimeRemaining,
        isGameActive,
        correctCount,
        totalQuestions,
        getCurrentQuestion,
        startGame,
        checkAnswer,
        passQuestion,
        skipQuestion,
        nextQuestion,
        endGame,
        saveResult,
        resetGame
    }
})
