# Admin Dashboard 구현 Todo List

## Sprint 1: 인증 및 기본 구조 (1주)

### Phase 1.1: 데이터베이스 마이그레이션
- [ ] **feat: Add admin_users table for authentication**
  - Create V007__create_admin_schema.sql
  - Add admin_users table with username, password(BCrypt), role, login_attempts, locked_until
  - Add indexes for performance optimization

- [ ] **feat: Add project_screenshots table for image management**
  - Add project_screenshots table with project_id, image_url, display_order, cloudinary_public_id
  - Add foreign key constraint to projects table
  - Add index on project_id

- [ ] **feat: Extend projects table for admin features**
  - Add screenshots TEXT[] column (temporary storage)
  - Add readme TEXT column (markdown content with history)
  - Add is_team BOOLEAN column
  - Add team_size INTEGER column
  - Add role VARCHAR(255) column
  - Add my_contributions TEXT[] column

### Phase 1.2: 백엔드 의존성 및 설정
- [ ] **feat: Add Spring Security dependencies**
  - Add spring-boot-starter-security to pom.xml
  - Add spring-session-data-redis for session management
  - Add cloudinary-java for image upload

- [ ] **feat: Add Redis configuration for session storage**
  - Create RedisConfig.java
  - Configure Redis connection for session storage
  - Add Redis properties to application-local.yml

- [ ] **feat: Add Cloudinary configuration**
  - Create CloudinaryConfig.java
  - Add Cloudinary properties to application-local.yml
  - Add environment variables for Cloudinary credentials

### Phase 1.3: Spring Security 설정
- [ ] **feat: Configure Spring Security for admin authentication**
  - Create SecurityConfig.java
  - Configure session-based authentication
  - Add CSRF token configuration
  - Set up login/logout endpoints

- [ ] **feat: Implement AdminAuthenticationProvider**
  - Create AdminAuthenticationProvider.java
  - Implement BCrypt password verification
  - Add account lock mechanism (5 attempts, 30min lock)
  - Handle login attempt tracking

- [ ] **feat: Add AdminUser entity and repository**
  - Create AdminUser.java entity
  - Create AdminUserRepository.java interface
  - Add JPA annotations and relationships

### Phase 1.4: 인증 API 구현
- [ ] **feat: Implement admin authentication API**
  - Create AdminAuthController.java
  - Implement POST /api/admin/auth/login endpoint
  - Implement POST /api/admin/auth/logout endpoint
  - Implement GET /api/admin/auth/session endpoint

- [ ] **feat: Add authentication DTOs**
  - Create AdminLoginRequest.java
  - Create AdminLoginResponse.java
  - Add validation annotations

- [ ] **feat: Implement AdminAuthService**
  - Create AdminAuthService.java
  - Implement login logic with attempt tracking
  - Implement logout logic with session invalidation
  - Add password validation

### Phase 1.5: 프론트엔드 기본 구조
- [ ] **feat: Add Ant Design dependencies**
  - Add antd to package.json
  - Add @uiw/react-md-editor for markdown editing
  - Add @tanstack/react-query for server state management

- [ ] **feat: Create admin routing structure**
  - Create AdminApp.tsx with ConfigProvider
  - Set up React Router for /admin/* routes
  - Create ProtectedRoute component for authentication

- [ ] **feat: Implement AdminLayout component**
  - Create AdminLayout.tsx with Ant Design Layout
  - Add sidebar navigation menu
  - Add header with user info and logout
  - Apply custom theme (Pretendard font, purple primary color)

- [ ] **feat: Create admin login page**
  - Create AdminLoginForm.tsx
  - Implement login form with Ant Design components
  - Add form validation and error handling
  - Connect to authentication API

## Sprint 2: 프로젝트 관리 (1주)

### Phase 2.1: 프로젝트 관리 API
- [ ] **feat: Create project management DTOs**
  - Create ProjectCreateRequest.java
  - Create ProjectUpdateRequest.java
  - Create ProjectResponse.java
  - Add validation annotations

- [ ] **feat: Implement AdminProjectController**
  - Create AdminProjectController.java
  - Implement GET /api/admin/projects (with filtering)
  - Implement GET /api/admin/projects/:id
  - Implement POST /api/admin/projects
  - Implement PUT /api/admin/projects/:id
  - Implement DELETE /api/admin/projects/:id

- [ ] **feat: Implement project filtering logic**
  - Add ProjectFilter.java for query parameters
  - Implement filtering by search, isTeam, projectType, status, techs
  - Add sorting by startDate, endDate, title, status, sortOrder, type
  - Add sort order (asc/desc) support

- [ ] **feat: Implement AdminProjectService**
  - Create AdminProjectService.java
  - Implement CRUD operations
  - Add project-skill relationship management
  - Add screenshot management logic

### Phase 2.2: Cloudinary 통합
- [ ] **feat: Implement CloudinaryService**
  - Create CloudinaryService.java
  - Implement uploadImage method with optimization
  - Implement deleteImage method
  - Add error handling and logging

- [ ] **feat: Create image upload API**
  - Create AdminUploadController.java
  - Implement POST /api/admin/upload/image
  - Implement POST /api/admin/upload/images
  - Implement DELETE /api/admin/upload/image/:publicId

- [ ] **feat: Add image upload DTOs**
  - Create ImageUploadResponse.java
  - Create MultiImageUploadResponse.java
  - Add proper error handling

### Phase 2.3: 프로젝트 목록 페이지
- [ ] **feat: Create project list page**
  - Create ProjectList.tsx
  - Implement project grid layout with Ant Design Card
  - Add project status badges
  - Add action buttons (edit, delete)

- [ ] **feat: Implement project filtering UI**
  - Create ProjectFilter.tsx
  - Add search input
  - Add dropdown filters (isTeam, projectType, status)
  - Add tech stack filter with badges
  - Add sorting options

- [ ] **feat: Add project list API integration**
  - Create adminProjectApi.ts
  - Implement useProjects hook with React Query
  - Add loading states and error handling
  - Implement real-time filtering

### Phase 2.4: 프로젝트 편집 페이지
- [ ] **feat: Create project edit page structure**
  - Create ProjectEdit.tsx
  - Implement tabbed interface (Basic Info, Content, Tech Stack, Media, Links)
  - Add form state management
  - Add save/cancel functionality

- [ ] **feat: Implement basic info form**
  - Create ProjectForm.tsx
  - Add form fields (title, description, type, status, dates)
  - Add team project information fields
  - Add form validation

- [ ] **feat: Implement markdown editor**
  - Create MarkdownEditor.tsx
  - Integrate @uiw/react-md-editor
  - Add real-time preview
  - Add image drag-and-drop support

- [ ] **feat: Implement tech stack selector**
  - Create TechStackSelector.tsx
  - Add multi-select with search
  - Group by category
  - Show proficiency levels

- [ ] **feat: Implement media uploader**
  - Create MediaUploader.tsx
  - Add main image upload
  - Add multiple screenshots upload
  - Add image preview and delete functionality

## Sprint 3: 스킬 및 경력 관리 (1주)

### Phase 3.1: 스킬 관리 API
- [ ] **feat: Create skill management DTOs**
  - Create SkillCreateRequest.java
  - Create SkillUpdateRequest.java
  - Create SkillResponse.java
  - Add validation annotations

- [ ] **feat: Implement AdminSkillController**
  - Create AdminSkillController.java
  - Implement GET /api/admin/skills (with category filter)
  - Implement GET /api/admin/skills/:id
  - Implement POST /api/admin/skills
  - Implement PUT /api/admin/skills/:id
  - Implement DELETE /api/admin/skills/:id

- [ ] **feat: Implement AdminSkillService**
  - Create AdminSkillService.java
  - Implement CRUD operations
  - Add category management
  - Add proficiency level validation

### Phase 3.2: 스킬 관리 UI
- [ ] **feat: Create skill list page**
  - Create SkillList.tsx
  - Implement skill grid layout
  - Add category tabs
  - Add proficiency level indicators

- [ ] **feat: Create skill edit modal**
  - Create SkillEditModal.tsx
  - Add form fields (name, category, proficiency, experience)
  - Add form validation
  - Add save/cancel functionality

- [ ] **feat: Add skill management API integration**
  - Create adminSkillApi.ts
  - Implement useSkills hook with React Query
  - Add loading states and error handling

### Phase 3.3: 경력 관리 API
- [ ] **feat: Create experience management DTOs**
  - Create ExperienceCreateRequest.java
  - Create ExperienceUpdateRequest.java
  - Create ExperienceResponse.java
  - Add validation annotations

- [ ] **feat: Implement AdminExperienceController**
  - Create AdminExperienceController.java
  - Implement GET /api/admin/experiences
  - Implement GET /api/admin/experiences/:id
  - Implement POST /api/admin/experiences
  - Implement PUT /api/admin/experiences/:id
  - Implement DELETE /api/admin/experiences/:id

- [ ] **feat: Implement AdminExperienceService**
  - Create AdminExperienceService.java
  - Implement CRUD operations
  - Add skill relationship management
  - Add achievement management

### Phase 3.4: 경력 관리 UI
- [ ] **feat: Create experience list page**
  - Create ExperienceList.tsx
  - Implement timeline layout
  - Add company and position info
  - Add employment type badges

- [ ] **feat: Create experience edit page**
  - Create ExperienceEdit.tsx
  - Add form fields (company, position, dates, location)
  - Add markdown editor for description
  - Add skill selection
  - Add achievement management

- [ ] **feat: Add experience management API integration**
  - Create adminExperienceApi.ts
  - Implement useExperiences hook with React Query
  - Add loading states and error handling

### Phase 3.5: 교육 및 자격증 관리
- [ ] **feat: Create education management API**
  - Create AdminEducationController.java
  - Create AdminEducationService.java
  - Implement CRUD operations
  - Add GPA validation

- [ ] **feat: Create certification management API**
  - Create AdminCertificationController.java
  - Create AdminCertificationService.java
  - Implement CRUD operations
  - Add expiry date validation

- [ ] **feat: Create education management UI**
  - Create EducationList.tsx
  - Create EducationEdit.tsx
  - Add form fields (institution, degree, major, GPA)
  - Add date range picker

- [ ] **feat: Create certification management UI**
  - Create CertificationList.tsx
  - Create CertificationEdit.tsx
  - Add form fields (name, issuer, dates, credential ID)
  - Add expiry date warnings

## Sprint 4: 최적화 및 배포 (3일)

### Phase 4.1: 성능 최적화
- [ ] **feat: Add database indexes for performance**
  - Add indexes on frequently queried columns
  - Optimize foreign key relationships
  - Add composite indexes for filtering

- [ ] **feat: Implement Redis caching**
  - Add caching for frequently accessed data
  - Cache user sessions
  - Cache project lists and filters

- [ ] **feat: Optimize frontend performance**
  - Add React.memo for expensive components
  - Implement lazy loading for images
  - Optimize bundle size

### Phase 4.2: 보안 강화
- [ ] **feat: Add rate limiting**
  - Implement rate limiting for login attempts
  - Add global rate limiting for API endpoints
  - Add IP-based restrictions

- [ ] **feat: Enhance input validation**
  - Add Bean Validation annotations
  - Implement custom validators
  - Add XSS protection

- [ ] **feat: Add security headers**
  - Implement Helmet for security headers
  - Add CORS configuration
  - Add content security policy

### Phase 4.3: 모니터링 및 로깅
- [ ] **feat: Implement structured logging**
  - Add JSON logging format
  - Add log levels configuration
  - Add request/response logging

- [ ] **feat: Add error monitoring**
  - Implement global error handling
  - Add error tracking
  - Add performance monitoring

### Phase 4.4: 배포 준비
- [ ] **feat: Add Docker configuration**
  - Update docker-compose.yml with Redis
  - Add Dockerfile for production
  - Add environment variable configuration

- [ ] **feat: Add deployment scripts**
  - Create deployment scripts
  - Add database migration scripts
  - Add backup scripts

- [ ] **feat: Add documentation**
  - Create API documentation
  - Add deployment guide
  - Add troubleshooting guide

## 추가 개선사항 (향후)

### Phase 5.1: 대시보드 기능
- [ ] **feat: Add dashboard statistics**
  - Create Dashboard.tsx
  - Add project count statistics
  - Add skill distribution charts
  - Add recent activity feed

### Phase 5.2: 고급 기능
- [ ] **feat: Add bulk operations**
  - Implement bulk delete for projects
  - Add bulk status updates
  - Add export functionality

- [ ] **feat: Add audit logging**
  - Track all changes to data
  - Add change history
  - Add user activity logs

### Phase 5.3: 모바일 최적화
- [ ] **feat: Add mobile responsiveness**
  - Optimize layout for mobile devices
  - Add touch-friendly interactions
  - Add mobile-specific features

---

## 커밋 메시지 컨벤션

각 커밋은 다음 형식을 따릅니다:
```
feat: Add feature description
fix: Fix bug description
docs: Update documentation
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Build process or auxiliary tool changes
```

## 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/admin-auth`: 인증 기능
- `feature/admin-projects`: 프로젝트 관리 기능
- `feature/admin-skills`: 스킬 관리 기능
- `feature/admin-experiences`: 경력 관리 기능

## 진행 상황 추적

각 Phase 완료 시 체크박스를 업데이트하고, 커밋 해시를 기록합니다.

**현재 진행률**: 0% (0/80 완료)

**예상 완료일**: 2024-11-02 (3주 후)
