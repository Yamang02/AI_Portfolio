# Admin Dashboard 상세 설계서

## 1. 개요

### 1.1 목적
포트폴리오 사이트의 프로젝트, 스킬, 경력 등 모든 데이터를 관리할 수 있는 관리자 대시보드의 상세 설계서입니다. 이 문서는 구현 가능한 수준의 기술적 명세를 제공합니다.

### 1.2 기술 스택
- **Backend**: Spring Boot 3.2, Spring Security, PostgreSQL, Redis, Cloudinary
- **Frontend**: React 18, TypeScript, Ant Design, React Query
- **Infrastructure**: Docker, Railway

---

## 2. 데이터베이스 설계

### 2.1 기존 스키마 분석

현재 포트폴리오 프로젝트의 데이터베이스 구조:

```sql
-- 기존 테이블들 (V001__create_initial_schema.sql)
projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    tech_stack TEXT[] NOT NULL,  -- 배열 컬럼 사용
    start_date DATE,
    end_date DATE,
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    image_url VARCHAR(500),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'completed',
    featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

project_skills (
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, skill_id)
);

skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    description TEXT,
    years_of_experience INTEGER,
    last_used DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Admin Dashboard용 스키마 추가

#### V007__create_admin_schema.sql

```sql
-- 관리자 사용자 테이블
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- BCrypt 해시
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_ADMIN',
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 프로젝트 스크린샷 테이블
CREATE TABLE project_screenshots (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    cloudinary_public_id VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- projects 테이블 확장 (Admin Dashboard 기능 추가)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS screenshots TEXT[]; -- 임시 저장용
ALTER TABLE projects ADD COLUMN IF NOT EXISTS readme TEXT; -- 마크다운 컨텐츠 (히스토리 포함)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_team BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_size INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS role VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS my_contributions TEXT[];

-- 인덱스 생성
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_project_screenshots_project_id ON project_screenshots(project_id);
CREATE INDEX idx_projects_is_team ON projects(is_team);
CREATE INDEX idx_projects_readme ON projects(readme) WHERE readme IS NOT NULL;
```

### 2.3 데이터 관계도

```
admin_users (1) ←→ (∞) sessions (Redis)
projects (1) ←→ (∞) project_screenshots
projects (∞) ←→ (∞) skills (through project_skills)
projects (∞) ←→ (∞) experiences (through experience_skills)
```

---

## 3. API 설계

### 3.1 인증 API (`/api/admin/auth`)

#### POST `/api/admin/auth/login`
```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "user": {
    "username": "admin",
    "role": "ROLE_ADMIN",
    "lastLogin": "2024-10-12T10:00:00Z"
  }
}

Response 401:
{
  "success": false,
  "message": "Invalid username or password"
}

Response 423:
{
  "success": false,
  "message": "Account locked. Try again after 30 minutes."
}
```

#### POST `/api/admin/auth/logout`
```http
POST /api/admin/auth/logout

Response 200:
{
  "success": true
}
```

#### GET `/api/admin/auth/session`
```http
GET /api/admin/auth/session

Response 200:
{
  "authenticated": true,
  "user": {
    "username": "admin",
    "role": "ROLE_ADMIN"
  }
}

Response 401:
{
  "authenticated": false
}
```

### 3.2 프로젝트 관리 API (`/api/admin/projects`)

#### GET `/api/admin/projects` - 전체 조회 + 필터링
```http
GET /api/admin/projects?search=포트폴리오&isTeam=team&projectType=BUILD&status=completed&techs=React,Spring&sortBy=startDate&sortOrder=desc

Response 200:
{
  "projects": [
    {
      "id": 1,
      "title": "AI Portfolio",
      "description": "포트폴리오 사이트",
      "readme": "# AI Portfolio\n\n마크다운 컨텐츠...",
      "type": "BUILD",
      "status": "completed",
      "isTeam": false,
      "teamSize": null,
      "role": null,
      "myContributions": [],
      "startDate": "2024-01-01",
      "endDate": null,
      "imageUrl": "https://res.cloudinary.com/...",
      "screenshots": [
        "https://res.cloudinary.com/...",
        "https://res.cloudinary.com/..."
      ],
      "githubUrl": "https://github.com/...",
      "liveUrl": "https://portfolio.com",
      "externalUrl": null,
      "technologies": ["React", "Spring Boot", "PostgreSQL"],
      "sortOrder": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-10-12T10:00:00Z"
    }
  ],
  "totalCount": 15
}
```

#### GET `/api/admin/projects/:id` - 상세 조회
```http
GET /api/admin/projects/1

Response 200:
{
  "project": {
    "id": 1,
    "title": "AI Portfolio",
    "description": "포트폴리오 사이트",
    "readme": "# AI Portfolio\n\n## 프로젝트 개요\n...",
    "type": "BUILD",
    "status": "completed",
    "isTeam": false,
    "teamSize": null,
    "role": null,
    "myContributions": [],
    "startDate": "2024-01-01",
    "endDate": null,
    "imageUrl": "https://res.cloudinary.com/...",
    "screenshots": [
      {
        "id": 1,
        "imageUrl": "https://res.cloudinary.com/...",
        "cloudinaryPublicId": "portfolio/projects/screenshot1",
        "displayOrder": 0
      }
    ],
    "githubUrl": "https://github.com/...",
    "liveUrl": "https://portfolio.com",
    "externalUrl": null,
    "technologies": [
      {
        "id": 1,
        "name": "React",
        "category": "Frontend"
      }
    ],
    "sortOrder": 0,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-10-12T10:00:00Z"
  }
}
```

#### POST `/api/admin/projects` - 프로젝트 생성
```http
POST /api/admin/projects
Content-Type: application/json

{
  "title": "New Project",
  "description": "Project description",
  "readme": "# New Project\n\nMarkdown content",
  "type": "BUILD",
  "status": "in_progress",
  "isTeam": false,
  "startDate": "2024-10-12",
  "technologies": ["React", "Spring Boot"],
  "sortOrder": 0
}

Response 201:
{
  "success": true,
  "project": { ... }
}
```

#### PUT `/api/admin/projects/:id` - 프로젝트 수정
```http
PUT /api/admin/projects/1
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "readme": "# Updated Project\n\nUpdated content",
  ...
}

Response 200:
{
  "success": true,
  "project": { ... }
}
```

#### DELETE `/api/admin/projects/:id` - 프로젝트 삭제
```http
DELETE /api/admin/projects/1

Response 200:
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### 3.3 스킬 관리 API (`/api/admin/skills`)

#### GET `/api/admin/skills` - 전체 조회
```http
GET /api/admin/skills?category=Frontend

Response 200:
{
  "skills": [
    {
      "id": 1,
      "name": "React",
      "category": "Frontend",
      "proficiencyLevel": 5,
      "yearsOfExperience": 3,
      "lastUsed": "2024-10-12",
      "description": "React 프레임워크",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-10-12T10:00:00Z"
    }
  ]
}
```

#### POST `/api/admin/skills` - 스킬 생성
```http
POST /api/admin/skills
Content-Type: application/json

{
  "name": "Vue.js",
  "category": "Frontend",
  "proficiencyLevel": 4,
  "yearsOfExperience": 2,
  "description": "Vue.js 프레임워크"
}

Response 201:
{
  "success": true,
  "skill": { ... }
}
```

### 3.4 이미지 업로드 API (`/api/admin/upload`)

#### POST `/api/admin/upload/image` - 단일 이미지 업로드
```http
POST /api/admin/upload/image
Content-Type: multipart/form-data

FormData:
  - file: [binary]
  - type: "project" | "skill" | "profile"

Response 200:
{
  "success": true,
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/portfolio/projects/abc123.png",
  "publicId": "portfolio/projects/abc123"
}
```

#### POST `/api/admin/upload/images` - 다중 이미지 업로드
```http
POST /api/admin/upload/images
Content-Type: multipart/form-data

FormData:
  - files: [binary, binary, ...]
  - type: "screenshots"

Response 200:
{
  "success": true,
  "urls": [
    "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/portfolio/projects/screenshot1.png",
    "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/portfolio/projects/screenshot2.png"
  ],
  "publicIds": [
    "portfolio/projects/screenshot1",
    "portfolio/projects/screenshot2"
  ]
}
```

#### DELETE `/api/admin/upload/image/:publicId` - 이미지 삭제
```http
DELETE /api/admin/upload/image/portfolio/projects/abc123

Response 200:
{
  "success": true,
  "message": "Image deleted successfully"
}
```

---

## 4. 백엔드 아키텍처

### 4.1 패키지 구조

```
com.aiportfolio.backend
├── domain.admin
│   ├── model
│   │   ├── AdminUser.java
│   │   ├── ProjectManagement.java
│   │   └── dto
│   │       ├── AdminLoginRequest.java
│   │       ├── AdminLoginResponse.java
│   │       ├── ProjectCreateRequest.java
│   │       ├── ProjectUpdateRequest.java
│   │       └── ProjectResponse.java
│   └── port
│       ├── in
│       │   ├── AdminAuthUseCase.java
│       │   ├── AdminProjectUseCase.java
│       │   └── CloudinaryUseCase.java
│       └── out
│           ├── AdminUserRepository.java
│           ├── ProjectManagementRepository.java
│           └── CloudinaryRepository.java
├── application.admin
│   ├── AdminAuthService.java
│   ├── AdminProjectService.java
│   └── CloudinaryService.java
├── infrastructure.web.admin
│   └── controller
│       ├── AdminAuthController.java
│       ├── AdminProjectController.java
│       └── AdminUploadController.java
└── infrastructure.security
    ├── SecurityConfig.java
    ├── AdminAuthenticationProvider.java
    └── AdminSecurityFilter.java
```

### 4.2 Spring Security 설정

#### SecurityConfig.java
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/admin/**").authenticated()
                .requestMatchers("/api/admin/**").authenticated()
                .anyRequest().permitAll()
            )
            .formLogin(form -> form
                .loginPage("/admin/login")
                .loginProcessingUrl("/api/admin/auth/login")
                .defaultSuccessUrl("/admin/dashboard")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/api/admin/auth/logout")
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
                .sessionRegistry(sessionRegistry())
            )
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }
}
```

### 4.3 Cloudinary 설정

#### CloudinaryConfig.java
```java
@Configuration
public class CloudinaryConfig {
    
    @Value("${cloudinary.cloud-name}")
    private String cloudName;
    
    @Value("${cloudinary.api-key}")
    private String apiKey;
    
    @Value("${cloudinary.api-secret}")
    private String apiSecret;
    
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret
        ));
    }
}
```

#### CloudinaryService.java
```java
@Service
public class CloudinaryService {
    
    @Autowired
    private Cloudinary cloudinary;
    
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map<String, Object> params = ObjectUtils.asMap(
            "folder", folder,
            "resource_type", "image",
            "transformation", Arrays.asList(
                ObjectUtils.asMap("width", 1000, "height", 1000, "crop", "limit")
            )
        );
        
        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), params);
        return (String) result.get("secure_url");
    }
    
    public void deleteImage(String publicId) throws Exception {
        cloudinary.uploader().destroy(publicId);
    }
}
```

### 4.4 인증 플로우

```
1. 로그인 시도 → Spring Security AuthenticationFilter
2. AdminAuthenticationProvider 검증
   - BCrypt 비밀번호 확인
   - 계정 잠금 확인 (login_attempts, locked_until)
3. 성공 시:
   - Redis 세션 생성 (JSESSIONID 쿠키)
   - login_attempts 초기화
4. 실패 시:
   - login_attempts 증가
   - 5회 실패 → locked_until 설정 (30분)
5. 이후 요청:
   - SessionAuthenticationFilter가 세션 확인
   - SecurityContext 설정
```

---

## 5. 프론트엔드 아키텍처

### 5.1 라우팅 구조

```
/admin
├── /login (AdminLogin.tsx)
├── /dashboard (Dashboard.tsx)
├── /projects (ProjectList.tsx)
├── /projects/new (ProjectEdit.tsx)
├── /projects/:id/edit (ProjectEdit.tsx)
├── /skills (SkillList.tsx)
├── /experiences (ExperienceList.tsx)
├── /education (EducationList.tsx)
└── /certifications (CertificationList.tsx)
```

### 5.2 컴포넌트 구조

```
src/admin
├── App.tsx (AdminApp - Ant Design ConfigProvider)
├── components
│   ├── layout
│   │   ├── AdminLayout.tsx
│   │   └── AdminHeader.tsx
│   ├── auth
│   │   └── AdminLoginForm.tsx
│   ├── projects
│   │   ├── ProjectList.tsx
│   │   ├── ProjectEdit.tsx
│   │   ├── ProjectForm.tsx (기본 정보)
│   │   ├── MarkdownEditor.tsx (Notion/Obsidian 스타일)
│   │   ├── TechStackSelector.tsx
│   │   ├── MediaUploader.tsx
│   │   └── ProjectFilter.tsx
│   └── common
│       ├── ErrorBoundary.tsx
│       └── ProtectedRoute.tsx
├── hooks
│   ├── useAuth.ts
│   ├── useProjects.ts (React Query)
│   └── useImageUpload.ts
└── api
    ├── adminAuthApi.ts
    ├── adminProjectApi.ts
    └── cloudinaryApi.ts
```

### 5.3 마크다운 에디터

#### 라이브러리 선택
- **@uiw/react-md-editor**: Notion/Obsidian 스타일의 마크다운 에디터
- **기능**: 실시간 미리보기, 이미지 드래그앤드롭, 코드 하이라이팅

#### MarkdownEditor.tsx
```tsx
import MDEditor from '@uiw/react-md-editor';

const MarkdownEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="markdown-editor">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={500}
        data-color-mode="light"
        preview="edit"
      />
    </div>
  );
};
```

### 5.4 Ant Design 테마 설정

#### App.tsx
```tsx
import { ConfigProvider } from 'antd';

const AdminApp: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#8b5cf6', // 기존 프로젝트 색상
          fontFamily: 'Pretendard, sans-serif',
          borderRadius: 8,
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
            siderBg: '#001529',
          },
          Button: {
            borderRadius: 8,
          },
        },
      }}
    >
      <AdminContent />
    </ConfigProvider>
  );
};
```

### 5.5 파일 업로드 플로우

```
1. 프론트엔드: Ant Design Upload 컴포넌트
2. 파일 선택 → Base64 미리보기
3. 업로드 버튼 → POST /api/admin/upload/image
4. 백엔드: CloudinaryService.uploadImage()
   - MultipartFile 받음
   - Cloudinary SDK로 업로드
   - 자동 최적화 (width: 1000, crop: limit)
5. 응답: { url, publicId }
6. 프론트엔드: URL을 폼 상태에 저장
```

---

## 6. 필터링 로직 상세

### 6.1 프론트엔드 필터 구조

프론트엔드 ProjectFilter 구조 참고:

```typescript
interface FilterOptions {
  searchQuery: string; // 제목 검색
  isTeam: 'all' | 'team' | 'individual';
  projectType: 'all' | 'BUILD' | 'LAB' | 'MAINTENANCE';
  status: 'all' | 'completed' | 'in_progress' | 'maintenance';
  selectedTechs: string[]; // 기술 스택 배열
  sortBy: 'startDate' | 'endDate' | 'title' | 'status' | 'sortOrder' | 'type';
  sortOrder: 'asc' | 'desc';
}
```

### 6.2 백엔드 쿼리 파라미터

```
GET /api/admin/projects?
  search=포트폴리오
  &isTeam=team
  &projectType=BUILD
  &status=completed
  &techs=React,Spring
  &sortBy=startDate
  &sortOrder=desc
```

### 6.3 필터링 로직 구현

#### AdminProjectService.java
```java
@Service
public class AdminProjectService {
    
    public List<Project> getProjects(ProjectFilter filter) {
        return projectRepository.findByFilter(
            filter.getSearchQuery(),
            filter.getIsTeam(),
            filter.getProjectType(),
            filter.getStatus(),
            filter.getSelectedTechs(),
            filter.getSortBy(),
            filter.getSortOrder()
        );
    }
}
```

---

## 7. 환경 설정

### 7.1 application-local.yml

```yaml
spring:
  session:
    store-type: redis
    redis:
      namespace: admin:session
  security:
    session:
      cookie:
        http-only: true
        secure: false # local에서는 false
        same-site: lax

cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME}
  api-key: ${CLOUDINARY_API_KEY}
  api-secret: ${CLOUDINARY_API_SECRET}

logging:
  level:
    com.aiportfolio.backend: DEBUG
```

### 7.2 docker-compose.yml (Redis 추가)

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### 7.3 환경 변수

```bash
# .env.local
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 8. 구현 우선순위 및 현재 진행 상황

### ✅ **완료된 기능들**

#### Sprint 1: 인증 및 기본 구조 (100% 완료)
- [x] DB 마이그레이션 (admin_users 테이블) - V002__create_admin_users.sql
- [x] Spring Security 설정 (세션 기반 인증) - SecurityConfig, AdminAuthenticationProvider
- [x] 인증 API (login, logout, session) - AdminAuthController, AdminAuthService
- [x] AdminLayout + 로그인 페이지 - AdminLoginForm, AdminLayout, ProtectedRoute

**구현된 주요 컴포넌트:**
- `AdminUser` 엔티티, `AdminAuthService`, `AdminAuthController`
- `AdminLoginForm`, `AdminLayout`, `ProtectedRoute`, `useAuth` 훅
- Spring Security 세션 기반 인증 완전 구현

#### Sprint 2: 프로젝트 관리 API (100% 완료)
- [x] 프로젝트 CRUD API - AdminProjectController, AdminProjectService
- [x] 프로젝트 필터링 로직 - ProjectFilter, 정렬 및 검색 기능
- [x] 프로젝트 DTO들 - ProjectCreateRequest, ProjectUpdateRequest, ProjectResponse

**구현된 주요 컴포넌트:**
- `AdminProjectController`, `AdminProjectService`
- 프로젝트 필터링 및 정렬 로직 완전 구현

### 🔄 **진행 중인 기능들**

#### Sprint 2: 프로젝트 관리 UI (약 20% 완료)
- [x] ProjectList 컴포넌트 기본 구조만 구현
- [ ] 프로젝트 목록 페이지 실제 구현 (카드 그리드, 필터링 UI)
- [ ] 프로젝트 편집 페이지 구현
- [ ] 마크다운 에디터 통합

### ❌ **미구현 기능들**

#### 데이터베이스 확장
- [ ] project_screenshots 테이블 생성
- [ ] projects 테이블 확장 (readme, is_team, team_size, role, my_contributions)

#### 이미지 관리 시스템
- [ ] Cloudinary 통합 및 설정
- [ ] 이미지 업로드 API 구현
- [ ] 이미지 미리보기 및 삭제 기능

#### 스킬 및 경력 관리
- [ ] 스킬 CRUD API 및 UI
- [ ] 경력 CRUD API 및 UI
- [ ] 교육/자격증 CRUD API 및 UI

#### 보안 강화
- [ ] Rate Limiting 구현
- [ ] 비밀번호 정책 강화
- [ ] HTTPS 강제 (프로덕션)

### 현재 진행률: **약 30% 완료**

---

## 9. 보안 고려사항

### 9.1 인증 보안 ✅ **구현 완료**
- [x] BCrypt 비밀번호 해싱 - AdminUser 엔티티에서 구현
- [x] 로그인 시도 제한 (5회) - AdminAuthenticationProvider에서 구현
- [x] 계정 잠금 메커니즘 (30분) - AdminUser.isLocked() 메서드
- [x] 세션 타임아웃 설정 (30분) - SecurityConfig에서 설정
- [x] HttpOnly, Secure 쿠키 - Spring Security 기본 설정
- [x] 동시 세션 제한 (1개) - SecurityConfig에서 설정

### 9.2 API 보안 ✅ **부분 구현**
- [x] CSRF 토큰 검증 - SecurityConfig에서 설정
- [x] Input Validation (Bean Validation) - @Valid 어노테이션 사용
- [x] SQL Injection 방지 (JPA 사용) - JPA Repository 사용
- [x] XSS 방지 (React 자동 이스케이프) - React 기본 기능
- [x] CORS 설정 (Same-Origin) - Spring Security 기본 설정
- [ ] Rate Limiting (전역) - 미구현

### 9.3 인프라 보안 ❌ **미구현**
- [ ] HTTPS 강제 (프로덕션) - 미구현
- [x] 환경 변수로 민감 정보 관리 - application.yml 사용
- [ ] DB 접근 제한 (화이트리스트 IP) - 미구현
- [ ] 정기적 백업 - 미구현
- [ ] 로그 모니터링 - 미구현

---

## 10. 성능 최적화

### 10.1 백엔드 최적화
- 데이터베이스 인덱스 최적화
- Redis 캐싱 (세션, 자주 조회되는 데이터)
- Cloudinary 이미지 최적화
- API 응답 압축

### 10.2 프론트엔드 최적화
- React Query로 서버 상태 관리
- 컴포넌트 메모이제이션
- 이미지 지연 로딩
- 번들 크기 최적화

---

## 11. 모니터링 및 로깅

### 11.1 로깅
- 구조화된 로깅 (JSON 형태)
- 로그 레벨별 관리
- 에러 로그 집중 모니터링

### 11.2 모니터링
- API 응답 시간 모니터링
- 에러율 추적
- 사용자 활동 로그

---

## 12. 배포 전략

### 12.1 개발 환경
- 로컬 Docker Compose
- Redis, PostgreSQL 컨테이너
- Hot Reload 지원

### 12.2 프로덕션 환경
- Railway 배포
- 환경 변수 관리
- 자동 배포 파이프라인

---

## 13. 참고 자료

### 13.1 기술 문서
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/index.html)
- [Ant Design Components](https://ant.design/components/overview/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [React Query Documentation](https://tanstack.com/query/latest)

### 13.2 UI 참고
- [Strapi Admin Panel](https://strapi.io/)
- [WordPress Dashboard](https://wordpress.org/)
- [Ghost Admin](https://ghost.org/)

---

**문서 작성일**: 2024-10-12  
**최종 수정일**: 2024-12-19 (현재 구현 상황 반영)  
**작성자**: AI Agent (Claude)  
**검토자**: TBD
