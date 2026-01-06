# 프론트엔드 개발 가이드

## 📁 문서 위치

프론트엔드 관련 상세 문서는 루트 `docs/` 폴더에서 확인할 수 있습니다:

- **아키텍처**: `docs/technical/architecture/frontend-architecture.md`
- **개발 가이드**: `docs/technical/guides/frontend/`
- **AI Agent 개발 가이드**: `docs/technical/guides/agent-development-guide.md`
- **마이그레이션 가이드**: `docs/archive/frontend-migration/`
- **디자인 시스템**: `docs/technical/design-system/`
  - **컬러 시스템**: `docs/technical/design-system/color-palette.md`
  - **스토리북 문서**: Storybook 실행 후 `Design System/Tokens/Colors` 참조

## 🚀 빠른 시작

```bash
cd frontend
npm install
npm run dev
```

## 📚 주요 기술 스택

- React 19.1.0
- TypeScript
- Tailwind CSS
- Vite
- React Query

## 🎨 컬러 시스템 사용

프로젝트는 업계 표준 컬러 시스템 구조를 따릅니다:

- **Semantic Tokens 사용 권장**: `brandSemantic`, `lightModeSemantic`, `darkModeSemantic` 등
- **CSS 변수 기반**: 모든 컬러 값은 `globals.css`의 CSS 변수(`--color-*`)가 단일 소스
- **자세한 가이드**: 
  - 문서: `docs/technical/design-system/color-palette.md`
  - 스토리북: `npm run storybook` 실행 후 `Design System/Tokens/Colors` 참조
  - 코드: `frontend/src/design-system/tokens/colors.ts`

## 🤖 AI 에이전트 활용 가이드

프로젝트에 설정된 AI 에이전트들을 다음과 같이 활용하세요:

- **`@frontend-developer`**: React 컴포넌트 개발, 상태 관리, 성능 최적화, 접근성 구현 시
- **`@ui-ux-designer`**: UI/UX 설계, 와이어프레임, 디자인 시스템 구축, 사용자 경험 개선 시
- **`@code-reviewer`**: 코드 작성 후 품질 검토, 보안 점검, 리팩토링 제안이 필요할 때
- **`@backend-architect`**: API 설계 검토, 데이터 구조 설계, 백엔드와의 통신 방식 논의 시

## 📝 문서 관리 가이드

`docs/` 폴더의 `epic/`, `issues/`, `backlog/`에 문서를 추가하거나 업데이트할 때는:

1. **같은 디렉토리의 문서 최신화**: 관련 문서들도 함께 업데이트하세요
   - 에픽 문서 추가 시 → `epic/README.md` 업데이트
   - 이슈 문서 추가 시 → `issues/README.md` 및 관련 기능별 폴더 구조 확인
   - 백로그 추가 시 → `backlog/README.md` 확인

2. **문서 간 일관성 유지**: 참조하는 문서들의 링크와 내용이 최신 상태인지 확인

3. **변경 이력 기록**: 중요한 변경사항은 문서 하단에 변경 이력 추가 (템플릿: `docs/templates/documentation-changelog-template.md`)

## 🔗 관련 문서

자세한 내용은 루트 `docs/` 폴더의 문서를 참고하세요.
