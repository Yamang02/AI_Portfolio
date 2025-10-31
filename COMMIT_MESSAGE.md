# 스테이징 배포 준비 커밋 메시지

## 권장 커밋 메시지

```
refactor: 스테이징 배포 준비 - Spring 프로파일 설정 통일 및 환경변수 정리

- Staging 프로파일 수정:
  * Actuator 설정 들여쓰기 오류 수정 (management 최상위 레벨)
  * 세션 설정 추가 (Redis 저장, 30분 타임아웃)
  * Redis 환경변수 기본값 제거 (GitHub 환경변수 필수로 변경)

- Production 프로파일 수정:
  * 세션 설정 추가 (Staging/Local과 일관성 유지)

- 세션 설정 통일:
  * Local, Staging, Production 모두 동일한 Spring Session 설정 적용
  * Redis 네임스페이스: spring:session
  * 세션 타임아웃: 1800초 (30분)

- 환경변수 관리 정리:
  * Staging/Production은 GitHub 환경변수로 관리
  * Local만 개발 편의를 위해 기본값 제공
```

---

## 간단 버전

```
refactor: 스테이징 배포 준비 - 프로파일 설정 통일

- Staging/Production 세션 설정 추가
- Staging Redis 환경변수 기본값 제거
- Actuator 설정 들여쓰기 오류 수정
- 세 환경 프로파일 일관성 개선
```

---

## 상세 버전 (필요 시)

```
refactor: 스테이징 배포 준비를 위한 프로파일 설정 통일

주요 변경사항:
1. Spring Session 설정 통일
   - Local, Staging, Production 모두 동일한 세션 설정 적용
   - Redis 저장소 사용, 30분 타임아웃
   - Admin 인증을 위한 세션 관리 일관성 확보

2. Staging 프로파일 개선
   - Actuator 설정 들여쓰기 오류 수정
   - Redis 환경변수 기본값 제거 (GitHub 환경변수 필수)
   - Production과 동일한 환경변수 관리 방식 적용

3. 프로파일 일관성 향상
   - 세 환경 모두 동일한 세션 설정 사용
   - 환경변수 관리 방식 표준화

영향 범위:
- backend/src/main/resources/application-staging.yml
- backend/src/main/resources/application-production.yml

배포 전 확인사항:
- GitHub Staging 환경변수 확인 (REDIS_*, CLOUDINARY_*)
- Redis 연결 테스트
- 세션 저장 확인
```

