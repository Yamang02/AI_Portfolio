# SKKU FAC Gallery - 미술동아리 갤러리 플랫폼

## 프로젝트 개요
성균관대학교 순수미술 동아리 갤러리 웹 플랫폼으로, 전시회 관리, 작품 아카이브, 사용자 인증 기능을 제공합니다.

## 핵심 기능
- 전시회 관리 (등록/수정/삭제/일정관리)
- 작품 아카이브 (업로드/분류/검색/전시)
- 사용자 인증 (성균관대 학생/외부 사용자 구분)
- 관리자 기능 (권한 관리)
- 반응형 디자인

## 기술 스택
- **프론트엔드:** EJS, 자체 CSS, 바닐라 JavaScript
- **백엔드:** Node.js 22.13.0, Express.js, MySQL, Sequelize
- **인프라:** Cloudinary (이미지), Redis (캐싱), Railway (배포)
- **보안:** 세션 기반 인증, bcrypt, helmet

## 아키텍처 특징
- 도메인별 구성 (admin, artwork, auth, exhibition, home, image, user)
- Winston 기반 구조화된 로깅 시스템
- Redis 캐싱을 통한 성능 최적화
- Swagger UI를 통한 API 문서화

## 주요 데이터 모델
- UserAccount, SkkuUserProfile, ExternalUserProfile
- Exhibition, Artwork, ArtworkExhibitionRelationship

## 배포 환경
- Railway 플랫폼
- GitHub Actions CI/CD
- 자동 모니터링 및 로깅 