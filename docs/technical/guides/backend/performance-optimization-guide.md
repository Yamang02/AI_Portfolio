# 백엔드 성능 최적화 가이드

## 📚 목차
1. [N+1 문제 방지](#n1-문제-방지)
2. [배치 조회 패턴](#배치-조회-패턴)
3. [검색 쿼리 최적화](#검색-쿼리-최적화)
4. [중복 코드 제거](#중복-코드-제거)
5. [체크리스트](#체크리스트)

---

## N+1 문제 방지

### 문제 정의

**N+1 문제**는 목록 조회 시 각 항목마다 연관된 데이터를 개별 조회하여 발생하는 성능 문제입니다.

- **N**: 목록 항목 수
- **+1**: 목록 조회 쿼리
- **결과**: N+1개의 쿼리 발생

### 예시: 잘못된 코드

```java
// ❌ Bad: 각 아티클마다 시리즈 정보를 개별 조회
public List<ArticleListResponse> getArticleList() {
    List<Article> articles = articleRepository.findAll();
    
    return articles.stream()
        .map(article -> {
            // 각 아티클마다 시리즈 조회 (N+1 문제)
            String seriesTitle = null;
            if (article.getSeriesId() != null) {
                ArticleSeries series = seriesRepository.findBySeriesId(article.getSeriesId());
                if (series != null) {
                    seriesTitle = series.getTitle();
                }
            }
            
            return ArticleListResponse.from(article, seriesTitle);
        })
        .collect(Collectors.toList());
}
```

**문제점**: 100개 아티클 조회 시 101개 쿼리 발생 (1개 목록 조회 + 100개 시리즈 조회)

### 해결 방법: 배치 조회

```java
// ✅ Good: 시리즈 ID를 일괄 수집 후 배치 조회
public List<ArticleListResponse> getArticleList() {
    List<Article> articles = articleRepository.findAll();
    
    // 1. 시리즈 ID 일괄 수집
    List<String> seriesIds = articles.stream()
        .map(Article::getSeriesId)
        .filter(Objects::nonNull)
        .distinct()
        .collect(Collectors.toList());
    
    // 2. 배치 조회 (1개 쿼리)
    Map<String, ArticleSeries> seriesMap = seriesRepository
        .findBySeriesIdIn(seriesIds)
        .stream()
        .collect(Collectors.toMap(
            ArticleSeries::getSeriesId,
            Function.identity()
        ));
    
    // 3. Map을 사용하여 매핑
    return articles.stream()
        .map(article -> {
            String seriesTitle = null;
            if (article.getSeriesId() != null) {
                ArticleSeries series = seriesMap.get(article.getSeriesId());
                if (series != null) {
                    seriesTitle = series.getTitle();
                }
            }
            
            return ArticleListResponse.from(article, seriesTitle);
        })
        .collect(Collectors.toList());
}
```

**개선 효과**: 100개 아티클 조회 시 2개 쿼리만 발생 (1개 목록 조회 + 1개 배치 시리즈 조회)

---

## 배치 조회 패턴

### 패턴 1: Application Layer에서 배치 조회

목록 조회 시 연관된 데이터를 배치로 조회하는 패턴입니다.

#### 단계별 구현

1. **연관 ID 수집**: 목록에서 연관된 ID를 추출
2. **배치 조회**: `findByIdIn()` 또는 `findByXxxIn()` 메서드 사용
3. **Map 생성**: 빠른 조회를 위한 Map 생성
4. **매핑**: Map을 사용하여 응답 객체 생성

#### 예시: 프로젝트 통계 조회

```java
// ❌ Bad: 각 프로젝트마다 개별 조회
public ArticleStatistics getStatistics() {
    List<Object[]> projectResults = jpaRepository.countByProjectId();
    List<ArticleStatistics.ProjectStatistics> projectStats = new ArrayList<>();
    
    for (Object[] result : projectResults) {
        Long projectId = ((Number) result[0]).longValue();
        Long count = ((Number) result[1]).longValue();
        
        // 각 프로젝트마다 개별 조회 (N+1 문제)
        Optional<ProjectJpaEntity> projectOpt = projectJpaRepository.findById(projectId);
        if (projectOpt.isPresent()) {
            ProjectJpaEntity project = projectOpt.get();
            projectStats.add(new ArticleStatistics.ProjectStatistics(
                project.getId(),
                project.getBusinessId(),
                project.getTitle(),
                count
            ));
        }
    }
    
    return new ArticleStatistics(categoryCounts, projectStats, seriesStats);
}
```

```java
// ✅ Good: 프로젝트 ID 일괄 수집 후 배치 조회
public ArticleStatistics getStatistics() {
    List<Object[]> projectResults = jpaRepository.countByProjectId();
    
    // 1. 프로젝트 ID 일괄 수집
    Set<Long> projectIds = projectResults.stream()
        .map(result -> ((Number) result[0]).longValue())
        .collect(Collectors.toSet());
    
    // 2. 배치 조회 (1개 쿼리)
    Map<Long, ProjectJpaEntity> projectMap = projectJpaRepository
        .findAllById(projectIds)
        .stream()
        .collect(Collectors.toMap(
            ProjectJpaEntity::getId,
            Function.identity()
        ));
    
    // 3. Map을 사용하여 매핑
    List<ArticleStatistics.ProjectStatistics> projectStats = projectResults.stream()
        .map(result -> {
            Long projectId = ((Number) result[0]).longValue();
            Long count = ((Number) result[1]).longValue();
            
            ProjectJpaEntity project = projectMap.get(projectId);
            if (project != null) {
                return new ArticleStatistics.ProjectStatistics(
                    project.getId(),
                    project.getBusinessId(),
                    project.getTitle(),
                    count
                );
            }
            return null;
        })
        .filter(Objects::nonNull)
        .collect(Collectors.toList());
    
    return new ArticleStatistics(categoryCounts, projectStats, seriesStats);
}
```

### 패턴 2: Repository에 배치 조회 메서드 추가

Repository에 `findByIdIn()` 또는 `findByXxxIn()` 메서드를 추가합니다.

```java
// domain/article/port/out/ArticleSeriesRepositoryPort.java
public interface ArticleSeriesRepositoryPort {
    Optional<ArticleSeries> findBySeriesId(String seriesId);
    
    // ✅ 배치 조회 메서드 추가
    List<ArticleSeries> findBySeriesIdIn(List<String> seriesIds);
}

// infrastructure/persistence/postgres/repository/ArticleSeriesJpaRepository.java
@Repository
public interface ArticleSeriesJpaRepository extends JpaRepository<ArticleSeriesJpaEntity, Long> {
    Optional<ArticleSeriesJpaEntity> findBySeriesId(String seriesId);
    
    // ✅ 배치 조회 메서드 추가
    List<ArticleSeriesJpaEntity> findBySeriesIdIn(List<String> seriesIds);
}
```

### 패턴 3: 공통 배치 조회 유틸리티

반복되는 배치 조회 로직을 유틸리티로 추출합니다.

```java
// application/shared/util/BatchQueryUtil.java
public class BatchQueryUtil {
    
    public static <T, ID> Map<ID, T> batchQueryByIds(
            List<T> items,
            Function<T, ID> idExtractor,
            Function<List<ID>, List<T>> batchQuery) {
        
        if (items.isEmpty()) {
            return Collections.emptyMap();
        }
        
        // ID 수집
        List<ID> ids = items.stream()
            .map(idExtractor)
            .filter(Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());
        
        if (ids.isEmpty()) {
            return Collections.emptyMap();
        }
        
        // 배치 조회
        List<T> results = batchQuery.apply(ids);
        
        // Map 생성 (ID 추출 로직 필요)
        return results.stream()
            .collect(Collectors.toMap(
                idExtractor,
                Function.identity()
            ));
    }
}
```

---

## 검색 쿼리 최적화

### 문제: LIKE '%keyword%' 패턴

`LIKE '%keyword%'` 패턴은 인덱스를 활용하지 못하고 전체 테이블 스캔을 발생시킵니다.

```java
// ❌ Bad: LIKE '%keyword%' 패턴
@Query("SELECT a FROM ArticleJpaEntity a " +
       "WHERE a.title LIKE %:keyword% OR " +
       "      a.summary LIKE %:keyword% OR " +
       "      a.content LIKE %:keyword%")
List<ArticleJpaEntity> searchByKeyword(@Param("keyword") String keyword);
```

### 해결 방법: PostgreSQL Full-Text Search

PostgreSQL의 Full-Text Search 기능을 활용하여 검색 성능을 개선합니다.

#### 1. 인덱스 생성

```sql
-- GIN 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_articles_search ON articles
USING gin(to_tsvector('simple',
    title || ' ' || coalesce(summary, '') || ' ' || content
));
```

#### 2. Repository 메서드 수정

```java
// ✅ Good: Full-Text Search 사용
@Query(value = "SELECT * FROM articles " +
               "WHERE to_tsvector('simple', " +
               "      title || ' ' || coalesce(summary, '') || ' ' || content) " +
               "      @@ plainto_tsquery('simple', :keyword)",
       nativeQuery = true)
List<ArticleJpaEntity> searchByKeyword(@Param("keyword") String keyword);
```

#### 3. 성능 비교

- **LIKE '%keyword%'**: 전체 테이블 스캔, 인덱스 미사용
- **Full-Text Search**: GIN 인덱스 활용, 빠른 검색

---

## 중복 코드 제거

### 문제: 중복된 배치 조회 로직

여러 메서드에서 동일한 배치 조회 로직이 반복되는 경우가 있습니다.

```java
// ❌ Bad: 중복된 TechStack 배치 조회 로직
public Page<Article> findAll(Pageable pageable) {
    Page<ArticleJpaEntity> page = jpaRepository.findAll(pageable);
    
    // TechStack 배치 조회 로직
    List<Long> articleIds = page.getContent().stream()
        .map(ArticleJpaEntity::getId)
        .collect(Collectors.toList());
    
    Map<Long, List<ArticleTechStackJpaEntity>> techStackMap =
        techStackRepository.findByArticleIdIn(articleIds).stream()
            .collect(Collectors.groupingBy(
                ts -> ts.getArticle().getId()
            ));
    
    return page.map(entity -> {
        entity.setTechStack(techStackMap.getOrDefault(entity.getId(), List.of()));
        return mapper.toDomain(entity);
    });
}

public Page<Article> findByFilter(ArticleFilter filter, Pageable pageable) {
    Page<ArticleJpaEntity> page = jpaRepository.findByFilter(filter, pageable);
    
    // 동일한 TechStack 배치 조회 로직 중복
    List<Long> articleIds = page.getContent().stream()
        .map(ArticleJpaEntity::getId)
        .collect(Collectors.toList());
    
    Map<Long, List<ArticleTechStackJpaEntity>> techStackMap =
        techStackRepository.findByArticleIdIn(articleIds).stream()
            .collect(Collectors.groupingBy(
                ts -> ts.getArticle().getId()
            ));
    
    return page.map(entity -> {
        entity.setTechStack(techStackMap.getOrDefault(entity.getId(), List.of()));
        return mapper.toDomain(entity);
    });
}
```

### 해결 방법: 공통 메서드 추출

```java
// ✅ Good: 공통 메서드로 추출
private Page<Article> mapArticlesWithTechStack(Page<ArticleJpaEntity> page) {
    if (page.isEmpty()) {
        return page.map(mapper::toDomain);
    }
    
    List<Long> articleIds = page.getContent().stream()
        .map(ArticleJpaEntity::getId)
        .collect(Collectors.toList());
    
    Map<Long, List<ArticleTechStackJpaEntity>> techStackMap =
        techStackRepository.findByArticleIdIn(articleIds).stream()
            .collect(Collectors.groupingBy(
                ts -> ts.getArticle().getId()
            ));
    
    return page.map(entity -> {
        entity.setTechStack(techStackMap.getOrDefault(entity.getId(), List.of()));
        return mapper.toDomain(entity);
    });
}

public Page<Article> findAll(Pageable pageable) {
    Page<ArticleJpaEntity> page = jpaRepository.findAll(pageable);
    return mapArticlesWithTechStack(page);
}

public Page<Article> findByFilter(ArticleFilter filter, Pageable pageable) {
    Page<ArticleJpaEntity> page = jpaRepository.findByFilter(filter, pageable);
    return mapArticlesWithTechStack(page);
}
```

---

## 체크리스트

### 목록 조회 API 개발 시

- [ ] 연관된 데이터 조회가 필요한가?
- [ ] 각 항목마다 개별 조회하지 않는가?
- [ ] 배치 조회 메서드(`findByIdIn()`)가 Repository에 있는가?
- [ ] Application Layer에서 배치 조회를 수행하는가?
- [ ] Map을 사용하여 빠른 조회를 하는가?

### 통계/집계 API 개발 시

- [ ] 통계 결과에 메타데이터가 필요한가?
- [ ] 각 항목마다 개별 조회하지 않는가?
- [ ] ID를 일괄 수집 후 배치 조회하는가?

### 검색 기능 개발 시

- [ ] `LIKE '%keyword%'` 패턴을 사용하지 않는가?
- [ ] Full-Text Search 인덱스가 생성되어 있는가?
- [ ] `to_tsvector()`와 `plainto_tsquery()`를 사용하는가?

### 코드 리뷰 시

- [ ] 중복된 배치 조회 로직이 있는가?
- [ ] 공통 메서드로 추출할 수 있는가?
- [ ] N+1 문제가 발생할 가능성이 있는가?

---

## 참고 자료

- [JPA N+1 문제 해결 방법](https://www.baeldung.com/jpa-entity-graph)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [배치 처리 최적화](https://vladmihalcea.com/hibernate-facts-favoring-settransformers/)

---

**작성일**: 2025-01-25
**버전**: 1.0
**작성자**: AI Agent (Claude)
