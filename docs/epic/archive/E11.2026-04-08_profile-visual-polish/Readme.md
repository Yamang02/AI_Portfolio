# Epic E11: profile-visual-polish

## 목표

- 히어로 섹션 우측에 프로필 사진(`hero_photo.jpg`)이 배치되어 인물 중심의 첫인상을 제공한다.
- 네비게이션 링크가 각 섹션 앵커와 정확히 일치하여 클릭 시 해당 섹션으로 스크롤된다.
- 페이지 내 모든 영문 UI 텍스트(버튼, 섹션 제목, 레이블, 링크 등)가 한국어로 표기된다.
- Identity 섹션이 추상적 철학(관찰/사유/행동) 대신 짧은 소개 단락 + 4개 역할 카드 구조로 교체되어 방문자가 이 사람이 누구인지 구체적으로 파악할 수 있다.

## 배경 / 맥락

### 현재 상태

- `profile/index.html`은 Stitch에서 생성된 HTML 기반이며 Tailwind CDN + Newsreader/Manrope 폰트를 사용한다.
- 히어로 섹션은 텍스트만 있고 인물 사진이 없어 개인 소개 페이지로서 정체성이 약하다.
- 네비게이션(Identity / Works / Connect)이 `href="#"` 상태로 실제 섹션과 연결되지 않는다.
- "What I did", "View Project", "Now I'm interested in", "AI Portfolio", "Built with intentionality" 등 영문 표현이 혼재한다.

### 문제

프로필 페이지가 시각적·기능적으로 미완성 상태다. 인물 사진 부재로 신뢰감이 낮고, 네비게이션이 동작하지 않으며, 영문 혼용이 브랜드 일관성을 해친다.

## 특이점

- **사진 경로**: `profile/public/img/hero_photo.jpg` — Vite `public/` 경로이므로 HTML에서 `/img/hero_photo.jpg`로 참조한다.
- **히어로 레이아웃**: 현재 히어로 섹션은 `flex-col items-start` 단열 구조. 우측 사진 배치를 위해 `md:flex-row`로 전환하고 사진은 `object-cover` + 고정 비율로 처리한다.
- **앵커 일치화**: 각 섹션(`<section>`)에 `id`를 부여하고 nav `<a href>` 를 그에 맞게 연결한다. 부드러운 스크롤은 `scroll-smooth` 클래스로 처리한다.
- **한국어 전환 범위**: UI 레이블·버튼·섹션 헤더만 대상. 이름(Lee Jung-jun), 영문 태그(EDUCATION / TECH 등), 연도 표기는 유지한다.
- **Identity 섹션 개편**: 추상적 3단 철학 구조 → 짧은 bio 단락(Option C) + 4개 역할 카드(Option A) 조합. 카드는 역할명 + 한 줄 증거 형식.

## Phase 목록

- [P01: 히어로 사진 배치](./P01.hero-photo.md)
- [P02: 네비게이션-섹션 앵커 일치화](./P02.nav-anchor.md)
- [P03: 영문 텍스트 한국어 전환](./P03.korean-localization.md)
- [P04: Identity 섹션 개편](./P04.identity-redesign.md)

## 상태

- [x] P01 완료
- [x] P02 완료
- [x] P03 완료
- [x] P04 완료

## 완료
아카이브일: 2026-04-10
