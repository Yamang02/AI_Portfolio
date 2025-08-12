# AI Portfolio - 개발 참고 가이드

> **목적**: AI Agent가 개발 시 참고할 핵심 원칙, 패턴, 의사결정 맥락을 정리한 문서입니다.
> 
> **업데이트 규칙**: conversation_log에 새로운 개발 내용 추가 시, 이 문서에 반영할 핵심 정보가 있는지 검토 필요

## 📋 AI Agent 행동강령

### 🔍 conversation_log 업데이트 시 필수 검토사항
AI Agent는 conversation_log에 새로운 대화 내용을 추가할 때마다 다음을 반드시 확인해야 합니다:

#### ✅ development_refer.md 업데이트 대상 식별
다음 유형의 내용이 포함된 경우 이 문서에 추가 검토:

1. **🏗️ 아키텍처 결정**
   - 새로운 아키텍처 패턴 도입
   - 기존 구조 변경 및 그 이유
   - 설계 원칙 변경

2. **📋 개발 패턴 확립**
   - 새로운 코딩 패턴 도입
   - API 설계 규칙 변경
   - 타입 정의 방식 개선

3. **🤖 AI 관련 인사이트**
   - 프롬프트 엔지니어링 개선사항
   - RAG/벡터DB 도입 관련 결정
   - AI 모델 연동 방식 변경

4. **⚠️ 중요한 문제 해결**
   - 반복될 수 있는 함정과 해결책
   - 성능/보안 이슈 해결 방법
   - 배포/운영 관련 교훈

5. **🔧 도구 및 라이브러리 결정**
   - 새로운 라이브러리 도입 이유
   - 기존 도구 교체 및 마이그레이션
   - 빌드/배포 도구 변경

#### 📝 업데이트 프로세스
```
1. conversation_log 업데이트 완료 후
2. 위 5개 카테고리에 해당하는 내용 식별
3. development_refer.md의 해당 섹션에 핵심 정보 추가
4. 기존 내용과 중복되거나 outdated된 정보 정리
5. "마지막 업데이트" 날짜 갱신
```

---

## 🏗️ 아키텍처 원칙

### Frontend: FSD (Feature-Sliced Design)
**도입 이유**: 
- 복잡해지는 프론트엔드 구조의 체계적 관리
- 컴포넌트 간 의존성 명확화
- 확장성과 유지보수성 향상

**구조 원칙**:
```
src/
├── app/          # 애플리케이션 레이어 - 전역 설정, Provider
├── entities/     # 엔티티 레이어 - 비즈니스 도메인 모델  
├── features/     # 기능 레이어 - 독립적 기능 단위
└── shared/       # 공유 레이어 - 공통 유틸리티
```

**핵심 규칙**:
- 상위 레이어가 하위 레이어만 의존 (단방향 의존성)
- entities에서 모든 비즈니스 타입 통합 관리
- 각 레이어의 단일 책임 원칙 준수

### Backend: 헥사고날 아키텍처 (완료)
**현재 상태**: 헥사고날 아키텍처 (포트 & 어댑터) ✅
**이전 상태**: 레이어드 아키텍처

**전환 이유**:
- 벡터DB/RAG 도입 시 외부 의존성 추상화 필요
- 다양한 AI 서비스 (Gemini, OpenAI 등) 유연한 교체
- 비즈니스 로직과 인프라 계층 분리
- 테스트 용이성 및 확장성 확보

**완료된 단계**:
1. ✅ Repository 패턴 도입 - ProjectRepository 포트 및 JsonProjectRepository 어댑터
2. ✅ 도메인 서비스 분리 - ChatService, LLMPort, PromptPort, QuestionAnalysisPort
3. ✅ 포트/어댑터 구조 적용 - GeminiLLMAdapter, JsonPromptAdapter, RuleBasedQuestionAnalysisAdapter
4. 🔄 DDD 원칙 적용 (진행 중)

**핵심 구조**:
```
domain/          # 비즈니스 로직 (포트 정의)
├── portfolio/   # 포트폴리오 도메인
└── chat/        # 채팅 도메인

infrastructure/  # 기술 구현 (어댑터)
├── persistence/ # 데이터 저장소 어댑터  
└── ai/          # AI 서비스 어댑터
```

## 📋 개발 패턴 & 규칙

### API 설계 패턴
**ApiResponse 표준화**:
```java
// 성공 응답
ApiResponse.success(data)
ApiResponse.success(data, "커스텀 메시지")

// 에러 응답  
ApiResponse.error("에러 메시지")
ApiResponse.error("메시지", "상세 에러")
```

**에러 처리 전략**:
- 비즈니스 로직 오류: HTTP 200 + success: false
- 시스템 오류: HTTP 4xx/5xx
- 프론트엔드에서 success 필드로 분기 처리

### 타입 정의 규칙
**위치 원칙**:
- **entities/**: 비즈니스 도메인 모델 (Project, Experience 등)
- **shared/types.ts**: entities에서 re-export만
- **features/*/types.ts**: 해당 기능 전용 타입만

**재사용 방식**:
```typescript
// entities에서 정의
export interface Project extends BaseItem { ... }

// shared에서 re-export  
export type { Project } from '../entities';

// features에서 import
import type { Project } from '../../entities';
```

## 🤖 AI 관련 핵심 사항

### 프롬프트 엔지니어링 규칙
**시스템 프롬프트 필수 포함사항**:
- 프로젝트 설명 시 개인/팀 구분 명시
- 팀 프로젝트는 개인 기여도 반드시 설명
- 컨텍스트 생성 시 isTeam/myContributions 정보 포함

**컨텍스트 관리**:
- 프로젝트별 맞춤 컨텍스트 생성
- GitHub API와 로컬 데이터 하이브리드 활용
- 매직 스트링 제거 (예: "I_CANNOT_ANSWER" → null 체크)

### GitHub API 연동 교훈
**핵심 패턴**:
- 24시간 캐시 유효기간 설정
- API 실패 시 로컬 데이터 폴백
- 프로젝트 제목-레포지토리명 매핑 시스템

**주요 함정**:
- 프로젝트명과 GitHub 레포명 불일치 문제
- README 파일 404 에러 처리
- API 호출 최적화 (불필요한 중복 호출 방지)

### RAG 도입 준비 현황
**아키텍처 준비 완료**:
- ✅ Repository 패턴으로 벡터DB 추상화 가능
- ✅ 포트-어댑터 패턴으로 다양한 AI 서비스 지원
- ✅ 도메인-인프라 분리로 비즈니스 로직 독립성 확보
- 🔄 문서 처리 파이프라인 (청킹, 임베딩, 검색) 설계 필요

**다음 단계 구현 예정**:
1. VectorRepository 포트 정의
2. ChromaDB/Pinecone 어댑터 구현
3. DocumentProcessingPort 및 어댑터
4. 하이브리드 검색 서비스 (키워드 + 벡터)

**기술 스택 후보**:
- 벡터DB: Pinecone, Weaviate, ChromaDB
- 임베딩: OpenAI, Cohere, HuggingFace
- 검색 최적화: 하이브리드 검색 (키워드 + 벡터)

## 🚀 배포 & 운영

### Docker 멀티스테이지 패턴
**통합 배포 구조**:
```dockerfile
# 프론트엔드 빌드 → 백엔드에 정적 파일 서빙
# 단일 컨테이너로 CORS 문제 해결
# 포트 8080 통합 사용
```

**핵심 이점**:
- 단일 서비스 관리로 비용 효율성
- CORS 문제 자연 해결
- 배포 복잡성 감소

### 환경 변수 관리
**보안 원칙**:
- API 키는 GitHub Secrets 사용
- Secret Manager 의존성 제거로 배포 단순화
- 프론트엔드 번들에 API 키 노출 금지

**설정 패턴**:
- 개발: 프론트(5173) + 백엔드(8080) 분리
- 프로덕션: 백엔드(8080) 단일 포트
- 상대 경로 API 호출로 환경 무관 동작

### CI/CD 파이프라인
**GitHub Actions 구조**:
- Eclipse Temurin 이미지 사용
- npm workspaces 제거로 빌드 안정성 확보
- 단계별 작업 디렉토리 명시

## ⚠️ 주요 함정과 해결책

### 순환 참조 방지
**문제**: FSD 구조에서 레이어 간 순환 참조
**해결**: 
- entities → shared → features 단방향 의존성 엄수
- barrel exports로 깔끔한 import 구조
- appConfig 직접 참조 제거

### CORS 문제 해결
**개발 환경**: 프록시 설정 또는 CORS 헤더 설정
**프로덕션**: 동일 오리진 서빙으로 근본 해결

### 캐싱 전략
**API 응답 캐싱**: 
- GitHub API: 24시간 TTL
- 프로젝트 데이터: 메모리 캐싱
- 빌드 결과물: CDN 캐싱 활용

### 성능 최적화
**핵심 원칙**:
- 불필요한 리렌더링 방지 (React.memo, useMemo)
- API 호출 최적화 (중복 호출 방지)
- 번들 크기 최적화 (Tree shaking, Code splitting)

---

**마지막 업데이트**: 2025-08-12
**주요 업데이트**: 백엔드 헥사고날 아키텍처 리팩토링 완료 반영
**다음 업데이트 예상 시점**: RAG/벡터DB 도입 시