# 부분 벡터화 전략 및 RAG 동작 방식

## 🎯 문제 상황 분석

### 현재 상황
- **PostgreSQL**: 10개 프로젝트 보유
- **벡터화 대상**: 5개 프로젝트만 선별 (데이터 충분)
- **벡터화 제외**: 5개 프로젝트 (데이터 부족, 오래된 프로젝트 등)

### 예상 문제점
```
사용자: "Java 프로젝트 경험이 있나요?"

벡터 검색 결과: Java 프로젝트 2개 발견 (벡터화된 것만)
실제 PostgreSQL: Java 프로젝트 4개 존재

→ 불완전한 답변 위험!
```

## 🔧 해결 방안 1: 컬럼 추가 방식

### A. PostgreSQL 스키마 확장
```sql
-- 벡터화 관리 컬럼 추가
ALTER TABLE projects ADD COLUMN is_vectorized BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN vectorization_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE projects ADD COLUMN vectorization_reason TEXT;
ALTER TABLE projects ADD COLUMN last_vectorized_at TIMESTAMP;

-- 벡터화 상태 값들
-- 'pending': 아직 벡터화 안됨
-- 'completed': 벡터화 완료
-- 'excluded': 의도적으로 제외 (데이터 부족 등)
-- 'failed': 벡터화 실패
-- 'outdated': 벡터 데이터가 오래됨

-- 예시 데이터
UPDATE projects SET 
    is_vectorized = TRUE,
    vectorization_status = 'completed',
    last_vectorized_at = NOW()
WHERE business_id IN ('PJT001', 'PJT002', 'PJT003');

UPDATE projects SET 
    is_vectorized = FALSE,
    vectorization_status = 'excluded',
    vectorization_reason = '데이터 부족으로 벡터화 제외'
WHERE business_id IN ('PJT004', 'PJT005');
```

### B. 하이브리드 RAG 검색 로직
```python
class HybridRAGService:
    async def process_question(self, question: str) -> ChatResponse:
        """벡터화된 데이터 + 비벡터화 데이터 통합 검색"""
        
        # 1. 질문 분석 및 키워드 추출
        keywords = await self.extract_keywords(question)
        question_category = await self.classify_question(question)
        
        # 2. 벡터 검색 (벡터화된 데이터만)
        vector_results = await self.qdrant_service.search(
            query=question,
            filters={"category": question_category},
            limit=5
        )
        
        # 3. PostgreSQL 보완 검색 (비벡터화 데이터 포함)
        postgres_results = await self.postgres_service.search_all_projects(
            keywords=keywords,
            category=question_category,
            include_non_vectorized=True
        )
        
        # 4. 결과 통합 및 우선순위 조정
        combined_results = self.merge_search_results(
            vector_results, 
            postgres_results
        )
        
        # 5. 컨텍스트 구성 및 응답 생성
        context = self.build_hybrid_context(combined_results)
        return await self.generate_response(question, context)
    
    def merge_search_results(self, vector_results, postgres_results):
        """벡터 검색 결과와 PostgreSQL 검색 결과 통합"""
        
        # 벡터화된 프로젝트 ID 추출
        vectorized_ids = {r.metadata.get('project_id') for r in vector_results}
        
        # 비벡터화 데이터 중 관련성 높은 것들 추가
        non_vectorized_relevant = []
        for pg_result in postgres_results:
            if pg_result['business_id'] not in vectorized_ids:
                # 비벡터화 데이터를 간단한 텍스트 매칭으로 평가
                relevance_score = self.calculate_text_relevance(
                    pg_result, 
                    self.current_question
                )
                if relevance_score > 0.3:  # 임계값 이상만 포함
                    non_vectorized_relevant.append({
                        'content': self.format_postgres_content(pg_result),
                        'metadata': pg_result,
                        'score': relevance_score,
                        'source': 'postgres_fallback'
                    })
        
        # 점수 기준으로 통합 정렬
        all_results = list(vector_results) + non_vectorized_relevant
        return sorted(all_results, key=lambda x: x['score'], reverse=True)
```

### C. PostgreSQL 보완 검색 쿼리
```sql
-- 키워드 기반 전체 프로젝트 검색
CREATE OR REPLACE FUNCTION search_all_projects(
    search_keywords TEXT[],
    question_category TEXT DEFAULT NULL
) RETURNS TABLE(
    business_id VARCHAR(20),
    title VARCHAR(255),
    description TEXT,
    technologies TEXT[],
    is_vectorized BOOLEAN,
    vectorization_status VARCHAR(50),
    relevance_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.business_id,
        p.title,
        p.description,
        p.technologies,
        p.is_vectorized,
        p.vectorization_status,
        -- 간단한 텍스트 매칭 점수 계산
        (
            CASE WHEN p.searchable_content ILIKE ANY(
                SELECT '%' || keyword || '%' FROM unnest(search_keywords) AS keyword
            ) THEN 1.0 ELSE 0.0 END +
            CASE WHEN p.technologies && search_keywords THEN 0.8 ELSE 0.0 END +
            CASE WHEN p.is_vectorized THEN 0.2 ELSE 0.0 END  -- 벡터화된 것에 보너스
        ) AS relevance_score
    FROM projects p
    WHERE 
        (question_category IS NULL OR p.type = question_category)
        AND p.status IN ('completed', 'in-progress')
    ORDER BY relevance_score DESC, p.priority_score DESC;
END;
$$ LANGUAGE plpgsql;
```

## 🔧 해결 방안 2: 메타데이터 기반 관리

### A. Qdrant 메타데이터 확장
```python
# 벡터 데이터에 완전성 정보 포함
vector_document = {
    "id": "project_PJT001",
    "vector": [0.1, 0.2, ...],
    "payload": {
        "project_id": "PJT001",
        "content": "프로젝트 상세 내용...",
        "metadata": {
            "vectorization_coverage": "complete",  # complete, partial, summary_only
            "data_quality": "high",  # high, medium, low
            "last_updated": "2024-12-31T00:00:00Z",
            "related_non_vectorized": ["PJT004", "PJT005"]  # 관련된 비벡터화 프로젝트
        }
    }
}
```

### B. 지능형 검색 보완 로직
```python
class IntelligentRAGService:
    async def enhanced_search(self, question: str):
        """지능형 검색 - 벡터 + 비벡터 데이터 통합"""
        
        # 1. 벡터 검색
        vector_results = await self.qdrant_service.search(question)
        
        # 2. 벡터 결과에서 관련 비벡터화 프로젝트 식별
        related_non_vectorized = set()
        for result in vector_results:
            related_ids = result.payload.get('metadata', {}).get('related_non_vectorized', [])
            related_non_vectorized.update(related_ids)
        
        # 3. 관련 비벡터화 프로젝트 정보 조회
        if related_non_vectorized:
            non_vectorized_data = await self.postgres_service.get_projects_by_ids(
                list(related_non_vectorized)
            )
            
            # 4. 통합 컨텍스트 구성
            return self.build_comprehensive_context(
                vector_results, 
                non_vectorized_data
            )
        
        return vector_results
```

## 🔧 해결 방안 3: 최소 벡터화 전략

### A. 모든 프로젝트 최소 벡터화
```python
class MinimalVectorization:
    async def create_minimal_vectors(self, insufficient_data_projects):
        """데이터 부족 프로젝트도 최소한의 벡터 생성"""
        
        for project in insufficient_data_projects:
            # 기본 정보만으로 간단한 벡터 생성
            minimal_content = self.create_minimal_content(project)
            
            vector_doc = {
                "id": f"project_{project['business_id']}_minimal",
                "vector": await self.embedding_service.encode(minimal_content),
                "payload": {
                    "project_id": project['business_id'],
                    "content": minimal_content,
                    "vectorization_type": "minimal",  # minimal, standard, detailed
                    "data_completeness": "low",
                    "requires_postgres_supplement": True
                }
            }
            
            await self.qdrant_service.upsert(vector_doc)
    
    def create_minimal_content(self, project):
        """최소한의 콘텐츠 생성"""
        return f"""
        프로젝트명: {project['title']}
        기술스택: {', '.join(project['technologies'])}
        프로젝트 유형: {project['type']}
        상태: {project['status']}
        간단 설명: {project['description'][:200]}...
        
        주의: 이 프로젝트는 상세 정보가 제한적입니다.
        """
```

### B. 계층적 검색 전략
```python
class LayeredSearchStrategy:
    async def layered_search(self, question: str):
        """계층적 검색 - 상세 → 기본 → 보완 순서"""
        
        results = []
        
        # Layer 1: 상세 벡터화된 프로젝트 검색
        detailed_results = await self.qdrant_service.search(
            query=question,
            filters={"vectorization_type": "detailed"},
            limit=3
        )
        results.extend(detailed_results)
        
        # Layer 2: 기본 벡터화된 프로젝트 검색 (부족한 경우)
        if len(results) < 5:
            standard_results = await self.qdrant_service.search(
                query=question,
                filters={"vectorization_type": "standard"},
                limit=5 - len(results)
            )
            results.extend(standard_results)
        
        # Layer 3: 최소 벡터화된 프로젝트 검색 (여전히 부족한 경우)
        if len(results) < 5:
            minimal_results = await self.qdrant_service.search(
                query=question,
                filters={"vectorization_type": "minimal"},
                limit=5 - len(results)
            )
            results.extend(minimal_results)
        
        # Layer 4: PostgreSQL 직접 검색 (최후 수단)
        if len(results) < 3:
            postgres_supplement = await self.postgres_service.fallback_search(question)
            results.extend(postgres_supplement)
        
        return results
```

## 🎯 권장 솔루션: 하이브리드 접근법

### 1. PostgreSQL 스키마 확장
```sql
-- 벡터화 관리 컬럼 추가
ALTER TABLE projects ADD COLUMN is_vectorized BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN vectorization_quality VARCHAR(20) DEFAULT 'none';
-- 'none', 'minimal', 'standard', 'detailed'

ALTER TABLE projects ADD COLUMN rag_priority INTEGER DEFAULT 5;
-- 1-10, RAG 검색 시 우선순위

ALTER TABLE projects ADD COLUMN fallback_summary TEXT;
-- 벡터화되지 않은 프로젝트용 요약 (RAG 대체 텍스트)
```

### 2. 지능형 RAG 서비스
```python
class SmartRAGService:
    async def intelligent_search(self, question: str):
        """지능형 검색 - 벡터 + 비벡터 데이터 최적 조합"""
        
        # 1. 벡터 검색 (우선)
        vector_results = await self.vector_search(question)
        
        # 2. 결과 충분성 평가
        coverage_score = self.evaluate_coverage(vector_results, question)
        
        if coverage_score < 0.7:  # 70% 미만이면 보완 필요
            # 3. PostgreSQL 보완 검색
            postgres_supplement = await self.postgres_supplement_search(
                question, 
                exclude_vectorized=True
            )
            
            # 4. 결과 통합
            final_results = self.merge_and_rank(vector_results, postgres_supplement)
        else:
            final_results = vector_results
        
        # 5. 컨텍스트 구성 시 데이터 출처 명시
        return self.build_transparent_context(final_results)
    
    def build_transparent_context(self, results):
        """데이터 출처를 명시한 투명한 컨텍스트"""
        
        context_parts = []
        
        # 벡터화된 상세 정보
        vectorized_projects = [r for r in results if r.get('source') == 'vector']
        if vectorized_projects:
            context_parts.append("상세 프로젝트 정보:")
            for project in vectorized_projects:
                context_parts.append(f"- {project['content']}")
        
        # 기본 정보만 있는 프로젝트
        basic_projects = [r for r in results if r.get('source') == 'postgres']
        if basic_projects:
            context_parts.append("\n추가 관련 프로젝트 (기본 정보):")
            for project in basic_projects:
                context_parts.append(f"- {project['fallback_summary']}")
        
        return "\n".join(context_parts)
```

### 3. 사용자 경험 개선
```python
class TransparentRAGResponse:
    def generate_response_with_transparency(self, question, context, results):
        """투명성을 높인 응답 생성"""
        
        # 데이터 완전성 정보 포함
        vectorized_count = len([r for r in results if r.get('source') == 'vector'])
        total_relevant = len(results)
        
        response_suffix = ""
        if vectorized_count < total_relevant:
            response_suffix = f"\n\n💡 참고: 총 {total_relevant}개 관련 프로젝트 중 {vectorized_count}개는 상세 정보로, 나머지는 기본 정보로 답변드렸습니다."
        
        main_response = await self.llm_service.generate(question, context)
        
        return main_response + response_suffix
```

## 🎯 최종 권장사항

### 1. **단계적 구현**
1. PostgreSQL에 벡터화 관리 컬럼 추가
2. 하이브리드 검색 로직 구현
3. 투명한 응답 시스템 구축

### 2. **데이터 품질 관리**
- 벡터화 우선순위 설정 (`rag_priority`)
- 비벡터화 프로젝트용 요약 작성 (`fallback_summary`)
- 점진적 벡터화 계획 수립

### 3. **사용자 경험**
- 데이터 출처 투명성 제공
- 완전성 정보 표시
- 지속적인 개선 피드백 수집

이렇게 하면 **일부 프로젝트만 벡터화된 상황에서도 완전하고 정확한 RAG 응답**을 제공할 수 있습니다!