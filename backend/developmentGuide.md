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

## 🔑 식별자 사용 가이드 (PK vs businessId)

프로젝트는 **내부 식별자(PK)**와 **외부 식별자(businessId)**를 분리하여 사용합니다.

### 📊 식별자 구분

- **PK (Primary Key)**: 데이터베이스 내부 식별자 (`id`, `BIGSERIAL`)
  - 데이터베이스 내부에서만 사용, 외부에 노출하지 않음
  - Foreign Key 참조에 사용

- **businessId**: 외부 식별자 (`business_id`, `VARCHAR(20)`)
  - API 엔드포인트, 응답, URL에 사용

### ✅ DO

- **도메인 모델에 PK와 businessId 모두 포함**
- **내부 참조는 PK로 저장** (`projectId: Long`)
- **API 엔드포인트는 `businessId` 사용** (`/{businessId}`)
- **Application Service에서 변환**
  - API 요청: `businessId` → PK로 변환하여 조회
  - API 응답: PK → `businessId`로 변환하여 노출
- **프로젝트 참조 시 프로젝트의 `businessId`를 조회하여 노출**
- **`businessId`는 Backend에서 자동 생성**

### ❌ DON'T

- **API 엔드포인트에 PK 사용 금지** (`/{id}`)
- **API 응답에 PK 노출 금지** (DTO에 `id` 필드 포함 금지)
- **프로젝트 참조를 businessId로 저장 금지** (FK는 PK 참조)
- **DTO에 PK 포함 금지** (요청/응답 모두)

> 📖 **상세 가이드**: `docs/technical/guides/identifier-usage-guide.md` 참조

## ⚡ 성능 최적화

성능 최적화 관련 가이드라인은 다음 문서를 참고하세요:

- **성능 최적화 가이드**: `docs/technical/guides/backend/performance-optimization-guide.md`
  - N+1 문제 방지
  - 배치 조회 패턴
  - 검색 쿼리 최적화
  - 중복 코드 제거

## 🔗 관련 문서

자세한 내용은 루트 `docs/` 폴더의 문서를 참고하세요.
