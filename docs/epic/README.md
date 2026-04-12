# 에픽 (Epic)

에픽·Phase 마크다운은 **의도한 현재 상태**를 담는다. 변경 이력은 Git에만 둔다 (`epic-lifecycle`, DC-05).

## 문서 레이아웃

`epic-lifecycle` 스킬과 동일한 구조를 따른다. 본 저장소에서는 완료 에픽을 **`docs/epic/archive/`** 아래에 둔다 (스킬 예시의 `docs/archive/`와 역할이 같다).

```
docs/epic/
  E##.YYYY-MM-DD_{epic-name}/
    Readme.md          # 필수 (또는 이 폴더 관례에 맞는 README.md)
    P##.{phase-name}.md

docs/epic/archive/
  E##.YYYY-MM-DD_{epic-name}/   # 아카이브 시 폴더명(E## 포함) 유지
  legacy-epics/                 # 과거 E## 규칙 이전 문서
```

## E## 번호 부여

1. `docs/epic/`와 `docs/epic/archive/`의 **디렉터리명**에서 `E##` 정수를 모은다.
2. 새 에픽 id = **전체 최댓값 + 1** (2026-04-03 기준 다음 신규 에픽은 **E07**).

**번호 충돌:** 활성 `E02.2026-04-02_infrastructure-as-code`와 아카이브 `E02.2026-03-30_backend-sonarqube-resolution`처럼 **같은 `E##` 접두가 날짜·주제별로 공존**할 수 있다. 식별은 항상 **`E##.YYYY-MM-DD_{이름}` 전체 경로**로 한다.

## 진행 중인 에픽

| 에픽 | 설명 |
|------|------|
| [E15.2026-04-10_frontend-refactor-governance-and-quality](./E15.2026-04-10_frontend-refactor-governance-and-quality/) | 프론트엔드 구조 재정렬, YamangDesign 기준 토큰 체계 정비, SonarQube·성능·품질 환경 개선, `policy_compiler` 이식 기준 정리 (P01~P04) |
| [E17.2026-04-12_multi-site-schema-and-content-model](./E17.2026-04-12_multi-site-schema-and-content-model/) | `project_visibility` 중심 멀티사이트 DB/콘텐츠 모델 후속 구현 설계 |

## 아카이브된 에픽 (E## 네이밍)

완료 후 `docs/epic/archive/`로 옮긴 에픽. 각 `Readme.md`에 **아카이브일**이 적혀 있다.

| 에픽 | 요약 |
|------|------|
| [E02.2026-03-30_backend-sonarqube-resolution](./archive/E02.2026-03-30_backend-sonarqube-resolution/) | 백엔드 SonarQube 이슈 처리 (기존 E01→E02로 문서 넘버 갱신) |
| [E03.2026-04-03_redis-cache-serialization-refactor](./archive/E03.2026-04-03_redis-cache-serialization-refactor/) | Redis 직렬화·ObjectMapper 경계·캐시 전략 (P01~P05 문서; 아카이브 시점 기준 P05는 저장소와 별도 대조) |
| [E04.2026-04-03_article-statistics-null-safety](./archive/E04.2026-04-03_article-statistics-null-safety/) | 아티클 통계 null-safety·Easter egg 제거 |
| [E05.2026-04-03_cache-boundary-and-ui-primitives-refactor](./archive/E05.2026-04-03_cache-boundary-and-ui-primitives-refactor/) | 캐시 직렬화 경계·Tooltip DOM·운영 계약 (P01~P04) |
| [E16.2026-04-12_infra-audit-and-domain-strategy](./archive/E16.2026-04-12_infra-audit-and-domain-strategy/) | 인프라/도메인 실감사, Option B 전략 확정, 스테이징 네이밍 통일, D01 유지 + E17 분리 |

## 레거시 아카이브 (`archive/legacy-epics/`)

`E##.YYYY-MM-DD_` 규칙 이전의 에픽·기획 문서다. 경로 예:

- [detail-page-ux-bugfix](./archive/legacy-epics/detail-page-ux-bugfix/) — 상세 페이지 UX 버그픽스
- [seo-aeo-optimization](./archive/legacy-epics/seo-aeo-optimization/) — SEO/AEO
- [ux-data-loading-optimization](./archive/legacy-epics/ux-data-loading-optimization/) — UX·데이터 로딩
- 기타: `chat-message-logging`, `profile-article`, `portfolio-renewal-refactor` 등

## 운영 절차 (요약)

스킬 전문은 `.cursor/skills/epic-lifecycle/SKILL.md`의 Operation A/B/C를 따른다.

### 새 에픽 (CREATE_EPIC)

1. 다음 `E##` 계산 (위 번호 규칙).
2. `docs/epic/E##.YYYY-MM-DD_{epic-name}/` 생성, `Readme.md`에 목표·배경·특이점·Phase 목록·상태 체크리스트.
3. 팀 규칙에 맞게 브랜치: 예 `epic/E##-{scope}`.

### 새 Phase (CREATE_PHASE)

1. 동일 에픽 폴더에서 `P##.{phase-name}.md` 추가 (목표·구현 상세·체크리스트).
2. 에픽 `Readme.md`에 링크·체크박스 갱신.

### 아카이브 (ARCHIVE_EPIC)

1. 에픽 완료 검토(목표·Phase 일치·미해결 항목 명시) 통과 후에만 이동.
2. `docs/epic/E##.../` → `docs/epic/archive/E##.../` (폴더명 유지).
3. 에픽 `Readme.md` 하단에 `## 완료` / `아카이브일: YYYY-MM-DD` 추가.
4. `docs/epic/` 루트에 동명 폴더가 남지 않았는지 확인.

### Git 브랜치 (에픽과의 추적)

- 에픽 브랜치: `epic/E##-{scope}` (프로젝트 컨벤션에 따름).
- Phase 작업: `feat/E##/P01-{scope}` 등으로 `E##`·`P##` 추적 가능하게 유지.

## 관련 문서

- [백로그 관리](../backlog/README.md)
- [아카이브된 이슈](../backlog/archive/)
