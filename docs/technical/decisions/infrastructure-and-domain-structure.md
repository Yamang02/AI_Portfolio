# 결정사항: 인프라 및 도메인 구조 현황
**날짜**: 2026-04-12
**결정 유형**: 인프라/아키텍처
**영향도**: 높음
**상태**: 현황 기록, 정비 예정

---

## 도메인 구조

```
yamang02.com                ← 이정준 개인 허브 (중앙 페이지)
├── portfolio.yamang02.com  ← 개발자 포트폴리오 (미래, frontend에서 분리 예정)
└── design.yamang02.com     ← YamangDesign 디자인 갤러리 (운영 중)

yamangsolution.com          ← 야망솔루션 비즈니스 사이트 (리뉴얼 예정)
```

---

## 인프라 현황

### 레포 구조와 도메인 매핑

| 디렉토리 | 도메인 | 형태 | 상태 |
|---|---|---|---|
| `profile/` | yamang02.com | 순수 HTML 정적 페이지 | 운영 중 |
| `frontend/` | yamangsolution.com | React SPA | 운영 중, 리뉴얼 예정 |
| `backend/` | api.yamangsolution.com | Spring Boot | GCP Cloud Run |

### 서비스별 인프라

```
AWS S3 + CloudFront
├── yamang02.com       ← profile/ 빌드 서빙
└── yamangsolution.com ← frontend/ 빌드 서빙

GCP Cloud Run
├── Spring Boot (백엔드 API)
└── FastAPI (AI 서비스)

Railway
└── PostgreSQL

Cloudflare
├── yamangsolution.com 도메인 구매/DNS 관리
└── Tunnel (로컬 LLM 연결 예정 - 미완)
```

---

## 정비 과제

### 단기
- `frontend/` → `portfolio.yamang02.com` 분리 (브랜딩, DB 재설계 완료 후)
- yamangsolution.com 비즈니스 사이트 새로 구축

### 중기
- Railway PostgreSQL → GCP Cloud SQL 통합
  - 이유: 관리 포인트 축소, GCP 내 네트워크 레이턴시 개선, 고정 비용 절감

### 장기
- Cloudflare Tunnel + 로컬 LLM 연결 완성
  - FastAPI 대체 또는 병행 운영 가능
  - GCP FastAPI 비용 절감 가능

---

## 보류 이유

사이트 분리 및 인프라 정비는 DB/시스템 구조 재설계가 선행되어야 함.
브랜드/도메인 구조 확정 → DB 재설계 → 인프라 정비 순서로 진행.

---

## 관련 문서

- [야망솔루션 사이트 구조 및 사업 방향](./yamangsolution-site-architecture.md)
