# P05: 테스트 기반 구축

## 목표

핵심 회귀 케이스를 방지하는 테스트 기반을 마련한다.
완벽한 커버리지보다 "이게 깨지면 바로 알 수 있는" 핵심 케이스 확보에 집중한다.

## 구현 상세

### 백엔드 테스트 전략

**대상:** 핵심 비즈니스 로직 - 챗봇 입력 검증, 시스템 프롬프트 생성

**접근:**
- `InputValidationService` 단위 테스트: 스팸 패턴, 길이 제한, 정상 케이스
- `ChatApplicationService` 단위 테스트: 시스템 프롬프트 생성 시 포트폴리오 데이터 포함 여부
- `SpamProtectionService` 단위 테스트: `RateLimitStoragePort`를 Mock하여 Rate Limit 로직 검증
  (P02에서 Port를 도입하므로, Redis가 아닌 Port Mock으로 테스트)
- 기존 `src/test/java/` 구조 그대로 사용, JUnit 5 + Mockito

**테스트 규칙:**
- 네이밍: 한글 서술형 (`@Test void 스팸_패턴_입력시_거부된다()`)
- 구조: given-when-then

**생성 파일:**
- `backend/.../application/chatbot/validation/InputValidationServiceTest.java`
- `backend/.../application/chatbot/ChatApplicationServiceTest.java`
- `backend/.../application/chatbot/validation/SpamProtectionServiceTest.java`

### 프론트엔드 테스트 전략

**대상:** 챗봇 핵심 기능 - 메시지 전송, 응답 타입 처리

**접근:**
- `useChatMessages` 훅 단위 테스트: 메시지 추가, 상태 변화 (P03 완료 후 진행)
- `chatbotService` 단위 테스트: API 호출 및 응답 처리
- Vitest + React Testing Library 사용 (이미 devDependencies에 존재)

**테스트 규칙:**
- 네이밍: `describe('useChatMessages', () => { it('메시지 전송 시 목록에 추가된다', ...) })`
- 구조: Arrange-Act-Assert

**생성 파일:**
- `frontend/.../features/chatbot/hooks/useChatMessages.test.ts`
- `frontend/.../features/chatbot/services/chatbotService.test.ts`

### E2E 테스트 (선택, Playwright)

**대상:** 사용자 핵심 시나리오

Playwright가 이미 설정되어 있으므로 최소한의 케이스만 추가:
1. 챗봇 페이지 진입 → 메시지 전송 → 응답 수신
2. 빈 메시지 전송 시 오류 처리 확인
3. 500자 초과 입력 시 UX 동작 확인

**생성 파일:**
- 기존 Playwright 설정의 `testDir` 경로 확인 후 결정 (`test-results/`는 출력 디렉토리이므로 소스 위치가 아님)

## 체크리스트

**백엔드:**
- [x] `InputValidationServiceTest`: 스팸 패턴 거부, 정상 입력 통과, 길이 제한 케이스 통과 (테스트 파일 생성)
- [x] `ChatApplicationServiceTest`: `buildSystemPrompt()` 결과에 포트폴리오 데이터 포함 확인 (현재 코드에서는 userMessage에 컨텍스트가 포함되므로 해당 회귀 케이스로 검증)
- [x] `SpamProtectionServiceTest`: `RateLimitStoragePort` Mock 기반, Rate Limit 초과 시 차단/미초과 시 통과 (테스트 파일 생성)
- [ ] `./mvnw test` 성공 확인 (환경에서 `backend/mvnw` 실행 쉘 `sh`/`bash` 부재로 전체 실행 미확인)

**프론트엔드:**
- [x] `useChatMessages.test.ts`: 메시지 추가, 초기화 동작 확인
- [x] `chatbotService.test.ts`: 정상 응답, 오류 응답 처리 확인
- [x] `npm run test` (또는 `npx vitest`) 성공 확인

**E2E (선택):**
- [ ] 챗봇 메시지 전송 → 응답 수신 E2E 시나리오 통과
- [ ] `npx playwright test` 성공 확인
