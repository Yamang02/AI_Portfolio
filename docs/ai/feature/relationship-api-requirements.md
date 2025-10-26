# 관계 관리 API 요구사항

**작성일**: 2025-01-26  
**목적**: 기술스택/프로젝트 관계 관리를 위한 백엔드 API 요구사항 정리

---

## 현재 상황

### 프론트엔드
- ✅ 관계 선택 및 관리 UI 완성 (`TechStackRelationshipSection`, `ProjectRelationshipSection`)
- ✅ Experience, Education 페이지에 적용 완료
- ⚠️ 백엔드 API 미구현으로 기존 데이터 로드 불가

### 백엔드
- ✅ 릴레이션 테이블 준비 완료:
  - `experience_tech_stack`
  - `education_tech_stack`
  - `project_tech_stack`
- ⚠️ 관계 CRUD API 미구현
- ⚠️ 응답에 관계 메타데이터 미포함

---

## 필요한 API

### 1. Experience - TechStack 관계

#### GET: 기존 관계 조회
```
GET /api/admin/experiences/{id}/tech-stacks
Response: [
  {
    "id": 1,
    "techStackId": 5,
    "techStackName": "React",
    "techStackDisplayName": "React",
    "category": "framework",
    "isPrimary": true,
    "usageDescription": "주요 UI 개발에 사용"
  }
]
```

#### POST: 관계 추가
```
POST /api/admin/experiences/{id}/tech-stacks
Request: {
  "techStackId": 5,
  "isPrimary": true,
  "usageDescription": "주요 UI 개발에 사용"
}
```

#### DELETE: 관계 삭제
```
DELETE /api/admin/experiences/{id}/tech-stacks/{techStackId}
```

### 2. Experience - Project 관계

#### GET: 기존 관계 조회
```
GET /api/admin/experiences/{id}/projects
Response: [
  {
    "id": 1,
    "projectId": 10,
    "projectTitle": "포트폴리오 사이트",
    "isPrimary": true,
    "usageDescription": "백엔드 API 개발 담당"
  }
]
```

#### POST: 관계 추가
```
POST /api/admin/experiences/{id}/projects
Request: {
  "projectId": 10,
  "isPrimary": true,
  "usageDescription": "백엔드 API 개발 담당"
}
```

#### DELETE: 관계 삭제
```
DELETE /api/admin/experiences/{id}/projects/{projectId}
```

### 3. Education - TechStack 관계

동일한 패턴으로 구현:
- `GET /api/admin/educations/{id}/tech-stacks`
- `POST /api/admin/educations/{id}/tech-stacks`
- `DELETE /api/admin/educations/{id}/tech-stacks/{techStackId}`

---

## 응답 형식 개선 (선택사항)

현재 Experience DTO에 `technologies: string[]`만 있고, 메타데이터가 없습니다.

### 개선안 1: 응답 확장
```java
@Data
public class ExperienceDto {
    // ... 기존 필드
    private List<TechStackMetadataDto> techStackMetadata;
    private List<ProjectMetadataDto> relatedProjects;
}
```

### 개선안 2: 별도 API
기존 응답 유지하고, 관계 조회만 별도 API로 제공

**권장**: 개선안 2 (점진적 개선, 기존 코드 영향 최소)

---

## 구현 우선순위

1. **High**: Experience - TechStack 관계 CRUD API
2. **High**: Experience - Project 관계 CRUD API
3. **Medium**: Education - TechStack 관계 CRUD API
4. **Low**: 응답 형식 개선 (관계 메타데이터 포함)

---

**작성자**: AI Agent (Claude)  
**작성일**: 2025-01-26

