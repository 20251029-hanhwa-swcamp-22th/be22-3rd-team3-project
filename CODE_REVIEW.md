# 프로젝트 코드 복습 자료 📚

> **작성일**: 2026-02-04  
> **목적**: 팀원들이 프로젝트 코드를 체계적으로 복습하고 이해할 수 있도록 돕기 위한 상세 가이드

---

## 📑 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [핵심 개념](#핵심-개념)
5. [주요 기능 흐름](#주요-기능-흐름)
6. [상세 코드 분석](#상세-코드-분석)
7. [학습 포인트](#학습-포인트)

---

## 프로젝트 개요

### 🎯 프로젝트 목표
- **이상형 월드컵**: 사용자가 직접 토너먼트 방식의 이상형 월드컵을 생성하고 플레이
- **타임어택 퀴즈**: 제한 시간 내에 문제를 풀고 티어를 받는 퀴즈 게임

### 🎮 주요 기능
1. 월드컵/퀴즈 생성, 조회, 플레이
2. JWT 기반 인증 시스템
3. 실시간 랭킹 시스템
4. 통계 및 결과 저장

---

## 기술 스택

### Frontend
- **Vue 3.5** (Composition API)
- **Pinia** (상태 관리)
- **Vue Router** (라우팅)
- **Element Plus** (UI 컴포넌트)
- **Vite** (빌드 도구)

### Backend (Mock)
- **JSON Server** (Mock REST API)
- **json-server-auth** (JWT 인증)

### HTTP 통신
- **Axios** (HTTP 클라이언트)

---

## 프로젝트 구조

```
src/
├── api/                    # API 통신 레이어
│   ├── axios.js           # Axios 설정 (인터셉터)
│   ├── authApi.js         # 인증 API
│   ├── worldcupApi.js     # 월드컵 API
│   ├── quizApi.js         # 퀴즈 API
│   └── commonApi.js       # 공통 API
│
├── stores/                 # Pinia 스토어 (상태 관리)
│   ├── auth.js            # 인증 상태
│   ├── worldcup.js        # 월드컵 게임 상태
│   ├── quiz.js            # 퀴즈 게임 상태
│   └── transition.js      # 페이지 전환 효과
│
├── router/                 # 라우팅
│   └── index.js           # 라우트 정의 + 인증 가드
│
├── views/                  # 페이지 컴포넌트
│   ├── Home.vue
│   ├── auth/              # 로그인/회원가입
│   ├── worldcup/          # 월드컵 관련 페이지
│   ├── quiz/              # 퀴즈 관련 페이지
│   └── create/            # 생성 페이지
│
├── components/             # 재사용 컴포넌트
│   ├── layout/            # 레이아웃 (Header, Footer)
│   └── common/            # 공통 컴포넌트
│
└── utils/                  # 유틸리티 함수
    └── helpers.js         # 헬퍼 함수들
```

---

## 핵심 개념

### 1️⃣ Composition API (Vue 3)

Vue 3의 Composition API는 로직을 재사용 가능하게 구성하는 새로운 방식입니다.

**핵심 함수**:
- `ref()`: 반응형 데이터 생성
- `computed()`: 계산된 속성
- `watch()`: 데이터 변화 감지

**예시**:
```javascript
import { ref, computed } from 'vue'

const count = ref(0)  // 반응형 변수
const doubled = computed(() => count.value * 2)  // 자동 계산

function increment() {
  count.value++  // .value로 접근
}
```

### 2️⃣ Pinia (상태 관리)

**왜 Pinia를 사용하나?**
- 여러 컴포넌트에서 공유하는 데이터를 중앙 집중식으로 관리
- 컴포넌트 간 props 전달 없이 데이터 접근 가능

**Store 구조**:
```javascript
export const useAuthStore = defineStore('auth', () => {
  // State (상태)
  const user = ref(null)
  
  // Actions (함수)
  function login() { ... }
  
  // Return (외부 노출)
  return { user, login }
})
```

**사용법**:
```javascript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
authStore.login(email, password)
```

### 3️⃣ Axios Interceptor

**개념**: HTTP 요청/응답을 가로채서 전처리/후처리

**Request Interceptor**:
- 모든 API 요청에 JWT 토큰 자동 추가
```javascript
config.headers.Authorization = `Bearer ${token}`
```

**Response Interceptor**:
- 401 에러(인증 실패) 감지 시 자동 로그아웃 + 로그인 페이지 이동

### 4️⃣ Router Navigation Guard

**개념**: 페이지 이동 전에 조건을 체크하는 기능

```javascript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')  // 로그인 페이지로 리다이렉트
  } else {
    next()  // 정상 진행
  }
})
```

---

## 주요 기능 흐름

### 🔐 인증 흐름 (Login)

```
1. 사용자 입력
   └─ Login.vue: 이메일, 비밀번호 입력

2. API 호출
   └─ authApi.login(email, password)
      └─ POST /login

3. 서버 응답
   └─ { accessToken, user } 받음

4. 상태 저장
   └─ authStore: token, user 저장
   └─ localStorage: 새로고침 대비 저장

5. 페이지 이동
   └─ router.push('/') → 홈으로 이동
```

**핵심 코드 위치**:
- [Login.vue](file:///Users/jeongbyeongjin/SWCAMP22/be22-3rd-team3-project/src/views/auth/Login.vue)
- [auth.js](file:///Users/jeongbyeongjin/SWCAMP22/be22-3rd-team3-project/src/stores/auth.js)
- [authApi.js](file:///Users/jeongbyeongjin/SWCAMP22/be22-3rd-team3-project/src/api/authApi.js)

---

### 🏆 월드컵 게임 흐름

```
1. 게임 시작
   ├─ WorldcupDetail.vue: 라운드 선택 (8강/16강/32강)
   └─ worldcupApi.startWorldcup(id, count)
      └─ 후보 목록을 셔플하여 반환

2. 게임 진행
   ├─ WorldcupGame.vue: 2개씩 비교하며 선택
   ├─ worldcupStore.selectCandidate(selected)
   │  ├─ 선택 내역 저장
   │  ├─ 다음 라운드에 추가
   │  └─ 라운드 완료 시 업데이트
   │
   └─ 라운드 진행: 32강 → 16강 → 8강 → 4강 → 결승

3. 게임 종료
   ├─ 우승자 결정
   ├─ TOP 4 저장
   └─ worldcupStore.saveResult(winner)
      ├─ 후보 통계 업데이트 (승률, 출전 횟수)
      └─ 결과 DB 저장

4. 결과 화면
   └─ WorldcupResult.vue: 우승자 & TOP 4 표시
```

**핵심 코드 위치**:
- [WorldcupGame.vue](file:///Users/jeongbyeongjin/SWCAMP22/be22-3rd-team3-project/src/views/worldcup/WorldcupGame.vue)
- [worldcup.js](file:///Users/jeongbyeongjin/SWCAMP22/be22-3rd-team3-project/src/stores/worldcup.js)
- [worldcupApi.js](file:///Users/jeongbyeongjin/SWCAMP22/be22-3rd-team3-project/src/api/worldcupApi.js)

---

### ⏱️ 퀴즈 게임 흐름

```
1. 퀴즈 시작
   ├─ QuizGame.vue: 문제 로드
   └─ quizApi.startQuiz(id)
      └─ 문제를 셔플하여 반환

2. 타이머 시작
   ├─ setInterval로 1초마다 카운트다운
   ├─ 문제별 제한 시간: 10초
   └─ 전체 제한 시간: 총 시간

3. 정답 입력
   ├─ 사용자 답안 입력
   ├─ normalizeText()로 정규화 비교
   │  └─ 공백 제거, 소문자 변환
   ├─ 정답: 10점 + (남은 시간 × 2점)
   └─ 오답 또는 시간 초과: 0점

4. 게임 종료
   ├─ 총점 계산
   ├─ 티어 결정
   │  └─ 멘사(180+), 수재(160+), 우등생(120+) 등
   └─ quizStore.saveResult(resultData)

5. 결과 화면
   └─ QuizResult.vue: 점수, 티어, 랭킹 표시
```

**핵심 코드 위치**:
- [QuizGame.vue](file:///Users/jeongbyeongjin/SWCAMP22/be22-3rd-team3-project/src/views/quiz/QuizGame.vue)
- [quiz.js](file:///Users/jeongbyeongjin/SWCAMP22/be22-3rd-team3-project/src/stores/quiz.js)
- [quizApi.js](file:///Users/jeongbyeongjin/SWCAMP22/be22-3rd-team3-project/src/api/quizApi.js)

---

## 상세 코드 분석

### 📂 API 레이어

#### `axios.js` - HTTP 클라이언트 설정

**역할**: 모든 API 요청의 기본 설정

```javascript
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',  // 기본 URL
  headers: { 'Content-Type': 'application/json' }
})
```

**Request Interceptor** (요청 전 처리):
```javascript
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`  // 토큰 자동 추가
  }
  return config
})
```

**Response Interceptor** (응답 후 처리):
```javascript
apiClient.interceptors.response.use(
  response => response,  // 성공 시 그대로 반환
  error => {
    if (error.response?.status === 401) {  // 인증 실패
      localStorage.removeItem('token')
      window.location.href = '/login'  // 로그인 페이지로 이동
    }
    return Promise.reject(error)
  }
)
```

**학습 포인트**:
- Interceptor를 사용하면 모든 요청에 일괄적으로 로직 적용 가능
- 토큰 관리, 에러 처리 등을 한 곳에서 관리하여 코드 중복 제거

---

#### `worldcupApi.js` - 월드컵 API

**주요 함수**:

1. **월드컵 목록 조회**
```javascript
getWorldcups(params) {
  return apiClient.get('/worldcups', { params })
}
// 사용 예: getWorldcups({ _sort: 'viewCount', _order: 'desc' })
```

2. **게임 시작** (후보 셔플링)
```javascript
startWorldcup(id, count) {
  return apiClient.get(`/worldcups/${id}/start/${count}`)
}
// count: 8, 16, 32 중 선택
// 서버가 후보를 랜덤으로 섞어서 반환
```

3. **후보 통계 업데이트**
```javascript
updateCandidateStats(id, data) {
  return apiClient.patch(`/worldcup_candidates/${id}`, data)
}
// data: { winCount: 5, appearCount: 10 }
```

---

### 🗄️ Store 레이어

#### `worldcup.js` - 월드컵 게임 상태 관리

**State (상태)**:
```javascript
const currentRound = ref([])  // 현재 라운드 후보들
const nextRound = ref([])     // 다음 라운드 진출자들
const matchIndex = ref(0)     // 현재 매치 인덱스
const roundName = ref('32강') // 라운드 이름
const top4 = ref([])          // 상위 4명
```

**핵심 함수 - selectCandidate()**:

```javascript
function selectCandidate(candidate) {
  // 1. 선택 내역 저장
  selections.value.push({
    leftId: match.left.id,
    rightId: match.right.id,
    selectedId: candidate.id,
    round: roundName.value
  })
  
  // 2. 다음 라운드에 추가
  nextRound.value.push(candidate)
  
  // 3. 다음 매치로 이동
  matchIndex.value += 2
  
  // 4. 라운드 종료 체크
  if (matchIndex.value >= currentRound.value.length) {
    // 4강 진입 시 TOP 4 저장
    if (currentRound.value.length === 4) {
      top4.value = [...currentRound.value]
    }
    
    // 다음 라운드 준비
    currentRound.value = [...nextRound.value]
    nextRound.value = []
    matchIndex.value = 0
    
    // 우승자 결정
    if (currentRound.value.length === 1) {
      return { finished: true, winner: currentRound.value[0] }
    }
  }
  
  return { finished: false }
}
```

**로직 이해**:
- 매치마다 2명씩 비교 (matchIndex는 2씩 증가)
- 선택된 후보만 nextRound에 추가
- currentRound가 모두 소진되면 nextRound가 새 currentRound가 됨
- 최종 1명 남으면 게임 종료

---

#### `quiz.js` - 퀴즈 게임 상태 관리

**타이머 관리**:
```javascript
function startTimer() {
  if (timerInterval.value) clearInterval(timerInterval.value)
  
  timerInterval.value = setInterval(() => {
    totalTime.value--  // 전체 시간 감소
    questionTime.value--  // 문제별 시간 감소
    
    // 문제별 시간 초과
    if (questionTime.value <= 0) {
      submitAnswer('')  // 오답 처리
    }
    
    // 전체 시간 초과
    if (totalTime.value <= 0) {
      endQuiz()  // 게임 종료
    }
  }, 1000)  // 1초마다 실행
}
```

**점수 계산**:
```javascript
function submitAnswer(answer) {
  const isCorrect = normalizeText(answer) === normalizeText(correctAnswer)
  
  if (isCorrect) {
    // 정답: 기본 10점 + 시간 보너스
    const timeBonus = questionTime.value * 2
    const points = 10 + timeBonus
    totalScore.value += points
  }
  // 오답: 0점
}
```

**티어 결정**:
```javascript
function getTier(score) {
  if (score >= 180) return '멘사'
  if (score >= 160) return '수재'
  if (score >= 120) return '우등생'
  if (score >= 80) return '모범생'
  if (score >= 30) return '평범'
  return '노력필요'
}
```

---

### 🛣️ Router 레이어

#### Navigation Guard (인증 가드)

```javascript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 인증이 필요한 페이지인지 확인
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 로그인되지 않았으면 로그인 페이지로
    next({ 
      name: 'Login', 
      query: { redirect: to.fullPath }  // 로그인 후 돌아올 경로 저장
    })
  } else {
    next()  // 정상 진행
  }
})
```

**보호되는 페이지**:
- `/mypage` - 마이페이지
- `/worldcup/create` - 월드컵 생성
- `/quiz/create` - 퀴즈 생성

---

### 🧰 Utils 레이어

#### `helpers.js` - 유틸리티 함수

**1. 이미지 사전 로딩**
```javascript
export function preloadImages(imageUrls) {
  return Promise.all(
    imageUrls.map(url => new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(url)
      img.onerror = () => reject(url)
      img.src = url  // 이미지 로드 시작
    }))
  )
}
```
**사용 이유**: 게임 중 이미지 로딩 지연 방지

**2. 텍스트 정규화**
```javascript
export function normalizeText(text) {
  return text.trim().toLowerCase().replace(/\s+/g, '')
}
// 'New York' → 'newyork'
// ' APPLE ' → 'apple'
```
**사용 이유**: 퀴즈 정답 비교 시 대소문자, 공백 무시

**3. Fisher-Yates 셔플**
```javascript
export function shuffleArray(array) {
  const shuffled = [...array]  // 원본 보존
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]  // Swap
  }
  return shuffled
}
```
**사용 이유**: 공정한 랜덤 셔플 (균등 분포 보장)

---

## 학습 포인트

### 🎓 핵심 학습 개념

#### 1. **반응형 시스템 (Reactivity)**

Vue의 `ref()`와 `reactive()`는 데이터 변경을 자동으로 감지합니다.

```javascript
const count = ref(0)
count.value++  // 화면 자동 업데이트!
```

**원리**:
- JavaScript Proxy를 사용하여 getter/setter를 가로챔
- 데이터 변경 시 관련된 모든 컴포넌트 자동 재렌더링

#### 2. **비동기 처리 (async/await)**

```javascript
async function login(email, password) {
  try {
    const response = await authApi.login(email, password)
    // 성공 처리
  } catch (error) {
    // 에러 처리
  }
}
```

**왜 async/await?**
- Promise 체이닝(.then)보다 읽기 쉬움
- try-catch로 에러 처리가 직관적

#### 3. **컴포넌트 라이프사이클**

```javascript
onMounted(() => {
  // 컴포넌트가 DOM에 마운트된 후 실행
  fetchData()
})

onUnmounted(() => {
  // 컴포넌트가 제거되기 전 실행
  clearInterval(timer)  // 타이머 정리
})
```

**주요 생명주기**:
- `onMounted`: API 호출, 초기 설정
- `onUnmounted`: 타이머 정리, 이벤트 리스너 제거

#### 4. **Props vs Store**

**Props** (부모 → 자식):
```vue
<!-- Parent -->
<ChildComponent :title="myTitle" />

<!-- Child -->
<script setup>
const props = defineProps(['title'])
</script>
```

**Store** (전역 상태):
```javascript
const authStore = useAuthStore()
// 어디서든 접근 가능!
```

**선택 기준**:
- 부모-자식 관계가 명확하고 가까우면 → **Props**
- 여러 컴포넌트에서 공유하면 → **Store**

---

### 🔍 디버깅 팁

#### 1. **Vue DevTools 사용**
- 컴포넌트 트리 확인
- Store 상태 실시간 모니터링
- 이벤트 추적

#### 2. **Console 활용**
```javascript
console.log('현재 상태:', currentRound.value)
console.table(candidates.value)  // 표 형태로 출력
```

#### 3. **Network 탭**
- API 요청/응답 확인
- 헤더에 토큰이 제대로 포함되었는지 체크

---

### 📌 자주 하는 실수

#### ❌ ref 값 접근 시 .value 빼먹기
```javascript
const count = ref(0)
console.log(count)  // ❌ Proxy 객체
console.log(count.value)  // ✅ 0
```

#### ❌ 템플릿에서 .value 사용
```vue
<!-- ❌ 틀림 -->
<div>{{ count.value }}</div>

<!-- ✅ 맞음 -->
<div>{{ count }}</div>
```

#### ❌ 배열/객체 직접 수정
```javascript
// ❌ 반응성 잃음
state.users[0] = newUser

// ✅ 새 배열 할당
state.users = [...state.users]
state.users[0] = newUser
```

---

## 🚀 학습 로드맵

### 초급 (1-2주)
1. ✅ Vue 기본 문법 (템플릿, 디렉티브)
2. ✅ Composition API (ref, computed, watch)
3. ✅ 컴포넌트 통신 (props, emit)

### 중급 (3-4주)
1. ✅ Pinia 상태 관리
2. ✅ Vue Router 라우팅
3. ✅ Axios HTTP 통신
4. ✅ 생명주기 훅

### 고급 (5-6주)
1. ✅ Composables (로직 재사용)
2. ✅ Provide/Inject
3. ✅ TypeScript 적용
4. ✅ 성능 최적화

---

## 📚 추가 학습 자료

- [Vue 3 공식 문서](https://vuejs.org/)
- [Pinia 공식 문서](https://pinia.vuejs.org/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [프로젝트 README](file:///Users/jeongbyeongjin/SWCAMP22/be22-3rd-team3-project/README.md)

---

**💡 복습 시 추천 순서**:
1. README.md 먼저 읽기
2. 이 문서로 전체 흐름 이해
3. 각 파일 코드 직접 읽어보기
4. 기능 하나씩 직접 구현해보기

**화이팅! 🔥**
