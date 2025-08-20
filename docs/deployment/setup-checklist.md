# 스테이징 환경 설정 체크리스트

## ✅ Railway 설정

- [ ] Railway 계정 생성 및 로그인
- [ ] PostgreSQL 프로젝트 생성
- [ ] 데이터베이스 연결 URL 확인
- [ ] 스키마 및 초기 데이터 배포
- [ ] 백업 설정 (선택사항)

## ✅ GitHub 설정

### Secrets 설정
- [ ] `GCP_PROJECT_ID`
- [ ] `GCP_SA_KEY`
- [ ] `RAILWAY_DATABASE_URL`
- [ ] `GEMINI_API_KEY`
- [ ] `GITHUB_USERNAME`
- [ ] `CONTACT_EMAIL`
- [ ] `ALLOWED_ORIGINS_STAGING`

### 브랜치 설정
- [ ] `staging` 브랜치 생성
- [ ] 브랜치 보호 규칙 설정 (선택사항)
- [ ] GitHub Actions 워크플로우 파일 추가

## ✅ Google Cloud 설정

### Service Account
- [ ] Service Account 생성
- [ ] 필요한 권한 부여 (Cloud Run Admin, Storage Admin)
- [ ] JSON 키 생성 및 GitHub Secrets에 추가

### Cloud Run 설정
- [ ] 스테이징 서비스명 확인 (`-staging` 접미사)
- [ ] 리전 설정 (asia-northeast3)
- [ ] 환경변수 설정 확인

## ✅ 애플리케이션 설정

### Backend
- [ ] `application-staging.yml` 파일 생성
- [ ] 환경변수 매핑 확인
- [ ] 로깅 레벨 설정
- [ ] CORS 설정 업데이트

### Frontend
- [ ] 스테이징 API URL 설정
- [ ] 빌드 스크립트 확인
- [ ] 환경별 설정 파일 (선택사항)

## ✅ 테스트 및 검증

### 로컬 테스트
- [ ] Railway DB 연결 테스트
- [ ] 애플리케이션 로컬 실행 확인
- [ ] API 엔드포인트 테스트

### 배포 테스트
- [ ] GitHub Actions 워크플로우 실행
- [ ] 스테이징 환경 배포 확인
- [ ] 헬스체크 엔드포인트 확인
- [ ] 프론트엔드-백엔드 연동 확인

## ✅ 모니터링 설정

### 로그 모니터링
- [ ] Cloud Run 로그 확인
- [ ] Railway 메트릭 확인
- [ ] GitHub Actions 로그 확인

### 알림 설정 (선택사항)
- [ ] 배포 실패 알림
- [ ] 서비스 다운 알림
- [ ] 데이터베이스 연결 실패 알림

## 🚀 배포 실행

### 첫 배포
```bash
# staging 브랜치로 푸시하여 배포 트리거
git checkout staging
git merge develop
git push origin staging
```

### 배포 확인
1. GitHub Actions 워크플로우 실행 상태 확인
2. Cloud Run 서비스 배포 상태 확인
3. 스테이징 URL 접속 테스트
4. API 엔드포인트 동작 확인

## 📋 문제 해결

### 일반적인 이슈
- **데이터베이스 연결 실패**: Railway URL 및 환경변수 확인
- **빌드 실패**: 의존성 및 Java/Node 버전 확인
- **배포 실패**: GCP 권한 및 Service Account 확인
- **CORS 오류**: 허용 도메인 설정 확인

### 디버깅 방법
1. GitHub Actions 로그 확인
2. Cloud Run 로그 확인
3. Railway 메트릭 확인
4. 로컬에서 동일 환경 재현