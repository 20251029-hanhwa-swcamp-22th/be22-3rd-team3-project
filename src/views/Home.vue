<template>
  <div class="home-page">
    <!-- 배경 레이어 -->
    <div class="background-layer" :class="{ 'worldcup-active': isWorldcupHover, 'quiz-active': isQuizHover }"></div>
    
    <!-- 심플한 Hero 섹션 -->
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">
          이상형 월드컵 & 퀴즈
        </h1>
        <p class="hero-subtitle">
          나만의 선택을 해보세요
        </p>
        
        <!-- 간결한 게임 버튼 -->
        <div class="game-buttons">
          <div 
            class="game-button btn-worldcup"
            @mouseenter="isWorldcupHover = true"
            @mouseleave="isWorldcupHover = false"
            @click="navigateTo('/worldcup', '#FFB3D9')"
          >
            <div class="confetti-container">
              <span class="confetti" v-for="i in 20" :key="i" :style="{ '--i': i }"></span>
            </div>
            <span class="icon">🏆</span>
            <span class="text">월드컵</span>
          </div>
          
          <div 
            class="game-button btn-quiz"
            @mouseenter="isQuizHover = true"
            @mouseleave="isQuizHover = false"
            @click="navigateTo('/quiz', '#D4BBFF')"
          >
            <div class="quiz-animation">
              <span class="graduation-cap-throw">🎓</span>
              <span class="book-open">📖</span>
            </div>
            <span class="icon">🎓</span>
            <span class="text">퀴즈</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 인기 콘텐츠 -->
    <section class="popular" v-if="popularWorldcups.length > 0 || popularQuizzes.length > 0">
      <div class="container">
        <h2 class="section-title fade-in-section">인기 콘텐츠</h2>
        
        <div v-if="popularWorldcups.length > 0" class="content-section">
          <h3 class="subsection-title fade-in-section">🏆 인기 월드컵</h3>
          <div class="content-grid">
            <router-link 
              v-for="(worldcup, index) in popularWorldcups" 
              :key="worldcup.id"
              :to="`/worldcup/${worldcup.id}`"
              class="content-card fade-in-section"
              :style="{ transitionDelay: `${index * 0.1}s` }"
            >
              <div class="card-header">
                <h4>{{ worldcup.title }}</h4>
                <span class="play-count">👥 {{ worldcup.playCount || 0 }}</span>
              </div>
              <p class="card-desc">{{ worldcup.description }}</p>
            </router-link>
          </div>
        </div>

        <div v-if="popularQuizzes.length > 0" class="content-section">
          <h3 class="subsection-title fade-in-section">🎓 인기 퀴즈</h3>
          <div class="content-grid">
            <router-link 
              v-for="(quiz, index) in popularQuizzes" 
              :key="quiz.id"
              :to="`/quiz/${quiz.id}`"
              class="content-card fade-in-section"
              :style="{ transitionDelay: `${index * 0.1}s` }"
            >
              <div class="card-header">
                <h4>{{ quiz.title }}</h4>
                <span class="play-count">👥 {{ quiz.playCount || 0 }}</span>
              </div>
              <p class="card-desc">{{ quiz.description }}</p>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 주요 기능 -->
    <section class="features">
      <div class="container">
        <h2 class="section-title fade-in-section">주요 기능</h2>
        <div class="features-grid">
          <!-- 1. 트로피 - 빵빠레 -->
          <div class="feature-card fade-in-section trophy-card" style="transition-delay: 0s">
            <div class="trophy-confetti-container">
              <span class="mini-confetti" v-for="i in 15" :key="i" :style="{ '--i': i }"></span>
            </div>
            <div class="feature-icon">🏆</div>
            <h3>이상형 월드컵</h3>
            <p>32강부터 시작하는 토너먼트 방식으로 나만의 이상형을 찾아보세요</p>
          </div>
          
          <!-- 2. 차트 - 위아래 움직임 -->
          <div class="feature-card fade-in-section chart-card" style="transition-delay: 0.1s">
            <div class="chart-animation">
              <span class="chart-bar" v-for="i in 5" :key="i" :style="{ '--i': i }">📊</span>
            </div>
            <div class="feature-icon">📊</div>
            <h3>실시간 랭킹</h3>
            <p>다른 사람들의 선택과 비교하고 인기 순위를 확인하세요</p>
          </div>
          
          <!-- 3. 다트 - 꽂히는 애니메이션 -->
          <div class="feature-card fade-in-section dart-card" style="transition-delay: 0.2s">
            <div class="dart-animation">
              <span class="dart" v-for="i in 3" :key="i" :style="{ '--i': i }">🎯</span>
            </div>
            <div class="feature-icon">🎯</div>
            <h3>타임어택 퀴즈</h3>
            <p>제한 시간 내에 퀴즈를 풀고 점수를 겨뤄보세요</p>
          </div>
          
          <!-- 4. 반짝반짝 -->
          <div class="feature-card fade-in-section sparkle-card" style="transition-delay: 0.3s">
            <div class="sparkle-animation">
              <span class="sparkle" v-for="i in 8" :key="i" :style="{ '--i': i }">✨</span>
            </div>
            <div class="feature-icon">✨</div>
            <h3>나만의 콘텐츠</h3>
            <p>직접 월드컵과 퀴즈를 만들어 공유할 수 있어요</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { worldcupApi } from '@/api/worldcupApi'
import { quizApi } from '@/api/quizApi'
import { useTransitionStore } from '@/stores/transition'

const router = useRouter()
const transitionStore = useTransitionStore()

const popularWorldcups = ref([])
const popularQuizzes = ref([])
const isWorldcupHover = ref(false)
const isQuizHover = ref(false)

const navigateTo = (path, color) => {
  transitionStore.triggerTransition(color)
  setTimeout(() => {
    router.push(path)
  }, 400)
}

onMounted(async () => {
  try {
    const [worldcupsRes, quizzesRes] = await Promise.all([
      worldcupApi.getWorldcups({ _sort: 'playCount', _order: 'desc', _limit: 3 }),
      quizApi.getQuizzes({ _sort: 'playCount', _order: 'desc', _limit: 3 })
    ])
    popularWorldcups.value = worldcupsRes.data
    popularQuizzes.value = quizzesRes.data
  } catch (error) {
    console.error('Failed to load popular content:', error)
  }

  // 스크롤 애니메이션 Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })

  // 모든 애니메이션 대상 요소 관찰
  const animatedElements = document.querySelectorAll('.fade-in-section')
  animatedElements.forEach(el => observer.observe(el))
})
</script>

<style scoped>
.home-page {
  position: relative;
  min-height: 100vh;
}

/* 배경 레이어 */
.background-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%);
  background-size: 200% 200%;
  transition: all 0.8s ease;
  z-index: -1;
}

.background-layer.worldcup-active {
  background: linear-gradient(135deg, 
    #FFE8F5 0%, 
    #FFF0F8 25%,
    #FFE0F0 50%,
    #FFF5FA 75%,
    #FFE8F5 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
}

.background-layer.quiz-active {
  background: linear-gradient(135deg, 
    #F0E8FF 0%, 
    #F8F0FF 25%,
    #E8E0FF 50%,
    #F5F0FF 75%,
    #F0E8FF 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.hero {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
  color: #2D2D2D;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 1.1rem;
  font-weight: 300;
  color: #666;
  margin-bottom: 3rem;
}

/* 간결한 게임 버튼 */
.game-buttons {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.game-button {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.btn-worldcup {
  background: linear-gradient(135deg, #FFB3D9 0%, #FFC9E5 100%);
}

.btn-quiz {
  background: linear-gradient(135deg, #D4BBFF 0%, #E5D9FF 100%);
}

.game-button:hover {
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.game-button .icon {
  font-size: 3.5rem;
  margin-bottom: 0.5rem;
  transition: opacity 0.3s ease;
}

.game-button:hover .icon {
  opacity: 0;
}

.game-button .text {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  transition: opacity 0.3s ease;
}

.game-button:hover .text {
  opacity: 0.5;
}

/* 빵빠레 애니메이션 */
.confetti-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.confetti {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: var(--confetti-color);
  opacity: 0;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.confetti:nth-child(4n+1) { --confetti-color: #FFD700; }
.confetti:nth-child(4n+2) { --confetti-color: #FF69B4; }
.confetti:nth-child(4n+3) { --confetti-color: #00CED1; }
.confetti:nth-child(4n) { --confetti-color: #FF6347; }

.btn-worldcup:hover .confetti {
  animation: confettiBurst 1s ease-out forwards;
  animation-delay: calc(var(--i) * 0.02s);
}

@keyframes confettiBurst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) 
               translate(
                 calc((var(--i) - 10) * 15px),
                 calc(-80px - (var(--i) * 5px))
               )
               rotate(calc(var(--i) * 36deg))
               scale(0);
  }
}

/* 퀴즈 애니메이션 - 학사모 던지기 → 책 펼치기 */
.quiz-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.graduation-cap-throw,
.book-open {
  position: absolute;
  top: 50%;
  left: 50%;
  opacity: 0;
  font-size: 3rem;
  transform: translate(-50%, -50%);
}

/* 1단계: 학사모가 위로 던져짐 */
.btn-quiz:hover .graduation-cap-throw {
  animation: throwCap 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes throwCap {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(0) rotate(0deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(-150px) rotate(360deg) scale(0.3);
  }
}

/* 2단계: 책이 펼쳐짐 (학사모 사라진 후) */
.btn-quiz:hover .book-open {
  animation: openBook 1s ease-out 0.6s forwards;
}

@keyframes openBook {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0) rotateY(90deg);
  }
  30% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.5) rotateY(0deg);
  }
  60% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.3) rotateY(0deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.8) rotateY(0deg);
  }
}

/* 스크롤 애니메이션 */
.fade-in-section {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in-section.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 인기 콘텐츠는 바로 보이게 */
.popular .fade-in-section {
  opacity: 1;
  transform: translateY(0);
}

/* 인기 콘텐츠 */
.popular {
  padding: 4rem 0;
  background: white;
}

/* 기능 소개 */
.features {
  padding: 4rem 0;
  background: #FAFAFA;
}

.section-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 300;
  margin-bottom: 3rem;
  color: #2D2D2D;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 1. 트로피 카드 - 빵빠레 */
.trophy-confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.mini-confetti {
  position: absolute;
  top: 25%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: var(--confetti-color);
  opacity: 0;
  border-radius: 50%;
}

.mini-confetti:nth-child(5n+1) { --confetti-color: #FFD700; }
.mini-confetti:nth-child(5n+2) { --confetti-color: #FF69B4; }
.mini-confetti:nth-child(5n+3) { --confetti-color: #00CED1; }
.mini-confetti:nth-child(5n+4) { --confetti-color: #FF6347; }
.mini-confetti:nth-child(5n) { --confetti-color: #9370DB; }

.trophy-card:hover .mini-confetti {
  animation: miniConfettiBurst 0.8s ease-out forwards;
  animation-delay: calc(var(--i) * 0.03s);
}

@keyframes miniConfettiBurst {
  0% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(
      calc(-50% + (var(--i) - 7.5) * 25px),
      calc(-80px - var(--i) * 5px)
    ) rotate(calc(var(--i) * 36deg));
  }
}

/* 2. 차트 카드 - 위아래 움직임 */
.chart-animation {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  height: auto;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
}

.chart-bar {
  opacity: 0;
  font-size: 2rem;
}

.chart-card:hover .chart-bar {
  animation: chartBounce 1.2s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.1s);
  opacity: 0.6;
}

@keyframes chartBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* 3. 다트 카드 - 꽂히는 애니메이션 */
.dart-animation {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.dart {
  position: absolute;
  top: -50px;
  left: 50%;
  opacity: 0;
  font-size: 2rem;
  transform: translateX(-50%) rotate(-45deg);
}

.dart-card:hover .dart {
  animation: dartThrow 0.6s ease-in forwards;
  animation-delay: calc(var(--i) * 0.2s);
}

@keyframes dartThrow {
  0% {
    opacity: 1;
    top: -50px;
    transform: translateX(-50%) rotate(-45deg);
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    top: 25%;
    transform: translateX(calc(-50% + (var(--i) - 2) * 30px)) rotate(0deg) scale(1.2);
  }
}

/* 4. 반짝반짝 카드 */
.sparkle-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  opacity: 0;
  font-size: 1.5rem;
}

.sparkle:nth-child(8n+1) { top: 20%; left: 20%; }
.sparkle:nth-child(8n+2) { top: 20%; right: 20%; }
.sparkle:nth-child(8n+3) { top: 50%; left: 10%; }
.sparkle:nth-child(8n+4) { top: 50%; right: 10%; }
.sparkle:nth-child(8n+5) { top: 80%; left: 25%; }
.sparkle:nth-child(8n+6) { top: 80%; right: 25%; }
.sparkle:nth-child(8n+7) { top: 35%; left: 50%; }
.sparkle:nth-child(8n) { top: 65%; right: 50%; }

.sparkle-card:hover .sparkle {
  animation: sparkleShine 1.5s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.15s);
}

@keyframes sparkleShine {
  0%, 100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.5) rotate(180deg);
  }
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 10;
}

/* 트로피 아이콘 - 흔들림 */
.trophy-card:hover .feature-icon {
  animation: trophyShake 0.6s ease infinite;
}

@keyframes trophyShake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-15deg) scale(1.1); }
  75% { transform: rotate(15deg) scale(1.1); }
}

/* 차트 아이콘 - 펄스 */
.chart-card:hover .feature-icon {
  animation: chartPulse 1s ease-in-out infinite;
}

@keyframes chartPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* 다트 아이콘 - 회전 */
.dart-card:hover .feature-icon {
  animation: dartSpin 0.8s linear infinite;
}

@keyframes dartSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 반짝 아이콘 - 반짝임 */
.sparkle-card:hover .feature-icon {
  animation: sparkleGlow 1s ease-in-out infinite;
}

@keyframes sparkleGlow {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.3);
    filter: brightness(1.5) drop-shadow(0 0 10px gold);
  }
}

.feature-card h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2D2D2D;
}

.feature-card p {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
}

/* 인기 콘텐츠 */
.popular {
  padding: 4rem 0;
}

.content-section {
  margin-bottom: 3rem;
}

.subsection-title {
  font-size: 1.4rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  color: #2D2D2D;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.content-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  text-decoration: none;
  color: inherit;
  transition: all 0.4s ease;
  display: block;
  position: relative;
  overflow: hidden;
}

.content-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 179, 217, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.content-card:hover::before {
  opacity: 1;
}

.content-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 8px 30px rgba(255, 179, 217, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.card-header h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #2D2D2D;
}

.play-count {
  font-size: 0.9rem;
  color: #999;
}

.card-desc {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .game-button {
    width: 160px;
    height: 160px;
  }
  
  .game-button .icon {
    font-size: 3rem;
  }
  
  .game-button .text {
    font-size: 1rem;
  }
}
</style>
