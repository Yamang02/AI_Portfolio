# AWS 웹콘솔 설정 가이드 (간단 버전)

## 🎯 핵심 목표
- Frontend: S3 + CloudFront
- Backend: Cloud Run (기존)
- 환경: Staging, Production 분리

## 📋 단계별 설정

### 1단계: IAM 사용자 생성
1. **AWS 콘솔** → **IAM** → **사용자** → **사용자 생성**
2. 사용자명: `github-actions-ai-portfolio`
3. 액세스 유형: **프로그래밍 방식 액세스**
4. 권한: **기존 정책 직접 연결** → `AmazonS3FullAccess`, `CloudFrontFullAccess`
5. **액세스 키 생성** → GitHub Secrets에 저장

### 2단계: S3 버킷 생성
1. **AWS 콘솔** → **S3** → **버킷 만들기**
2. 버킷명: `ai-portfolio-frontend-staging`
3. 리전: **아시아 태평양 (서울) ap-northeast-3**
4. **퍼블릭 액세스 차단** → 모든 항목 체크
5. **정적 웹사이트 호스팅** → 활성화 → `index.html`
6. **Production 버킷도 동일하게 생성**: `ai-portfolio-frontend-production`

### 3단계: CloudFront OAC 생성 (권장)
1. **CloudFront** → **Origin access control** → **생성**
2. 이름: `ai-portfolio-oac`
3. **생성** → OAC ID 복사

> 💡 **OAC vs OAI**: OAC가 새로운 방식으로 더 안전하고 기능이 풍부합니다.

### 4단계: CloudFront 배포 생성
1. **CloudFront** → **배포** → **배포 생성**
2. **Origin**:
   - Origin domain: `ai-portfolio-frontend-staging.s3.ap-northeast-3.amazonaws.com`
   - Origin access: **Origin access control** → 위에서 생성한 OAC 선택
3. **Default cache behavior**:
   - Viewer protocol policy: **Redirect HTTP to HTTPS**
   - Default root object: `index.html`
4. **Custom error pages**:
   - Error code: `403` → Response page path: `/index.html` → HTTP response code: `200`
5. **생성** → Distribution ID 복사
6. **Production 배포도 동일하게 생성** (버킷명만 `production`으로 변경)

### 5단계: S3 버킷 정책 설정
1. **S3** → `ai-portfolio-frontend-staging` → **권한** → **버킷 정책**
2. 다음 정책 입력 (실제 값으로 교체):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::ai-portfolio-frontend-staging/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
                }
            }
        }
    ]
}
```

3. **Production 버킷도 동일하게 설정** (버킷명과 Distribution ID만 변경)

## 🔐 GitHub 설정

### Secrets (민감한 정보)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `STAGING_API_BASE_URL`
- `PRODUCTION_API_BASE_URL`
- `STAGING_AI_API_BASE_URL`
- `PRODUCTION_AI_API_BASE_URL`

### Variables (공개 가능한 정보)
- `AWS_REGION`: `ap-northeast-3`
- `S3_BUCKET_NAME_STAGING`: `ai-portfolio-frontend-staging`
- `S3_BUCKET_NAME_PRODUCTION`: `ai-portfolio-frontend-production`
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`: Staging Distribution ID
- `AWS_CLOUDFRONT_DISTRIBUTION_ID_PRODUCTION`: Production Distribution ID
- `FRONTEND_BUILD_COMMAND`: `npm run build`

## 📋 체크리스트
- [ ] IAM 사용자 생성 및 액세스 키 생성
- [ ] S3 버킷 생성 (staging, production)
- [ ] S3 퍼블릭 액세스 차단 설정
- [ ] S3 정적 웹사이트 호스팅 활성화
- [ ] CloudFront OAC 생성
- [ ] CloudFront 배포 생성 (staging, production)
- [ ] S3 버킷 정책 설정 (각 환경별)
- [ ] GitHub Secrets 설정
- [ ] GitHub Variables 설정

## 🚨 주의사항
- **액세스 키는 절대 공개하지 말 것**
- **CloudFront 배포 완료까지 15-20분 소요**
- **버킷 정책의 Account ID와 Distribution ID는 정확히 입력**

## 🔄 기존 배포에 OAC 설정하기

### 기존 CloudFront 배포를 OAC로 전환
1. **CloudFront** → **Origin access control** → **생성**
2. 이름: `ai-portfolio-oac`
3. **생성** → OAC ID 복사

4. **기존 배포 편집**:
   - 배포 선택 → **Origins** 탭 → **편집**
   - **Origin access**: **Origin access control** 선택
   - **Origin access control**: 위에서 생성한 OAC 선택
   - **변경사항 저장**

5. **S3 버킷 정책 업데이트**:
   - 기존 OAI 정책 삭제
   - 새로운 OAC 정책 적용 (위의 정책 사용)

### ⚠️ 주의사항
- **배포 중단 없음**: OAC 전환은 무중단으로 가능
- **캐시 무효화**: 전환 후 `/*` 경로로 캐시 무효화 권장
- **정책 업데이트**: S3 버킷 정책도 함께 업데이트 필요

## 🔧 문제 해결
- **S3 버킷 생성 오류**: 버킷명 변경 후 재시도
- **403 Forbidden**: S3 버킷 정책 확인
- **Policy has invalid resource**: Account ID와 Distribution ID 확인
- **OAC 전환 오류**: 기존 OAI 정책 완전 삭제 후 OAC 정책 적용