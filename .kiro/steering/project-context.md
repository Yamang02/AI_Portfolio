---
inclusion: always
---

# AI Portfolio 프로젝트 컨텍스트

## 프로젝트 개요
AI Portfolio Chatbot은 개발자 포트폴리오 사이트에 AI 챗봇을 통합하여, 방문자들이 자연어로 프로젝트에 대해 질문할 수 있도록 하는 웹 애플리케이션입니다.

## 핵심 참고 문서
- 프로젝트 개요: #[[file:docs/portfolio.md]]
- 개발 가이드: #[[file:docs/DEVELOPMENT.md]]
- AI 개발 참고: #[[file:docs/ai/development_refer.md]]
- 대화 로그: #[[file:docs/ai/conversation_log.md]]

## 현재 아키텍처 상태

### 백엔드: 헥사고날 아키텍처 (완성됨)
```
domain/
├── portfolio/               # Portfolio 도메인
│   ├── model/              # 도메인 엔티티 (Project, Experience, Education, Certification)
│   └── port/               # Primary/Secondary Ports
└── chatbot/               # Chatbot 도메인
    ├── model/             # 채팅 관련 모델
    └── port/              # AI 서비스 포트

application/
├── portfolio/             # Portfolio 도메인 Application Layer
├── chatbot/              # Chatbot 도메인 Application Layer
└── common/               # 공통 유틸리티

infrastructure/           # 기술 구현 (어댑터)
├── persistence/         # PostgreSQL 어댑터
├── external/           # 외부 API 어댑터 (Gemini, GitHub)
└── web/               # 웹 어댑터
```

### 프론트엔드: FSD (Feature-Sliced Design)
```
src/
├── app/          # 애플리케이션 레이어 - 전역 설정, Provider
├── entities/     # 엔티티 레이어 - 비즈니스 도메인 모델  
├── features/     # 기능 레이어 - 독립적 기능 단위
└── shared/       # 공유 레이어 - 공통 유틸리티
```

## 기술 스택

### 현재 구현된 스택
- **Frontend**: React 19.1.0, TypeScript, Vite, Tailwind CSS
- **Backend**: Spring Boot 3.x, LangChain4j, Google Gemini API
- **Database**: PostgreSQL (Docker Compose로 구성됨)
- **AI**: Google Gemini API (Gemini 2.5 Flash)
- **Deployment**: Google Cloud Run, Docker

### 계획된 확장 스택
- **Vector DB**: Qdrant Cloud (Free Tier)
- **AI Monitoring**: LangSmith
- **Cache**: Redis
- **AI Framework**: Python FastAPI + LangChain (별도 서비스)

## 데이터 구조

### 현재 데이터 소스
- **PostgreSQL**: 메인 데이터베이스 (Docker Compose)
- **GitHub API**: 동적 프로젝트 정보 (24시간 캐시)
- **JSON 파일**: 로컬 프로젝트 데이터 (resources/data/)

### 데이터베이스 스키마
- **projects**: 프로젝트 정보 (business_id: PJT001, PJT002...)
- **experiences**: 경력 정보 (business_id: EXP001, EXP002...)
- **education**: 교육 정보 (business_id: EDU001, EDU002...)
- **certifications**: 자격증 정보 (business_id: CRT001, CRT002...)

### ID 체계 (이중 ID 시스템)
- **DB 내부 ID**: `id SERIAL PRIMARY KEY` (자동 증가)
- **비즈니스 ID**: `business_id VARCHAR(20)` (PJT001, EXP001 등)
- **도메인 모델**: `String id` → `business_id`와 매핑

## 주요 기능 현황

### ✅ 완성된 기능
1. **AI 챗봇**: Google Gemini API 연동, 프롬프트 엔지니어링
2. **GitHub API 연동**: 동적 프로젝트 정보, 하이브리드 캐싱
3. **프로젝트 타입 구분**: 프로젝트/경험 시각적 구분
4. **히스토리 패널**: 시간순 타임라인 시각화
5. **하이브리드 오류 처리**: 비즈니스 로직 vs 시스템 오류 구분
6. **프롬프트 외부화**: Markdown → JSON 변환 시스템
7. **헥사고날 아키텍처**: 도메인 격리 및 포트-어댑터 패턴

### 🔄 진행 중인 작업
1. **PostgreSQL 완성**: JPA 엔티티 및 Repository 구현
2. **데이터 마이그레이션**: JSON → PostgreSQL 이전

### 📋 계획된 기능
1. **AI 서비스 분리**: Python FastAPI + LangChain
2. **RAG 시스템**: Qdrant Cloud + 벡터 검색
3. **LangSmith 통합**: AI 모니터링 및 분석
4. **캐시 시스템**: Redis 기반 성능 최적화

## 개발 원칙 및 패턴

### 아키텍처 원칙
1. **도메인 격리**: Portfolio ↔ Chatbot 도메인 완전 분리
2. **포트를 통한 격리**: 도메인 간 직접 의존성 제거
3. **의존성 역전**: Domain → Application → Infrastructure 방향
4. **단일 책임 원칙**: 각 서비스의 명확한 역할 분담

### 네이밍 규칙
- **도메인 모델**: `Project`, `Experience` (기존 패턴 유지)
- **JPA 엔티티**: `ProjectJpaEntity` (새로 추가)
- **매퍼**: `ProjectMapper` (변환 로직)
- **Repository**: `PostgresPortfolioRepository` (통합 관리)

### API 설계 패턴
- **성공 응답**: `ApiResponse.success(data, message)`
- **에러 응답**: `ApiResponse.error(message, details)`
- **ResponseType**: 구조화된 응답 타입 시스템
- **하이브리드 오류 처리**: 200 OK + success: false (비즈니스 로직 오류)

## 배포 및 운영

### 현재 배포 환경
- **플랫폼**: Google Cloud Run
- **컨테이너**: Docker 멀티스테이지 빌드
- **CI/CD**: GitHub Actions
- **도메인**: https://ai-portfolio-chatbot-493721639129.asia-northeast3.run.app/

### 환경 설정
- **개발**: 프론트(5173) + 백엔드(8080) 분리
- **프로덕션**: 백엔드(8080) 단일 포트 통합 서빙
- **데이터베이스**: Docker Compose PostgreSQL (로컬)

## 중요한 제약사항

### 기존 호환성 유지
- **프론트엔드 API**: 기존 엔드포인트 변경 금지
- **응답 형식**: 기존 JSON 구조 유지
- **ID 체계**: 비즈니스 ID로 프론트엔드와 통신

### 데이터 신뢰성
- **PostgreSQL 우선**: 항상 신뢰할 수 있는 소스
- **AI 서비스 장애 시**: PostgreSQL 기반 대체 응답
- **데이터 일관성**: 벡터 DB와 PostgreSQL 동기화

### 성능 요구사항
- **응답 시간**: 캐시 히트 < 100ms, AI 생성 < 3000ms
- **가용성**: 99.9% 업타임 목표
- **비용 최적화**: Free Tier 서비스 최대 활용

## 다음 단계 우선순위

### Phase 1: PostgreSQL 완성 (현재)
1. JPA 엔티티 구현 (ProjectJpaEntity, ExperienceJpaEntity 등)
2. Repository 구현체 완성 (실제 PostgreSQL 쿼리)
3. 매퍼 구현 (도메인 ↔ JPA 엔티티 변환)
4. 통합 테스트 및 검증

### Phase 2: AI 서비스 분리
1. Python FastAPI 서비스 구축
2. Qdrant Cloud 연동
3. LangSmith 통합
4. Redis 캐시 시스템

### Phase 3: 고도화
1. RAG 시스템 구현
2. 벡터 검색 최적화
3. LangGraph 확장 준비
4. 성능 모니터링 강화