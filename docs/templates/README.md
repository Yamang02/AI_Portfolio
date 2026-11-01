# Documentation templates

템플릿은 **문서 작성의 출발점**이며 Product/Dev SSOT나 스킬을 대체하지 않는다. 작성 작업의 책임은 `.agents/skills/`의 해당 스킬이 갖는다.

| 템플릿 | 사용처 | 선택 기준 |
|---|---|---|
| [Brief](./brief.md) | `docs/workflow/briefs/` | 범위가 좁고 단일 작업으로 검증 가능 |
| [Epic README](./epic-readme.md) | `docs/epic/E##.YYYY-MM-DD_<name>/Readme.md` | 여러 Phase로 나뉘는 변경 |
| [Epic Phase](./epic-phase.md) | `docs/epic/E##.YYYY-MM-DD_<name>/P##.<name>.md` | 독립 검증 가능한 작업 단위 |
| [Bug report](./bug_report.md) | `docs/issues/` | 결함 조사 증거 |
| [Basic issue](./basic_issue.md) | `docs/issues/` | 이슈 조사 |
| [Feature request](./feature_request.md) | 백로그 승격 전 참고 | 신규 기능 제안 |
| [Epic retrospective](./epic-retrospective-template.md) | 필요 시 회고 | 선택 문서 |

`documentation-changelog-template.md`는 레거시 참고용이다. 현행 문서에 변경 이력을 매번 중복 기재하지 않고 Git 기록을 사용한다.

## 사용 원칙

- 설계가 미확정이면 `creative-design-brainstorm`, 실행 가능한 작업 분해는 `implementation-plan-authoring`, 생명주기는 `epic-lifecycle`을 따른다.
- Epic README와 Phase는 각기 다른 범위를 소유하며 같은 설계를 복제하지 않는다.
- 실제 Task에 적용되지 않는 선택 항목은 삭제한다. 템플릿의 모든 제목을 강제하지 않는다.
- 완료 체크는 검증 증거가 있을 때만 표시한다.
- 활성 SSOT에 속할 규칙을 작업 문서에만 남기지 않는다.
- 문서 작성만을 위한 별도 스킬은 만들지 않는다. 기존 스킬이 템플릿을 필요할 때 참조한다.
