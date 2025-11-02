# 프로젝트 히스토리 관리 시스템 설계

## 1. 개요

### 1.1 목적
복잡한 버전 관리 시스템 대신 **마크다운 히스토리 섹션**을 활용하여 프로젝트의 진화 과정을 문서화하고 관리자 페이지에서 쉽게 편집할 수 있도록 함.

### 1.2 핵심 컨셉
- **단순성**: DB 스키마 변경 없이 기존 `readme` 필드 활용
- **유연성**: 프로젝트별로 다른 히스토리 구조 허용
- **관리 편의성**: 관리자 페이지에서 마크다운 에디터로 편집
- **가독성**: 한 문서에서 전체 프로젝트 진화 과정 파악

---

## 2. 히스토리 섹션 템플릿

### 2.1 기본 템플릿 구조

```markdown
# 프로젝트명

프로젝트 개요 및 설명...

## 기술 스택
### Frontend
- React 18 + TypeScript
- TailwindCSS

### Backend
- Spring Boot 3.2
- PostgreSQL 15

## 주요 기능
### 1. 핵심 기능 1
설명...

### 2. 핵심 기능 2
설명...

## 프로젝트 히스토리

### v1.0 - MVP (2024.01 ~ 2024.03)
**기술 스택**: React + Node.js + MongoDB
**주요 기능**:
- 기본 포트폴리오 레이아웃
- 프로젝트 카드 표시
- 간단한 필터링

**학습 내용**:
- React 컴포넌트 설계
- Node.js API 개발
- MongoDB 데이터 모델링

**트러블슈팅**:
- 초기 로딩 속도 개선 (코드 스플리팅 적용)

### v2.0 - 리뉴얼 (2024.04 ~ 2024.06)
**기술 스택**: React + Spring Boot + PostgreSQL
**주요 변경사항**:
- 백엔드 Spring Boot 전환
- PostgreSQL 도입으로 데이터 정규화
- UI/UX 개선

**학습 내용**:
- Spring Boot 아키텍처
- JPA/Hibernate 활용
- PostgreSQL 최적화

**트러블슈팅**:
- 데이터 마이그레이션 이슈 해결
- 성능 최적화 (쿼리 튜닝)

### v3.0 - AI 기능 추가 (2024.07 ~ 현재)
**기술 스택**: React + Spring Boot + PostgreSQL + OpenAI API
**주요 추가사항**:
- GPT-4 챗봇 통합
- RAG 시스템 구축
- 실시간 채팅 기능

**학습 내용**:
- OpenAI API 활용
- 벡터 임베딩 및 검색
- WebSocket 실시간 통신

**트러블슈팅**:
- 벡터 검색 성능 최적화
- 실시간 통신 안정성 개선

## 아키텍처
현재 시스템 아키텍처 설명...

## 배운 점
- 장기 프로젝트 관리 경험
- 기술 스택 전환 시 고려사항
- 사용자 피드백 기반 개선 과정
```

### 2.2 히스토리 섹션 구성 요소

#### A. 버전 정보
- **버전 번호**: v1.0, v2.0, v3.0-beta 등
- **버전명**: MVP, 리뉴얼, AI Edition 등
- **기간**: 시작일 ~ 종료일
- **상태**: 완료, 진행중, 중단 등

#### B. 기술 스택 변화
- 버전별 주요 기술 스택
- 기술 전환 이유 및 배경
- 새로운 기술 도입 과정

#### C. 주요 변경사항
- 기능 추가/개선
- 버그 수정
- 성능 최적화
- UI/UX 개선

#### D. 학습 내용
- 새로운 기술 습득
- 아키텍처 설계 경험
- 문제 해결 과정
- 팀 협업 경험

#### E. 트러블슈팅
- 발생한 문제와 해결 과정
- 성능 이슈 및 해결책
- 기술적 도전과 극복

---

## 3. 관리자 페이지 연계 설계

### 3.1 관리자 페이지 기능

#### A. 프로젝트 관리
```typescript
interface AdminProjectManagement {
  // 프로젝트 CRUD
  createProject: (project: ProjectInput) => Promise<Project>;
  updateProject: (id: string, project: ProjectInput) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  
  // 히스토리 관리
  updateProjectHistory: (id: string, history: string) => Promise<void>;
  getProjectHistory: (id: string) => Promise<string>;
}
```

#### B. 마크다운 에디터
```tsx
// AdminMarkdownEditor.tsx
const AdminMarkdownEditor = ({ projectId, initialContent }) => {
  const [content, setContent] = useState(initialContent);
  const [preview, setPreview] = useState(false);
  
  return (
    <div className="admin-editor">
      <div className="editor-toolbar">
        <button onClick={() => setPreview(!preview)}>
          {preview ? '편집' : '미리보기'}
        </button>
        <button onClick={saveContent}>저장</button>
      </div>
      
      <div className="editor-content">
        {preview ? (
          <MarkdownRenderer content={content} />
        ) : (
          <CodeMirror
            value={content}
            onChange={setContent}
            extensions={[markdown()]}
          />
        )}
      </div>
    </div>
  );
};
```

#### C. 히스토리 템플릿 제공
```tsx
// HistoryTemplateSelector.tsx
const HistoryTemplateSelector = ({ onSelect }) => {
  const templates = [
    {
      name: '기본 템플릿',
      content: `## 프로젝트 히스토리

### v1.0 - 초기 버전 (YYYY.MM)
**기술 스택**: 
**주요 기능**:
- 
**학습 내용**:
- 
**트러블슈팅**:
- 

### v2.0 - 개선 버전 (YYYY.MM)
**기술 스택**: 
**주요 변경사항**:
- 
**학습 내용**:
- 
**트러블슈팅**:
- `
    },
    {
      name: '간단한 템플릿',
      content: `## 프로젝트 히스토리

### v1.0 (YYYY.MM)
- 초기 버전
- 기본 기능 구현

### v2.0 (YYYY.MM)
- 기능 개선
- 성능 최적화`
    }
  ];
  
  return (
    <div className="template-selector">
      <h3>히스토리 템플릿 선택</h3>
      {templates.map(template => (
        <button
          key={template.name}
          onClick={() => onSelect(template.content)}
          className="template-button"
        >
          {template.name}
        </button>
      ))}
    </div>
  );
};
```

### 3.2 관리자 페이지 UI 구조

```tsx
// AdminProjectDetail.tsx
const AdminProjectDetail = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [project, setProject] = useState(null);
  
  return (
    <div className="admin-project-detail">
      <div className="admin-header">
        <h1>프로젝트 관리: {project?.title}</h1>
        <div className="admin-actions">
          <button>미리보기</button>
          <button>저장</button>
        </div>
      </div>
      
      <div className="admin-tabs">
        <button
          className={activeTab === 'basic' ? 'active' : ''}
          onClick={() => setActiveTab('basic')}
        >
          기본 정보
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          히스토리
        </button>
        <button
          className={activeTab === 'media' ? 'active' : ''}
          onClick={() => setActiveTab('media')}
        >
          미디어
        </button>
      </div>
      
      <div className="admin-content">
        {activeTab === 'basic' && <BasicInfoEditor project={project} />}
        {activeTab === 'history' && (
          <HistoryEditor
            projectId={projectId}
            content={project?.readme}
            onUpdate={setProject}
          />
        )}
        {activeTab === 'media' && <MediaManager projectId={projectId} />}
      </div>
    </div>
  );
};
```

---

## 4. 프론트엔드 UI 개선

### 4.1 히스토리 섹션 특별 스타일링

```tsx
// MarkdownRenderer.tsx
const customComponents = {
  h2: ({ children, ...props }) => {
    const isHistorySection = children?.toString().includes('히스토리');
    
    return (
      <h2 
        {...props}
        className={`${
          isHistorySection 
            ? 'text-blue-600 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r-lg' 
            : ''
        }`}
      >
        {children}
      </h2>
    );
  },
  
  h3: ({ children, ...props }) => {
    const isVersionHeader = children?.toString().startsWith('v');
    
    return (
      <h3 
        {...props}
        className={`${
          isVersionHeader 
            ? 'text-green-700 border-b-2 border-green-200 pb-2 mb-4' 
            : ''
        }`}
      >
        {children}
      </h3>
    );
  }
};
```

### 4.2 TOC에서 히스토리 섹션 강조

```tsx
// ProjectDetailTOC.tsx
const ProjectDetailTOC = ({ tocItems }) => {
  return (
    <nav className="toc-sidebar">
      <h3>목차</h3>
      <ul>
        {tocItems.map(item => (
          <li
            key={item.id}
            className={`
              ${item.isHistorySection ? 'history-section' : ''}
              ${item.isActive ? 'active' : ''}
            `}
          >
            <a href={`#${item.id}`}>
              {item.isHistorySection && '📚 '}
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

---

## 5. 구현 계획

### 5.1 Phase 1: 관리자 페이지 기본 구조 (1주)
- [ ] 관리자 페이지 라우팅 설정
- [ ] 프로젝트 목록 및 상세 페이지
- [ ] 기본 CRUD 기능
- [ ] 인증 및 권한 관리

### 5.2 Phase 2: 마크다운 에디터 통합 (1주)
- [ ] CodeMirror 또는 Monaco Editor 통합
- [ ] 마크다운 미리보기 기능
- [ ] 히스토리 템플릿 제공
- [ ] 자동 저장 기능

### 5.3 Phase 3: 히스토리 관리 기능 (3일)
- [ ] 히스토리 섹션 편집 UI
- [ ] 버전별 기술 스택 관리
- [ ] 트러블슈팅 섹션 관리
- [ ] 학습 내용 정리 기능

### 5.4 Phase 4: UI 개선 및 최적화 (3일)
- [ ] 히스토리 섹션 특별 스타일링
- [ ] TOC에서 히스토리 강조
- [ ] 반응형 디자인 최적화
- [ ] 성능 최적화

---

## 6. 예상 효과

### 6.1 개발자 경험
- ✅ **단순한 구현**: DB 변경 없이 마크다운만 수정
- ✅ **유연한 구조**: 프로젝트별로 다른 히스토리 형식 허용
- ✅ **쉬운 관리**: 관리자 페이지에서 직관적 편집

### 6.2 사용자 경험
- ✅ **한눈에 파악**: 프로젝트 진화 과정을 한 문서에서 확인
- ✅ **구조화된 정보**: 버전별 기술 스택, 학습 내용, 트러블슈팅 정리
- ✅ **성장 스토리**: 개발자의 기술적 성장 과정 표현

### 6.3 유지보수성
- ✅ **낮은 복잡도**: 복잡한 버전 관리 시스템 대신 단순한 문서 관리
- ✅ **확장성**: 새로운 프로젝트에 쉽게 적용 가능
- ✅ **버전 관리**: Git을 통한 마크다운 히스토리 관리

---

## 7. 참고 자료

### 7.1 마크다운 에디터
- [CodeMirror](https://codemirror.net/) - 경량 마크다운 에디터
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code 에디터
- [React Markdown Editor](https://github.com/uiwjs/react-md-editor) - React 전용

### 7.2 관리자 페이지 참고
- [Strapi Admin Panel](https://strapi.io/)
- [Sanity Studio](https://www.sanity.io/)
- [Contentful](https://www.contentful.com/)

---

**문서 작성일**: 2025-10-07
**최종 수정일**: 2025-10-07
**작성자**: AI Agent (Claude)
**검토자**: TBD
