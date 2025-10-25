# Import 정리 가이드라인

**작성일**: 2025-01-25
**목적**: 코드 가독성 향상 및 일관된 import 스타일 적용

---

## 📌 Import 정리 원칙

### 1. **그룹화 및 순서**

Import는 다음 순서로 그룹화하고, 각 그룹 사이에 빈 줄을 추가합니다:

```java
package com.aiportfolio.backend.application.portfolio;

// ==================== Application Common ====================
// 프로젝트 공통 기반 클래스
import com.aiportfolio.backend.application.common.BaseCrudService;
import com.aiportfolio.backend.application.common.BaseRepositoryPort;

// ==================== Domain Layer ====================
// 비즈니스 도메인 모델 및 포트
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageEducationUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;

// ==================== Infrastructure Layer ====================
// 인프라 레이어 컴포넌트 (필요시)
// import com.aiportfolio.backend.infrastructure...

// ==================== Framework & Libraries ====================
// 외부 라이브러리 (Spring, Lombok 등)
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// ==================== Java Standard ====================
// Java 표준 라이브러리
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
```

---

## 🎯 그룹별 상세 가이드

### Group 1: Application Common
**목적**: 프로젝트 내 공통 추상 클래스 및 유틸리티

```java
// ==================== Application Common ====================
import com.aiportfolio.backend.application.common.*;
```

**포함 대상**:
- `BaseCrudService` - 공통 CRUD 추상 클래스
- `BaseRepositoryPort` - 공통 Repository 인터페이스
- 공통 DTO, 예외 클래스 등

---

### Group 2: Domain Layer
**목적**: 헥사고날 아키텍처의 도메인 계층

```java
// ==================== Domain Layer ====================
import com.aiportfolio.backend.domain.{도메인}.model.*;
import com.aiportfolio.backend.domain.{도메인}.port.in.*;
import com.aiportfolio.backend.domain.{도메인}.port.out.*;
import com.aiportfolio.backend.domain.{도메인}.service.*;
```

**포함 대상**:
- Domain Model (엔티티, VO)
- Use Case 인터페이스 (Port In)
- Repository Port (Port Out)
- Domain Service

**순서**: `model` → `port.in` → `port.out` → `service`

---

### Group 3: Infrastructure Layer
**목적**: 외부 시스템 연동 및 기술 구현체

```java
// ==================== Infrastructure Layer ====================
import com.aiportfolio.backend.infrastructure.persistence.*;
import com.aiportfolio.backend.infrastructure.web.*;
```

**포함 대상**:
- JPA Entity, Repository
- REST Controller, DTO
- 외부 API Client

---

### Group 4: Framework & Libraries
**목적**: Spring, Lombok 등 외부 프레임워크

```java
// ==================== Framework & Libraries ====================
import lombok.*;
import org.springframework.*;
import jakarta.*;
```

**순서**: `lombok` → `spring` → `jakarta` → 기타

---

### Group 5: Java Standard
**목적**: Java 표준 라이브러리

```java
// ==================== Java Standard ====================
import java.time.*;
import java.util.*;
```

**순서**: 알파벳 순

---

## ✅ Good Examples

### Example 1: Service 클래스

```java
package com.aiportfolio.backend.application.portfolio;

// ==================== Application Common ====================
import com.aiportfolio.backend.application.common.BaseCrudService;
import com.aiportfolio.backend.application.common.BaseRepositoryPort;

// ==================== Domain Layer ====================
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageEducationUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;

// ==================== Framework & Libraries ====================
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// ==================== Java Standard ====================
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ManageEducationService extends BaseCrudService<Education, String> {
    // ...
}
```

### Example 2: Controller 클래스

```java
package com.aiportfolio.backend.infrastructure.web.controller;

// ==================== Domain Layer ====================
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.port.in.GetEducationUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageEducationUseCase;

// ==================== Infrastructure Layer ====================
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.education.EducationDto;

// ==================== Framework & Libraries ====================
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

// ==================== Java Standard ====================
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/educations")
@RequiredArgsConstructor
@Slf4j
public class EducationController {
    // ...
}
```

---

## ❌ Bad Examples

### Bad Example 1: 섞여있는 import

```java
// ❌ 나쁜 예: 그룹화 없고 순서 뒤죽박죽
import java.util.List;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import lombok.RequiredArgsConstructor;
import com.aiportfolio.backend.application.common.BaseCrudService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
```

### Bad Example 2: 와일드카드 남용

```java
// ❌ 나쁜 예: 너무 많은 와일드카드
import com.aiportfolio.backend.domain.portfolio.model.*;
import com.aiportfolio.backend.domain.portfolio.port.in.*;
import com.aiportfolio.backend.domain.portfolio.port.out.*;
// → 어떤 클래스를 사용하는지 명확하지 않음
```

**권장**: 5개 이하면 개별 import, 6개 이상이면 와일드카드

---

## 🔧 IDE 설정

### IntelliJ IDEA

1. **Settings** → **Editor** → **Code Style** → **Java** → **Imports**
2. **Import Layout** 설정:

```
- com.aiportfolio.backend.application.common
<blank line>
- com.aiportfolio.backend.domain
<blank line>
- com.aiportfolio.backend.infrastructure
<blank line>
- lombok
- org.springframework
- jakarta
<blank line>
- java
- javax
```

3. **Class count to use import with '\*'**: 6
4. **Names count to use static import with '\*'**: 6

### VS Code (Java Extension)

`settings.json`:
```json
{
  "java.completion.importOrder": [
    "com.aiportfolio.backend.application.common",
    "",
    "com.aiportfolio.backend.domain",
    "",
    "com.aiportfolio.backend.infrastructure",
    "",
    "lombok",
    "org.springframework",
    "jakarta",
    "",
    "java",
    "javax"
  ]
}
```

---

## 📝 체크리스트

코드 리뷰 시 확인사항:

- [ ] Import가 5개 그룹으로 나뉘어 있는가?
- [ ] 각 그룹 사이에 빈 줄이 있는가?
- [ ] 그룹 내에서 알파벳 순으로 정렬되어 있는가?
- [ ] 사용하지 않는 import가 없는가?
- [ ] 와일드카드가 적절히 사용되었는가? (6개 이상일 때만)
- [ ] 그룹별 주석이 명확한가?

---

## 🎯 요약

| 그룹 | 순서 | 예시 |
|------|------|------|
| **Application Common** | 1 | `com.aiportfolio.backend.application.common.*` |
| **Domain Layer** | 2 | `com.aiportfolio.backend.domain.*` |
| **Infrastructure Layer** | 3 | `com.aiportfolio.backend.infrastructure.*` |
| **Framework & Libraries** | 4 | `lombok.*`, `org.springframework.*` |
| **Java Standard** | 5 | `java.*`, `javax.*` |

**핵심**: 의존성 방향을 한눈에 파악할 수 있도록 정리

---

**참고 자료**:
- [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html#s3.3-import-statements)
- [Oracle Java Conventions](https://www.oracle.com/java/technologies/javase/codeconventions-fileorganization.html)
