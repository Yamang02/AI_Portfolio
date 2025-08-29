# 프론트엔드 Q&A

이 문서는 AI 포트폴리오 프로젝트의 프론트엔드와 관련된 주요 질문과 답변을 포함합니다.

---

### Q: 프론트엔드는 어떤 기술 스택으로 구현되었나요?

> 모던 React 생태계를 활용했습니다:
> 
> **핵심 기술**:
> - **Framework**: React 18 + TypeScript
> - **Build Tool**: Vite
> - **Styling**: CSS Modules + Tailwind CSS
> - **State Management**: React Context API
> - **Architecture**: FSD (Feature Sliced Design)

---

### Q: FSD(Feature Sliced Design) 아키텍처를 선택한 이유는?

> 확장 가능하고 유지보수하기 쉬운 구조를 위해서입니다. 각 기능이 독립적으로 격리되어 팀 협업과 병렬 개발에 용이하고, 새로운 기능을 일관된 구조로 추가할 수 있습니다.

---

### Q: 상태 관리는 어떻게 하나요?

> 컴포넌트 규모에 따라 적절한 상태 관리 방법을 선택했습니다. 간단한 로컬 상태는 `useState`를, 여러 컴포넌트가 공유하는 상태는 `Context API`를, 서버로부터 받아오는 데이터는 자체 제작한 `useFetch` 훅을 사용했습니다.

---

### Q: 반응형 디자인은 어떻게 구현했나요?

> Mobile-First 접근법으로 구현했으며, CSS Grid와 Flexbox를 주로 사용했습니다. `clamp()` 함수로 유연한 폰트 크기를, `rem` 단위를 사용하여 일관된 간격을 유지했습니다.

---

### Q: 성능 최적화는 어떻게 했나요?

> **번들 최적화** 측면에서는 Vite의 Code Splitting과 Tree Shaking을 활용했고, **렌더링 최적화** 측면에서는 `React.memo`, `useMemo`, `useCallback` 등을 사용하여 불필요한 리렌더링을 방지했습니다.

---

### Q: 웹 접근성은 어떻게 고려했나요?

> 시맨틱 HTML 태그를 사용하여 문서 구조의 의미를 명확히 하고, 키보드 네비게이션을 최적화했습니다. 또한, 스크린 리더 사용자를 위해 `aria-label`을 적극적으로 활용하고, WCAG 2.1 AA 기준에 맞는 색상 대비를 유지했습니다.