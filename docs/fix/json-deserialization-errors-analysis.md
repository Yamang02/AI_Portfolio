# JSON 역직렬화 오류 근본 원인 분석 및 해결 방안

## 📋 문서 정보
- **작성일**: 2025-12-17
- **문제**: 프로젝트 수정 시 JSON 역직렬화 오류 발생
- **영향 범위**: Admin 페이지 프로젝트 생성/수정 기능

---

## 🔴 발생한 오류들

### 1. ArrayList 역직렬화 오류
```
Cannot construct instance of `java.util.ArrayList` 
from String value ('Admin 페이지 개발')
```

### 2. Long 타입 역직렬화 오류
```
Cannot deserialize value of type `java.lang.Long` 
from String "Java": not a valid `java.lang.Long` value
```

---

## 🔍 근본 원인 분석

### 원인 1: 타입 불일치 (Type Mismatch)

#### 문제점
- **프론트엔드**: TypeScript 타입 정의와 실제 런타임 값이 불일치
- **백엔드**: Java 타입과 JSON 값이 불일치

#### 구체적 사례

**1. `myContributions` 필드**
```typescript
// ❌ 문제: 타입 검증 없이 split() 호출
const myContributionsArray = values.myContributions
  ? values.myContributions.split('\n')  // 문자열이 아닐 수 있음
  : undefined;
```

**2. `technologies` 필드**
```typescript
// ❌ 문제: 타입 선언과 실제 사용 불일치
const [technologies, setTechnologies] = useState<number[]>([]);
const handleTechnologiesChange = (newTechs: string[]) => {  // string[] 선언
  setTechnologies(newTechs);  // string[]을 number[]에 할당!
};
```

### 원인 2: 데이터 변환 로직 부재

#### 문제점
- Form 데이터와 API 요청 데이터 간 변환 로직이 분산되어 있음
- 타입 검증이 각 컴포넌트에 흩어져 있음
- 일관성 없는 데이터 변환 처리

### 원인 3: 런타임 타입 검증 부족

#### 문제점
- TypeScript는 컴파일 타임에만 검증
- 런타임에 잘못된 타입이 전달될 수 있음
- JSON 직렬화/역직렬화 과정에서 타입 정보 손실

---

## ✅ 해결 방안

### 방안 1: 타입 안전한 데이터 변환 유틸리티 생성

#### 구현
```typescript
// frontend/src/admin/utils/dataTransformers.ts

/**
 * 프로젝트 데이터 변환 유틸리티
 * 모든 데이터 변환 로직을 중앙화하여 타입 안전성 보장
 */

export interface ProjectFormValues {
  title: string;
  description: string;
  readme?: string;
  type: 'BUILD' | 'LAB' | 'MAINTENANCE';
  status: 'completed' | 'in_progress' | 'maintenance';
  isTeam?: boolean;
  teamSize?: number;
  role?: string;
  myContributions?: string | string[];  // Form에서는 둘 다 가능
  startDate?: any;  // Dayjs 객체
  endDate?: any;    // Dayjs 객체
  imageUrl?: string;
  screenshots?: any[];
  githubUrl?: string;
  liveUrl?: string;
  externalUrl?: string;
  technologies?: number[] | string[];  // Form에서는 둘 다 가능
  sortOrder?: number;
}

export interface ProjectCreateRequest {
  title: string;
  description: string;
  readme?: string;
  type: 'BUILD' | 'LAB' | 'MAINTENANCE';
  status: 'completed' | 'in_progress' | 'maintenance';
  isTeam?: boolean;
  teamSize?: number;
  role?: string;
  myContributions?: string[];  // API는 string[]만 허용
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  screenshots?: string[];
  githubUrl?: string;
  liveUrl?: string;
  externalUrl?: string;
  technologies: number[];  // API는 number[]만 허용
  sortOrder?: number;
}

/**
 * myContributions를 string[]로 변환
 */
export function transformMyContributions(
  value: string | string[] | undefined
): string[] | undefined {
  if (!value) return undefined;
  
  if (Array.isArray(value)) {
    // 이미 배열인 경우 필터링만 수행
    const filtered = value.filter((line): line is string => 
      typeof line === 'string' && line.trim().length > 0
    );
    return filtered.length > 0 ? filtered : undefined;
  }
  
  if (typeof value === 'string') {
    // 문자열인 경우 줄바꿈으로 분리
    const split = value.split('\n').filter(line => line.trim().length > 0);
    return split.length > 0 ? split : undefined;
  }
  
  console.warn('[transformMyContributions] Unexpected type:', typeof value, value);
  return undefined;
}

/**
 * technologies를 number[]로 변환
 */
export function transformTechnologies(
  value: number[] | string[] | undefined
): number[] | undefined {
  if (!value) return undefined;
  
  if (!Array.isArray(value)) {
    console.warn('[transformTechnologies] Expected array, got:', typeof value, value);
    return undefined;
  }
  
  // 모든 요소를 number로 변환 시도
  const numbers = value
    .map(item => {
      if (typeof item === 'number') return item;
      if (typeof item === 'string') {
        const parsed = parseInt(item, 10);
        return isNaN(parsed) ? null : parsed;
      }
      return null;
    })
    .filter((id): id is number => id !== null && id > 0);
  
  return numbers.length > 0 ? numbers : undefined;
}

/**
 * screenshots를 string[]로 변환
 */
export function transformScreenshots(
  value: any[] | undefined
): string[] | undefined {
  if (!value || !Array.isArray(value)) return undefined;
  
  const urls = value
    .map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && item.imageUrl) {
        return item.imageUrl;
      }
      return null;
    })
    .filter((url): url is string => url !== null && typeof url === 'string');
  
  return urls.length > 0 ? urls : undefined;
}

/**
 * Form 값을 API 요청 형식으로 변환
 */
export function transformProjectFormToRequest(
  values: ProjectFormValues,
  technologies: number[],
  screenshots: any[]
): ProjectCreateRequest {
  return {
    title: values.title,
    description: values.description,
    readme: values.readme,
    type: values.type,
    status: values.status,
    isTeam: values.isTeam,
    teamSize: values.teamSize,
    role: values.role,
    myContributions: transformMyContributions(values.myContributions),
    startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
    endDate: values.endDate?.format('YYYY-MM-DD') || undefined,
    imageUrl: values.imageUrl,
    screenshots: transformScreenshots(screenshots),
    githubUrl: values.githubUrl,
    liveUrl: values.liveUrl,
    externalUrl: values.externalUrl,
    technologies: transformTechnologies(technologies) || [],
    sortOrder: values.sortOrder,
  };
}
```

### 방안 2: 백엔드 DTO 검증 강화

#### 구현
```java
// backend/src/main/java/com/aiportfolio/backend/infrastructure/web/admin/dto/AdminProjectUpdateRequest.java

@Getter
@Setter
@NoArgsConstructor
public class AdminProjectUpdateRequest {
    
    // ... 기존 필드들 ...
    
    @JsonDeserialize(using = StringListDeserializer.class)
    private List<String> myContributions;
    
    @JsonDeserialize(using = LongListDeserializer.class)
    private List<Long> technologies;
    
    // 커스텀 역직렬화기
    public static class StringListDeserializer extends JsonDeserializer<List<String>> {
        @Override
        public List<String> deserialize(JsonParser p, DeserializationContext ctxt) 
                throws IOException {
            if (p.getCurrentToken() == JsonToken.START_ARRAY) {
                return ctxt.readValue(p, new TypeReference<List<String>>() {});
            } else if (p.getCurrentToken() == JsonToken.VALUE_STRING) {
                // 문자열인 경우 줄바꿈으로 분리
                String value = p.getText();
                return Arrays.stream(value.split("\n"))
                    .filter(s -> !s.trim().isEmpty())
                    .collect(Collectors.toList());
            }
            throw new JsonMappingException("Cannot deserialize List<String> from " + p.getCurrentToken());
        }
    }
    
    public static class LongListDeserializer extends JsonDeserializer<List<Long>> {
        @Override
        public List<Long> deserialize(JsonParser p, DeserializationContext ctxt) 
                throws IOException {
            if (p.getCurrentToken() == JsonToken.START_ARRAY) {
                List<Long> result = new ArrayList<>();
                while (p.nextToken() != JsonToken.END_ARRAY) {
                    if (p.getCurrentToken() == JsonToken.VALUE_NUMBER_INT) {
                        result.add(p.getLongValue());
                    } else if (p.getCurrentToken() == JsonToken.VALUE_STRING) {
                        try {
                            result.add(Long.parseLong(p.getText()));
                        } catch (NumberFormatException e) {
                            throw new JsonMappingException(
                                "Cannot deserialize String '" + p.getText() + "' to Long", e);
                        }
                    } else {
                        throw new JsonMappingException(
                            "Cannot deserialize " + p.getCurrentToken() + " to Long");
                    }
                }
                return result;
            }
            throw new JsonMappingException("Cannot deserialize List<Long> from " + p.getCurrentToken());
        }
    }
}
```

### 방안 3: 타입 안전성 강화 (프론트엔드)

#### 구현
```typescript
// frontend/src/admin/pages/ProjectEdit.tsx

// 타입 안전한 핸들러
const handleTechnologiesChange = (newTechs: number[]) => {
  // 런타임 검증 추가
  const validTechs = Array.isArray(newTechs)
    ? newTechs.filter((id): id is number => 
        typeof id === 'number' && !isNaN(id) && id > 0
      )
    : [];
  
  console.log('[ProjectEdit] Technologies changed:', validTechs);
  setTechnologies(validTechs);
};
```

### 방안 4: 에러 핸들링 개선

#### 구현
```typescript
// frontend/src/admin/utils/errorHandler.ts

export function handleApiError(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다';
}

// 사용 예시
try {
  await updateProjectMutation.mutateAsync({ id: id!, project: updateData });
} catch (error: any) {
  const errorMessage = handleApiError(error);
  console.error('[ProjectEdit] Submit error:', error);
  message.error(errorMessage);
}
```

---

## 📊 개선 효과

### Before (문제 상황)
- ❌ 타입 불일치로 인한 런타임 오류
- ❌ 데이터 변환 로직이 분산되어 유지보수 어려움
- ❌ 에러 메시지가 불명확하여 디버깅 어려움

### After (개선 후)
- ✅ 타입 안전한 데이터 변환
- ✅ 중앙화된 변환 로직으로 일관성 보장
- ✅ 명확한 에러 메시지로 디버깅 용이
- ✅ 런타임 타입 검증으로 안정성 향상

---

## 🎯 권장 사항

### 1. 즉시 적용
- ✅ `transformMyContributions` 함수 적용
- ✅ `transformTechnologies` 함수 적용
- ✅ `handleTechnologiesChange` 타입 수정

### 2. 단기 개선
- 데이터 변환 유틸리티 파일 생성
- 백엔드 커스텀 역직렬화기 추가
- 에러 핸들링 개선

### 3. 장기 개선
- TypeScript strict mode 활성화
- Zod 또는 Yup을 사용한 런타임 스키마 검증
- API 클라이언트 타입 자동 생성 (OpenAPI)

---

## 📝 체크리스트

- [x] 타입 불일치 문제 파악
- [x] 데이터 변환 로직 개선
- [ ] 데이터 변환 유틸리티 파일 생성
- [ ] 백엔드 커스텀 역직렬화기 추가
- [ ] 에러 핸들링 개선
- [ ] 테스트 케이스 작성

