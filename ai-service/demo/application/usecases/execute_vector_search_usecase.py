"""
Execute Vector Search Use Case
Vector Search 실행 유스케이스

벡터 유사도 검색을 수행하여 관련 문서 청크를 찾는 Use Case입니다.
"""

import logging
from typing import Dict, Any, List
from domain.services.retrieval_service import RetrievalService
from domain.entities.query import Query

logger = logging.getLogger(__name__)


class ExecuteVectorSearchUseCase:
    """Vector Search 실행 유스케이스"""
    
    def __init__(
        self,
        retrieval_service: RetrievalService
    ):
        self.retrieval_service = retrieval_service
        logger.info("✅ ExecuteVectorSearchUseCase initialized")
    
    def execute(
        self,
        search_query: str,
        top_k: int = 5,
        similarity_threshold: float = 0.05
    ) -> Dict[str, Any]:
        """Vector Search 실행"""
        try:
            if not search_query.strip():
                return {
                    "success": False,
                    "error": "검색 쿼리를 입력해주세요",
                    "results": ""
                }
            
            # Query 엔티티 생성
            query = Query(
                text=search_query,
                query_type="SEARCH",
                max_results=top_k,
                similarity_threshold=similarity_threshold
            )
            
            # 벡터 검색 수행
            search_results = self.retrieval_service.search_similar_chunks(
                query=query,
                top_k=top_k,
                similarity_threshold=similarity_threshold
            )
            
            if not search_results:
                return {
                    "success": True,
                    "results": self._format_no_results(search_query, top_k, similarity_threshold),
                    "query_id": str(query.query_id),
                    "total_results": 0,
                    "above_threshold_results": 0
                }
            
            # 임계값 이상 결과 필터링
            above_threshold_results = [
                result for result in search_results 
                if result.similarity_score >= similarity_threshold
            ]
            
            # 결과 포맷팅
            formatted_results = self._format_search_results(
                search_results[:top_k], 
                search_query, 
                top_k, 
                similarity_threshold
            )
            
            return {
                "success": True,
                "results": formatted_results,
                "query_id": str(query.query_id),
                "total_results": len(search_results),
                "above_threshold_results": len(above_threshold_results),
                "returned_results": min(len(search_results), top_k)
            }
            
        except Exception as e:
            logger.error(f"Vector Search 실행 중 오류: {e}")
            return {
                "success": False,
                "error": str(e),
                "results": f"❌ Vector Search 실행 중 오류가 발생했습니다: {str(e)}"
            }
    
    def _format_no_results(
        self, 
        search_query: str, 
        top_k: int, 
        similarity_threshold: float
    ) -> str:
        """검색 결과가 없을 때 포맷팅"""
        return f"""🔍 **Vector Search 결과:** (청크 기반 검색)

**검색 쿼리**: {search_query}
**상위 K개**: {top_k}
**유사도 임계값**: {similarity_threshold}

📭 아직 벡터스토어에 청크가 없습니다. 먼저 문서를 로드하고 청킹한 후 임베딩을 생성해주세요.

**검색 통계:**
- 총 청크 수: 0
- 검색된 결과: 0
- 임계값 이상 결과: 0
- 처리 시간: < 1ms"""
    
    def _format_search_results(
        self, 
        search_results: List, 
        search_query: str, 
        top_k: int, 
        similarity_threshold: float
    ) -> str:
        """검색 결과 포맷팅"""
        results_parts = [f"""🔍 **Vector Search 결과:** (청크 기반 검색)

**검색 쿼리**: {search_query}
**상위 K개**: {top_k}
**유사도 임계값**: {similarity_threshold}

**검색된 청크들:**
"""]
        
        for i, result in enumerate(search_results):
            chunk = result.chunk
            similarity = result.similarity_score
            relevance = result.get_relevance_level()
            rank = result.rank
            
            # 임계값 표시
            threshold_indicator = "✅" if similarity >= similarity_threshold else "⚠️"
            
            # 청크 내용 미리보기 (처음 200자)
            content_preview = chunk.content[:200] + "..." if len(chunk.content) > 200 else chunk.content
            
            result_info = f"""
{threshold_indicator} **청크 #{i+1}** (순위: {rank})
- **유사도 점수**: {similarity:.4f} ({relevance})
- **소속 문서 ID**: {str(chunk.document_id)[:12]}...
- **청크 ID**: {str(chunk.chunk_id)[:12]}...
- **청크 인덱스**: {chunk.chunk_index}
- **청크 크기**: {len(chunk.content)} 글자
- **청크 내용 미리보기**:
  {content_preview}
---"""
            results_parts.append(result_info)
        
        # 검색 통계 추가
        above_threshold_count = sum(1 for r in search_results if r.similarity_score >= similarity_threshold)
        
        stats = f"""
**검색 통계:**
- 총 검색 결과: {len(search_results)}
- 임계값({similarity_threshold}) 이상: {above_threshold_count}
- 반환된 결과: {len(search_results)}
- 평균 유사도: {sum(r.similarity_score for r in search_results) / len(search_results):.4f}
"""
        
        results_parts.append(stats)
        return "\n".join(results_parts)