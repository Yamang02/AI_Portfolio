# TOC 스크롤 안정화 개선 리뷰 평가 및 적용

## 리뷰 내용 평가

### ✅ 정확한 문제 진단

리뷰에서 지적한 문제점들이 모두 정확합니다:

1. **ID 불일치 문제**: `useTOC`와 `MarkdownRenderer`가 각각 별도로 파싱하여 ID를 생성하면서, 템플릿의 기존 헤딩과 동적 마크다운 블록이 섞일 때 순서/개수가 어긋나는 문제
2. **스크롤 실패**: 최대 1초 재시도만으로는 늦게 로드되는 마크다운/이미지/동적 컴포넌트가 삽입될 때 요소를 못 찾을 수 있음
3. **React Query 성능 이슈**: 전역적으로 staleTime을 0으로 고정하여 모든 데이터가 항상 refetch되도록 바뀌어 네트워크 부하와 깜빡임이 커질 수 있음

### 제안된 해결책 평가

#### 1. 한 번의 AST 파이프라인에서 ID + TOC 생성 ⭐⭐⭐
**장점**: 
- 가장 근본적인 해결책
- ID 불일치 문제를 원천 차단

**단점**: 
- 시스템 복잡도가 높아짐
- remark 플러그인 체인 수정 필요
- 기존 코드 구조 변경이 큼

**평가**: 복잡도를 크게 높이지 않는 선에서는 적용하기 어려움

#### 2. 렌더 완료 후 스크롤 ⭐⭐⭐⭐⭐
**장점**: 
- 구현이 상대적으로 간단
- MutationObserver로 안정적인 감지 가능
- 기존 코드 구조 유지 가능

**단점**: 
- 약간의 지연 발생 가능 (하지만 사용자 경험에 큰 영향 없음)

**평가**: **적용 권장** - 복잡도 대비 효과가 큼

#### 3. DOM 기반 TOC 생성 ⭐⭐⭐⭐⭐
**장점**: 
- 가장 확실한 해결책 (실제 렌더된 헤딩 기준)
- 템플릿/동적 블록 모두 포함 가능
- ID 불일치 문제를 원천 차단
- 구현이 비교적 간단

**단점**: 
- 초기 렌더 후 약간의 지연 (하지만 사용자 경험에 큰 영향 없음)

**평가**: **적용 권장** - 복잡도 대비 효과가 매우 큼

#### 4. 중복 ID 처리 ⭐⭐⭐⭐
**장점**: 
- github-slugger 같은 라이브러리 사용으로 안정적
- 기존 `generateHeadingId` 개선 가능

**단점**: 
- 추가 의존성 필요
- 기존 로직과의 호환성 확인 필요

**평가**: 현재 `generateHeadingId`가 이미 중복 처리를 하고 있어 우선순위 낮음

## 적용된 개선 사항

### 1. DOM 기반 TOC 생성 훅 구현 ✅

**파일**: `frontend/src/features/project-gallery/hooks/useTOCFromDOM.ts`

- 렌더 후 실제 DOM에서 헤딩을 읽어 TOC 생성
- MutationObserver로 DOM 변경 감지
- 템플릿의 기존 헤딩과 동적 마크다운 블록 모두 포함 가능
- ID 불일치 문제를 원천 차단

**사용 방법**:
```typescript
const containerRef = useRef<HTMLElement>(null);
const tocItems = useTOCFromDOM(containerRef);
```

### 2. 스크롤 개선 ✅

**파일**: 
- `frontend/src/features/project-gallery/hooks/useActiveSection.ts`
- `frontend/src/main/features/projects/hooks/useActiveSection.ts`

**개선 사항**:
- MutationObserver를 사용하여 DOM 변경 감지
- 최대 재시도 횟수 증가 (10 → 20)
- 렌더 완료를 더 안정적으로 감지
- observer 자동 정리로 메모리 누수 방지

### 3. React Query staleTime 설정 조정 ✅

**파일**: `frontend/src/main/config/queryCacheConfig.ts`

**변경 사항**:
- 프로젝트 데이터: `NONE` (자주 업데이트될 수 있음)
- 교육/경력/자격증: `FIVE_MINUTES` (상대적으로 안정적)
- 기술 스택: `TEN_MINUTES` (자주 변경되지 않음)
- GitHub 데이터: `FIVE_MINUTES` (외부 API이므로 적절한 캐싱)
- 관리자 페이지/캐시 현황: `NONE` (항상 최신 데이터 필요)

## 추가 개선 사항 (선택적)

### 1. github-slugger 도입 (향후 고려)

현재 `generateHeadingId`가 이미 중복 처리를 하고 있지만, `github-slugger`를 사용하면 더 안정적일 수 있습니다:

```typescript
import GithubSlugger from 'github-slugger';

const slugger = new GithubSlugger();
const id = slugger.slug(text);
```

**장점**: 
- GitHub와 동일한 slug 생성 로직
- 더 안정적인 중복 처리

**단점**: 
- 추가 의존성 필요
- 현재 로직과의 호환성 확인 필요

### 2. useTOCFromDOM을 기본으로 전환 (선택적)

현재는 `useTOC`와 `useTOCFromDOM` 두 가지 옵션이 있습니다. 
DOM 기반이 더 안정적이므로, 점진적으로 전환하는 것을 고려할 수 있습니다.

## 복잡도 평가

### 적용된 개선 사항의 복잡도: ⭐⭐ (낮음)

- **DOM 기반 TOC**: 새로운 훅 추가, 기존 코드와 병행 사용 가능
- **스크롤 개선**: 기존 함수 개선, API 변경 없음
- **React Query 설정**: 설정 값만 조정, 로직 변경 없음

### 전체 시스템 복잡도 증가: 최소

- 기존 코드 구조 유지
- 새로운 기능은 선택적으로 사용 가능
- 점진적 마이그레이션 가능

## 결론

리뷰 내용이 정확하며, 제안된 해결책 중 **DOM 기반 TOC 생성**과 **렌더 완료 감지 스크롤**을 적용했습니다. 
이 두 가지 개선만으로도 TOC 클릭 시 스크롤 실패 문제를 대부분 해결할 수 있으며, 시스템 복잡도는 크게 증가하지 않습니다.

**AST 파이프라인 통합**은 더 근본적인 해결책이지만, 복잡도가 높아 현재는 적용하지 않았습니다. 
향후 필요하다면 점진적으로 도입할 수 있습니다.

