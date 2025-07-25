# AI Portfolio Chatbot - 대화 로그 및 주요 결정사항

## 📋 프로젝트 개요
- **프로젝트명**: AI Portfolio Chatbot
- **목적**: 개발자 포트폴리오 사이트에 AI 챗봇 통합
- **기술 스택**: React 19.1.0, TypeScript, Vite, Google Gemini API
- **배포 대상**: Google Cloud Run

## 🎯 주요 목표
1. Google Cloud Run에 배포
2. 실제 GitHub 레포지토리 연결
3. 실제 소개 URL 연결
4. 프로덕션 환경 최적화

## 📝 주요 결정사항

### 1. 배포 아키텍처
- **플랫폼**: Google Cloud Run
- **이유**: 
  - 서버리스 아키텍처로 비용 효율적
  - 자동 스케일링 지원
  - HTTPS 자동 설정
  - 글로벌 CDN 제공

### 2. 환경 변수 관리
- **Gemini API Key**: Google Cloud Secret Manager 사용
- **환경별 설정**: 개발/스테이징/프로덕션 분리
- **보안**: API 키를 소스코드에 하드코딩하지 않음

### 3. 데이터 소스 개선 ✅ (GitHub API 단순화)
- **현재**: constants.ts에 하드코딩된 프로젝트 데이터
- **개선 방향**: 
  - ✅ GitHub API 우선 방식 채택: 단순하고 효율적
  - ✅ 24시간 캐시 유효기간 설정
  - ✅ GitHub API 실패 시 기본 프로젝트 폴백
  - ✅ README는 GitHub API에서 동적 로딩
  - ✅ ProjectService 클래스로 통합 관리
  - ✅ 복잡한 API 참조 시스템 제거로 단순화

### 4. 성능 최적화
- **이미지 최적화**: Cloudinary 또는 Google Cloud Storage 사용
- **캐싱 전략**: CDN 캐싱, API 응답 캐싱
- **번들 최적화**: Vite 빌드 최적화

### 5. 모니터링 및 로깅
- **로깅**: Google Cloud Logging
- **모니터링**: Google Cloud Monitoring
- **에러 추적**: 사용자 경험 개선을 위한 에러 수집

### 6. 프로젝트 타입 구분 시스템 ✅
- **목적**: 실제 개발 프로젝트와 업무/학습 경험을 시각적으로 구분
- **구현 내용**:
  - ✅ Project 인터페이스에 `type: 'project' | 'experience'` 필드 추가
  - ✅ 기존 GitHub 프로젝트들을 'project' 타입으로 설정
  - ✅ 업무/학습 경험들을 'experience' 타입으로 설정
  - ✅ ProjectCard 컴포넌트에 타입별 스타일링 적용
  - ✅ SVG 아이콘들을 `components/icons/ProjectIcons.tsx`로 분리하여 코드 정리
  - ✅ 디자인 통일성 개선:
    - 모든 프로젝트 카드 배경을 흰색으로 통일
    - 프로젝트/경험 모두 배지 표시
    - 프로젝트: 파란색 배지, 경험: 오렌지색 배지
    - 기술 스택 태그는 프로젝트 타입에 따라 색상 구분
  - ✅ 필터링 기능: 전체/프로젝트/경험 필터
- **사용자 경험 개선**:
  - 시각적 구분으로 프로젝트 유형을 즉시 파악 가능
  - 프로젝트는 파란색, 경험은 오렌지색으로 구분
  - 경험은 외부 링크가 없어도 명확한 표시
  - 회사 보안 정책 등으로 인한 업무 경험도 포트폴리오에 포함 가능

### 7. Feature-Based Architecture 재구성 ✅ (2024-07-21)
- **목적**: 모듈화되고 확장 가능한 프로젝트 구조로 변경
- **구현 내용**:
  - ✅ `src/features/` 디렉토리 구조로 변경
    - `projects/`: 프로젝트 관련 컴포넌트, 상수, 타입
    - `chatbot/`: 챗봇 관련 컴포넌트, 서비스, 타입  
    - `layout/`: 레이아웃 관련 컴포넌트 (App, Header)
  - ✅ `src/shared/` 디렉토리로 공통 코드 분리
    - `services/`: geminiService, githubService, prompts
    - `config/`: app.config.ts
    - `components/`: ProjectIcons
    - `types/`: 공통 타입 정의
  - ✅ 진입점을 `src/main.tsx`로 이동
  - ✅ `index.html`에서 진입점 경로 수정
  - ✅ 모든 import 경로를 새로운 구조에 맞게 수정
  - ✅ 순환 참조 문제 해결 (appConfig 직접 참조 제거)
  - ✅ Barrel exports를 통한 깔끔한 import 구조
- **개선 효과**:
  - 모듈화: 각 기능이 독립적인 폴더에 구성
  - 확장성: 새로운 기능 추가 시 해당 폴더만 수정
  - 유지보수성: 관련 코드가 한 곳에 모여있음
  - 타입 안전성: 각 feature별로 타입 정의
  - 재사용성: shared 폴더를 통한 공통 코드 관리
  - 명확한 구조: Feature-Based Architecture 적용

### 8. 히스토리 패널 기능 구현 ✅ (2024-12-19)
- **목적**: 프로젝트와 경험들을 시간순으로 시각화하여 경력 발전 과정을 한눈에 파악
- **구현 내용**:
  - ✅ Project 인터페이스에 `startDate`, `endDate` 필드 추가 (YYYY-MM 형식)
  - ✅ 모든 프로젝트와 경험에 날짜 정보 추가
  - ✅ HistoryPanel 컴포넌트 생성:
    - 사이드 패널 형태로 우측에서 슬라이드 인/아웃
    - 수직 타임라인으로 시간순 정렬
    - 프로젝트는 왼쪽, 경험은 오른쪽에 배치하여 겹침 방지
    - 프로젝트: 파란색 테마, 경험: 오렌지색 테마
    - 마우스 오버 시 하이라이트 효과
    - 반응형 디자인 및 스크롤 가능한 패널
  - ✅ PanelToggle 컴포넌트 생성:
    - 우측 하단에 고정된 토글 버튼
    - 히스토리 차트 아이콘 사용
    - 상태에 따른 색상 변경
  - ✅ ProjectCard 컴포넌트 개선:
    - 마우스 오버 이벤트 추가
    - 히스토리 패널과 연동된 하이라이트 기능
  - ✅ PortfolioSection 컴포넌트 통합:
    - 히스토리 패널 상태 관리
    - 하이라이트 아이템 ID 관리
    - 컴포넌트 간 이벤트 연결
- **사용자 경험 개선**:
  - 프로젝트 카드에 마우스 오버 시 타임라인에서 해당 아이템 하이라이트
  - 타임라인 아이템에 마우스 오버 시 프로젝트 카드 하이라이트
  - 직관적인 수직 타임라인으로 경력 발전 과정 파악
  - 프로젝트와 경험의 명확한 구분 (왼쪽/오른쪽 배치)
  - 진행 중인 프로젝트 표시 (endDate가 undefined인 경우)
  - 사이드 패널로 메인 콘텐츠 방해 없이 히스토리 확인 가능

## 🔄 다음 단계

### Phase 1: 배포 준비
- [x] Dockerfile 생성
- [x] nginx.conf 설정 파일 생성
- [x] .dockerignore 파일 생성
- [x] GitHub Actions CI/CD 파이프라인 구성
- [x] 배포 스크립트 생성
- [x] 배포 가이드 문서 작성
- [ ] Google Cloud 프로젝트 설정 (실행 필요)
- [ ] Secret Manager 설정 (실행 필요)

### Phase 2: 데이터 소스 개선
- [x] GitHub API 연동 서비스 생성 (services/githubService.ts)
- [x] 하이브리드 캐싱 시스템 구현 (services/projectService.ts)
- [x] constants.ts 간소화 (README 제거)
- [x] Vite 환경 변수 타입 정의 (vite-env.d.ts)
- [x] 인터랙티브 챗봇 초기화 구현
- [x] 프로젝트 타입 구분 시스템 구현
- [x] Feature-Based Architecture 재구성
- [x] 히스토리 패널 기능 구현
- [ ] 이미지 최적화

### Phase 3: 프로덕션 최적화
- [ ] 성능 모니터링 설정
- [ ] 에러 처리 개선
- [ ] 사용자 분석 도구 추가

## 📊 기술적 고려사항

### 보안
- API 키 노출 방지
- CORS 설정
- Rate limiting 적용
- **AI 챗봇 프로젝트 제한**: constants.ts에 정의된 프로젝트만 접근 가능
- **시스템 인스트럭션 제한**: 허용된 프로젝트 목록 외 질문 시 'I_CANNOT_ANSWER' 응답
- **컨텍스트 제한**: 오직 정의된 프로젝트 정보만 AI에게 제공

### 확장성
- 서버리스 아키텍처 활용
- 캐싱 전략 수립
- 데이터베이스 필요성 검토

### 사용자 경험
- 로딩 상태 개선
- 에러 메시지 친화적 표현
- 모바일 최적화
- **인터랙티브 초기화**: 프로젝트 선택 버튼으로 사용자 경험 향상
- **단계별 가이드**: 초기 메시지에서 사용법 안내
- **프로젝트 타입 구분**: 시각적 구분으로 사용자 이해도 향상
- **히스토리 패널**: 시간순 시각화로 경력 발전 과정 파악

## 🗓 타임라인
- **Week 1**: 배포 환경 구축 ✅ (완료)
- **Week 2**: GitHub API 연동 🔄 (진행 중)
- **Week 3**: 프로덕션 최적화
- **Week 4**: 모니터링 및 테스트

## 📁 생성된 파일들
- `Dockerfile`: 멀티스테이지 빌드를 위한 Docker 설정
- `nginx.conf`: Cloud Run용 nginx 설정
- `.dockerignore`: Docker 빌드 최적화
- `services/githubService.ts`: GitHub API 연동 서비스
- `services/projectService.ts`: GitHub API 캐싱 시스템
- `vite-env.d.ts`: Vite 환경 변수 타입 정의
- `scripts/deploy.sh`: 수동 배포 스크립트
- `.github/workflows/deploy.yml`: GitHub Actions CI/CD
- `env.example`: 환경 변수 예시
- `docs/deployment-guide.md`: 상세 배포 가이드

## 🆕 최신 업데이트 

### 프로젝트 맥락 유지 시스템 구현 ✅
**문제**: 사용자가 특정 프로젝트를 선택했는데, 챗봇이 다른 프로젝트의 GitHub 레포지토리를 참조하여 404 에러 발생

**해결책**:
1. **GitHub 서비스 개선**:
   - `getProjectInfo()` 함수 추가: 특정 프로젝트의 GitHub 정보만 가져오기
   - 프로젝트 제목과 레포지토리명 매핑 시스템 구현
   - 404 에러 조용히 처리하여 콘솔 오류 감소

2. **Gemini 서비스 개선**:
   - `getChatbotResponse()` 함수에 `selectedProject` 매개변수 추가
   - 선택된 프로젝트가 있으면 해당 프로젝트의 `docs/portfolio.md`만 참조
   - 선택된 프로젝트가 없으면 전체 프로젝트 컨텍스트 사용

3. **Chatbot 컴포넌트 개선**:
   - `selectedProject` 상태 추가로 현재 선택된 프로젝트 추적
   - 프로젝트 선택 시 해당 프로젝트의 맥락 설정
   - 헤더에 "현재 프로젝트: [프로젝트명]" 표시
   - 모든 후속 질문에서 선택된 프로젝트의 맥락 유지

**결과**: 
- 사용자가 "PYQT5 파일 태거" 선택 시 `PYQT5_FileTagger` 레포지토리의 `docs/portfolio.md`만 참조
- 404 에러 대폭 감소
- 더 정확하고 맥락에 맞는 AI 응답 제공

### 프로젝트 타입 구분 시스템 구현 ✅
**목적**: 실제 개발 프로젝트와 업무/학습 경험을 시각적으로 구분하여 사용자 경험 향상

**구현 내용**:
1. **타입 시스템 개선**:
   - `Project` 인터페이스에 `type: 'project' | 'experience'` 필드 추가
   - 기존 GitHub 프로젝트들을 'project' 타입으로 설정
   - 업무/학습 경험들을 'experience' 타입으로 설정

2. **코드 구조 개선**:
   - 하드코딩된 SVG 아이콘들을 `components/icons/ProjectIcons.tsx`로 분리
   - 재사용 가능한 아이콘 컴포넌트로 정리
   - 코드 가독성 및 유지보수성 향상

3. **UI/UX 개선**:
   - **프로젝트**: 파란색 배지와 테마
   - **경험**: 오렌지색 배지와 테마
   - 모든 프로젝트 카드 배경을 흰색으로 통일하여 디자인 일관성 확보
   - 프로젝트/경험 모두 배지 표시로 명확한 구분
   - 기술 스택 태그는 프로젝트 타입에 따라 색상 구분

4. **필터링 기능**:
   - 전체/프로젝트/경험 필터 버튼
   - 각 타입별 프로젝트 개수 표시
   - 필터링된 결과가 없을 때 친화적인 메시지 표시

**사용자 경험 개선**:
- 시각적 구분으로 프로젝트 유형을 즉시 파악 가능
- 경험은 외부 링크가 없어도 명확한 표시
- 링크가 없는 경우 "경험" 텍스트로 표시
- 회사 보안 정책 등으로 인한 업무 경험도 포트폴리오에 포함 가능

**결과**:
- 사용자가 프로젝트 유형을 한눈에 구분 가능
- 프로젝트와 경험의 명확한 시각적 차별화
- 코드 구조 개선으로 유지보수성 향상
- 향후 경험 추가 시 일관된 디자인 적용 가능

### 히스토리 패널 기능 구현 ✅ (2024-12-19)
**목적**: 프로젝트와 경험들을 시간순으로 시각화하여 경력 발전 과정을 한눈에 파악

**구현 내용**:
1. **데이터 구조 개선**:
   - `Project` 인터페이스에 `startDate`, `endDate` 필드 추가 (YYYY-MM 형식)
   - 모든 프로젝트와 경험에 실제 날짜 정보 추가
   - 진행 중인 프로젝트는 `endDate`를 `undefined`로 설정

2. **히스토리 패널 컴포넌트**:
   - **두 줄 타임라인**: 프로젝트와 경험을 별도 라인으로 구분
   - **시각적 구분**: 프로젝트는 파란색, 경험은 오렌지색 테마
   - **시간순 정렬**: 시작일 기준으로 자동 정렬
   - **반응형 디자인**: 모달 형태로 전체 화면 활용
   - **인터랙티브 요소**: 마우스 오버 시 하이라이트 효과

3. **패널 토글 시스템**:
   - 우측 상단에 고정된 토글 버튼
   - 히스토리 차트 아이콘으로 직관적 표시
   - 상태에 따른 색상 및 스타일 변경

4. **연동 기능**:
   - 프로젝트 카드 마우스 오버 시 타임라인 아이템 하이라이트
   - 타임라인 아이템 마우스 오버 시 프로젝트 카드 하이라이트
   - 양방향 인터랙션으로 사용자 경험 향상

**사용자 경험 개선**:
- **직관적 시각화**: 시간순 배치로 경력 발전 과정 파악
- **명확한 구분**: 프로젝트와 경험의 시각적 차별화
- **인터랙티브 요소**: 마우스 오버로 관련 아이템 하이라이트
- **진행 중 표시**: 현재 진행 중인 프로젝트 명확히 표시
- **반응형 디자인**: 다양한 화면 크기에서 최적화된 표시

**기술적 특징**:
- **타입 안전성**: TypeScript로 완전한 타입 정의
- **성능 최적화**: 불필요한 리렌더링 방지
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원
- **확장성**: 새로운 프로젝트/경험 추가 시 자동 반영

**결과**:
- 사용자가 경력 발전 과정을 시각적으로 파악 가능
- 프로젝트와 경험의 시간적 관계 명확히 표시
- 인터랙티브한 사용자 경험으로 포트폴리오 탐색 향상
- 모바일 및 데스크톱에서 일관된 사용자 경험 제공

### 환경 변수 설정 가이드 추가 ✅
- `.env.local` 파일 생성 가이드 제공
- `VITE_GEMINI_API_KEY` 설정 방법 안내
- Google AI Studio에서 API 키 발급 방법 안내

### 🚀 향후 추가 기능 계획 

#### 1. 프로젝트 상세 모달 기능 📋
**목적**: 각 프로젝트 카드를 클릭했을 때 모달을 통해 세부 정보를 확인할 수 있는 기능

**구현 계획**:
- **모달 컴포넌트**: `components/ProjectModal.tsx` 생성
- **상세 정보 표시**:
  - 프로젝트 제목, 설명, 기술 스택
  - GitHub 링크, 라이브 데모 링크
  - README 내용 (GitHub API에서 가져온)
  - 프로젝트 스크린샷 또는 이미지
  - 개발 기간, 팀 구성 등 메타데이터
- **인터랙션**:
  - 프로젝트 카드 클릭 시 모달 열기
  - ESC 키 또는 배경 클릭으로 모달 닫기
  - 모달 내에서 AI 챗봇과 해당 프로젝트에 대해 대화 가능
- **UI/UX**:
  - 반응형 디자인 (모바일/데스크톱)
  - 부드러운 애니메이션 효과
  - 스크롤 가능한 콘텐츠 영역

#### 2. 타임라인 뷰 기능 📅
**목적**: 프로젝트와 경험들을 시간순으로 한눈에 파악할 수 있는 타임라인 뷰

**구현 계획**:
- **타임라인 컴포넌트**: `components/TimelineView.tsx` 생성
- **데이터 구조 개선**:
  - `Project` 인터페이스에 `startDate`, `endDate` 필드 추가
  - `constants.ts`의 프로젝트 데이터에 날짜 정보 추가
- **타임라인 표시**:
  - 수직 타임라인 형태로 시간순 정렬
  - 프로젝트와 경험을 다른 색상/아이콘으로 구분
  - 각 항목에 제목, 간단한 설명, 기술 스택 표시
- **인터랙션**:
  - 타임라인 항목 클릭 시 해당 프로젝트 상세 모달 열기
  - 연도별 필터링 기능
  - 프로젝트/경험 타입별 필터링
- **UI/UX**:
  - 시각적으로 매력적인 타임라인 디자인
  - 호버 효과 및 클릭 애니메이션
  - 반응형 레이아웃

**기술적 고려사항**:
- **성능**: 많은 프로젝트가 있을 때의 렌더링 최적화
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원
- **데이터 관리**: 날짜 정보의 일관성 및 유효성 검증
- **확장성**: 향후 더 많은 프로젝트 추가 시 타임라인 확장

**사용자 경험 개선 효과**:
- 프로젝트의 시간적 흐름을 직관적으로 파악 가능
- 경력 발전 과정을 시각적으로 표현
- 특정 시기의 프로젝트를 빠르게 찾기 가능
- 포트폴리오의 스토리텔링 효과 향상

---

# AI Conversation Log

## 챗봇 고도화 및 백엔드 구조 개선 (2025-01-15)

### 개요
AI 챗봇의 사용량 제한 완화, 프롬프트 외부화, 하이브리드 아키텍처 구현, 그리고 백엔드 구조 정리를 통해 더욱 안정적이고 확장 가능한 시스템으로 발전시켰습니다.

### 주요 개선사항

#### 1. 챗봇 사용량 제한 완화
**목적**: 사용자 경험 개선을 위한 제한 완화
- **시간당 제한**: 3회 → 15회로 증가
- **일일 제한**: 5회 → 50회로 증가
- **에러 메시지 개선**: 구체적이고 친화적인 안내 메시지

#### 2. 프롬프트 외부화 및 관리 시스템
**목적**: 개발자 친화적인 프롬프트 관리
- **Markdown 기반**: `chatbot-prompts.md`로 사람이 읽기 쉬운 형태
- **JSON 변환**: `PromptConverter.java`로 자동 변환
- **REST API**: `/api/prompts/convert` 엔드포인트로 변환 실행
- **Python 의존성 제거**: Java 기반 변환기로 통합

#### 3. 하이브리드 아키텍처 구현
**목적**: 성능과 보안의 균형
- **프론트엔드 검증**: 기본적인 입력 검증 (길이, 명백한 스팸)
- **백엔드 검증**: 고급 검증 (패턴 매칭, 문자 비율, 반복 감지)
- **질문 분석**: 백엔드에서 통합 처리 (개인정보, 기술질문, 프로젝트질문 등)
- **일관된 응답**: ResponseType enum으로 구조화된 통신

#### 4. 하이브리드 오류 처리 방식 도입
**목적**: 비즈니스 로직과 시스템 오류의 명확한 구분
- **비즈니스 로직 오류**: 200 OK + ResponseType (INVALID_INPUT, SPAM_DETECTED, RATE_LIMITED, PERSONAL_INFO, CANNOT_ANSWER)
- **시스템 오류**: 적절한 HTTP 상태 코드 (500 Internal Server Error 등)
- **명확한 구분**: 비즈니스 로직 vs 시스템 오류
- **일관된 처리**: 프론트엔드에서 ResponseType 기반 처리

#### 5. 백엔드 구조 정리
**목적**: 코드 중복 제거 및 책임 분리
- **중복 로직 제거**: `GeminiService`의 질문 분석 로직을 `QuestionAnalysisService`로 통합
- **매직 스트링 제거**: `"I_CANNOT_ANSWER"` → `null` 체크로 대체
- **타입 안전성**: ResponseType enum으로 명확한 통신
- **서비스 책임 명확화**: 각 서비스의 단일 책임 원칙 준수

#### 6. 프론트엔드 구조 개선
**목적**: 새로운 백엔드 구조와의 완벽한 호환
- **ResponseType 기반 처리**: 모든 응답 타입에 대한 일관된 처리
- **타입 안전성**: ChatbotResponse, ApiResponse, BackendChatResponse 인터페이스로 타입 보장
- **하이브리드 오류 처리**: 비즈니스 로직 오류와 시스템 오류 구분 처리
- **중복 제거**: `emailButtonType` 제거, 단순화된 메일 버튼 로직
- **일관된 UX**: 모든 상황에서 일관된 사용자 경험

### 기술적 구현 세부사항

#### 1. ResponseType 시스템
```typescript
export type ResponseType = 
  | 'SUCCESS'           // 정상 응답
  | 'RATE_LIMITED'      // 사용량 제한
  | 'CANNOT_ANSWER'     // 답변 불가
  | 'PERSONAL_INFO'     // 개인정보 요청
  | 'INVALID_INPUT'     // 잘못된 입력
  | 'SYSTEM_ERROR'      // 시스템 오류
  | 'SPAM_DETECTED'     // 스팸 감지
```

#### 2. 하이브리드 검증 시스템
**프론트엔드 (questionValidator.ts)**:
- 빈 입력, 길이 제한, 명백한 스팸 패턴
- 단순 인사말 즉시 응답
- 기본적인 사용자 경험 제공

**백엔드 (InputValidationService.java)**:
- 고급 스팸 패턴 감지
- 의미 없는 반복 문자 감지
- 문자 비율 검증 (한글/영문/숫자/특수문자)
- 보안 중심의 강력한 검증

#### 3. 질문 분석 시스템 (QuestionAnalysisService.java)
**개인정보 감지**: 50+ 키워드로 강화된 감지
**질문 분류**: 
- PERSONAL_INFO: 개인정보 요청
- TECHNICAL: 기술 관련 질문
- PROJECT: 프로젝트 관련 질문
- GENERAL_SKILL: 전반적인 기술 스택
- OVERVIEW: 개요/소개 질문
- COMPARISON: 비교 분석
- CHALLENGE: 도전과제
- GENERAL: 일반 질문

#### 4. 프롬프트 관리 시스템
**Markdown → JSON 변환**:
- `PromptConverter.java`: Java 기반 변환기
- 섹션별 파싱: system prompt, contextual prompts, patterns
- REST API: `/api/prompts/convert` 엔드포인트
- 자동화: 빌드 시 또는 수동 실행

### 개선 효과

#### 1. 사용자 경험 향상
- **사용량 제한 완화**: 더 많은 질문 가능
- **빠른 응답**: 프론트엔드 즉시 응답으로 반응성 향상
- **일관된 메일 버튼**: 모든 상황에서 적절한 메일 버튼 표시
- **명확한 에러 메시지**: 구체적이고 친화적인 안내

#### 2. 개발자 경험 개선
- **프롬프트 외부화**: Markdown으로 쉬운 편집
- **타입 안전성**: TypeScript/Java 타입 시스템 활용
- **코드 중복 제거**: 유지보수성 향상
- **명확한 책임 분리**: 각 서비스의 역할 명확화

#### 3. 시스템 안정성 강화
- **하이브리드 검증**: 성능과 보안의 균형
- **구조화된 통신**: ResponseType으로 명확한 상태 전달
- **에러 처리 개선**: 모든 상황에 대한 적절한 처리
- **확장성 확보**: 새로운 기능 추가 시 일관된 패턴 적용

### 변경된 파일 목록

#### 백엔드
1. `ChatController.java` - 하이브리드 아키텍처 구현
2. `ChatResponse.java` - ResponseType enum 추가
3. `GeminiService.java` - 중복 로직 제거, PromptService 통합
4. `SpamProtectionService.java` - 사용량 제한 완화
5. `QuestionAnalysisService.java` - 질문 분석 통합 (신규)
6. `InputValidationService.java` - 입력 검증 강화 (신규)
7. `PromptService.java` - 프롬프트 관리 (신규)
8. `PromptConverter.java` - Markdown→JSON 변환 (신규)
9. `PromptController.java` - 프롬프트 관리 API (신규)
10. `chatbot-prompts.md` - 프롬프트 소스 (신규)
11. `chatbot-prompts.json` - 변환된 프롬프트 (신규)

#### 프론트엔드
1. `Chatbot.tsx` - ResponseType 기반 처리
2. `apiClient.ts` - 구조화된 응답 처리
3. `types.ts` - ResponseType 및 ChatbotResponse 타입 추가
4. `questionValidator.ts` - 프론트엔드 검증 로직 (신규)
5. `chatbotService.ts` - 구조화된 응답 처리

### 다음 단계: 백엔드 구조 정리
현재 25개 Java 파일로 구성된 백엔드의 구조적 개선이 필요합니다:

#### 현재 구조 분석
- **Controller**: 5개 (Chat, Prompt, GitHub, Project, Data)
- **Service**: 8개 (Gemini, QuestionAnalysis, InputValidation, Prompt, SpamProtection, GitHub, Project, Data)
- **Model**: 7개 (ChatResponse, ChatRequest, Project, Experience, Education, Certification, ApiResponse)
- **Config**: 2개 (AppConfig, WebConfig)
- **Util**: 2개 (PromptConverter, DateUtils)

#### 권장 개선 방향
1. **서비스 그룹화**: 도메인별 패키지 분리
2. **책임 분리**: 큰 서비스들의 세분화
3. **패키지 재구성**: 기능별 논리적 그룹핑
4. **아키텍처 패턴**: Layered Architecture 적용

---

## 히스토리 패널 구현 (2025-07-21)

### 요구사항
- 포트폴리오 사이트에 프로젝트와 경험의 시작/종료 날짜를 시각적으로 표현하는 히스토리 패널 구현
- 토글 가능한 사이드 패널 (모달 아님)
- 수직 타임라인으로 프로젝트와 경험을 구분하여 표시
- 프로젝트/경험 카드와 타임라인 간 양방향 하이라이트 기능
- 캔들스틱 형태의 시각적 표현

### 구현 과정

#### 1. 초기 구조 설계
- `src/features/projects/components/HistoryPanel.tsx` 생성
- `src/features/projects/components/PanelToggle.tsx` 생성
- `src/features/projects/types.ts`에 날짜 필드 추가
- 프로젝트 데이터에 `startDate`, `endDate` 필드 추가

#### 2. 날짜 유틸 함수 구현
- `src/shared/utils/dateUtils.ts` 생성
- `parseDate()`: YYYY-MM 형식 문자열을 Date 객체로 변환
- `formatDateToYYYYMM()`: Date 객체를 YYYY.MM 형식으로 포맷
- `getTimelinePosition()`: 날짜를 타임라인 위치 퍼센트로 변환
- `generateTimelineDates()`: 타임라인에 표시할 날짜들 생성
- `getProjectDateRange()`: 프로젝트 배열에서 최소/최대 날짜 추출

#### 3. 타임라인 레이아웃 개선
- **초기**: 모달 형태의 수평 타임라인
- **1차 수정**: 사이드 패널로 변경, 수직 타임라인 구현
- **2차 수정**: 프로젝트와 경험을 좌우로 분리
- **3차 수정**: 캔들스틱 형태로 변경 (상단/하단 심지 + 몸통)
- **4차 수정**: 단순한 바 형태로 단순화

#### 4. 날짜 순서 및 범위 조정
- **초기**: 과거순 (상단이 과거, 하단이 최신)
- **수정**: 최신순 (상단이 최신, 하단이 과거)
- **범위 조정**: 가장 최초 프로젝트보다 1달 전부터, 오늘 기준 1달 후까지

#### 5. 시각적 개선
- **라벨 분리**: 캔들스틱과 라벨을 별도 영역에 배치
- **라벨 제거**: 최종적으로 라벨 없이 깔끔한 바만 표시
- **색상 구분**: 프로젝트(파란색) vs 경험(오렌지색)
- **하이라이트 효과**: 마우스 오버 시 색상 강화 및 스케일 효과

#### 6. 데이터 통합 및 처리
- GitHub 프로젝트, 로컬 프로젝트, 경험 데이터 통합
- 다양한 날짜 형식 처리 (YYYY-MM, YYYY-MM-DD)
- 진행 중인 프로젝트 처리 (endDate가 undefined인 경우)

### 최종 구현 결과

#### 타임라인 구조
- **중앙 기준선**: 수직 타임라인 축
- **날짜 레이블**: 3개월 간격으로 YYYY.MM 형식 표시
- **프로젝트 바**: 왼쪽에 파란색 수직 바
- **경험 바**: 오른쪽에 오렌지색 수직 바
- **순서**: 상단이 최신, 하단이 과거

#### 주요 기능
- **토글 패널**: 우측 사이드에서 슬라이드 인/아웃
- **양방향 하이라이트**: 바 ↔ 프로젝트 카드
- **스크롤 가능**: 긴 타임라인을 스크롤로 탐색
- **반응형 디자인**: 적절한 크기와 간격

#### 기술적 특징
- **TypeScript**: 타입 안전성 보장
- **Tailwind CSS**: 일관된 스타일링
- **React Hooks**: 상태 관리 및 이벤트 처리
- **유틸 함수**: 재사용 가능한 날짜 처리 로직

### 해결된 문제들
1. **날짜 계산 오류**: `startPos > endPos` 문제 해결
2. **바 높이 계산**: 절댓값 사용으로 올바른 기간 표시
3. **타임라인 범위**: 프로젝트 기간과 일치하도록 조정
4. **데이터 통합**: 여러 소스의 프로젝트 데이터 통합 처리
5. **시각적 일관성**: 모든 요소의 일관된 스타일링

### 파일 구조
```
src/
├── features/projects/
│   ├── components/
│   │   ├── HistoryPanel.tsx      # 메인 히스토리 패널
│   │   ├── PanelToggle.tsx       # 토글 버튼
│   │   └── PortfolioSection.tsx  # 통합된 포트폴리오 섹션
│   ├── constants/
│   │   ├── projects.ts           # GitHub 프로젝트
│   │   ├── localProjects.ts      # 로컬 프로젝트
│   │   └── experiences.ts        # 경험 데이터
│   └── types.ts                  # 타입 정의
└── shared/utils/
    └── dateUtils.ts              # 날짜 유틸 함수
```

### 다음 단계
- 사용자 피드백 반영
- 성능 최적화
- 추가 기능 구현 (필터링, 검색 등)

---

## 하이브리드 오류 처리 방식 완성 (2025-01-15)

### 문제 상황
- "개인정보" 요청 시 "서버 오류가 발생했습니다" 표시
- 백엔드에서는 `PERSONAL_INFO` 응답을 정상적으로 보내지만 프론트엔드에서 처리 실패
- `apiClient.ts`에서 응답 구조 파싱 오류
- `ChatMessage.tsx`에서 `React.ReactNode` 처리 미흡

### 해결 과정

#### 1. API 응답 구조 파싱 수정
**문제**: `response.data?.data`로 중첩된 구조에 접근
**해결**: `response.data`로 직접 접근하도록 수정
```typescript
// 수정 전
const chatData = response.data?.data;

// 수정 후  
const chatData = response.data;
```

#### 2. ChatMessage 컴포넌트 개선
**문제**: `React.ReactNode` 타입의 `message.content`를 문자열로만 처리
**해결**: 타입에 따른 조건부 렌더링 구현
```typescript
{typeof message.content === 'string' ? (
  <ReactMarkdown>{message.content}</ReactMarkdown>
) : (
  message.content
)}
```

### 최종 결과
- ✅ "개인정보" 요청 시 적절한 메시지 표시
- ✅ `PERSONAL_INFO` ResponseType 정상 처리
- ✅ 메일 버튼 정상 표시
- ✅ 하이브리드 오류 처리 방식 완전 구현

### 기술적 개선사항
- **타입 안전성**: TypeScript 타입 시스템 완전 활용
- **응답 구조 일관성**: 백엔드-프론트엔드 간 응답 구조 통일
- **사용자 경험**: 명확하고 일관된 오류 메시지 제공
- **개발자 경험**: 디버깅 로그 제거로 코드 정리

---

## 아이디 체계 통일 작업 (2025-07-22)

### 문제점 분석
기존 constants 폴더의 아이디 체계가 일관성이 없는 상태였습니다:
- **프로젝트**: 숫자 ID (1, 2, 3, 5, 6)
- **경력/교육**: 문자열 ID (`exp-001`, `edu-001`, `edu-002`)
- **자격증**: 문자열 ID (`C001`, `C002`)

### 영향도 분석
변경 전 영향도를 파악한 결과:
- **챗봇 기능**: 영향 없음 (title 기반)
- **GitHub API 연동**: 영향 없음 (title 기반)
- **하이라이트 기능**: ID 변경 시 상태 초기화
- **DOM ID**: 자동으로 새로운 ID 적용
- **타입 시스템**: 이미 string으로 정의되어 있어 타입 오류 없음

### 변경 작업

#### 1. 프로젝트 ID 변경
**파일**: `src/features/projects/constants/projects.ts`
```typescript
// Before
{ id: 1, title: 'SKKU FAC' }
{ id: 2, title: 'PYQT5 File Tagger' }
{ id: 3, title: 'AI Portfolio Chatbot' }

// After
{ id: 'proj-001', title: 'SKKU FAC' }
{ id: 'proj-002', title: 'PYQT5 File Tagger' }
{ id: 'proj-003', title: 'AI Portfolio Chatbot' }
```

**파일**: `src/features/projects/constants/localProjects.ts`
```typescript
// Before
{ id: 5, title: '로컬 프로젝트 A' }
{ id: 6, title: '노루그룹 ERP' }

// After
{ id: 'proj-004', title: '로컬 프로젝트 A' }
{ id: 'proj-005', title: '노루그룹 ERP' }
```

#### 2. 자격증 ID 변경
**파일**: `src/features/projects/constants/certifications.ts`
```typescript
// Before
{ id: 'C001', title: 'AWS Certified' }
{ id: 'C002', title: 'Azure Developer' }

// After
{ id: 'cert-001', title: 'AWS Certified' }
{ id: 'cert-002', title: 'Azure Developer' }
```

#### 3. 경력/교육 ID 유지
**파일**: `src/features/projects/constants/experiences.ts`
```typescript
// 이미 통일된 형태 유지
{ id: 'exp-001', title: '디아이티' }
{ id: 'edu-001', title: 'Sesac' }
{ id: 'edu-002', title: 'KH정보교육원' }
```

### 최종 통일된 ID 체계

| 카테고리 | 패턴 | 예시 |
|---------|------|------|
| **프로젝트** | `proj-XXX` | `proj-001`, `proj-002`, `proj-003`, `proj-004`, `proj-005` |
| **경력** | `exp-XXX` | `exp-001` |
| **교육** | `edu-XXX` | `edu-001`, `edu-002` |
| **자격증** | `cert-XXX` | `cert-001`, `cert-002` |

### 개선 효과

#### 1. 일관성 향상
- 모든 ID가 문자열 형태로 통일
- 카테고리별 명확한 접두사 구분
- 확장성 보장 (순서대로 번호 부여)

#### 2. 가독성 개선
- ID만 보고도 카테고리 파악 가능
- 개발자 경험 향상
- 디버깅 시 식별 용이

#### 3. 유지보수성 향상
- 새로운 항목 추가 시 일관된 패턴 적용
- 코드 리뷰 시 ID 체계 이해 용이
- 문서화 효과

### 기술적 특징
- **타입 안전성**: BaseItem 인터페이스에서 이미 `id: string` 정의
- **자동 적용**: 컴포넌트에서 key, highlightedItemId 등 자동 반영
- **호환성**: 기존 기능에 영향 없음
- **확장성**: 새로운 카테고리 추가 시 일관된 패턴 적용 가능

### 변경된 파일 목록
1. `src/features/projects/constants/projects.ts`
2. `src/features/projects/constants/localProjects.ts`
3. `src/features/projects/constants/certifications.ts`

### 다음 단계
- 프로젝트 실행하여 변경사항 확인
- 추가 카테고리 필요 시 일관된 패턴 적용
- ID 체계 문서화

## 히스토리 패널 디자인 개선 작업 (2025-07-22)

### 개요
프로젝트 히스토리 패널의 시각적 디자인과 사용성을 개선하여 더욱 직관적이고 현대적인 타임라인 인터페이스로 발전시켰습니다.

### 주요 개선사항

#### 1. 바 디자인 현대화
- **기존**: 하얀색 배경에 회색 테두리
- **개선**: 어두운 회색 배경(`bg-gray-300`)으로 가시성 향상
- **테두리 제거**: hover 상태가 아닐 때 불필요한 테두리 제거
- **둥근 모서리 제거**: `rounded-lg` 제거로 더 현대적인 직선형 디자인

#### 2. 진행 상태 구분 개선
- **진행 중인 바**: 얇은 선(`w-1`, 4px)으로 표시
- **완료된 바**: 넓은 바(`w-8`, 32px)로 표시
- **시각적 구분**: 선 vs 바로 진행 상태를 명확하게 구분

#### 3. Title 라벨 시스템 개선
- **색상 구분**: 각 타입별로 다른 색상의 title 라벨
  - 프로젝트: 파란색 배경 (`bg-blue-50 border-blue-200 text-blue-700`)
  - 경력: 주황색 배경 (`bg-orange-50 border-orange-200 text-orange-700`)
  - 교육: 초록색 배경 (`bg-green-50 border-green-200 text-green-700`)
- **위치 최적화**: 바의 정확한 중앙에 title 배치
- **Hover 효과**: 하이라이트 시 전체 title 표시 (`max-w-none overflow-visible`)

#### 4. 바 위치 및 크기 조정
- **위치 조정**: 바들을 더 가깝게 배치
  - 교육: 20% (기존 15%)
  - 경력: 40% (기존 35%)
  - 프로젝트: 60% (기존 65%)
- **크기 조정**: 바 너비 증가로 가시성 향상
  - 진행 중인 바: `w-2` → `w-1` (더 얇은 선)
  - 일반 바: `w-6` → `w-8` (더 넓은 바)

#### 5. 상호작용 개선
- **Hover 색상 통일**: 모든 바가 `hover:bg-gray-500`으로 동일한 반응
- **크기 애니메이션 제거**: `scale-105` 제거로 정확한 기간 표시 유지
- **부드러운 전환**: `transition-all duration-200`으로 자연스러운 변화

#### 6. 범례 단순화
- **불필요한 항목 제거**: "진행 중" 항목 제거
- **색상 구분만 표시**: 프로젝트, 경력, 교육 3가지 타입만 범례에 표시
- **시각적 일관성**: 모양(선/바)으로 진행 상태 구분, 색상으로 타입 구분

### 기술적 구현

#### 바 렌더링 로직 개선
```typescript
// 진행 중인 바 (선)
<div className={`w-1 h-full transition-all duration-200 ${
  isHighlighted ? 'bg-green-400 ring-2 ring-green-300' : 'bg-gray-300 hover:bg-gray-500'
}`} />

// 일반 바
<div className={`w-8 mx-auto transition-all duration-300 cursor-pointer ${
  isHighlighted ? 'bg-green-600 shadow-lg' : 'bg-gray-300 hover:bg-gray-500'
}`} />
```

#### Title 색상 시스템
```typescript
const getTitleColor = (type: 'project' | 'experience' | 'education') => {
  switch (type) {
    case 'project': return 'bg-blue-50 border-blue-200 text-blue-700';
    case 'experience': return 'bg-orange-50 border-orange-200 text-orange-700';
    case 'education': return 'bg-green-50 border-green-200 text-green-700';
    default: return 'bg-gray-50 border-gray-200 text-gray-700';
  }
};
```

### 사용자 경험 개선

#### 1. 시각적 명확성
- 바의 어두운 회색으로 배경과 명확한 대비
- Title 색상으로 각 타입을 즉시 구분 가능
- 선/바 모양으로 진행 상태를 직관적으로 파악

#### 2. 상호작용 개선
- Hover 시 색상 변화로 반응성 제공
- Title 전체 표시로 상세 정보 확인 가능
- 크기 변화 없이 정확한 기간 표시 유지

#### 3. 공간 효율성
- 바들을 더 가깝게 배치하여 공간 활용도 향상
- 범례 단순화로 불필요한 정보 제거
- 깔끔하고 현대적인 레이아웃

### 개선 효과

#### 1. 가독성 향상
- 어두운 회색 바로 배경과 명확한 대비
- Title 색상으로 타입 구분 명확화
- 진행 상태를 모양으로 직관적 구분

#### 2. 사용성 개선
- 일관된 hover 효과로 예측 가능한 상호작용
- Title 전체 표시로 정보 접근성 향상
- 정확한 기간 표시로 신뢰성 확보

#### 3. 디자인 현대화
- 불필요한 테두리와 둥근 모서리 제거
- 미니멀하고 깔끔한 디자인
- 색상과 모양의 조화로운 조합

### 변경된 파일
- `src/features/projects/components/HistoryPanel.tsx`

### 다음 단계
- 사용자 피드백 수집 및 추가 개선
- 반응형 디자인 최적화
- 접근성 개선 (키보드 네비게이션 등)

---

## 포트폴리오 데이터 구조 개선 작업 (2025-07-22)

### 개요
실제 이력서 내용에 맞게 포트폴리오 데이터를 정리하고, 프로젝트와 경험을 명확히 구분하여 더욱 정확하고 체계적인 포트폴리오를 구성했습니다.

### 주요 변경사항

#### 1. KH정보교육원 프로젝트 문서화
**목적**: 교육 과정에서 진행한 프로젝트들을 상세한 마크다운 문서로 정리

**구현 내용**:
- `docs/projects/2_CloseToU.md`: 중고거래 게시판 세미 프로젝트
- `docs/projects/3_OnTheTrain.md`: 여행 계획 스케줄러 팀 프로젝트
- 각 프로젝트별 DB 설계, 구현 기능, 기술 스택 상세 기록

**기술적 특징**:
- 마크다운 형식으로 가독성 확보
- 프로젝트별 고유 파일명으로 관리
- README 필드에 파일 경로 연결

#### 2. 프로젝트 데이터 구조 개선
**목적**: GitHub 프로젝트와 로컬 프로젝트를 명확히 구분하고 ID 체계 통일

**구현 내용**:
- **GitHub 프로젝트** (`projects.ts`): 외부 저장소 연결 가능한 프로젝트
- **로컬 프로젝트** (`localProjects.ts`): 회사 내부 또는 교육 과정 프로젝트
- **ID 체계 통일**: `github-XXX`, `local-XXX` 형태로 접두사 구분

**데이터 분류**:
```typescript
// GitHub 프로젝트 (4개)
- proj-001: SKKU FAC (성균관대 갤러리)
- proj-002: PYQT5 File Tagger
- proj-003: AI Portfolio Chatbot
- github-004: Jooongo (중고거래 크롤링)

// 로컬 프로젝트 (4개)
- local-001: 노루화학 BG 차세대 ERP (SAP) 전환 프로젝트
- local-002: (주)디아이티 VMS(버전관리시스템) 통합 프로젝트
- local-003: CloseToU (KH정보교육원)
- local-004: OnTheTrain (KH정보교육원)
```

#### 3. 경력 정보 상세화
**목적**: 운영 업무와 개발 프로젝트를 명확히 구분하여 경력 정보 정확성 향상

**구현 내용**:
- **Experience 인터페이스 확장**:
  - `mainResponsibilities`: 주요 담당 업무 목록
  - `achievements`: 주요 성과/업적 목록
  - `projects`: 담당했던 주요 프로젝트명들

- **디아이티 경력 상세화**:
  - 주요 업무: 영업/물류 ERP 시스템 유지보수, Legacy 프로그램 개발
  - 주요 성과: SAP EAI 인터페이스 개발, 30% 저장공간 절약, Git 전환
  - 담당 프로젝트: SAP 전환, VMS 통합, TMS/DTS 시스템 개발

#### 4. 교육 정보 프로젝트 연결
**목적**: 교육 과정에서 진행한 프로젝트들을 교육 정보와 연결

**구현 내용**:
- **Education 인터페이스 확장**: `projects` 필드 추가
- **Sesac**: AI 관련 프로젝트들 연결
- **KH정보교육원**: 웹 개발 프로젝트들 연결

#### 5. 자격증 정보 간소화
**목적**: 불필요한 필드 제거로 간결하고 명확한 자격증 정보 제공

**구현 내용**:
- **제거된 필드**: `credentialId`, `validUntil`, `credentialUrl`
- **유지된 필드**: `title`, `description`, `technologies`, `issuer`, `startDate`
- **실제 자격증 정보**:
  - SAP Certified Associate - Back-End Developer - ABAP (2024.10)
  - 정보처리기사 (2024.06)

**UI 개선**:
- 취득일자만 표시 ("취득일: 2024.10" 형태)
- 불필요한 정보 제거로 깔끔한 카드 디자인
- 자격증 번호, 유효기간, 인증서 링크 제거

#### 6. UI/UX 개선 - Long Hover 기능
**목적**: 프로젝트 카드와 히스토리 패널 간의 향상된 상호작용

**구현 내용**:
- **Long Hover 시스템**: 1초간 마우스 오버 시 히스토리 패널 스크롤
- **타입별 색상 구분**: 
  - 프로젝트: 파란색 테마 (`hover:shadow-blue-200`)
  - 경력: 회색 테마 (`hover:shadow-gray-400`)
  - 교육: 주황색 테마 (`hover:shadow-orange-200`)
- **양방향 연동**: 카드 ↔ 히스토리 패널 간 상호 하이라이트

**기술적 구현**:
```typescript
// 타이머 기반 Long Hover
const timerRef = React.useRef<NodeJS.Timeout | null>(null);

const handleMouseEnter = () => {
  onMouseEnter?.();
  timerRef.current = setTimeout(() => {
    onLongHover?.(project.id);
  }, 1000);
};

const handleMouseLeave = () => {
  onMouseLeave?.();
  if (timerRef.current) clearTimeout(timerRef.current);
};
```

### 데이터 구조 개선 효과

#### 1. 명확한 구분
- **GitHub 프로젝트**: 외부 저장소 연결, README 동적 로딩
- **로컬 프로젝트**: 회사/교육 내부 프로젝트, 상세 문서 연결
- **경력**: 운영 업무와 개발 프로젝트 명확히 구분
- **교육**: 교육 과정과 연계된 프로젝트들 연결

#### 2. 확장성 확보
- 새로운 프로젝트 추가 시 적절한 카테고리 선택 가능
- ID 체계로 중복 방지 및 일관성 유지
- 타입 시스템으로 컴파일 타임 오류 방지

#### 3. 사용자 경험 향상
- 시각적 구분으로 프로젝트 유형 즉시 파악
- 상세한 경력 정보로 전문성 어필
- 인터랙티브한 히스토리 패널로 경력 발전 과정 시각화

### 기술적 특징

#### 1. 타입 안전성
- TypeScript 인터페이스로 데이터 구조 정의
- 컴파일 타임에 타입 오류 검출
- IDE 자동완성 및 리팩토링 지원

#### 2. 모듈화
- 기능별 파일 분리로 유지보수성 향상
- Barrel exports로 깔끔한 import 구조
- 재사용 가능한 컴포넌트 설계

#### 3. 성능 최적화
- 타이머 기반 Long Hover로 불필요한 이벤트 방지
- 조건부 렌더링으로 불필요한 DOM 요소 제거
- 메모이제이션으로 리렌더링 최적화

### 변경된 파일 목록
1. `docs/projects/2_CloseToU.md` (신규)
2. `docs/projects/3_OnTheTrain.md` (신규)
3. `src/features/projects/constants/projects.ts`
4. `src/features/projects/constants/localProjects.ts`
5. `src/features/projects/constants/experiences.ts`
6. `src/features/projects/constants/certifications.ts`
7. `src/features/projects/types.ts`
8. `src/features/projects/components/ProjectCard.tsx`
9. `src/features/projects/components/ExperienceCard.tsx`
10. `src/features/projects/components/EducationCard.tsx`
11. `src/features/projects/components/PortfolioSection.tsx`
12. `src/features/projects/components/HistoryPanel.tsx`
13. `src/features/projects/components/CertificationCard.tsx`
14. `src/shared/services/geminiService.ts`

### 다음 단계
- 사용자 피드백 수집 및 추가 개선
- 프로젝트 상세 모달 기능 구현
- 타임라인 뷰 기능 확장
- 성능 최적화 및 접근성 개선

---

## 문의/메일 시스템 및 스팸 방지 기능 도입 (2025-07-23)

### 1. EmailJS 기반 문의 시스템 도입
- **EmailJS 연동**: @emailjs/browser 라이브러리 도입, 환경변수로 서비스/템플릿/퍼블릭키 관리
- **문의 모달**: 이름, 이메일, 제목, 문의사항 입력 → EmailJS로 전송 (설정 없으면 mailto로 폴백)
- **템플릿 변수**: name, email, subject, message (EmailJS 기본 변수명에 맞춤)
- **HTML 템플릿**: EmailJS Edit Content에 붙여넣을 수 있는 전문적인 HTML 코드 제공
- **환경변수 예시**: env.example에 실제 ID/키 형식으로 가이드 추가

### 2. 클라이언트 단 스팸 방지 기능
- **시간/횟수 제한**: 시간당 3회, 일일 5회, 1분 간격 제한 (localStorage 기반)
- **24시간 차단**: 일일 한도 초과 시 24시간 차단
- **입력 검증**: 이메일 형식, 메시지 길이(10~1000자) 제한
- **명확한 안내**: 제한 시 구체적 메시지로 안내
- **로컬 스토리지**: 브라우저 재시작 후에도 제한 유지

### 3. 캡차(CAPTCHA) 도입 여부
- **현재 미적용**: react-simple-captcha 등 라이브러리 설치만 안내, 실제 적용은 하지 않음
- **적용 필요 시**: 추후 react-google-recaptcha 등으로 쉽게 확장 가능

### 4. EmailJS 템플릿/환경변수 설정 가이드
- **가입/테스트 완료**: EmailJS 대시보드에서 서비스/템플릿/키 발급 및 테스트 완료
- **템플릿 변수**: name, email, subject, message, time 등 기본 변수 사용
- **Edit Content**: 전문적인 HTML 템플릿 코드 제공 및 적용
- **환경변수 예시**: env.example에 실제 ID/키 형식으로 명확히 안내

### 5. 결론 및 보안
- **EmailJS 자체 제한**: 월 200건(무료), 도메인 제한, 기본 스팸 필터
- **클라이언트 제한**: 반복 제출, 자동화, 악의적 사용 방지
- **캡차 미적용**: 현재는 UX를 위해 미적용, 필요시 확장 가능
- **실제 서비스 오픈 시**: 서버 사이드 검증, IP 기반 제한, 캡차 등 추가 보안 권장

---

## 프로젝트 팀/개인 구분 및 기여 명시 기능 개선 (2025-07-24)

### 1. Project 데이터 구조 확장
- Project 타입에 isTeam(팀/개인 여부), myContributions(내 기여), teamSize, role 필드 추가
- 모든 프로젝트 데이터에 isTeam 필드 명시 (팀: true, 개인: false)
- 노루 화학BG, DIT VMS, OnTheTrain, CloseToU 등 팀 프로젝트에 myContributions 필드로 실제 기여 내용 입력
- OnTheTrain, CloseToU 등도 myContributions 필드에 역할/담당 내용 추가 가능

### 2. 프로젝트 카드 UI 개선
- 카드 이미지(아이콘) 영역 우측 상단에 네모난 팀/개인 배지 추가
  - 팀: 파란색, 개인: 챗봇과 동일한 보라색, 크기 확대
  - 배지에 '팀'/'개인' 텍스트 및 툴팁 제공

### 3. AI 챗봇 프롬프트 및 컨텍스트 개선
- 시스템 프롬프트에 "프로젝트 설명 시 반드시 개인/팀 여부를 구분, 팀 프로젝트는 내 기여를 명시" 규칙 추가
- 프로젝트 컨텍스트 생성 시 isTeam/myContributions 정보를 명확히 포함
  - 팀: '팀 프로젝트: 예', '내 기여: ...'
  - 개인: '팀 프로젝트: 아니오', '내 기여: 전체 기획/개발'
- 챗봇 답변에서 팀/개인 구분 및 내 기여가 항상 명확히 안내됨

### 4. 기타
- constants의 모든 프로젝트에 isTeam 필드 추가로 타입 일관성 확보
- myContributions가 없는 경우 '(기여 내용 미입력)'로 안내

---

## 프로젝트 외부 포트폴리오(Portfolio) 연동 및 모달 개선 (2025-07-24)

### 1. Project 타입 및 데이터 구조 확장
- Project 타입에 externalUrl 필드 추가 (외부 포트폴리오/Notion/블로그 등 연결)
- 주요 프로젝트(성미회 갤러리, FileTagger, AI 포트폴리오 사이트)에 externalUrl 값 추가
- 성미회 갤러리 프로젝트에 liveUrl(https://www.skkuartclub.kr/) 실제 배포 주소 추가

### 2. ProjectModal(프로젝트 상세 모달) 개선
- 버튼 순서: 사이트 바로가기(liveUrl), GitHub, Portfolio(externalUrl)
- 각 버튼은 값이 없거나 #일 때 비활성화 및 툴팁 안내
- Portfolio 버튼 비활성화 시: '외부 포트폴리오가 없습니다. 궁금한 점은 AI 챗봇에게 문의하거나, 개발자에게 메일로 문의해 주세요.' 안내
- 모달 최대 너비 max-w-3xl(768px)로 확대, 내부 여백/정렬 개선
- 타이틀, 설명, 기술스택 모두 보기 좋게 정렬 및 여백 조정

### 3. 사용자 경험 개선
- 외부 포트폴리오가 있는 프로젝트는 Portfolio 버튼을 통해 바로 연결 가능
- 배포된 프로젝트는 사이트 바로가기 버튼 활성화, 미배포/없는 경우 비활성화 및 안내
- 긴 타이틀/설명/기술스택도 넉넉한 레이아웃에서 자연스럽게 표시

---

## 2024-06 GCP Cloud Run 배포 세션 요약

### 주요 진행 상황
- GCP Cloud Run + GitHub Actions 기반 자동 배포 환경 구축
- 환경변수/시크릿 최소화 및 보안 점검
- Dockerfile, deploy.yml, app.config.ts 등 코드/설정 정리
- 배포 자동화 성공

### 주요 결정 및 시행착오
- 민감 정보만 환경변수/시크릿으로 관리, 나머지는 소스코드에 직접 명시
- 서비스 계정 권한, Secret Manager, Artifact Registry, API 활성화 등 GCP 권한 이슈 다수 경험
- 배포 실패 시 상세 에러 로그 확인 및 단계별 원인 분석
- IAM 권한, Secret Manager 권한, Artifact Registry 권한, Service Account User 권한 등 세밀하게 부여 필요
- 최종적으로 모든 권한/시크릿/설정이 정상화되어 배포 성공

### 최종 성공
- Cloud Run에 서비스 정상 배포 및 동작 확인
- GitHub Actions에서 main 브랜치 push 시 자동 배포 동작

---

## Express API 서버 구현 및 보안 강화 (2025-01-15)

### 개요
프론트엔드 번들에서 API 키가 노출되는 보안 취약점을 해결하기 위해 Express.js 기반의 백엔드 API 서버를 구현했습니다.

### 주요 구현 내용

#### 1. Express 서버 아키텍처
- **포트 분리**: 프론트엔드(5173)와 백엔드(3001) 분리
- **보안 미들웨어**: Helmet, CORS, Rate Limiting, Compression
- **로깅**: Morgan을 통한 요청 로깅
- **환경변수 관리**: 서버 사이드에서만 API 키 접근

#### 2. API 엔드포인트 구현
**AI 챗봇 API**
- `POST /api/chat`: Gemini API를 통한 AI 응답 생성
- 입력 검증: 질문 길이 제한(1000자), 필수 필드 검증
- 응답 검증: API 키 없을 때 'I_CANNOT_ANSWER' 반환

**프로젝트 API**
- `GET /api/projects`: 모든 프로젝트 목록 (필터링 지원)
- `GET /api/projects/{id}`: 특정 프로젝트 상세 정보
- 쿼리 파라미터: type, source, isTeam 필터링

**GitHub API**
- `GET /api/github/repos`: GitHub 레포지토리 목록
- `GET /api/github/repos/{name}`: 특정 레포지토리 상세
- `GET /api/github/user`: GitHub 사용자 정보

**정적 데이터 API**
- `GET /api/data/experiences`: 경력 정보
- `GET /api/data/education`: 교육 정보
- `GET /api/data/certifications`: 자격증 정보
- `GET /api/data/all`: 모든 정적 데이터

#### 3. Swagger API 문서화
- **Swagger UI**: `http://localhost:3001/api-docs`
- **완전한 API 명세**: 요청/응답 스키마, 예시, 에러 코드
- **실시간 테스트**: 브라우저에서 직접 API 테스트 가능
- **상세 문서**: `docs/api-documentation.md`

#### 4. 보안 강화
**API 키 보안**
- ✅ **문제 해결**: 프론트엔드 번들에서 API 키 노출 방지
- ✅ **서버 환경변수**: `process.env.GEMINI_API_KEY` 사용
- ✅ **클라이언트 분리**: API 키를 클라이언트에 전송하지 않음

**Rate Limiting**
- 15분당 100회 요청 제한
- API 남용 방지
- 설정 가능한 제한 값

**CORS 설정**
- 허용된 도메인만 접근 가능
- 개발: `http://localhost:5173`
- 프로덕션: 설정 가능한 도메인

**입력 검증**
- 모든 API 요청 데이터 검증
- 질문 길이 제한 (1000자)
- 필수 필드 검증

#### 5. 프로젝트 구조 개선
**백엔드 로직 분리**
- `backend/` 폴더: 기존 서비스 로직
- `server/` 폴더: Express API 서버
- 환경변수 분리: 프론트엔드/백엔드 구분

**의존성 관리**
- Express.js 및 관련 패키지 추가
- Swagger 문서화 도구 추가
- TypeScript 설정 유지

#### 6. 환경변수 설정
**프론트엔드 환경변수**
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key_here
```

**백엔드 환경변수**
```env
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_USERNAME=Yamang02
CONTACT_EMAIL=ljj0210@gmail.com
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

### 기술적 특징

#### 1. 아키텍처 개선
- **서버-클라이언트 분리**: API 키 보안 강화
- **모듈화**: 라우터별 파일 분리
- **타입 안전성**: TypeScript 완전 지원
- **확장성**: 새로운 API 엔드포인트 쉽게 추가

#### 2. 개발자 경험
- **Hot Reload**: `tsx watch`로 개발 편의성
- **API 문서**: Swagger UI로 실시간 테스트
- **에러 처리**: 명확한 에러 메시지와 상태 코드
- **로깅**: 요청/응답 로그로 디버깅 지원

#### 3. 프로덕션 준비
- **보안**: API 키 노출 방지, Rate Limiting
- **성능**: 응답 압축, 캐싱 가능
- **모니터링**: 헬스 체크, 로깅
- **확장성**: 마이크로서비스 아키텍처 준비

### 실행 방법

#### 개발 환경
```bash
# 의존성 설치
npm install

# 환경변수 설정
cp env.example .env.local

# 프론트엔드 실행
npm run dev

# 백엔드 실행
npm run server:dev
```

#### API 문서 확인
- **Swagger UI**: http://localhost:3001/api-docs
- **헬스 체크**: http://localhost:3001/health
- **API 문서**: docs/api-documentation.md

### 보안 개선 효과

#### 1. API 키 보안 ✅
- **이전**: 프론트엔드 번들에 API 키 노출
- **현재**: 서버 환경변수로 안전하게 관리
- **결과**: 클라이언트에서 API 키 접근 불가

#### 2. 요청 제한 ✅
- **Rate Limiting**: API 남용 방지
- **입력 검증**: 악의적 요청 차단
- **CORS**: 허용된 도메인만 접근

#### 3. 모니터링 ✅
- **요청 로깅**: 모든 API 호출 기록
- **에러 추적**: 상세한 에러 정보
- **헬스 체크**: 서버 상태 모니터링

### 다음 단계
- 프론트엔드에서 API 서버 호출하도록 수정
- 프로덕션 환경 배포 설정
- 추가 보안 기능 구현 (JWT, API 키 등)
- 성능 최적화 및 캐싱 전략

### 변경된 파일 목록
1. `package.json` - Express.js 의존성 및 스크립트 추가
2. `server/index.ts` - Express 서버 메인 파일
3. `server/routes/chat.ts` - AI 챗봇 API
4. `server/routes/projects.ts` - 프로젝트 API
5. `server/routes/github.ts` - GitHub API
6. `server/routes/data.ts` - 정적 데이터 API
7. `env.example` - 환경변수 예시 업데이트
8. `docs/api-documentation.md` - API 문서 생성
9. `README.md` - 서버 실행 방법 추가

---

## 백엔드 분리 1차 완료 (2025-01-15)

### 개요
프론트엔드에서 데이터를 정상적으로 fetch했지만 카드로 렌더링하지 않는 문제를 해결하여 백엔드와 프론트엔드의 완전한 분리를 달성했습니다.

### 주요 문제점 및 해결

#### 1. API 응답 구조 불일치 문제
**문제**: 백엔드에서 배열을 직접 반환하는데, 프론트엔드에서 `response.data`를 찾아서 `undefined` 반환
- `getExperiences()`, `getEducation()`, `getCertifications()`, `getProjects()` 모두 동일한 문제

**해결책**:
- `requestDirect` 메서드 추가: 배열을 직접 반환하는 API 엔드포인트용
- 정적 데이터 API 메서드들에서 `response.data` 대신 `response` 직접 반환
- 타입 안전성 확보를 위한 별도 메서드 구현

#### 2. 데이터 구조 불일치 문제
**문제**: 백엔드와 프론트엔드 간 모델 필드명 차이
- **Certification**: 백엔드(`name`, `date`) vs 프론트엔드(`title`, `startDate`)
- **Education**: 백엔드(`endDate: null`) vs 프론트엔드(`endDate?: string`)

**해결책**:
- Certification 타입 수정: `name`, `date`, `credentialUrl` 필드로 통일
- CertificationCard 컴포넌트 수정: 필드명 변경 및 UI 개선
- BaseItem 타입 수정: `endDate?: string | null`로 null 허용
- HistoryPanel 날짜 처리 개선: null 값 필터링 로직 강화

#### 3. 프로젝트 데이터 통합
**문제**: GitHub 프로젝트만 표시되고 로컬 프로젝트가 누락됨

**해결책**:
- App.tsx에서 백엔드 프로젝트와 로컬 프로젝트 합치기
- `const allProjects = [...backendProjectsData, ...LOCAL_PROJECTS]`
- 총 8개 프로젝트 (GitHub 4개 + 로컬 4개) 표시

#### 4. React Key Prop 오류
**문제**: HistoryPanel에서 리스트 렌더링 시 고유한 key 누락

**해결책**:
- `React.Fragment`와 고유한 key 추가
- `key={`education-${education.id}`}` 형태로 타입별 고유 키 생성
- 각 아이템에 고유한 식별자 보장

### 기술적 개선사항

#### 1. API 클라이언트 개선
```typescript
// requestDirect 메서드 추가
private async requestDirect<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // 배열을 직접 반환하는 API용
}

// 정적 데이터 API 수정
async getExperiences(): Promise<any[]> {
  const response = await this.requestDirect<any[]>('/api/data/experiences');
  return response || [];
}
```

#### 2. 타입 시스템 개선
```typescript
// Certification 타입 통일
export interface Certification {
  id: string;
  name: string; // title → name
  description: string;
  issuer: string;
  date: string; // startDate → date
  credentialUrl: string;
}

// BaseItem 타입 개선
export interface BaseItem {
  endDate?: string | null; // null 허용
}
```

#### 3. 컴포넌트 개선
```typescript
// CertificationCard 수정
const formatAcquisitionDate = () => {
  return formatDate(certification.date); // startDate → date
};

// HistoryPanel Key 추가
{educations.map((education, index) => (
  <React.Fragment key={`education-${education.id}`}>
    {renderBarItem(education, 'education', index)}
  </React.Fragment>
))}
```

### 최종 결과

#### 1. 데이터 로딩 성공 ✅
- **경력 정보**: 4개 항목 정상 렌더링
- **교육 정보**: 2개 항목 정상 렌더링  
- **자격증 정보**: 2개 항목 정상 렌더링
- **프로젝트 정보**: 8개 항목 정상 렌더링 (GitHub 4개 + 로컬 4개)

#### 2. 오류 해결 ✅
- **React Key Prop 오류**: 완전 해결
- **API 응답 구조 오류**: 완전 해결
- **데이터 구조 불일치**: 완전 해결
- **프로젝트 누락**: 완전 해결

#### 3. 사용자 경험 개선 ✅
- "정보가 없습니다" 메시지 대신 실제 데이터 표시
- 모든 카드가 정상적으로 렌더링
- 히스토리 패널과의 연동 정상 작동
- 타입 안전성 확보

### 변경된 파일 목록
1. `src/shared/services/apiClient.ts` - API 클라이언트 개선
2. `src/features/projects/types.ts` - 타입 정의 수정
3. `src/features/projects/components/CertificationCard.tsx` - 컴포넌트 수정
4. `src/features/projects/components/HistoryPanel.tsx` - Key Prop 추가
5. `src/features/layout/components/App.tsx` - 프로젝트 데이터 통합

### 다음 단계
- 백엔드 서버 실행 및 테스트
- 프로덕션 환경 배포 준비
- 성능 최적화 및 모니터링
- 추가 기능 구현 (필터링, 검색 등)

### 기술적 특징
- **타입 안전성**: TypeScript로 완전한 타입 정의
- **모듈화**: 기능별 파일 분리로 유지보수성 향상
- **확장성**: 새로운 데이터 타입 추가 시 일관된 패턴 적용
- **성능**: 불필요한 리렌더링 방지 및 최적화
- **사용자 경험**: 직관적이고 반응적인 인터페이스

### 2025-07-24 백엔드/프론트엔드 데이터 구조 및 상수 제거 작업 ✅

#### 주요 변경사항

1. **프로젝트 데이터 소스 완전 API 일원화**
   - 프론트엔드의 constants/localProjects.ts, constants/projects.ts 등 상수 기반 데이터 완전 제거
   - 모든 프로젝트 데이터는 백엔드 API(`/api/data/projects`)에서 받아오도록 통일

2. **로컬 프로젝트 백엔드 통합**
   - `backend/src/main/resources/data/localProjects.json`에 모든 로컬 프로젝트(local-001 ~ local-004) 추가
   - `ProjectService`에서 `projects.json`과 `localProjects.json`을 모두 읽어 합쳐서 반환하도록 수정

3. **Project 모델 확장**
   - `myContributions` 필드를 Project 모델에 추가하여 로컬 프로젝트의 상세 기여 정보도 API로 제공

4. **프론트엔드 상수 import 완전 제거**
   - 프로젝트, 경력, 교육, 자격증 등 모든 데이터는 API에서 받아온 데이터만 사용
   - `constants/index.ts`, `constants/experiences.ts`, `constants/certifications.ts`, `constants/projects.ts`, `constants/localProjects.ts` 등 불필요한 파일 모두 삭제
   - 관련 import/export 구문 및 참조 코드 완전 제거

5. **데이터 일관성 및 유지보수성 향상**
   - 데이터 소스가 백엔드로 일원화되어, 데이터 추가/수정/삭제 시 한 곳만 관리하면 됨
   - 프론트엔드 코드가 단순해지고, 데이터 중복/불일치 문제 완전 해소

6. **기타**
   - API 응답에 모든 프로젝트(local + github)가 포함되는지 console.log로 확인
   - ProjectService의 캐시 및 JSON 파싱 오류 등도 점검하여 모든 프로젝트가 누락 없이 제공되도록 개선

#### 변경된 파일 목록
- `backend/src/main/resources/data/localProjects.json`
- `backend/src/main/java/com/aiportfolio/backend/service/ProjectService.java`
- `backend/src/main/java/com/aiportfolio/backend/model/Project.java`
- `frontend/src/features/projects/constants/index.ts` (삭제)
- `frontend/src/features/projects/constants/experiences.ts` (삭제)
- `frontend/src/features/projects/constants/certifications.ts` (삭제)
- `frontend/src/features/projects/constants/projects.ts` (삭제)
- `frontend/src/features/projects/constants/localProjects.ts` (삭제)
- `frontend/src/features/projects/index.ts` (constants 관련 코드 제거)

## 2025-07-23 LangChain4j Gemini 연동 및 오류 해결 내역

### 1. LangChain4j 최신 버전(Gemini) 연동
- langchain4j-google-ai-gemini 1.1.0-rc1 의존성 추가
- 최신 패키지 구조에 맞춰 GoogleAiGeminiChatModel 사용
- generate() → chat() 메서드로 변경 (자동완성 기반)

### 2. 모델명 및 API Key 설정 개선
- application.yml에 model-name, api-key 분리 관리
- AppConfig에 modelName 필드 추가, 서비스에서 설정값 읽어 사용
- 최신 모델명(gemini-2.5-flash)로 통일, 추후 yml만 수정하면 모델 교체 가능

### 3. 주요 오류 및 해결 과정
- generate() 메서드 없음 → chat(String)으로 변경
- models/null 에러 → model-name 미설정/오타, yml 매핑 오류, 접두어 문제 등 점검
- ListModels API로 실제 사용 가능한 모델명 확인 후 적용
- application.yml, AppConfig, Service 간 값 전달 로그로 검증


### 4. 기타 개선
- Spring DI 통일성: 생성자/필드 주입 혼용 → 필드 @Value 주입 + @PostConstruct 초기화로 통일
- 프론트엔드에서 문자열 타입 체크 및 오류 안내 처리

### 5. 최종 결과
- Gemini 2.5 Flash 모델로 챗봇 정상 작동 확인
- 설정/코드 구조 개선 및 보안 강화

---

## 2025-07-23 배포 과정 문제점 및 해결 내역

### 1. Docker 이미지 오류 해결
**문제**: `ERROR: docker.io/library/openjdk:17-jre-alpine: not found`
- **원인**: `openjdk:17-jre-alpine` 이미지가 더 이상 공식적으로 제공되지 않음
- **해결**: Dockerfile에서 `FROM openjdk:17-jre-alpine`을 `FROM eclipse-temurin:17-jre-alpine`으로 변경
- **결과**: Docker 빌드 성공

### 2. npm workspaces 관련 빌드 오류 해결
**문제**: 
```
Error: Dependencies lock file is not found in /home/runner/work/AI_Portfolio/AI_Portfolio
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```
- **원인**: 루트 `package.json`의 `workspaces` 설정이 CI 환경에서 `package-lock.json` 생성/사용을 방해
- **해결**: 루트 `package.json`에서 `workspaces` 속성 제거
- **결과**: GitHub Actions에서 npm 빌드 성공

### 3. 환경 변수 관리 최적화
**문제**: Secret Manager와 GitHub Secrets 간의 복잡한 연동
- **해결책**:
  - `GEMINI_API_KEY`: GitHub Secrets에서 직접 Cloud Run 환경 변수로 주입
  - `VITE_EMAILJS_PUBLIC_KEY`: GitHub Variables에서 빌드 시 전달 (퍼블릭 키이므로 안전)
  - `VITE_API_BASE_URL`: 프론트엔드 코드에서 기본값을 상대 경로(`''`)로 변경
- **결과**: Secret Manager 의존성 제거, 배포 프로세스 단순화

### 4. GitHub Actions 워크플로우 개선
**문제**: 프론트엔드와 백엔드 빌드 환경 분리 필요
- **해결책**:
  - npm 명령어에 `working-directory: frontend` 추가
  - Maven 명령어에 `working-directory: backend` 추가
  - `cache-dependency-path: frontend/package-lock.json` 설정
- **결과**: 각각의 빌드 환경에서 올바른 디렉토리에서 빌드 실행

### 5. API 엔드포인트 설정 개선
**문제**: 프로덕션에서 `localhost:8080` 참조로 인한 오류
- **해결책**:
  - `frontend/src/shared/services/apiClient.ts`: 기본값을 `''`로 변경
  - `frontend/src/shared/config/app.config.ts`: 기본값을 `''`로 변경
  - `frontend/vite-env.d.ts`: 불필요한 `VITE_GEMINI_API_KEY` 타입 제거
- **결과**: 프로덕션에서 상대 경로로 API 호출, CORS 문제 해결

### 6. 통합 배포 전략 채택
**결정**: 프론트엔드와 백엔드를 하나의 컨테이너로 통합 배포
- **장점**: 
  - 단일 서비스 관리
  - CORS 문제 해결
  - 비용 효율성
- **구현**: Dockerfile 멀티스테이지 빌드로 프론트엔드와 백엔드를 하나의 이미지로 통합

### 7. 포트 설정 통일
**문제**: 개발 환경과 프로덕션 환경의 포트 불일치
- **해결책**:
  - 개발: 프론트엔드(5173), 백엔드(8080)
  - 프로덕션: 통합 컨테이너에서 백엔드(8080)만 사용
  - 프론트엔드는 정적 파일로 서빙
- **결과**: 일관된 포트 사용으로 배포 안정성 향상

### 8. 빌드 최적화
**문제**: 불필요한 빌드 단계와 설정
- **해결책**:
  - `frontend/vite.config.ts`에서 빈 `define: {}` 블록 제거
  - 불필요한 Secret Manager 로딩 단계 제거
  - 빌드 인자 최소화
- **결과**: 빌드 시간 단축 및 오류 가능성 감소

### 최종 배포 성공 요인
1. **Docker 이미지 업데이트**: `eclipse-temurin` 사용으로 이미지 호환성 확보
2. **npm workspaces 제거**: CI 환경에서의 빌드 안정성 확보
3. **환경 변수 단순화**: Secret Manager 의존성 제거로 배포 프로세스 간소화
4. **워크플로우 최적화**: 각 빌드 단계의 작업 디렉토리 명시
5. **API 설정 개선**: 상대 경로 사용으로 프로덕션 환경 호환성 확보

### 배포 아키텍처 최종 구조
- **플랫폼**: Google Cloud Run
- **컨테이너**: 단일 컨테이너 (프론트엔드 + 백엔드 통합)
- **CI/CD**: GitHub Actions
- **환경 변수**: GitHub Secrets/Variables
- **API**: 상대 경로 기반 통신
- **포트**: 8080 (통합 서비스)

---

</rewritten_file>