# Epic E16: infra-audit-and-domain-strategy

## 목표

- 실제 운영 중인 인프라(CloudFront aliases, DNS records, Cloud Run custom domain, CORS)의 실제 상태를 감사하고, `decisions/D01.infrastructure-domain-source-of-truth.md`에 검증된 값으로 업데이트한다.
- 도메인 전략을 **Option B(단계적 분리, 과도기 운영 포함)**로 확정하고, 모든 관련 결정 문서를 single source of truth 기준으로 정렬한다.
- Staging CORS 불일치(`staging.yamangsolution.com` vs `staging.yamang02.com`)를 확인하고, 실제 설정과 CORS 허용 origin을 일치시킨다.
- 현재 수동 관리 중인 AWS/GCP 리소스의 Terraform 초안을 작성해 IaC 전환 기반을 마련한다.

## 배경 / 맥락

### 현재 상태

- `decisions/D01.infrastructure-domain-source-of-truth.md`에 as-is 현황이 정리되어 있으나, 실제 인프라와의 정합성이 검증되지 않은 상태다.
- 문서 간 도메인 전략이 충돌한다: `decisions/D02.infrastructure-and-domain-structure.md`와 `decisions/D03.yamangsolution-site-architecture.md`는 `portfolio.yamang02.com`으로의 이전을 전제하지만, 실제 Production CORS와 배포 워크플로우는 `yamangsolution.com`을 기준으로 운영된다.
- Staging 환경의 CloudFront alias가 `staging.yamang02.com`인지 `staging.yamangsolution.com`인지 확인되지 않아 CORS 에러 잠재 위험이 있다.
- `decisions/D04.technical-portfolio-schema-design.md`의 `project_visibility.site` 필드 설계가 도메인 전략 미확정으로 중단된 상태다.

### 문제

- 인프라 상태가 문서와 다를 경우, 새 feature 개발 시 도메인 기준이 불명확해 배포/CORS 이슈로 이어진다.
- 도메인 전략이 확정되지 않으면 DB 스키마 설계(`decisions/D04.technical-portfolio-schema-design.md`)를 재개할 수 없다.
- 수동 관리 인프라는 변경 이력이 없어 재현이 어렵다.

## 특이점

- **감사 우선**: P01 감사 결과 없이 도메인 전략을 결정할 수 없다. P01이 P02의 선행 조건이다.
- **Option B 기본 가정**: `yamangsolution.com`은 최종적으로 비즈니스 전용으로 전환한다. 단, 비즈니스 사이트가 준비되기 전까지는 `www.yamangsolution.com`에서 현재 포트폴리오를 임시 운영한다.
- **과도기 원칙**: "목표 상태(비즈니스 전용)"와 "현재 운영 상태(포트폴리오 임시 운영)"를 동시에 문서화하고, 컷오버 전까지는 DNS/CORS/리디렉션 변경을 보류한다.
- **Terraform 범위 제한**: P03에서 작성하는 Terraform은 현재 리소스를 import하는 초안 수준이며, 실제 인프라를 변경하지 않는다. 인프라 변경은 별도 에픽으로 분리한다.
- **`D04.technical-portfolio-schema-design.md` 재개**: 도메인 전략 확정(P02) 후 해당 문서의 `project_visibility` 필드 설계를 재개한다. 이 에픽의 범위는 아니지만 P02 완료가 전제 조건이다.

## 문서 관리 원칙

- E16에서 확정된 결정사항은 `docs/technical/decisions/`에 남기지 않고, 이 에픽 내부 `decisions/` 디렉토리에서 관리한다.
- 본 에픽 종료 시 최종 운영 문서는 에픽 결과물 기준으로 유지한다.
- **E14 연관**: E14에서 `yamang02.com → profile`, `yamangsolution.com → frontend` 배포 경계가 결정되었다. E16은 이 현재 상태를 감사하면서, `yamangsolution.com` 비즈니스 전용 전환을 위한 단계적 분리 전략(Option B)을 확정한다.

## Phase 목록

- [P01: infra-audit](./P01.infra-audit.md)
- [P02: domain-strategy-decision-and-doc-alignment](./P02.domain-strategy-decision-and-doc-alignment.md)
- [P03: infra-cleanup-and-terraform-draft](./P03.infra-cleanup-and-terraform-draft.md)

## 결정 문서 (에픽 내부)

- [D01: infrastructure-domain-source-of-truth](./decisions/D01.infrastructure-domain-source-of-truth.md)
- [D02: infrastructure-and-domain-structure](./decisions/D02.infrastructure-and-domain-structure.md)
- [D03: yamangsolution-site-architecture](./decisions/D03.yamangsolution-site-architecture.md)
- [D04: technical-portfolio-schema-design](./decisions/D04.technical-portfolio-schema-design.md)

## 상태

- [x] P01 완료
- [x] P02 완료
- [x] P03 완료
