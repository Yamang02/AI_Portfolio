# 기술 설계: UX 및 데이터 로딩 최적화

**작성일**: 2026-01-12
**작성자**: AI Agent (Claude)
**에픽**: [UX 및 데이터 로딩 최적화](./README.md)

---

## 목차
1. [개요](#개요)
2. [Issue #1: 데이터 플래싱 해결](#issue-1-데이터-플래싱-해결)
3. [Issue #2: 스크롤 높이 계산 개선](#issue-2-스크롤-높이-계산-개선)
4. [Issue #3: 마크다운 에디터 이미지 업로드](#issue-3-마크다운-에디터-이미지-업로드)
5. [통합 고려사항](#통합-고려사항)
6. [성능 측정 방법](#성능-측정-방법)

---

## 개요

이 문서는 UX 및 데이터 로딩 최적화 에픽의 기술 설계를 담고 있습니다. 3가지 주요 이슈에 대한 구체적인 구현 방법과 아키텍처 결정을 설명합니다.

### 설계 원칙
1. **점진적 개선**: 기존 코드베이스를 최대한 활용하며 점진적으로 개선
2. **측정 가능성**: 변경 사항의 효과를 정량적으로 측정 가능하도록 설계
3. **단순성 우선**: 복잡한 라이브러리 도입보다 간단한 CSS/네이티브 API 활용
4. **사용자 경험 중심**: 모든 결정은 최종 사용자 경험 개선을 목표로 함

---

## Issue #1: 데이터 플래싱 해결

### 문제 진단

**현상**:
- 아티클 상세 페이지에서 정상 렌더링 후 "아티클을 찾을 수 없습니다" 메시지가 잠깐 표시됨
- React Query의 백그라운드 리페치 중 `data`가 일시적으로 `undefined`로 전환

**근본 원인**:
```typescript
// 현재 코드 (문제 있음)
const { data: article, isLoading, isError } = useArticleQuery(businessId);

if (isError || !article) {
  return <ErrorMessage />;  // 백그라운드 리페치 중에도 트리거됨
}
```

### 기술 설계

#### 1.1 React Query 설정 최적화

**위치**: `frontend/src/shared/api/queries/useArticleQuery.ts`

```typescript
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { articleApi } from '../article-api';

export function useArticleQuery(businessId: string) {
  return useQuery({
    queryKey: ['articles', businessId],
    queryFn: () => articleApi.getByBusinessId(businessId),

    // 주요 변경사항
    staleTime: 10 * 60 * 1000,           // 10분 (기존 유지)
    gcTime: 15 * 60 * 1000,              // 15분 (기존 cacheTime)
    enabled: !!businessId,                // 기존 유지

    // 새로운 설정: 플래싱 방지
    placeholderData: keepPreviousData,   // 이전 데이터 유지
    refetchOnWindowFocus: false,          // 이미 설정되어 있을 수 있음
    refetchOnReconnect: false,            // 네트워크 재연결 시 리페치 방지
  });
}
```

**주요 변경 포인트**:
- `placeholderData: keepPreviousData`: 새 데이터가 로드될 때까지 이전 데이터를 유지
- `refetchOnWindowFocus`, `refetchOnReconnect`를 `false`로 설정 (이미 설정되어 있는지 확인 필요)

#### 1.2 에러 조건 로직 개선

**위치**: `frontend/src/pages/ArticleDetailPage/ArticleDetailPage.tsx`

```typescript
export function ArticleDetailPage() {
  const { businessId } = useParams();
  const {
    data: article,
    isLoading,
    isError,
    isFetching,  // 새로 추가
    error        // 새로 추가
  } = useArticleQuery(businessId!);

  // 로딩 상태: 초기 로딩만
  if (isLoading) {
    return <ArticleDetailSkeleton />;
  }

  // 에러 상태: 백그라운드 리페치 중이 아닐 때만
  if (isError && !isFetching) {
    return <ArticleErrorView error={error} />;
  }

  // 데이터 없음: 백그라운드 리페치 중이 아니고 실제로 데이터가 없을 때만
  if (!article && !isFetching) {
    return <ArticleNotFound />;
  }

  // 백그라운드 리페치 중일 때는 이전 데이터 계속 표시
  return (
    <>
      {isFetching && <BackgroundRefetchIndicator />}
      <ArticleContent article={article} />
    </>
  );
}
```

**주요 변경 포인트**:
- `isFetching` 상태 추가: 백그라운드 리페치 감지
- 에러/없음 조건에 `!isFetching` 추가: 백그라운드 리페치 중에는 에러 표시 안 함
- `placeholderData`와 함께 사용하여 항상 이전 데이터 유지

#### 1.3 에러 UI/UX 개선

**새 컴포넌트**: `frontend/src/pages/ArticleDetailPage/ui/ArticleErrorView.tsx`

```typescript
import { Button } from '@/shared/ui';
import { useQueryClient } from '@tanstack/react-query';

interface ArticleErrorViewProps {
  error: Error | null;
}

export function ArticleErrorView({ error }: ArticleErrorViewProps) {
  const queryClient = useQueryClient();

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['articles'] });
  };

  // 에러 타입별 메시지
  const getErrorMessage = () => {
    if (error?.message.includes('404')) {
      return '아티클을 찾을 수 없습니다.';
    }
    if (error?.message.includes('Network')) {
      return '네트워크 연결을 확인해주세요.';
    }
    return '아티클을 불러오는 중 문제가 발생했습니다.';
  };

  return (
    <div className="error-container">
      <h2>{getErrorMessage()}</h2>
      <p>{error?.message}</p>
      <Button onClick={handleRetry}>다시 시도</Button>
    </div>
  );
}
```

#### 1.4 백그라운드 리페치 인디케이터

**새 컴포넌트**: `frontend/src/shared/ui/BackgroundRefetchIndicator.tsx`

```typescript
export function BackgroundRefetchIndicator() {
  return (
    <div className="refetch-indicator">
      <span>업데이트 중...</span>
    </div>
  );
}
```

```css
/* frontend/src/shared/ui/BackgroundRefetchIndicator.module.css */
.refetch-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  background: var(--color-background-secondary);
  border-radius: 4px;
  font-size: 14px;
  opacity: 0.8;
  z-index: 1000;
}
```

### 테스트 계획

#### 수동 테스트 시나리오
1. **시나리오 1: 탭 전환 후 복귀**
   - 아티클 상세 페이지 진입
   - 다른 탭으로 전환 (3분 대기)
   - 원래 탭으로 복귀
   - ✅ 예상 결과: 플래싱 없이 기존 내용 유지, 백그라운드 업데이트

2. **시나리오 2: 네트워크 재연결**
   - 네트워크 오프라인 전환
   - 페이지 진입 시도
   - 네트워크 온라인 복구
   - ✅ 예상 결과: 에러 메시지 표시, 재시도 버튼 클릭 시 정상 로드

3. **시나리오 3: 404 에러**
   - 존재하지 않는 아티클 ID로 접근
   - ✅ 예상 결과: "아티클을 찾을 수 없습니다" 메시지

### 성공 지표
- [ ] 탭 전환 시 플래싱 발생 0회
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] 사용자 에러 리포트 0건

---

## Issue #2: 스크롤 높이 계산 개선

### 문제 진단

**현상**:
- 페이지 진입 시 스크롤이 제대로 작동하지 않음
- 이미지 로딩 완료 전에 높이 계산 → 실제보다 작게 계산됨
- 카드 컴포넌트의 동적 폰트 크기 조정 타이밍 문제

**근본 원인**:
- CSS에 `aspect-ratio` 미지정 → 이미지 로딩 전 높이 0
- SkeletonCard와 실제 Card 높이 불일치
- `useContentHeightRecalc` 훅이 이미지 로딩 완료 전에 실행

### 기술 설계

#### 2.1 이미지 aspect-ratio 추가 (Phase 1 - 필수)

**위치**: 모든 이미지 컴포넌트

**Before**:
```tsx
<img src={imageUrl} alt={title} />
```

**After**:
```tsx
<div className={styles.imageWrapper}>
  <img
    src={imageUrl}
    alt={title}
    loading="lazy"  // 네이티브 lazy loading
  />
</div>
```

```css
/* styles.module.css */
.imageWrapper {
  aspect-ratio: 16 / 9;  /* 기본 비율 */
  background: var(--color-background-secondary);
  overflow: hidden;
}

.imageWrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

**적용 대상**:
- `ArticleCard` ([frontend/src/entities/article/ui/ArticleCard/ArticleCard.tsx](../../frontend/src/entities/article/ui/ArticleCard/ArticleCard.tsx))
- `ProjectCard` ([frontend/src/entities/project/ui/ProjectCard/ProjectCard.tsx](../../frontend/src/entities/project/ui/ProjectCard/ProjectCard.tsx))
- `ArticleDetail` 내부 이미지
- 모든 썸네일 이미지

#### 2.2 SkeletonCard 높이 일관성 확인 (Phase 1 - 필수)

**위치**: `frontend/src/shared/ui/Skeleton/SkeletonCard.tsx`

```tsx
export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {/* aspect-ratio 16/9와 동일한 높이 */}
        <div className={styles.imageSkeleton} />
      </div>
      <div className={styles.content}>
        <div className={styles.titleSkeleton} />
        <div className={styles.descriptionSkeleton} />
      </div>
    </div>
  );
}
```

```css
.imageWrapper {
  aspect-ratio: 16 / 9;  /* 실제 이미지와 동일 */
  background: linear-gradient(
    90deg,
    var(--color-skeleton-base) 0%,
    var(--color-skeleton-highlight) 50%,
    var(--color-skeleton-base) 100%
  );
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

#### 2.3 페이지 레벨 이미지 로딩 추적 (Phase 1 - 필수)

**새 훅**: `frontend/src/shared/hooks/useImageLoadTracking.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';

export function useImageLoadTracking(containerRef: React.RefObject<HTMLElement>) {
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const images = containerRef.current.querySelectorAll('img');
    const imageArray = Array.from(images);
    setTotalCount(imageArray.length);

    if (imageArray.length === 0) {
      setAllImagesLoaded(true);
      return;
    }

    let loaded = 0;

    const handleImageLoad = () => {
      loaded++;
      setLoadedCount(loaded);
      if (loaded === imageArray.length) {
        setAllImagesLoaded(true);
      }
    };

    imageArray.forEach((img) => {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
        img.addEventListener('error', handleImageLoad); // 에러도 카운트
      }
    });

    return () => {
      imageArray.forEach((img) => {
        img.removeEventListener('load', handleImageLoad);
        img.removeEventListener('error', handleImageLoad);
      });
    };
  }, [containerRef]);

  return { allImagesLoaded, loadedCount, totalCount };
}
```

**사용 예시**: `frontend/src/pages/ArticleListPage/ArticleListPage.tsx`

```typescript
export function ArticleListPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { allImagesLoaded } = useImageLoadTracking(containerRef);

  useContentHeightRecalc({
    containerRef,
    dependencies: [articles, allImagesLoaded],  // 이미지 로딩 완료 시 재계산
  });

  return (
    <div ref={containerRef}>
      {/* 콘텐츠 */}
    </div>
  );
}
```

#### 2.4 useContentHeightRecalc 리팩토링 (Phase 2 - 선택사항)

**현재 상태 확인 필요**: 기존 훅이 정상 작동하는지 먼저 검증

**개선 방향**:
```typescript
// frontend/src/shared/hooks/useContentHeightRecalc.ts
export function useContentHeightRecalc({
  containerRef,
  dependencies = [],
  debounceMs = 100,
}: {
  containerRef: React.RefObject<HTMLElement>;
  dependencies?: any[];
  debounceMs?: number;
}) {
  useEffect(() => {
    if (!containerRef.current) return;

    const recalculate = debounce(() => {
      if (containerRef.current) {
        const height = containerRef.current.scrollHeight;
        document.documentElement.style.setProperty('--content-height', `${height}px`);
      }
    }, debounceMs);

    recalculate();

    // ResizeObserver로 높이 변화 감지
    const observer = new ResizeObserver(recalculate);
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, dependencies);
}
```

#### 2.5 글로벌 CSS 개선 (Phase 2 - 선택사항)

**위치**: `frontend/src/app/styles/global.css`

```css
html {
  /* 스크롤바 공간 예약 (레이아웃 시프트 방지) */
  scrollbar-gutter: stable;

  /* 부드러운 스크롤 */
  scroll-behavior: smooth;
}

body {
  /* 최소 높이 보장 */
  min-height: 100vh;
  min-height: 100dvh; /* 모바일 뷰포트 */
}
```

### 테스트 계획

#### 수동 테스트 시나리오
1. **시나리오 1: 이미지 많은 페이지**
   - 아티클 리스트 페이지 진입 (10개 이상 이미지)
   - 페이지 하단까지 스크롤
   - ✅ 예상 결과: 스크롤이 자연스럽게 작동, 레이아웃 시프트 없음

2. **시나리오 2: 느린 네트워크 환경**
   - Chrome DevTools에서 "Slow 3G" 선택
   - 페이지 진입
   - ✅ 예상 결과: Skeleton UI가 실제 콘텐츠와 같은 높이로 표시

3. **시나리오 3: 동적 콘텐츠 로딩**
   - 무한 스크롤 페이지에서 추가 콘텐츠 로드
   - ✅ 예상 결과: 새 콘텐츠 로드 시 스크롤 위치 유지

### 성공 지표
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] 스크롤 문제 리포트 0건
- [ ] Lighthouse Performance 점수 90점 이상

---

## Issue #3: 마크다운 에디터 이미지 업로드

### 문제 진단

**현상**:
- 현재: 콘솔 → 이미지 업로드 → URL 복사 → 마크다운 수동 입력
- 복잡한 워크플로우로 콘텐츠 작성 흐름 중단
- 이미지가 많은 아티클 작성 시간 크게 증가

**목표**:
- 마크다운 에디터에서 직접 이미지 업로드
- 드래그 앤 드롭, 클립보드 붙여넣기 지원
- 이미지 삽입 시간 80% 단축

### 기술 설계

#### 3.1 백엔드 타입 확장 (Phase 1 - 5분 작업)

**위치**: `backend/src/main/java/com/ai_portfolio/application/port/in/AdminUploadUseCase.java`

**Before**:
```java
public enum UploadType {
    PROFILE, PROJECT, ARTICLE_THUMBNAIL
}
```

**After**:
```java
public enum UploadType {
    PROFILE,
    PROJECT,
    ARTICLE_THUMBNAIL,
    ARTICLE_CONTENT  // 새로 추가
}
```

**관련 파일**:
- `AdminUploadController.java`: API 엔드포인트 (변경 불필요, 타입만 추가하면 자동 지원)
- `CloudinaryUploadAdapter.java`: 업로드 로직 (변경 불필요)

#### 3.2 이미지 업로드 API 클라이언트 (Phase 1)

**새 파일**: `frontend/src/shared/api/upload-api.ts`

```typescript
import { apiClient } from './client';

export interface UploadImageRequest {
  file: File;
  type: 'profile' | 'project' | 'article-thumbnail' | 'article-content';
}

export interface UploadImageResponse {
  imageUrl: string;
  publicId: string;
}

export const uploadApi = {
  uploadImage: async (request: UploadImageRequest): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('type', request.type);

    const response = await apiClient.post('/api/admin/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
```

#### 3.3 마크다운 에디터 커스텀 명령어 (Phase 1)

**위치**: `frontend/src/features/article/ui/ArticleForm.tsx`

```typescript
import MDEditor, { commands } from '@uiw/react-md-editor';
import { uploadApi } from '@/shared/api';
import { useState } from 'react';

export function ArticleForm() {
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);

  const imageUploadCommand: commands.ICommand = {
    name: 'image-upload',
    keyCommand: 'image-upload',
    buttonProps: { 'aria-label': 'Upload image' },
    icon: (
      <svg viewBox="0 0 16 16" width="12px" height="12px">
        <path d="M14 5H2v9h12V5zM2 4c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1H2z" />
        <path d="M4 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM13.5 12h-11l3-4 2 2 2-3 4 5z" />
      </svg>
    ),
    execute: async (state, api) => {
      // 파일 선택 다이얼로그
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          setUploading(true);

          // 업로드 중 표시
          const uploadingText = `![Uploading ${file.name}...]()`;
          api.replaceSelection(uploadingText);

          // 이미지 업로드
          const { imageUrl } = await uploadApi.uploadImage({
            file,
            type: 'article-content',
          });

          // 마크다운 이미지 문법으로 교체
          const imageMarkdown = `![${file.name}](${imageUrl})`;
          const newContent = state.text.replace(uploadingText, imageMarkdown);
          setContent(newContent);

        } catch (error) {
          console.error('Image upload failed:', error);
          alert('이미지 업로드에 실패했습니다.');
        } finally {
          setUploading(false);
        }
      };

      input.click();
    },
  };

  return (
    <MDEditor
      value={content}
      onChange={(val) => setContent(val || '')}
      commands={[
        ...commands.getCommands(),
        commands.divider,
        imageUploadCommand,  // 커스텀 명령어 추가
      ]}
      preview="live"
    />
  );
}
```

#### 3.4 업로드 로딩 표시 및 에러 처리

**새 컴포넌트**: `frontend/src/features/article/ui/ImageUploadProgress.tsx`

```typescript
export function ImageUploadProgress({
  fileName,
  progress
}: {
  fileName: string;
  progress: number;
}) {
  return (
    <div className={styles.uploadProgress}>
      <span>{fileName}</span>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
```

#### 3.5 드래그 앤 드롭 지원 (Phase 2 - 선택사항)

**위치**: `frontend/src/features/article/ui/ArticleForm.tsx`

```typescript
export function ArticleForm() {
  const [content, setContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    for (const file of files) {
      await uploadAndInsertImage(file);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await uploadAndInsertImage(file);
        }
      }
    }
  };

  const uploadAndInsertImage = async (file: File) => {
    try {
      const { imageUrl } = await uploadApi.uploadImage({
        file,
        type: 'article-content',
      });

      const imageMarkdown = `\n![${file.name}](${imageUrl})\n`;
      setContent(prev => prev + imageMarkdown);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div
      ref={editorRef}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
    >
      <MDEditor value={content} onChange={setContent} />
    </div>
  );
}
```

#### 3.6 다중 이미지 업로드 진행 상태 (Phase 2 - 선택사항)

**새 훅**: `frontend/src/features/article/hooks/useMultipleImageUpload.ts`

```typescript
interface UploadTask {
  id: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function useMultipleImageUpload() {
  const [tasks, setTasks] = useState<UploadTask[]>([]);

  const uploadImages = async (files: File[]) => {
    const newTasks = files.map(file => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      progress: 0,
      status: 'pending' as const,
    }));

    setTasks(prev => [...prev, ...newTasks]);

    // 동시 업로드 (최대 3개)
    const promises = files.map(async (file, index) => {
      const task = newTasks[index];

      try {
        setTasks(prev =>
          prev.map(t => t.id === task.id ? { ...t, status: 'uploading' } : t)
        );

        const { imageUrl } = await uploadApi.uploadImage({
          file,
          type: 'article-content',
        });

        setTasks(prev =>
          prev.map(t => t.id === task.id ? { ...t, status: 'success', progress: 100 } : t)
        );

        return { fileName: file.name, imageUrl };
      } catch (error) {
        setTasks(prev =>
          prev.map(t => t.id === task.id ? {
            ...t,
            status: 'error',
            error: error.message
          } : t)
        );
        throw error;
      }
    });

    return await Promise.all(promises);
  };

  return { tasks, uploadImages };
}
```

### 테스트 계획

#### 수동 테스트 시나리오
1. **시나리오 1: 파일 선택 버튼**
   - 마크다운 에디터에서 이미지 업로드 버튼 클릭
   - 이미지 선택
   - ✅ 예상 결과: 이미지 업로드 후 마크다운 문법으로 자동 삽입

2. **시나리오 2: 드래그 앤 드롭**
   - 에디터 영역에 이미지 파일 드래그
   - ✅ 예상 결과: 이미지 업로드 후 자동 삽입

3. **시나리오 3: 클립보드 붙여넣기**
   - 이미지를 클립보드에 복사 (Ctrl+C)
   - 에디터에서 붙여넣기 (Ctrl+V)
   - ✅ 예상 결과: 이미지 업로드 후 자동 삽입

4. **시나리오 4: 다중 이미지 업로드**
   - 여러 이미지를 동시에 드롭
   - ✅ 예상 결과: 진행 상태 표시, 모든 이미지 순차적으로 삽입

### 성공 지표
- [ ] 이미지 삽입 시간 80% 단축 (5분 → 1분)
- [ ] 잘못된 이미지 URL 입력 에러 0건
- [ ] 아티클당 평균 이미지 개수 2배 증가

---

## 통합 고려사항

### 1. 기술 스택 호환성

| 기술 | 버전 | 호환성 |
|------|------|--------|
| React | 19.x | ✅ 모든 기능 지원 |
| React Query | 5.x | ✅ `placeholderData`, `keepPreviousData` 지원 |
| @uiw/react-md-editor | Latest | ✅ 커스텀 명령어 지원 |
| TypeScript | 5.x | ✅ 타입 안전성 보장 |

### 2. 성능 최적화 우선순위

#### 높은 우선순위 (필수)
- ✅ `aspect-ratio` CSS 추가 → Layout Shift 방지
- ✅ `placeholderData` 설정 → 플래싱 방지
- ✅ 네이티브 `loading="lazy"` → 번들 크기 증가 없음

#### 중간 우선순위 (권장)
- ⚠️ 드래그 앤 드롭 이미지 업로드 → 사용자 경험 향상
- ⚠️ `scrollbar-gutter: stable` → 글로벌 CSS 변경

#### 낮은 우선순위 (선택)
- ⏹️ `useContentHeightRecalc` 리팩토링 → 기존 훅 정상 작동 시 제외
- ⏹️ Progressive Image Loading → Cloudinary가 이미 처리

### 3. 코드 재사용성

#### 공통 훅
- `useImageLoadTracking`: 모든 이미지 리스트 페이지에서 재사용
- `useMultipleImageUpload`: 마크다운 에디터 외 다른 업로드 폼에서도 재사용 가능

#### 공통 컴포넌트
- `BackgroundRefetchIndicator`: 모든 상세 페이지에서 재사용
- `ImageUploadProgress`: 모든 이미지 업로드 폼에서 재사용

### 4. 에러 핸들링 전략

#### 네트워크 에러
```typescript
if (error?.message.includes('Network')) {
  // 재시도 버튼 제공
  return <ErrorView message="네트워크 연결을 확인해주세요." onRetry={...} />;
}
```

#### 404 에러
```typescript
if (error?.message.includes('404')) {
  // 목록으로 돌아가기 버튼
  return <NotFoundView message="아티클을 찾을 수 없습니다." />;
}
```

#### 업로드 실패
```typescript
try {
  await uploadApi.uploadImage(...);
} catch (error) {
  // 사용자에게 명확한 에러 메시지
  toast.error(`이미지 업로드 실패: ${error.message}`);
}
```

---

## 성능 측정 방법

### 1. Lighthouse 측정

**측정 페이지**:
- 아티클 리스트 페이지
- 아티클 상세 페이지
- 프로젝트 리스트 페이지

**측정 지표**:
```bash
# Chrome DevTools > Lighthouse
- Performance: 목표 90점 이상
- Cumulative Layout Shift (CLS): 목표 0.1 미만
- Time to Interactive (TTI): 목표 3초 미만 (3G)
```

### 2. React Query Devtools 모니터링

**확인 사항**:
- 백그라운드 리페치 빈도
- 캐시 히트율
- 쿼리 상태 전환 (loading → success → refetching)

```typescript
// 개발 환경에서만 활성화
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### 3. 사용자 경험 측정

**측정 방법**:
- 이미지 삽입 시간 측정 (Before: 5분, After: 1분 목표)
- 플래싱 발생 횟수 기록 (목표: 0회)
- 스크롤 문제 리포트 수집 (목표: 0건)

**측정 도구**:
```typescript
// 성능 측정 유틸리티
export function measureImageUploadTime() {
  const start = performance.now();

  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(`Image upload took ${duration}ms`);
      return duration;
    },
  };
}
```

### 4. CLS 측정 스크립트

**위치**: `frontend/src/shared/utils/measureCLS.ts`

```typescript
export function measureCLS() {
  let clsValue = 0;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += (entry as any).value;
        console.log('CLS:', clsValue);
      }
    }
  });

  observer.observe({ type: 'layout-shift', buffered: true });

  return () => observer.disconnect();
}
```

---

## 마이그레이션 계획

### Week 1: Phase 1 작업
1. **Day 1-2**: Issue #1 (데이터 플래싱)
   - `useArticleQuery`에 `placeholderData` 추가
   - 에러 조건 로직 개선
   - 에러 UI 구현

2. **Day 3-5**: Issue #3 Phase 1 (마크다운 에디터)
   - 백엔드 타입 확장
   - 이미지 업로드 명령어 구현
   - 로딩/에러 처리

### Week 2: Phase 1 완료 + Phase 2 시작
1. **Day 1-2**: Issue #2 Phase 1 (스크롤 높이)
   - 모든 이미지에 `aspect-ratio` 추가
   - SkeletonCard 높이 일치
   - 이미지 로딩 추적

2. **Day 3-5**: Issue #3 Phase 2 (선택사항)
   - 드래그 앤 드롭 구현
   - 클립보드 붙여넣기

### 롤백 계획
- React Query 설정 변경 시 문제 발생 → 이전 설정으로 즉시 복구
- CSS 변경 시 레이아웃 깨짐 → Git revert
- 각 Phase별로 별도 브랜치 사용 → 문제 발생 시 해당 브랜치만 롤백

---

## 참고 자료

### 공식 문서
- [React Query Placeholder Data](https://tanstack.com/query/latest/docs/framework/react/guides/placeholder-query-data)
- [MDEditor Custom Commands](https://uiwjs.github.io/react-md-editor/#custom-toolbars)
- [MDN: aspect-ratio](https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio)
- [Web.dev: Cumulative Layout Shift](https://web.dev/cls/)

### 참고 예시
- [TkDodo's Blog: Placeholder Data](https://tkdodo.eu/blog/react-query-render-optimizations)
- [Max Schmitt: Preventing Layout Shifts](https://maxschmitt.me/posts/react-prevent-layout-shift-body-scrollable)

---

**문서 버전**: 1.0
**최종 업데이트**: 2026-01-12
**다음 리뷰**: Week 1 완료 후
