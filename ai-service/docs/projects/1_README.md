# 성균관대학교 순수미술 동아리 갤러리 (SKKU FAC)

## 개요
SKKU 미술동아리 갤러리는 성균관대학교 순수 미술 동아리 전시의 예술 작품을 전시하고 관리하는 웹 플랫폼입니다. 이 시스템은 전시회 관리, 작품 업로드, 사용자 인증 등의 기능을 제공합니다.

## 주요 기능
- **전시회 관리:** 전시회 등록, 수정, 삭제 및 일정 관리
- **작품 아카이브:** 작품 업로드, 분류, 검색 및 전시
- **사용자 인증:** 성균관대 학생 및 외부 사용자 구분 인증
- **관리자 기능:** 전시회 및 작품 관리, 사용자 권한 관리
- **반응형 디자인:** 모바일 및 데스크톱 환경 최적화

## 기술 스택

### 프론트엔드
- **템플릿 엔진:** EJS
- **CSS 프레임워크:** 자체 CSS
- **JavaScript:** 바닐라 자바스크립트

### 백엔드
- **런타임:** Node.js (22.13.0)
- **프레임워크:** Express.js
- **데이터베이스:** MySQL
- **ORM:** Sequelize

### 인프라
- **클라우드 스토리지:** Cloudinary (이미지 저장)
- **캐싱:** Redis (세션 스토어 및 캐싱)
- **CDN:** jsDelivr, Google Fonts, Cloudflare
- **배포 환경:** Railway

### 보안
- **인증:** 세션 기반 인증
- **암호화:** bcrypt
- **보안 헤더:** helmet
- **요청 제한:** express-rate-limit

## 프로젝트 구조
```
SKKU_FAC_GALLERY/
├── src/                              # 소스 코드 루트
│   ├── app.js                        # Express 애플리케이션 설정
│   ├── server.js                     # 서버 시작점
│   ├── routeIndex.js                 # 라우터 인덱스
│   ├── swagger.json                  # API 문서
│   ├── domain/                       # 도메인별 구성요소
│   │   ├── admin/                    # 관리자 도메인
│   │   ├── artwork/                  # 작품 도메인
│   │   ├── auth/                     # 인증 도메인
│   │   ├── exhibition/               # 전시회 도메인
│   │   ├── home/                     # 홈 도메인
│   │   ├── image/                    # 이미지 도메인
│   │   └── user/                     # 사용자 도메인
│   ├── infrastructure/               # 인프라 계층
│   │   ├── cloudinary/               # Cloudinary 통합
│   │   ├── redis/                    # Redis 캐싱 시스템
│   │   ├── session/                  # 세션 스토어 관리
│   │   └── db/                       # 데이터베이스 관련
│   ├── common/                       # 공통 유틸리티
│   │   ├── constants/                # 상수 정의
│   │   ├── error/                    # 에러 처리
│   │   ├── middleware/               # 공통 미들웨어
│   │   └── utils/                    # 유틸리티 함수
│   ├── config/                       # 설정 파일
│   ├── public/                       # 정적 파일
│   └── views/                        # EJS 뷰 템플릿
├── docs/                             # 문서
├── logs/                             # 로그 파일
└── scripts/                          # 스크립트 파일
```

## 로깅 시스템

### Winston 기반 구조화된 로깅
- **환경별 최적화:** 개발(콘솔+이모지), 프로덕션(파일+JSON), 테스트(최소화)
- **로그 레벨:** debug, info, warn, error 레벨 지원
- **민감정보 보호:** 패스워드, 토큰 등 자동 마스킹

### 에러 로깅 강화
- **자동 분류:** 7가지 카테고리 (DATABASE, NETWORK, AUTH, VALIDATION, BUSINESS, SYSTEM, EXTERNAL)
- **심각도 판단:** CRITICAL, HIGH, MEDIUM, LOW 4단계
- **복구 제안:** 에러 카테고리별 자동 복구 제안 생성
- **패턴 감지:** 반복되는 에러 패턴 자동 감지 및 알림

## 데이터베이스 모델

### 주요 엔티티
- **UserAccount:** 사용자 계정 정보
- **SkkuUserProfile:** 성균관대 사용자 프로필
- **ExternalUserProfile:** 외부 사용자 프로필
- **Exhibition:** 전시회 정보
- **Artwork:** 작품 정보
- **ArtworkExhibitionRelationship:** 작품과 전시회 간 관계

## API 문서화
- Swagger UI를 통한 API 문서 제공 (/api-docs 경로)
- RESTful API 구조 준수

## 성능 최적화
- **Redis 캐싱:** 세션 데이터 및 자주 사용되는 데이터 캐싱
- **CDN 활용:** 외부 라이브러리 및 폰트를 CDN을 통해 로드
- **정적 자산 캐싱:** 클라이언트 측 캐싱을 통한 성능 향상
- **이미지 최적화:** Cloudinary를 통한 자동 이미지 최적화

## 설치 및 실행

### 사전 요구사항
- Node.js 22.13.0+
- MySQL 8.0+
- Redis 6.0+

### 환경 설정
```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집

# 데이터베이스 마이그레이션
npm run migrate

# 개발 서버 실행
npm run dev
```

## 배포
- **플랫폼:** Railway
- **CI/CD:** GitHub Actions
- **모니터링:** Railway 내장 모니터링 + 커스텀 로깅

## 기여 방법
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스
MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.