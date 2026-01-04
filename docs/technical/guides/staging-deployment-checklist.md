# 스테이징 배포 전 최종 체크리스트

## ✅ 변경사항 요약

### 1. Spring 프로파일 수정
- [x] `application-staging.yml`:
  - Actuator 설정 들여쓰기 오류 수정 (`management:` 최상위 레벨로 변경)
  - 세션 설정 추가 (Redis 저장, 30분 타임아웃)
  - Redis 환경변수 기본값 제거 (GitHub 환경변수 필수로 변경)
  
- [x] `application-production.yml`:
  - 세션 설정 추가 (Local/Staging과 동일하게 통일)

### 2. 코드 정리 (이미 완료)
- [x] 어드민 관련 console.log 제거
- [x] 무용한 catch 구문 정리

### 3. GitHub 환경변수 정리
- [x] Production에서 불필요한 `VITE_AI_API_BASE_URL` 변수 제거 확인

---

## 🔍 배포 전 확인 사항

### 1. GitHub 환경변수 및 시크릿 확인
- [ ] Staging 환경 변수 확인:
  - `REDIS_HOST`
  - `REDIS_PORT`
  - `REDIS_PASSWORD`
  - `REDIS_DATABASE`
  - `REDIS_SSL`
  - `GCP_PROJECT_ID`
  - `GCP_MAIN_SERVICE_NAME`
  - `GCP_MAIN_REGION`
  - `POSTGRE_URL` (Secret)
  - `GEMINI_API_KEY` (Secret)
  - `GCP_SA_KEY` (Secret)
  
- [ ] Cloudinary 환경변수 추가 (필요 시):
  - `CLOUDINARY_CLOUD_NAME` (Variable)
  - `CLOUDINARY_API_KEY` (Secret)
  - `CLOUDINARY_API_SECRET` (Secret)

### 2. 데이터베이스 확인
- [ ] Staging DB 마이그레이션 상태 확인
- [ ] V001, V002 마이그레이션 적용 여부 확인
- [ ] 필요 시 `insert_data.sql` 실행 준비

### 3. Redis 연결 확인
- [ ] Staging Redis 접근 가능 여부 확인
- [ ] Redis 환경변수 값 검증

### 4. 세션 설정 확인
- [ ] Spring Session Redis 저장 정상 작동 확인
- [ ] Admin 인증 세션 유지 정상 확인

### 5. 워크플로우 확인
- [ ] `backend-staging-cloudrun.yml` 설정 확인
- [ ] `frontend-staging-aws.yml` 설정 확인
- [ ] 환경변수 참조 경로 확인

---

## 📝 배포 시나리오

1. **코드 커밋 및 푸시**
   ```bash
   git add .
   git commit -m "[커밋 메시지]"
   git push origin staging
   ```

2. **워크플로우 자동 실행 확인**
   - GitHub Actions에서 배포 진행 상황 모니터링

3. **배포 후 검증**
   - 헬스체크: `https://ai-portfolio-staging-.../actuator/health`
   - Admin 로그인 테스트
   - 프로젝트 CRUD 테스트
   - 이미지 업로드 테스트 (Cloudinary)

---

## ⚠️ 주의사항

1. **Redis 환경변수 필수**
   - 기본값 제거로 환경변수 누락 시 시작 실패 가능
   - 배포 전 환경변수 확인 필수

2. **세션 설정 적용**
   - 세션 타임아웃 30분으로 설정
   - Redis에 세션 저장 확인 필요

3. **Flyway 마이그레이션**
   - Staging은 자동 마이그레이션 활성화
   - 배포 시 마이그레이션 실행 확인

