# RAG 시스템 벡터화 전략 및 주요 기술적 의사결정

> **연관 세션**: [Session 11: RAG 시스템 한국어 최적화 및 BM25 마이그레이션](../conversation_log.md#session-11-rag-시스템-한국어-최적화-및-bm25-마이그레이션-2025-08-31)  
> **작성일**: 2025-08-31  
> **상태**: 진행 중

## 개요

RAG 시스템의 벡터화 과정에서 검색 품질과 LLM 성능에 큰 임팩트를 미치는 핵심 기술적 의사결정들을 정리한다. 각 결정은 벡터 서치 → 리트리버 → LLM 전달까지의 전체 파이프라인에서 파급효과를 고려하여 우선순위를 매겼다.

---

## 🎯 고임팩트 결정 사항들

### 1. 하이브리드 검색 아키텍처 도입
**임팩트**: 검색 정확도 30-50% 향상 예상  
**상태**: 결정 완료 (Gemini Embedding 채택)  
**우선순위**: HIGH

#### 현재 상황
- BM25 기반 키워드 검색만 지원
- 의미적 유사성 검색 부족으로 유사 질문 처리 한계

#### 최종 결정: Gemini Embedding 채택
**선택된 모델**: `gemini-embedding-001`

**결정 근거**:
- ✅ **완전 무료**: Google AI Studio 사용 시 무료 (1,000 RPD, 30,000 TPM)
- ✅ **다국어 지원**: MTEB 다국어 리더보드 상위 성능
- ✅ **기존 인프라 활용**: 이미 Gemini API 사용 중으로 통합 용이
- ✅ **배치 처리**: 한 번에 250개 텍스트 처리 가능

#### 구현 아키텍처
```python
# BM25 + Gemini Embedding 하이브리드 검색
async def hybrid_search(query: str, top_k: int = 5):
    # 1. BM25 검색 (키워드 정확성)
    bm25_results = await self.bm25_search(query, top_k * 2)
    
    # 2. Gemini Embedding 검색 (의미적 유사성)
    embedding_results = await self.gemini_embedding_search(query, top_k * 2)
    
    # 3. 가중치 결합 (0.7 BM25 + 0.3 Embedding)
    hybrid_score = 0.7 * bm25_score + 0.3 * embedding_similarity
    
    return combined_results[:top_k]
```

#### 예상 사용량 분석
```python
# 일일 예상 사용량
daily_queries = 100               # 예상 일일 질문 수
daily_embedding_calls = 100       # 쿼리당 1회 임베딩 호출
daily_tokens = 100 * 50 = 5,000   # 평균 질문 50토큰

# 무료 한도 대비
# RPD: 100 << 1,000 (10% 사용) ✅
# TPM: 5,000 << 30,000 (17% 사용) ✅
```

---

### 2. 메타데이터 설계 전략
**임팩트**: 도메인별 필터링으로 정밀도 향상  
**상태**: 기본 구조만 적용  
**우선순위**: HIGH

#### 현재 메타데이터 구조
```python
{
    "document_id": "qa_architecture",
    "chunk_index": 1
}
```

#### 단순화된 실용적 구조 (최종)
```python
{
    "document_id": "qa_architecture",
    "document_type": "qa",              # QA vs Project vs Overview 구분
    "project_id": "ai-portfolio",       # 프로젝트별 필터링
    "valid_from_date": "2025-08-31",    # 시간 기반 우선순위
    "section": "architecture",          # 도메인 분류 (architecture, deployment, etc.)
    "chunk_index": 1                    # 문서 내 위치
}
```

#### 구현 방안

**시간 기반 우선순위**:
```python
# 메타데이터 기반 신선도 부스팅 (추가 비용 없음)
def calculate_freshness_boost(valid_from_date: str) -> float:
    days_ago = (datetime.now() - datetime.fromisoformat(valid_from_date)).days
    if days_ago <= 30:   return 1.2    # 최근 1개월: 20% 부스트
    elif days_ago <= 90: return 1.1    # 최근 3개월: 10% 부스트
    else:                return 1.0    # 기본값
    
# 하이브리드 검색에 적용
final_score = (0.7 * bm25_score + 0.3 * embedding_score) * freshness_boost
```

**프로젝트별 필터링 확장성**:
```python
# 프로젝트 설정 관리
project_config = {
    "ai-portfolio": {"priority": 1, "active": True},
    "future-project-2": {"priority": 2, "active": True},
    "archived-project": {"priority": 3, "active": False}
}

# 동적 필터링
def get_project_filter(query_context: str) -> List[str]:
    if "AI포트폴리오" in query_context:
        return ["ai-portfolio"]  # 특정 프로젝트만
    else:
        return [pid for pid, config in project_config.items() 
                if config["active"]]  # 활성 프로젝트들
```

#### 활용 시나리오
- **도메인 필터링**: "아키텍처 관련 질문만"
- **시간 우선순위**: 최신 정보 자동 부스팅
- **프로젝트 분리**: 다중 프로젝트 지원 준비

---

### 3. 임베딩 모델 선택 전략
**임팩트**: 의미적 검색 품질 결정  
**상태**: ✅ 결정 완료 (Gemini Embedding)  
**우선순위**: HIGH

#### 최종 선택: Google Gemini Embedding
**모델명**: `gemini-embedding-001`

#### API 모델 비교 결과
| 모델 | 가격 | 무료 한도 | 한국어 지원 | 통합 용이성 |
|------|------|-----------|------------|-------------|
| **Gemini Embedding** ✅ | **무료** | **1,000 RPD** | **✅ 우수** | **✅ 기존 API 활용** |
| OpenAI text-embedding-3-small | $0.00002/1K tokens | ❌ 없음 | ✅ 보통 | ❌ 별도 API 키 |
| OpenAI text-embedding-3-large | 더 비쌈 | ❌ 없음 | ✅ 우수 | ❌ 별도 API 키 |

#### 선택 근거
1. **비용 효율성**: 완전 무료로 프로토타입부터 운영까지 가능
2. **기술적 통합**: 기존 Gemini API 인프라 재활용
3. **성능**: MTEB 다국어 벤치마크 상위권 성능
4. **확장성**: 무료 한도 충분 (일일 예상 사용량의 10배)

---

### 4. 검색 결과 리랭킹 파이프라인
**임팩트**: 최종 사용자 만족도 결정  
**상태**: 미적용  
**우선순위**: MEDIUM

#### 단계별 구현 전략

**Phase 1: 휴리스틱 기반 (즉시 적용 가능)**
```python
def heuristic_reranking(results: List[SearchResult], query: str) -> List[SearchResult]:
    for result in results:
        base_score = result.relevance_score
        
        # 1. 문서 타입 가중치 (QA > Project > Overview)
        type_weights = {"qa": 1.2, "project": 1.1, "overview": 1.0}
        type_boost = type_weights.get(result.document_type, 1.0)
        
        # 2. 청크 위치 부스팅 (앞쪽 선호)
        position_boost = 1.1 if result.chunk_index <= 2 else 1.0
        
        # 3. 키워드 매칭 보너스
        keyword_boost = 1.15 if has_exact_keyword_match(result, query) else 1.0
        
        # 4. 시간 기반 부스팅 (이미 메타데이터에 구현됨)
        freshness_boost = calculate_freshness_boost(result.valid_from_date)
        
        result.final_score = base_score * type_boost * position_boost * keyword_boost * freshness_boost
        
    return sorted(results, key=lambda x: x.final_score, reverse=True)
```

**Phase 2: 암시적 피드백 (중장기)**
```python
implicit_signals = {
    "session_engagement": "대화 지속 시간",
    "follow_up_questions": "추가 질문 여부",  
    "response_completion": "답변을 끝까지 읽었는지",
    "query_reformulation": "질문 재작성 패턴"
}
```

**Phase 3: 명시적 피드백 (장기)**
```python
# 최소한의 UX 피드백 시스템
feedback_ui = {
    "👍": +1,   # 도움이 됨
    "👎": -1,   # 도움이 안됨
    "🤔": 0     # 애매함
}
```

#### 구현 우선순위
| 단계 | 사용자 피드백 의존성 | 구현 난이도 | 예상 효과 |
|------|-------------------|------------|----------|
| Phase 1 | ❌ 불필요 | ✅ 낮음 | 10-15% 향상 |
| Phase 2 | 🟡 부분 의존 | 🟡 중간 | 15-25% 향상 |
| Phase 3 | ✅ 완전 의존 | 🔴 높음 | 25-40% 향상 |

---

### 5. 캐싱 전략
**임팩트**: 응답 속도 및 비용 최적화  
**상태**: 부분 적용 (Redis 캐시 존재)  
**우선순위**: MEDIUM

#### 병목 지점 분석
```python
# RAG 파이프라인 응답시간 분석
pipeline_bottlenecks = {
    "쿼리 분석": "~10ms",           # ✅ 빠름
    "BM25 검색": "~50ms",          # ✅ 빠름 (메모리 기반)
    "임베딩 API 호출": "~200-500ms", # 🔴 주요 병목 1
    "벡터 유사도": "~30ms",         # ✅ 적당함
    "리랭킹": "~20ms",            # ✅ 빠름
    "컨텍스트 구성": "~10ms",       # ✅ 빠름
    "Gemini LLM API": "~300-800ms" # 🔴 주요 병목 2
}
```

#### 효과적인 캐싱 전략 (우선순위별)

**1순위: 임베딩 캐시 (API 비용 절약)**
```python
embedding_cache = {
    "key": "emb:sha256(query_text)",
    "value": "compressed_vector_array",
    "ttl": 86400 * 7,  # 1주일 (임베딩 불변)
    "compression": "gzip",  # 벡터 압축
    "expected_hit_rate": "60-70%",  # 유사 질문 많음
    "cost_saving": "200-500ms + API 비용"
}
```

**2순위: 완성 답변 캐시 (전체 파이프라인 스킵)**  
```python
answer_cache = {
    "key": "ans:sha256(query + context_signature)",
    "value": "complete_llm_response",
    "ttl": 3600,  # 1시간 (상황별 답변 변화 고려)
    "expected_hit_rate": "30-40%",  # 자주 묻는 질문들
    "time_saving": "~1000ms (전체 파이프라인)"
}
```

**3순위: 검색 결과 캐시 (중간 단계 최적화)**
```python
search_cache = {
    "key": "search:sha256(query + filters)",
    "value": "ranked_search_results",
    "ttl": 7200,  # 2시간
    "fuzzy_matching": True,  # 유사 쿼리 캐시 공유
    "time_saving": "~100-200ms"
}
```

#### 캐시 무효화 전략
```python
cache_invalidation = {
    "문서 업데이트": [
        "search_cache.clear()",     # 검색 결과 무효화
        "bm25_index.rebuild()",     # BM25 인덱스 재구축
        "answer_cache.selective_clear(doc_id)"  # 관련 답변만 무효화
    ],
    "임베딩 모델 변경": [
        "embedding_cache.clear()",  # 모든 임베딩 무효화
        "search_cache.clear()"      # 검색 결과도 무효화
    ]
}
```

#### 구현 우선순위
| 캐시 타입 | 구현 난이도 | 예상 성능 향상 | 비용 절약 |
|----------|------------|--------------|-----------|
| 임베딩 캐시 | ✅ 쉬움 | 200-500ms | 🔴 높음 (API 절약) |
| 답변 캐시 | 🟡 보통 | 1000ms | 🔴 높음 (전체 스킵) |
| 검색 캐시 | 🟡 보통 | 100-200ms | 🟡 보통 |

---

### 6. 문서 업데이트 전략
**임팩트**: 정보 일관성 및 성능  
**상태**: 수동 관리  
**우선순위**: LOW (현재 정적 문서)

#### 업데이트 전략 비교
| 전략 | 장점 | 단점 | 적용 시점 |
|------|------|------|-----------|
| Full Rebuild | 완전한 일관성 | 시간/비용 많이 소요 | 대규모 변경 |
| Incremental | 빠른 업데이트 | 인덱스 일관성 위험 | 소규모 변경 |
| Hybrid | 변경 범위별 최적화 | 복잡한 로직 | 운영 환경 |

---

## 🚀 구현 로드맵

### Phase 1: 기반 강화 (완료)
- [x] BM25 + 한국어 토큰화 완료
- [x] 임베딩 모델 결정 (Gemini Embedding)
- [ ] 메타데이터 구조 확장
- [ ] 문서 타입별 청킹 전략 적용

### Phase 2: 하이브리드 검색 (Session 12 목표)
- [ ] Gemini Embedding API 통합
- [ ] BM25 + Embedding 결합 로직 구현
- [ ] 가중치 튜닝 (0.7 BM25 + 0.3 Embedding)
- [ ] 임베딩 캐시 시스템 구현 (Redis 기반)
- [ ] 성능 벤치마킹 및 A/B 테스트

### Phase 3: 고도화 (향후)
- [ ] 리랭킹 파이프라인 구축
- [ ] 사용자 피드백 학습 시스템
- [ ] A/B 테스트 프레임워크

---

## 📊 성공 지표

### 정량적 지표
- **검색 정확도**: Precision@5, Recall@10
- **응답 속도**: 평균 검색 시간 < 200ms
- **사용자 만족도**: 답변 품질 점수 > 4.0/5.0

### 정성적 지표
- **기술 용어 정확성**: 포트폴리오 도메인 키워드 매칭
- **맥락 이해도**: 복합 질문에 대한 종합적 답변
- **한국어 자연성**: 자연스러운 한국어 응답

---

## 다음 논의 주제

각 고임팩트 결정사항을 하나씩 구체적으로 논의하여 구현 계획을 수립한다:

1. **하이브리드 검색 아키텍처** - 임베딩 모델 선택 및 가중치 전략
2. **메타데이터 설계** - knowledge-base 문서 분석 및 메타데이터 추출 자동화
3. **리랭킹 파이프라인** - 사용자 질문 패턴 분석 및 가중치 최적화