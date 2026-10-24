# Epic 작성 규칙

단계적 설계·구현·통합 검증이 필요한 **활성 Epic 폴더**만 이 디렉터리에 둔다.

## 구조

```text
docs/epic/
  README.md
  E##.YYYY-MM-DD_<epic-name>/
    Readme.md
    P##.<phase-name>.md    # 독립 단계가 필요할 때만
  archive/                 # 과거 작업, 평소 탐색 제외
```

- **활성 Epic 목록은 `docs/epic/` 바로 아래의 `E##.*` 폴더 자체다.** README에 에픽 목록·완료 내역·진행률을 복제하지 않는다.
- 새 Epic의 번호는 현재 활성 폴더의 번호를 기준으로 제안하되 기존 번호와 중복되지 않게 확인한다. 특별한 과거 조사 요구 없이 archive 문서 내용을 읽지 않는다.
- 각 Epic의 `Readme.md`는 목표, 범위, 책임·계약, 승인된 설계, 완료 조건, Phase 간 의존성을 소유한다.
- Phase가 필요한 경우 독립적으로 검증 가능한 작업 단위로 분리하며 각 Phase 파일에 Tasks·Acceptance·검증 증거를 기록한다. 모든 Epic에 Phase를 기계적으로 요구하지 않는다.
- 생성할 때는 [Epic 템플릿](../templates/epic-readme.md)과 [Phase 템플릿](../templates/epic-phase.md)을 필요에 따라 사용한다.

## 경계

- 좁은 단일 작업은 [Brief](../workflow/briefs/README.md)로 분류한다.
- 작업으로 확정된 제품·개발 규칙을 이곳에만 남기지 말고 Product/Dev SSOT로 넘긴다.
- 구현·완료 체크박스는 실제 증거를 확인한 후에만 갱신한다.
- 아카이빙은 사용자 명시적 요청에서만 수행한다. 폴더 전체를 `archive/`로 이동하고 미완료·미검증 상태를 보존한다.
- **명시적 과거 조회·아카이브 작업이 아닌 한 `archive/` 내부 문서는 탐색하지 않는다.**
