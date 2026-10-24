# Hotfix 기록 작성 규칙

이 디렉터리는 과거의 긴급 장애 수정 근거를 보존한다. Hotfix 기록은 **현재 코드·Product/Dev 계약보다 우선하지 않는다.**

## 작성

- 파일명: `YYYY-MM-DD_<short-slug>.md`
- 해당 시점의 증상, 재현 조건, 확인된 원인, 변경 범위, 검증 결과, 운영 조치 및 잔여 위험을 기록한다.
- 완료나 재발 방지 여부는 당시 확보한 증거와 구분해 작성한다.
- 이후 확정된 지속적인 기술 계약은 [Dev](../dev/README.md)에 반영한다.
- 새로 계획되는 변경은 [Workflow](../workflow/README.md)의 Brief/Epic 분류를 따른다.

기존 Hotfix 목록이나 과거 Epic 목록을 README에 복제하지 않는다. 과거 `archive/` 문서는 명시적 요청 없이는 열람하지 않는다.
