# AI Portfolio Chatbot - 포트폴리오 프로젝트

## 🎯 프로젝트 개요

**AI Portfolio Chatbot**은 개발자 포트폴리오 사이트에 AI 챗봇을 통합하여, 방문자들이 자연어로 프로젝트에 대해 질문할 수 있도록 하는 웹 애플리케이션입니다.

## 🚀 주요 목표

### 1. **AI Agent API 학습 및 구현**
- **Google Gemini API** 활용한 자연어 처리 시스템 구축
- **프롬프트 엔지니어링**을 통한 AI 응답 품질 최적화
- **컨텍스트 관리** 시스템으로 프로젝트별 맞춤 응답 제공
- **에러 처리** 및 폴백 메커니즘 구현

### 2. **GitHub API 연동 및 워크플로우 구축**
- **GitHub REST API**를 활용한 동적 프로젝트 정보 수집
- **캐싱 시스템** 구현으로 API 호출 최적화
- **하이브리드 데이터 소스** (GitHub API + 로컬 데이터) 관리
- **실시간 README** 및 프로젝트 메타데이터 동기화

### 3. **Cloud Run 배포 환경 구축**
- **서버리스 아키텍처** 설계 및 구현
- **Docker 컨테이너화** 및 멀티스테이지 빌드 최적화
- **Google Cloud Platform** 서비스 활용
- **CI/CD 파이프라인** 구축 (GitHub Actions)
- **환경 변수 관리** 및 보안 설정

## 🛠 기술 스택

### Frontend
- **React 19.1.0** - 최신 React 기능 활용
- **TypeScript** - 타입 안정성 및 개발 생산성 향상
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **Vite** - 빠른 개발 서버 및 빌드 도구

### Backend & API
- **Spring Boot 3.x** - Java 기반 백엔드 프레임워크 (헥사고날 아키텍처)
- **LangChain4j** - AI 모델 연동 및 프롬프트 관리
- **Google Gemini API** - AI 자연어 처리 (Gemini 2.5 Flash)
- **GitHub REST API** - 프로젝트 정보 수집
- **Maven** - Java 프로젝트 빌드 및 의존성 관리
- **포트 & 어댑터 패턴** - 확장 가능한 아키텍처 설계

### Infrastructure & Deployment
- **Google Cloud Run** - 서버리스 컨테이너 플랫폼
- **Docker** - 멀티스테이지 빌드 컨테이너화
- **GitHub Actions** - CI/CD 자동화
- **Eclipse Temurin** - Java 런타임 환경

## 📊 학습 성과

### AI Agent API
- ✅ **프롬프트 엔지니어링**: 시스템 인스트럭션과 컨텍스트 관리
- ✅ **컨텍스트 제한**: 허용된 프로젝트 정보만 AI에게 제공
- ✅ **에러 처리**: API 실패 시 폴백 메커니즘 구현
- ✅ **사용자 경험**: 인터랙티브 초기화 및 프로젝트 선택 기능
- ✅ **LangChain4j 연동**: Java 기반 AI 모델 통합

### GitHub API Integration
- ✅ **동적 데이터 수집**: GitHub API를 통한 실시간 프로젝트 정보
- ✅ **캐싱 시스템**: 24시간 유효기간의 하이브리드 캐싱
- ✅ **에러 복구**: API 실패 시 로컬 데이터 폴백
- ✅ **프로젝트 매핑**: 제목과 레포지토리명 자동 매핑

### Cloud Run Deployment
- ✅ **서버리스 아키텍처**: 자동 스케일링 및 비용 최적화
- ✅ **멀티스테이지 빌드**: 프론트엔드(Node.js) + 백엔드(Java) 통합 컨테이너
- ✅ **보안 설정**: GitHub Secrets를 통한 API 키 관리
- ✅ **CI/CD 파이프라인**: GitHub Actions 자동 배포
- ✅ **환경 변수 최적화**: Secret Manager 의존성 제거

## 🎨 UI/UX 개선

### 프로젝트 타입 구분 시스템
- ✅ **시각적 구분**: 프로젝트와 경험을 색상으로 구분
- ✅ **필터링 기능**: 타입별 프로젝트 필터링
- ✅ **반응형 디자인**: 모바일 및 데스크톱 최적화
- ✅ **접근성**: 키보드 네비게이션 및 스크린 리더 지원

### 사용자 경험
- ✅ **인터랙티브 챗봇**: 프로젝트 선택 및 맥락 유지
- ✅ **로딩 상태**: 사용자 친화적인 로딩 인디케이터
- ✅ **에러 처리**: 명확한 에러 메시지 및 복구 가이드

## 🔧 아키텍처 설계

### 프론트엔드: FSD (Feature-Sliced Design)
```
src/
├── app/          # 애플리케이션 레이어 - 전역 설정, Provider
├── entities/     # 엔티티 레이어 - 비즈니스 도메인 모델  
├── features/     # 기능 레이어 - 독립적 기능 단위
└── shared/       # 공유 레이어 - 공통 유틸리티
```

### 백엔드: 헥사고날 아키텍처 (포트 & 어댑터)
```
backend/
├── domain/          # 비즈니스 로직 (포트 정의)
│   ├── portfolio/   # 포트폴리오 도메인
│   └── chat/        # 채팅 도메인
└── infrastructure/  # 기술 구현 (어댑터)
    ├── persistence/ # 데이터 저장소 어댑터  
    └── ai/          # AI 서비스 어댑터
```

### 데이터 플로우
```
사용자 질문 → Frontend → Backend API → ChatService (도메인) → LLMPort (포트) 
                ↓                                      ↓
        GeminiLLMAdapter (어댑터) → Gemini API → 응답 생성
                ↓
GitHub API → ProjectRepository (포트) → JsonProjectRepository (어댑터) → 캐싱
```

### 멀티스테이지 빌드 아키텍처
```
Stage 1: Frontend Build (Node.js 18)
├── npm ci (의존성 설치)
├── npm run build (Vite 빌드)
└── dist/ (정적 파일 생성)

Stage 2: Backend Build (Maven + Java 17)
├── mvn dependency:resolve
├── mvn clean package -DskipTests
└── target/*.jar (Spring Boot JAR)

Stage 3: Production Image (Eclipse Temurin 17)
├── JAR 파일 복사
├── 정적 파일 복사
└── 포트 8080 노출
```

### 보안 아키텍처
- **API 키 보안**: GitHub Secrets를 통한 환경 변수 주입
- **CORS 설정**: 허용된 도메인만 접근 가능
- **Rate Limiting**: API 호출 제한으로 비용 관리
- **컨텍스트 제한**: 허용된 프로젝트 정보만 AI에게 제공

## 📈 성능 최적화

### 프론트엔드
- **코드 스플리팅**: React.lazy를 통한 지연 로딩
- **이미지 최적화**: WebP 포맷 및 지연 로딩
- **번들 최적화**: Vite를 통한 빠른 빌드

### 백엔드
- **헥사고날 아키텍처**: 포트-어댑터 패턴으로 확장성 확보
- **의존성 역전**: 도메인 로직과 인프라 분리로 테스트 용이성 향상
- **캐싱 전략**: Repository 레벨 캐싱으로 성능 최적화
- **API 최적화**: 필요한 데이터만 요청
- **에러 복구**: 폴백 메커니즘으로 안정성 확보
- **Spring Boot 최적화**: JAR 파일 최소화 및 시작 시간 단축

### CI/CD 최적화
- **멀티스테이지 빌드**: 각 단계별 최적화된 이미지 사용
- **캐시 활용**: npm 및 Maven 의존성 캐싱
- **병렬 처리**: 프론트엔드와 백엔드 빌드 동시 실행
- **배포 자동화**: main 브랜치 push 시 자동 배포

## 🎯 향후 개선 계획

### 기능 확장
- [ ] **다국어 지원**: 영어/한국어 전환 기능
- [ ] **음성 인터페이스**: 음성으로 프로젝트 질문
- [ ] **대화 히스토리**: 이전 대화 내용 저장
- [ ] **프로젝트 추천**: AI 기반 프로젝트 추천 시스템

### 기술 개선
- [ ] **RAG 시스템**: 벡터DB를 활용한 문서 기반 AI 응답 개선
- [ ] **벡터 검색**: ChromaDB/Pinecone 연동으로 더 정확한 프로젝트 정보 검색
- [ ] **성능 모니터링**: Google Cloud Monitoring 연동
- [ ] **A/B 테스트**: 사용자 경험 최적화
- [ ] **마이크로서비스**: 기능별 서비스 분리
- [ ] **데이터베이스**: 프로젝트 정보 영구 저장

## 📝 결론

이 프로젝트를 통해 **AI Agent API**, **GitHub API 연동**, **Cloud Run 배포** 등 현대적인 웹 개발 기술을 종합적으로 학습하고 구현했습니다. 

특히 **프론트엔드 FSD 아키텍처**, **백엔드 헥사고날 아키텍처**, **멀티스테이지 Docker 빌드**, **GitHub Actions CI/CD**를 통해 확장 가능하고 유지보수하기 쉬운 포트폴리오 시스템을 구축했습니다. 

**헥사고날 아키텍처 도입**으로 향후 **벡터DB 및 RAG 시스템** 연동이 수월해졌으며, 이는 더 복잡한 AI 기반 애플리케이션 개발의 견고한 기반이 될 것입니다.

---