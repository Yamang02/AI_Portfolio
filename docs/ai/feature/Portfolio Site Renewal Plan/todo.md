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

## 🚀 진행중 작업

### Phase 8: 마크다운 기반 포트폴리오 모달 (Priority: High)

> 📖 상세 문서: [project-modal-markdown-enhancement.md](./project-modal-markdown-enhancement.md)

#### 🎯 목표
프로젝트 모달을 독립적인 포트폴리오 문서로 전환:
- 마크다운 기반 자유로운 컨텐츠 작성
- 자동 생성 목차(TOC)로 탐색성 향상
- 좌측 TOC 사이드바 + 중앙 마크다운 컨텐츠 레이아웃

#### 📝 작업 목록

**1. 마크다운 라이브러리 설치**
- [ ] react-markdown, remark-gfm, rehype-sanitize, rehype-highlight 설치
- [ ] unified, remark-parse, unist-util-visit 설치 (TOC용)
- [ ] @tailwindcss/typography 설치 (스타일링용)

**2. 마크다운 렌더링 컴포넌트**
- [ ] MarkdownRenderer 컴포넌트 구현
- [ ] 커스텀 마크다운 컴포넌트 정의 (헤딩, 코드블록 등)
- [ ] 신택스 하이라이팅 설정
- [ ] Prose 스타일 적용

**3. TOC (Table of Contents) 시스템**
- [ ] useTOC 훅 구현 (마크다운 헤딩 파싱)
- [ ] useActiveSection 훅 구현 (Intersection Observer)
- [ ] ProjectModalTOC 사이드바 컴포넌트
- [ ] 계층 구조 표시 및 스타일링
- [ ] 현재 섹션 하이라이트

**4. ProjectModal 레이아웃 리팩토링**
- [ ] 좌측 TOC + 중앙 컨텐츠 flex 레이아웃
- [ ] ProjectModalHeader 분리 (sticky)
- [ ] ProjectModalContent 분리 (마크다운 영역)
- [ ] 반응형 레이아웃 (모바일: TOC 토글)
- [ ] 기존 메타데이터 헤더로 이동 (제목, 날짜, 배지, 기술스택, 링크)

**5. 스타일링 및 UX**
- [ ] TailwindCSS Typography 커스터마이징
- [ ] 코드 블록 스타일링
- [ ] 앵커 링크 스크롤 동작
- [ ] TOC 스크롤 애니메이션
- [ ] 모바일 TOC 슬라이드 오버레이

**6. 테스트 및 검증**
- [ ] 다양한 마크다운 구조 테스트
- [ ] TOC 파싱 정확도 검증
- [ ] 반응형 레이아웃 테스트
- [ ] 접근성 테스트 (키보드, 스크린 리더)

**예상 시간**: 11-17시간

---

### Phase 9: 프로젝트 버전 관리 시스템 (Priority: Medium)

> 📖 상세 문서: [project-version-management-design.md](./project-version-management-design.md)

#### 🎯 목표
프로젝트의 여러 버전을 관리하여 각 버전별 다른 컨텐츠 표시:
- 버전별 마크다운 문서
- 버전별 기술 스택
- 버전별 스크린샷
- 모달에서 버전 선택 UI

#### 📝 작업 목록

**1. 데이터베이스 스키마**
- [ ] V005 마이그레이션 스크립트 작성
- [ ] `project_versions` 테이블 생성
- [ ] `project_version_tech_stacks` 테이블 생성
- [ ] 기존 프로젝트 데이터를 v1.0으로 마이그레이션
- [ ] 인덱스 및 제약 조건 추가

**2. 백엔드 구현**
- [ ] ProjectVersionJpaEntity 엔티티 생성
- [ ] ProjectVersionTechStackJpaEntity 엔티티 생성
- [ ] ProjectVersion 도메인 모델
- [ ] ProjectVersionMapper 구현
- [ ] ProjectVersionRepository 구현
- [ ] API 엔드포인트 추가:
  - `GET /api/data/projects/{id}?version={version}`
  - `GET /api/data/projects/{id}/versions`

**3. 프론트엔드 타입 및 훅**
- [ ] ProjectVersionMeta 인터페이스
- [ ] ProjectVersionDetail 인터페이스
- [ ] Project 인터페이스 업데이트 (versions 포함)
- [ ] useProjectVersion 훅 구현
- [ ] 버전 전환 로직

**4. UI 컴포넌트**
- [ ] VersionSelector 드롭다운 컴포넌트
- [ ] 버전 메타데이터 표시 (이름, 날짜, 상태)
- [ ] 버전 상태 배지 (active, deprecated, archived)
- [ ] ProjectModal에 버전 선택 통합
- [ ] 버전 전환 애니메이션 (framer-motion)

**5. 데이터 마이그레이션**
- [ ] 대표 프로젝트 2-3개 버전별 마크다운 작성
- [ ] 버전별 스크린샷 준비
- [ ] 버전별 기술 스택 데이터 입력
- [ ] 릴리즈 노트 작성

**6. 테스트 및 검증**
- [ ] API 엔드포인트 테스트
- [ ] 버전 전환 기능 테스트
- [ ] 데이터 무결성 검증
- [ ] 통합 테스트

**예상 시간**: 20-25시간

---

## 📋 향후 작업 (Low Priority)

### 📱 반응형 디자인 개선
- [ ] 모바일 최적화
  - 세로 스크롤, 터치 친화적 버튼
  - 풀스크린 모달
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
1. **Phase 8: 마크다운 모달** (Tasks 16-23)
   - 높은 사용자 가치
   - 포트폴리오 프레젠테이션 핵심 업그레이드

### 단기 (다음 스프린트)
2. **Phase 9: 버전 관리** (Tasks 24-34)
   - 프로젝트 진화 과정 시각화
   - 중간 복잡도

### 지속적
3. **반응형 디자인 개선**
   - 병렬 진행 가능
4. **RAG 데이터 확장**
   - 챗봇 기능 향상

---

## 📊 진행률

```
Phase 1-7 (기본 구현):     ███████████████████████ 100%
Phase 8 (마크다운 모달):   ░░░░░░░░░░░░░░░░░░░░░░░   0%
Phase 9 (버전 관리):       ░░░░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 🔗 관련 문서
- [PRD](./prd.md) - 제품 요구사항 문서
- [Design Specification](./design-specification.md) - 디자인 명세
- [Task List](./task.md) - 상세 실행 태스크
- [Project Modal Enhancement](./project-modal-markdown-enhancement.md) - 마크다운 모달 설계
- [Version Management Design](./project-version-management-design.md) - 버전 관리 설계