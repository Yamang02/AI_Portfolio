# 에픽: UX 및 데이터 로딩 최적화

**작성일**: 2026-01-12
**상태**: ✅ 구현 완료 (최종 검증 대기)
**우선순위**: High
**예상 기간**: 1.5-2주 (리뷰 후 단축)
**최종 수정일**: 2026-01-12
**구현 완료일**: 2026-01-12

---

## 🔄 변경 이력

### 2026-01-12: 리뷰 후 우선순위 및 범위 조정
- **예상 기간**: 2-3주 → 1.5-2주로 단축
- **스크롤 높이 계산 Phase 3 제외**: Lazy Loading 라이브러리 도입, Progressive Image Loading 제거
- **우선순위 조정**:
  - Week 1에 데이터 플래싱 해결 + 마크다운 에디터 기본 기능 병합
  - 스크롤 높이 계산 Phase 2를 선택사항으로 변경
- **사유**: 프로젝트 규모 대비 적절성 검토 결과 일부 항목 과도함 판단

---

## 개요

사용자 경험을 저해하는 데이터 로딩 및 렌더링 이슈를 해결하여, 안정적이고 쾌적한 포트폴리오 사이트를 제공합니다.

## 목표

1. **데이터 일관성 확보**
   - 데이터 플래싱(깜빡임) 현상 제거
   - React Query 캐시 무효화 전략 개선
   - 안정적인 페이지 렌더링

2. **레이아웃 안정성 개선**
   - Cumulative Layout Shift (CLS) 최소화
   - 이미지 로딩으로 인한 스크롤 문제 해결
   - Skeleton UI와 실제 컨텐츠 높이 일치

3. **콘텐츠 작성 효율화**
   - 마크다운 에디터에서 이미지 직접 업로드
   - 드래그 앤 드롭, 클립보드 붙여넣기 지원
   - 콘텐츠 제작 시간 단축

## 비즈니스 가치

- **사용자 신뢰도 향상**: 안정적인 페이지 렌더링으로 전문성 강조
- **SEO 개선**: 레이아웃 안정성 향상으로 Core Web Vitals 점수 상승
- **콘텐츠 생산성 증대**: 이미지 업로드 워크플로우 개선으로 아티클 작성 시간 단축

## 포함된 이슈

### 1. [아티클 상세 페이지 데이터 플래싱 문제](../../backlog/archive/article-detail-flash-issue.md)
**에픽**: UX 및 데이터 로딩 최적화
**우선순위**: High
**예상 소요**: 1주

**문제 요약**:
- 아티클 상세 페이지에서 데이터가 정상 로드된 후 갑자기 "아티클을 찾을 수 없습니다" 메시지가 표시됨
- React Query의 백그라운드 리페치 중 일시적으로 `data`가 `undefined`로 전환
- `refetchOnWindowFocus` 등 기본 설정으로 인한 불필요한 리페치

**주요 작업**:
- [ ] React Query 설정 최적화 (`refetchOnWindowFocus: false`, `placeholderData`)
- [ ] 에러 조건 로직 개선 (`isError`, `isFetching` 활용)
- [ ] API 응답 검증 강화 (404 vs 500 vs 네트워크 에러 구분)
- [ ] 에러 UI/UX 개선 (재시도 버튼, 에러 메시지 세분화)
- [ ] 백그라운드 리페치 인디케이터 추가

**측정 지표**:
- 플래싱 버그 리포트 **제로**
- Cumulative Layout Shift (CLS) < 0.1

---

### 2. [스크롤 높이 계산 문제](../../backlog/archive/scroll-height-calculation-issue.md)
**에픽**: UX 및 데이터 로딩 최적화
**우선순위**: High
**예상 소요**: 1-2주

**문제 요약**:
- 페이지 진입 시 높이 계산이 너무 빨리 수행되어 스크롤이 정상 작동하지 않음
- 이미지 로딩 완료 전에 높이 재계산 → 실제보다 작은 높이로 계산
- 카드 컴포넌트의 동적 폰트 크기 조정 타이밍 문제

**주요 작업**:

**Phase 1: 즉각적인 개선**
- [ ] 이미지에 `aspect-ratio` 추가 (Layout Shift 방지)
- [ ] 페이지 레벨에서 모든 이미지 로딩 추적
- [ ] SkeletonCard 높이 일관성 확인

**Phase 2: 중기 개선**
- [ ] `useContentHeightRecalc` 훅 리팩토링 (컨테이너 ref 지원)
- [ ] 글로벌 CSS 개선 (`scrollbar-gutter: stable`)

**Phase 3: 장기 최적화**
- [ ] Lazy Loading 라이브러리 도입 검토
- [ ] Progressive Image Loading (블러 효과)

**측정 지표**:
- Cumulative Layout Shift (CLS) < 0.1
- Time to Interactive (TTI) < 3s (3G 기준)
- "스크롤이 안 된다" 이슈 빈도 제로

---

### 3. [마크다운 에디터 이미지 업로드 개선](../../backlog/archive/scroll-height-calculation-issue.md#마크다운-에디터-이미지-업로드-개선-방안)
**에픽**: UX 및 데이터 로딩 최적화
**우선순위**: High
**예상 소요**: 1주

**문제 요약**:
- 현재는 콘솔을 통해 이미지 업로드 → URL 복사 → 마크다운 수동 입력 필요
- 복잡한 워크플로우로 콘텐츠 작성 흐름 중단
- 이미지가 많은 아티클의 경우 작업 시간 크게 증가

**주요 작업**:

**Phase 1: 기본 이미지 업로드**
- [ ] 백엔드 타입 확장 (`article` 타입 추가)
- [ ] 마크다운 에디터 커스텀 명령어 추가 (파일 선택 버튼)
- [ ] 업로드 중 로딩 표시 및 에러 처리

**Phase 2: 드래그 앤 드롭 및 클립보드**
- [ ] 드래그 앤 드롭 이미지 업로드 핸들러
- [ ] 클립보드에서 이미지 붙여넣기 지원
- [ ] 다중 이미지 업로드 진행 상태 표시

**Phase 3: 고급 기능 (선택사항)**
- [ ] 이미지 갤러리 기능 (업로드된 이미지 재사용)
- [ ] 이미지 최적화 (Cloudinary transformation)

**측정 지표**:
- 이미지 삽입 시간 **80% 감소**
- 아티클당 평균 이미지 개수 **2배 증가**
- 잘못된 이미지 URL 입력 에러 **제로**

---

## 완료 기준

### 필수 조건
- [ ] 아티클 상세 페이지 플래싱 현상 제로
- [ ] 모든 리스트 페이지에서 스크롤 정상 작동
- [ ] 마크다운 에디터에서 이미지 직접 업로드 가능
- [ ] Lighthouse Performance 점수 **90점 이상**
- [ ] Cumulative Layout Shift (CLS) **0.1 미만**

### 검증 항목
- [ ] 탭 전환 후 페이지 깜빡임 없음
- [ ] 이미지 많은 페이지에서 스크롤 정상
- [ ] 드래그 앤 드롭 이미지 업로드 동작
- [ ] 클립보드 이미지 붙여넣기 동작
- [ ] 모바일 환경 테스트 완료

---

## 우선순위 및 순서

### Week 1: 데이터 플래싱 해결 + 마크다운 에디터 기본 기능 ⭐ ✅ 완료
**예상 소요**: 1주
- ✅ 이슈 #1 완료 (데이터 플래싱 해결)
  - React Query `placeholderData: keepPreviousData` 설정
  - `refetchOnWindowFocus`, `refetchOnReconnect` 비활성화
  - 에러 조건 로직 개선 (`isFetching` 활용)
  - `ArticleErrorView` 컴포넌트 생성 (에러 타입별 메시지)
  - `BackgroundRefetchIndicator` 컴포넌트 생성
- ✅ 이슈 #3 Phase 1 완료 (마크다운 에디터 기본 이미지 업로드)
  - 백엔드 타입 확장 (`article-content` 추가)
  - 프론트엔드 `upload-api.ts` 생성
  - 마크다운 에디터 커스텀 명령어 추가
  - 업로드 중 로딩 표시 및 에러 처리

**우선순위**: 🔥 최우선 (낮은 복잡도, 높은 영향도)

### Week 2: 스크롤 높이 계산 개선 (Phase 1만) + 선택 작업 ✅ 완료
**예상 소요**: 3-5일
- ✅ 이슈 #2 Phase 1 완료 (필수)
  - ProjectCard 이미지에 `aspect-ratio: 16 / 9` 추가
  - SkeletonCard 높이 일관성 확인 및 수정
  - MarkdownRenderer 이미지에 `aspect-ratio` 추가
  - `useImageLoadTracking` 훅 생성
  - ArticleListPage에 이미지 로딩 추적 적용
- ✅ 이슈 #3 Phase 2 완료 (드래그 앤 드롭 및 클립보드)
  - 드래그 앤 드롭 이미지 업로드 핸들러
  - 클립보드 이미지 붙여넣기 지원
  - 다중 이미지 업로드 지원
- ✅ 이미지 모달 개선
  - 이미지 전체 표시 (`object-fit: contain`)
  - 클릭 시 원본 이미지 모달 표시
  - 모달 크기를 이미지 크기에 맞춤

**우선순위**: ⭐ 높음 (간단한 CSS 수정으로 해결)

### Week 3: 추가 개선 (선택사항) ✅ 완료
**예상 소요**: 2-3일 (필요시만)
- ✅ 이슈 #2 Phase 2 완료 (선택사항)
  - 글로벌 CSS 개선 (`scrollbar-gutter: stable`, `min-height: 100vh`)
  - `useContentHeightRecalc`는 이미 ResizeObserver 사용 중이므로 리팩토링 불필요
- ✅ CLS 측정 유틸리티 생성
  - `measureCLS()` 함수 생성
  - `getCurrentCLS()` 함수 생성

**우선순위**: 🔽 낮음 (현재 상태가 심각하지 않으면 제외)

### ❌ 제외된 작업 (과도한 최적화)
- ~~Lazy Loading 라이브러리 도입~~ → 네이티브 `loading="lazy"` 사용
- ~~Progressive Image Loading~~ → Cloudinary 자동 최적화로 충분
- ~~이미지 갤러리 기능~~ → 우선순위 낮음

---

## 리스크 및 대응 방안

### 리스크 1: React Query 설정 변경으로 인한 캐시 동작 변경
**영향도**: High
**발생 가능성**: Medium

**대응 방안**:
- 페이지별로 점진적 적용 (ArticleDetailPage → ProjectDetailPage → ...)
- 각 페이지마다 탭 전환, 새로고침 등 시나리오 테스트
- React Query Devtools로 캐시 상태 모니터링

### 리스크 2: 이미지 로딩 추적으로 인한 성능 저하
**영향도**: Medium
**발생 가능성**: Low

**대응 방안**:
- `useCallback`, `useMemo`로 최적화
- 이미지 개수가 많은 경우 Lazy Loading 병행
- Performance profiling으로 병목 지점 확인

### 리스크 3: 마크다운 에디터 커스터마이징 중 기존 기능 손상
**영향도**: Medium
**발생 가능성**: Low

**대응 방안**:
- 기존 에디터 기능 테스트 케이스 작성
- 커스텀 명령어를 별도 모듈로 분리
- 단계적 롤아웃 (개발 환경 → 스테이징 → 프로덕션)

---

## 관련 문서

### 에픽 문서
- [에픽 리뷰](./review.md) - 프로젝트 규모 대비 적절성 검토
- [기술 설계](./design.md) - 상세 기술 설계 문서
- [체크리스트](./checklist.md) - 작업 체크리스트
- [구현 완료 요약](./IMPLEMENTATION_SUMMARY.md) - 구현 완료 항목 요약

### 성능 최적화 문서
- [성능 최적화 가이드](./performance-optimization.md) - JavaScript, CSS, 번들 최적화
- [LCP 최적화 가이드](./lcp-optimization.md) - Largest Contentful Paint 최적화
- [이미지 최적화 가이드](./image-optimization.md) - 이미지 압축 및 최적화
- [크리티컬 요청 체인 최적화](./critical-request-chain-optimization.md) - 크리티컬 요청 체인 최소화

### 외부 참고 자료
- [React Query Best Practices - TkDodo](https://tkdodo.eu/blog/react-query-best-practices)
- [React: Preventing Layout Shifts](https://maxschmitt.me/posts/react-prevent-layout-shift-body-scrollable)
- [@uiw/react-md-editor Documentation](https://uiwjs.github.io/react-md-editor/)

---

## 측정 지표

### 성능 지표
- **Lighthouse Performance**: 90점 이상
- **Cumulative Layout Shift (CLS)**: 0.1 미만
- **Time to Interactive (TTI)**: 3초 미만 (3G 기준)

### 사용자 경험
- **플래싱 버그 리포트**: 제로
- **스크롤 문제 리포트**: 제로
- **콘텐츠 작성 시간**: 이미지 삽입 시간 80% 단축

### 콘텐츠 품질
- **아티클당 평균 이미지 개수**: 2배 증가
- **이미지 URL 오류**: 제로

---

**다음 액션**: Week 1 시작 - 이슈 #1 (아티클 상세 페이지 플래싱 문제) Phase 1 착수

---

**작성자**: AI Agent (Claude)
**최종 업데이트**: 2026-01-12
