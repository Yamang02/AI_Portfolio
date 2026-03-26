# P03: 프론트엔드 코드 품질

## 목표

FSD 아키텍처 준수를 강화하고 중복 타입 정의를 제거한다.
이 Phase 완료 후 `ChatPage` 로직이 적절한 슬라이스로 분리되고,
타입 불일치로 인한 버그 위험이 줄어든다.

## 구현 상세

### 1. ChatPage.tsx 분해 (560라인 → 책임 분리)

**문제:** `ChatPage.tsx`에 메시지 상태 관리, 스크롤 로직, 이스터에그 훅 6개,
사용량 조회, 모달 2개, 초기화 로직이 혼재. FSD 기준으로 이 로직들은
`features/chatbot/` 내부로 캡슐화되어야 함.

**접근:**
- `useChatMessages` 훅 추출: 메시지 상태, 전송, 스크롤 관리
- `useChatUsageStatus` 훅 추출: 사용량 조회 로직
- `ChatInputSection` 컴포넌트 추출: 입력 UI
- 위 세 항목을 `features/chatbot/` 하위로 이동
- `ChatPage.tsx`는 조합(composition) 역할만 담당

**변경 파일:**
- `frontend/.../pages/ChatPage/ChatPage.tsx` (로직 제거, 조합 역할만 유지)
- `frontend/.../features/chatbot/hooks/useChatMessages.ts` (신규)
- `frontend/.../features/chatbot/hooks/useChatUsageStatus.ts` (신규)
- `frontend/.../features/chatbot/ui/ChatInputSection.tsx` (신규)

### 2. ResponseType 단일 정의 위치 통일

**문제:** `features/chatbot/types.ts`와 `shared/api/apiClient.ts` 두 곳에
동일한 `ResponseType` union type 정의. 타입 불일치 버그 위험.

**접근:**
- `shared/`(아래 레이어)에서 `features/`(위 레이어)를 import하면 FSD 의존 방향 위반
- `ResponseType`은 `apiClient.ts`(shared)에서도 사용하므로 `shared/types/`로 격상이 유일한 올바른 방향
- `features/chatbot/types.ts`와 `shared/api/apiClient.ts` 양쪽의 중복 정의를 삭제하고
  `shared/types/`에 단일 정의 후 양쪽에서 import

**변경 파일:**
- `frontend/.../shared/types/api.ts` (또는 적절한 shared 타입 파일에 `ResponseType` 추가)
- `frontend/.../shared/api/apiClient.ts` (중복 정의 제거, shared/types에서 import)
- `frontend/.../features/chatbot/types.ts` (중복 정의 제거, shared/types에서 import)

## 체크리스트

- [x] `ChatPage.tsx` 라인 수가 200라인 이하로 줄었는지 확인
- [x] `useChatMessages` 훅이 `features/chatbot/hooks/`에 위치하는지 확인
- [x] `useChatUsageStatus` 훅이 `features/chatbot/hooks/`에 위치하는지 확인
- [x] `ChatInputSection` 컴포넌트가 `features/chatbot/ui/`에 위치하는지 확인
- [ ] 챗봇 기능(메시지 전송, 스크롤, 이스터에그)이 기존과 동일하게 동작하는지 확인 (수동 QA)
- [x] `ResponseType`이 `shared/types/`에만 정의되고 나머지는 import하는지 확인
- [x] FSD 의존 방향 위반 없는지 확인 (shared → features import 없음)
- [x] TypeScript 컴파일 오류 없음 확인 (`npm run build`)
