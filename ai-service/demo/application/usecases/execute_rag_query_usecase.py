"""
Execute RAG Query Use Case
RAG Query 실행 유스케이스

사용자 질문에 대해 문서 검색 후 AI 답변을 생성하는 Use Case입니다.
"""

import logging
from typing import Dict, Any, Tuple, List
from domain.services.retrieval_service import RetrievalService
from domain.services.generation_service import GenerationService
from domain.services.document_management_service import DocumentService
from domain.services.query_template_service import QueryTemplateService
from domain.entities.query import Query

logger = logging.getLogger(__name__)


class ExecuteRAGQueryUseCase:
    """RAG Query 실행 유스케이스"""
    
    def __init__(
        self,
        retrieval_service: RetrievalService,
        generation_service: GenerationService,
        document_service: DocumentService,
        query_template_service: QueryTemplateService = None
    ):
        self.retrieval_service = retrieval_service
        self.generation_service = generation_service
        self.document_service = document_service
        self.query_template_service = query_template_service or QueryTemplateService()
        logger.info("✅ ExecuteRAGQueryUseCase initialized")
    
    def execute(
        self,
        question: str,
        max_sources: int = 3,
        similarity_threshold: float = 0.4
    ) -> Dict[str, Any]:
        """RAG Query 실행"""
        if not question.strip():
            raise ValueError("질문을 입력해주세요")
        
        # Query 엔티티 생성
        query = Query(
            text=question,
            query_type="RAG_QUESTION",
            max_results=max_sources,
            similarity_threshold=similarity_threshold
        )
        
        # 벡터 검색 수행
        search_results = self.retrieval_service.search_similar_chunks(
            query=query,
            top_k=max_sources,
            similarity_threshold=similarity_threshold
        )
        
        if not search_results:
            return {
                "success": True,
                "answer": "죄송합니다. 관련된 정보를 찾을 수 없습니다. 먼저 문서를 로드하고 청킹한 후 임베딩을 생성해주세요.",
                "sources": "📭 벡터스토어에 청크가 없거나 관련 정보를 찾을 수 없습니다.",
                "query_id": str(query.query_id),
                "search_results_count": 0
            }
        
        # RAG 응답 생성
        rag_response = self.generation_service.generate_rag_response(
            query=query,
            search_results=search_results,
            max_sources=max_sources
        )
        
        # 출처 정보 포맷팅
        sources_text = self._format_sources(search_results[:max_sources])
        
        return {
            "success": True,
            "answer": rag_response.answer,
            "sources": sources_text,
            "query_id": str(query.query_id),
            "response_id": str(rag_response.rag_response_id),
            "confidence_score": rag_response.confidence_score,
            "processing_time_ms": rag_response.processing_time_ms,
            "search_results_count": len(search_results),
            "used_sources_count": len(search_results[:max_sources])
        }
    
    def _format_sources(self, search_results) -> str:
        """출처 정보 포맷팅"""
        if not search_results:
            return "📭 사용된 출처가 없습니다."
        
        sources_parts = ["📚 **참조된 청크들:**\n"]
        
        for i, result in enumerate(search_results):
            chunk = result.chunk
            similarity = result.similarity_score
            relevance = result.get_relevance_level()
            
            # 청크 내용 미리보기 (처음 150자)
            content_preview = chunk.content[:150] + "..." if len(chunk.content) > 150 else chunk.content
            
            source_info = f"""
**청크 {i+1}** (유사도: {similarity:.3f}, 관련성: {relevance})
- **소속 문서 ID**: {str(chunk.document_id)[:8]}...
- **청크 ID**: {str(chunk.chunk_id)[:8]}...
- **청크 인덱스**: {chunk.chunk_index}
- **청크 크기**: {len(chunk.content)} 글자
- **청크 내용**: {content_preview}
---"""
            sources_parts.append(source_info)
        
        return "\n".join(sources_parts)
    
    def get_sample_queries_for_loaded_documents(self) -> List[Dict[str, Any]]:
        """로드된 문서들을 기반으로 샘플 쿼리 생성"""
        # 간단한 테스트: 기본 샘플 쿼리 반환 (문서 로드 상태 무관)
        sample_queries = [
            {
                "query": "AI 포트폴리오 프로젝트의 주요 기술 스택은 무엇인가요?",
                "expected_type": "PROJECT",
                "confidence": 0.95,
                "reasoning": "프로젝트의 기술 스택을 묻는 질문",
                "source_document": "AI Portfolio Project"
            },
            {
                "query": "헥사고날 아키텍처를 선택한 이유는 무엇인가요?",
                "expected_type": "EXPERIENCE",
                "confidence": 0.91,
                "reasoning": "아키텍처 선택 경험을 묻는 질문",
                "source_document": "Architecture Q&A"
            },
            {
                "query": "RAG 시스템에서 벡터 검색은 어떻게 구현했나요?",
                "expected_type": "TECHNICAL_SKILL",
                "confidence": 0.89,
                "reasoning": "구체적 기술 구현을 묻는 질문",
                "source_document": "RAG System Q&A"
            },
            {
                "query": "이 프로젝트를 통해 배운 점은 무엇인가요?",
                "expected_type": "EXPERIENCE", 
                "confidence": 0.88,
                "reasoning": "프로젝트 경험과 학습을 묻는 질문",
                "source_document": "Learning Experience"
            }
        ]
        
        return sample_queries
    
