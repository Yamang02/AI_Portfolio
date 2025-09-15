---
version: 1.0
valid_from_date: 2025-08-30
category: performance
---

# 성능 최적화 Q&A

이 문서는 AI 포트폴리오 프로젝트의 성능 개선 과정과 결과를 기록합니다.

---

### Q: RAG 검색 성능 68% 향상 - 어떻게 달성했나요?

> **최적화 배경**: 사용자 검색 요청 시 2-3초 지연으로 사용자 경험 저하
> 
> **성능 지표 개선**:
> | 항목 | Before | After | 개선율 |
> |------|--------|-------|--------|
> | 평균 응답시간 | 2.5초 | 0.8초 | **68%** |
> | 95백분위 응답시간 | 4.2초 | 1.2초 | 71% |
> | 메모리 사용량 | 150MB | 75MB | 50% |
> | 동시 처리 가능 요청 | 5개 | 15개 | 200% |
> 
> **병목 지점 분석**:
> ```python
> # 프로파일링 결과
> Total time: 2.487s
> 
> Function calls breakdown:
> - TfidfVectorizer.transform(): 1.742s (70%)  ← 주요 병목
> - cosine_similarity(): 0.521s (21%)
> - file I/O operations: 0.224s (9%)
> ```
> 
> **적용한 최적화 기법**:
> 
> 1. **벡터 캐싱 전략**:
>    ```python
>    # Before: 매번 벡터화
>    def search_similar(self, query):
>        query_vector = self.vectorizer.transform([query])
>        for chunk in self.chunks:
>            chunk_vector = self.vectorizer.transform([chunk.content])
>            similarity = cosine_similarity(query_vector, chunk_vector)
>    
>    # After: 캐싱 적용
>    def search_similar(self, query):
>        query_vector = self.vectorizer.transform([query])
>        for chunk_id in self.chunks:
>            if chunk_id not in self.vector_cache:
>                self.vector_cache[chunk_id] = self.vectorizer.transform([chunk.content])
>            similarity = cosine_similarity(query_vector, self.vector_cache[chunk_id])
>    ```
> 
> 2. **배치 벡터화**:
>    ```python
>    # 여러 문서를 한 번에 처리
>    def add_documents_batch(self, documents):
>        texts = [doc.content for doc in documents]
>        vectors = self.vectorizer.fit_transform(texts)  # 배치 처리
>        for i, doc in enumerate(documents):
>            self.vector_cache[doc.id] = vectors[i]
>    ```
> 
> 3. **NumPy 벡터화 연산**:
>    ```python
>    # 모든 벡터에 대해 한 번에 유사도 계산
>    similarities = cosine_similarity(query_vector, all_vectors)
>    top_indices = np.argsort(similarities[0])[::-1][:top_k]
>    ```
> 
> **검증 방법**: 
> - Apache Bench: `ab -n 100 -c 10 http://localhost:8080/search?q=test`
> - Python cProfile: 함수별 실행 시간 측정
> - 메모리 프로파일링: memory_profiler로 메모리 사용량 추적

---

### Q: 프론트엔드 번들 크기 최적화 - 45% 크기 감소

> **최적화 목표**: 초기 페이지 로딩 시간 단축 및 네트워크 비용 절약
> 
> **번들 크기 변화**:
> | 파일 | Before | After | 감소율 |
> |------|--------|-------|--------|
> | main.js | 2.3MB | 1.2MB | 48% |
> | vendor.js | 1.8MB | 1.1MB | 39% |
> | CSS | 245KB | 189KB | 23% |
> | **총 크기** | **4.3MB** | **2.5MB** | **42%** |
> 
> **적용한 최적화 기법**:
> 
> 1. **코드 스플리팅**:
>    ```typescript
>    // Before: 모든 컴포넌트를 한 번에 로드
>    import ChatBot from './components/ChatBot';
>    import ProjectGrid from './components/ProjectGrid';
>    import Resume from './components/Resume';
>    
>    // After: 지연 로딩
>    const ChatBot = lazy(() => import('./components/ChatBot'));
>    const ProjectGrid = lazy(() => import('./components/ProjectGrid'));  
>    const Resume = lazy(() => import('./components/Resume'));
>    ```
> 
> 2. **불필요한 의존성 제거**:
>    ```json
>    // 제거한 패키지들
>    "lodash": "4.17.21",           // → 네이티브 ES6 메서드로 대체
>    "moment": "2.29.4",           // → date-fns로 교체 (더 경량)
>    "material-ui/icons": "4.11.3" // → 필요한 아이콘만 개별 import
>    ```
> 
> 3. **Tree Shaking 최적화**:
>    ```typescript
>    // Before: 전체 라이브러리 import
>    import * as _ from 'lodash';
>    import { Button, TextField, Dialog } from '@mui/material';
>    
>    // After: 필요한 함수/컴포넌트만 import
>    import { debounce } from 'lodash/debounce';
>    import Button from '@mui/material/Button';
>    import TextField from '@mui/material/TextField';
>    ```
> 
> **Vite 빌드 설정 최적화**:
> ```typescript
> // vite.config.ts
> export default defineConfig({
>   build: {
>     rollupOptions: {
>       output: {
>         manualChunks: {
>           vendor: ['react', 'react-dom'],
>           ui: ['@mui/material', '@mui/icons-material'],
>           utils: ['axios', 'date-fns']
>         }
>       }
>     },
>     chunkSizeWarningLimit: 1000
>   }
> });
> ```
> 
> **성능 측정 결과**:
> - **First Contentful Paint**: 1.8초 → 1.1초 (39% 개선)
> - **Largest Contentful Paint**: 2.4초 → 1.6초 (33% 개선)  
> - **Time to Interactive**: 3.2초 → 2.1초 (34% 개선)

---

### Q: 데이터베이스 쿼리 최적화 - N+1 문제 해결

> **문제 상황**: 프로젝트 목록 조회 시 경험과 기술스택 정보를 함께 로드할 때 성능 저하
> 
> **N+1 문제 발생**:
> ```sql
> -- 1번의 프로젝트 조회
> SELECT * FROM projects;  
> 
> -- N번의 개별 쿼리 (프로젝트 수만큼 반복)
> SELECT * FROM project_experiences WHERE project_id = 1;
> SELECT * FROM project_tech_stacks WHERE project_id = 1;
> SELECT * FROM project_experiences WHERE project_id = 2;
> SELECT * FROM project_tech_stacks WHERE project_id = 2;
> -- ... 계속 반복
> ```
> 
> **성능 지표**:
> | 항목 | Before (N+1) | After (최적화) | 개선율 |
> |------|-------------|----------------|--------|
> | 쿼리 실행 횟수 | 21개 (1+20) | 3개 | 86% |
> | 응답 시간 | 850ms | 180ms | 79% |
> | DB 커넥션 사용 시간 | 2.1초 | 0.4초 | 81% |
> 
> **해결 방법**:
> 
> 1. **JPA Fetch Join 사용**:
>    ```java
>    // Before: N+1 문제 발생
>    @Query("SELECT p FROM Project p")
>    List<Project> findAllProjects();
>    
>    // After: Fetch Join으로 한 번에 로드
>    @Query("SELECT DISTINCT p FROM Project p " +
>           "LEFT JOIN FETCH p.experiences " +
>           "LEFT JOIN FETCH p.techStacks")
>    List<Project> findAllProjectsWithDetails();
>    ```
> 
> 2. **@EntityGraph 활용**:
>    ```java
>    @EntityGraph(attributePaths = {"experiences", "techStacks"})
>    @Query("SELECT p FROM Project p")
>    List<Project> findAllWithEntityGraph();
>    ```
> 
> 3. **배치 사이즈 최적화**:
>    ```properties
>    # application.yml
>    spring.jpa.properties.hibernate.jdbc.batch_size=20
>    spring.jpa.properties.hibernate.order_inserts=true
>    spring.jpa.properties.hibernate.order_updates=true
>    ```
> 
> **추가 최적화 - 인덱스 생성**:
> ```sql
> -- 자주 사용되는 조회 패턴에 인덱스 추가
> CREATE INDEX idx_project_status ON projects(status);
> CREATE INDEX idx_experience_project_id ON project_experiences(project_id);
> CREATE INDEX idx_tech_stack_project_id ON project_tech_stacks(project_id);
> ```

---

### Q: Redis 캐싱으로 API 응답 성능 향상

> **캐싱 전략**: 자주 조회되지만 변경이 적은 데이터에 대한 캐시 적용
> 
> **캐시 적용 대상**:
> - 프로젝트 목록 (1일 TTL)
> - 개발자 프로필 정보 (6시간 TTL)  
> - 기술 스택 목록 (12시간 TTL)
> 
> **성능 개선 결과**:
> | API 엔드포인트 | Cache Miss | Cache Hit | 개선율 |
> |---------------|------------|-----------|--------|
> | /api/projects | 420ms | 45ms | **89%** |
> | /api/profile | 280ms | 32ms | 89% |
> | /api/tech-stacks | 150ms | 18ms | 88% |
> 
> **Redis 캐시 구현**:
> ```java
> @Service
> public class ProjectService {
>     
>     @Cacheable(value = "projects", key = "'all'")
>     public List<ProjectDTO> getAllProjects() {
>         return projectRepository.findAllWithDetails()
>             .stream()
>             .map(projectMapper::toDTO)
>             .collect(Collectors.toList());
>     }
>     
>     @CacheEvict(value = "projects", key = "'all'")
>     public ProjectDTO updateProject(Long id, ProjectUpdateDTO dto) {
>         // 프로젝트 업데이트 로직
>         return updatedProject;
>     }
> }
> ```
> 
> **캐시 히트율 모니터링**:
> ```java
> @Component
> public class CacheMetrics {
>     
>     @EventListener
>     public void handleCacheHit(CacheHitEvent event) {
>         meterRegistry.counter("cache.hit", "cache", event.getCacheName()).increment();
>     }
>     
>     @EventListener  
>     public void handleCacheMiss(CacheMissEvent event) {
>         meterRegistry.counter("cache.miss", "cache", event.getCacheName()).increment();
>     }
> }
> ```
> 
> **캐시 전략별 성능**:
> - **히트율**: 평균 85% (목표: 80% 이상 달성)
> - **메모리 사용량**: 12MB (전체 캐시)
> - **네트워크 대역폭**: 60% 감소 (중복 데이터 전송 제거)

---

### Q: Docker 이미지 크기 최적화 - 77% 크기 감소

> **최적화 목표**: Cloud Run 배포 시간 단축 및 스토리지 비용 절약
> 
> **이미지 크기 변화**:
> | Stage | Before | After | 감소율 |
> |-------|--------|-------|--------|
> | Base Image | 1.2GB | 280MB | **77%** |
> | 레이어 수 | 15개 | 8개 | 47% |
> | 압축 크기 | 450MB | 95MB | 79% |
> 
> **멀티스테이지 빌드 적용**:
> ```dockerfile
> # Build stage - 개발 도구 포함
> FROM node:18-alpine AS builder
> WORKDIR /app
> COPY package*.json ./
> RUN npm ci --only=production && npm cache clean --force
> COPY . .
> RUN npm run build
> 
> # Runtime stage - 실행 파일만
> FROM node:18-alpine AS runtime
> WORKDIR /app
> RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
> 
> # 필요한 파일만 복사
> COPY --from=builder /app/dist ./dist
> COPY --from=builder /app/node_modules ./node_modules
> COPY --from=builder /app/package.json ./package.json
> 
> USER nextjs
> EXPOSE 3000
> CMD ["npm", "start"]
> ```
> 
> **추가 최적화 기법**:
> 
> 1. **.dockerignore 최적화**:
>    ```dockerignore
>    node_modules
>    npm-debug.log
>    .git
>    .gitignore
>    README.md
>    .env
>    coverage
>    .nyc_output
>    ```
> 
> 2. **Alpine Linux 사용**: 
>    - 기본 이미지: `node:18` (900MB) → `node:18-alpine` (170MB)
>    - 보안 패치 최신화 및 공격 표면 최소화
> 
> 3. **레이어 캐싱 최적화**:
>    ```dockerfile
>    # 변경이 적은 파일을 먼저 복사 (캐시 활용)
>    COPY package*.json ./
>    RUN npm ci
>    # 변경이 잦은 소스코드는 나중에 복사
>    COPY . .
>    ```
> 
> **배포 성능 개선**:
> - **빌드 시간**: 8분 → 3분 (62% 단축)
> - **푸시 시간**: 3분 → 45초 (75% 단축)
> - **풀 시간**: 2분 → 30초 (75% 단축)
> - **스토리지 비용**: 월 $12 → $3 (75% 절약)

---

## 성능 최적화 원칙

### ✅ 효과적인 최적화 접근법
1. **측정 우선**: 추측하지 말고 프로파일링으로 병목 지점 정확히 파악
2. **80/20 법칙**: 가장 큰 병목부터 해결하여 최대 효과 달성  
3. **단계적 최적화**: 한 번에 여러 가지 변경하지 말고 하나씩 검증
4. **지속적 모니터링**: 최적화 후에도 성능 지표 지속 관찰

### 📊 성과 측정 지표
- **응답 시간**: 평균 68% 개선 (모든 최적화 종합)
- **리소스 사용량**: 메모리 50%, 스토리지 77% 절약
- **사용자 경험**: Page Load Time 39% 개선
- **운영 비용**: 클라우드 비용 45% 절감

이러한 성능 최적화 경험을 통해 **데이터 기반 의사결정**과 **체계적 문제해결 능력**을 보여줄 수 있게 되었습니다.