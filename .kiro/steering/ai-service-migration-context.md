---
inclusion: manual
---

# AI 서비스 마이그레이션 프로젝트 컨텍스트

## 프로젝트 개요
현재 Spring Boot 백엔드에 통합된 챗봇 기능을 독립적인 Python AI 서비스로 분리하고, RAG 기반 벡터 DB와 자동 업데이트 파이프라인을 구현하는 프로젝트입니다.

## 기술 스택 결정사항
- **Python AI 서비스**: FastAPI + LangChain + LangSmith
- **벡터 데이터베이스**: Qdrant Cloud (Free Tier)
- **캐시 시스템**: Redis
- **모니터링**: LangSmith (AI 트레이싱) + Spring Actuator
- **임베딩 모델**: sentence-transformers (한국어 지원)

## 아키텍처 원칙
1. **백엔드 중심 오케스트레이션**: Spring Boot가 모든 요청의 단일 진입점
2. **계층화된 데이터**: PostgreSQL(기본 데이터) + 벡터 DB(AI 강화 데이터)
3. **우아한 성능 저하**: AI 서비스 장애 시 PostgreSQL 기반 대체 응답
4. **비용 최적화**: Free Tier 서비스 최대 활용

## 현재 프로젝트 구조
```
AI_Portfolio/
├── frontend/         # React + TypeScript + Vite
├── backend/          # Spring Boot + PostgreSQL
├── ai-service/       # 새로 추가될 Python FastAPI 서비스
└── docs/            # 프로젝트 문서
```

## 개발 우선순위
1. **안정성 우선**: 기존 기능 중단 없이 점진적 마이그레이션
2. **사용자 경험**: AI 서비스 장애 시에도 기본 정보 제공
3. **확장성**: LangGraph 도입을 위한 기반 구조 준비
4. **비용 효율성**: 무료/저비용 서비스 우선 활용

## 참고 파일들
- 요구사항: #[[file:.kiro/specs/ai-service-migration/requirements.md]]
- 설계 문서: #[[file:.kiro/specs/ai-service-migration/design.md]]
- 구현 계획: #[[file:.kiro/specs/ai-service-migration/tasks.md]]
- 현재 백엔드 구조: #[[file:backend/src/main/java/com/aiportfolio/backend]]
- 현재 프론트엔드 구조: #[[file:frontend/src]]

## 중요한 제약사항
- 프론트엔드 API 호환성 유지 (기존 엔드포인트 변경 금지)
- PostgreSQL 데이터가 항상 신뢰할 수 있는 소스
- 개발 환경에서 모든 서비스가 Docker Compose로 실행 가능해야 함
- 배포 시 서비스 중단 시간 최소화