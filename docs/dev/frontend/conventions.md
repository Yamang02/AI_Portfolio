# Frontend conventions

> Status: maintained
> Scope: `frontend/`, `profile/`

이 문서는 UI·React·TypeScript 관련 코딩 관례를 소유한다. 공통 관례는 [../conventions.md](../conventions.md), 검증 명령은 [../development.md](../development.md)를 따른다.

## 구조와 의존성

- `frontend/src/main/`과 `frontend/src/admin/`는 별도 진입점과 책임을 갖는다. 실제 공개 API 및 공유 계층을 확인한 후 공통화한다.
- `frontend/`의 FSD 계층·슬라이스 간 의존성은 기존 코드와 [프론트엔드 아키텍처 가이드](../../technical/architecture/frontend-architecture.md)를 대조한다. 하위가 상위 책임을 직접 의존하거나 기능 간 내부 구현을 우회 참조하지 않도록 한다.
- `profile/`은 별도의 React 애플리케이션이다. 같은 스택을 사용한다는 이유만으로 FSD나 main/admin 내부 경로를 강제하지 않는다.
- 공유 컴포넌트·훅·어댑터를 새로 만들기 전에 기존 owner, 공개 export, 중복 구현 여부와 실제 재사용 수요를 확인한다.

## 상태와 데이터

- 서버 응답과 원격 동기화는 기존 API/쿼리 계층이 소유하고, 컴포넌트는 가능한 한 가공된 공개 계약을 소비한다.
- 서버 상태, UI 임시 상태, URL/라우팅 상태를 구분한다. 실제 owner 및 lifecycle을 확인하지 않은 채 상태를 이중 저장하지 않는다.
- React Query의 키, 무효화, 캐시 정책은 해당 엔티티/API 경계에서 일관되게 관리한다.
- API 모델과 뷰 모델은 역할이 다르면 분리한다. API 계약을 임의로 복제하거나 프론트 타입만으로 런타임 데이터를 신뢰하지 않는다.

## 컴포넌트와 상호작용

- 페이지는 구성과 라우팅의 책임을 분명히 하고, 복잡한 사용자 행위나 파생 계산은 적절한 소유자에게 둔다.
- 훅은 하나의 명확한 관심사를 캡슐화하며 React effect에서 등록한 이벤트·타이머 등은 lifecycle에 맞춰 정리한다.
- 접근성, 키보드 조작, 포커스 및 오류 상태는 실제 사용자 흐름의 일부로 설계한다.
- 컴포넌트 크기를 일률적인 줄 수로 제한하지 않는다. 분리 여부는 책임·호출 관계·변경 이유에 따른다.

## 스타일과 디자인 시스템

- `frontend/src/design-system/`의 실제 토큰·컴포넌트를 확인하고 기존 의미 토큰을 우선한다.
- CSS Modules/변수와 Tailwind의 사용 범위는 사이트별 실제 구현을 따른다. 모든 스타일에 한 종류의 도구 사용을 강제하지 않는다.
- 재사용 가능한 UI는 기존 토큰, 반응형·테마 정책과 일관되게 구현한다. `profile/`의 독립된 시각 체계도 존중한다.
- jsdom 검사와 빌드 성공은 실제 브라우저 레이아웃·시각적 동작을 증명하지 않는다.

## 검증

- Main/Admin: `npm run build:frontend`, 관련 `npm run test:frontend`.
- Profile: `npm run build:profile`. 루트 package.json에 profile 테스트 스크립트는 아직 없다.
- 동작·UI 변경은 해당 실제 경로 및 소비자를 검사하고 필요한 경우 브라우저 검증을 별도 수행한다.
- 세부 기술 판단은 과거 문서의 예제보다 현재 코드와 명시적으로 채택된 계약을 우선한다.

## Legacy reference

- [코딩 원칙](../../technical/guides/frontend/coding-principles.md): FSD, React Query, 컴포넌트·훅, CSS/디자인 시스템, 오류와 테스트에 관한 과거 상세 가이드. 이 문서와 겹치는 사항은 이 문서가 우선한다.
