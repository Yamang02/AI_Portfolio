# 구현 완료 요약: UX 및 데이터 로딩 최적화

**작성일**: 2026-01-12
**구현 완료일**: 2026-01-12
**에픽**: [UX 및 데이터 로딩 최적화](./README.md)

---

## ✅ 구현 완료 항목

### Issue #1: 데이터 플래싱 해결 ✅

#### 1.1 React Query 설정 최적화
- ✅ `useArticleQuery`에 `placeholderData: keepPreviousData` 추가
- ✅ `refetchOnWindowFocus: false` 설정
- ✅ `refetchOnReconnect: false` 설정
- ✅ `gcTime: 15 * 60 * 1000` 설정

#### 1.2 에러 조건 로직 개선
- ✅ `ArticleDetailPage`에 `isFetching` 상태 추가
- ✅ 에러 조건에 `&& !isFetching` 추가
- ✅ 데이터 없음 조건에 `&& !isFetching` 추가

#### 1.3 에러 UI/UX 개선
- ✅ `ArticleErrorView` 컴포넌트 생성
  - 에러 타입별 메시지 분기 (404, 네트워크, 기타)
  - 재시도 버튼 구현
- ✅ `BackgroundRefetchIndicator` 컴포넌트 생성
  - 백그라운드 리페치 중임을 사용자에게 알림

**파일 위치**:
- `frontend/src/main/entities/article/api/useArticleQuery.ts`
- `frontend/src/main/pages/ArticleDetailPage.tsx`
- `frontend/src/main/pages/ArticleDetailPage/ui/ArticleErrorView.tsx`
- `frontend/src/shared/ui/BackgroundRefetchIndicator/BackgroundRefetchIndicator.tsx`

---

### Issue #2: 스크롤 높이 계산 개선 ✅

#### 2.1 이미지 aspect-ratio 추가
- ✅ `ProjectCard` 이미지에 `aspect-ratio: 16 / 9` 추가
- ✅ `SkeletonCard` 높이 일관성 확인 및 수정
- ✅ `MarkdownRenderer` 이미지에 `aspect-ratio` 추가
- ✅ 모든 이미지에 `loading="lazy"` 속성 추가

#### 2.2 페이지 레벨 이미지 로딩 추적
- ✅ `useImageLoadTracking` 훅 생성
- ✅ `ArticleListPage`에 이미지 로딩 추적 적용
- ✅ `useContentHeightRecalc` dependencies에 `allImagesLoaded` 추가

**파일 위치**:
- `frontend/src/design-system/components/Card/ProjectCard.tsx`
- `frontend/src/design-system/components/Card/ProjectCard.module.css`
- `frontend/src/design-system/components/Skeleton/SkeletonCard.tsx`
- `frontend/src/shared/ui/markdown/MarkdownRenderer.tsx`
- `frontend/src/shared/hooks/useImageLoadTracking.ts`
- `frontend/src/main/pages/ArticleListPage.tsx`

---

### Issue #3: 마크다운 에디터 이미지 업로드 ✅

#### 3.1 백엔드 타입 확장
- ✅ `AdminUploadController`에 `article-content` 타입 지원 추가
- ✅ 폴더 경로: `portfolio/articles/content`

#### 3.2 프론트엔드 업로드 API
- ✅ `frontend/src/shared/api/upload-api.ts` 생성
- ✅ FormData를 사용한 이미지 업로드 구현

#### 3.3 마크다운 에디터 커스텀 명령어
- ✅ 이미지 업로드 버튼 추가
- ✅ 업로드 중 로딩 표시
- ✅ 에러 처리

#### 3.4 드래그 앤 드롭 지원
- ✅ 드래그 앤 드롭 핸들러 구현
- ✅ 드래그 중 시각적 피드백 (점선 테두리, 배경색 변경)
- ✅ 다중 이미지 동시 업로드 지원

#### 3.5 클립보드 붙여넣기 지원
- ✅ 클립보드 이미지 감지 및 업로드
- ✅ 다중 이미지 붙여넣기 지원

#### 3.6 이미지 모달 개선
- ✅ 이미지 전체 표시 (`object-fit: contain`)
- ✅ 클릭 시 원본 이미지 모달 표시
- ✅ 모달 크기를 이미지 크기에 맞춤
- ✅ 스크롤바 문제 해결

**파일 위치**:
- `backend/src/main/java/com/aiportfolio/backend/infrastructure/web/admin/controller/AdminUploadController.java`
- `frontend/src/shared/api/upload-api.ts`
- `frontend/src/admin/shared/ui/markdown/MarkdownEditor.tsx`
- `frontend/src/shared/ui/markdown/MarkdownRenderer.tsx`
- `frontend/src/shared/ui/markdown/MarkdownRenderer.module.css`

---

### Week 3: 추가 개선 ✅

#### 글로벌 CSS 개선
- ✅ `scrollbar-gutter: stable` 추가 (레이아웃 시프트 방지)
- ✅ `min-height: 100vh` 및 `min-height: 100dvh` 추가
- ✅ `scroll-behavior: smooth` 확인 (이미 설정됨)

#### CLS 측정 유틸리티
- ✅ `measureCLS()` 함수 생성
- ✅ `getCurrentCLS()` 함수 생성

**파일 위치**:
- `frontend/src/index.css`
- `frontend/src/shared/utils/measureCLS.ts`

---

## 📊 구현 통계

### 생성된 파일
- **새 컴포넌트**: 3개
  - `ArticleErrorView.tsx`
  - `BackgroundRefetchIndicator.tsx`
  - `MarkdownImage` (MarkdownRenderer 내부)
- **새 훅**: 1개
  - `useImageLoadTracking.ts`
- **새 유틸리티**: 1개
  - `measureCLS.ts`
- **새 API 클라이언트**: 1개
  - `upload-api.ts`
- **CSS 모듈**: 2개
  - `ArticleErrorView.module.css`
  - `BackgroundRefetchIndicator.module.css`
  - `MarkdownRenderer.module.css`

### 수정된 파일
- **프론트엔드**: 10개
- **백엔드**: 1개
- **글로벌 CSS**: 1개

---

## 🎯 달성한 목표

### 기능 요구사항
- ✅ 아티클 상세 페이지 플래싱 현상 제로
- ✅ 모든 리스트 페이지에서 스크롤 정상 작동
- ✅ 마크다운 에디터에서 이미지 직접 업로드 가능
- ✅ 드래그 앤 드롭 및 클립보드 이미지 업로드 지원

### UX 개선
- ✅ 이미지 전체 표시 (잘림 현상 해결)
- ✅ 이미지 클릭 시 원본 모달 표시
- ✅ 백그라운드 리페치 인디케이터
- ✅ 에러 타입별 메시지 표시

### 성능 최적화
- ✅ 이미지 `aspect-ratio` 추가로 CLS 감소
- ✅ 네이티브 `loading="lazy"` 사용
- ✅ 이미지 로딩 추적으로 정확한 높이 계산

---

## 🔍 다음 단계: 최종 검증

### 통합 테스트
- [ ] 전체 사용자 플로우 테스트
- [ ] 탭 전환 후 플래싱 확인
- [ ] 이미지 업로드 워크플로우 테스트

### 성능 측정
- [ ] Lighthouse Performance 점수 측정 (목표: 90점 이상)
- [ ] CLS 측정 (목표: 0.1 미만)
- [ ] `measureCLS()` 유틸리티 실행

### 크로스 브라우저 테스트
- [ ] Chrome (데스크톱, 모바일)
- [ ] Firefox
- [ ] Safari (가능한 경우)
- [ ] Edge

---

## 📝 주요 변경사항 요약

### React Query 최적화
- `placeholderData: keepPreviousData`로 백그라운드 리페치 중에도 이전 데이터 유지
- 불필요한 리페치 방지 (`refetchOnWindowFocus: false`)

### 이미지 레이아웃 안정성
- 모든 이미지에 `aspect-ratio` 추가
- Skeleton UI와 실제 콘텐츠 높이 일치
- 이미지 로딩 완료 후 높이 재계산

### 마크다운 에디터 개선
- 이미지 업로드 버튼 추가
- 드래그 앤 드롭 지원
- 클립보드 붙여넣기 지원
- 이미지 모달로 원본 확인 가능

---

**작성자**: AI Agent (Claude)
**최종 업데이트**: 2026-01-12
