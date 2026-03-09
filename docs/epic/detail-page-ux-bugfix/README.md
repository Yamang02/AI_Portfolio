# 에픽: 상세 페이지 UX 버그픽스

**작성일**: 2026-03-10
**상태**: Backlog
**우선순위**: High
**브랜치명**: `detail-page-ux-bugfix`

---

## 개요

아티클/프로젝트 상세 페이지에서 발견된 세 가지 UX 버그를 수정합니다.

1. TOC에서 `#`(h1) 헤딩이 파싱되지 않는 문제
2. TOC 링크 클릭 시 sticky 헤더 높이를 고려하지 않고 스크롤되는 문제
3. 상세 페이지 최초 진입 시 빈 화면으로 멈추는 문제

---

## 이슈 목록

### Issue 1: TOC h1 헤딩 파싱 누락

**파일**: `frontend/src/main/pages/ArticleDetailPage.tsx:62`

**원인**:
```typescript
headingLevels: [2, 3, 4, 5, 6]  // h1 제외
```
`markdownContainerRef`가 본문 `<article>` 태그에만 연결되어 있으므로, 페이지의 다른 h1과 충돌할 위험이 없습니다. 마크다운 본문에서 `# 제목` (h1)을 사용해도 TOC에 나타나지 않는 버그입니다.

**수정 방향**:
- `headingLevels: [1, 2, 3, 4, 5, 6]`으로 변경 (ArticleDetailPage, ProjectDetailPage 모두)

**영향도**: 낮음 (본문 `<article>` 내부만 스캔하므로 페이지 다른 영역 영향 없음)

---

### Issue 2: TOC 스크롤 시 sticky 헤더 미반영

**파일**:
- `frontend/src/design-system/components/TableOfContents/TableOfContents.tsx:10` — TOC 링크 스크롤 (`headerOffset = 80`)
- `frontend/src/main/pages/ProjectDetailPage/ProjectDetailPage.tsx:73` — pagination 스크롤 (`scrollIntoView` 사용)

**원인**:
1. TOC `scrollToSection`의 `headerOffset = 80`은 하드코딩 값으로 헤더 실제 높이(64px desktop / 56px mobile)와 불일치 가능성 있음
2. ProjectDetailPage pagination 스크롤이 `scrollIntoView({ block: 'start' })`를 사용 — sticky 헤더를 인식하지 못해 헤딩이 헤더 뒤에 가려짐

**수정 방향**:
- 대상 섹션에 `scroll-margin-top` CSS 추가 (권장: 헤더 높이와 동일하게 64px 사용)
- `TableOfContents`의 `headerOffset` 기본값을 실제 헤더 높이(64px)로 변경
- **참고**: 헤더 높이는 `Header.module.css` 기준 desktop 64px, mobile 56px

---

### Issue 3: 상세 페이지 최초 진입 시 빈 화면

**파일**: `frontend/src/main/app/MainAppRoutes.tsx:52-56`

**원인**:

```typescript
// AND 조건 — 하나라도 완료되면 LoadingScreen이 사라짐
const isInitialLoading = isLoading &&
  loadingStates.projects &&
  loadingStates.experiences &&
  loadingStates.educations &&
  loadingStates.certifications;
```

**재현 시나리오**:
1. 홈(`/`)에서는 `shouldLoadData = false` → 데이터 미로드
2. 상세 페이지 이동 → 4개 쿼리 동시 시작 → `isInitialLoading = true` → LoadingScreen 표시
3. experiences/educations/certifications 중 하나가 먼저 완료 → AND 조건 false → **LoadingScreen 사라짐**
4. 아직 `projects` 로딩 중 → `isLoading = true`, `project = null`
5. `hasError = !isLoading && !project = false` → 에러 화면도 없음
6. **빈 화면에서 멈춤**

**새로고침 시 정상인 이유**: `/projects/:id` 직접 접근 시 localStorage 캐시가 있거나, 쿼리 완료 순서 차이로 projects 데이터가 이미 있기 때문

**수정 방향**:
- `isInitialLoading` 조건을 OR로 변경: `isLoading && (loadingStates.projects || ...)`
- 또는 각 상세 페이지에서 자체 로딩 상태를 기준으로 Skeleton 표시 (`isLoading` 직접 사용)
- `ProjectDetailPage`가 `useProjectsQuery`(목록 전체) 대신 `useProjectQuery(id)`(단건 조회)를 사용하도록 개선 검토

---

## 완료 기준

- [ ] 마크다운 본문의 `#` (h1) 헤딩이 TOC에 정상 표시됨 (ArticleDetailPage, ProjectDetailPage 모두)
- [ ] TOC 링크 클릭 시 타겟 헤딩이 sticky 헤더 아래에 올바르게 위치함
- [ ] 프로젝트 상세 페이지에서 "관련 글" 페이지네이션 스크롤 시 헤더에 가리지 않음
- [ ] 홈 → 상세 페이지 이동 시 빈 화면 없이 로딩 또는 콘텐츠가 표시됨
- [ ] 새로고침 및 직접 URL 접근 모두 정상 동작

---

## 관련 파일

| 파일 | 이슈 |
|------|------|
| `frontend/src/main/pages/ArticleDetailPage.tsx` | Issue 1, 확인 |
| `frontend/src/main/pages/ProjectDetailPage/ProjectDetailPage.tsx` | Issue 1, Issue 2 |
| `frontend/src/design-system/components/TableOfContents/TableOfContents.tsx` | Issue 2 |
| `frontend/src/main/app/MainAppRoutes.tsx` | Issue 3 |
| `frontend/src/main/features/project-gallery/hooks/useTOCFromDOM.ts` | Issue 1 참고 |

---

**작성자**: AI Agent (Claude)
**최종 업데이트**: 2026-03-10
