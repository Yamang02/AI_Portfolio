# Admin Dashboard 배포 가이드

## 개요
Admin Dashboard 기능을 프로덕션 환경에 배포하기 위한 가이드입니다.

## 배포 전 체크리스트

### 1. 데이터베이스 마이그레이션
- [ ] **V002__add_admin_features.sql** 적용 확인
  - admin_users 테이블 생성
  - updated_at 트리거 추가
  - detailed_description 컬럼 제거
  - 기본 관리자 계정 생성

### 2. 환경 변수 설정
- [ ] **Cloudinary 설정** (이미지 업로드용)
  ```bash
  CLOUDINARY_CLOUD_NAME=your-cloud-name
  CLOUDINARY_API_KEY=your-api-key
  CLOUDINARY_API_SECRET=your-api-secret
  ```

- [ ] **Redis 설정** (세션 관리용)
  ```bash
  REDIS_HOST=your-redis-host
  REDIS_PORT=6379
  ```

### 3. 보안 설정
- [ ] **HTTPS 강제** (프로덕션 환경)
- [ ] **관리자 비밀번호 변경** (기본: admin123)
- [ ] **IP 화이트리스트** (선택사항)

## 배포 단계

### Step 1: 백엔드 배포
1. Spring Boot 애플리케이션 배포
2. Flyway 마이그레이션 자동 실행 확인
3. 관리자 계정 로그인 테스트

### Step 2: 프론트엔드 배포
1. Admin Dashboard 빌드
2. `/admin` 경로로 배포
3. 로그인 페이지 접근 테스트

### Step 3: 기능 테스트
1. 관리자 로그인 테스트
2. 프로젝트 목록 조회 테스트
3. 프로젝트 편집 테스트 (기본 기능)

## 롤백 계획

### 데이터베이스 롤백
```sql
-- admin_users 테이블 삭제
DROP TABLE IF EXISTS admin_users;

-- 트리거 제거
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_experiences_updated_at ON experiences;
DROP TRIGGER IF EXISTS update_education_updated_at ON education;
DROP TRIGGER IF EXISTS update_certifications_updated_at ON certifications;
DROP TRIGGER IF EXISTS update_tech_stack_metadata_updated_at ON tech_stack_metadata;

-- detailed_description 컬럼 복원 (필요시)
ALTER TABLE projects ADD COLUMN detailed_description TEXT;
```

### 애플리케이션 롤백
1. 이전 버전의 Spring Boot 애플리케이션 배포
2. 프론트엔드에서 `/admin` 경로 제거

## 모니터링

### 로그 모니터링
- [ ] Admin 로그인 시도 모니터링
- [ ] API 호출 로그 확인
- [ ] 에러 로그 집중 모니터링

### 성능 모니터링
- [ ] 데이터베이스 쿼리 성능
- [ ] 세션 관리 상태
- [ ] 이미지 업로드 성능

## 보안 고려사항

### 인증 보안
- ✅ BCrypt 비밀번호 해싱
- ✅ 로그인 시도 제한 (5회)
- ✅ 계정 잠금 메커니즘 (30분)
- ✅ 세션 타임아웃 설정 (30분)

### API 보안
- ✅ CSRF 토큰 검증
- ✅ Input Validation
- ✅ SQL Injection 방지
- ❌ Rate Limiting (향후 구현)

## 문제 해결

### 일반적인 문제
1. **로그인 실패**: 관리자 계정 상태 확인
2. **세션 만료**: Redis 연결 상태 확인
3. **이미지 업로드 실패**: Cloudinary 설정 확인

### 연락처
- 개발자: [개발자 연락처]
- 인프라팀: [인프라팀 연락처]

---
**문서 작성일**: 2024-12-19  
**최종 수정일**: 2024-12-19  
**작성자**: AI Agent (Claude)
