# 개발 프로세스 Q&A

이 문서는 AI 포트폴리오 프로젝트의 개발 프로세스와 관련된 주요 질문과 답변을 포함합니다.

---

### Q: Git 브랜치 전략은?

> Git Flow 기반의 브랜치 전략을 사용합니다:
> 
> **브랜치 구조**:
> - **main**: 프로덕션 릴리스 브랜치
> - **staging**: 스테이징 환경 테스트 브랜치
> - **develop**: 개발 통합 브랜치
> - **feature/***: 기능 개발 브랜치
> - **hotfix/***: 긴급 수정 브랜치
> 
> **워크플로우**:
> 1. feature/xxx → develop (기능 개발)
> 2. develop → staging (스테이징 배포)
> 3. staging → main (프로덕션 배포)

---

### Q: 코드 리뷰 프로세스는?

> Pull Request 기반의 체계적인 코드 리뷰를 진행합니다:
> 
> **리뷰 체크리스트**:
> - **기능 구현**: 요구사항 충족 여부
> - **코드 품질**: 가독성, 유지보수성
> - **성능**: 불필요한 렌더링, 메모리 누수 체크
> - **보안**: 입력 검증, XSS 방지 확인
> - **테스트**: 단위 테스트 커버리지

---

### Q: 코드 스타일은 어떻게 관리하나요?

> 자동화된 도구로 일관성을 유지합니다:
> 
> **Frontend (TypeScript/React)**:
> - ESLint: @typescript-eslint, react-hooks 규칙
> - Prettier: 코드 포맷팅 자동화
> 
> **Backend (Java/Spring)**:
> - Checkstyle: Google Java Style Guide 준수
> - SpotBugs: 정적 분석으로 버그 패턴 감지

---

### Q: 테스트 전략은?

> 다층적 테스트 피라미드 구조를 사용합니다:
> 
> **테스트 레벨**:
> 1. **Unit Tests**: 개별 함수/컴포넌트 테스트
> 2. **Integration Tests**: 서비스 간 연동 테스트
> 3. **E2E Tests**: 사용자 시나리오 테스트
> 
> **테스트 도구**:
> - Frontend: Jest + React Testing Library
> - Backend: JUnit 5 + MockMvc + Testcontainers

---

### Q: 로컬 개발 환경은 어떻게 구성하나요?

> Docker Compose를 활용한 일관된 개발 환경을 구축했습니다. 모든 서비스는 코드 변경 시 자동 재시작(Hot Reload)을 지원하여 개발 생산성을 높였습니다.

---

### Q: 프로젝트 문서화는?

> 다층적 문서화 전략을 사용합니다:
> 
> **기술 문서**:
> - README.md: 프로젝트 개요 및 설치 가이드
> - API 문서: OpenAPI 스펙 기반 자동 생성
> - 아키텍처 문서: Mermaid 다이어그램 활용
> 
> **코드 문서**:
> - JSDoc / Javadoc을 활용한 코드 내 문서화