# 백엔드 개발 가이드

## 📁 문서 위치

백엔드 관련 상세 문서는 루트 `docs/` 폴더에서 확인할 수 있습니다:

- **아키텍처**: `docs/technical/architecture/`
- **개발 가이드**: `docs/technical/guides/backend/`
- **AI Agent 개발 가이드**: `docs/technical/guides/agent-development-guide.md`
- **API 스펙**: `docs/technical/api-spec.yml`

## 🚀 빠른 시작

```bash
cd backend
./mvnw spring-boot:run
```

## 📚 주요 기술 스택

- Spring Boot 3.x
- LangChain4j
- 헥사고날 아키텍처 (포트 & 어댑터 패턴)

## 🤖 AI 에이전트 활용 가이드

프로젝트에 설정된 AI 에이전트들을 다음과 같이 활용하세요:

- **`@backend-architect`**: RESTful API 설계, 마이크로서비스 경계 정의, 데이터베이스 스키마 설계, 성능 최적화, 확장성 계획 수립 시
- **`@code-reviewer`**: 코드 작성 후 품질 검토, 보안 점검, 리팩토링 제안이 필요할 때
- **`@frontend-developer`**: 프론트엔드와의 API 계약 논의, 데이터 구조 협의 시
- **`@ui-ux-designer`**: API 응답 구조 설계, 사용자 경험 관점에서의 API 개선 논의 시

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
