# Epic: infrastructure-as-code

## 목표

현재 수동으로 관리되는 AWS 및 GCP 인프라를 Terraform으로 코드화하여,
디버깅 환경의 빠른 생성/삭제, 인프라 변경 이력 추적, 환경 일관성 보장을 실현한다.

## 배경 / 맥락

### 현재 상황
- **멀티 클라우드 환경**
  - AWS: Frontend (S3, CloudFront, Route53, ACM)
  - GCP: Backend (Cloud Run, Container Registry, BigQuery)
  - 외부: Railway (PostgreSQL, Redis), Cloudinary

- **관리 방식**
  - 콘솔 수동 생성/수정
  - 변경 이력 없음
  - 환경 재현 어려움

### 문제점
1. **디버깅 환경 부재**: 버그 재현을 위한 임시 환경 생성이 번거로움
2. **문서화 부족**: 실제 리소스 ID/ARN이 코드에 없음
3. **드리프트 위험**: 콘솔 수동 변경으로 인한 환경 불일치
4. **협업 어려움**: 팀원이 동일 환경을 구축하기 어려움

### 해결 목표
- Terraform으로 인프라 코드화 (IaC)
- 디버깅용 환경을 5분 내 생성/삭제
- Git으로 인프라 변경 이력 관리
- 환경별 (production, staging, debug) 일관성 보장

## 특이점

- **멀티 클라우드**: AWS + GCP 동시 관리 필요
- **기존 리소스 활용**: Import를 통한 마이그레이션 (재생성 없음)
- **비용 최적화**: 디버깅 환경은 사용 후 즉시 삭제 가능
- **보안 중시**: `.tfstate` 파일은 S3 backend 사용, 민감 정보는 Git 제외

## Phase 목록

- [P01: 인프라 분석 및 문서화](./P01-infrastructure-analysis.md) ✅
- [P02: Terraform 환경 구축](./P02-terraform-setup.md) ✅
- [P03: AWS 인프라 Terraform 코드 작성](./P03-aws-terraform.md) ✅
- [P04: GCP 인프라 Terraform 코드 작성](./P04-gcp-terraform.md) ✅ (BigQuery 제외)
- [P05: 디버깅 환경 자동화 스크립트](./P05-debug-automation.md) ✅

## 상태

- **시작일**: 2026-04-02
- **현재 Phase**: P01~P05 코드·문서 기준 완료 (클라우드에서의 최종 스모크는 팀 검증)
- **예상 완료**: 2026-04-09 (1주)

## 실행 전략 결정 (2026-04-02)

- **선택 전략**: A (빠른 이행형)
- **선택 배경**:
  - IAM / Secret / Policy는 현재 운영 기준에서 안정적으로 관리 중
  - 현재 병목은 보안 체계가 아닌 IaC 코드화 속도와 재현성 확보
- **실행 원칙**:
  1. P02 최소 기반을 먼저 완성하고 즉시 import 작업 착수
  2. AWS 핵심 리소스(Route53, ACM, S3, CloudFront)를 우선 코드화
  3. 각 단계에서 `terraform plan`으로 변경 영향 최소화 및 드리프트 점검
  4. 디버그 환경 자동화는 후순위가 아닌 병행 마감 대상으로 관리

## 착수 게이트

아래 항목이 충족되면 본격 적용(Import/Plan) 단계로 진행한다.

- [x] 환경별 backend state key 분리 완료 (production, staging, debug)
- [x] S3 backend + DynamoDB lock 정상 동작 확인
- [x] `terraform init` / `terraform validate` 성공
- [x] 민감 정보(`terraform.tfvars`, state, private 문서) Git 제외 재확인

## 완료 기준

### Phase 1: 인프라 분석 ✅
- [x] AWS CLI 및 GCP CLI 연결 확인
- [x] 전체 리소스 스캔 (Route53, S3, CloudFront, Cloud Run 등)
- [x] 인프라 인벤토리 문서 작성 (공개/비공개 버전)
- [x] `.gitignore` 설정 (민감 정보 제외)

### Phase 2: Terraform 환경 구축 ✅
- [x] Terraform 설치 및 검증
- [x] 프로젝트 디렉토리 구조 생성
- [x] S3 backend 설정 (State 원격 저장)
- [x] Provider 설정 (AWS, GCP)

### Phase 3: AWS 인프라 Terraform 코드 ✅
- [x] Route53 모듈 (Hosted Zone, Records)
- [x] ACM 모듈 (SSL Certificates)
- [x] S3 + CloudFront 모듈 (Frontend)
- [x] IAM 모듈 (Policies, Users)
- [x] 기존 리소스 Import

### Phase 4: GCP 인프라 Terraform 코드 ✅ (BigQuery 제외)
- [x] Cloud Run 모듈 (Backend Services)
- [x] Container Registry 모듈
- [ ] BigQuery 모듈 (Cost Analysis)
- [x] IAM 모듈 (Service Accounts)
- [x] 기존 리소스 Import

### Phase 5: 자동화 스크립트 ✅
- [x] 디버깅 환경 생성 스크립트 (`scripts/setup-debug-env.ps1`, `scripts/setup-debug-env.sh`)
- [x] 디버깅 환경 삭제 스크립트 (`scripts/teardown-debug-env.ps1`, `scripts/teardown-debug-env.sh`)
- [ ] CI/CD 통합 (GitHub Actions) — 선택
- [x] 사용자 가이드 — [P05-debug-automation.md](./P05-debug-automation.md)

## 성공 지표

1. **재현성**: 디버깅 환경을 5분 내 생성 가능
2. **일관성**: `terraform plan`으로 드리프트 0건
3. **문서화**: 모든 리소스가 코드로 정의됨
4. **비용 절감**: 불필요한 디버깅 환경 즉시 삭제로 월 $10 절감

## 리스크 및 고려사항

### 리스크
1. **State 파일 손상**: S3 versioning으로 대응
2. **Import 실패**: 리소스별 수동 검증 필요
3. **학습 곡선**: Terraform HCL 문법 익히기

### 완화 방안
1. **점진적 도입**: 중요도 낮은 리소스부터 시작
2. **백업**: Import 전 현재 설정 스크린샷 저장
3. **검증**: `terraform plan`으로 변경사항 사전 확인

## 참조 문서

- [인프라 인벤토리 (공개)](../../technical/infrastructure/inventory.md)
- [인프라 인벤토리 (비공개)](../../technical/infrastructure/inventory.private.md)
- [인프라 아키텍처](../../technical/infrastructure/README.md)

## 관련 이슈

- 디버깅 환경 부재로 인한 버그 재현 어려움
- 인프라 변경 시 문서 업데이트 누락
- 콘솔 수동 변경으로 인한 설정 드리프트

## 회고 (완료 후 작성)

- TBD

---

**담당자**: Infrastructure Team
**우선순위**: High
**예상 기간**: 1주 (2026-04-02 ~ 2026-04-09)
