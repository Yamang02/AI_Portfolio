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

## 활성·아카이브 문서 분류

- 활성 Epic은 이 디렉터리 바로 아래의 E##.* 디렉터리다.
- 아카이브 Epic은 docs/epic/archive/ 아래의 E##.* 디렉터리다.
- 별도 수동 목록은 관리하지 않는다. 상태와 아카이브 날짜는 Epic 자체 README에 기록한다.
- 아카이브 내용은 과거 조사·복구·대조 또는 명시적 아카이빙 요청이 있을 때만 연다.
## 운영 절차 (요약)

세부 절차는 [Epic lifecycle 스킬](../../.agents/skills/epic-lifecycle/SKILL.md)을 따른다.

### 새 에픽 (CREATE_EPIC)

1. 다음 `E##` 계산 (위 번호 규칙).
2. `docs/epic/E##.YYYY-MM-DD_{epic-name}/` 생성, `Readme.md`에 목표·배경·특이점·Phase 목록·상태 체크리스트.
3. 팀 규칙에 맞게 브랜치: 예 `epic/E##-{scope}`.

### 새 Phase (CREATE_PHASE)

1. 동일 에픽 폴더에서 `P##.{phase-name}.md` 추가 (목표·구현 상세·체크리스트).
2. 에픽 `Readme.md`에 링크·체크박스 갱신.

### 아카이브 (ARCHIVE_EPIC)

1. 실제 결과를 수용 기준과 대조하고 completed, partially completed, unverified를 구분한다. 남은 조건과 위험은 보존한다.
2. Epic README에 종결 상태와 아카이브일을 기록한다. 미완료 상태도 사용자 명시 요청에 따라 아카이브할 수 있다.
3. Epic 디렉터리 전체를 docs/epic/archive/ 아래로 이동하고 모든 Phase 파일을 보존한다.
4. 활성 경로가 남지 않았는지 확인하고, 현재 문서에서 필요한 개별 링크만 고친다. 수동 활성·아카이브 목록은 만들거나 갱신하지 않는다.
### Git 브랜치 (에픽과의 추적)

- 에픽 브랜치: `epic/E##-{scope}` (프로젝트 컨벤션에 따름).
- Phase 작업: `feat/E##/P01-{scope}` 등으로 `E##`·`P##` 추적 가능하게 유지.

## 관련 문서

- [백로그 관리](../backlog/README.md)
- [아카이브된 이슈](../backlog/archive/)
