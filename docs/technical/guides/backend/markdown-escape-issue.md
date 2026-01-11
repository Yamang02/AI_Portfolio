# 마크다운 백틱 이스케이프 문제 해결 가이드

## 문제 상황

마크다운 콘텐츠에 백틱이 `\`` 형태로 이스케이프되어 저장되어 있어서, `react-markdown`이 이를 코드 블록으로 인식하지 못하고 일반 텍스트로 렌더링하는 문제가 발생했습니다.

**원인**: 마크다운 작성 시 백슬래시와 백틱을 함께 입력하거나, 마크다운 에디터에서 자동으로 이스케이프된 것으로 확인됨.

## 원인 분석

### 가능한 원인

1. **프론트엔드 마크다운 에디터**: `@uiw/react-md-editor`에서 백틱을 이스케이프할 가능성
2. **JSON 직렬화**: `JSON.stringify()`는 일반적으로 백틱을 이스케이프하지 않지만, 특정 상황에서 발생할 수 있음
3. **백엔드 Jackson 설정**: Jackson ObjectMapper의 특정 설정으로 인한 이스케이프 (확인 필요)

### 확인 사항

- ✅ 프론트엔드에서 이스케이프 복원 로직 추가 완료
- ⚠️ 백엔드에서 이스케이프 발생 원인 확인 필요

## 해결 방법

### 프론트엔드 (완료)

`MarkdownRenderer.tsx`에서 이스케이프된 백틱을 복원하는 로직을 추가했습니다:

```typescript
const processedContent = React.useMemo(() => {
  if (!content) return '';

  // 이스케이프된 백틱 복원
  let processed = content.replace(/\\`/g, '`');

  // 기타 이스케이프 문자 복원 (필요한 경우)
  processed = processed.replace(/\\n/g, '\n');
  processed = processed.replace(/\\r/g, '\r');
  processed = processed.replace(/\\t/g, '\t');

  return processed;
}, [content]);
```

### 백엔드 (권장)

백엔드에서 이스케이프가 발생하는 원인을 확인하고 수정하는 것이 근본적인 해결책입니다.

#### 확인할 사항

1. **Jackson ObjectMapper 설정**
   - `application.yml` 또는 `application.properties`에서 Jackson 설정 확인
   - 특별한 이스케이프 설정이 있는지 확인

2. **마크다운 에디터 설정**
   - `@uiw/react-md-editor`의 설정 확인
   - 백틱을 이스케이프하는 옵션이 있는지 확인

3. **DB 저장 시 이스케이프**
   - JPA/Hibernate가 특정 문자를 이스케이프하는지 확인
   - PostgreSQL의 TEXT 타입은 백틱을 이스케이프하지 않음

#### 권장 수정 사항

백엔드에서 마크다운 콘텐츠를 저장할 때 이스케이프가 발생하지 않도록 확인:

```java
// AdminArticleController.java
@PostMapping
public ResponseEntity<ApiResponse<ArticleResponse>> create(@RequestBody CreateArticleRequest request) {
    // request.content()가 이미 이스케이프되어 있는지 확인
    // 필요시 이스케이프 제거 로직 추가
    String content = request.content();
    // content가 \` 형태로 이스케이프되어 있다면 복원
    // (하지만 일반적으로 JSON 파싱 시 이스케이프는 자동으로 처리됨)
    
    ManageArticleUseCase.CreateArticleCommand command = new ManageArticleUseCase.CreateArticleCommand(
            request.title(),
            request.summary(),
            content, // 이스케이프가 제거된 콘텐츠
            // ...
    );
    // ...
}
```

## 테스트 방법

1. **마크다운 콘텐츠 작성**
   ```markdown
   ```javascript
   const code = "test";
   ```
   ```

2. **저장 후 확인**
   - DB에 저장된 콘텐츠 확인
   - API 응답에서 콘텐츠 확인
   - 프론트엔드에서 렌더링 확인

3. **콘솔 로그 확인**
   - `MarkdownRenderer`의 디버깅 로그 확인
   - `Original content`와 `Processed content` 비교

## 원인 확인

마크다운 작성 시 백틱이 이스케이프되어 입력된 것으로 확인되었습니다. 백엔드 코드상으로는 이스케이프가 발생하지 않으며, 프론트엔드에서 이스케이프 복원 로직으로 해결됩니다.

## 확인된 사항

### 백엔드 코드 분석 결과

1. **Jackson 설정**: 기본 설정 사용, 특별한 이스케이프 처리 없음
2. **JPA 엔티티**: `@Column(columnDefinition = "TEXT")` 사용, 이스케이프 처리 없음
3. **DB 컬럼**: PostgreSQL TEXT 타입, 백틱을 이스케이프하지 않음
4. **Request Body 파싱**: Spring Boot 기본 Jackson이 처리, 백틱은 이스케이프하지 않음

### 가능한 원인 (확인 필요)

1. **프론트엔드 마크다운 에디터**: `@uiw/react-md-editor`가 백틱을 이스케이프할 가능성
2. **프론트엔드 JSON 직렬화**: `JSON.stringify()`는 일반적으로 백틱을 이스케이프하지 않지만, 특정 상황에서 발생할 수 있음
3. **기존 데이터**: 이미 DB에 이스케이프된 형태로 저장된 데이터

## 향후 개선 사항

1. **백엔드 근본 원인 파악**: 로깅을 통해 이스케이프 발생 지점 정확히 확인
2. **통합 테스트 추가**: 마크다운 콘텐츠 저장/조회 테스트
3. **기존 데이터 마이그레이션**: DB에 저장된 이스케이프된 데이터 복원 (필요 시)

## 참고

- [react-markdown 공식 문서](https://github.com/remarkjs/react-markdown)
- [@uiw/react-md-editor 공식 문서](https://uiwjs.github.io/react-md-editor/)
- [Jackson ObjectMapper 설정](https://www.baeldung.com/jackson-object-mapper-tutorial)
