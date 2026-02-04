<!--
  ============================================================================
  WorldcupList.vue - 월드컵 목록 페이지
  ============================================================================
  
  [페이지 개요]
  - 생성된 모든 월드컵 목록을 카드 형태로 표시
  - 검색 및 카테고리 필터링 기능 제공
  - 로그인된 사용자는 "월드컵 만들기" 버튼으로 새 월드컵 생성 가능
  
  [라우트]
  - 현재 경로: /worldcup
  - 카드 클릭 시: /worldcup/:id/play (게임 페이지로 이동)
  
  [사용하는 API]
  - commonApi.getCategories('worldcup') : 카테고리 목록 조회
  - worldcupApi.getWorldcups(params)    : 월드컵 목록 조회 (검색/필터 적용)
  
  [담당] 팀원1 - 월드컵 도메인
  ============================================================================
-->
<template>
  <div class="worldcup-list-page">
    <ExitTransition ref="exitTransition" color="#FFB3D9"/>
    <div class="container">
      <!-- ===== 페이지 헤더 영역 ===== -->
      <!-- 제목 + 월드컵 만들기 버튼 (로그인 시에만 표시) -->
      <div class="page-header">
        <h1 class="gradient-text">🏆 이상형 월드컵</h1>
        <router-link to="/worldcup/create" class="btn btn-primary" v-if="authStore.isAuthenticated">
          월드컵 만들기
        </router-link>
      </div>

      <!-- ===== 검색 & 필터 영역 ===== -->
      <!-- 검색어 입력 + 카테고리 선택 드롭다운 -->
      <div class="filters mb-4">
        <!-- 검색 입력창: 입력 시 handleSearch 호출 → loadWorldcups 실행 -->
        <el-input
            v-model="searchQuery"
            placeholder="검색..."
            size="large"
            clearable
            @input="handleSearch"
        >
          <template #prefix>
            <el-icon>
              <search/>
            </el-icon>
          </template>
        </el-input>

        <!-- 카테고리 선택: 변경 시 loadWorldcups 직접 호출 -->
        <el-select v-model="selectedCategory" placeholder="카테고리" size="large" @change="loadWorldcups">
          <el-option label="전체" :value="null"/>
          <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
          />
        </el-select>
      </div>

      <!-- ===== 월드컵 카드 그리드 ===== -->
      <!-- v-loading: 데이터 로딩 중 스피너 표시 -->
      <!-- grid-3: CSS 그리드로 3열 배치 -->
      <div v-loading="loading" class="grid grid-3">
        <!-- 각 월드컵 카드: 클릭 시 게임 페이지로 이동 -->
        <router-link
            v-for="(worldcup, index) in worldcups"
            :key="worldcup.id"
            :to="`/worldcup/${worldcup.id}`"
            class="worldcup-card card drop-in"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click.prevent="handleNavigation(`/worldcup/${worldcup.id}`)"
        >
          <!-- 썸네일 이미지 -->
          <div class="card-image">
            <img :src="getImageUrl(worldcup.thumbnail)" :alt="worldcup.title"/>
          </div>
          <!-- 카드 본문: 제목, 설명, 통계 -->
          <div class="card-body">
            <h3>{{ worldcup.title }}</h3>
            <p class="card-description">{{ worldcup.description }}</p>
            <!-- 조회수 & 플레이 횟수 -->
          </div>
          <div class="card-stats">
            <div class="stats" style="margin-top: auto; margin-bottom: 10px;">
                <span><img src="@/assets/icons/views-icon.png" style="width:20px" alt="조회수" class="stat-icon"/> {{
                    worldcup.viewCount || 0
                  }}</span>
              <span><img src="@/assets/icons/play-icon.png" style="width:20px" alt="플레이" class="stat-icon"/>{{
                  worldcup.playCount || 0
                }}</span>
            </div>
          </div>
        </router-link>
      </div>

      <!-- ===== 빈 상태 표시 ===== -->
      <!-- 월드컵이 없고 로딩도 완료된 경우 표시 -->
      <div v-if="worldcups.length === 0 && !loading" class="empty-state">
        <p>월드컵이 없습니다. 첫 번째 월드컵을 만들어보세요!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ============================================================================
 * WorldcupList.vue - Script Section
 * ============================================================================
 */
import {ref, onMounted} from 'vue'
import {useAuthStore} from '@/stores/auth'       // 인증 상태 (로그인 여부 확인용)
import {worldcupApi} from '@/api/worldcupApi'   // 월드컵 API
import {commonApi} from '@/api/commonApi'       // 공통 API (카테고리 조회)
import {Search} from '@element-plus/icons-vue'  // 검색 아이콘
import {useRouter} from 'vue-router'
import ExitTransition from '@/components/ExitTransition.vue'
import {getImageUrl} from "../../utils/helpers.js";

// ===== Store & Router =====
const authStore = useAuthStore()  // 로그인 상태 확인용
const router = useRouter()
const exitTransition = ref(null)  // ExitTransition 컴포넌트 참조

// ===== 반응형 상태 (Reactive State) =====
const worldcups = ref([])         // 월드컵 목록 데이터
const categories = ref([])        // 카테고리 목록 데이터
const loading = ref(false)        // 로딩 상태 (스피너 표시용)
const searchQuery = ref('')       // 검색어 입력값
const selectedCategory = ref(null) // 선택된 카테고리 ID (null = 전체)


// ===== 라이프사이클 훅 =====
/**
 * 컴포넌트 마운트 시 실행
 * 1. 카테고리 목록 로드
 * 2. 월드컵 목록 로드
 */
onMounted(async () => {
  await loadCategories()
  await loadWorldcups()
})

// ===== 메서드 =====

/**
 * 카테고리 목록 조회
 * - API: commonApi.getCategories('worldcup')
 * - 월드컵 타입의 카테고리만 조회
 */
async function loadCategories() {
  try {
    const response = await commonApi.getCategories('worldcup')
    categories.value = response.data
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

/**
 * 월드컵 목록 조회
 * - API: worldcupApi.getWorldcups(params)
 * - 검색어(q)와 카테고리ID(categoryId)를 파라미터로 전달
 */
async function loadWorldcups() {
  loading.value = true  // 로딩 시작
  try {
    // 쿼리 파라미터 구성
    const params = {}
    if (searchQuery.value) {
      params.q = searchQuery.value  // 검색어 필터
    }
    if (selectedCategory.value) {
      params.categoryId = selectedCategory.value  // 카테고리 필터
    }

    const response = await worldcupApi.getWorldcups(params)
    worldcups.value = response.data
  } catch (error) {
    console.error('Failed to load worldcups:', error)
  } finally {
    loading.value = false  // 로딩 종료
  }
}

/**
 * 검색 핸들러
 * - 검색창 입력 시 호출
 * - loadWorldcups를 호출하여 필터링된 결과 조회
 */
function handleSearch() {
  loadWorldcups()
}

/**
 * 네비게이션 핸들러
 * - 링크 클릭 시 ExitTransition 애니메이션 실행 후 페이지 이동
 */
async function handleNavigation(path) {
  if (exitTransition.value) {
    await exitTransition.value.trigger()
  }
  router.push(path)
}
</script>

<style scoped>
/* 월드컵 페이지 전체 배경 */
.worldcup-list-page {
  min-height: 100vh;
  background: #FFB3D9; /* 핑크색 배경 */
  padding: var(--spacing-xl) 0;
}

/* 카드 떨어지는 애니메이션 */
.drop-in {
  animation: dropIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

@keyframes dropIn {
  0% {
    opacity: 0;
    transform: translateY(-50px) scale(0.8);
  }
  70% {
    transform: translateY(5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.filters {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.worldcup-card {
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: all var(--transition-normal);
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

.worldcup-card:hover .card-image img {
  transform: scale(1.1);
}

.card-body {
  padding: var(--spacing-md);
}

.card-body h3 {
  margin-bottom: var(--spacing-sm);
  font-size: 1.25rem;
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

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
