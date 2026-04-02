# SonarQube 코드 품질 이슈 학습 가이드

> **목적**: `chore/sonarqube-fixes` 브랜치에서 수정된 소나큐브 위반 사항을 정리하여, 각 규칙이 **프로그래밍적으로 왜 안 좋은지** 학습하기 위한 문서
>
> **범위**: 백엔드(Java) 93개 파일 / 프론트엔드(TypeScript/React) 30+개 파일
>
> **작성일**: 2026-03-31

---

## 목차

- [Part 1: 백엔드 (Java/Spring Boot)](#part-1-백엔드-javaspring-boot)
  - [BLOCKER / BUG 등급](#1-blocker--bug-등급)
  - [기계적 대체 (Mechanical Replacements)](#2-기계적-대체-mechanical-replacements)
  - [Generic Exception 정리](#3-generic-exception-정리-s112)
  - [코드 품질 개선](#4-코드-품질-개선)
- [Part 2: 프론트엔드 (TypeScript/React)](#part-2-프론트엔드-typescriptreact)
  - [React Key 규칙](#1-배열-인덱스를-react-key로-사용-금지-s6479)
  - [중첩 삼항 연산자](#2-중첩-삼항-연산자-금지-s3358)
  - [시맨틱 HTML / 접근성](#3-시맨틱-html--접근성-s6853)
  - [Dead Code / 미사용 변수](#4-dead-code--미사용-변수-s1854s1128)
  - [기타 프론트엔드 이슈](#5-기타-프론트엔드-이슈)

---

## Part 1: 백엔드 (Java/Spring Boot)

### 1. BLOCKER / BUG 등급

이 카테고리는 **런타임 오류나 논리적 버그**를 직접 유발하는 가장 심각한 이슈들이다.

---

#### S3516 — 메서드가 항상 같은 값을 반환

| 항목 | 내용 |
|------|------|
| **심각도** | BLOCKER |
| **파일** | `ProjectFilter.java` |

**위반 코드 (개념)**:
```java
public Comparator<Project> getComparator() {
    // switch-case 분기가 있지만 모든 경로가 동일한 comparator를 반환
    switch (sortField) {
        case "title": return compareByTitle();
        case "date":  return compareByTitle(); // 복사-붙여넣기 실수
        default:      return compareByTitle();
    }
}
```

**수정 후**: 각 정렬 필드별로 실제 다른 comparator를 반환하도록 전용 헬퍼 메서드 분리.

**왜 나쁜가**: 조건 분기가 있지만 결과가 동일하면 **dead logic**이다. 컴파일러가 최적화할 수 없고, 개발자는 분기가 실제로 동작한다고 착각하게 된다. 대부분 복사-붙여넣기 실수에서 비롯된다.

---

#### S2699 — 테스트에 assertion이 없음

| 항목 | 내용 |
|------|------|
| **심각도** | BLOCKER |
| **파일** | `PortfolioQueryTest.java` |

**위반 코드**:
```java
@Test
void testQuery() {
    try {
        List<Project> projects = service.getProjects();
        // assertion 없이 출력만 함
        System.out.println("결과: " + projects.size());
    } catch (Exception e) {
        System.err.println("오류: " + e.getMessage());
    }
}
```

**수정 후**:
```java
@Test
void testQuery() {
    try {
        List<Project> projects = service.getProjects();
        Assertions.assertNotNull(projects, "projects should not be null");
    } catch (Exception e) {
        Assertions.fail("테스트 실행 중 오류 발생: " + e.getMessage(), e);
    }
}
```

**왜 나쁜가**: assertion이 없는 테스트는 **항상 통과**한다. 코드가 깨져도 테스트가 초록불이므로 거짓된 안전감을 준다. 회귀 방지 기능이 전혀 없는 테스트는 테스트가 없는 것보다 나쁠 수 있다.

---

#### S6001 — 존재하지 않는 캡처 그룹에 대한 역참조 (정규식 BUG)

| 항목 | 내용 |
|------|------|
| **심각도** | BUG |
| **파일** | `InputValidationService.java` |

**위반 코드**:
```java
Pattern koreanRepetition = Pattern.compile("[가-힣]{2,}\\1{2,}");
//                                        ↑ 문자 클래스(캡처 그룹 아님)
```

**수정 후**:
```java
Pattern koreanRepetition = Pattern.compile("([가-힣]{2,})\\1{2,}");
//                                         ↑ 괄호로 캡처 그룹 생성
```

**왜 나쁜가**: `\\1`은 **캡처 그룹 1번**을 역참조하는 문법이다. 그런데 `[가-힣]`은 문자 클래스일 뿐 캡처 그룹이 아니다. 결과적으로 런타임에 `PatternSyntaxException`이 발생하거나 아무것도 매치하지 못한다. 스팸 방어 로직이 완전히 무효화되는 실제 버그다.

---

#### S2142 — InterruptedException 처리 시 인터럽트 상태 복원 필수

| 항목 | 내용 |
|------|------|
| **심각도** | BUG |
| **파일** | `GcpBillingClient.java` |

**위반 코드**:
```java
try {
    result = bigQuery.query(config);
} catch (Exception e) {
    throw new RuntimeException("BigQuery query interrupted", e);
}
```

**수정 후**:
```java
try {
    result = bigQuery.query(config);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();  // 인터럽트 상태 복원
    throw new IllegalStateException("BigQuery query interrupted", e);
} catch (Exception e) {
    throw new IllegalStateException("BigQuery query failed", e);
}
```

**왜 나쁜가**: Java의 `InterruptedException`은 **협력적 취소 메커니즘**이다. catch하면 스레드의 interrupt 플래그가 자동으로 클리어된다. `Thread.currentThread().interrupt()`를 호출하지 않으면 상위 호출자(스레드 풀, 셧다운 훅)가 인터럽트를 감지할 수 없어 스레드가 영원히 종료되지 않을 수 있다.

---

#### S2201 — 반환값을 무시한 메서드 호출

| 항목 | 내용 |
|------|------|
| **심각도** | BUG |
| **파일** | `PostgresPortfolioRepository.java` |

**위반 코드**:
```java
// Hibernate LAZY 로딩을 트리거하려는 의도
entity.getProjectTechStacks().size();  // 반환값 무시
```

**수정 후**:
```java
int loadedCount = 0;
for (ProjectJpaEntity entity : jpaEntities) {
    if (entity.getProjectTechStacks() != null) {
        loadedCount += entity.getProjectTechStacks().size();
    }
}
log.debug("Loaded tech stacks total count: {}", loadedCount);
```

**왜 나쁜가**: 반환값을 버리는 메서드 호출은 **의도를 알 수 없다**. LAZY 로딩 트리거가 목적이라면 그 의도를 코드로 명시해야 한다. 그렇지 않으면 "실수로 반환값을 안 쓴 것"과 구분이 불가능하다.

---

### 2. 기계적 대체 (Mechanical Replacements)

패턴화된 코드 스타일 이슈로, 규칙을 한 번 이해하면 기계적으로 적용할 수 있다.

---

#### S6204 — `Collectors.toList()` → `toList()` (121건)

**위반 코드**:
```java
List<String> names = stream.collect(Collectors.toList());
```

**수정 후**:
```java
List<String> names = stream.toList();
```

**왜 나쁜가**:
- Java 16+에서 `Stream.toList()`는 불변 리스트를 반환하는 간결한 API이다
- `Collectors.toList()`는 가변 리스트를 반환하며 불필요하게 장황하다
- 대부분의 경우 리스트 수정이 필요 없으므로 불변이 더 안전하다

---

#### S6213 — 제한 식별자를 변수명으로 사용 금지 (8건)

**위반 코드**:
```java
SpamSubmissionRecord record = getRecord();
```

**수정 후**:
```java
SpamSubmissionRecord submissionState = getRecord();
```

**왜 나쁜가**: `record`는 Java 14부터 **제한 식별자(restricted identifier)**이다. record 클래스 선언에 사용되며, 변수명으로 쓰면 향후 Java 버전에서 컴파일 오류가 발생할 수 있다.

---

#### S106 — `System.out/err` 대신 Logger 사용 (6건)

**위반 코드**:
```java
System.out.println("BCrypt Hash: " + hashedPassword);
```

**수정 후**:
```java
log.info("BCrypt Hash: {}", hashedPassword);
```

**왜 나쁜가**: `System.out`은 로그 레벨, 필터링, 구조화, 로테이션이 불가능하다. 프로덕션에서 콘솔 출력은 유실되거나 다른 프로세스 출력과 섞인다. 로깅 프레임워크를 통해야 운영 환경에서 제어가 가능하다.

---

#### S1118 — 유틸리티 클래스는 private 생성자 필수 (3건)

**위반 코드**:
```java
public class DateUtils {
    public static LocalDate parse(String s) { ... }
    // 기본 public 생성자가 암묵적으로 존재
}
```

**수정 후**:
```java
public class DateUtils {
    private DateUtils() {
        throw new UnsupportedOperationException("Utility class");
    }
    public static LocalDate parse(String s) { ... }
}
```

**왜 나쁜가**: static 메서드만 있는 유틸리티 클래스는 인스턴스화할 이유가 없다. private 생성자 없이는 `new DateUtils()`가 가능한데, 이는 무의미하고 메모리를 낭비한다.

---

#### S3864 — `Stream.peek()` 제거 (3건)

**위반 코드**:
```java
list.stream()
    .peek(item -> item.setProcessed(true))  // 부작용(side-effect)
    .collect(toList());
```

**수정 후**: `peek()`의 부작용을 명시적 루프나 `map()` 내부로 이동.

**왜 나쁜가**: `peek()`는 **디버깅용 API**이다. 스트림 파이프라인 최적화(short-circuiting 등)에 의해 `peek()` 호출이 건너뛰어질 수 있어, 프로덕션 로직에 사용하면 예측 불가능한 동작이 발생한다.

---

### 3. Generic Exception 정리 (S112)

전체 47건. `RuntimeException` 대신 `IllegalStateException` 등 구체적 예외를 사용.

**위반 코드**:
```java
throw new RuntimeException("캐시 초기화 중 오류가 발생했습니다", e);
```

**수정 후**:
```java
throw new IllegalStateException("캐시 초기화 중 오류가 발생했습니다", e);
```

**왜 나쁜가**:
1. **catch 블록에서 구분 불가**: `catch (RuntimeException e)`는 관계없는 예외까지 모두 잡아버린다
2. **예외 계층 무력화**: Java의 checked/unchecked 예외 설계 의도를 훼손한다
3. **의미 전달 실패**: `IllegalStateException`은 "시스템이 예상치 못한 상태"라는 명확한 의미를 전달하고, `IllegalArgumentException`은 "잘못된 입력", `UnsupportedOperationException`은 "미구현 기능"을 의미한다
4. `GlobalExceptionHandler`에서 예외 타입별 분기 처리가 가능해진다

---

### 4. 코드 품질 개선

---

#### S1192 — 중복 문자열 리터럴을 상수로 추출 (20건)

**위반 코드**:
```java
// 여러 컨트롤러에 흩어진 동일 문자열
return ApiResponse.error(e.getMessage(), "잘못된 요청");
return ApiResponse.success("프로젝트 목록 조회 성공", projects);
```

**수정 후**:
```java
// WebApiResponseMessages.java 상수 클래스 생성
public static final String LABEL_BAD_REQUEST = "잘못된 요청";
public static final String PROJECT_LIST_SUCCESS = "프로젝트 목록 조회 성공";

// 사용처
return ApiResponse.error(e.getMessage(), WebApiResponseMessages.LABEL_BAD_REQUEST);
return ApiResponse.success(WebApiResponseMessages.PROJECT_LIST_SUCCESS, projects);
```

**왜 나쁜가**: 중복 문자열은 **유지보수의 적**이다. 메시지를 변경하려면 모든 사용처를 찾아야 하고, 하나를 놓치면 사용자에게 불일치한 메시지가 보인다. 상수로 추출하면 IDE의 Rename 리팩토링이 가능하고, 단일 소스 원칙(Single Source of Truth)을 지킬 수 있다.

---

#### S3776 — 인지 복잡도(Cognitive Complexity)가 너무 높음 (16건)

**위반 코드 (개념)**:
```java
public void updateProject(ProjectCommand cmd) {
    // 60줄짜리 메서드: 조건 분기 10개, 중첩 루프, null 체크 등
    if (cmd.getTitle() != null) { ... }
    if (cmd.getDescription() != null) { ... }
    if (cmd.getScreenshots() != null) {
        for (Screenshot s : cmd.getScreenshots()) {
            if (s.getUrl() != null) { ... }
        }
    }
    // ... 계속
}
```

**수정 후**: 관심사별로 메서드를 분리.
```java
public void updateProject(ProjectCommand cmd) {
    applyTitleDescriptionFields(entity, cmd);
    applyRoleContributionDates(entity, cmd);
    applyFeaturedImageScreenshots(entity, cmd);
    applyLinksAndSortOrder(entity, cmd);
}
```

**분리된 파일 예시**:

| 파일 | 원래 | 분리 후 |
|------|------|---------|
| `ManageProjectService` | `applyUpdateCommandFields` (60줄) | 4개의 focused 메서드 |
| `GetCloudUsageService` | `aggregateDailyToMonthly` | `groupDailiesByMonthKey`, `buildMonthlyUsageTrend`, `sumTotalCostForDailies`, `parseYearMonthKey` |
| `PostgresArticleRepository` | `save` (대형 메서드) | `updateExistingArticleEntity`, `mergeArticleTechStack`, `createNewArticleEntity` |

**왜 나쁜가**: 인간의 작업 기억(working memory)에는 한계가 있다. 중첩된 조건/루프가 많을수록 한 번에 파악할 수 있는 범위가 줄어들고, 버그가 숨어들 확률이 급격히 올라간다. 연구에 따르면 인지 복잡도가 임계값을 넘으면 결함 밀도(defect density)가 급증한다.

---

#### S1168 — null 대신 빈 컬렉션 반환 (11건)

**위반 코드**:
```java
if (jpaEntities == null) {
    return null;
}
```

**수정 후**:
```java
if (jpaEntities == null) {
    return List.of();
}
```

**왜 나쁜가**: null을 반환하면 모든 호출자가 null 체크를 해야 한다. 하나라도 빠뜨리면 `NullPointerException`. 빈 컬렉션을 반환하면 호출자는 안전하게 반복문을 돌릴 수 있다 — 이것이 **Null Object 패턴**의 핵심이다.

---

#### S3358 — 중첩 삼항 연산자 금지 (5건)

**위반 코드**:
```java
LocalDate date = usage.getLastUpdated() != null
    ? usage.getLastUpdated()
    : (usage.getPeriod() != null ? usage.getPeriod().getEndDate() : LocalDate.now());
```

**수정 후**:
```java
private static LocalDate resolveTrendDateForUsage(CloudUsage usage) {
    if (usage.getLastUpdated() != null) return usage.getLastUpdated();
    if (usage.getPeriod() != null) return usage.getPeriod().getEndDate();
    return LocalDate.now();
}
```

**왜 나쁜가**: 중첩 삼항은 우선순위가 직관적이지 않다. 경험 많은 개발자도 오독할 수 있으며, 조건이 추가되면 더 꼬인다. Early return 패턴의 명명된 메서드가 의도를 명확히 전달한다.

---

#### S1141 — 중첩 try 블록 추출 (4건)

**위반 코드**:
```java
try {
    // 주요 로직
    try {
        // 보조 로직
    } catch (IOException e) { ... }
} catch (Exception e) { ... }
```

**수정 후**: 내부 try 블록을 별도 메서드로 추출 (예: `logRedisConnectionInfo()`, `collectKeysUsingScan()`).

**왜 나쁜가**: 중첩 try-catch는 **실패 도메인(failure domain)**을 혼동시킨다. 각 try 블록은 독립된 실패 영역이므로 별도 메서드로 분리해야 에러 핸들링 경계가 명확해진다.

---

#### S5993 — 추상 클래스 생성자는 protected (2건)

**위반 코드**:
```java
public abstract class BaseFilter {
    public BaseFilter() { }
}
```

**수정 후**:
```java
public abstract class BaseFilter {
    protected BaseFilter() { }
}
```

**왜 나쁜가**: 추상 클래스는 직접 인스턴스화할 수 없으므로 public 생성자는 **거짓 약속**이다. protected로 선언해야 "서브클래스만 호출 가능"이라는 의도를 정확히 전달한다.

---

#### S1117 — 지역 변수가 필드를 가림 (Shadowing) (2건)

**위반 코드**:
```java
class ProjectFilter {
    private String sortOrder;

    public Comparator<?> getComparator() {
        String sortOrder = determineSortOrder(); // 필드를 가림!
    }
}
```

**수정 후**: 지역 변수명을 `invokedSortOrder`로 변경.

**왜 나쁜가**: 이름 섀도잉은 **참조 대상 혼동**의 원인이다. 개발자가 필드를 참조하려 했는데 지역 변수가 사용되거나 그 반대가 발생할 수 있다.

---

## Part 2: 프론트엔드 (TypeScript/React)

### 1. 배열 인덱스를 React Key로 사용 금지 (S6479)

| 항목 | 내용 |
|------|------|
| **심각도** | MAJOR |
| **수정 건수** | 15+ 위치, 8개 파일 |

**위반 코드**:
```tsx
{mainResponsibilities.map((item, index) => (
  <li key={index}>{item}</li>
))}
```

**수정 후**:
```tsx
// 중복 문자열 대응을 위한 occurrence map 패턴
const occurrenceMap = new Map<string, number>();
{mainResponsibilities.map((item) => {
  const occurrence = (occurrenceMap.get(item) ?? 0) + 1;
  occurrenceMap.set(item, occurrence);
  return <li key={`${item}-${occurrence}`}>{item}</li>;
})}
```

**다른 수정 예시**:

| 파일 | Before | After |
|------|--------|-------|
| `ProjectScreenshotsUpload.tsx` | `key={index}` | `key={screenshot.imageUrl}` |
| `StatsCards.tsx` | `key={index}` | `key={stat.title}` |
| `Pagination.tsx` | `key={\`ellipsis-${index}\`}` | 카운터 기반 `key={\`ellipsis-${ellipsisCount}\`}` |

**왜 나쁜가**: React는 `key`로 어떤 요소가 변경/추가/삭제되었는지 판단한다. 인덱스를 key로 쓰면:
1. **항목 재정렬 시**: React가 DOM 노드를 잘못 재사용 → input 상태가 엉뚱한 항목에 붙음
2. **항목 삽입/삭제 시**: 뒤따르는 모든 항목의 인덱스가 바뀜 → 불필요한 전체 재렌더링
3. **애니메이션 깨짐**: key가 바뀌면 컴포넌트가 unmount/remount되어 전환 효과가 깨진다

---

### 2. 중첩 삼항 연산자 금지 (S3358)

| 항목 | 내용 |
|------|------|
| **심각도** | MAJOR |
| **수정 건수** | 4개 파일 |

**위반 코드**:
```tsx
{isLoading ? (
  <div>로딩...</div>
) : filteredTechStacks.length === 0 ? (
  <Empty />
) : (
  <Row>...</Row>
)}
```

**수정 후**: IIFE(즉시 실행 함수) 또는 사전 계산 변수로 대체.
```tsx
{(() => {
  if (isLoading) return <div>로딩...</div>;
  if (filteredTechStacks.length === 0) return <Empty />;
  return <Row>...</Row>;
})()}
```

**또 다른 수정 (DemonSlayerEffect.tsx)**:
```tsx
// Before: 중첩 삼항
opacity: isFadingOut ? 0 : (isVisible ? 1 : 0)

// After: 사전 계산 변수
const containerLayerOpacity = isFadingOut ? 0 : (isVisible ? 1 : 0);
// → 변수명이 의미를 설명
```

**왜 나쁜가**: JSX 내 중첩 삼항은 들여쓰기가 깊어져 가독성이 급격히 떨어진다. 조건이 하나 더 추가되면 삼중 중첩이 되어 사실상 해독 불가능해진다.

---

### 3. 시맨틱 HTML / 접근성 (S6853)

| 항목 | 내용 |
|------|------|
| **심각도** | MAJOR / BUG |
| **수정 건수** | 7개 파일 |

**위반 코드**:
```tsx
<div onClick={handleClick} role="button" tabIndex={0} onKeyDown={handleKeyDown}>
  {children}
</div>
```

**수정 후**:
```tsx
<button type="button" className={classNames} onClick={onClick}>
  {children}
</button>
```

**주요 수정 파일**:

| 파일 | Before | After |
|------|--------|-------|
| `Card.tsx` → `ClickableCard.tsx` | `<div onClick role="button">` | Card/ClickableCard 분리, `<button>` 사용 |
| `Badge.tsx` | `<div onClick role="button">` | 클릭 가능 시 `<button>`, 아닐 시 `<div>` 분기 |
| `Modal.tsx` | `<div role="button">` 오버레이 | `<button type="button">` 오버레이 |
| `Tooltip.tsx` | `<div>` + 마우스 핸들러 | `<button type="button">` 래퍼 |
| `Spinner.tsx` | `<div role="status">` | `<output>` (시맨틱 라이브 리전 요소) |

**왜 나쁜가**: `<div>`에 `role="button"` + `tabIndex` + `onKeyDown`를 수동으로 추가하면:
1. **Space 키 기본 동작 방지** 누락 가능 (스크롤이 발생)
2. **disabled 상태** 처리 불완전
3. **스크린 리더**가 완벽히 인식하지 못할 수 있음
4. `<button>`은 이 모든 것을 **네이티브로 제공**한다 — 직접 구현은 바퀴의 재발명이다

---

### 4. Dead Code / 미사용 변수 (S1854/S1128)

| 항목 | 내용 |
|------|------|
| **심각도** | MAJOR |
| **수정 건수** | 10+개 파일 |

**수정 사례**:

| 파일 | 제거된 항목 |
|------|------------|
| `ProjectList.tsx` | 미사용 `handleDelete` 함수 (7줄) |
| `CertificationList.tsx` | 주석 처리된 import, hook, 코드 블록 |
| `ProjectScreenshotsUpload.tsx` | 미사용 prop `isLoading`, 미사용 state `previewImage` |
| `ArticleControlPanel.tsx` | 미사용 `currentSortLabel` 변수 |
| `ExperienceManagement.tsx` | 빈 if 블록: `if (success) {}` |

**왜 나쁜가**:
- **번들 크기 증가**: 사용하지 않는 코드가 프로덕션 빌드에 포함된다
- **인지 부하 증가**: 읽는 사람이 "이 코드가 어디서 쓰이는지" 추적하느라 시간을 낭비한다
- **주석 처리된 코드**가 특히 해로움: "복원해야 하나? 의도적으로 비활성화한 건가?" 의문을 야기한다

---

### 5. 기타 프론트엔드 이슈

#### S4325 — 불필요한 타입 검사 (2건)

**위반 코드**:
```tsx
typeof import.meta !== 'undefined' && import.meta.env?.DEV
```

**수정 후**:
```tsx
import.meta.env?.DEV
```

**왜 나쁜가**: Vite/ESM 환경에서 `import.meta`는 항상 존재한다. 절대 false가 될 수 없는 조건은 **도달 불가능한 분기**를 만들고, 읽는 사람에게 "non-Vite 환경도 지원하나?" 라는 거짓 인상을 준다.

---

#### S2325 — `readonly` 누락 (6건)

**위반 코드**:
```tsx
class AdminApiClient {
  private baseURL: string;
  constructor(url: string) { this.baseURL = url; }
}
```

**수정 후**:
```tsx
class AdminApiClient {
  private readonly baseURL: string;
  constructor(url: string) { this.baseURL = url; }
}
```

**왜 나쁜가**: `readonly` 없이는 클래스의 어떤 메서드든 `this.baseURL = "다른값"`으로 재할당할 수 있다. `readonly`는 **컴파일 타임 안전장치**로, 생성 후 변경 불가라는 의도를 강제한다.

---

#### S3923 — Optional Chaining 미사용 (7건)

**위반 코드**:
```tsx
experience.description && experience.description.toLowerCase().includes(query)
```

**수정 후**:
```tsx
experience.description?.toLowerCase().includes(query)
```

**왜 나쁜가**: 수동 null guard는 장황하고 체인에서 하나를 빠뜨릴 위험이 있다. Optional chaining은 TypeScript의 관용적 표현이며, null/undefined 전파를 간결하게 처리한다.

---

#### Context Value 메모이제이션 미흡 (2건)

**위반 코드**:
```tsx
// 매 렌더마다 새 객체 생성
<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
```

**수정 후**:
```tsx
const value = React.useMemo<ThemeContextValue>(
  () => ({ theme, toggleTheme, setTheme }),
  [theme, toggleTheme, setTheme]
);
<ThemeContext.Provider value={value}>
```

**왜 나쁜가**: Provider가 렌더링될 때마다 새 객체 참조가 생성되면, 값이 변경되지 않았더라도 **모든 Consumer가 재렌더링**된다. 컴포넌트 트리 상단의 Provider에서 이 문제가 발생하면 앱 전체 성능에 영향을 미친다.

---

#### S6544 — 동기 콜백에 async 함수 전달 (1건, BUG)

**위반 코드**:
```tsx
execute: async (state, api) => {
  // ...커스텀 커맨드의 execute는 동기 콜백을 기대
  await uploadImage();
}
```

**수정 후**:
```tsx
execute: (state, api) => {
  void (async () => {
    await uploadImage();
  })();
}
```

**왜 나쁜가**: 동기 콜백 위치에 async 함수를 전달하면 반환된 Promise가 **무시**된다. 즉, `await`도 `.catch()`도 불가능해서 에러가 삼켜진다. `void` IIFE 패턴으로 Promise를 명시적으로 처리해야 한다.

---

#### NaN 전파 / 타입 안전성 (1건, BUG)

**위반 코드**:
```tsx
// glowPosition: number | null
glowPosition !== null  // NaN이면 통과해버림
```

**수정 후**:
```tsx
typeof glowPosition === 'number' && Number.isFinite(glowPosition)
```

**왜 나쁜가**: `null !== null`은 `false`지만, `NaN !== null`은 `true`다. `NaN`이 렌더링 로직에 들어가면 CSS 값이 `NaN%`가 되어 시각적 버그가 발생한다. `Number.isFinite()`가 가장 정확한 숫자 가드다.

---

## 핵심 요약: 카테고리별 분류

### 버그를 직접 유발하는 이슈 (반드시 수정)

| 규칙 | 한 줄 요약 |
|------|-----------|
| S3516 | 모든 분기가 같은 값을 반환하면 로직 오류 |
| S2699 | assertion 없는 테스트는 회귀 방지 불가 |
| S6001 | 정규식 역참조 오류 → 매치 실패 |
| S2142 | 인터럽트 복원 누락 → 스레드 셧다운 불가 |
| S6479 | 배열 인덱스 key → React 재조정 버그 |
| S6853 | `<div>` 클릭 → 접근성 및 키보드 지원 깨짐 |
| S6544 | async 콜백 무시 → 에러 삼킴 |

### 유지보수성을 해치는 이슈 (강력 권장)

| 규칙 | 한 줄 요약 |
|------|-----------|
| S112 | 구체적 예외 대신 RuntimeException 던지면 catch에서 구분 불가 |
| S1192 | 중복 문자열 → 변경 시 누락 위험 |
| S3776 | 높은 인지 복잡도 → 결함 밀도 증가 |
| S1168 | null 반환 → NullPointerException 유발 |
| S3358 | 중첩 삼항 → 가독성 0 |
| S1854 | Dead code → 인지 부하 및 번들 크기 증가 |

### 코드 스타일 / 모던화 (권장)

| 규칙 | 한 줄 요약 |
|------|-----------|
| S6204 | `Collectors.toList()` → `toList()` (Java 16+) |
| S6213 | record 같은 제한 식별자를 변수명으로 쓰지 않기 |
| S2325 | 불변 필드에 `readonly` 붙이기 |
| S3923 | Optional chaining 사용하기 |
| S106 | System.out 대신 Logger 사용 |
