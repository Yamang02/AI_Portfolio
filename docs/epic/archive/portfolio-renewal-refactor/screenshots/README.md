# 스크린샷 촬영 가이드

## 목적
Phase 0 작업의 일부로 현재 포트폴리오 사이트의 상태를 기록하기 위한 스크린샷을 촬영합니다.

## 저장 위치
`docs/epic/portfolio-renewal-refactor/screenshots/before/`

## 촬영해야 할 스크린샷 목록

### 필수 스크린샷

1. **homepage-full.png**
   - 홈페이지 전체 (스크롤 포함)
   - Hero Section부터 프로젝트 목록까지 전체 화면
   - 해상도: 최소 1920x1080 권장

2. **homepage-hero.png**
   - Hero Section만 (첫 화면)
   - 이름, 소개, 기술 스택이 보이는 영역

3. **homepage-projects.png**
   - 프로젝트 목록 영역
   - 필터 섹션이 보이는 상태

4. **history-panel-open.png**
   - 히스토리 패널이 열린 상태
   - 타임라인이 보이는 화면

5. **chatbot-open.png**
   - 챗봇 패널이 열린 상태
   - 초기 메시지가 보이는 화면

6. **project-detail-full.png**
   - 프로젝트 상세 페이지 전체
   - 헤더부터 상세 설명까지

7. **project-detail-sidebar.png**
   - 프로젝트 상세 페이지 (사이드바 포함)
   - TOC가 보이는 상태

### 반응형 스크린샷

8. **responsive-mobile.png**
   - 모바일 뷰 (375px 너비)
   - 브라우저 개발자 도구로 모바일 뷰로 전환 후 촬영

9. **responsive-tablet.png**
   - 태블릿 뷰 (768px 너비)

## 촬영 방법

### IDE 내장 브라우저 사용 시
1. 브라우저에서 원하는 화면으로 이동
2. IDE의 스크린샷 기능 사용 (일부 IDE는 스크린샷 단축키 제공)
3. 또는 Windows 기본 스크린샷 도구 사용:
   - `Win + Shift + S`: 영역 선택 스크린샷
   - `Alt + Print Screen`: 활성 창 스크린샷

### 브라우저 개발자 도구 사용
1. `F12` 또는 `Ctrl + Shift + I`로 개발자 도구 열기
2. 반응형 모드로 전환 (`Ctrl + Shift + M`)
3. 원하는 해상도 선택
4. 스크린샷 촬영

## 파일명 규칙
- 소문자 사용
- 하이픈(-)으로 단어 구분
- 확장자: `.png` (고해상도 권장)

## 참고사항
- 스크린샷은 나중에 비교 기준점으로 사용되므로 고해상도로 촬영 권장
- 다크 모드와 라이트 모드 모두 촬영하면 더 좋음 (선택사항)
- 스크린샷 촬영 후 `current-state.md`의 섹션 8에 링크 추가
