# Epic E21: domain-infra-cleanup-yamang02

## 목표

- AI Portfolio 인프라가 `yamang02.com` 도메인만 사용하며, `yamangsolution.com` 관련 alias·인증서가 AWS에 하나도 남아있지 않다.
- CloudFront 4개 배포의 alias와 ACM 인증서가 실제 서비스 역할에 맞게 정렬되어 있다.
- `staging.admin.yamang02.com` Route53 레코드가 CF alias와 일치하여 staging admin에 정상 접근된다.
- Terraform 코드가 실제 AWS 상태를 완전히 반영하며, 수동 생성 배포 2개(E22O2QL7DWQJDY, E2KRLTT5DRFTUA)가 state에 import된다.
- Cloudflare `yamangsolution.com` DNS에서 CloudFront를 가리키는 구 레코드가 제거된다.

## 배경 / 맥락

### 현재 상태

- `yamangsolution.com`은 YamangSolution 비즈니스 페이지로 완전히 이전되었고, AI Portfolio는 `yamang02.com`으로 분리 완료 예정.
- 그러나 AWS에는 과거 마이그레이션 중간 상태가 남아있다:
  - CF E384L5ALEPZ14U(production admin): `yamangsolution.com`, `www.yamangsolution.com` alias 잔존
  - CF E7KKBCETIHDH6(staging admin): `staging.yamangsolution.com` alias 잔존
  - ACM 인증서 8개 중 5개가 `yamangsolution.com` 관련 (중복·미사용 포함)
  - Route53 `admin.staging.yamang02.com` A record가 CF alias `staging.admin.yamang02.com`과 순서 불일치 → staging admin 접근 불가
- Terraform 코드는 production을 `yamangsolution.com` 기준으로 기술하고 있어 실제 상태와 괴리.
- 수동 생성 CF 배포 2개(profile production, profile staging)가 Terraform state 밖에 존재.

### 문제

- `yamangsolution.com` alias가 CF에 남아있어 YamangSolution 비즈니스 페이지 인프라와 충돌 위험.
- staging admin(`staging.admin.yamang02.com`)이 Route53 레코드 불일치로 실제 불통.
- Terraform drift로 인해 인프라 변경 시 예측 불가능한 plan 결과 발생.

## 특이점

- **CloudFront alias 제거 전 인증서 교체 순서 필수**: CF는 alias와 인증서가 함께 유효해야 배포 업데이트가 성공함. `*.yamang02.com` wildcard cert(f3d39247)가 이미 ISSUED 상태이므로 이를 활용.
- **staging admin 레코드 수정이 P01 긴급 처리**: alias 불일치로 현재 접근 불가 상태.
- **Terraform import 대상**: E22O2QL7DWQJDY(profile prod), E2KRLTT5DRFTUA(profile staging) — 이 두 배포는 별도 S3 origin(`ai-portfolio-profile-*`)을 사용하므로 기존 모듈과 구분.
- **Cloudflare 작업은 콘솔 수작업**: Terraform Cloudflare provider가 현재 미설정이므로 P06은 콘솔 가이드로 처리.
- **yamangsolution.com Route53 zone 없음**: 이미 Cloudflare가 권한 DNS 전담 중. AWS 쪽 추가 작업 불필요.

## Phase 목록

- [P01: staging-admin-route53-fix](./P01.staging-admin-route53-fix.md)
- [P02: production-cf-alias-and-cert-cleanup](./P02.production-cf-alias-and-cert-cleanup.md)
- [P03: staging-cf-alias-and-cert-cleanup](./P03.staging-cf-alias-and-cert-cleanup.md)
- [P04: acm-cert-delete](./P04.acm-cert-delete.md)
- [P05: terraform-state-sync](./P05.terraform-state-sync.md)
- [P06: cloudflare-dns-cleanup](./P06.cloudflare-dns-cleanup.md)
- [P07: production-cloudsql-create](./P07.production-cloudsql-create.md)
- [P08: production-db-migration-railway-to-cloudsql](./P08.production-db-migration-railway-to-cloudsql.md)

## 특이점 추가

- **production DB**: YamangSolution 비즈니스 페이지 런칭으로 Railway → Cloud SQL 이전 결정. `yamangsolution.com` CORS는 유지 — 솔루션 프론트엔드도 이 백엔드를 공유함.
- **CORS**: `yamangsolution.com`, `www.yamangsolution.com` 허용 유지. YamangSolution 비즈니스 페이지가 AI Portfolio 백엔드를 호출함.

## 상태

- [x] P01 완료
- [x] P02 완료
- [x] P03 완료
- [x] P04 완료
- [ ] P05 완료 — 코드 변경 완료, terraform import·plan은 로컬에서 실행 필요
- [ ] P06 완료
- [x] P07 완료
- [x] P08 완료
