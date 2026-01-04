# API Documentation

## 📁 파일 구조

```
backend/docs/
├── api-spec.yml          # OpenAPI 3.0 스펙 파일
└── README.md             # 이 파일
```

## 📖 API 스펙 파일 사용 방법

### 1. Swagger UI로 확인하기

#### 로컬 개발 서버에서 확인
애플리케이션을 실행하면 자동으로 Swagger UI에 접근할 수 있습니다:

```bash
# 백엔드 서버 실행
cd backend
./mvnw spring-boot:run

# 브라우저에서 접속
http://localhost:8080/swagger-ui.html
```

#### 온라인 Swagger Editor로 확인
1. [Swagger Editor](https://editor.swagger.io/) 접속
2. `api-spec.yml` 파일 내용 복사
3. 왼쪽 에디터에 붙여넣기
4. 오른쪽에서 API 문서 확인

### 2. Frontend에서 API 클라이언트 자동 생성

#### 방법 1: OpenAPI Generator 사용

**TypeScript/Axios 클라이언트 생성:**
```bash
# OpenAPI Generator 설치 (npm)
npm install -g @openapitools/openapi-generator-cli

# 또는 직접 실행
npx @openapitools/openapi-generator-cli generate \
  -i backend/docs/api-spec.yml \
  -g typescript-axios \
  -o frontend/src/shared/api/generated
```

**React Query hooks 생성:**
```bash
npx @openapitools/openapi-generator-cli generate \
  -i backend/docs/api-spec.yml \
  -g typescript-axios \
  -o frontend/src/shared/api/generated \
  --additional-properties=supportsES6=true,withSeparateModelsAndApi=true,apiPackage=api,modelPackage=models
```

#### 방법 2: orval 사용 (추천)

`orval`은 React Query와의 통합이 우수합니다.

**설치:**
```bash
npm install -D orval
```

**설정 파일 생성 (`orval.config.ts`):**
```typescript
module.exports = {
  'ai-portfolio-api': {
    input: '../backend/docs/api-spec.yml',
    output: {
      mode: 'tags-split',
      target: './src/shared/api/generated',
      schemas: './src/shared/api/models',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/shared/api/apiClient.ts',
          name: 'customInstance',
        },
      },
    },
  },
};
```

**실행:**
```bash
npx orval
```

이렇게 하면 다음과 같은 파일들이 자동 생성됩니다:
```
frontend/src/shared/api/
├── generated/
│   ├── portfolio-data/
│   │   ├── portfolio-data.ts        # API 함수들
│   │   └── portfolio-data.msw.ts    # MSW 핸들러
│   ├── chat/
│   ├── admin-auth/
│   └── ...
└── models/
    ├── project.ts
    ├── chat-request.ts
    └── ...
```

### 3. Postman/Insomnia로 테스트

#### Postman
1. Postman 열기
2. Import > Upload Files
3. `api-spec.yml` 선택
4. Collection이 자동으로 생성됨

#### Insomnia
1. Insomnia 열기
2. Import/Export > Import Data > From File
3. `api-spec.yml` 선택
4. API 스펙이 로드됨

## 🔄 API 스펙 업데이트 워크플로우

### 1. 백엔드 코드 변경 시

컨트롤러나 DTO가 변경되면 `api-spec.yml`도 함께 업데이트해야 합니다:

```bash
# 1. 백엔드 코드 수정
# 예: AdminProjectController.java에 새 엔드포인트 추가

# 2. api-spec.yml 업데이트
# backend/docs/api-spec.yml 파일에 새 엔드포인트 정의 추가

# 3. 변경사항 커밋
git add backend/docs/api-spec.yml
git commit -m "docs: Add new admin project endpoint"
```

### 2. 자동 생성 옵션 (선택사항)

SpringDoc을 이용해 런타임에 OpenAPI 스펙을 생성할 수도 있습니다:

```bash
# 애플리케이션 실행
./mvnw spring-boot:run

# OpenAPI JSON 다운로드
curl http://localhost:8080/v3/api-docs -o backend/docs/api-spec-generated.json

# YAML로 변환 (jq와 yq 필요)
curl http://localhost:8080/v3/api-docs.yaml -o backend/docs/api-spec-generated.yml
```

## 📝 주요 API 엔드포인트

### Public API (인증 불필요)

| 카테고리 | Method | Path | 설명 |
|---------|--------|------|------|
| Portfolio | GET | `/api/data/all` | 모든 포트폴리오 데이터 |
| Portfolio | GET | `/api/data/projects` | 프로젝트 목록 |
| Chat | POST | `/api/chat/message` | 챗봇 메시지 전송 |
| GitHub | GET | `/api/github/projects` | GitHub 프로젝트 목록 |
| Tech Stack | GET | `/api/tech-stack` | 기술 스택 목록 |

### Admin API (세션 인증 필요)

| 카테고리 | Method | Path | 설명 |
|---------|--------|------|------|
| Auth | POST | `/api/admin/auth/login` | 관리자 로그인 |
| Auth | POST | `/api/admin/auth/logout` | 관리자 로그아웃 |
| Auth | GET | `/api/admin/auth/session` | 세션 확인 |
| Projects | GET | `/api/admin/projects` | 프로젝트 목록 (필터링) |
| Projects | POST | `/api/admin/projects` | 프로젝트 생성 |
| Projects | PUT | `/api/admin/projects/{id}` | 프로젝트 수정 |
| Projects | DELETE | `/api/admin/projects/{id}` | 프로젝트 삭제 |

## 🔐 인증

관리자 API는 세션 기반 인증을 사용합니다:

```typescript
// 1. 로그인
const loginResponse = await fetch('http://localhost:8080/api/admin/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // 중요: 세션 쿠키 저장
  body: JSON.stringify({
    username: 'admin',
    password: 'password'
  })
});

// 2. 이후 요청에 자동으로 세션 쿠키 포함
const projectsResponse = await fetch('http://localhost:8080/api/admin/projects', {
  credentials: 'include' // 세션 쿠키 포함
});
```

## 🛠️ 유용한 도구

### VS Code 확장 프로그램
- **OpenAPI (Swagger) Editor** - API 스펙 편집 및 검증
- **REST Client** - VS Code에서 API 테스트

### CLI 도구
```bash
# OpenAPI 스펙 검증
npx @apidevtools/swagger-cli validate backend/docs/api-spec.yml

# OpenAPI 스펙 번들링 (여러 파일로 분리된 경우)
npx @apidevtools/swagger-cli bundle backend/docs/api-spec.yml -o backend/docs/api-spec-bundled.yml
```

## 📚 추가 리소스

- [OpenAPI 3.0 스펙](https://swagger.io/specification/)
- [Swagger UI 문서](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Generator](https://openapi-generator.tech/)
- [Orval 문서](https://orval.dev/)
- [SpringDoc 문서](https://springdoc.org/)

## 🐛 문제 해결

### CORS 오류
Frontend에서 API 호출 시 CORS 오류가 발생하면 `application.yml`을 확인하세요:

```yaml
spring:
  web:
    cors:
      allowed-origins: "http://localhost:3000"
      allowed-methods: GET,POST,PUT,DELETE
      allowed-headers: "*"
      allow-credentials: true
```

### 세션 쿠키 문제
Admin API 호출 시 인증 실패하면:
1. `credentials: 'include'` 옵션 확인
2. 브라우저 개발자 도구 > Application > Cookies 확인
3. `JSESSIONID` 쿠키가 있는지 확인

### API 스펙 검증 오류
```bash
# 스펙 파일 검증
npx @apidevtools/swagger-cli validate backend/docs/api-spec.yml

# 상세 오류 확인
npx swagger-cli validate backend/docs/api-spec.yml --debug
```

---

**작성일**: 2025-01-25
**작성자**: AI Agent (Claude)
**버전**: 1.0
