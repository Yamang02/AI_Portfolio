# Epic E13: profile-content-json

## 목표

- `profile/src/types/profile.ts`의 타입 정의가 `index.html` 실제 콘텐츠 구조를 정확히 반영한다.
- `profile/public/content.json`에 `index.html`의 모든 콘텐츠가 실제 데이터로 채워진다.
- shell(렌더링 로직)이 `content.json`을 읽어 올 때 플레이스홀더가 아닌 실제 내용이 표시될 준비가 된다.

## 배경 / 맥락

### 현재 상태

- `profile/index.html`은 완성된 콘텐츠를 하드코딩으로 포함하고 있다 (hero, identity role 카드, activities 벤토 그리드, interests, CTA).
- `profile/public/content.json`은 placeholder 데이터로 구성되어 있으며, 실제 콘텐츠와 다르다.
- `profile/src/types/profile.ts`의 스키마가 실제 콘텐츠 구조와 불일치한다:
  - `ProfileIdentity` — `keyword`+`narrative` 추상 구조이나 실제는 icon·title·subTitle·body를 가진 4개의 역할 카드
  - `ProfileWork` — 단순 flat 구조이나 실제는 modal 레이아웃(columns/site/none), 미디어 타입, colSpan 등 렌더링 정보 포함
  - `ProfileInterest` — icon 필드 없음

### 문제

shell(React 컴포넌트)이 `content.json`을 읽어 렌더링할 때, 현재 스키마와 데이터로는 `index.html`과 동일한 내용을 표현할 수 없다. 타입 설계가 선행되어야 shell 구현이 올바른 구조로 진행될 수 있다.

## 특이점

- **shell 작업과 분리**: 렌더링 shell(App.tsx, 컴포넌트 구조)은 별도 브랜치에서 진행 중. 이 에픽은 데이터 계층(타입 + JSON)만 다룬다. shell이 이 JSON을 consume하는 시점에 타입이 맞아야 한다.
- **렌더링 정보의 포함 범위**: `colSpan`, `minHeight` 같은 레이아웃 값은 데이터에 포함할지 shell 상수로 처리할지 결정 필요. 각 카드의 비율이 내용에 종속적이므로 JSON에 포함하는 쪽을 기본으로 검토.
- **modal 복잡도**: activities의 modal 레이아웃이 `columns`·`site`·none 세 종류이며 각각 하위 구조가 다름. discriminated union으로 표현한다.
- **icon 값**: Material Symbols 아이콘 이름 문자열로 저장 (e.g. `"school"`, `"explore"`).
- **hero의 이름 표기**: HTML은 영문 "Lee JeongJun"을 h1으로 사용하고, 한국어 "이정준"은 별도 노출 없음. JSON에는 둘 다 보관.
- **fetch 레이어 변경 없음**: `profile/src/api/content.ts`는 현재 구조로 유지. 반환 타입이 `ProfileContent`이므로 타입 재정의 시 자동으로 반영.

## Phase 목록

- [P01: 스키마 재설계 및 타입 정의](./P01.schema-redesign.md)
- [P02: content.json 실제 데이터 작성](./P02.content-json-authoring.md)

## 상태

- [x] P01 완료
- [x] P02 완료
