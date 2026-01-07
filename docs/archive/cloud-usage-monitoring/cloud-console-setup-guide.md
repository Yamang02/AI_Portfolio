# Cloud Usage Monitoring - AWS & GCP 콘솔 설정 가이드

## 📋 개요

이 문서는 Cloud Usage Monitoring 기능을 위한 AWS와 GCP 웹 콘솔 설정 방법을 안내합니다.

**목표**:
- 기존 배포용 IAM/서비스 계정에 비용 조회 권한 추가
- GCP BigQuery Billing Export 활성화
- 설정 검증

---

## 🔧 AWS 설정

### 1️⃣ 기존 IAM 사용자 확인

#### Step 1: IAM 콘솔 접속
1. AWS Console 로그인: https://console.aws.amazon.com
2. 검색창에 "IAM" 입력 → IAM 서비스 선택
3. 왼쪽 메뉴에서 **"Users"** 클릭

#### Step 2: 배포용 IAM 사용자 찾기
1. 현재 배포에 사용 중인 IAM 사용자 이름 확인
   - 예: `portfolio-deployer`, `github-actions`, `ci-cd-user` 등
2. 해당 사용자 클릭

> **💡 Tip**: 사용자 이름을 모르는 경우
> - `.env` 파일이나 배포 설정 파일에서 `AWS_ACCESS_KEY_ID` 확인
> - IAM 콘솔에서 해당 Access Key를 검색

#### Step 3: Access Key 확인 또는 생성

**기존 Access Key가 있는 경우**:
1. 사용자 상세 페이지에서 **"Security credentials"** 탭 클릭
2. **"Access keys"** 섹션에서 기존 Access Key 확인
3. ⚠️ **Secret Key는 생성 시에만 한 번 표시되므로, 모르면 새로 생성해야 함**

**새 Access Key Set 생성이 필요한 경우**:
1. **"Security credentials"** 탭 → **"Access keys"** 섹션
2. **"Create access key"** 버튼 클릭
3. Use case 선택: **"Application running outside AWS"** 선택
4. **"Create access key"** 클릭
5. ⚠️ **중요**: Access Key ID와 Secret Access Key를 즉시 복사하여 안전한 곳에 저장
   - Secret Key는 이 화면에서만 표시되며, 나중에 다시 볼 수 없습니다
   - `.env` 파일에 저장하거나 비밀 관리 도구에 저장
6. **"Done"** 클릭

> **⚠️ 주의**: 
> - 기존 Access Key를 사용 중이라면, 새로 생성하기 전에 기존 키가 어디서 사용되는지 확인하세요
> - 새 키를 생성한 후 기존 키를 비활성화하거나 삭제할 수 있습니다

---

### 2️⃣ Cost Explorer 권한 추가

#### Step 1: 인라인 정책 추가 (권장)

1. IAM 사용자 상세 페이지에서 **"Permissions"** 탭 선택
2. **"Add permissions"** 버튼 클릭
3. **"Create inline policy"** 선택

#### Step 2: 정책 작성

**옵션 A: Visual Editor 사용**

1. **Service**: "Cost Explorer Service" 선택
2. **Actions**:
   - ✅ `GetCostAndUsage`
   - ✅ `GetCostForecast` (선택 사항)
3. **Resources**: "All resources" 선택
4. **Review policy** 클릭

**옵션 B: JSON Editor 사용** (더 정확함)

1. **JSON** 탭 클릭
2. 아래 JSON 붙여넣기:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CostExplorerReadAccess",
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "ce:GetCostForecast"
      ],
      "Resource": "*"
    }
  ]
}
```

3. **Review policy** 클릭

#### Step 3: 정책 저장

1. **Name**: `CostExplorerReadOnly` 입력
2. **Description**: `Allow read-only access to Cost Explorer API for monitoring` 입력
3. **Create policy** 클릭

---

### 3️⃣ 설정 검증

#### AWS CLI로 테스트 (옵션)

```bash
# AWS CLI 설치되어 있다면
aws ce get-cost-and-usage \
  --time-period Start=2025-11-01,End=2025-11-30 \
  --granularity MONTHLY \
  --metrics "BlendedCost" \
  --profile your-profile-name

# 성공 시 JSON 응답이 출력됨
```

#### 웹 콘솔에서 확인

1. AWS Console 검색창에 "Cost Explorer" 입력
2. Cost Explorer 서비스 접속
3. 비용 데이터가 보이는지 확인

> **⚠️ 주의**: Cost Explorer 데이터는 24시간 지연됩니다.
> - 오늘(11/29) 데이터는 내일(11/30) 조회 가능

---

## 🔧 GCP 설정

### 1️⃣ BigQuery Billing Export 활성화

#### Step 1: Billing 콘솔 접속

1. GCP Console 로그인: https://console.cloud.google.com
2. 왼쪽 상단 햄버거 메뉴 → **"Billing"** 선택
3. 해당 프로젝트의 Billing Account 선택

#### Step 2: Billing Export 설정

1. 왼쪽 메뉴에서 **"Billing export"** 클릭
2. **"BigQuery export"** 탭 선택

#### Step 3: Standard Usage Cost 활성화

1. **"EDIT SETTINGS"** 버튼 클릭 (또는 "ENABLE" 버튼)
2. 설정 입력:
   - **Project**: 현재 프로젝트 선택 (또는 별도 billing 전용 프로젝트)
   - **Dataset name**: `billing_export` 입력 (원하는 이름 가능)
   - **Dataset location**:
     - 권장: `US` (비용 최소화)
     - 또는 애플리케이션과 같은 region
3. **"SAVE"** 클릭

> **💡 참고**:
> - Export가 활성화되면 **데이터셋과 테이블**이 자동 생성됩니다
> - 테이블 이름: `gcp_billing_export_v1_XXXXXX-XXXXXX-XXXXXX`
> - **테이블 생성 시점**: 보통 즉시 생성되지만, 최대 24시간 소요될 수 있습니다
> - **데이터 업데이트**: 테이블 생성 후 **다음 날부터** 데이터가 쌓입니다 (하루 1회, 보통 오전 중)
> - 활성화 직후에는 빈 테이블이거나 테이블이 아직 보이지 않을 수 있습니다

#### Step 4: Export 테이블 이름 확인

1. GCP Console에서 **BigQuery** 서비스 접속
2. 왼쪽 Explorer에서 프로젝트 확장
3. `billing_export` 데이터셋 확장
4. `gcp_billing_export_v1_...` 테이블 이름 복사 (나중에 필요)

> **⚠️ 테이블이 보이지 않는 경우**:
> - Export 활성화 직후에는 테이블 생성에 최대 24시간 소요될 수 있습니다
> - Billing Export 설정 페이지에서 상태가 "Enabled"인지 확인하세요
> - 데이터셋은 보이지만 테이블이 없다면 다음 날 오전까지 대기하세요
> - 테이블이 생성되어도 데이터는 다음 날부터 쌓입니다

**예시**:
```
프로젝트: my-portfolio-project
데이터셋: billing_export
테이블: gcp_billing_export_v1_01E8A9_12B3C4_56D7E8
```

---

### 2️⃣ 기존 서비스 계정 확인

#### Step 1: Service Accounts 콘솔 접속

1. GCP Console 검색창에 "Service Accounts" 입력
2. **IAM & Admin > Service Accounts** 선택

#### Step 2: 배포용 서비스 계정 찾기

1. 현재 배포에 사용 중인 서비스 계정 확인
   - 예: `portfolio-deployer@PROJECT_ID.iam.gserviceaccount.com`
2. 해당 서비스 계정의 이메일 주소 복사

> **💡 Tip**: 서비스 계정을 모르는 경우
> - 배포 설정 파일에서 서비스 계정 JSON 키 확인
> - JSON 키 파일 내부의 `client_email` 필드 확인

---

### 3️⃣ BigQuery 권한 추가

#### 옵션 A: IAM 페이지에서 권한 추가 (권장)

1. GCP Console → **IAM & Admin > IAM** 페이지 접속
2. 배포용 서비스 계정 찾기
3. 해당 행의 **연필 아이콘 (Edit)** 클릭
4. **"ADD ANOTHER ROLE"** 클릭하여 다음 역할 추가:
   - ✅ **BigQuery Job User** (`roles/bigquery.jobUser`)
   - ✅ **BigQuery Data Viewer** (`roles/bigquery.dataViewer`)
5. **"SAVE"** 클릭

#### 옵션 B: BigQuery 데이터셋 레벨 권한 (더 제한적, 권장)

1. BigQuery 콘솔 접속
2. `billing_export` 데이터셋 옆 **⋮** (메뉴) 클릭
3. **"Share"** → **"Permissions"** 선택
4. **"ADD PRINCIPAL"** 클릭
5. 서비스 계정 이메일 입력
6. 역할 선택:
   - ✅ **BigQuery Data Viewer**
7. **"SAVE"** 클릭

> **💡 최소 권한 원칙**:
> - 옵션 B가 더 안전 (특정 데이터셋만 접근)
> - 하지만 쿼리 실행을 위해 프로젝트 레벨의 `BigQuery Job User`는 여전히 필요

#### 옵션 C: gcloud CLI 사용

```bash
# BigQuery Job User 역할 추가
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/bigquery.jobUser"

# BigQuery Data Viewer 역할 추가
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/bigquery.dataViewer"
```

**예시**:
```bash
gcloud projects add-iam-policy-binding my-portfolio-project \
  --member="serviceAccount:portfolio-deployer@my-portfolio-project.iam.gserviceaccount.com" \
  --role="roles/bigquery.jobUser"
```

---

### 4️⃣ 설정 검증

#### BigQuery 콘솔에서 쿼리 테스트

1. BigQuery 콘솔 접속
2. **"New Query"** 클릭
3. 아래 쿼리 실행:

```sql
SELECT
  service.description as service_name,
  SUM(cost) as total_cost,
  currency
FROM `PROJECT_ID.billing_export.gcp_billing_export_v1_XXXXXX`
WHERE _PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY service_name, currency
ORDER BY total_cost DESC
LIMIT 10
```

> **⚠️ 중요**: 테이블 이름은 반드시 `프로젝트ID.데이터셋이름.테이블이름` 형식으로 작성해야 합니다!
> - ❌ 잘못된 예: `gcp_billing_export_v1_012659_03CA1D_2D9F35`
> - ✅ 올바른 예: `my-project-id.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`

> **🚨 매우 중요**: 프로젝트 ID는 **반드시 소문자**로 사용해야 합니다!
> - ❌ 잘못된 예: `Yamang02-AI-Portfolio` (대문자 포함)
> - ✅ 올바른 예: `yamang02-ai-portfolio` (모두 소문자)
> - BigQuery는 프로젝트 ID에 대문자를 허용하지 않습니다

**파라미터 수정**:
- `PROJECT_ID`: 실제 GCP 프로젝트 ID로 교체 (**소문자로 변환**)
- `billing_export`: 설정한 데이터셋 이름
- `gcp_billing_export_v1_XXXXXX`: 실제 테이블 이름으로 교체

**프로젝트 ID 확인 방법**:
1. BigQuery 콘솔 **왼쪽 탐색 창**에서 프로젝트 이름 확인 (소문자로 표시됨)
2. 또는 BigQuery 콘솔에서 테이블을 우클릭 → "Copy" → "Copy table ID"로 전체 경로 복사
3. 프로젝트 ID는 항상 소문자로 변환하여 사용

**성공 시**: 서비스별 비용 데이터가 테이블로 출력됩니다.

> **⚠️ 주의**:
> - BigQuery Export는 활성화 후 **다음 날부터** 데이터가 쌓입니다
> - 활성화 직후에는 빈 테이블일 수 있습니다

---

## 📝 설정 정보 기록

설정 완료 후 아래 정보를 기록하세요. (환경 변수에 사용됨)

### AWS 정보

```bash
# 기존 IAM 사용자 정보 (변경 없음)
AWS_ACCESS_KEY=AKIAxxxxxxxxxxxxxxxxx
AWS_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1  # Cost Explorer는 us-east-1 사용
```

### GCP 정보

```bash
# 기존 서비스 계정 정보 (변경 없음)
GCP_PROJECT_ID=yamang02-ai-portfolio  # 프로젝트 ID는 소문자로 사용
GCP_CREDENTIALS_PATH=/path/to/service-account-key.json

# 새로 확인한 정보
GCP_BILLING_DATASET=billing_export
GCP_BILLING_TABLE=gcp_billing_export_v1_012659_03CA1D_2D9F35  # 실제 테이블 이름
```

> **💡 참고**: 
> - 프로젝트 ID는 반드시 **소문자**로 사용해야 합니다 (`yamang02-ai-portfolio`)
> - 테이블 이름은 BigQuery 콘솔에서 "Copy table ID"로 전체 경로를 복사하면 정확합니다
> - 전체 경로 형식: `프로젝트ID.데이터셋이름.테이블이름`

---

## ✅ 최종 체크리스트

### AWS
- [ ] IAM 사용자 확인
- [ ] `ce:GetCostAndUsage` 권한 추가
- [ ] (선택) AWS CLI로 테스트
- [ ] Cost Explorer 웹 콘솔에서 데이터 확인

### GCP
- [ ] BigQuery Billing Export 활성화
- [ ] 데이터셋 및 테이블 이름 확인
- [ ] 서비스 계정 확인
- [ ] `BigQuery Job User` 권한 추가
- [ ] `BigQuery Data Viewer` 권한 추가
- [ ] BigQuery 콘솔에서 쿼리 테스트

### 환경 변수
- [ ] AWS 자격증명 확인
- [ ] GCP 자격증명 확인
- [ ] BigQuery 테이블 정보 기록

---

## 🚨 트러블슈팅

### AWS

**문제**: "Access Denied" 에러
- **원인**: 권한이 제대로 추가되지 않음
- **해결**:
  1. IAM 사용자의 Permissions 탭 확인
  2. Inline policy가 제대로 추가되었는지 확인
  3. JSON 문법 오류 확인

**문제**: Cost Explorer 데이터가 없음
- **원인**: 데이터는 24시간 지연
- **해결**:
  1. 어제 날짜로 쿼리 시도
  2. Cost Explorer를 처음 활성화한 경우 최대 24시간 대기

---

### GCP

**문제**: BigQuery Export 테이블이 생성되지 않음
- **원인**: 
  - 테이블 생성 자체는 보통 즉시이지만 최대 24시간 소요될 수 있음
  - 데이터는 테이블 생성 후 다음 날부터 쌓임
- **해결**:
  1. Billing Export 설정 페이지에서 상태가 "Enabled"인지 확인
  2. 데이터셋(`billing_export`)이 생성되었는지 BigQuery에서 확인
  3. 테이블이 보이지 않으면 최대 24시간 대기 (보통 몇 시간 내 생성됨)
  4. 테이블이 생성되어도 데이터는 다음 날 오전부터 들어옴

**문제**: "Permission denied" 에러
- **원인**: 서비스 계정 권한 부족
- **해결**:
  1. IAM 페이지에서 서비스 계정 권한 확인
  2. `bigquery.jobUser`와 `bigquery.dataViewer` 모두 있는지 확인
  3. 데이터셋 레벨 권한도 확인

**문제**: 쿼리 실행 시 "Invalid project ID" 에러 (대문자 포함)
- **원인**: 프로젝트 ID에 대문자가 포함되어 있음
- **해결**:
  1. 프로젝트 ID를 **모두 소문자**로 변환하여 사용
  2. 예: `Yamang02-AI-Portfolio` → `yamang02-ai-portfolio`
  3. BigQuery 콘솔 왼쪽 탐색 창에서 프로젝트 이름 확인 (소문자로 표시됨)
  4. 테이블을 우클릭 → "Copy" → "Copy table ID"로 전체 경로 복사 (자동으로 소문자로 복사됨)

**문제**: 쿼리 실행 시 "Table must be qualified with a dataset" 에러
- **원인**: 테이블 이름에 프로젝트 ID와 데이터셋 이름이 포함되지 않음
- **해결**:
  1. 테이블 이름을 `프로젝트ID.데이터셋이름.테이블이름` 형식으로 작성 (**프로젝트 ID는 소문자**)
  2. 예: `yamang02-ai-portfolio.billing_export.gcp_billing_export`
  3. 백틱(`)으로 감싸기: \`project.dataset.table\`
  4. BigQuery 콘솔에서 테이블을 우클릭 → "Copy" → "Copy table ID"로 전체 경로 복사 가능

**문제**: 쿼리 실행 시 "Table not found" 에러
- **원인**: 테이블 이름 오타 또는 잘못된 프로젝트 ID
- **해결**:
  1. BigQuery 콘솔에서 정확한 테이블 이름 복사 (전체 경로: `project.dataset.table`)
  2. 프로젝트 ID가 맞는지 확인 (콘솔 상단에서 확인)
  3. 백틱(`) 사용 확인: \`project.dataset.table\`

**문제**: 빈 결과 반환 (쿼리는 성공하지만 데이터가 없음)
- **원인**: 
  1. BigQuery Billing Export를 최근에 활성화해서 아직 데이터가 없음
  2. 실제로 비용이 발생하지 않았음
  3. 날짜 필터가 너무 최근이라 데이터가 없음
  4. 테이블은 생성되었지만 데이터가 아직 들어오지 않음

- **단계별 진단 방법**:

  **Step 1: 테이블에 데이터가 있는지 확인**
  ```sql
  SELECT COUNT(*) as total_rows
  FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`
  ```
  - 결과가 `0`이면: 테이블에 데이터가 아직 없음
  - 결과가 `0`보다 크면: 데이터는 있지만 쿼리 조건에 맞지 않음

  **Step 2: 날짜 필터 없이 전체 데이터 확인**
  ```sql
  SELECT 
    _PARTITIONDATE as partition_date,
    COUNT(*) as row_count,
    MIN(usage_start_time) as earliest_date,
    MAX(usage_start_time) as latest_date
  FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`
  GROUP BY _PARTITIONDATE
  ORDER BY _PARTITIONDATE DESC
  LIMIT 10
  ```
  - 어떤 날짜의 데이터가 있는지 확인
  - `earliest_date`와 `latest_date`로 데이터 범위 확인

  **Step 3: 비용이 있는지 확인**
  ```sql
  SELECT 
    SUM(cost) as total_cost,
    currency,
    COUNT(DISTINCT service.description) as service_count
  FROM `yamang02-ai-portfolio.billing_export.gcp_billing_export_v1_012659_03CA1D_2D9F35`
  ```
  - `total_cost`가 `0`이면: 실제로 비용이 발생하지 않았음
  - `total_cost`가 `0`보다 크면: 비용은 있지만 날짜 필터 문제일 수 있음

- **해결 방법**:
  1. **BigQuery Billing Export를 방금 활성화한 경우**:
     - 테이블 생성: 즉시 ~ 최대 24시간
     - 데이터 수집 시작: **다음 날 오전**부터
     - 첫 데이터 확인: 활성화 후 **최소 1-2일 후**
  
  2. **날짜 필터 조정**:
     ```sql
     -- 30일 대신 더 긴 기간으로 시도
     WHERE _PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)
     
     -- 또는 날짜 필터 제거하고 전체 확인
     -- WHERE 절 제거
     ```
  
  3. **Billing Export 상태 확인**:
     - GCP Console → Billing → Billing export
     - BigQuery export 상태가 "Enabled"인지 확인
     - 마지막 업데이트 시간 확인
  
  4. **실제 비용 발생 여부 확인**:
     - GCP Console → Billing → Reports
     - 실제로 비용이 발생했는지 확인
     - 무료 크레딧만 사용 중이면 데이터가 없을 수 있음

---

## 🔐 보안 권장사항

### AWS
- ✅ 필요한 최소 권한만 부여 (`ce:GetCostAndUsage`)
- ✅ Inline policy 사용 (관리 용이)
- ❌ 불필요한 권한 추가 금지 (예: `ce:*`)

### GCP
- ✅ 데이터셋 레벨 권한 우선 사용
- ✅ Viewer 역할만 부여 (Editor/Owner 불필요)
- ❌ 프로젝트 전체 BigQuery Admin 권한 금지

### 자격증명 관리
- ✅ 환경 변수 또는 Secret Manager 사용
- ❌ 코드에 하드코딩 절대 금지
- ❌ Git에 커밋 금지 (`.gitignore` 확인)

---

## 📚 참고 문서

### AWS
- [Cost Explorer API 문서](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-api.html)
- [IAM 정책 생성](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_create.html)

### GCP
- [BigQuery Billing Export 설정](https://cloud.google.com/billing/docs/how-to/export-data-bigquery)
- [BigQuery IAM 권한](https://cloud.google.com/bigquery/docs/access-control)
- [서비스 계정 권한 부여](https://cloud.google.com/iam/docs/granting-changing-revoking-access)

---

**작성일**: 2025-11-29
**작성자**: AI Agent (Claude)
**버전**: 1.0
