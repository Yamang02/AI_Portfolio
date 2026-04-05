# Epic E07: 어드민 로그아웃 세션 처리 및 이미지 모달 뷰포트 고정

## 목표

- 어드민 로그아웃 시 서버 세션과 브라우저 쿠키가 동시에 만료되어, 로그아웃 직후 로그인 페이지로 정확히 이동한다.
- 서비스 앱의 아티클 본문에서 이미지 클릭 시 모달이 항상 브라우저 뷰포트 중심에 표시된다.

## 배경 / 맥락

### 현재 상태

E06 에픽에서 어드민을 별도 도메인(`admin.staging.yamang02.com`)으로 분리하는 MPA 전환이 완료되었다.  
서비스 앱은 `www.staging.yamang02.com`에서 동작하며, 아티클 본문은 `@uiw/react-markdown-preview` 라이브러리로 렌더링된다.

### 문제

**로그아웃 미이동 (어드민)**  
백엔드 로그아웃 엔드포인트(`POST /api/admin/auth/logout`)는 서버 측 Redis 세션만 삭제하고, 응답에 `Set-Cookie: SESSION=; Max-Age=0` 헤더를 포함하지 않는다.  
결과적으로 브라우저에 SESSION 쿠키가 잔존하고, `invalidateQueries(['admin-session'])` 호출이 즉시 `/api/admin/auth/session` 재요청을 트리거하여 `isAuthenticated`가 `true`로 되돌아간다.  
이로 인해 `navigate('/admin/login')`이 실행되더라도 세션 복원 흐름과 충돌해 로그인 페이지 이동이 보장되지 않는다.

**이미지 모달 뷰포트 중심 이탈**  
`Modal` 컴포넌트가 `ReactDOM.createPortal`을 사용하지 않아 마크다운 렌더러 내부 DOM 트리 안에서 렌더링된다.  
`@uiw/react-markdown-preview`의 내부 스타일이 새로운 CSS stacking context를 형성하면, `position: fixed`가 뷰포트 대신 해당 컨테이너 기준으로 동작하여 모달이 콘텐츠 영역 중심에 위치한다.

## 특이점

- 백엔드 로그아웃은 `HttpServletResponse`를 받아 `DefaultCookieSerializer`와 동일한 속성으로 `Set-Cookie` 만료 헤더를 추가한다. `SessionConfig`에 설정된 쿠키 이름(`SESSION`), path(`/`), SameSite, Secure, Domain을 동일하게 적용해야 크로스도메인 쿠키가 정확히 삭제된다. (구현은 응답 헤더 직접 작성이어도 되고, Spring Session의 `CookieSerializer`로 만료 쿠키를 내보내는 방식이어도 된다. 속성 일치가 핵심이다.)
- 프론트엔드는 로그아웃 후 쿼리 캐시를 clear(invalidate가 아닌 remove)하거나, navigate를 쿼리 무효화보다 선행시켜 재요청 타이밍 충돌을 방지해야 한다.
- `ReactDOM.createPortal`로 `document.body` 직하에 렌더링하면 조상 컨테이너의 stacking context에 묶이지 않는다. **대상은 디자인 시스템 `Modal`**(`frontend/src/design-system/components/Modal`)이다. 서비스 앱의 아티클 마크다운(`MarkdownRenderer`)과 채팅·프로젝트 검색 등 동일 컴포넌트를 쓰는 화면에 반영된다. **어드민 UI는 Ant Design `Modal`**(`admin/shared/ui` 등)을 쓰므로 이번 변경과 무관하다.

## Phase 목록

- [P01: 어드민 로그아웃 세션/쿠키 처리 수정](./P01.admin-logout-session-fix.md)
- [P02: 이미지 모달 React Portal 적용](./P02.image-modal-portal-fix.md)

## 상태

- [ ] P01 완료
- [ ] P02 완료
