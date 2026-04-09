# P01: 인프라 분석 및 문서화

**상태**: ✅ 완료
**담당**: Infrastructure Team
**완료일**: 2026-04-02

## 목표

현재 사용 중인 모든 AWS 및 GCP 인프라 리소스를 파악하고,
Terraform 마이그레이션을 위한 기초 자료를 문서화한다.

## 작업 내용

### 1. CLI 환경 설정 ✅
- [x] AWS CLI 인증 설정
- [x] GCP CLI 인증 설정
- [x] 자격증명 만료 문제 해결

### 2. 인프라 리소스 스캔 ✅

#### AWS 리소스 확인
- [x] Route53 (Hosted Zone, DNS Records)
- [x] ACM (SSL Certificates)
- [x] S3 (Frontend Buckets)
- [x] CloudFront (CDN Distributions)
- [x] IAM (Policies, Users)
- [x] VPC (Network)

#### GCP 리소스 확인
- [x] Cloud Run (Backend Services)
- [x] Container Registry (Docker Images)
- [x] Artifact Registry
- [x] BigQuery (Cost Analysis)
- [x] IAM (Service Accounts)
- [x] Logging (Log Sinks)

### 3. 문서화 ✅
- [x] 공개 인벤토리 작성 (`docs/technical/infrastructure/inventory.md`)
- [x] 비공개 인벤토리 작성 (실제 ID/ARN 포함)
- [x] 아키텍처 다이어그램 (`docs/technical/infrastructure/README.md`)

### 4. 보안 설정 ✅
- [x] `.gitignore` 업데이트
  - `*.tfstate`, `terraform.tfvars` 제외
  - `*.private.md` 패턴 제외
  - Terraform 관련 파일 제외
- [x] 민감 정보 제외 검증

## 발견된 리소스 요약

### AWS (Total: 13개 주요 리소스)
| 카테고리 | 개수 | 비고 |
|---------|------|------|
| Route53 Hosted Zone | 1 | yamang02.com |
| Route53 Records | 11 | A, AAAA, CNAME, TXT |
| ACM Certificates | 2 | yamang02.com, *.yamang02.com |
| S3 Buckets | 2 | production, staging |
| CloudFront Distributions | 2 | production, staging |
| IAM Policies | 2 | S3, CloudFront 접근 |
| IAM Users | 5 | admin, github-actions 등 |
| VPC | 1 | Default VPC |

### GCP (Total: 8개 주요 리소스)
| 카테고리 | 개수 | 비고 |
|---------|------|------|
| Cloud Run Services | 2 | production, staging |
| Container Images | 2 | GCR |
| Artifact Registry | 1 | 14.6GB |
| BigQuery Dataset | 1 | billing_export |
| Service Accounts | 1 | github-actions |
| Log Sinks | 2 | 자동 생성 |

## 주요 발견사항

### 중요 리소스
1. **Route53 + ACM**: 도메인 및 SSL 관리 (IaC 필수)
2. **CloudFront**: CDN 설정 복잡 (Origin, Cache 정책)
3. **Cloud Run**: 환경변수 다수 (Secret 관리 필요)

### 잠재적 문제
1. **Default VPC 사용**: 커스텀 VPC 없음 (현재는 문제없음)
2. **IAM 사용자 5명**: 불필요한 사용자 정리 검토 필요
3. **Container Registry 14.6GB**: 이전 이미지 정리 검토

## 다음 Phase 준비사항

### P02 (Terraform 환경 구축)를 위한 체크리스트
- [ ] Terraform 설치
- [ ] AWS S3 버킷 생성 (State 저장용)
- [ ] DynamoDB 테이블 생성 (Lock용)
- [ ] `inventory.private.md`의 리소스 ID 참조

## 참조 문서

- [인프라 인벤토리 (공개)](../../technical/infrastructure/inventory.md)
- [인프라 인벤토리 (비공개)](../../technical/infrastructure/inventory.private.md)
- [인프라 README](../../technical/infrastructure/README.md)

## 완료 기준

- [x] 모든 리소스 타입 식별
- [x] 실제 리소스 ID/ARN 수집
- [x] 공개/비공개 문서 분리
- [x] `.gitignore` 설정 완료

---

**완료일**: 2026-04-02
**다음 Phase**: [P02: Terraform 환경 구축](./P02-terraform-setup.md)
