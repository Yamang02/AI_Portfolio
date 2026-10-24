# AI_Portfolio 문서 안내

현재 적용할 규칙과 실제 구현은 **Product / Dev / Code**에서 확인한다. 과거 조사·실행 기록은 현행 규칙을 대신하지 않는다.

## 현재 작업에 필요한 문서

| 영역 | 용도 |
|---|---|
| [Product](./product/README.md) | 제품 개념·사용자 동작·보장 |
| [Dev](./dev/README.md) | 개발 아키텍처·기술 계약·Frontend/Backend 컨벤션 |
| [Workflow](./workflow/README.md) | Brief/Epic/Backlog 선택과 작업 운영 원칙 |
| [활성 Epic](./epic/README.md) | 작성 규칙; 실제 활성 목록은 `epic/E##.*` 폴더 자체 |
| [활성 Brief](./workflow/briefs/README.md) | 작성 규칙; 실제 활성 목록은 Brief 파일 자체 |
| [Backlog](./backlog.md) | 아직 Brief/Epic으로 승격하지 않은 문제 |
| [Templates](./templates/README.md) | 새 문서 작성 시 선택적으로 활용 |

## 필요할 때만 읽는 자료

| 영역 | 성격 |
|---|---|
| [Technical](./technical/README.md) | 기술 설명·예제·과거 설계·운영 참고자료; 이관 대상 아님 |
| [SonarQube 품질 기준](./basis/quality/SQ-01-local-sonarqube-workflow.md) | 로컬 SonarQube 운영·품질 정책 |
| [Issues](./issues/README.md) | 과거 조사와 문제 분석·SonarQube 스냅샷; 현재 상태로 단정하지 않음 |
| [Hotfixes](./hotfixes/README.md) | 과거 긴급 수정 기록; 현재 구현의 권위 아님 |
| [Profile 배포 참고 기록](./ref/profile-deploy-and-domain-split.md) | 분리 배포 및 도메인 변경 관련 기술 블로그 초안 |
| [Archive](./epic/README.md) | 과거 Epic/Brief 기록; 명시적 요청이 없으면 내부 검색·열람 금지 |

## 운영 원칙

- **코드**는 현재 구현 상태의 근거이며, 기존 문서는 실제 코드와 대조한다.
- **Product/Dev**가 현재의 지속적인 규칙을 소유한다. Workflow는 앞으로 할 일과 실행 근거를 소유한다.
- Brief/Epic 디렉터리 README에는 작성 규칙만 둔다. 완료·진행 목록을 수동 복제하지 않는다.
- `archive/`는 명시적 과거 조사·복구·아카이빙 요청이 없는 한 탐색하지 않는다.
- 참고자료를 단지 오래되었거나 폴더가 다르다는 이유로 이동·삭제하지 않는다.
