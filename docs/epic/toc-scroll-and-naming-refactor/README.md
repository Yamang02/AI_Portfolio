## 에픽: TOC 스크롤 & TOC 용어 정리

**작성일**: 2026-03-13  
**상태**: Backlog  
**우선순위**: Medium  
**브랜치명 제안**: `toc-scroll-and-naming-refactor`

---

## 1. 개요

상세 페이지(프로젝트/아티클)에서 TOC, 마크다운 본문, 섹션 간 인페이지 네비게이션 동작을 **“해시 링크 + CSS 기반 오프셋”** 패턴으로 일원화하고,  
TOC 트리 구조에서 React 예약어(`children`) 사용을 피하면서 의미가 더 뚜렷한 용어로 정리한다.

목표는 다음 두 가지다.

- **스크롤 동작 일관성**: TOC/마크다운/기타 해시 링크가 모두 브라우저 네이티브 스크롤을 활용하면서 sticky 헤더에 가려지지 않도록 처리
- **용어/타입 정리**: TOC 관련 타입/구현에서 `children` 대신 더 명확한 이름(`subItems`)으로 통일

---

## 2. 배경 및 문제 정의

### 2.1 스크롤 동작 불일치

- 마크다운 렌더러(`MarkdownRenderer`)에서 생성된 링크(`[# heading](#heading-id)` 등)는 기본적으로 **네이티브 해시 스크롤**을 사용한다.
- 프로젝트/아티클 상세 페이지 섹션은 `.section { scroll-margin-top: 64px; }`를 사용해 sticky 헤더 높이를 보정하고 있다.
- 반면, TOC 컴포넌트는 `<a href="#id">`에 `onClick + preventDefault`를 붙이고, JS에서 `window.scrollTo`로 별도의 오프셋 로직을 구현하고 있어,
  - **같은 해시 기반 네비게이션인데 TOC만 예외적인 동작을 한다.**
  - sticky 헤더 높이 변경 시 JS/스타일 양쪽을 동시에 수정해야 할 여지가 있다.

### 2.2 TOC 트리 구조에서 `children` 사용

- TOC 관련 타입(`TOCItem`)과 훅(`useTOC`, `useTOCFromDOM`)에서 트리 구조를 표현할 때 필드 이름으로 `children`을 사용 중이다.
- React 진영에서 `children`은 **컴포넌트 태그 안에 렌더되는 자식 노드**를 의미하는 **사실상의 예약어 같은 개념**이다.
- 이 필드는 실제로는 “TOC 트리의 하위 항목 배열”을 의미하므로, 의미가 겹치고 혼동을 유발할 수 있다.
  - 예: `props.children`(렌더 트리) vs `item.children`(TOC 데이터 트리)

---

## 3. 목표

1. **인페이지 네비게이션 스크롤 방식 통일**
   - TOC/마크다운/기타 해시 링크가 모두 **브라우저 네이티브 해시 스크롤**을 사용
   - sticky 헤더 오프셋은 **CSS(`scroll-margin-top`)에서만 책임지는 구조**로 정리

2. **TOC 관련 타입/구현 용어 정리**
   - TOC 트리 구조에서 `children` 필드를 **`subItems`**로 변경
   - 관련 훅/컴포넌트/스토리북 등에서 용어 일관성 확보

---

## 4. 설계 방향

### 4.1 스크롤 오프셋 처리 방식

1. **헤더 높이 전역 변수화**
   - 전역 CSS 혹은 레이아웃 공통 스타일에 다음 변수 정의:
     - `--header-height: 64px;` (데스크톱 기준, 필요 시 반응형 대응은 이후 과제로 분리)

2. **마크다운 헤딩에 scroll-margin-top 적용**
   - `MarkdownRenderer`에서 사용하는 루트 클래스(`wmde-markdown`) 기준으로,
   - `MarkdownRenderer.module.css`에 아래 규칙 추가:

   ```css
   :global(.wmde-markdown) h1,
   :global(.wmde-markdown) h2,
   :global(.wmde-markdown) h3,
   :global(.wmde-markdown) h4,
   :global(.wmde-markdown) h5,
   :global(.wmde-markdown) h6 {
     scroll-margin-top: var(--header-height, 64px);
   }
   ```

3. **페이지 섹션 scroll-margin-top 정리**
   - `ArticleDetailPage.module.css`, `ProjectDetailPage.module.css` 등에서
     - `.section { scroll-margin-top: 64px; }` → `.section { scroll-margin-top: var(--header-height, 64px); }` 로 통일

4. **TOC에서 onClick 기반 커스텀 스크롤 제거**
   - `TableOfContents.tsx`, `ProjectDetailTOC.tsx`:
     - `onClick` + `preventDefault` + 커스텀 `scrollToSection` 제거
     - `<a href={\`#\${item.id}\`}>`만 남기고, 나머지는 네이티브 해시 스크롤 + `scroll-margin-top`에 위임

### 4.2 TOC 타입 및 용어 변경

1. **필드명 변경**
   - `TOCItem`:
     - `children?: TOCItem[];` → `subItems?: TOCItem[];`

2. **영향 범위**
   - `frontend/src/main/features/project-gallery/hooks/`:
     - `useTOC.ts`
     - `useTOCFromDOM.ts`
     - `useActiveSection.ts` 등 TOCItem을 순회/계산하는 로직
   - `frontend/src/design-system/components/TableOfContents/TableOfContents.tsx`
   - `frontend/src/main/pages/ProjectDetailPage/components/ProjectDetailTOC.tsx`
   - `frontend/src/design-system/components/TableOfContents/TableOfContents.stories.tsx`

3. **용어 가이드**
   - 트리 데이터 구조에서:
     - **`subItems`**: TOC 항목의 “하위 항목 배열”을 의미할 때 사용
   - React 컴포넌트에서:
     - **`children`**: 렌더 트리의 자식 노드를 의미할 때만 사용 (기존 관례 유지)

---

## 5. 작업 목록

### 5.1 스크롤 오프셋 통일

- [ ] 전역 CSS에 `--header-height: 64px` 정의
- [ ] `MarkdownRenderer.module.css`에 마크다운 헤딩용 `scroll-margin-top` 규칙 추가
- [ ] `ArticleDetailPage.module.css` / `ProjectDetailPage.module.css`의 `.section`에서 `scroll-margin-top`을 `var(--header-height, 64px)`로 통일
- [ ] `TableOfContents.tsx`에서 `onClick` + `preventDefault` + JS 스크롤 제거
- [ ] `ProjectDetailTOC.tsx`에서 `onClick` + `preventDefault` + JS 스크롤 제거
- [ ] 프로젝트/아티클 상세 페이지에서 TOC 클릭 시 sticky 헤더에 가려지지 않는지 수동 테스트
- [ ] 마크다운 본문 내 `[링크](#heading-id)` 클릭 시 동작 확인 (프로젝트/아티클/프로필 등)

### 5.2 TOC 타입/용어 정리

- [ ] `TOCItem` 타입의 `children` → `subItems`로 변경
- [ ] `useTOC`, `useTOCFromDOM`, `useActiveSection` 등 TOC 관련 훅에서 필드명/지역 변수명 변경
- [ ] `TableOfContents.tsx` / `ProjectDetailTOC.tsx`에서 `children` → `subItems` 반영
- [ ] `TableOfContents.stories.tsx` 등 스토리북 데이터도 `subItems`로 변경
- [ ] 빌드 및 타입체크 통과 확인

---

## 6. 완료 기준

- [ ] 프로젝트/아티클 상세 페이지에서 TOC 항목 클릭 시, sticky 헤더에 헤딩이 가려지지 않고 자연스럽게 스크롤된다.
- [ ] 마크다운 본문 내 해시 링크(`[# heading](#heading-id)`) 클릭 시, 별도 JS 없이도 sticky 헤더 오프셋이 정상적으로 반영된다.
- [ ] TOC 관련 타입과 구현에서 트리 구조 필드는 모두 `subItems`로 통일되어 있고, `children`은 React 컴포넌트의 props 용도로만 사용된다.
- [ ] 관련 문서(이 에픽 문서 포함)에 최종 구조와 컨벤션이 반영되어 있다.

---

**작성자**: AI Agent  
**최종 업데이트**: 2026-03-13

