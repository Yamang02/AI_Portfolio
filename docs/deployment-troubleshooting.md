# Cloud Run 배포 트러블슈팅 & 최종 체크리스트

## 1. 배포 과정에서 마주한 주요 에러들

- **No event triggers defined in `on` workflow**
  - 원인: deploy.yml의 on: 트리거가 주석 처리되어 워크플로우가 실행되지 않음
  - 해결: on: push, pull_request 등 트리거 활성화

- **invalid tag "gcr.io//ai-portfolio-chatbot:...": invalid reference format**
  - 원인: GCP_PROJECT_ID 환경변수 누락
  - 해결: GitHub Secrets에 GCP_PROJECT_ID 등록

- **failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 127**
  - 원인: Dockerfile에서 --only=production 옵션으로 devDependencies 미설치
  - 해결: RUN npm ci로 수정

- **Artifact Registry API has not been used...**
  - 원인: Artifact Registry API 미활성화
  - 해결: GCP 콘솔에서 API 활성화

- **Permission "artifactregistry.repositories.uploadArtifacts" denied...**
  - 원인: 서비스 계정에 Artifact Registry Writer 권한 없음
  - 해결: roles/artifactregistry.writer 권한 부여

- **gcr.io repo does not exist. Creating on push requires the artifactregistry.repositories.createOnPush permission**
  - 원인: Artifact Registry 레포지토리 미생성
  - 해결: gcloud artifacts repositories create ... 명령으로 직접 생성

- **Permission denied to enable service [run.googleapis.com]**
  - 원인: 서비스 계정에 API 활성화 권한 없음
  - 해결: GCP 콘솔에서 오너/관리자가 직접 API 활성화

- **Permission 'iam.serviceaccounts.actAs' denied...**
  - 원인: github-actions 서비스 계정에 Compute Engine 기본 서비스 계정 ActAs 권한 없음
  - 해결: Service Account User(roles/iam.serviceAccountUser) 권한 부여

- **Permission denied on secret: ... for Revision service account ...**
  - 원인: Cloud Run 실행 서비스 계정에 Secret Manager 접근 권한 없음
  - 해결: roles/secretmanager.secretAccessor 권한 부여

---

## 2. 최종적으로 배포를 위해 해야 할 일 (체크리스트)

1. **GCP 프로젝트 및 결제 연결**
2. **Cloud Run, Artifact Registry, Secret Manager API 활성화**
3. **github-actions 서비스 계정 생성 및 아래 권한 부여**
   - Cloud Run 관리자
   - Artifact Registry Writer
   - Service Account User (Compute Engine 기본 서비스 계정에 대해)
   - Secret Manager Secret Accessor (Compute Engine 기본 서비스 계정에 대해)
4. **필요한 시크릿(GEMINI_API_KEY, EMAILJS_PUBLIC_KEY) 등록**
5. **Artifact Registry(Docker) 레포지토리 생성**
6. **.env.local/env.example에는 시크릿만 남기고 나머지 삭제**
7. **Dockerfile devDependencies 설치되도록 수정**
8. **deploy.yml에서 환경변수/시크릿 최소화, on: 트리거 활성화**
9. **GitHub Secrets에 GCP_PROJECT_ID, GCP_SA_KEY 등 등록**
10. **최초 배포 후 Cloud Run 서비스 정상 동작 확인**

---

> 이 문서는 실제 배포 경험을 바탕으로 작성된 트러블슈팅 및 실전 체크리스트입니다. 