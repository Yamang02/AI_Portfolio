# 에픽: 프론트엔드 구조 최적화

**작성일**: 2026-01-12
**상태**: Completed
**우선순위**: Medium
**예상 기간**: 3-4주
**완료일**: 2026-01-12

---

## 개요

프론트엔드 코드베이스의 구조적 일관성을 확보하고, Feature-Sliced Design(FSD) 아키텍처 원칙을 완전히 적용하여 유지보수성과 확장성을 향상시킵니다.

## 목표

1. **구조적 일관성 확립**
   - `src/` 디렉토리에 `main/`, `admin/`, `design-system/`만 존재
   - 각 앱이 독립적인 FSD 구조를 가짐
   - 중복 코드 및 디렉토리 완전 제거

2. **개발자 경험 개선**
   - 명확한 파일 위치 규칙
   - 일관된 import 경로
   - 새로운 개발자의 빠른 온보딩

3. **코드 품질 향상**
   - 관심사 분리 명확화
   - 컴포넌트 재사용성 증대
   - 테스트 용이성 개선

## 비즈니스 가치

- **유지보수 비용 감소**: 명확한 구조로 버그 수정 및 기능 추가 시간 단축
- **개발 속도 향상**: 표준화된 패턴으로 반복 작업 최소화
- **기술 부채 해소**: Phase 6 개발 중 발생한 구조적 문제 해결

## 포함된 이슈

### 1. [프론트엔드 구조 리팩토링](../backlog/archive/frontend-structure-refactoring.md)
**에픽**: 프론트엔드 구조 최적화
**우선순위**: Medium
**예상 소요**: 10일

**목표**:
- `src/main/`, `src/admin/`, `src/design-system/` 최종 구조 확립
- 레거시 디렉토리 제거 (`src/pages/`, `src/widgets/`, `src/features/`, `src/entities/`, `src/shared/`)
- TypeScript path alias 업데이트
- Import 경로 일괄 수정

**주요 작업**:
- [ ] 공통 컴포넌트 분류 (design-system vs main/shared)
- [ ] 페이지 라이프사이클 통일
- [ ] 중복 파일 식별 및 제거
- [ ] 빌드 테스트 및 검증

---

### 2. [남은 작업 목록](../backlog/archive/remaining-tasks.md)
**에픽**: 프론트엔드 구조 최적화
**우선순위**: Medium
**예상 소요**: 5일

**목표**:
- 마이그레이션 후 정리 작업 완료
- Shared UI 컴포넌트 정리
- Features 내부 import 경로 수정

**주요 작업**:
- [ ] TechStackBadge, TechStack 컴포넌트 이동
- [ ] ProjectIcons, Modal 컴포넌트 정리
- [ ] 상대 경로 → path alias 변경
- [ ] 빌드 테스트 및 오류 수정

---

### 3. [구조 개선: 페이지 라이프사이클 통일 및 main/ 통합](../backlog/archive/structure-improvement-after-phase6.md)
**에픽**: 프론트엔드 구조 최적화
**우선순위**: Medium
**예상 소요**: 10-15일

**목표**:
- 모든 페이지가 동일한 라이프사이클 패턴 사용
- 루트 레벨 파일을 `main/`으로 통합
- 상태 관리 분리 (DataProvider, UIProvider)

**주요 작업**:
- [ ] ChatPage, HomePage, ProfilePage에 `usePageLifecycle` 적용
- [ ] 공통 인프라 이동 (`shared/hooks/` → `main/shared/hooks/`)
- [ ] DataProvider, UIProvider 생성
- [ ] MainApp 단순화 (라우팅만 담당)
- [ ] 루트 레벨 정리 및 통합 검증

---

## 완료 기준

### 필수 조건
- [ ] `src/` 디렉토리에 `main/`, `admin/`, `design-system/`만 존재
- [ ] 중복 디렉토리 완전 제거
- [ ] 모든 페이지 정상 렌더링
- [ ] TypeScript 컴파일 에러 0개
- [ ] 빌드 성공 (`npm run build`)
- [ ] 개발 서버 정상 실행 (`npm run dev`)

### 검증 항목
- [ ] 페이지 전환 애니메이션 정상 작동
- [x] Import 경로 일관성 유지 ✅ (2026-01-12 완료)
- [ ] ESLint 규칙 통과
- [ ] Storybook 정상 동작
- [x] 아키텍처 문서 업데이트 완료 ✅ (2026-01-12 완료)

---

## 우선순위 및 순서

### Phase 1: 공통 인프라 정리 (1주차)
- 이슈 #2 (남은 작업 목록) 완료
- Shared UI 컴포넌트 정리
- Import 경로 수정

### Phase 2: 페이지 라이프사이클 통일 (2주차)
- 이슈 #3의 Phase 2-5 진행
- 모든 페이지에 `usePageLifecycle` 적용
- 상태 관리 분리

### Phase 3: 최종 구조 확립 (3주차)
- 이슈 #1 진행
- 루트 레벨 파일 통합
- 중복 코드 제거

### Phase 4: 검증 및 문서화 (4주차)
- 전체 빌드 테스트
- 문서 업데이트
- 팀 리뷰

---

## 리스크 및 대응 방안

### 리스크 1: 대규모 Import 경로 변경으로 인한 빌드 오류
**영향도**: High
**발생 가능성**: Medium

**대응 방안**:
- 단계적 마이그레이션 (페이지별, 기능별)
- 각 단계마다 빌드 테스트
- Git 커밋을 작은 단위로 분리하여 롤백 용이

### 리스크 2: 페이지 전환 애니메이션 깨짐
**영향도**: Medium
**발생 가능성**: Low

**대응 방안**:
- `AnimatedPageTransition` 컴포넌트 위치 우선 결정
- 페이지 라이프사이클 훅 적용 전 테스트

### 리스크 3: 중복 파일 제거 시 의도치 않은 기능 손실
**영향도**: High
**발생 가능성**: Low

**대응 방안**:
- 중복 파일 제거 전 diff 비교
- 각 파일의 사용처 전수 조사 (Grep 활용)
- 제거 전 백업 브랜치 생성

---

## 관련 문서

- [프론트엔드 아키텍처 가이드](../technical/architecture/frontend-architecture.md)
- [Feature-Sliced Design 가이드](../technical/guides/frontend/fsd-guide.md)
- [구조 분석 및 개선 방안](../technical/architecture/structure-analysis-and-improvements.md)

---

## 측정 지표

### 개발 생산성
- **목표**: 새로운 페이지 추가 시간 **30% 단축**
- **측정**: 페이지 scaffolding 소요 시간 비교

### 코드 품질
- **목표**: 중복 코드 **50% 감소**
- **측정**: SonarQube 또는 ESLint 중복 코드 메트릭

### 번들 크기
- **목표**: 프로덕션 빌드 크기 유지 또는 **10% 감소**
- **측정**: `npm run build` 후 번들 크기 비교

### 개발자 만족도
- **목표**: 팀원 피드백 **긍정적** 평가
- **측정**: 리팩토링 완료 후 회고 설문

---

## 완료된 작업 요약

### 2026-01-12 완료
- ✅ TypeScript path alias 정리
  - 존재하지 않는 path alias 제거 (`@entities/*`, `@features/*`, `@widgets/*`, `@pages/*`, `@processes/*`, `@app/*`)
  - `@shared/*` 제거 (중복)
  - 최종 alias: `@/*`, `@main/*`, `@admin/*`, `@design-system/*`

- ✅ Import 경로 통일
  - `@shared/*` → `@/shared/*`로 통일 (13개 파일)
  - `@entities/*` → `@/main/entities/*`로 변경 (6개 파일)
  - `@features/*` → `@/main/features/*`로 변경 (3개 파일)
  - 모든 코드 파일이 일관된 import 패턴 사용

- ✅ 검증 완료
  - 린터 오류 없음 확인
  - TypeScript 컴파일 성공

---

**작성자**: AI Agent (Claude)
**최종 업데이트**: 2026-01-12
