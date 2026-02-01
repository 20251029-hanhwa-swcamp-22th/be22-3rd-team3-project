# 🎮 이상형 월드컵 & 퀴즈 게임

Vue.js 3와 JSON Server를 사용한 이상형 월드컵 및 타임 어택 퀴즈 게임 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🏆 이상형 월드컵
- 32강/16강 토너먼트 방식
- 실시간 진행 상황 표시
- 승률 통계
- 랭킹 시스템
- 사용자 제작 콘텐츠

### 🧠 퀴즈 게임
- 타임 어택 모드
- 정오답 즉시 판별
- 점수 및 티어 시스템
- 명예의 전당 (TOP 10)
- 사용자 제작 퀴즈

### 👤 사용자 시스템
- 회원가입/로그인
- JWT 기반 인증
- 콘텐츠 제작 권한 관리

## 🚀 시작하기

### 필수 요구사항
- Node.js 20.x 이상
- npm 10.x 이상

### 설치

1. 저장소 클론
```bash
git clone <repository-url>
cd HW22th-3rd-frontend-team3
```

2. 프론트엔드 의존성 설치
```bash
npm install
```

3. 백엔드 의존성 설치
```bash
cd backend
npm install
cd ..
```

### 실행

#### 개발 모드

1. 백엔드 서버 시작 (터미널 1)
```bash
cd backend
npm start
```
서버가 `http://localhost:3000`에서 실행됩니다.

2. 프론트엔드 서버 시작 (터미널 2)
```bash
npm run dev
```
앱이 `http://localhost:5173/`에서 실행됩니다.

3. 브라우저에서 `http://localhost:5173/` 접속

## 🛠️ 기술 스택

### Frontend
- **Vue.js 3.5** - Progressive JavaScript Framework
- **Element Plus** - Vue 3 UI Component Library
- **Vue Router** - Official Router
- **Pinia** - State Management
- **Axios** - HTTP Client
- **Vite** - Build Tool

### Backend
- **JSON Server** - Full fake REST API
- **json-server-auth** - JWT Authentication
- **Multer** - File Upload Middleware
- **CORS** - Cross-Origin Resource Sharing

## 📁 프로젝트 구조

```
├── backend/              # JSON Server 백엔드
│   ├── db.json          # 데이터베이스
│   ├── server.js        # 서버 설정
│   └── uploads/         # 업로드된 파일
├── src/
│   ├── assets/          # 정적 파일
│   ├── components/      # Vue 컴포넌트
│   ├── router/          # 라우터 설정
│   ├── stores/          # Pinia 스토어
│   ├── services/        # API 서비스
│   ├── utils/           # 유틸리티 함수
│   └── views/           # 페이지 컴포넌트
├── package.json
└── vite.config.js
```

## 🎨 주요 페이지

- `/` - 메인 페이지
- `/worldcup` - 월드컵 목록
- `/worldcup/:id/play` - 월드컵 게임
- `/quiz` - 퀴즈 목록
- `/quiz/:id/play` - 퀴즈 게임
- `/login` - 로그인
- `/register` - 회원가입

## 📝 API 엔드포인트

### 인증
- `POST /register` - 회원가입
- `POST /login` - 로그인

### 월드컵
- `GET /worldcups` - 월드컵 목록
- `GET /worldcups/:id` - 월드컵 상세
- `POST /worldcups` - 월드컵 생성
- `GET /worldcups/:id/start/:count` - 게임 시작

### 퀴즈
- `GET /quizzes` - 퀴즈 목록
- `GET /quizzes/:id` - 퀴즈 상세
- `POST /quizzes` - 퀴즈 생성
- `GET /quizzes/:id/start` - 게임 시작

## 🔧 개발

### 빌드
```bash
npm run build
```

### 프리뷰
```bash
npm run preview
```

## 📄 라이선스

This project is licensed under the ISC License.

## 👥 팀

HW22th 3rd Frontend Team 3

---

Made with ❤️ using Vue.js & Element Plus
