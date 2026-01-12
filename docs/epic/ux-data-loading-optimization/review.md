# 에픽 리뷰: UX 및 데이터 로딩 최적화

**리뷰일**: 2026-01-12
**리뷰어**: AI Agent
**프로젝트 규모**: 중소규모 포트폴리오 사이트 (개인/소규모 팀)

---

## 📊 프로젝트 규모 분석

### 현재 프로젝트 상태
- **프론트엔드**: React 19, TypeScript, Vite, React Query 5
- **백엔드**: Spring Boot 3.x, PostgreSQL, Redis
- **이미지 스토리지**: Cloudinary (이미 구현됨)
- **디자인 시스템**: 구축 완료, Storybook 사용
- **코드베이스 규모**: 중소규모 (프론트엔드 549 파일, 백엔드 270+ 파일)

### 기존 인프라
- ✅ React Query 설정 완료 (`refetchOnWindowFocus: false` 이미 적용)
- ✅ 이미지 업로드 API 백엔드 구현 완료
- ✅ `useContentHeightRecalc` 훅 존재
- ✅ Skeleton UI 구현됨
- ✅ 마크다운 에디터 (`@uiw/react-md-editor`) 사용 중

---

## ✅ 적절한 변경 사항

### 1. 아티클 상세 페이지 데이터 플래싱 문제 해결

**평가**: ⭐⭐⭐⭐⭐ **매우 적절**

**이유**:
- **낮은 복잡도**: React Query 설정만 조정하면 해결 가능
- **높은 영향도**: 사용자 경험에 직접적인 영향을 미치는 버그
- **기존 인프라 활용**: React Query가 이미 설정되어 있어 추가 작업 최소화
- **예상 소요 시간**: 1주 (적절함)

**권장 사항**:
- ✅ `placeholderData` 사용으로 플래싱 방지 (기존 캐시 활용)
- ✅ `isFetching` 상태를 활용한 에러 조건 개선
- ⚠️ **주의**: `refetchOnWindowFocus: false`는 이미 설정되어 있음 (에픽 문서 확인 필요)

**개선 제안**:
```typescript
// useArticleQuery.ts에 placeholderData 추가
export function useArticleQuery(businessId: string) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['articles', businessId],
    queryFn: () => articleApi.getByBusinessId(businessId),
    staleTime: 10 * 60 * 1000,
    enabled: !!businessId,
    placeholderData: (previousData) => {
      // 이전 데이터가 있으면 유지 (플래싱 방지)
      return previousData;
    },
  });
}
```

---

### 2. 스크롤 높이 계산 문제 해결

**평가**: ⭐⭐⭐⭐ **적절하지만 우선순위 조정 권장**

**이유**:
- **중간 복잡도**: 기존 훅 개선 + CSS 수정
- **중간 영향도**: 사용자 경험에 영향이 있지만 치명적이지는 않음
- **기존 인프라 활용**: `useContentHeightRecalc` 훅이 이미 존재

**우려 사항**:
- **예상 소요 시간**: 1-2주 (프로젝트 규모 대비 약간 과도할 수 있음)
- **Phase 3 항목**: Lazy Loading 라이브러리 도입은 **과도한 최적화**일 수 있음

**권장 사항**:

#### ✅ Phase 1: 즉각적인 개선 (필수)
- 이미지 `aspect-ratio` 추가 → **매우 간단하고 효과적**
- SkeletonCard 높이 일관성 확인 → **CSS 수정만으로 해결**

#### ⚠️ Phase 2: 중기 개선 (선택)
- `useContentHeightRecalc` 리팩토링 → **기존 훅이 작동 중이면 우선순위 낮춤**
- `scrollbar-gutter: stable` → **간단하지만 글로벌 CSS 변경**

#### ❌ Phase 3: 장기 최적화 (제외 권장)
- Lazy Loading 라이브러리 도입 → **프로젝트 규모 대비 과도함**
- Progressive Image Loading → **Cloudinary가 이미 최적화 제공**

**개선 제안**:
```css
/* 간단한 CSS 수정으로 대부분 해결 가능 */
.imageWrapper {
  aspect-ratio: 16 / 9;
  background: var(--color-background-secondary);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

### 3. 마크다운 에디터 이미지 업로드 개선

**평가**: ⭐⭐⭐⭐⭐ **매우 적절하고 우선순위 높음**

**이유**:
- **낮은 복잡도**: 백엔드 API가 이미 존재, 프론트엔드만 수정
- **높은 영향도**: 콘텐츠 작성 효율성 크게 향상
- **기존 인프라 활용**: Cloudinary 업로드 API 완비
- **예상 소요 시간**: 1주 (적절함)

**현재 상태 확인**:
- ✅ 백엔드 이미지 업로드 API 존재 (`AdminUploadController`)
- ✅ Cloudinary 통합 완료
- ⚠️ `article` 타입만 추가하면 됨

**권장 사항**:

#### ✅ Phase 1: 기본 이미지 업로드 (필수)
- 백엔드 타입 확장 (`article` 추가) → **5분 작업**
- 마크다운 에디터 커스텀 명령어 → **1-2일 작업**

#### ✅ Phase 2: 드래그 앤 드롭 및 클립보드 (권장)
- 사용자 경험 크게 향상
- 구현 난이도 낮음 (브라우저 API 활용)

#### ⚠️ Phase 3: 고급 기능 (선택)
- 이미지 갤러리 → **프로젝트 규모 대비 과도할 수 있음**
- 이미지 최적화 → **Cloudinary가 이미 처리**

---

## ⚠️ 프로젝트 규모 대비 과도한 항목

### 1. Lazy Loading 라이브러리 도입 (이슈 #2 Phase 3)
**평가**: ❌ **과도함**

**이유**:
- 프로젝트가 포트폴리오 사이트로 콘텐츠 양이 많지 않음
- 추가 라이브러리로 번들 크기 증가
- 브라우저 네이티브 `loading="lazy"`로 충분

**대안**:
```html
<!-- 네이티브 lazy loading 사용 -->
<img src="..." loading="lazy" alt="..." />
```

### 2. Progressive Image Loading (이슈 #2 Phase 3)
**평가**: ⚠️ **선택사항**

**이유**:
- Cloudinary가 이미 자동 최적화 제공
- 추가 구현 복잡도 대비 효과 제한적
- 프로젝트 규모 대비 과도할 수 있음

**대안**:
- Cloudinary의 `quality: auto`, `fetch_format: auto` 활용

### 3. 이미지 갤러리 기능 (이슈 #3 Phase 3)
**평가**: ⚠️ **선택사항**

**이유**:
- 개인/소규모 프로젝트에서는 이미지 재사용 빈도 낮음
- 새로운 API 엔드포인트 필요 (백엔드 작업 증가)
- 우선순위 낮음

---

## 📋 수정된 우선순위 및 예상 기간

### Week 1: 데이터 플래싱 해결 + 마크다운 에디터 기본 기능
**예상 소요**: 1주
- ✅ 이슈 #1 완료 (React Query 설정 최적화)
- ✅ 이슈 #3 Phase 1 완료 (마크다운 에디터 이미지 업로드)

**이유**: 두 작업 모두 낮은 복잡도, 높은 영향도

### Week 2: 스크롤 높이 계산 개선 (Phase 1만)
**예상 소요**: 3-5일
- ✅ 이슈 #2 Phase 1 완료 (aspect-ratio, SkeletonCard 높이)
- ⏹️ 이슈 #2 Phase 2는 선택사항으로 유보

**이유**: Phase 1만으로도 대부분의 문제 해결 가능

### Week 3: 추가 개선 (선택)
**예상 소요**: 3-5일
- ✅ 이슈 #3 Phase 2 (드래그 앤 드롭, 클립보드)
- ⏹️ 이슈 #2 Phase 2 (useContentHeightRecalc 리팩토링) - 필요시만

**이유**: 사용자 경험 향상이지만 필수는 아님

---

## 🎯 최종 권장 사항

### 필수 작업 (2주)
1. ✅ **아티클 상세 페이지 플래싱 해결** (1주)
2. ✅ **마크다운 에디터 기본 이미지 업로드** (3일)
3. ✅ **스크롤 높이 계산 Phase 1** (2일)

### 권장 작업 (1주)
4. ✅ **드래그 앤 드롭 및 클립보드 지원** (3일)
5. ⚠️ **스크롤 높이 계산 Phase 2** (2일) - 필요시만

### 제외 권장
6. ❌ **Lazy Loading 라이브러리 도입** - 네이티브 `loading="lazy"` 사용
7. ⏹️ **Progressive Image Loading** - Cloudinary 최적화로 충분
8. ⏹️ **이미지 갤러리 기능** - 우선순위 낮음

---

## 📊 예상 기간 재조정

### 원래 계획
- **Week 1**: 데이터 플래싱 해결
- **Week 2**: 스크롤 높이 계산 개선
- **Week 3**: 마크다운 에디터 개선
- **Week 4**: 최종 검증

**총 예상 기간**: 2-3주 → **실제로는 2주면 충분**

### 수정된 계획
- **Week 1**: 데이터 플래싱 해결 + 마크다운 에디터 기본 기능
- **Week 2**: 스크롤 높이 계산 Phase 1 + 드래그 앤 드롭 (선택)

**총 예상 기간**: **1.5-2주** (더 현실적)

---

## ✅ 결론

### 적절한 변경 사항
1. ✅ **데이터 플래싱 해결** - 필수, 낮은 복잡도
2. ✅ **마크다운 에디터 이미지 업로드** - 필수, 높은 영향도
3. ✅ **스크롤 높이 계산 Phase 1** - 필수, 간단한 CSS 수정

### 조정이 필요한 항목
1. ⚠️ **스크롤 높이 계산 Phase 2-3** - 선택사항으로 변경
2. ⚠️ **예상 기간** - 2-3주 → 1.5-2주로 단축 가능

### 제외 권장 항목
1. ❌ **Lazy Loading 라이브러리** - 네이티브 기능으로 대체
2. ⏹️ **Progressive Image Loading** - Cloudinary 최적화로 충분
3. ⏹️ **이미지 갤러리** - 우선순위 낮음

**전체 평가**: ⭐⭐⭐⭐ (4/5)
- 대부분의 작업이 프로젝트 규모에 적절함
- 일부 Phase 3 항목은 과도할 수 있음
- 예상 기간을 1.5-2주로 단축 가능

---

**리뷰 완료일**: 2026-01-12
