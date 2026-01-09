# API 문서화 가이드

## 파일 구조

```
backend/docs/
├── api-spec.yml          # OpenAPI 3.0 스펙 파일
└── README.md             # 이 파일
```

## API 스펙 파일 사용 방법

### 1. Swagger UI로 확인하기

#### 로컬 개발 서버에서 확인
```bash
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

#### orval 사용 (추천)

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

## 주요 API 엔드포인트

### Public API (인증 불필요)
- `GET /api/data/all` - 모든 포트폴리오 데이터
- `GET /api/data/projects` - 프로젝트 목록
- `POST /api/chat/message` - 챗봇 메시지 전송
- `GET /api/github/projects` - GitHub 프로젝트 목록
- `GET /api/tech-stack` - 기술 스택 목록

### Admin API (세션 인증 필요)
- `POST /api/admin/auth/login` - 관리자 로그인
- `POST /api/admin/auth/logout` - 관리자 로그아웃
- `GET /api/admin/auth/session` - 세션 확인
- `GET /api/admin/projects` - 프로젝트 목록 (필터링)
- `POST /api/admin/projects` - 프로젝트 생성
- `PUT /api/admin/projects/{id}` - 프로젝트 수정
- `DELETE /api/admin/projects/{id}` - 프로젝트 삭제

## 인증

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

## 유용한 도구

### VS Code 확장 프로그램
- **OpenAPI (Swagger) Editor** - API 스펙 편집 및 검증
- **REST Client** - VS Code에서 API 테스트

### CLI 도구
```bash
# OpenAPI 스펙 검증
npx @apidevtools/swagger-cli validate backend/docs/api-spec.yml

# OpenAPI 스펙 번들링
npx @apidevtools/swagger-cli bundle backend/docs/api-spec.yml -o backend/docs/api-spec-bundled.yml
```

## 문제 해결

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

## 참고 자료

- [OpenAPI 3.0 스펙](https://swagger.io/specification/)
- [Swagger UI 문서](https://swagger.io/tools/swagger-ui/)
- [Orval 문서](https://orval.dev/)
- [SpringDoc 문서](https://springdoc.org/)
