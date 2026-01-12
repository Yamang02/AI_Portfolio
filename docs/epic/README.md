# 에픽 (Epic)

완료되었거나 진행 중인 주요 에픽(프로젝트) 문서를 관리합니다.

## 📁 현재 에픽

### 진행 중인 에픽
- 없음

### 계획 중인 에픽 (Backlog)
- [ux-data-loading-optimization/](./ux-data-loading-optimization/) - UX 및 데이터 로딩 최적화 (우선순위: High, 예상 기간: 2-3주)

## 📝 에픽 문서 구조

### 에픽 디렉토리 구조

**⚠️ 중요**: 모든 에픽은 **브랜치명과 동일한 디렉토리명**을 사용합니다.

```
epic/
├── {epic-name}/          # 브랜치명과 동일한 디렉토리명
│   ├── README.md         # 에픽 메인 문서 (필수)
│   ├── review.md         # 에픽 리뷰 문서 (선택)
│   ├── design.md         # 설계 문서 (선택)
│   ├── todo.md           # 작업 목록 (선택)
│   └── ...               # 기타 관련 문서
└── archive/              # 완료된 에픽
    └── {epic-name}/
```

### 에픽 생성 규칙

1. **디렉토리 생성**: 브랜치명과 동일한 이름으로 디렉토리 생성
   ```bash
   # 예시: epic/ux-data-loading-optimization/
   mkdir epic/ux-data-loading-optimization
   ```

2. **README.md 작성**: 에픽의 메인 문서는 반드시 `README.md`로 작성
   - 에픽 개요, 목표, 포함된 이슈, 완료 기준 등 포함

3. **브랜치명 규칙**: kebab-case 사용 (예: `ux-data-loading-optimization`)

### 각 에픽 폴더에 포함될 수 있는 문서

- **README.md** (필수): 에픽 메인 문서
- **review.md** (선택): 에픽 리뷰 및 검토 문서
- **design.md** (선택): 설계 문서
- **todo.md** (선택): 작업 목록
- **PRD.md** (선택): Product Requirements Document
- **마이그레이션 가이드** (선택): 마이그레이션 관련 문서
- **회고 문서** (완료 시): 에픽 완료 후 회고

## 📚 아카이브된 에픽

완료된 에픽들은 `epic/archive/` 폴더에 보관되어 있습니다:

### Epic Archive (`epic/archive/`)
- [portfolio-renewal-refactor/](./archive/portfolio-renewal-refactor/) - Portfolio Site Renewal (Structural Refactor) ✅
- [profile-article/](./archive/profile-article/) - Profile Article Management (자기소개 Markdown 관리 및 기술 아티클 시스템) ✅
- [frontend-structure-optimization.md](./archive/frontend-structure-optimization.md) - 프론트엔드 구조 최적화 ✅ (2026-01-12 완료)

### 기타 Archive (`docs/archive/`)
다른 아카이브된 문서들은 `docs/archive/` 폴더에 보관되어 있습니다:
- `admin-dashboard/` - Admin Dashboard 구현
- `ai-service-migration/` - AI 서비스 마이그레이션
- `cloud-usage-monitoring/` - 클라우드 사용량 모니터링
- `frontend-migration/` - 프론트엔드 마이그레이션
- `portfolio-site-renewal/` - 포트폴리오 사이트 리뉴얼(2025년버전)
- `refactor/` - 리팩토링 작업

---

## 🔄 에픽 관리 정책

### 에픽 생성 절차

1. **브랜치명 결정**: kebab-case로 브랜치명 결정 (예: `ux-data-loading-optimization`)

2. **디렉토리 생성**: `epic/{브랜치명}/` 디렉토리 생성
   ```bash
   mkdir epic/ux-data-loading-optimization
   ```

3. **README.md 작성**: 에픽 메인 문서 작성
   - 파일명: `epic/{브랜치명}/README.md`
   - 내용: 개요, 목표, 포함된 이슈, 완료 기준 등

4. **이슈 연결**: 관련 이슈들을 에픽에 연결
   - 개별 이슈 파일은 `docs/backlog/features/`에 작성
   - 이슈들이 에픽에 포함되면 `docs/backlog/archive/`로 이동

5. **README.md 업데이트**: `epic/README.md`에 새 에픽 추가

### 에픽 링크 규칙

- 아카이브된 이슈는 헤더에 에픽 링크를 포함합니다:
  ```markdown
  **에픽**: [에픽명](../../epic/{epic-name}/README.md)
  ```

### 에픽 상태

- **Backlog**: 계획 단계, 아직 시작되지 않음
- **In Progress**: 현재 진행 중
- **On Hold**: 일시 중단
- **Completed**: 완료됨 (아카이브로 이동)

### 에픽 완료 시

1. 에픽 디렉토리를 `epic/archive/{epic-name}/`로 이동
2. `epic/README.md`에서 진행 중인 에픽 목록에서 제거하고 아카이브 섹션에 추가

---

## 🔗 관련 문서

- [백로그 관리](../backlog/README.md)
- [아카이브된 이슈](../backlog/archive/)
