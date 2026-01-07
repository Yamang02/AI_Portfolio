# 📁 AI_Portfolio 문서 재구성 계획서

> 작성일: 2026-01-04  
> 목적: ClipPro 문서 구조를 참고하여 AI_Portfolio 문서를 체계적으로 재구성

---

## 🎯 목표

1. ClipPro의 `backlog`, `epic`, `issues`, `technical`, `templates` 폴더 구조를 적용
2. `backend/docs`, `frontend/docs`에 흩어진 문서들을 루트 `docs/`로 통합
3. 각 디렉토리에는 `developmentGuide.md`만 유지

---

## 📂 새로운 폴더 구조

```
docs/
├── backlog/           # 백로그 (아이디어, 에픽 초안, 피처 요청)
│   ├── epics/
│   ├── features/
│   ├── ideas.md
│   └── README.md
├── epic/              # 진행중/완료된 에픽
│   └── (프로젝트별 에픽 폴더)
├── issues/            # 이슈 트래킹
│   └── (기능별 분류)
├── technical/         # 기술 문서 (아키텍처, 가이드 등)
│   ├── architecture/
│   ├── guides/
│   └── decisions/
├── templates/         # 문서 템플릿
└── archive/           # 기존 문서 아카이브 (정리 후 삭제 예정)
```

---

## ✅ 체크리스트

### Phase 1: 새 폴더 구조 생성 ✅

- [x] `docs/backlog/` 폴더 생성
- [x] `docs/backlog/epics/` 폴더 생성
- [x] `docs/backlog/features/` 폴더 생성
- [x] `docs/epic/` 폴더 생성
- [x] `docs/issues/` 폴더 생성
- [x] `docs/technical/` 폴더 생성
- [x] `docs/templates/` 폴더 생성
- [x] `docs/archive/` 폴더 생성 (임시 보관용)

---

### Phase 2: 기존 docs/ 문서 분류 및 이동

#### 📁 현재 `docs/` 루트 파일들

| 파일명 | 이동 위치 | 완료 |
|--------|-----------|------|
| `aws-console-setup-guide.md` | `technical/guides/` | [x] |
| `current-service-architecture.md` | `technical/architecture/` | [x] |
| `DEVELOPMENT.md` | `technical/guides/` | [x] |
| `portfolio.md` | 삭제 | [x] |
| `spring-session-redis-authentication.md` | `technical/` | [x] |
| `staging-deployment-checklist.md` | `technical/guides/` | [x] |
| `system-architecture-overview.md` | `technical/architecture/` | [x] |
| `toc-scroll-improvement-review.md` | 삭제 | [x] |

#### 📁 `docs/ai/` 폴더 정리

| 항목 | 이동 위치 | 완료 |
|------|-----------|------|
| `agent_guideline/backend/` (4개 파일) | `technical/guides/backend/` | [x] |
| `agent_guideline/frontend/` (6개 파일) | `technical/guides/frontend/` | [x] |
| `agent-signal-guidelines.md` | `technical/` | [x] |
| `developer-signal-guidelines.md` | `technical/` | [x] |
| `backup/` (3개 파일) | `archive/` | [x] |
| `conversation_log.md` | `archive/` | [x] |
| `decisions/` (1개 파일) | `technical/decisions/` | [x] |
| `document-templates-detailed.md` | `templates/` | [x] |
| `document-templates.md` | `templates/` | [x] |
| `feature/` (18개 파일) | `epic/` (모두 구현 완료) | [x] |
| `planning-catch-system*.md` | `epic/` | [x] |
| `templates/` | `templates/` 로 병합 | [x] |

#### 📁 `docs/ai-service-migration/` 폴더

| 파일명 | 이동 위치 | 완료 |
|--------|-----------|------|
| `00-migration-overview.md` | `epic/ai-service-migration/` | [x] |
| `01-dependency-analysis.md` | `epic/ai-service-migration/` | [x] |
| `02-code-removal-checklist.md` | `epic/ai-service-migration/` | [x] |
| `03-migration-steps.md` | `epic/ai-service-migration/` | [x] |

#### 📁 `docs/fix/` 폴더 (8개 파일)

| 파일명 | 이동 위치 | 완료 |
|--------|-----------|------|
| `admin-data-management-issue-analysis.md` | `issues/admin/` | [x] |
| `cache-and-data-processing-improvements.md` | `issues/cache/` | [x] |
| `files-to-modify.md` | `archive/` | [x] |
| `gcp-billing-client-root-cause-analysis.md` | `issues/billing/` | [x] |
| `implementation-plan.md` | `issues/` (루트) | [x] |
| `issue-diagram.md` | `issues/` (루트) | [x] |
| `json-deserialization-errors-analysis.md` | `issues/data-processing/` | [x] |
| `README.md` | `issues/` (루트) | [x] |

#### 📁 `docs/guides/` 폴더

| 파일명 | 이동 위치 | 완료 |
|--------|-----------|------|
| `backend-architecture-guide.md` | `technical/architecture/` | [x] |

#### 📁 `docs/ref/` 폴더

| 파일명 | 이동 위치 | 완료 |
|--------|-----------|------|
| `hexagonal-architecture-data-transfer.md` | `technical/architecture/` | [x] |

#### 📁 `docs/refactor/` 폴더 (3개 파일)

| 항목 | 이동 위치 | 완료 |
|------|-----------|------|
| 전체 폴더 | `epic/refactor/` | [x] |

#### 📁 `docs/template/` 폴더

| 파일명 | 이동 위치 | 완료 |
|--------|-----------|------|
| `conversation_log_template.md` | `templates/` | [x] |

#### 📁 `docs/version/` 폴더

| 파일명 | 이동 위치 | 완료 |
|--------|-----------|------|
| `v2.0-deployment-guide.md` | `technical/guides/` | [x] |

---

### Phase 3: frontend/docs 이동

| 파일명 | 이동 위치 | 완료 |
|--------|-----------|------|
| `architecture.md` | `technical/architecture/frontend-architecture.md` | [x] |
| `import-migration-guide.md` | `epic/frontend-migration/` | [x] |
| `migration-guide.md` | `epic/frontend-migration/` | [x] |
| `migration-summary.md` | `epic/frontend-migration/` | [x] |
| `remaining-tasks.md` | `backlog/features/` | [x] |

#### ✍️ 새로 생성

- [x] `frontend/docs/developmentGuide.md` 생성 (프론트엔드 개발 가이드)

---

### Phase 4: backend/docs 이동

| 파일명 | 이동 위치 | 완료 |
|--------|-----------|------|
| `api-spec.yml` | `technical/api-spec.yml` | [x] |
| `README.md` | `technical/api-documentation-readme.md` | [x] |

#### ✍️ 새로 생성

- [x] `backend/docs/developmentGuide.md` 생성 (백엔드 개발 가이드)

---

### Phase 5: 템플릿 정리

#### 새 `templates/` 폴더에 포함할 항목

- [x] 기존 `docs/template/` 내용 이동
- [x] 기존 `docs/ai/templates/` 내용 이동
- [x] 기존 `docs/ai/document-templates*.md` 이동
- [ ] ClipPro 참고하여 추가 템플릿 생성 고려:
  - [ ] `basic_issue.md`
  - [ ] `bug_report.md`
  - [ ] `feature_request.md`
  - [ ] `epic-retrospective-template.md`

---

### Phase 6: README 및 인덱스 파일 생성

- [x] `docs/README.md` 생성 (문서 구조 설명)
- [x] `docs/backlog/README.md` 생성
- [x] `docs/epic/README.md` 생성
- [x] `docs/issues/README.md` 생성
- [x] `docs/technical/README.md` 생성
- [x] `docs/templates/README.md` 생성

---

### Phase 7: 정리 및 삭제

- [x] `archive/` 폴더 내용 최종 검토
- [x] 불필요한 파일 삭제 (`portfolio.md`, `toc-scroll-improvement-review.md`)
- [x] 빈 폴더 삭제:
  - [x] `docs/ai/` (모든 파일 이동 후)
  - [x] `docs/ai-service-migration/` (모든 파일 이동 후)
  - [x] `docs/fix/` (모든 파일 이동 후)
  - [x] `docs/guides/` (모든 파일 이동 후)
  - [x] `docs/ref/` (모든 파일 이동 후)
  - [x] `docs/refactor/` (모든 파일 이동 후)
  - [x] `docs/template/` (모든 파일 이동 후)
  - [x] `docs/version/` (모든 파일 이동 후)
  - [x] `docs/database/` (빈 폴더 삭제)
- [x] `frontend/docs/` 기존 파일 삭제 (developmentGuide.md만 남김)
- [x] `backend/docs/` 기존 파일 삭제 (developmentGuide.md만 남김)

---

## 📋 요약

| 구분 | 파일 수 |
|------|---------|
| docs/ 루트 파일 | ~8개 |
| docs/ai/ 하위 | ~35개 이상 |
| docs/ai-service-migration/ | 4개 |
| docs/fix/ | 8개 |
| docs/기타 폴더들 | ~10개 |
| frontend/docs/ | 5개 |
| backend/docs/ | 2개 |
| **총 이동 대상** | **~70개 이상** |

---

## ⚠️ 주의사항

1. **파일 이동 전 Git 커밋**: 현재 상태 백업
2. **링크 확인**: 문서 간 상호 참조 링크 업데이트 필요
3. **경로 변경 영향**: 코드에서 문서 참조 시 경로 변경 확인
4. **점진적 진행**: Phase별로 진행하며 각 단계 완료 후 커밋

---

## 📝 결정 사항 (2026-01-04)

- [x] `portfolio.md` 파일 → 삭제
- [x] `docs/ai/feature/` 18개 파일 → `epic/`로 이동 (모두 구현 완료)
- [x] 이슈 분류 기준 → 기능별 분류
- [x] `files-to-modify.md` → `archive/`
- [x] `toc-scroll-improvement-review.md` → 삭제
- [x] `docs/database/` 폴더 → 삭제 (비어있음)

---

---

## ✅ 작업 완료 (2026-01-04)

모든 Phase가 완료되었습니다! 문서 재구성이 성공적으로 완료되었습니다.

*이 계획서는 작업 진행에 따라 업데이트됩니다.*
