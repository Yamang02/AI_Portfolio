"""
Execute Vector Search Use Case
Vector Search 실행 유스케이스

벡터 유사도 검색을 수행하여 관련 문서 청크를 찾는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any, List
from domain.entities.query import Query
from application.common import (
    handle_usecase_errors,
    validate_required_fields,
    ResponseFormatter,
    log_usecase_execution,
    validate_string_not_empty
)

logger = logging.getLogger(__name__)


class ExecuteVectorSearchUseCase:
    """Vector Search 실행 유스케이스"""
    
    def __init__(self):
        # ConfigManager를 통한 검색 품질 설정 로드
        try:
            from config.demo_config_manager import get_demo_config_manager
            config_manager = get_demo_config_manager()
            self.search_config = config_manager.get_search_quality_config()
            logger.info("✅ ExecuteVectorSearchUseCase initialized with ConfigManager")
        except Exception as e:
            logger.error(f"❌ ConfigManager 로드 실패: {e}")
            raise RuntimeError("검색 품질 설정을 로드할 수 없습니다. ConfigManager를 확인해주세요.")
    
    @handle_usecase_errors(
        default_error_message="Vector Search 실행 중 오류가 발생했습니다.",
        log_error=True
    )
    @validate_required_fields(
        search_query=validate_string_not_empty
    )
    @log_usecase_execution("ExecuteVectorSearchUseCase")
    def execute(
        self,
        search_query: str,
        top_k: int = None,
        similarity_threshold: float = None
    ) -> Dict[str, Any]:
        """Vector Search 실행"""
        # ConfigManager 기반 기본값 적용
        if top_k is None:
            top_k = self.search_config["default_top_k"]
        if similarity_threshold is None:
            similarity_threshold = self.search_config["default_similarity_threshold"]
        
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
            return ResponseFormatter.success(
                data={
                    "results": self._format_no_results(search_query, top_k, similarity_threshold),
                    "query_id": str(query.query_id),
                    "total_results": 0,
                    "above_threshold_results": 0
                },
                message="🔍 Vector Search가 실행되었지만 결과를 찾을 수 없습니다"
            )
        
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
        
        return ResponseFormatter.success(
            data={
                "results": formatted_results,
                "query_id": str(query.query_id),
                "total_results": len(search_results),
                "above_threshold_results": len(above_threshold_results),
                "returned_results": min(len(search_results), top_k)
            },
            message=f"🔍 Vector Search가 성공적으로 실행되었습니다 ({len(search_results)}개 결과)"
        )
    
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
        """검색 결과 포맷팅 (HTML 카드 기반)"""
        from infrastructure.inbound.ui.gradio.components.ui_components import UIComponents
        
        # HTML 헤더 생성
        header_html = f"""
        <div style="
            background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
            border: 2px solid #2196f3;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
            <h3 style="margin: 0 0 8px 0; color: #1976d2;">🔍 Vector Search 결과</h3>
            <div style="font-size: 14px; color: #666;">
                <strong>검색 쿼리:</strong> {search_query} | 
                <strong>상위 K개:</strong> {top_k} | 
                <strong>유사도 임계값:</strong> {similarity_threshold}
            </div>
        </div>
        """
        
        # 청크 카드들 생성 (HTML)
        cards_html = ""
        for i, result in enumerate(search_results):
            chunk = result.chunk
            similarity = result.similarity_score
            rank = result.rank
            
            # 청크 내용 미리보기 (처음 300자)
            content_preview = chunk.content[:300] + "..." if len(chunk.content) > 300 else chunk.content
            
            # 청크 카드 생성 (HTML)
            card_html = UIComponents.create_vector_search_chunk_card(
                chunk_id=str(chunk.chunk_id),
                document_id=str(chunk.document_id),
                similarity_score=similarity,
                content_preview=content_preview,
                chunk_index=chunk.chunk_index,
                content_length=len(chunk.content),
                rank=rank
            )
            cards_html += card_html + "\n"
        
        # 검색 통계 HTML 생성
        above_threshold_count = sum(1 for r in search_results if r.similarity_score >= similarity_threshold)
        
        stats_html = f"""
        <div style="
            background: linear-gradient(135deg, #f3e5f5 0%, #fce4ec 100%);
            border: 2px solid #9c27b0;
            border-radius: 8px;
            padding: 16px;
            margin-top: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
            <h4 style="margin: 0 0 8px 0; color: #7b1fa2;">📊 검색 통계</h4>
            <div style="font-size: 14px; color: #666;">
                총 검색 결과: <strong>{len(search_results)}</strong> | 
                임계값({similarity_threshold}) 이상: <strong>{above_threshold_count}</strong> | 
                반환된 결과: <strong>{len(search_results)}</strong> | 
                평균 유사도: <strong>{sum(r.similarity_score for r in search_results) / len(search_results):.4f}</strong>
            </div>
        </div>
        """
        
        # 모든 HTML 조합
        return header_html + cards_html + stats_html
