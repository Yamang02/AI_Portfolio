# 배포 전략

## 개요
AI Portfolio 프로젝트의 배포 전략 및 환경 설정 가이드입니다.

## 배포 환경

### Staging 환경 (자동화 우선)
- **전략**: 완전 자동화 + 높은 권한
- **데이터베이스 권한**: postgres 사용자 (DDL 권한 포함)
- **마이그레이션**: CI/CD에서 자동 실행
- **배포 트리거**: staging 브랜치 push 시 자동
- **목적**: 빠른 피드백과 개발 편의성

### Production 환경 (보안 우선)
- **전략**: 수동 배포 + 권한 분리
- **마이그레이션**: postgres 사용자로 수동 실행
- **애플리케이션**: ai_portfolio_app 사용자 (DML만 허용)
- **배포 트리거**: workflow_dispatch (수동 트리거)
- **목적**: 보안 모범 사례와 안정성 확보

## CI/CD 파이프라인

### GitHub Actions
- **자동 배포**: main 브랜치 push 시 자동 배포
- **멀티스테이지 빌드**: 프론트엔드 + 백엔드 통합 컨테이너
- **보안**: GitHub Secrets를 통한 API 키 관리

### Docker 설정
- **멀티스테이지 빌드**: 프론트엔드(Node.js) + 백엔드(Java) 통합
- **단일 컨테이너**: CORS 문제 해결 및 관리 단순화
- **포트 통합**: 포트 8080에서 모든 서비스 제공

## 보안 설정

### 환경 변수 관리
- **API 키**: GitHub Secrets 사용
- **Secret Manager**: 의존성 제거로 배포 단순화
- **프론트엔드**: API 키 번들 노출 금지

### 데이터베이스 권한
```sql
-- 애플리케이션 전용 사용자 생성
CREATE USER ai_portfolio_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE ai_portfolio TO ai_portfolio_app;
GRANT USAGE ON SCHEMA public TO ai_portfolio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ai_portfolio_app;
```

## 배포 플랫폼

### Google Cloud Run
- **서버리스**: 자동 스케일링 및 비용 최적화
- **컨테이너**: Docker 이미지 기반 배포
- **모니터링**: 내장 모니터링 + 커스텀 로깅

### Railway (대안)
- **간편한 배포**: GitHub 연동으로 자동 배포
- **데이터베이스**: PostgreSQL 호스팅 제공
- **SSL**: 자동 SSL 인증서 관리

## 다음 단계
- [GitHub Secrets 설정](./github-secrets-setup.md)
- [Railway 설정](./railway-setup.md)
- [설정 체크리스트](./setup-checklist.md)