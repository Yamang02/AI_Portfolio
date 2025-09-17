# Portfolio Site Renewal Plan - TODO

## 웹 UI 구현을 위한 데이터베이스 스키마 수정

### 🔧 필수 DB 필드 추가
- [ ] **projects 테이블에 `role` 필드 추가**
  - 타입: VARCHAR(255)
  - 용도: 팀 프로젝트에서 내 역할 표시 (카드/모달 UI용)
  - 예시: "Frontend Developer", "Full Stack Developer", "Team Lead"

- [ ] **projects 테이블에 `screenshots` 필드 추가**
  - 타입: TEXT[] (PostgreSQL 배열)
  - 용도: 모달 이미지 갤러리용 추가 스크린샷 URL들
  - 예시: ["url1.jpg", "url2.jpg", "url3.jpg"]

### 📋 데이터 매핑 검증
- [ ] **기존 필드 매핑 재확인**
  - project.readme → DB.readme (이미 존재 확인됨)
  - 모든 PRD 요구사항과 DB 필드 일치성 검증

### 🎨 프론트엔드 구현
- [ ] **프로젝트 카드 컴포넌트 개발**
  - 썸네일, 제목, 요약, 기술스택, 상태, 팀 아이콘, 역할, 카테고리 표시
  - 토글 기능으로 Maintenance/Lab 프로젝트 show/hide

- [ ] **모달 컴포넌트 개발**
  - 헤더: 제목, 기간, 카테고리, 상태
  - 이미지 갤러리: 메인 이미지 + screenshots 배열
  - 풀 기술스택, 설명, 외부 링크
  - 팀 프로젝트인 경우 역할/기여도 표시

- [ ] **필터링 및 정렬 기능**
  - 프로젝트 타입별 필터 (Build/Maintenance/Lab)
  - 상태별 필터 (Completed/In Progress/Maintenance)
  - 기술스택별 필터
  - 날짜순 정렬

### 🔄 백엔드 API 업데이트
- [ ] **프로젝트 API 응답에 새 필드 포함**
  - role, screenshots 필드 추가
  - 기존 API 호환성 유지

### 📱 반응형 디자인
- [ ] **모바일 최적화**
  - 세로 스크롤, 터치 친화적 버튼
  - 풀스크린 모달, 스와이프 가능한 이미지 갤러리
  - 일관된 카드 크기

## 향후 고려사항 (RAG 개선용)

### 📚 챗봇 RAG 데이터 확장 (선택사항)
- [ ] **achievements 필드 추가** (TEXT[])
  - 프로젝트 성과/학습 내용
  - 챗봇이 프로젝트 성과 설명시 활용

- [ ] **learning 필드 추가** (TEXT[])
  - 기술적 학습 내용
  - 챗봇이 기술적 성장 설명시 활용

---

## 우선순위
1. **높음**: DB 스키마 수정 (role, screenshots)
2. **높음**: 프론트엔드 컴포넌트 개발
3. **중간**: 필터링/정렬 기능
4. **낮음**: RAG 데이터 확장