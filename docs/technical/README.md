# 기술 문서 (Technical Documentation)

시스템 아키텍처, 개발 가이드, 기술적 결정 사항 등을 포함합니다.

## 📁 폴더 구조

```
technical/
├── README.md                           # 이 파일
├── api-spec.yml                        # OpenAPI 3.0 스펙 파일
│
├── architecture/                       # 🏗️ 시스템 아키텍처 문서
│   ├── system-architecture-overview.md
│   ├── current-service-architecture.md
│   ├── backend-architecture-guide.md
│   ├── frontend-architecture.md
│   ├── hexagonal-architecture-data-transfer.md
│   ├── structure-analysis-and-improvements.md
│   └── fsd-refactoring.md              # FSD 아키텍처 리팩토링
│
├── guides/                             # 📚 개발 가이드
│   ├── agent-development-guide.md          # AI Agent 종합 가이드
│   ├── DEVELOPMENT.md                      # 개발 환경 설정
│   │
│   ├── backend/                           # 백엔드 가이드
│   │   ├── api-documentation.md              # API 문서화 가이드
│   │   ├── authentication.md                # Spring Session 인증 시스템
│   │   ├── hexagonal-architecture-guide.md   # 헥사고날 아키텍처
│   │   └── crud-template-guide.md            # CRUD 템플릿
│   │
│   └── frontend/                          # 프론트엔드 가이드
│       ├── storybook-guide.md              # 스토리북 구성 가이드
│       ├── breakpoints-guide.md            # Breakpoints 토큰 가이드
│       ├── frontend-architecture-guide.md  # FSD 아키텍처
│       └── crud-template-guide.md          # CRUD 템플릿
│
├── decisions/                          # 📋 기술적 결정 사항 (ADR)
│   └── agentic-docs-system-architecture.md
│
└── design-system/                      # 🎨 디자인 시스템 문서
    ├── README.md
    ├── color-palette.md
    ├── color-palette-revised.md
    ├── phase-3-implementation-guide.md
    └── phase-3-usage-examples.md
```

---

## 🏗️ 아키텍처 문서

### 시스템 전체 구조
| 문서 | 설명 |
|------|------|
| [system-architecture-overview.md](./architecture/system-architecture-overview.md) | 전체 시스템 아키텍처 다이어그램 |
| [current-service-architecture.md](./architecture/current-service-architecture.md) | 현재 서비스별 상세 구성 |

### 백엔드 아키텍처
| 문서 | 설명 |
|------|------|
| [backend-architecture-guide.md](./architecture/backend-architecture-guide.md) | 백엔드 아키텍처 개요 |
| [hexagonal-architecture-data-transfer.md](./architecture/hexagonal-architecture-data-transfer.md) | 레이어 간 데이터 전송 형태 |

### 프론트엔드 아키텍처
| 문서 | 설명 |
|------|------|
| [frontend-architecture.md](./architecture/frontend-architecture.md) | Feature-Sliced Design 개요 |
| [fsd-refactoring.md](./architecture/fsd-refactoring.md) | FSD 리팩토링 완료 상태 |

---

## 📚 개발 가이드

### 핵심 가이드
| 문서 | 설명 |
|------|------|
| [agent-development-guide.md](./guides/agent-development-guide.md) | **AI Agent 종합 개발 가이드** |
| [DEVELOPMENT.md](./guides/DEVELOPMENT.md) | 개발 환경 설정 및 빠른 시작 |

### 백엔드 가이드
| 문서 | 설명 |
|------|------|
| [api-documentation.md](./guides/backend/api-documentation.md) | API 문서화 및 활용 가이드 |
| [authentication.md](./guides/backend/authentication.md) | Spring Session 기반 Admin 인증 시스템 |
| [hexagonal-architecture-guide.md](./guides/backend/hexagonal-architecture-guide.md) | 헥사고날 아키텍처 상세 가이드 |
| [crud-template-guide.md](./guides/backend/crud-template-guide.md) | CRUD 템플릿 (Main/Admin 분리 포함) |

### 프론트엔드 가이드
| 문서 | 설명 |
|------|------|
| [storybook-guide.md](./guides/frontend/storybook-guide.md) | 스토리북 구성 및 사용 가이드 |
| [breakpoints-guide.md](./guides/frontend/breakpoints-guide.md) | Breakpoints 토큰 사용 가이드 |
| [frontend-architecture-guide.md](./guides/frontend/frontend-architecture-guide.md) | FSD 아키텍처 상세 가이드 |
| [crud-template-guide.md](./guides/frontend/crud-template-guide.md) | CRUD 템플릿 및 공통 컴포넌트 |

---

## 📋 API 문서

| 문서 | 설명 |
|------|------|
| [api-spec.yml](./api-spec.yml) | OpenAPI 3.0 스펙 파일 |
| [api-documentation.md](./guides/backend/api-documentation.md) | API 문서화 및 활용 가이드 |

---

## 🔐 인증 & 보안

| 문서 | 설명 |
|------|------|
| [authentication.md](./guides/backend/authentication.md) | Spring Session 기반 Admin 인증 시스템 |

---

## 🎨 디자인 시스템

| 문서 | 설명 |
|------|------|
| [README.md](./design-system/README.md) | 디자인 시스템 개요 |
| [color-palette.md](./design-system/color-palette.md) | 컬러 팔레트 |
| [phase-3-implementation-guide.md](./design-system/phase-3-implementation-guide.md) | Phase 3 구현 가이드 |

---

## 📝 기술적 결정 사항 (ADR)

| 문서 | 설명 |
|------|------|
| [agentic-docs-system-architecture.md](./decisions/agentic-docs-system-architecture.md) | Agentic 문서화 시스템 아키텍처 |

---

## 🔗 외부 참조

이 폴더의 문서들은 다음 위치에서 참조됩니다:

- `backend/developmentGuide.md` → 백엔드 개발 시 참조
- `frontend/developmentGuide.md` → 프론트엔드 개발 시 참조

---

**최종 업데이트**: 2025-01-28
