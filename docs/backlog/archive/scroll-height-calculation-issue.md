# 스크롤 높이 계산 문제 및 개선 방안

**에픽**: [UX 및 데이터 로딩 최적화](../epic/ux-data-loading-optimization.md)
**작성일**: 2026-01-12
**우선순위**: High
**카테고리**: Performance, UX
**상태**: Backlog

---

## 문제 요약

각 페이지에 진입할 때 **높이 계산이 너무 빨리 수행**되어, 데이터가 완전히 로딩된 후에도 **스크롤이 정상적으로 작동하지 않는** 현상이 반복적으로 발생하고 있습니다.

### 영향받는 페이지
- [ArticleListPage.tsx](../../frontend/src/main/pages/ArticleListPage.tsx)
- [ProjectsListPage.tsx](../../frontend/src/main/pages/ProjectsListPage/ProjectsListPage.tsx)
- 기타 데이터 로딩이 필요한 모든 페이지

---

## 현재 구현 분석

### 1. useContentHeightRecalc 훅 사용
프로젝트는 [useContentHeightRecalc.ts](../../frontend/src/shared/hooks/useContentHeightRecalc.ts) 커스텀 훅을 통해 높이 재계산을 시도하고 있습니다.

```typescript
// 현재 사용 패턴
useContentHeightRecalc(isLoading, [filteredArticles], {
  scrollThreshold: 100,
  recalcDelay: 200,
  useResizeObserver: true,
});
```

**현재 구현의 주요 기능:**
- `ResizeObserver`를 사용하여 DOM 크기 변경 감지
- 스크롤 이벤트 리스너로 하단 도달 감지
- API 로딩 완료 후 `recalcDelay` 후 높이 재계산
- 강제 reflow 트리거 (`document.body.offsetHeight`)

### 2. 구조적 문제점

#### 문제 1: 이미지 로딩 타이밍
[ProjectCard.tsx:194-199](../../frontend/src/design-system/components/Card/ProjectCard.tsx#L194-L199)와 [ArticleCard.tsx](../../frontend/src/design-system/components/Card/ArticleCard.tsx)에서 이미지를 사용하지만, **이미지 로딩 완료를 기다리지 않습니다**.

```typescript
// ProjectCard.tsx - 이미지 로딩 완료를 기다리지 않음
{hasValidImage ? (
  <img
    src={project.imageUrl}
    alt={project.title}
    className={styles.image}
    onError={() => setImageError(true)}
  />
) : (
  <div className={styles.iconContainer}>
    <ProjectIcon type={getProjectIconType()} size="lg" />
  </div>
)}
```

**문제점:**
- 이미지가 로딩되기 전에는 **0x0 픽셀**을 차지함
- API 응답은 완료되었지만, 이미지는 여전히 로딩 중
- `recalcDelay: 200ms` 후에 재계산해도 이미지가 아직 로드되지 않았을 수 있음
- 결과적으로 **실제 높이보다 작은 높이로 계산**됨

#### 문제 2: 타이밍 의존적인 재계산
```typescript
// useContentHeightRecalc.ts:159-162
const timeoutId = setTimeout(() => {
  recalculateHeight();
  lastHeightRef.current = document.documentElement.scrollHeight;
}, recalcDelay); // 고정된 200ms 딜레이
```

**문제점:**
- **고정된 딜레이**(200ms)는 네트워크 속도, 이미지 크기에 따라 충분하지 않을 수 있음
- 느린 네트워크에서는 이미지가 아직 로드되지 않음
- 빠른 네트워크에서는 불필요한 지연

#### 문제 3: ResizeObserver의 제한적 범위
```typescript
// useContentHeightRecalc.ts:113-114
resizeObserverRef.current = new ResizeObserver(handleResize);
resizeObserverRef.current.observe(document.body);
```

**문제점:**
- `document.body` 전체를 관찰하지만, **개별 이미지 로딩은 감지하지 못할 수 있음**
- 카드 내부의 동적 요소(폰트 크기 조정 등)는 감지되지 않을 수 있음

#### 문제 4: 카드의 동적 폰트 크기 조정
[ProjectCard.tsx:68-133](../../frontend/src/design-system/components/Card/ProjectCard.tsx#L68-L133)와 [ArticleCard.tsx:42-107](../../frontend/src/design-system/components/Card/ArticleCard.tsx#L42-L107)에서 제목 길이에 따라 **동적으로 폰트 크기를 조정**합니다.

```typescript
// 제목 글자 크기 자동 조정
useEffect(() => {
  const adjustFontSize = () => {
    // ... 복잡한 측정 및 조정 로직
  };
  const timeoutId = setTimeout(adjustFontSize, 10);
  // ...
}, [project.title]);
```

**문제점:**
- 폰트 크기 조정이 완료되기 전에 높이 계산이 이루어질 수 있음
- 10ms 딜레이는 매우 짧아 DOM이 완전히 안정화되지 않을 수 있음

---

## 모범 사례 및 개선 방안

### 1. 이미지 Lazy Loading 및 높이/너비 명시

#### 문제 해결
**Layout Shift를 방지하기 위해 이미지의 높이와 너비를 명시**해야 합니다.

```typescript
// 개선안 1: aspect-ratio 사용
<div className={styles.imageWrapper} style={{ aspectRatio: '16/9' }}>
  <img
    src={project.imageUrl}
    alt={project.title}
    className={styles.image}
    loading="lazy"
    onLoad={handleImageLoad}
    onError={() => setImageError(true)}
  />
</div>
```

```css
/* CSS */
.imageWrapper {
  width: 100%;
  aspect-ratio: 16 / 9; /* 또는 적절한 비율 */
  background: var(--color-background-secondary);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

**참고 자료:**
- [How to Lazy Load Images in React](https://www.freecodecamp.org/news/how-to-lazy-load-images-in-react/)
- [Implementing Infinite Scroll And Image Lazy Loading In React](https://www.smashingmagazine.com/2020/03/infinite-scroll-lazy-image-loading-react/)

### 2. Progressive Image Loading (선택사항)
블러 효과를 사용한 점진적 이미지 로딩으로 UX 개선:

```typescript
const [imageLoaded, setImageLoaded] = useState(false);

<div className={styles.imageWrapper}>
  {/* Low-quality placeholder */}
  <img
    src={project.thumbnailUrl}
    className={`${styles.placeholder} ${imageLoaded ? styles.hidden : ''}`}
    alt=""
  />
  {/* Full-quality image */}
  <img
    src={project.imageUrl}
    className={`${styles.image} ${imageLoaded ? styles.visible : ''}`}
    onLoad={() => setImageLoaded(true)}
    alt={project.title}
  />
</div>
```

### 3. 이미지 로딩 완료 추적
페이지 레벨에서 **모든 이미지 로딩을 추적**:

```typescript
// 개선안: 페이지 레벨에서 이미지 로딩 추적
const [imagesLoaded, setImagesLoaded] = useState(false);
const loadedImagesCount = useRef(0);
const totalImages = projects.filter(p => p.imageUrl).length;

const handleImageLoad = useCallback(() => {
  loadedImagesCount.current += 1;
  if (loadedImagesCount.current === totalImages) {
    setImagesLoaded(true);
  }
}, [totalImages]);

// 높이 재계산은 API + 이미지 모두 로딩 완료 후
useContentHeightRecalc(isLoading || !imagesLoaded, [projects], {
  scrollThreshold: 100,
  recalcDelay: 100, // 이미지 로딩을 기다렸으므로 더 짧게
  useResizeObserver: true,
});
```

### 4. 더 나은 ResizeObserver 패턴

#### 개선안: 컨테이너별 관찰
`document.body` 대신 **실제 콘텐츠 컨테이너를 관찰**:

```typescript
export function useContentHeightRecalc(
  isLoading: boolean,
  containerRef?: RefObject<HTMLElement>, // 추가
  dependencies: unknown[] = [],
  options = {}
) {
  // ...

  useEffect(() => {
    if (!useResizeObserver || typeof ResizeObserver === 'undefined') {
      return;
    }

    const target = containerRef?.current || document.body;
    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(target);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [useResizeObserver, handleResize, containerRef]);
}
```

**참고 자료:**
- [Best Practices for Resize Observer React Implementation](https://www.dhiwise.com/post/mastering-resize-observer-react-best-practices)
- [Using the ResizeObserver API in React](https://blog.logrocket.com/using-resizeobserver-react-responsive-designs/)

### 5. Skeleton UI로 공간 예약
로딩 중에도 **최종 높이와 유사한 공간을 확보**:

```typescript
// 현재는 구현되어 있음 (긍정적)
{isLoading ? (
  [...Array(6)].map((_, i) => (
    <SkeletonCard key={i} isLoading={true} />
  ))
) : (
  // actual content
)}
```

**개선 포인트:**
- SkeletonCard가 실제 카드와 **정확히 동일한 높이**를 가지는지 확인
- CSS에서 `min-height` 또는 고정 높이 설정

### 6. Intersection Observer 활용 (추가 최적화)
화면에 보이는 요소만 로딩하여 초기 로딩 성능 개선:

```typescript
// react-lazyload 라이브러리 사용 예시
import LazyLoad from 'react-lazyload';

<LazyLoad height={300} offset={100} once>
  <ProjectCard project={project} onClick={handleClick} />
</LazyLoad>
```

**참고 자료:**
- [react-lazy-load-image-component](https://www.npmjs.com/package/react-lazy-load-image-component)
- [React Intersection Observer for Lazy Loading](https://www.sitepoint.com/react-intersection-observer-lazy-load-infinite-scroll-animations/)

### 7. scrollbar-gutter CSS 속성 활용
스크롤바 출현으로 인한 Layout Shift 방지:

```css
/* 글로벌 스타일 */
html {
  scrollbar-gutter: stable;
}
```

**참고 자료:**
- [Preventing Layout Shifts Caused by Scrollbars](https://dev.to/rashidshamloo/preventing-the-layout-shift-caused-by-scrollbars-2flp)
- [React: Preventing Layout Shifts When Body Becomes Scrollable](https://maxschmitt.me/posts/react-prevent-layout-shift-body-scrollable)

---

## 제안하는 단계별 개선 계획

### Phase 1: 즉각적인 개선 (High Priority)
1. **이미지에 aspect-ratio 추가**
   - ProjectCard와 ArticleCard의 이미지 컨테이너에 고정 비율 적용
   - CSS에서 `aspect-ratio` 또는 padding-top 트릭 사용

2. **이미지 로딩 추적 개선**
   - 페이지 레벨에서 모든 이미지 로딩 완료 추적
   - `useContentHeightRecalc`에 이미지 로딩 상태 포함

3. **SkeletonCard 높이 일관성 확인**
   - 실제 카드와 동일한 높이 보장
   - CSS `min-height` 설정

### Phase 2: 중기 개선 (Medium Priority)
4. **useContentHeightRecalc 훅 리팩토링**
   - 컨테이너 ref 지원 추가
   - 이미지 로딩 완료 콜백 지원
   - 더 정교한 디바운싱/스로틀링

5. **글로벌 CSS 개선**
   - `scrollbar-gutter: stable` 추가
   - Layout Shift 방지 스타일 추가

### Phase 3: 장기 최적화 (Low Priority)
6. **Lazy Loading 라이브러리 도입**
   - `react-lazyload` 또는 `react-lazy-load-image-component` 검토
   - 화면 밖 콘텐츠 지연 로딩

7. **Progressive Image Loading**
   - 썸네일 → 고해상도 점진적 로딩
   - 블러 효과로 UX 개선

---

## 측정 지표

개선 효과를 측정하기 위한 지표:

1. **Cumulative Layout Shift (CLS)**
   - Lighthouse에서 측정
   - 목표: CLS < 0.1

2. **사용자 보고 버그 감소**
   - "스크롤이 안 된다" 이슈 빈도

3. **Time to Interactive (TTI)**
   - 페이지 로딩 후 상호작용 가능 시간
   - 목표: TTI < 3s (3G 기준)

---

## 참고 자료

### Layout Shift 및 스크롤 문제
- [React: Preventing Layout Shifts When Body Becomes Scrollable](https://maxschmitt.me/posts/react-prevent-layout-shift-body-scrollable)
- [Infinite Scroll without Layout Shifts](https://addyosmani.com/blog/infinite-scroll-without-layout-shifts/)
- [Preventing Layout Shifts Caused by Scrollbars](https://dev.to/rashidshamloo/preventing-the-layout-shift-caused-by-scrollbars-2flp)

### ResizeObserver 모범 사례
- [Best Practices for Resize Observer React Implementation](https://www.dhiwise.com/post/mastering-resize-observer-react-best-practices)
- [Using the ResizeObserver API in React](https://blog.logrocket.com/using-resizeobserver-react-responsive-designs/)
- [ResizeObserver - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)

### 이미지 Lazy Loading
- [How to Lazy Load Images in React](https://www.freecodecamp.org/news/how-to-lazy-load-images-in-react/)
- [Implementing Infinite Scroll And Image Lazy Loading In React](https://www.smashingmagazine.com/2020/03/infinite-scroll-lazy-image-loading-react/)
- [react-lazy-load-image-component](https://www.npmjs.com/package/react-lazy-load-image-component)
- [React Intersection Observer](https://www.sitepoint.com/react-intersection-observer-lazy-load-infinite-scroll-animations/)

### 일반 성능 최적화
- [Virtual Scrolling in React](https://medium.com/@swatikpl44/virtual-scrolling-in-react-6028f700da6b)
- [Content Jumping (and How To Avoid It)](https://css-tricks.com/content-jumping-avoid/)

---

## 관련 파일

- [frontend/src/shared/hooks/useContentHeightRecalc.ts](../../frontend/src/shared/hooks/useContentHeightRecalc.ts)
- [frontend/src/main/pages/ArticleListPage.tsx](../../frontend/src/main/pages/ArticleListPage.tsx)
- [frontend/src/main/pages/ProjectsListPage/ProjectsListPage.tsx](../../frontend/src/main/pages/ProjectsListPage/ProjectsListPage.tsx)
- [frontend/src/design-system/components/Card/ProjectCard.tsx](../../frontend/src/design-system/components/Card/ProjectCard.tsx)
- [frontend/src/design-system/components/Card/ArticleCard.tsx](../../frontend/src/design-system/components/Card/ArticleCard.tsx)

---

**다음 액션**: 팀 논의 및 우선순위 결정 후 Phase 1부터 순차적으로 구현

---

# 마크다운 에디터 이미지 업로드 개선 방안

**작성일**: 2026-01-12
**우선순위**: High
**카테고리**: UX, Content Management
**상태**: Backlog

---

## 문제 요약

현재 어드민 페이지에서 아티클 작성 시 마크다운에 이미지를 삽입하려면 **별도의 콘솔을 통해 이미지를 업로드하고, 생성된 URL을 수동으로 마크다운에 입력**해야 합니다. 이는 콘텐츠 작성 워크플로우를 크게 저해하며, 사용자 경험을 악화시킵니다.

### 현재 워크플로우의 문제점

1. **복잡한 작업 흐름**
   - 콘솔/개발자 도구를 열어 이미지 업로드 API 호출
   - 응답에서 URL 복사
   - 마크다운 에디터로 돌아와서 `![alt](url)` 형식으로 수동 입력
   - 실제 렌더링 결과 확인까지 여러 단계 필요

2. **비효율적인 콘텐츠 작성**
   - 글 작성 흐름이 중단됨
   - 이미지가 많은 아티클의 경우 작업 시간이 크게 증가
   - 실수로 잘못된 URL을 입력할 가능성

3. **미리보기 제약**
   - 업로드한 이미지가 실제로 어떻게 보이는지 즉시 확인 불가
   - URL 입력 후에야 미리보기에서 확인 가능

---

## 현재 구현 분석

### 1. 마크다운 에디터

[MarkdownEditor.tsx:1-33](../../frontend/src/admin/shared/ui/markdown/MarkdownEditor.tsx#L1-L33)에서 `@uiw/react-md-editor@4.0.11`을 사용하고 있습니다.

```typescript
export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  height = 500,
  preview,
}) => {
  return (
    <div style={{ width: '100%' }}>
      <MDEditor
        value={value || ''}
        onChange={(val) => onChange?.(val || '')}
        preview={preview}
        height={height}
      />
    </div>
  );
};
```

**현재 상태:**
- 기본 마크다운 편집 기능만 제공
- 이미지 업로드 기능 없음
- 드래그 앤 드롭 지원 없음
- 클립보드에서 이미지 붙여넣기 불가

### 2. 이미지 업로드 인프라

#### 프론트엔드 API
[adminUploadApi.ts:53-69](../../frontend/src/admin/api/adminUploadApi.ts#L53-L69)에서 이미지 업로드 API를 제공합니다.

```typescript
async uploadImage(
  file: File,
  type: 'project' | 'screenshots' | 'skill' | 'profile',
  projectId?: string
): Promise<ApiResponse<ImageUploadResponse>>
```

#### 백엔드 API
[AdminUploadController.java:41-149](../../backend/src/main/java/com/aiportfolio/backend/infrastructure/web/admin/controller/AdminUploadController.java#L41-L149)에서 Cloudinary 기반 이미지 업로드를 처리합니다.

**제약사항:**
- `type` 파라미터가 고정된 값만 허용 (`'project' | 'screenshots' | 'skill' | 'profile'`)
- 아티클용 이미지 타입이 명시적으로 정의되지 않음

### 3. 사용 중인 라이브러리

`@uiw/react-md-editor@4.0.11`은 다음 기능을 지원합니다:
- ✅ 기본 마크다운 편집
- ✅ 실시간 미리보기
- ✅ 커스텀 명령어 추가 가능
- ✅ 드래그 앤 드롭 이벤트 처리 가능
- ❌ 기본 이미지 업로드 기능 없음 (직접 구현 필요)

---

## 개선 방안

### Phase 1: 기본 이미지 업로드 기능 (High Priority)

#### 1.1. 백엔드 타입 확장
[AdminUploadController.java:332](../../backend/src/main/java/com/aiportfolio/backend/infrastructure/web/admin/controller/AdminUploadController.java#L332)의 `getFolderPath` 메서드에 `article` 타입 추가:

```java
private String getFolderPath(String type) {
    return switch (type.toLowerCase()) {
        case "project" -> "portfolio/projects";
        case "skill" -> "portfolio/skills";
        case "profile" -> "portfolio/profile";
        case "screenshots" -> "portfolio/projects/screenshots";
        case "article" -> "portfolio/articles";  // 추가
        default -> "portfolio/misc";
    };
}
```

**프론트엔드 타입도 확장:**
```typescript
// adminUploadApi.ts
type: 'project' | 'screenshots' | 'skill' | 'profile' | 'article'
```

#### 1.2. 마크다운 에디터 커스텀 명령어 추가

**옵션 A: 파일 선택 버튼 추가 (간단)**

```typescript
import MDEditor, { commands } from '@uiw/react-md-editor';
import { adminUploadApi } from '@/admin/api/adminUploadApi';

const imageUploadCommand: commands.ICommand = {
  name: 'image-upload',
  keyCommand: 'image-upload',
  buttonProps: { 'aria-label': '이미지 업로드', title: '이미지 업로드' },
  icon: (
    <svg width="12" height="12" viewBox="0 0 20 20">
      <path fill="currentColor" d="M0 4c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2 0v12h16V4H2zm8 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-6 8l4-4 3 3 5-5 4 4v1H4v-1z"/>
    </svg>
  ),
  execute: async (state, api) => {
    // 파일 선택 다이얼로그 생성
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // 로딩 표시 삽입
        api.replaceSelection('![업로드 중...](uploading)');

        // 이미지 업로드
        const response = await adminUploadApi.uploadImage(file, 'article');
        const imageUrl = response.data.url;

        // 마크다운 이미지 구문으로 교체
        const imageMarkdown = `![${file.name}](${imageUrl})`;
        api.replaceSelection(imageMarkdown);
      } catch (error) {
        console.error('Image upload failed:', error);
        api.replaceSelection('[이미지 업로드 실패]');
        message.error('이미지 업로드에 실패했습니다.');
      }
    };

    input.click();
  },
};

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  height = 500,
  preview,
}) => {
  return (
    <div style={{ width: '100%' }}>
      <MDEditor
        value={value || ''}
        onChange={(val) => onChange?.(val || '')}
        preview={preview}
        height={height}
        commands={[
          commands.group(
            [
              commands.title1,
              commands.title2,
              commands.title3,
              commands.title4,
              commands.title5,
              commands.title6,
            ],
            {
              name: 'title',
              groupName: 'title',
              buttonProps: { 'aria-label': 'Insert title' }
            }
          ),
          commands.divider,
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.hr,
          commands.divider,
          commands.link,
          imageUploadCommand, // 커스텀 이미지 업로드 명령어
          commands.divider,
          commands.code,
          commands.codeBlock,
          commands.quote,
          commands.divider,
          commands.unorderedListCommand,
          commands.orderedListCommand,
          commands.checkedListCommand,
        ]}
      />
    </div>
  );
};
```

**참고 자료:**
- [@uiw/react-md-editor Custom Commands](https://www.npmjs.com/package/@uiw/react-md-editor#custom-commands)
- [MDEditor Commands API](https://uiwjs.github.io/react-md-editor/#custom-toolbars)

---

### Phase 2: 드래그 앤 드롭 및 클립보드 지원 (Medium Priority)

#### 2.1. 드래그 앤 드롭 이미지 업로드

```typescript
export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  height = 500,
  preview,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    try {
      // 여러 이미지 업로드 처리
      const uploadPromises = imageFiles.map(file =>
        adminUploadApi.uploadImage(file, 'article')
      );

      const responses = await Promise.all(uploadPromises);
      const imageMarkdowns = responses.map((res, idx) =>
        `![${imageFiles[idx].name}](${res.data.url})`
      ).join('\n\n');

      // 현재 커서 위치에 삽입
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const newValue =
          value.slice(0, cursorPos) +
          '\n' + imageMarkdowns + '\n' +
          value.slice(cursorPos);
        onChange?.(newValue);
      }

      message.success(`${imageFiles.length}개의 이미지가 업로드되었습니다.`);
    } catch (error) {
      console.error('Image upload failed:', error);
      message.error('이미지 업로드에 실패했습니다.');
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      style={{ width: '100%' }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <MDEditor
        textareaProps={{ ref: textareaRef }}
        value={value || ''}
        onChange={(val) => onChange?.(val || '')}
        preview={preview}
        height={height}
        commands={[/* ... */]}
      />
    </div>
  );
};
```

#### 2.2. 클립보드에서 이미지 붙여넣기

```typescript
const handlePaste = async (e: ClipboardEvent) => {
  const items = Array.from(e.clipboardData?.items || []);
  const imageItems = items.filter(item => item.type.startsWith('image/'));

  if (imageItems.length === 0) return;

  e.preventDefault();

  try {
    const uploadPromises = imageItems.map(item => {
      const file = item.getAsFile();
      if (!file) return Promise.resolve(null);
      return adminUploadApi.uploadImage(file, 'article');
    });

    const responses = await Promise.all(uploadPromises);
    const imageMarkdowns = responses
      .filter(res => res !== null)
      .map((res, idx) => `![pasted-image-${idx}](${res.data.url})`)
      .join('\n\n');

    // 커서 위치에 삽입 (위와 동일한 로직)
    // ...

  } catch (error) {
    console.error('Paste image upload failed:', error);
    message.error('이미지 업로드에 실패했습니다.');
  }
};

// MDEditor에 onPaste 이벤트 연결
<div onPaste={handlePaste}>
  <MDEditor ... />
</div>
```

**참고 자료:**
- [Handling Paste Events in React](https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event)
- [React Markdown Editor with Image Upload](https://dev.to/franciscomendes10866/how-to-create-a-markdown-editor-in-react-3d0l)

---

### Phase 3: 고급 기능 (Low Priority)

#### 3.1. 업로드 진행률 표시

```typescript
const [uploadProgress, setUploadProgress] = useState<number>(0);

// Cloudinary 업로드는 기본적으로 진행률 추적을 지원하지 않으므로
// 파일 크기 기반 예상 진행률 표시 또는 간단한 로딩 스피너 사용
<div className="upload-progress">
  {uploadProgress > 0 && uploadProgress < 100 && (
    <Progress percent={uploadProgress} />
  )}
</div>
```

#### 3.2. 이미지 최적화 및 리사이징

**백엔드에서 Cloudinary 변환 옵션 활용:**

```java
// ImageUploadService.java에서 업로드 시 변환 옵션 추가
Map<String, Object> uploadParams = new HashMap<>();
uploadParams.put("folder", folder);
uploadParams.put("transformation", Arrays.asList(
    // 최대 너비 1920px로 제한
    Map.of("width", 1920, "crop", "limit"),
    // 품질 자동 최적화
    Map.of("quality", "auto"),
    // WebP 형식으로 자동 변환 (지원되는 브라우저)
    Map.of("fetch_format", "auto")
));
```

**프론트엔드에서 썸네일/원본 URL 모두 제공:**

```typescript
const response = await adminUploadApi.uploadImage(file, 'article');
const originalUrl = response.data.url;

// Cloudinary URL 변환 예시
const thumbnailUrl = originalUrl.replace(
  '/upload/',
  '/upload/w_400,h_300,c_fill/'
);

const imageMarkdown = `[![Thumbnail](${thumbnailUrl})](${originalUrl})`;
```

#### 3.3. 이미지 갤러리 관리

**업로드된 이미지 목록 조회 및 재사용:**

```typescript
// 새로운 API 엔드포인트 필요
GET /api/admin/upload/images?type=article&limit=20

// UI: 이미지 갤러리 모달
const ImageGalleryModal = () => {
  const { data: images } = useQuery(['article-images'], () =>
    adminUploadApi.getImages('article')
  );

  const handleSelectImage = (imageUrl: string) => {
    // 에디터에 이미지 삽입
    api.replaceSelection(`![](${imageUrl})`);
  };

  return (
    <Modal>
      <div className="image-gallery">
        {images?.map(img => (
          <img
            key={img.publicId}
            src={img.url}
            onClick={() => handleSelectImage(img.url)}
          />
        ))}
      </div>
    </Modal>
  );
};
```

---

## 대안 검토

### 대안 1: 다른 마크다운 에디터 라이브러리 사용

#### react-markdown-editor-lite
- ✅ 이미지 업로드 플러그인 기본 제공
- ✅ 드래그 앤 드롭 지원
- ❌ UI가 다소 구식
- ❌ 커스터마이징이 제한적

#### Toast UI Editor
- ✅ 강력한 기능 (위지윅 + 마크다운)
- ✅ 이미지 업로드 훅 제공
- ✅ 플러그인 생태계
- ❌ 번들 크기가 큼 (~200KB)
- ❌ React 래퍼가 공식 지원이지만 타입스크립트 지원 부족

#### SimpleMDE / EasyMDE
- ✅ 가볍고 간단
- ✅ 이미지 업로드 옵션 제공
- ❌ 마크다운 미리보기가 동일 뷰에서 불가능
- ❌ 업데이트가 드뭄

**결론**: 현재 `@uiw/react-md-editor`를 유지하고 커스텀 이미지 업로드 기능을 추가하는 것이 **가장 비용 효율적**입니다.
- 이미 사용 중인 라이브러리
- 커스터마이징이 용이
- 번들 크기 증가 없음
- 팀의 학습 비용 없음

### 대안 2: WYSIWYG 에디터로 전환

#### Lexical (Facebook)
- ✅ 최신 기술 (React 18 지원)
- ✅ 플러그인 아키텍처
- ✅ 이미지 업로드 플러그인 가능
- ❌ 마크다운 출력 변환 필요
- ❌ 러닝 커브 높음

#### Slate.js
- ✅ 완전한 커스터마이징 가능
- ✅ React 친화적
- ❌ 모든 기능을 직접 구현해야 함
- ❌ 마크다운 출력 변환 필요

**결론**: 마크다운 기반 콘텐츠 관리가 프로젝트 요구사항이므로, WYSIWYG로 전환하는 것은 **과도한 변경**입니다.

---

## 제안하는 단계별 구현 계획

### Phase 1: 기본 이미지 업로드 (High Priority)
**예상 작업 범위**: 1-2개 파일 수정, 커스텀 명령어 추가

1. ✅ **백엔드 타입 확장**
   - `AdminUploadController.java` - `getFolderPath`에 `article` 타입 추가
   - 테스트: Postman으로 `/api/admin/upload/image?type=article` 동작 확인

2. ✅ **프론트엔드 타입 확장**
   - `adminUploadApi.ts` - 타입 정의에 `'article'` 추가

3. ✅ **마크다운 에디터 이미지 업로드 버튼 추가**
   - `MarkdownEditor.tsx` - 커스텀 `imageUploadCommand` 구현
   - 파일 선택 다이얼로그 → 업로드 → 마크다운 삽입 로직

4. ✅ **UI/UX 개선**
   - 업로드 중 로딩 표시
   - 에러 처리 및 사용자 피드백

### Phase 2: 드래그 앤 드롭 및 클립보드 (Medium Priority)
**예상 작업 범위**: `MarkdownEditor.tsx` 리팩토링

5. ✅ **드래그 앤 드롭 핸들러 추가**
   - `onDrop`, `onDragOver` 이벤트 처리
   - 다중 이미지 업로드 지원

6. ✅ **클립보드 붙여넣기 핸들러 추가**
   - `onPaste` 이벤트 처리
   - 스크린샷 직접 붙여넣기 지원

7. ✅ **다중 업로드 진행 상태 표시**
   - `Promise.all` 진행률 추적
   - 실패한 이미지 재시도 옵션

### Phase 3: 고급 기능 (Low Priority)
**예상 작업 범위**: 새로운 API 엔드포인트, 컴포넌트 추가

8. ⏹️ **이미지 갤러리 기능**
   - 백엔드: `GET /api/admin/upload/images` API 추가
   - 프론트엔드: 이미지 선택 모달 UI

9. ⏹️ **이미지 최적화**
   - Cloudinary transformation 파라미터 활용
   - 자동 WebP 변환 및 리사이징

10. ⏹️ **이미지 메타데이터 관리**
    - Alt 텍스트 편집 UI
    - 이미지 캡션 추가 기능

---

## 성공 지표

1. **콘텐츠 작성 시간 단축**
   - 목표: 이미지 삽입 시간 **80% 감소** (수동 URL 입력 → 클릭/드래그)
   - 측정: 아티클 작성 완료까지 소요 시간 비교

2. **사용자 만족도**
   - 목표: 어드민 사용자 피드백 **긍정적** 평가
   - 측정: "이미지 업로드가 편리하다" 설문 응답

3. **에러율 감소**
   - 목표: 잘못된 이미지 URL 입력 에러 **제로**
   - 측정: 아티클 발행 후 이미지 로딩 실패 건수

4. **콘텐츠 품질 향상**
   - 목표: 아티클당 평균 이미지 개수 **2배 증가**
   - 측정: 이미지를 포함한 아티클 비율

---

## 관련 파일

**프론트엔드:**
- [frontend/src/admin/shared/ui/markdown/MarkdownEditor.tsx](../../frontend/src/admin/shared/ui/markdown/MarkdownEditor.tsx)
- [frontend/src/admin/pages/ArticleEdit.tsx](../../frontend/src/admin/pages/ArticleEdit.tsx)
- [frontend/src/admin/api/adminUploadApi.ts](../../frontend/src/admin/api/adminUploadApi.ts)

**백엔드:**
- [backend/src/main/java/com/aiportfolio/backend/infrastructure/web/admin/controller/AdminUploadController.java](../../backend/src/main/java/com/aiportfolio/backend/infrastructure/web/admin/controller/AdminUploadController.java)
- [backend/src/main/java/com/aiportfolio/backend/application/admin/service/ImageUploadService.java](../../backend/src/main/java/com/aiportfolio/backend/application/admin/service/ImageUploadService.java)

---

## 참고 자료

### 마크다운 에디터 이미지 업로드
- [@uiw/react-md-editor Documentation](https://uiwjs.github.io/react-md-editor/)
- [Custom Commands Example](https://uiwjs.github.io/react-md-editor/#custom-toolbars)
- [Building a Markdown Editor with Image Upload in React](https://dev.to/franciscomendes10866/how-to-create-a-markdown-editor-in-react-3d0l)

### 드래그 앤 드롭 및 클립보드
- [MDN: HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [MDN: Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [React: Handling File Uploads](https://medium.com/@650egor/react-30-day-challenge-day-2-image-upload-preview-2d534f8eaaa)

### 이미지 최적화
- [Cloudinary Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Optimizing Images for Web Performance](https://web.dev/fast/#optimize-your-images)

---

**다음 액션**: Phase 1 구현 시작 - 백엔드 타입 확장 및 마크다운 에디터 커스텀 명령어 추가
