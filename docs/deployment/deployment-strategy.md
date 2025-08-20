# 배포 전략 및 브랜치 관리

## 브랜치 전략

```
main (프로덕션)
├── develop (개발)
├── staging (스테이징)
└── feature/* (기능 개발)
```

### 브랜치별 역할
- **main**: 프로덕션 환경 (안정적인 릴리스)
- **develop**: 개발 환경 (최신 개발 코드)
- **staging**: 스테이징 환경 (프로덕션 배포 전 검증)
- **feature/***: 기능별 개발 브랜치

## 배포 플로우

### 1. 개발 → 스테이징
```bash
# feature 브랜치에서 개발 완료 후
git checkout develop
git merge feature/new-feature
git push origin develop

# develop → staging 머지
git checkout staging
git merge develop
git push origin staging  # 자동으로 스테이징 배포 트리거
```

### 2. 스테이징 → 프로덕션
```bash
# 스테이징 검증 완료 후
git checkout main
git merge staging
git push origin main  # 프로덕션 배포 트리거
```

## 환경별 설정

### 로컬 개발 환경
- Docker Compose PostgreSQL
- 프로필: `default` (application.yml)
- 포트: Backend(8080), Frontend(5173)

### 스테이징 환경
- Railway PostgreSQL
- 프로필: `staging` (application-staging.yml)
- Cloud Run: 별도 서비스명 (`-staging` 접미사)

### 프로덕션 환경
- Railway PostgreSQL (별도 인스턴스 권장)
- 프로필: `prod` (application-prod.yml)
- Cloud Run: 기존 서비스명

## CI/CD 파이프라인

### 자동 배포 트리거
- `develop` 브랜치 푸시 → 개발 환경 배포 (선택사항)
- `staging` 브랜치 푸시 → 스테이징 환경 배포
- `main` 브랜치 푸시 → 프로덕션 환경 배포

### 배포 단계
1. **테스트**: 단위 테스트 및 통합 테스트 실행
2. **빌드**: Maven/npm 빌드
3. **도커 이미지**: 컨테이너 이미지 생성 및 푸시
4. **배포**: Cloud Run에 배포
5. **검증**: 헬스체크 및 기본 동작 확인

## 롤백 전략

### 자동 롤백
```bash
# 이전 버전으로 롤백
gcloud run services replace-traffic SERVICE_NAME \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=asia-northeast3
```

### 수동 롤백
1. Cloud Run 콘솔에서 이전 리비전 선택
2. 트래픽 100% 할당
3. 문제 해결 후 다시 배포

## 모니터링 및 알림

### 헬스체크 엔드포인트
```java
@RestController
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(status);
    }
}
```

### 알림 설정
- Cloud Run 서비스 오류 알림
- Railway DB 연결 실패 알림
- GitHub Actions 빌드 실패 알림