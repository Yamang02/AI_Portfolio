# Admin Dashboard PRD (Product Requirements Document)

## 1. 개요

### 1.1 목적
포트폴리오 사이트의 **프로젝트, 스킬, 경력 등 모든 데이터를 관리**할 수 있는 관리자 대시보드를 구축하여, 개발자가 코드 수정 없이 컨텐츠를 업데이트하고 사이트를 운영할 수 있도록 함.

### 1.2 사용자
- **Primary User**: 포트폴리오 사이트 소유자 (개발자 본인)
- **Secondary User**: 향후 확장 시 다른 관리자 추가 가능 (낮은 우선순위)

### 1.3 핵심 목표
- **데이터 관리 자동화**: DB 직접 수정 없이 UI로 CRUD 작업
- **컨텐츠 편집 편의성**: 마크다운 에디터, 이미지 업로드 등 직관적 UI
- **보안성**: 단일 사용자 환경에 최적화된 간단하면서도 안전한 인증 시스템
- **확장성**: 향후 대시보드, API 모니터링 기능 추가 고려

---

## 2. 기능 요구사항

### 2.1 데이터 관리 기능

#### A. 프로젝트 관리
**목적**: 포트폴리오 프로젝트의 모든 정보를 관리

**주요 기능**:
- 프로젝트 목록 조회 (필터링, 정렬)
- 프로젝트 생성/수정/삭제
- 마크다운 컨텐츠 편집 (README, 히스토리 섹션)
- 기술 스택 관리 (다중 선택)
- 이미지/스크린샷 업로드
- 프로젝트 타입, 상태, 정렬 순서 관리
- 팀 프로젝트 정보 (역할, 기여 내용)
- 외부 링크 (GitHub, Demo, Docs 등)

**UI 컴포넌트**:
```
프로젝트 목록 페이지
├── 검색 및 필터 바 (타입, 상태, 기술 스택)
├── 정렬 옵션 (최신순, 제목순, 정렬 순서)
├── 프로젝트 카드 그리드
│   ├── 썸네일 이미지
│   ├── 제목, 요약
│   ├── 상태 배지
│   └── 액션 버튼 (편집, 삭제)
└── 새 프로젝트 추가 버튼

프로젝트 편집 페이지
├── 기본 정보 탭
│   ├── 제목, 설명
│   ├── 타입, 상태, 소스
│   ├── 시작일, 종료일
│   ├── 정렬 순서
│   └── 팀 프로젝트 정보
├── 컨텐츠 탭
│   ├── 마크다운 에디터 (README)
│   ├── 히스토리 템플릿 선택
│   └── 실시간 미리보기
├── 기술 스택 탭
│   ├── 기술 스택 다중 선택
│   └── 카테고리별 그룹화
├── 미디어 탭
│   ├── 메인 이미지 업로드
│   ├── 스크린샷 업로드 (다중)
│   └── 이미지 미리보기 및 삭제
└── 링크 탭
    ├── GitHub URL
    ├── Live Demo URL
    └── External Docs URL
```

#### B. 스킬 관리
**목적**: 기술 스택 및 스킬 데이터를 관리

**주요 기능**:
- 스킬 목록 조회 (카테고리별 필터링)
- 스킬 생성/수정/삭제
- 스킬 카테고리 관리 (Frontend, Backend, Database 등)
- 숙련도 레벨 설정 (1-5)
- 아이콘 URL 관리
- 사용 경험 연수, 마지막 사용일 관리

**UI 컴포넌트**:
```
스킬 목록 페이지
├── 카테고리 탭 (All, Frontend, Backend, Database, etc.)
├── 스킬 카드 그리드
│   ├── 아이콘
│   ├── 스킬명
│   ├── 숙련도 표시
│   └── 액션 버튼
└── 새 스킬 추가 버튼

스킬 편집 모달
├── 스킬명
├── 카테고리 선택
├── 아이콘 URL
├── 숙련도 레벨 (1-5 슬라이더)
├── 사용 경험 (년)
├── 마지막 사용일
└── 설명
```

#### C. 경력 관리
**목적**: 경력 사항 관리

**주요 기능**:
- 경력 목록 조회 (시간순 정렬)
- 경력 생성/수정/삭제
- 회사명, 직책, 기간
- 고용 형태 (정규직, 계약직 등)
- 업무 내용 (마크다운)
- 사용 기술 스택 연결
- 주요 성과 (리스트)

**UI 컴포넌트**:
```
경력 목록 페이지
├── 타임라인 뷰
│   ├── 회사명 + 직책
│   ├── 기간
│   ├── 고용 형태
│   └── 액션 버튼
└── 새 경력 추가 버튼

경력 편집 페이지
├── 기본 정보
│   ├── 회사명
│   ├── 직책
│   ├── 시작일 ~ 종료일 (재직중 체크박스)
│   ├── 위치
│   └── 고용 형태
├── 업무 내용 (마크다운)
├── 사용 기술 (다중 선택)
└── 주요 성과 (동적 리스트)
```

#### D. 교육 및 자격증 관리
**목적**: 학력 및 자격증 정보 관리

**주요 기능**:
- 교육 정보 CRUD (학교, 전공, 학위, 기간, GPA)
- 자격증 CRUD (이름, 발급 기관, 취득일, 만료일, 인증 ID)
- 정렬 순서 관리

**UI 컴포넌트**:
```
교육 목록 페이지
├── 교육 카드 리스트
└── 새 교육 정보 추가

자격증 목록 페이지
├── 자격증 카드 리스트
│   ├── 이름 + 발급 기관
│   ├── 취득일 / 만료일
│   └── 인증 링크
└── 새 자격증 추가
```

### 2.2 대시보드 기능 (Phase 2 - 향후 구현)

#### A. 통계 및 인사이트
- 총 프로젝트 수, 스킬 수, 경력 기간
- 최근 업데이트 이력
- 기술 스택 분포 차트

#### B. API 모니터링 (Phase 3 - 향후 구현)
- API 호출 횟수 및 비용
- 트래픽 분석
- 에러 로그 확인

---

## 3. 인증 및 보안 설계

### 3.1 보안 요구사항
- **단일 사용자 환경**: 관리자는 개발자 본인 1명
- **간단하면서도 안전한 인증**: 복잡한 OAuth보다는 세션 기반 인증
- **HTTPS 필수**: 프로덕션 환경에서 암호화 통신
- **CSRF 방지**: Spring Security CSRF 토큰 활용
- **Rate Limiting**: 로그인 시도 제한

### 3.2 인증 방식 선택

#### 옵션 A: 세션 기반 인증 (권장) ✅

**구조**:
```
사용자 로그인
  → Spring Security 세션 생성
  → 세션 쿠키 발급 (HttpOnly, Secure)
  → 이후 요청에서 세션 검증
```

**장점**:
- ✅ 구현 간단 (Spring Security 기본 기능 활용)
- ✅ 단일 사용자에게 최적화
- ✅ CSRF 보호 기본 제공
- ✅ 세션 만료 시간 관리 용이

**단점**:
- ❌ 서버 재시작 시 세션 유실 (Redis 사용으로 해결 가능)
- ❌ 다중 서버 환경에서 세션 공유 필요 (현재는 단일 서버)

**구현 예시**:
```java
@Configuration
@EnableWebSecurity
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
                .loginProcessingUrl("/admin/login")
                .defaultSuccessUrl("/admin/dashboard")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/admin/logout")
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1) // 동시 세션 1개 제한
                .maxSessionsPreventsLogin(false) // 새 로그인 시 기존 세션 무효화
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
}
```

**사용자 관리**:
```java
@Entity
@Table(name = "admin_users")
public class AdminUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;  // 고정값: "admin"

    @Column(nullable = false)
    private String password;  // BCrypt 해시

    @Column(nullable = false)
    private String role = "ROLE_ADMIN";

    private LocalDateTime lastLogin;
    private Integer loginAttempts = 0;
    private LocalDateTime lockedUntil;
}
```

**관리자 사용자 스키마**:
```sql
-- V002__create_admin_user.sql
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_ADMIN',
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 초기 관리자 계정은 직접 생성 (Spring Boot 애플리케이션에서 관리)
-- 또는 SQL 스크립트로 수동 생성
```

#### 옵션 B: JWT 기반 인증 (과도한 설계)

**구조**:
```
사용자 로그인
  → JWT 발급 (Access Token + Refresh Token)
  → 프론트엔드에서 토큰 저장
  → 이후 요청 헤더에 토큰 포함
```

**장점**:
- ✅ Stateless (서버 재시작에 영향 없음)
- ✅ 다중 서버 환경에 적합

**단점**:
- ❌ 단일 사용자 환경에서 과도한 복잡도
- ❌ 토큰 관리 복잡 (만료, 갱신, 블랙리스트)
- ❌ XSS 공격 위험 (토큰 저장 위치)

**결론**: 단일 사용자 환경에서는 **세션 기반 인증**이 더 적합

### 3.3 보안 강화 전략

#### A. 로그인 보안
```java
@Service
public class AdminAuthService {

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MINUTES = 30;

    public void handleLoginFailure(String username) {
        AdminUser user = adminUserRepository.findByUsername(username);
        if (user == null) return;

        user.setLoginAttempts(user.getLoginAttempts() + 1);

        if (user.getLoginAttempts() >= MAX_LOGIN_ATTEMPTS) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
        }

        adminUserRepository.save(user);
    }

    public void handleLoginSuccess(String username) {
        AdminUser user = adminUserRepository.findByUsername(username);
        if (user == null) return;

        user.setLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLogin(LocalDateTime.now());
        adminUserRepository.save(user);
    }

    public boolean isAccountLocked(String username) {
        AdminUser user = adminUserRepository.findByUsername(username);
        if (user == null || user.getLockedUntil() == null) return false;

        if (user.getLockedUntil().isAfter(LocalDateTime.now())) {
            return true;
        }

        // 잠금 시간 만료 시 자동 해제
        user.setLockedUntil(null);
        user.setLoginAttempts(0);
        adminUserRepository.save(user);
        return false;
    }
}
```

#### B. CSRF 보호
```typescript
// frontend/src/utils/csrf.ts
export const getCsrfToken = (): string | null => {
  const name = 'XSRF-TOKEN';
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return null;
};

// Axios 인터셉터
axios.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken();
  if (csrfToken && config.method !== 'get') {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  return config;
});
```

#### C. 환경 변수 관리
```yaml
# application-production.yml
spring:
  security:
    session:
      cookie:
        http-only: true
        secure: true  # HTTPS만 허용
        same-site: strict
      timeout: 30m  # 세션 만료 시간

admin:
  allowed-ips:  # IP 화이트리스트 (옵션)
    - 127.0.0.1
    - YOUR_HOME_IP
```

#### D. 비밀번호 정책
- 최소 8자 이상
- 영문 대소문자 + 숫자 + 특수문자 포함
- 초기 비밀번호 변경 강제 (첫 로그인 시)

```java
@Component
public class PasswordValidator {

    private static final String PASSWORD_PATTERN =
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    public boolean isValid(String password) {
        return password.matches(PASSWORD_PATTERN);
    }
}
```

### 3.4 권장 인증 플로우

```
1. 사용자가 /admin/login 접속
   ↓
2. username + password 입력
   ↓
3. 백엔드 검증
   - 계정 잠금 상태 확인
   - 비밀번호 검증 (BCrypt)
   - 로그인 시도 횟수 체크
   ↓
4-1. 성공 시:
   - Spring Security 세션 생성
   - JSESSIONID 쿠키 발급 (HttpOnly, Secure)
   - 로그인 시도 횟수 초기화
   - 마지막 로그인 시간 업데이트
   - /admin/dashboard로 리다이렉트
   ↓
4-2. 실패 시:
   - 로그인 시도 횟수 증가
   - 5회 실패 시 계정 30분 잠금
   - 에러 메시지 표시
   ↓
5. 이후 요청:
   - 쿠키에서 JSESSIONID 자동 전송
   - Spring Security가 세션 검증
   - 유효하면 요청 처리
   ↓
6. 로그아웃:
   - /admin/logout 요청
   - 세션 무효화 및 쿠키 삭제
```

---

## 4. 기술 스택

### 4.1 백엔드
- **Framework**: Spring Boot 3.2
- **Security**: Spring Security (세션 기반)
- **Database**: PostgreSQL (기존 테이블 활용)
- **API**: RESTful API
- **Validation**: Bean Validation (Hibernate Validator)

### 4.2 프론트엔드
- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6 (관리자 페이지 전용 라우트)
- **State Management**: React Query (서버 상태), Context API (클라이언트 상태)
- **UI Library**: Ant Design (기존 프로젝트와 일관성 유지)
- **Form Management**: Ant Design Form + Zod
- **Markdown Editor**: CodeMirror 6 또는 Monaco Editor
- **File Upload**: Ant Design Upload 컴포넌트

### 4.3 배포 및 인프라
- **Frontend**: `/admin` 경로로 빌드 (기존 포트폴리오와 동일 도메인)
- **Backend**: 기존 Spring Boot 서버 확장
- **HTTPS**: Railway/Vercel 기본 제공
- **Database**: Railway PostgreSQL (기존 인스턴스)

---

## 5. API 설계

### 5.1 인증 API

```http
# 로그인
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

# 로그아웃
POST /api/admin/auth/logout

Response 200:
{
  "success": true
}

# 세션 확인
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

# 비밀번호 변경
PUT /api/admin/auth/password
Content-Type: application/json

{
  "currentPassword": "old123",
  "newPassword": "new123"
}

Response 200:
{
  "success": true,
  "message": "Password updated successfully"
}
```

### 5.2 프로젝트 관리 API

```http
# 프로젝트 목록 조회
GET /api/admin/projects?type=BUILD&status=completed&sort=created_at,desc

Response 200:
{
  "projects": [
    {
      "id": "PJT001",
      "title": "AI Portfolio",
      "description": "...",
      "type": "BUILD",
      "status": "completed",
      "isTeam": false,
      "imageUrl": "...",
      "technologies": ["React", "Spring Boot"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-10-12T10:00:00Z"
    }
  ],
  "totalCount": 15
}

# 프로젝트 상세 조회
GET /api/admin/projects/{id}

Response 200:
{
  "project": {
    "id": "PJT001",
    "title": "AI Portfolio",
    "description": "...",
    "readme": "# Markdown content...",
    "type": "BUILD",
    "source": "PERSONAL",
    "status": "completed",
    "isTeam": false,
    "role": "Full Stack Developer",
    "myContributions": ["...", "..."],
    "startDate": "2024-01-01",
    "endDate": null,
    "imageUrl": "...",
    "screenshots": ["...", "..."],
    "githubUrl": "...",
    "liveUrl": "...",
    "externalUrl": "...",
    "technologies": [
      {
        "id": "TS001",
        "name": "React",
        "category": "Frontend"
      }
    ],
    "sortOrder": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}

# 프로젝트 생성
POST /api/admin/projects
Content-Type: application/json

{
  "title": "New Project",
  "description": "Project description",
  "readme": "# Markdown content",
  "type": "BUILD",
  "source": "PERSONAL",
  "status": "in_progress",
  "isTeam": false,
  "startDate": "2024-10-12",
  "technologies": ["TS001", "TS002"],
  "sortOrder": 0
}

Response 201:
{
  "success": true,
  "project": { ... }
}

# 프로젝트 수정
PUT /api/admin/projects/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  ...
}

Response 200:
{
  "success": true,
  "project": { ... }
}

# 프로젝트 삭제
DELETE /api/admin/projects/{id}

Response 200:
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### 5.3 스킬 관리 API

```http
# 스킬 목록 조회
GET /api/admin/skills?category=Frontend

Response 200:
{
  "skills": [
    {
      "id": "TS001",
      "name": "React",
      "category": "Frontend",
      "iconUrl": "...",
      "proficiencyLevel": 5,
      "yearsOfExperience": 3,
      "lastUsed": "2024-10-12",
      "description": "..."
    }
  ]
}

# 스킬 생성/수정/삭제 (프로젝트 API와 동일한 패턴)
POST /api/admin/skills
PUT /api/admin/skills/{id}
DELETE /api/admin/skills/{id}
```

### 5.4 경력 관리 API

```http
# 경력 목록 조회
GET /api/admin/experiences

Response 200:
{
  "experiences": [
    {
      "id": 1,
      "company": "ABC Corp",
      "position": "Backend Developer",
      "description": "...",
      "startDate": "2022-01-01",
      "endDate": "2023-12-31",
      "location": "Seoul",
      "employmentType": "FULL_TIME",
      "skills": ["TS001", "TS002"],
      "achievements": ["...", "..."]
    }
  ]
}

# 경력 생성/수정/삭제
POST /api/admin/experiences
PUT /api/admin/experiences/{id}
DELETE /api/admin/experiences/{id}
```

### 5.5 파일 업로드 API (Spring Boot + Cloudinary)

```http
# 이미지 업로드
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

# 다중 이미지 업로드
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

**Spring Boot Cloudinary 설정**:
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
        return new Cloudinary(Map.of(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret
        ));
    }
}

@Service
public class CloudinaryService {
    
    @Autowired
    private Cloudinary cloudinary;
    
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map<String, Object> params = Map.of(
            "folder", folder,
            "resource_type", "image",
            "transformation", Arrays.asList(
                Map.of("width", 1000, "height", 1000, "crop", "limit")
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

---

## 6. UI/UX 설계

### 6.1 레이아웃 구조

```
/admin
├── /login (로그인 페이지 - 전체 화면)
└── /dashboard (관리자 메인 - 사이드바 레이아웃)
    ├── 사이드바
    │   ├── 대시보드
    │   ├── 프로젝트
    │   ├── 스킬
    │   ├── 경력
    │   ├── 교육
    │   ├── 자격증
    │   └── 설정
    └── 메인 컨텐츠 영역
```

### 6.2 로그인 페이지

```tsx
// AdminLogin.tsx (Ant Design 기반)
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const AdminLogin = () => {
  const [form] = Form.useForm();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5'
    }}>
      <Card
        title={
          <Typography.Title level={2} style={{ textAlign: 'center', margin: 0 }}>
            Admin Login
          </Typography.Title>
        }
        style={{ width: 400 }}
      >
        <Form
          form={form}
          name="admin-login"
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter password"
              size="large"
            />
          </Form.Item>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
```

### 6.3 관리자 레이아웃

```tsx
// AdminLayout.tsx (Ant Design 기반 - 기존 구조 참고)
import { Layout, Menu, Avatar, Dropdown, Button, Badge } from 'antd';
import {
  HomeOutlined,
  FolderOutlined,
  CodeOutlined,
  BriefcaseOutlined,
  GraduationCapOutlined,
  TrophyOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: '대시보드',
    },
    {
      key: 'projects',
      icon: <FolderOutlined />,
      label: '프로젝트',
    },
    {
      key: 'skills',
      icon: <CodeOutlined />,
      label: '스킬',
    },
    {
      key: 'experiences',
      icon: <BriefcaseOutlined />,
      label: '경력',
    },
    {
      key: 'education',
      icon: <GraduationCapOutlined />,
      label: '교육',
    },
    {
      key: 'certifications',
      icon: <TrophyOutlined />,
      label: '자격증',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '프로필',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '설정',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#001529',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
        width={200}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          borderBottom: '1px solid #1f1f1f'
        }}>
          Portfolio Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPage]}
          style={{ background: '#001529', paddingTop: '16px' }}
          items={menuItems}
          onClick={({ key }) => navigateTo(key)}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: '64px',
          zIndex: 5
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
              관리자 패널
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Badge count={5} style={{ cursor: 'pointer' }}>
              <BellOutlined style={{ fontSize: '18px', color: '#666' }} />
            </Badge>
            
            <Button
              type="primary"
              icon={<SettingOutlined />}
              style={{ borderRadius: '6px' }}
            >
              설정
            </Button>

            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
              }}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={user?.profileImageUrl}
                />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {user?.name || '관리자'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{
          padding: '24px',
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
```

### 6.4 프로젝트 편집 페이지

```tsx
// AdminProjectEdit.tsx (Ant Design 기반)
import { Card, Tabs, Form, Input, Select, DatePicker, Button, Upload, Space } from 'antd';
import { SaveOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';

const AdminProjectEdit = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');

  const tabItems = [
    {
      key: 'basic',
      label: '기본 정보',
      children: <BasicInfoForm form={form} />,
    },
    {
      key: 'content',
      label: '컨텐츠',
      children: <MarkdownEditor form={form} />,
    },
    {
      key: 'tech',
      label: '기술 스택',
      children: <TechStackSelector form={form} />,
    },
    {
      key: 'media',
      label: '미디어',
      children: <MediaUploader form={form} />,
    },
    {
      key: 'links',
      label: '링크',
      children: <LinksForm form={form} />,
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
              {isNew ? '새 프로젝트' : '프로젝트 편집'}
            </h1>
            <Space>
              <Button icon={<EyeOutlined />}>
                미리보기
              </Button>
              <Button type="primary" icon={<SaveOutlined />}>
                저장
              </Button>
            </Space>
          </div>
        }
        style={{ marginBottom: 24 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
};

// 기본 정보 폼 컴포넌트
const BasicInfoForm = ({ form }) => (
  <Form form={form} layout="vertical">
    <Form.Item
      name="title"
      label="프로젝트 제목"
      rules={[{ required: true, message: '프로젝트 제목을 입력해주세요.' }]}
    >
      <Input size="large" placeholder="프로젝트 제목을 입력하세요" />
    </Form.Item>

    <Form.Item
      name="description"
      label="프로젝트 설명"
      rules={[{ required: true, message: '프로젝트 설명을 입력해주세요.' }]}
    >
      <Input.TextArea
        rows={4}
        placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
      />
    </Form.Item>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Form.Item
        name="type"
        label="프로젝트 타입"
        rules={[{ required: true, message: '프로젝트 타입을 선택해주세요.' }]}
      >
        <Select placeholder="타입 선택" size="large">
          <Select.Option value="BUILD">개발 프로젝트</Select.Option>
          <Select.Option value="STUDY">학습 프로젝트</Select.Option>
          <Select.Option value="RESEARCH">연구 프로젝트</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="status"
        label="상태"
        rules={[{ required: true, message: '상태를 선택해주세요.' }]}
      >
        <Select placeholder="상태 선택" size="large">
          <Select.Option value="completed">완료</Select.Option>
          <Select.Option value="in_progress">진행중</Select.Option>
          <Select.Option value="planned">계획중</Select.Option>
        </Select>
      </Form.Item>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Form.Item
        name="startDate"
        label="시작일"
      >
        <DatePicker style={{ width: '100%' }} size="large" />
      </Form.Item>

      <Form.Item
        name="endDate"
        label="종료일"
      >
        <DatePicker style={{ width: '100%' }} size="large" />
      </Form.Item>
    </div>
  </Form>
);

// 미디어 업로더 컴포넌트
const MediaUploader = ({ form }) => (
  <div>
    <Form.Item
      name="mainImage"
      label="메인 이미지"
    >
      <Upload
        listType="picture-card"
        maxCount={1}
        beforeUpload={() => false} // 자동 업로드 방지
      >
        <div>
          <UploadOutlined />
          <div style={{ marginTop: 8 }}>업로드</div>
        </div>
      </Upload>
    </Form.Item>

    <Form.Item
      name="screenshots"
      label="스크린샷"
    >
      <Upload
        listType="picture-card"
        multiple
        beforeUpload={() => false} // 자동 업로드 방지
      >
        <div>
          <UploadOutlined />
          <div style={{ marginTop: 8 }}>업로드</div>
        </div>
      </Upload>
    </Form.Item>
  </div>
);
```

---

## 7. 구현 계획 및 현재 진행 상황

### 7.1 Phase 1: 인증 및 기본 구조 ✅ **완료**
- [x] Spring Security 세션 기반 인증 구현
- [x] 관리자 계정 테이블 생성 및 초기 데이터 (V002__create_admin_users.sql)
- [x] 로그인/로그아웃 API (AdminAuthController, AdminAuthService)
- [x] 프론트엔드 라우팅 설정 (/admin/*)
- [x] 관리자 레이아웃 (사이드바, 헤더) - AdminLayout 컴포넌트
- [x] 인증 가드 (ProtectedRoute)

**구현된 컴포넌트:**
- `AdminUser` 엔티티, `AdminAuthService`, `AdminAuthController`
- `AdminLoginForm`, `AdminLayout`, `ProtectedRoute`, `useAuth` 훅

### 7.2 Phase 2: 프로젝트 관리 🔄 **진행 중**
- [x] 프로젝트 CRUD API (AdminProjectController, AdminProjectService)
- [x] 프로젝트 필터링 로직 구현
- [ ] 프로젝트 목록 페이지 UI 완성
- [ ] 프로젝트 편집 페이지 (기본 정보)
- [ ] 마크다운 에디터 통합
- [ ] 폼 Validation

**구현된 컴포넌트:**
- `AdminProjectController`, `AdminProjectService`
- `ProjectCreateRequest`, `ProjectUpdateRequest`, `ProjectResponse` DTO
- `ProjectList` 컴포넌트 (기본 구조만)

### 7.3 Phase 3: 데이터베이스 확장 및 이미지 관리 ❌ **미구현**
- [ ] project_screenshots 테이블 생성 (별도 테이블로 관리)
- [x] projects 테이블 확장 (readme, is_team, team_size, role, my_contributions) ✅ **이미 완료됨**
- [ ] Cloudinary 통합 및 설정
- [ ] 이미지 업로드 API 구현
- [ ] 이미지 미리보기 및 삭제 기능

### 7.4 Phase 4: 스킬 및 경력 관리 ❌ **미구현**
- [ ] 스킬 CRUD API 및 UI
- [ ] 경력 CRUD API 및 UI
- [ ] 교육/자격증 CRUD API 및 UI
- [ ] 정렬 순서 관리 (Drag & Drop)

### 7.5 Phase 5: 보안 강화 및 최적화 ❌ **미구현**
- [ ] Rate Limiting (로그인 시도 제한)
- [ ] CSRF 토큰 검증
- [ ] IP 화이트리스트 (옵션)
- [ ] API 응답 최적화
- [ ] 에러 핸들링 개선

### 7.6 Phase 6: 대시보드 및 모니터링 ❌ **미구현**
- [ ] 대시보드 통계 표시
- [ ] API 호출 로깅
- [ ] 에러 로그 확인
- [ ] 트래픽 분석

### 현재 진행률: **약 30% 완료**
- ✅ 인증 시스템 완전 구현
- ✅ 기본 레이아웃 완전 구현  
- 🔄 프로젝트 관리 API 구현 (UI 부분 완성 필요)
- ❌ 나머지 기능들 미구현

---

## 8. 보안 체크리스트

### 8.1 인증 보안
- [x] 비밀번호 BCrypt 해싱 ✅ **구현됨** (AdminUser 엔티티)
- [x] 로그인 시도 제한 (5회) ✅ **구현됨** (AdminAuthenticationProvider)
- [x] 계정 잠금 메커니즘 (30분) ✅ **구현됨** (AdminUser.isLocked())
- [x] 세션 타임아웃 설정 (30분) ✅ **구현됨** (SecurityConfig)
- [x] HttpOnly, Secure 쿠키 ✅ **구현됨** (Spring Security 기본)
- [x] 동시 세션 제한 (1개) ✅ **구현됨** (SecurityConfig)
- [ ] 비밀번호 강도 검증 ❌ **미구현**
- [ ] 초기 비밀번호 변경 강제 ❌ **미구현**

### 8.2 API 보안
- [x] CSRF 토큰 검증 ✅ **구현됨** (SecurityConfig)
- [ ] Rate Limiting (전역) ❌ **미구현**
- [x] Input Validation (Bean Validation) ✅ **구현됨** (@Valid 어노테이션)
- [x] SQL Injection 방지 (JPA 사용) ✅ **구현됨** (JPA Repository)
- [x] XSS 방지 (React 자동 이스케이프) ✅ **구현됨** (React 기본)
- [x] CORS 설정 (Same-Origin) ✅ **구현됨** (Spring Security 기본)

### 8.3 인프라 보안
- [ ] HTTPS 강제 (프로덕션) ❌ **미구현**
- [x] 환경 변수로 민감 정보 관리 ✅ **구현됨** (application.yml)
- [ ] DB 접근 제한 (화이트리스트 IP) ❌ **미구현**
- [ ] 정기적 백업 ❌ **미구현**
- [ ] 로그 모니터링 ❌ **미구현**

---

## 9. 예상 효과

### 9.1 개발 효율성
- ✅ **코드 수정 불필요**: UI로 데이터 관리
- ✅ **빠른 컨텐츠 업데이트**: 마크다운 에디터로 실시간 편집
- ✅ **이미지 관리 편의성**: 드래그 앤 드롭 업로드

### 9.2 유지보수성
- ✅ **DB 직접 수정 감소**: SQL 쿼리 불필요
- ✅ **데이터 정합성**: Validation으로 잘못된 데이터 방지
- ✅ **변경 이력 관리**: 향후 감사 로그 추가 가능

### 9.3 확장성
- ✅ **대시보드 추가 가능**: 통계, 모니터링
- ✅ **다중 사용자 지원**: 향후 권한 관리 확장
- ✅ **API 확장**: 새로운 데이터 타입 추가 용이

---

## 10. 참고 자료

### 10.1 보안
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/index.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [BCrypt Password Hashing](https://en.wikipedia.org/wiki/Bcrypt)

### 10.2 UI 참고
- [Strapi Admin Panel](https://strapi.io/)
- [WordPress Dashboard](https://wordpress.org/)
- [Ghost Admin](https://ghost.org/)

### 10.3 마크다운 에디터
- [CodeMirror 6](https://codemirror.net/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [React Markdown Editor](https://github.com/uiwjs/react-md-editor)

---

## 11. 다음 액션 아이템

### 우선순위 1: 프로젝트 관리 UI 완성 (1주)
- [ ] **프로젝트 목록 페이지 완성**
  - ProjectList 컴포넌트 실제 구현
  - 프로젝트 카드 그리드 레이아웃
  - 필터링 UI (검색, 타입, 상태, 기술 스택)
  - 정렬 옵션

- [ ] **프로젝트 편집 페이지 구현**
  - ProjectEdit 컴포넌트 생성
  - 탭 기반 인터페이스 (기본 정보, 컨텐츠, 기술 스택, 미디어, 링크)
  - 폼 Validation 및 에러 핸들링

- [ ] **마크다운 에디터 통합**
  - @uiw/react-md-editor 설치 및 설정
  - 실시간 미리보기 기능
  - 이미지 드래그앤드롭 지원

### 우선순위 2: 데이터베이스 확장 (3일)
- [ ] **V003__extend_projects_table.sql 생성**
  - project_screenshots 테이블 추가
  - projects 테이블 확장 컬럼 추가 (readme, is_team, team_size, role, my_contributions)

- [ ] **Cloudinary 통합**
  - Cloudinary 의존성 추가
  - CloudinaryConfig 설정
  - 이미지 업로드 API 구현

### 우선순위 3: 스킬 및 경력 관리 (1주)
- [ ] **스킬 관리 API 및 UI**
  - AdminSkillController, AdminSkillService 구현
  - 스킬 목록/편집 페이지 구현

- [ ] **경력 관리 API 및 UI**
  - AdminExperienceController, AdminExperienceService 구현
  - 경력 목록/편집 페이지 구현

### 우선순위 4: 보안 강화 (2일)
- [ ] **Rate Limiting 구현**
  - 로그인 시도 제한 강화
  - API 엔드포인트별 Rate Limiting

- [ ] **비밀번호 정책 강화**
  - 비밀번호 강도 검증
  - 초기 비밀번호 변경 강제

### 백엔드 개발 (완료된 항목들)
- [x] V002 마이그레이션 스크립트 (admin_users 테이블) ✅
- [x] Spring Security 설정 (세션 기반 인증) ✅
- [x] 관리자 인증 API 구현 ✅
- [x] 프로젝트 관리 API 구현 ✅
- [ ] Cloudinary 의존성 추가 및 설정
- [ ] 이미지 업로드 API 구현

### 프론트엔드 개발 (완료된 항목들)
- [x] 관리자 페이지 라우팅 설정 (/admin/*) ✅
- [x] Ant Design 기반 로그인 페이지 UI ✅
- [x] 관리자 레이아웃 (사이드바, 헤더) ✅
- [ ] 프로젝트 목록 및 편집 페이지 완성
- [ ] 마크다운 에디터 통합
- [ ] Ant Design Upload 컴포넌트 구현

### 보안 설정 (완료된 항목들)
- [x] 관리자 계정 스키마 생성 ✅
- [ ] HTTPS 인증서 설정 (프로덕션)
- [x] CSRF 토큰 설정 ✅
- [ ] Rate Limiting 적용
- [ ] Cloudinary 환경 변수 설정

---

**문서 작성일**: 2024-10-12
**최종 수정일**: 2024-12-19 (현재 구현 상황 반영)
**작성자**: AI Agent (Claude)
**검토자**: TBD
