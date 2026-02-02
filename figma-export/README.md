# 🎨 Figma Export - 프로젝트 문서

이 폴더에는 **이상형 월드컵 & 퀴즈 게임** 프로젝트의 시각적 문서화 자료가 포함되어 있습니다.
Figma, PowerPoint, 또는 다른 디자인 도구로 가져가서 사용할 수 있습니다.

## 📁 파일 목록

### 🖼️ 이미지 파일 (.png)
모든 이미지는 **고해상도 PNG** 형식으로 제공됩니다. Figma에 드래그 앤 드롭으로 바로 가져올 수 있습니다.

1. **`architecture_diagram.png`** - 시스템 아키텍처 다이어그램
   - Frontend (Vue.js 3) → Backend (JSON Server) → Database 구조
   - 3계층 아키텍처 시각화
   
2. **`user_flow_diagram.png`** - 사용자 플로우 차트
   - 메인 페이지에서 월드컵/퀴즈 게임까지의 전체 플로우
   - 인증 및 콘텐츠 생성 경로 포함

3. **`database_schema.png`** - 데이터베이스 ERD
   - 6개 테이블 관계도 (Users, Worldcups, Worldcup_Items, Quizzes, Quiz_Items, Rankings)
   - Primary Key, Foreign Key 관계 표시

4. **`components_structure.png`** - Vue 컴포넌트 계층 구조
   - App.vue를 중심으로 한 전체 컴포넌트 트리
   - Layout, View, Store 구분

5. **`api_endpoints.png`** - REST API 엔드포인트 문서
   - 인증, 월드컵, 퀴즈, 파일 업로드 API 정리
   - HTTP 메서드별 색상 구분 (GET, POST)

6. **`tech_stack_overview.png`** - 기술 스택 인포그래픽
   - Frontend, Backend, Development Tools 섹션
   - 주요 기능 배지 포함

### 📐 벡터 파일 (.svg)
SVG 파일은 **무한 확대가 가능한 벡터 그래픽**입니다. Figma에서 직접 편집할 수 있습니다.

1. **`project-overview.svg`** - 프로젝트 전체 개요
   - 주요 기능, 기술 스택, 페이지 구성 한눈에 보기
   - 편집 가능한 텍스트와 레이아웃

2. **`project-structure.svg`** - 파일 시스템 구조도
   - Frontend, Backend, Config 폴더 트리
   - 각 파일의 역할과 통계 포함

### 📄 프레젠테이션 파일 (.html)

**`presentation.html`** - 인터랙티브 프레젠테이션
- 브라우저에서 바로 열어서 볼 수 있는 완전한 프로젝트 문서
- **PDF로 내보내기:** 브라우저에서 `Ctrl+P` (Mac: `Cmd+P`) → "PDF로 저장"
- 7개 페이지로 구성:
  1. 📑 커버 페이지
  2. 📋 프로젝트 개요 & 핵심 기능
  3. 🛠️ 기술 스택 상세
  4. 🗺️ 라우트 구조
  5. 🔌 API 엔드포인트
  6. 📊 시각화 다이어그램 1
  7. 📊 시각화 다이어그램 2
  8. ✅ 프로젝트 요약

---

## 🚀 Figma로 가져오는 방법

### 방법 1: 이미지 파일 가져오기 (가장 간단)
1. Figma를 열고 새 파일 생성
2. PNG 파일들을 **드래그 앤 드롭**
3. 필요에 따라 크기 조정 및 배치

### 방법 2: SVG 파일 가져오기 (편집 가능)
1. Figma 파일에서 `File` → `Place Image` (`Ctrl+Shift+K`)
2. SVG 파일 선택
3. 모든 요소가 **벡터 객체**로 가져와져 자유롭게 편집 가능

### 방법 3: HTML을 PDF로 변환 → Figma로 가져오기
1. `presentation.html`을 브라우저에서 열기
2. `Ctrl+P` (또는 `Cmd+P`) → "PDF로 저장"
3. Figma에서 PDF 파일 가져오기

---

## 📊 파일 사용 가이드

### 🎯 용도별 추천 파일

| 용도 | 추천 파일 | 이유 |
|------|-----------|------|
| **팀 발표** | `presentation.html` → PDF | 완전한 프로젝트 설명 포함 |
| **아키텍처 문서** | `architecture_diagram.png` | 시스템 구조 한눈에 파악 |
| **개발 가이드** | `components_structure.png` | 컴포넌트 관계 이해 |
| **API 문서** | `api_endpoints.png` | 엔드포인트 레퍼런스 |
| **데이터 모델링** | `database_schema.png` | DB 설계 문서 |
| **프로젝트 소개** | `project-overview.svg` | 빠른 개요 파악 |
| **편집 가능한 디자인** | 모든 `.svg` 파일 | 자유로운 수정 가능 |

---

## 🎨 디자인 특징

### 색상 팔레트
- **Primary Blue**: `#667eea` - Frontend 관련
- **Purple**: `#764ba2` - Backend 관련
- **Green**: `#4caf50` - Development Tools
- **Orange**: `#ff9800` - Quiz 기능
- **Cyan**: `#42b883` - Vue.js (브랜드 컬러)

### 폰트
- **제목**: Inter, Sans-serif (Bold)
- **본문**: Inter, Sans-serif (Regular)
- **코드**: Courier New, Monospace

### 레이아웃
- 모든 다이어그램은 **1200px ~ 1400px 너비** 기준
- 고해상도 디스플레이 최적화
- 인쇄 친화적 (300 DPI 상당)

---

## 💡 추가 정보

### 이미지 스펙
- **포맷**: PNG (무손실 압축)
- **해상도**: 고해상도 (Retina 디스플레이 대응)
- **배경**: 대부분 흰색 또는 투명

### SVG 스펙
- **브라우저 호환성**: 모든 모던 브라우저
- **편집 가능 요소**: 텍스트, 도형, 색상 모두 수정 가능
- **글꼴**: 웹 안전 폰트 사용

### HTML 프레젠테이션
- **반응형**: 모바일/태블릿/데스크톱 모두 지원
- **인쇄 최적화**: 페이지 나눔이 자연스럽게 처리됨
- **인터랙티브**: 키보드 단축키 지원

---

## 📝 라이선스

이 문서들은 **이상형 월드컵 & 퀴즈 게임** 프로젝트의 일부입니다.
프로젝트 관련 목적으로 자유롭게 사용, 수정, 배포할 수 있습니다.

---

## 🔗 관련 링크

- **프로젝트 메인**: `../README.md`
- **소스 코드**: `../src/`
- **백엔드**: `../backend/`

---

## ❓ FAQ

### Q: Figma에서 SVG 파일이 제대로 안 보여요
A: SVG 파일을 직접 열지 말고, Figma 캔버스에 **드래그 앤 드롭**하세요.

### Q: 이미지 해상도를 더 높이고 싶어요
A: PNG 파일들은 이미 고해상도입니다. 더 큰 크기가 필요하면 SVG 파일을 사용하세요 (무한 확대 가능).

### Q: PowerPoint에서 사용하고 싶어요
A: PNG 이미지를 PowerPoint에 직접 삽입하거나, HTML 프레젠테이션을 PDF로 변환 후 사용하세요.

### Q: 다이어그램 내용을 수정하고 싶어요
A: SVG 파일을 Figma나 Illustrator에서 열어 자유롭게 편집할 수 있습니다.

### Q: PDF가 너무 크게 나와요
A: 브라우저 인쇄 설정에서 "배율"을 조정하거나, "용지에 맞춤"을 선택하세요.

---

## 🎉 완료!

이제 Figma, PowerPoint, PDF 등 원하는 형식으로 프로젝트를 시각화하고 공유할 수 있습니다!

**Made with ❤️ by Antigravity AI**
