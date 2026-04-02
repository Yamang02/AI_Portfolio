# Portfolio Site Renewal Plan - TODO

**최근 업데이트**: 2025-10-07
- 마크다운 기반 포트폴리오 모달 개선 추가
- 프로젝트 버전 관리 시스템 추가

---

## ✅ 완료된 작업 (Phase 1-7)

### 🔧 DB 스키마 및 백엔드
- [x] projects 테이블에 `role` 필드 추가
- [x] projects 테이블에 `screenshots` 필드 추가
- [x] 프로젝트 API 응답에 새 필드 포함
- [x] Project 도메인 모델 및 ProjectMapper 업데이트

### 🎨 프론트엔드 기본 구현
- [x] 프로젝트 카드 컴포넌트 개발
- [x] 모달 컴포넌트 개발 (기본)
- [x] 필터링 및 정렬 기능
- [x] 기술스택 배지 시스템

---

## ✅ 완료된 작업 (Phase 1-8)

### 🔧 DB 스키마 및 백엔드
- [x] projects 테이블에 `role` 필드 추가
- [x] projects 테이블에 `screenshots` 필드 추가
- [x] 프로젝트 API 응답에 새 필드 포함
- [x] Project 도메인 모델 및 ProjectMapper 업데이트

### 🎨 프론트엔드 기본 구현
- [x] 프로젝트 카드 컴포넌트 개발
- [x] 모달 컴포넌트 개발 (기본)
- [x] 필터링 및 정렬 기능
- [x] 기술스택 배지 시스템

### 📝 Phase 8: 마크다운 기반 포트폴리오 모달 ✅ COMPLETED

> 📖 상세 문서: [project-modal-markdown-enhancement.md](./project-modal-markdown-enhancement.md)

#### 🎯 목표 달성
프로젝트 모달을 독립적인 포트폴리오 문서로 전환 완료:
- ✅ 마크다운 기반 자유로운 컨텐츠 작성
- ✅ 자동 생성 목차(TOC)로 탐색성 향상
- ✅ 좌측 TOC 사이드바 + 중앙 마크다운 컨텐츠 레이아웃

#### ✅ 완료된 작업

**1. 마크다운 라이브러리 설치**
- [x] react-markdown, remark-gfm, rehype-sanitize, rehype-highlight 설치
- [x] unified, remark-parse, unist-util-visit 설치 (TOC용)
- [x] @tailwindcss/typography 설치 (스타일링용)

**2. 마크다운 렌더링 컴포넌트**
- [x] MarkdownRenderer 컴포넌트 구현
- [x] 커스텀 마크다운 컴포넌트 정의 (헤딩, 코드블록 등)
- [x] 신택스 하이라이팅 설정
- [x] Prose 스타일 적용

**3. TOC (Table of Contents) 시스템**
- [x] useTOC 훅 구현 (마크다운 헤딩 파싱)
- [x] useActiveSection 훅 구현 (Intersection Observer)
- [x] ProjectModalTOC 사이드바 컴포넌트
- [x] 계층 구조 표시 및 스타일링
- [x] 현재 섹션 하이라이트

**4. ProjectModal 레이아웃 리팩토링**
- [x] 좌측 TOC + 중앙 컨텐츠 flex 레이아웃
- [x] ProjectModalHeader 분리 (sticky)
- [x] ProjectModalContent 분리 (마크다운 영역)
- [x] 반응형 레이아웃 (모바일: TOC 토글)
- [x] 기존 메타데이터 헤더로 이동 (제목, 날짜, 배지, 기술스택, 링크)

**5. 추가 수정사항**
- [x] Docker 컨테이너 내 라이브러리 설치 문제 해결
- [x] React Hooks 순서 오류 수정
- [x] 컴포넌트 구조 최적화

**실제 소요 시간**: 약 8시간

---

## 🚀 진행중 작업

---

### Phase 9: 프로젝트 히스토리 관리 시스템 (Priority: Low) ✅ COMPLETED

> 📖 상세 문서: [project-version-management-design.md](./project-version-management-design.md)

#### 🎯 목표 달성
복잡한 버전 관리 시스템 대신 **마크다운 히스토리 섹션**으로 단순화:
- ✅ 프로젝트별 진화 과정을 마크다운으로 문서화
- ✅ 기존 TOC 시스템 활용으로 구현 복잡도 최소화
- ✅ 관리자 페이지와 연계하여 컨텐츠 관리 용이성 확보

#### ✅ 완료된 작업

**1. 설계 단순화**
- [x] 복잡한 버전 관리 시스템 → 마크다운 히스토리 섹션으로 변경
- [x] DB 스키마 변경 없이 기존 readme 필드 활용
- [x] 관리자 페이지와 연계 계획 수립

**2. 히스토리 템플릿 작성**
- [x] 프로젝트 히스토리 마크다운 템플릿 설계
- [x] 버전별 기술 스택 변화 문서화 구조
- [x] 학습 내용 및 트러블슈팅 정리 형식

**3. 샘플 적용**
- [x] AI 포트폴리오 프로젝트 히스토리 작성
- [x] CloseToU 프로젝트 히스토리 작성
- [x] 대표 프로젝트 2-3개 적용 완료

**4. 관리자 페이지 연계 계획**
- [x] 관리자 페이지에서 프로젝트 히스토리 편집 기능 설계
- [x] 마크다운 에디터 통합 방안 수립
- [x] 히스토리 섹션 관리 UI 설계

**실제 소요 시간**: 약 3시간 (설계 및 문서화)

---

## 📋 향후 작업 (Low Priority)

### 🔧 관리자 페이지 개발 (Priority: Medium)
- [ ] 프로젝트 관리 기능
  - 프로젝트 CRUD
  - 마크다운 에디터 통합
  - 히스토리 섹션 편집
  - 이미지 업로드 및 관리

- [ ] 컨텐츠 관리 기능
  - 프로젝트 히스토리 템플릿 제공
  - 마크다운 미리보기
  - 버전별 기술 스택 관리
  - 릴리즈 노트 작성

### 📱 반응형 디자인 개선
- [ ] 모바일 최적화
  - 세로 스크롤, 터치 친화적 버튼
  - 풀스크린 페이지
  - 스와이프 가능한 이미지 갤러리
  - 일관된 카드 크기

### 📚 RAG 데이터 확장 (선택사항)
- [ ] achievements 필드 추가 (TEXT[])
  - 프로젝트 성과/학습 내용
  - 챗봇이 프로젝트 성과 설명시 활용

- [ ] learning 필드 추가 (TEXT[])
  - 기술적 학습 내용
  - 챗봇이 기술적 성장 설명시 활용

---

## 🎯 우선순위 요약

### 즉시 (현재 스프린트)
1. **Phase 8: 마크다운 모달** ✅ COMPLETED
   - 높은 사용자 가치
   - 포트폴리오 프레젠테이션 핵심 업그레이드

### 단기 (다음 스프린트)
2. **관리자 페이지 개발** (Priority: Medium)
   - 프로젝트 히스토리 관리 기능
   - 마크다운 에디터 통합
   - 컨텐츠 관리 시스템

### 지속적
3. **반응형 디자인 개선**
   - 병렬 진행 가능
4. **RAG 데이터 확장**
   - 챗봇 기능 향상

---

## 📊 진행률

```
Phase 1-7 (기본 구현):     ███████████████████████ 100%
Phase 8 (마크다운 모달):   ███████████████████████ 100%
Phase 9 (히스토리 관리):   ███████████████████████ 100%
관리자 페이지 개발:        ░░░░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 🔗 관련 문서
- [PRD](./prd.md) - 제품 요구사항 문서
- [Design Specification](./design-specification.md) - 디자인 명세
- [Task List](./task.md) - 상세 실행 태스크
- [Project Modal Enhancement](./project-modal-markdown-enhancement.md) - 마크다운 모달 설계
- [Version Management Design](./project-version-management-design.md) - 버전 관리 설계