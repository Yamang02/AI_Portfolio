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

## 🆕 최신 업데이트 (2024년 12월)

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

### 환경 변수 설정 가이드 추가 ✅
- `.env.local` 파일 생성 가이드 제공
- `VITE_GEMINI_API_KEY` 설정 방법 안내
- Google AI Studio에서 API 키 발급 방법 안내

---
*마지막 업데이트: 2024년 12월* 