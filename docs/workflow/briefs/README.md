# Brief 작성 규칙

단일 범위에서 독립적으로 구현·검증할 수 있는 **활성 Brief 파일**만 이 디렉터리에 둔다. 별도의 수동 목록은 관리하지 않는다.

## 파일

- 경로: `docs/workflow/briefs/YYYY-MM-DD-<topic>.md`
- 새 Brief는 [템플릿](../../templates/brief.md)을 기본 출발점으로 사용한다.
- 하나의 파일이 배경·승인된 설계·영향 경계·Tasks·Acceptance·검증 증거·상태를 소유한다.
- 이미 활성 Epic Phase가 소유하는 일을 중복 Brief로 만들지 않는다.
- 여러 영역의 단계적 변경이나 독립 Phase가 필요하면 Epic으로 분류한다.
- 확정된 Product/Dev 규칙은 해당 SSOT로 이관하고 Brief에만 남기지 않는다.

## 상태와 아카이브

- 완료·미완료 상태는 해당 Brief 안의 근거에 따라 갱신한다.
- 이 디렉터리의 `README.md`에 활성 Brief나 완료 Brief의 목록 및 통계를 작성하지 않는다.
- 종료/아카이브는 사용자 명시적 요청이 있을 때만 수행한다.
- 현재 저장소의 Brief 보존 위치는 `docs/epic/archive/brief/`이다. 실제 이동이 요청될 때 대상 경로를 확인한다.
- 아카이브 자료는 명시적으로 요청된 경우 외에는 탐색하지 않는다.
