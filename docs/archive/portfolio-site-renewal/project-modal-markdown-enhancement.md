# 프로젝트 모달 마크다운 기반 포트폴리오 개선 계획

## 1. 현재 구조 분석

### 1.1 현재 ProjectModal 구성 ([ProjectModal.tsx](D:\Git\AI_PortFolio\frontend\src\shared\components\Modal\ProjectModal.tsx))

**레이아웃:**
- 단일 컬럼 중앙 정렬 방식
- 고정된 max-width: 3xl (768px)
- 수직 스크롤

**콘텐츠 구성 순서:**
1. **헤더**: 제목, 날짜, 카테고리 배지, 상태 배지
2. **이미지 갤러리**: 메인 이미지 + screenshots 배열 (grid)
3. **설명**: project.description (단순 텍스트)
4. **팀 기여도**: isTeam 조건부 렌더링 (role, myContributions)
5. **기술 스택**: technologies 배지
6. **외부 링크**: liveUrl, githubUrl, externalUrl 버튼

**현재 문제점:**
- ❌ 프로젝트별 커스텀 컨텐츠 불가 (description만 텍스트로 표시)
- ❌ 긴 내용 탐색 어려움 (목차 없음)
- ❌ 마크다운 지원 부재
- ❌ 구조화된 문서 표현 불가

---

## 2. 개선 목표

### 2.1 핵심 컨셉
**"각 프로젝트를 독립적인 포트폴리오 문서로 전환"**

- 마크다운 기반 자유로운 컨텐츠 작성
- 자동 생성 목차(TOC)로 탐색성 향상
- 현재 섹션 하이라이트로 읽기 편의성 증대

### 2.2 디자인 원칙
1. **유연성**: 프로젝트마다 다른 구조 허용
2. **가독성**: 긴 문서도 쉽게 탐색
3. **일관성**: 기존 메타데이터(기술스택, 링크 등) 유지

---

## 3. 최종 레이아웃 설계

### 3.1 전체 구조

```
┌─────────────────────────────────────────────────────────────────┐
│  [×] 닫기                                          [Modal Header] │
├─────────────────┬───────────────────────────────────────────────┤
│                 │                                                │
│   [TOC Panel]   │            [Main Content Area]                │
│   (Sidebar)     │                                                │
│                 │  ┌──────────────────────────────────────────┐ │
│  # 목차         │  │  프로젝트 헤더 (고정)                      │ │
│  ├─ 개요        │  │  - 제목, 날짜, 배지, 기술스택, 링크       │ │
│  ├─ 기술 스택   │  └──────────────────────────────────────────┘ │
│  ├─ 주요 기능   │                                                │
│  ├─ 아키텍처    │  ┌──────────────────────────────────────────┐ │
│  └─ 트러블슈팅  │  │  마크다운 렌더링 영역 (스크롤)            │ │
│                 │  │                                            │ │
│  [접기/펼치기]  │  │  # 개요                                    │ │
│                 │  │  프로젝트 설명...                          │ │
│                 │  │                                            │ │
│                 │  │  # 기술 스택                               │ │
│                 │  │  ## Frontend                               │ │
│                 │  │  - React...                                │ │
│                 │  │                                            │ │
│                 │  │  # 주요 기능                               │ │
│                 │  │  ...                                       │ │
│                 │  └──────────────────────────────────────────┘ │
│                 │                                                │
└─────────────────┴────────────────────────────────────────────────┘
```

### 3.2 영역별 상세 설계

#### A. TOC Panel (좌측 사이드바)
**크기 및 위치:**
- Width: 240px (고정)
- 좌측 고정, 독립 스크롤
- 상단부터 시작 (헤더 아래)

**기능:**
- 마크다운 헤딩(#, ##, ###) 자동 파싱
- 계층 구조 표시 (들여쓰기)
- 클릭 시 해당 섹션으로 스크롤
- 현재 뷰포트 섹션 하이라이트 (Intersection Observer)
- 접기/펼치기 토글 버튼 (모바일 대응)

**스타일:**
```tsx
<aside className="w-60 h-full overflow-y-auto border-r border-gray-200 bg-gray-50 p-4">
  <nav className="sticky top-0">
    <h3 className="text-sm font-semibold text-gray-900 mb-3">목차</h3>
    <ul className="space-y-2 text-sm">
      {tocItems.map(item => (
        <li
          key={item.id}
          className={`
            pl-${item.level * 3}
            ${item.isActive ? 'text-primary-600 font-medium' : 'text-gray-600'}
            hover:text-primary-500 cursor-pointer
          `}
        >
          <a href={`#${item.id}`}>{item.text}</a>
        </li>
      ))}
    </ul>
  </nav>
</aside>
```

#### B. Main Content Area (중앙)
**크기:**
- Flex: flex-1 (나머지 공간)
- Max-width: 900px (가독성)
- Padding: 8 (충분한 여백)

**구성 (상단 → 하단):**

1. **프로젝트 헤더 (고정 영역)**
   ```tsx
   <header className="sticky top-0 bg-white z-10 pb-6 border-b border-gray-200">
     <h1>{project.title}</h1>
     <div className="flex gap-2 items-center">
       <span>📅 {startDate} ~ {endDate}</span>
       <CategoryBadge />
       <StatusBadge />
       {isTeam && <TeamBadge />}
     </div>

     {/* 팀 프로젝트 기여도 */}
     {isTeam && <TeamContributionBox />}

     {/* 기술 스택 배지 */}
     <TechStackBadges />

     {/* 외부 링크 */}
     <ExternalLinks />
   </header>
   ```

2. **마크다운 컨텐츠 (스크롤 영역)**
   ```tsx
   <article className="prose prose-lg max-w-none">
     <ReactMarkdown
       components={customComponents}
       remarkPlugins={[remarkGfm, remarkHeadingId]}
     >
       {project.readme || project.description}
     </ReactMarkdown>
   </article>
   ```

#### C. 반응형 레이아웃

**Desktop (>= 1024px):**
```
┌───────────┬─────────────────┐
│    TOC    │   Main Content  │
│  (240px)  │   (flex-1)      │
└───────────┴─────────────────┘
```

**Tablet (768px ~ 1023px):**
```
┌─────────────────────────────┐
│  [TOC 토글 버튼]             │
├─────────────────────────────┤
│  Main Content (full width)  │
│  (TOC는 오버레이 슬라이드)   │
└─────────────────────────────┘
```

**Mobile (< 768px):**
```
┌─────────────────┐
│  [TOC 버튼]     │
├─────────────────┤
│  Main Content   │
│  (Full screen)  │
└─────────────────┘
```

---

## 4. 기술 스택 및 라이브러리

### 4.1 필수 라이브러리

| 라이브러리 | 용도 | 버전 |
|-----------|------|------|
| `react-markdown` | 마크다운 렌더링 | ^9.0.0 |
| `remark-gfm` | GitHub Flavored Markdown (테이블, 체크박스 등) | ^4.0.0 |
| `rehype-sanitize` | XSS 방지 HTML 정제 | ^6.0.0 |
| `rehype-highlight` | 코드 블록 신택스 하이라이트 | ^7.0.0 |
| `remark-heading-id` | 헤딩 자동 ID 생성 (앵커 링크용) | ^1.0.0 |

### 4.2 설치 명령어
```bash
npm install react-markdown remark-gfm rehype-sanitize rehype-highlight remark-heading-id
```

---

## 5. 데이터 구조 변경

### 5.1 Project 타입 확장

**기존:**
```typescript
interface Project {
  // ...
  description: string;  // 단순 텍스트
  readme: string;       // 마크다운 (현재 미사용)
}
```

**개선:**
```typescript
interface Project {
  // ... 기존 필드 유지

  // 마크다운 컨텐츠 (우선순위: readme > description)
  readme: string;        // 마크다운 형식 권장
  description: string;   // Fallback (짧은 요약용)

  // TOC 관련 메타데이터 (선택)
  tableOfContents?: TableOfContentsItem[];  // 백엔드에서 미리 파싱 (옵션)
}

interface TableOfContentsItem {
  id: string;        // 앵커 ID (예: "overview")
  text: string;      // 표시 텍스트 (예: "프로젝트 개요")
  level: number;     // 헤딩 레벨 (1-6)
  children?: TableOfContentsItem[];  // 중첩 구조
}
```

### 5.2 마크다운 작성 가이드

**프로젝트 README 템플릿:**
```markdown
# 프로젝트 개요
간단한 프로젝트 소개...

# 기술 스택
## Frontend
- React 18
- TypeScript
- TailwindCSS

## Backend
- Spring Boot
- PostgreSQL

# 주요 기능
## 1. 사용자 인증
설명...

## 2. 실시간 채팅
설명...

# 아키텍처
시스템 구조 다이어그램 및 설명...

# 트러블슈팅
## 문제 1: 성능 최적화
해결 과정...

# 배운 점
...
```

---

## 6. 구현 계획

### 6.1 Phase 1: 기본 마크다운 렌더링
**목표:** 기존 모달에 마크다운 렌더링 추가

**작업:**
1. react-markdown 설치 및 설정
2. ProjectModal에 마크다운 렌더링 영역 추가
3. 기존 description 필드를 마크다운으로 렌더링
4. 코드 블록 신택스 하이라이트 적용

**예상 시간:** 2-3시간

### 6.2 Phase 2: TOC 자동 생성
**목표:** 마크다운 헤딩 파싱 및 목차 생성

**작업:**
1. `useTOC` 커스텀 훅 구현
   - 마크다운 파싱 (remark)
   - 헤딩 추출 및 ID 생성
   - 계층 구조 변환
2. TOC 컴포넌트 구현
3. 앵커 링크 스크롤 동작 구현

**예상 시간:** 3-4시간

### 6.3 Phase 3: 사이드바 레이아웃
**목표:** 좌측 TOC + 중앙 컨텐츠 레이아웃 구현

**작업:**
1. 모달 레이아웃 변경 (flex row)
2. TOC Panel 컴포넌트 분리
3. 반응형 레이아웃 구현 (desktop/tablet/mobile)
4. TOC 토글 기능 (모바일)

**예상 시간:** 4-5시간

### 6.4 Phase 4: 현재 섹션 하이라이트
**목표:** Intersection Observer로 읽기 위치 추적

**작업:**
1. `useActiveSection` 훅 구현
2. Intersection Observer 설정
3. TOC 아이템 active 상태 스타일링

**예상 시간:** 2-3시간

### 6.5 Phase 5: 데이터 마이그레이션
**목표:** 기존 프로젝트 데이터를 마크다운 형식으로 전환

**작업:**
1. 샘플 프로젝트 2-3개 마크다운 작성
2. 백엔드 API 테스트
3. 전체 프로젝트 마크다운 작성

**예상 시간:** 프로젝트당 1-2시간

---

## 7. 컴포넌트 구조

### 7.1 파일 구조
```
frontend/src/
├── shared/components/Modal/
│   ├── ProjectModal.tsx              # 메인 모달 컨테이너
│   ├── ProjectModalHeader.tsx        # 헤더 영역
│   ├── ProjectModalContent.tsx       # 마크다운 컨텐츠 영역
│   └── ProjectModalTOC.tsx           # 목차 사이드바
│
├── features/projects/
│   └── hooks/
│       ├── useTOC.ts                 # TOC 파싱 훅
│       ├── useActiveSection.ts       # 현재 섹션 추적 훅
│       └── useMarkdownRenderer.ts    # 마크다운 렌더링 설정
│
└── shared/components/Markdown/
    ├── MarkdownRenderer.tsx          # 재사용 가능한 마크다운 렌더러
    └── markdownComponents.tsx        # 커스텀 마크다운 컴포넌트
```

### 7.2 주요 컴포넌트 코드 스켈레톤

#### ProjectModal.tsx
```typescript
const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, project }) => {
  const [isTOCOpen, setIsTOCOpen] = useState(true);
  const tocItems = useTOC(project.readme);
  const activeSection = useActiveSection(tocItems);

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-7xl flex">
        {/* TOC Sidebar */}
        {isTOCOpen && (
          <ProjectModalTOC
            items={tocItems}
            activeId={activeSection}
            onClose={() => setIsTOCOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <ProjectModalHeader project={project} />
          <ProjectModalContent
            markdown={project.readme || project.description}
          />
        </div>
      </div>
    </div>
  );
};
```

#### useTOC.ts
```typescript
interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export const useTOC = (markdown: string): TOCItem[] => {
  return useMemo(() => {
    // remark로 마크다운 파싱
    const ast = unified()
      .use(remarkParse)
      .parse(markdown);

    // 헤딩 노드만 추출
    const headings: TOCItem[] = [];
    visit(ast, 'heading', (node: Heading) => {
      const text = toString(node);
      const id = text.toLowerCase().replace(/\s+/g, '-');
      headings.push({
        id,
        text,
        level: node.depth
      });
    });

    return headings;
  }, [markdown]);
};
```

#### useActiveSection.ts
```typescript
export const useActiveSection = (tocItems: TOCItem[]): string | null => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -66%',
        threshold: 1.0
      }
    );

    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  return activeId;
};
```

---

## 8. 스타일링 가이드

### 8.1 Prose 스타일 (TailwindCSS Typography)

```tsx
<article className="prose prose-lg prose-slate max-w-none
  prose-headings:scroll-mt-20
  prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6
  prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4
  prose-h3:text-xl prose-h3:font-medium prose-h3:mt-6 prose-h3:mb-3
  prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
  prose-pre:bg-gray-900 prose-pre:text-gray-100
  prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
">
  <ReactMarkdown>{content}</ReactMarkdown>
</article>
```

### 8.2 TOC 스타일

```tsx
const TOCItem = ({ item, isActive }: TOCItemProps) => (
  <li className={`
    transition-colors duration-200
    ${isActive
      ? 'text-primary-600 font-semibold border-l-2 border-primary-600 pl-3'
      : 'text-gray-600 border-l-2 border-transparent pl-3 hover:text-primary-500'
    }
  `}>
    <a href={`#${item.id}`} className="block py-1">
      {item.text}
    </a>
  </li>
);
```

---

## 9. 기존 컨텐츠 배치 전략

### 9.1 배치 우선순위

| 기존 요소 | 새 위치 | 설명 |
|----------|---------|------|
| 제목 | Header (고정) | 최상단 유지 |
| 날짜/배지 | Header (고정) | 제목 아래 메타데이터 |
| 이미지 갤러리 | 마크다운 내 | 마크다운에서 이미지 태그로 표현 또는 헤더 하단 |
| 기술 스택 | Header (고정) | 배지 형태로 표시 |
| 설명 | 마크다운 | readme 또는 description 렌더링 |
| 팀 기여도 | Header (고정) | isTeam 조건부 표시 |
| 외부 링크 | Header (고정) | 우측 상단 또는 헤더 하단 |

### 9.2 헤더 영역 최종 구성

```tsx
<header className="sticky top-0 bg-white z-10 pb-6 border-b">
  {/* Row 1: 제목 + 닫기 버튼 */}
  <div className="flex justify-between items-start mb-4">
    <h1 className="text-3xl font-bold">{project.title}</h1>
    <button onClick={onClose}>×</button>
  </div>

  {/* Row 2: 메타데이터 */}
  <div className="flex flex-wrap gap-3 items-center mb-4">
    <span className="text-gray-600">📅 {startDate} ~ {endDate}</span>
    <CategoryBadge type={project.type} />
    <StatusBadge status={project.status} />
    {project.isTeam && <TeamBadge />}
  </div>

  {/* Row 3: 팀 기여도 (조건부) */}
  {project.isTeam && (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <h3>팀 프로젝트 기여도</h3>
      <div>역할: {project.role}</div>
      <ul>
        {project.myContributions?.map(c => <li>{c}</li>)}
      </ul>
    </div>
  )}

  {/* Row 4: 기술 스택 */}
  <div className="flex flex-wrap gap-2 mb-4">
    {project.technologies.map(tech => (
      <span className="badge">{tech}</span>
    ))}
  </div>

  {/* Row 5: 외부 링크 */}
  <div className="flex gap-3">
    {project.liveUrl && <LinkButton href={project.liveUrl}>사이트</LinkButton>}
    {project.githubUrl && <LinkButton href={project.githubUrl}>GitHub</LinkButton>}
    {project.externalUrl && <LinkButton href={project.externalUrl}>Portfolio</LinkButton>}
  </div>
</header>
```

### 9.3 이미지 처리 방안

**옵션 1: 마크다운 내 이미지**
```markdown
# 프로젝트 개요

![메인 스크린샷](https://example.com/screenshot1.png)

프로젝트 설명...

## 주요 화면
![화면1](https://example.com/screenshot2.png)
![화면2](https://example.com/screenshot3.png)
```

**옵션 2: 헤더 하단 고정 갤러리 (기존 유지)**
```tsx
<header>
  {/* ... 메타데이터 ... */}

  {/* 이미지 갤러리 */}
  {project.imageUrl && (
    <div className="mt-4">
      <img src={project.imageUrl} alt="메인" className="w-full rounded-lg" />
    </div>
  )}
</header>

<article className="prose">
  <ReactMarkdown>{project.readme}</ReactMarkdown>
</article>
```

**권장: 옵션 2 (기존 갤러리 유지)**
- 일관된 레이아웃 유지
- 이미지 로딩 최적화 용이
- 마크다운은 텍스트 중심 컨텐츠에 집중

---

## 10. 접근성 (A11y) 고려사항

### 10.1 키보드 네비게이션
- TOC 링크: Tab으로 이동, Enter로 스크롤
- 모달 닫기: Esc 키 지원
- Focus trap: 모달 내부에만 포커스

### 10.2 스크린 리더 지원
```tsx
<nav aria-label="목차">
  <ul>
    {tocItems.map(item => (
      <li key={item.id}>
        <a
          href={`#${item.id}`}
          aria-current={activeId === item.id ? 'location' : undefined}
        >
          {item.text}
        </a>
      </li>
    ))}
  </ul>
</nav>

<article aria-label="프로젝트 상세 내용">
  <ReactMarkdown>{content}</ReactMarkdown>
</article>
```

---

## 11. 성능 최적화

### 11.1 마크다운 파싱 캐싱
```typescript
const useTOC = (markdown: string) => {
  return useMemo(() => {
    // 마크다운 파싱 (재렌더링 시 불필요한 파싱 방지)
    return parseMarkdownToTOC(markdown);
  }, [markdown]);
};
```

### 11.2 Virtual Scrolling (옵션)
- 매우 긴 마크다운 문서(>10,000줄)인 경우
- `react-window` 또는 `react-virtualized` 사용 고려

### 11.3 Code Splitting
```typescript
// 마크다운 관련 라이브러리 lazy loading
const MarkdownRenderer = lazy(() => import('./MarkdownRenderer'));

<Suspense fallback={<Spinner />}>
  <MarkdownRenderer content={project.readme} />
</Suspense>
```

---

## 12. 테스트 계획

### 12.1 단위 테스트
- `useTOC` 훅: 다양한 마크다운 구조 파싱 테스트
- `useActiveSection` 훅: Intersection Observer 모킹 테스트
- TOC 컴포넌트: 클릭 이벤트 및 스크롤 동작 테스트

### 12.2 통합 테스트
- 전체 모달 렌더링 테스트
- TOC 클릭 → 스크롤 동작 검증
- 반응형 레이아웃 변경 테스트

### 12.3 E2E 테스트
- 프로젝트 카드 클릭 → 모달 오픈 → TOC 사용 시나리오
- 모바일 TOC 토글 동작
- 긴 마크다운 스크롤 성능 측정

---

## 13. 마이그레이션 가이드 (개발자용)

### 13.1 기존 프로젝트 데이터 → 마크다운 전환

**Before (JSON):**
```json
{
  "title": "AI 포트폴리오",
  "description": "AI 챗봇이 포함된 포트폴리오 사이트",
  "technologies": ["React", "Spring Boot", "PostgreSQL"]
}
```

**After (Markdown in readme field):**
```markdown
# AI 포트폴리오

AI 챗봇이 포함된 인터랙티브 포트폴리오 사이트입니다.

## 기술 스택
### Frontend
- React 18 + TypeScript
- TailwindCSS

### Backend
- Spring Boot 3.2
- PostgreSQL 15

## 주요 기능
### 1. AI 챗봇
GPT-4 기반 실시간 질문 응답...

### 2. 프로젝트 필터링
카테고리, 기술스택별 필터...

## 아키텍처
시스템은 3-tier 구조로 설계...

## 배운 점
- Spring Boot에서 WebSocket 구현 경험
- React Query를 활용한 서버 상태 관리
- PostgreSQL 전문 검색 최적화
```

### 13.2 백엔드 변경 사항

**없음!**
- 기존 `readme` 필드 활용
- API 응답 구조 변경 불필요
- 프론트엔드만 수정으로 완료

---

## 14. 롤아웃 전략

### 14.1 점진적 배포

**Step 1: Beta (1개 프로젝트)**
- 대표 프로젝트 1개만 마크다운 작성
- 내부 테스트 및 피드백 수집

**Step 2: Soft Launch (3-5개 프로젝트)**
- 주요 프로젝트 마크다운 작성
- 사용자 반응 모니터링

**Step 3: Full Rollout**
- 전체 프로젝트 마크다운 전환
- 기존 description 활용 프로젝트는 병행 운영

### 14.2 Fallback 전략

```typescript
const ProjectModal = ({ project }) => {
  const content = project.readme || project.description;
  const hasMarkdown = !!project.readme;

  return (
    <div>
      {hasMarkdown ? (
        // 마크다운 렌더링 + TOC
        <MarkdownLayout content={content} />
      ) : (
        // 기존 단순 텍스트 표시
        <SimpleTextLayout content={content} />
      )}
    </div>
  );
};
```

---

## 15. 예상 효과

### 15.1 사용자 경험 개선
- ✅ **탐색성 향상**: 긴 프로젝트 설명도 목차로 쉽게 탐색
- ✅ **가독성 증대**: 구조화된 마크다운 포맷
- ✅ **전문성 표현**: 포트폴리오로서의 완성도 상승

### 15.2 유지보수성 향상
- ✅ **유연한 컨텐츠**: 프로젝트마다 다른 구조 가능
- ✅ **버전 관리**: 마크다운 파일로 Git 관리 용이
- ✅ **재사용성**: 다른 프로젝트 문서화에 활용 가능

### 15.3 SEO 및 공유
- ✅ **구조화 데이터**: 헤딩 구조로 검색 엔진 최적화
- ✅ **OG 이미지**: 마크다운 내 이미지를 OG 태그로 활용 가능

---

## 16. 참고 자료

### 16.1 영감을 받은 사이트
- [Notion 문서 페이지](https://notion.so)
- [GitHub README 뷰어](https://github.com)
- [MDN Web Docs](https://developer.mozilla.org)

### 16.2 관련 기술 문서
- [react-markdown 공식 문서](https://github.com/remarkjs/react-markdown)
- [remark 플러그인 생태계](https://github.com/remarkjs/remark/blob/main/doc/plugins.md)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

---

## 17. 다음 액션 아이템

### 개발자 TODO
- [ ] Phase 1 구현: 기본 마크다운 렌더링
- [ ] Phase 2 구현: TOC 자동 생성
- [ ] Phase 3 구현: 사이드바 레이아웃
- [ ] Phase 4 구현: 현재 섹션 하이라이트
- [ ] 샘플 프로젝트 마크다운 작성 (2-3개)
- [ ] 반응형 테스트 (모바일/태블릿/데스크톱)
- [ ] 접근성 테스트 (스크린 리더, 키보드 네비게이션)

### 컨텐츠 작성자 TODO
- [ ] 프로젝트별 마크다운 템플릿 결정
- [ ] 기존 프로젝트 설명 → 마크다운 전환
- [ ] 스크린샷 이미지 최적화 및 업로드
- [ ] 프로젝트별 상세 문서 작성

---

**문서 작성일**: 2025-10-07
**최종 수정일**: 2025-10-07
**작성자**: AI Agent (Claude)
**검토자**: TBD
