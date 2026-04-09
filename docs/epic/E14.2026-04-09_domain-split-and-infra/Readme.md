# Epic E14: domain-split-and-infra

## 목표

- `www.yamang02.com`이 profile 정적 사이트를 서빙한다 (별도 S3 + CloudFront)
- `www.yamangsolution.com`이 기존 frontend React 앱을 서빙한다 (기존 S3 + CloudFront, 도메인만 전환)
- profile 배포 파이프라인(GitHub Actions)이 동작하며, EmailJS 키가 GitHub repository variables에서 빌드 시 주입된다
- 두 도메인 모두 HTTPS가 정상 동작한다

## 배경 / 맥락

### 현재 상태
- `www.yamang02.com` → 기존 frontend React 앱 (AWS S3 + CloudFront)
- `yamangsolution.com` → Cloudflare에서 도메인 보유 중, 미사용
- profile 정적 사이트(`profile/index.html`)는 배포 인프라 없음

### 문제
- 개인 포트폴리오(`yamang02.com`)와 사업체 사이트(`yamangsolution.com`)가 분리되어야 함
- profile 사이트가 배포 파이프라인 없이 로컬에만 존재함
- EmailJS 키 등 민감 설정이 코드에 하드코딩될 위험이 있음

## 특이점

- `yamangsolution.com`은 Cloudflare 관리 도메인 → CloudFront 연결 시 ACM 인증서(us-east-1)를 DNS 검증해야 하며, Cloudflare에서 검증 CNAME을 추가해야 함
- Cloudflare SSL 모드는 **Full** 사용 (CloudFront origin에 HTTPS 필요)
- 기존 frontend CloudFront distribution에 alternate domain(`www.yamangsolution.com`) 추가 방식으로 진행 — 새 인프라 생성 최소화
- profile 빌드는 `profile/vite.config.ts` 기준 Vite 빌드; EmailJS config는 `profile/src/emailjs-config.ts`에서 `import.meta.env`로 주입
- 모든 AWS 인프라 작업은 AWS CLI로 진행

## Phase 목록

- [P01: profile 인프라 및 배포 파이프라인](./P01.profile-infra-and-pipeline.md)
- [P02: yamangsolution.com 도메인 연결](./P02.yamangsolution-domain-connect.md)

## 상태

- [ ] P01 완료
- [ ] P02 완료
