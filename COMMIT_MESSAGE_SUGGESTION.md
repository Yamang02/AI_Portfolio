# 커밋 메시지 추천

## 옵션 1: 간결한 버전 (권장)

```
fix: 반응형 Grid 레이아웃 및 스크롤 높이 재계산 개선

- ProjectsListPage, ArticleListPage Grid 반응형 수정
  * 모바일: 1열, 태블릿: 2열, 데스크톱: 3열
- 디자인 시스템 breakpoint 토큰 사용으로 통일
- API 로딩 후 페이지 높이 자동 재계산 훅 추가
  * ResizeObserver로 DOM 크기 변경 감지
  * 스크롤 하단 도달 시 컨텐츠 표시 여부 확인 및 재계산
```

## 옵션 2: 상세한 버전

```
fix: 반응형 Grid 레이아웃 및 스크롤 높이 재계산 개선

### 반응형 Grid CSS 수정
- ProjectsListPage.module.css: 모바일 1열, 태블릿 2열, 데스크톱 3열
- ArticleListPage.module.css: 모바일 1열, 태블릿 2열, 데스크톱 auto-fill
- 기본값을 모바일 1열로 변경하여 Mobile First 접근

### 디자인 시스템 토큰 통일
- 하드코딩된 breakpoint 값 제거
- var(--breakpoint-mobile), var(--breakpoint-tablet) 등 디자인 시스템 토큰 사용
- ArticleListPage.module.css의 768px, 1024px 하드코딩 값 제거

### 스크롤 높이 재계산 기능 추가
- useContentHeightRecalc 훅 생성
  * ResizeObserver로 DOM 크기 변경 감지
  * 스크롤 하단 도달 시 컨텐츠 표시 여부 확인
  * API 로딩 완료 후 자동 재계산
- ProjectsListPage, ArticleListPage에 적용
- 스크롤 이벤트 throttle 처리로 성능 최적화

### 해결된 문제
- 태블릿/모바일에서 Grid가 3열로 고정되던 문제 해결
- API 결과 도착 전 페이지 높이 계산으로 인한 스크롤 문제 해결
```

## 옵션 3: Conventional Commits 스타일

```
fix(ui): 반응형 Grid 및 스크롤 높이 재계산 개선

BREAKING CHANGE: 없음

### 변경사항
- 반응형 Grid 레이아웃 수정 (모바일 1열, 태블릿 2열, 데스크톱 3열)
- 디자인 시스템 breakpoint 토큰 사용으로 통일
- API 로딩 후 페이지 높이 자동 재계산 기능 추가

### 추가된 파일
- frontend/src/shared/hooks/useContentHeightRecalc.ts

### 수정된 파일
- frontend/src/main/pages/ProjectsListPage/ProjectsListPage.module.css
- frontend/src/main/pages/ProjectsListPage/ProjectsListPage.tsx
- frontend/src/main/pages/ArticleListPage.module.css
- frontend/src/main/pages/ArticleListPage.tsx
- frontend/src/shared/hooks/index.ts
```

## 옵션 4: 이모지 포함 버전

```
🐛 fix: 반응형 Grid 레이아웃 및 스크롤 높이 재계산 개선

✨ 반응형 Grid CSS 수정
- 모바일: 1열, 태블릿: 2열, 데스크톱: 3열
- Mobile First 접근으로 기본값 변경

🎨 디자인 시스템 토큰 통일
- 하드코딩된 breakpoint 값 제거
- var(--breakpoint-*) 토큰 사용

🔧 스크롤 높이 재계산 기능 추가
- useContentHeightRecalc 훅 생성
- ResizeObserver + 스크롤 이벤트로 자동 재계산
- API 로딩 완료 후 자동 적용
```

---

## 추천

**옵션 1 (간결한 버전)**을 추천합니다. 
- 변경사항을 명확하게 전달
- 너무 길지 않아 읽기 쉬움
- Conventional Commits 스타일 준수
