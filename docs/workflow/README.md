# Workflow 작성 및 운영 규칙

Workflow는 실행 전·실행 중인 작업의 범위와 순서만 소유한다. 현재 제품 규칙은 `docs/product/`, 기술 규칙은 `docs/dev/`, 실제 구현은 코드가 소유한다.

## 활성 작업 위치

| 단위 | 저장 위치 | 활성 목록의 기준 |
|---|---|---|
| Brief | [briefs/](./briefs/) | `README.md`를 제외한 이 디렉터리의 Brief 파일 |
| Epic | [../epic/](../epic/) | `archive/`를 제외한 `E##.*` 디렉터리 |
| Backlog | [../backlog.md](../backlog.md) | 미승격 항목만 기록 |

Brief와 Epic은 선후 단계가 아니라 서로 다른 규모의 작업 단위다. Epic Phase를 별도 Brief로 중복 작성하지 않는다.

## 문서 소유권

- 개별 Brief가 자신의 목표·설계·Tasks·검증·상태를 소유한다.
- 개별 Epic `Readme.md`와 Phase 파일이 목표·실행 조건·검증·상태를 소유한다.
- 각 디렉터리의 `README.md`는 **작성 규칙과 경로 규칙만** 정의한다. 활성·완료·아카이브 목록, 상태 요약, 진행률 표를 수동 유지하지 않는다.
- 작업 결과로 확정된 지속 규칙은 Product/Dev SSOT에 반영한다.

## Archive

- `docs/epic/archive/`는 과거 작업 기록 보존용이다.
- 명시적 과거 조사·복구·대조·아카이빙 요청이 없는 한 archive 내부 문서를 검색하거나 읽지 않는다.
- 완료 후 자동으로 archive를 조사하거나 정리하지 않는다. Brief/Epic 아카이빙은 사용자 명시적 요청에서만 수행한다.
- 아카이빙은 완료의 증거가 아니다. 미완료·미검증 사항은 문서에 보존한다.

## 세부 작성 규칙

- [Brief 작성](./briefs/README.md)
- [Epic 작성](../epic/README.md)
- [Brief 템플릿](../templates/brief.md)
- [Epic 템플릿](../templates/epic-readme.md)
- [Phase 템플릿](../templates/epic-phase.md)
