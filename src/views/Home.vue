<template>
  <div class="home-page">
    <section class="hero">
      <div class="container">
        <h1 class="hero-title gradient-text fade-in">
          🎮 이상형 월드컵 & 퀴즈 게임
        </h1>
        <p class="hero-subtitle fade-in">
          나만의 월드컵을 만들고, 재미있는 퀴즈를 풀어보세요!
        </p>
        <div class="hero-buttons fade-in">
          <router-link to="/worldcup" class="btn btn-primary btn-lg">
            월드컵 시작하기
          </router-link>
          <router-link to="/quiz" class="btn btn-secondary btn-lg">
            퀴즈 풀기
          </router-link>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2 class="text-center mb-4">주요 기능</h2>
        <div class="grid grid-3">
          <div class="feature-card card card-glass">
            <div class="feature-icon">🏆</div>
            <h3>이상형 월드컵</h3>
            <p>32강부터 결승까지! 토너먼트 방식으로 최고의 선택을 찾아보세요.</p>
          </div>
          <div class="feature-card card card-glass">
            <div class="feature-icon">⏱️</div>
            <h3>타임 어택 퀴즈</h3>
            <p>시간 제한 안에 문제를 풀고 높은 점수를 획득하세요!</p>
          </div>
          <div class="feature-card card card-glass">
            <div class="feature-icon">✨</div>
            <h3>콘텐츠 제작</h3>
            <p>나만의 월드컵과 퀴즈를 만들어 다른 사람들과 공유하세요.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="popular-content" v-if="popularWorldcups.length > 0 || popularQuizzes.length > 0">
      <div class="container">
        <h2 class="text-center mb-4">인기 콘텐츠</h2>
        
        <div v-if="popularWorldcups.length > 0" class="content-section">
          <h3 class="mb-3">🏆 인기 월드컵</h3>
          <div class="grid grid-3">
            <router-link 
              v-for="worldcup in popularWorldcups" 
              :key="worldcup.id"
              :to="`/worldcup/${worldcup.id}/play`"
              class="content-card card"
            >
              <div class="card-image">
                <img :src="worldcup.thumbnail" :alt="worldcup.title" />
              </div>
              <div class="card-body">
                <h4>{{ worldcup.title }}</h4>
                <p class="card-description">{{ worldcup.description }}</p>
                <div class="card-stats">
                  <span>👁️ {{ worldcup.viewCount }}</span>
                  <span>🎮 {{ worldcup.playCount }}</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <div v-if="popularQuizzes.length > 0" class="content-section mt-4">
          <h3 class="mb-3">🧠 인기 퀴즈</h3>
          <div class="grid grid-3">
            <router-link 
              v-for="quiz in popularQuizzes" 
              :key="quiz.id"
              :to="`/quiz/${quiz.id}/play`"
              class="content-card card"
            >
              <div class="card-image">
                <img :src="quiz.thumbnail" :alt="quiz.title" />
              </div>
              <div class="card-body">
                <h4>{{ quiz.title }}</h4>
                <p class="card-description">{{ quiz.description }}</p>
                <div class="card-stats">
                  <span>👁️ {{ quiz.viewCount }}</span>
                  <span>🎮 {{ quiz.playCount }}</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const popularWorldcups = ref([])
const popularQuizzes = ref([])

onMounted(async () => {
  try {
    const [worldcupsRes, quizzesRes] = await Promise.all([
      api.getWorldcups({ _sort: 'playCount', _order: 'desc', _limit: 3 }),
      api.getQuizzes({ _sort: 'playCount', _order: 'desc', _limit: 3 })
    ])
    popularWorldcups.value = worldcupsRes.data
    popularQuizzes.value = quizzesRes.data
  } catch (error) {
    console.error('Failed to load popular content:', error)
  }
})
</script>

<style scoped>
.hero {
  text-align: center;
  padding: var(--spacing-2xl) 0;
}

.hero-title {
  font-size: 3rem;
  margin-bottom: var(--spacing-lg);
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.hero-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.btn-lg {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: 1.125rem;
}

.features {
  padding: var(--spacing-2xl) 0;
}

.feature-card {
  text-align: center;
  padding: var(--spacing-xl);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.popular-content {
  padding: var(--spacing-2xl) 0;
}

.content-section {
  margin-top: var(--spacing-xl);
}

.content-card {
  text-decoration: none;
  color: inherit;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.content-card:hover .card-image img {
  transform: scale(1.1);
}

.card-body {
  padding: var(--spacing-md);
}

.card-body h4 {
  margin-bottom: var(--spacing-sm);
}

.card-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-stats {
  display: flex;
  gap: var(--spacing-md);
  font-size: 0.875rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>
