# Spring Session 기반 Admin 인증 시스템

## 개요

Spring Session과 Redis를 사용한 세션 기반 Admin 인증 시스템입니다.

## 시스템 아키텍처

### 인증 플로우

```
프론트엔드 → AdminAuthController → AdminAuthService → PostgreSQL
                                              ↓
                                        HttpSession → Redis
```

### 핵심 구성요소

#### 1. Spring Security 설정

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/auth/**").permitAll()
                .requestMatchers("/api/admin/**").authenticated()
                .anyRequest().permitAll()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
            );
        return http.build();
    }
}
```

#### 2. Redis Session 설정

```java
@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 1800)
public class RedisConfig {
    @Bean
    public RedisSerializer<Object> springSessionDefaultRedisSerializer() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return new GenericJackson2JsonRedisSerializer(objectMapper);
    }
}
```

**핵심 설정:**
- `@EnableRedisHttpSession`: Spring Session을 Redis에 저장
- `maxInactiveIntervalInSeconds = 1800`: 30분 세션 타임아웃
- `springSessionDefaultRedisSerializer`: 세션 객체 직렬화 방식 정의

## 세션 저장 및 직렬화 과정

### 로그인 시 세션 저장

```java
public AdminUserInfo login(String username, String password, HttpSession session) {
    // 1. 사용자 인증
    AdminUser adminUser = adminUserRepository.findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다."));
    
    boolean passwordMatches = passwordEncoder.matches(password, adminUser.getPassword());
    if (!passwordMatches) {
        throw new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다.");
    }
    
    // 2. AdminUserInfo DTO 생성
    AdminUserInfo userInfo = AdminUserInfo.builder()
        .username(adminUser.getUsername())
        .role(adminUser.getRole())
        .lastLogin(adminUser.getLastLogin())
        .build();
    
    // 3. 세션에 사용자 정보 저장
    session.setAttribute(SESSION_ADMIN_KEY, userInfo); // "ADMIN_USER"
    
    return userInfo;
}
```

### Redis에 저장되는 세션 구조

```json
{
  "spring:session:sessions:{sessionId}": {
    "maxInactiveInterval": 1800,
    "lastAccessedTime": 1760875109555,
    "creationTime": 1760875109555,
    "sessionAttr:ADMIN_USER": {
      "username": "admin",
      "role": "ROLE_ADMIN",
      "lastLogin": "2025-10-19T11:58:30.19649245"
    }
  }
}
```

## 프론트엔드 세션 관리

### React Query 기반 세션 상태 관리

```typescript
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const { data: sessionData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-session'],
    queryFn: adminAuthApi.getSession,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (sessionData?.success && sessionData?.data) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [sessionData]);

  return { isAuthenticated, isLoading, sessionData: sessionData?.data };
};
```

### API 클라이언트 설정

```typescript
class AdminAuthApi {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // 쿠키 포함 (세션 인증에 필요)
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    return await response.json();
  }
}
```

**핵심 설정:**
- `credentials: 'include'`: 세션 쿠키를 모든 요청에 포함
- `retry: false`: 세션 체크 실패 시 재시도하지 않음
- `refetchOnWindowFocus: false`: 창 포커스 시 자동 재조회 비활성화

## Best Practice 평가

### ✅ 잘 구현된 부분

1. **명확한 관심사 분리**
   - `AdminAuthService`: 비즈니스 로직
   - `AdminAuthController`: HTTP 요청 처리
   - `SecurityConfig`: 보안 설정
   - `RedisConfig`: 세션 저장소 설정

2. **적절한 세션 타임아웃 설정**
   - 30분 타임아웃으로 보안성과 사용성 균형
   - 동시 세션 1개로 제한하여 보안 강화

3. **일관된 직렬화 전략**
   - 프로젝트 전체에서 `GenericJackson2JsonRedisSerializer` 사용
   - `JavaTimeModule`로 `LocalDateTime` 지원

4. **프론트엔드 상태 관리**
   - React Query로 서버 상태와 클라이언트 상태 분리
   - `credentials: 'include'`로 세션 쿠키 자동 관리

### ⚠️ 개선 가능한 부분

1. **세션 보안 강화**
   ```java
   .sessionManagement(session -> session
       .sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
       .sessionFixation().migrateSession() // 세션 고정 공격 방지
       .maximumSessions(1)
       .maxSessionsPreventsLogin(false)
   )
   ```

2. **세션 무효화 로직 개선**
   ```java
   public void logout(HttpSession session) {
       session.removeAttribute(SESSION_ADMIN_KEY);
       session.invalidate();
       log.info("User logged out, session invalidated: {}", session.getId());
   }
   ```

## 보안 고려사항

1. **세션 쿠키 보안**
   ```yaml
   spring:
     security:
       session:
         cookie:
           http-only: true      # XSS 공격 방지
           secure: false        # local에서는 false (HTTPS 환경에서는 true)
           same-site: lax       # CSRF 공격 방지
   ```

2. **비밀번호 해싱**
   ```java
   @Bean
   public PasswordEncoder passwordEncoder() {
       return new BCryptPasswordEncoder(); // 강력한 해싱 알고리즘 ✅
   }
   ```

## 참고 자료

- [Spring Session 문서](https://docs.spring.io/spring-session/reference/)
- [Spring Security 문서](https://docs.spring.io/spring-security/reference/)
