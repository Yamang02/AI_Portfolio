# 배포 Q&A

이 문서는 AI 포트폴리오 프로젝트의 배포와 관련된 주요 질문과 답변을 포함합니다.

---

### Q: 현재 배포 환경은 어떻게 구성되어 있나요?

> 멀티 환경 배포 전략을 사용합니다:
> 
> **환경 구성**:
> - **Development**: 로컬 Docker Compose
> - **Staging**: Railway (staging 브랜치)
> - **Production**: Railway (main 브랜치)
> 
> **서비스 분리**:
> - **Frontend**: Vite + React
> - **Backend**: Spring Boot + PostgreSQL
> - **AI Service**: Python FastAPI + Qdrant + Redis

---

### Q: Railway를 선택한 이유는?

> 1. **간편성**: GitHub 연동 자동 배포
> 2. **비용**: 스타트업 친화적 가격 정책
> 3. **데이터베이스**: PostgreSQL, Redis 매니지드 서비스
> 4. **모니터링**: 기본 로그 및 메트릭 제공
> 5. **환경 분리**: 브랜치별 환경 자동 구성

---

### Q: CI/CD 파이프라인은?

> GitHub Actions 기반 자동화:
> 
> **배포 단계**:
> 1. **코드 푸시** → GitHub
> 2. **자동 빌드** → Docker 이미지 생성
> 3. **테스트 실행** → 단위/통합 테스트
> 4. **배포** → Railway 환경별 배포
> 5. **헬스체크** → 서비스 정상 동작 확인

---

### Q: Docker 구성은 어떻게 되어 있나요?

> 멀티 컨테이너 아키텍처로 구성되어 있습니다:
> 
> **개발 환경**:
> - frontend: React + Vite (포트 5173)
> - backend: Spring Boot (포트 8080)
> - ai-service: FastAPI (포트 8081)
> - postgres: 개발용 데이터베이스
> - redis: 캐시 서버
> - qdrant: 벡터 데이터베이스

---

### Q: 환경 변수는 어떻게 관리하나요?

> 환경별 계층화된 구조로 관리합니다:
> 
> **Backend (Spring Boot)**:
> - application.yml: 기본 설정
> - application-staging.yml: 스테이징 환경
> - application-production.yml: 프로덕션 환경
> 
> **AI Service**:
> - 환경변수로 API 키 및 연결 정보 관리
> - Railway 시크릿 관리 기능 활용

---

### Q: 보안 조치와 모니터링은 어떻게 하나요?

> **API 보안**:
> - CORS 정책 설정
> - Rate Limiting (IP별 요청 제한)
> - Input Validation (XSS, SQL Injection 방지)
> - API 키 서버사이드 관리
> 
> **모니터링**:
> - Spring Boot Actuator (헬스체크)
> - Railway 대시보드 활용
> - 애플리케이션 로그 수집
> - 오류율 및 성능 메트릭 추적