"""
Retrieval Interface
검색 관련 그라디오 인터페이스
"""

import logging
from typing import List, Dict, Any, Tuple

logger = logging.getLogger(__name__)


class RetrievalInterface:
    """검색 관련 인터페이스"""
    
    def __init__(self, rag_service):
        self.rag_service = rag_service

    def get_sample_queries(self) -> List[str]:
        """샘플 검색 쿼리 목록 반환"""
        return [
            "헥사고날 아키텍처는 어떻게 구현되었나요?",
            "RAG 시스템의 핵심 구성 요소는 무엇인가요?",
            "프로젝트의 주요 목표는 무엇인가요?",
            "어떤 기술 스택을 사용했나요?"
        ]

    async def search_documents(self, query: str, top_k: int = 3) -> str:
        """지식 베이스에서 문서 검색"""
        if not query.strip():
            return "❌ 검색어를 입력해주세요"
        
        try:
            result = await self.rag_service.search_documents(
                query=query.strip(),
                top_k=top_k,
                similarity_threshold=0.1
            )
            
            if not result.get("success"):
                return f"❌ 검색 실패: {result.get('error', 'Unknown error')}"
            
            documents = result.get("results", [])
            if not documents:
                return "📭 관련 문서를 찾을 수 없습니다"
            
            output = f"🔍 {len(documents)}개의 관련 문서를 찾았습니다:\n\n"
            for i, doc in enumerate(documents, 1):
                output += f"**{i}. 점수: {doc.get('similarity_score', 0):.3f}**\n"
                output += f"{doc.get('content', '내용 없음')[:200]}...\n\n"
            
            return output
            
        except Exception as e:
            logger.error(f"문서 검색 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}"

    async def search_documents_with_analysis(self, query: str, top_k: int = 3) -> Tuple[str, str, str]:
        """상세 분석과 함께 문서 검색"""
        if not query.strip():
            return "❌ 검색어를 입력해주세요", "", ""
        
        try:
            result = await self.rag_service.search_documents_with_analysis(
                query=query.strip(),
                top_k=top_k,
                similarity_threshold=0.1
            )
            
            if not result.get("success"):
                return f"❌ 검색 실패: {result.get('error', 'Unknown error')}", "", ""
            
            # 검색 결과
            documents = result.get("results", [])
            if not documents:
                return "📭 관련 문서를 찾을 수 없습니다", "", ""
            
            search_results = f"🔍 {len(documents)}개의 관련 문서를 찾았습니다:\n\n"
            for i, doc in enumerate(documents, 1):
                search_results += f"**{i}. 점수: {doc.get('similarity_score', 0):.3f}**\n"
                search_results += f"{doc.get('content', '내용 없음')[:200]}...\n\n"
            
            # 처리 과정 분석
            detailed_analysis = result.get("detailed_analysis", {})
            processing_steps = detailed_analysis.get("processing_steps", {})
            vector_info = detailed_analysis.get("vector_info", {})
            
            processing_info = f"⏱️ **처리 분석:**\n"
            processing_info += f"• 전처리: {processing_steps.get('preprocessing', 0):.3f}s\n"
            processing_info += f"• 벡터화: {processing_steps.get('vectorization', 0):.3f}s\n"
            processing_info += f"• 유사도 계산: {processing_steps.get('similarity_calculation', 0):.3f}s\n"
            processing_info += f"• 정렬: {processing_steps.get('sorting', 0):.3f}s\n"
            processing_info += f"• 결과 생성: {processing_steps.get('result_creation', 0):.3f}s\n"
            processing_info += f"• 총 시간: {processing_steps.get('total_time', 0):.3f}s\n\n"
            
            # 벡터 정보
            vector_analysis = f"🔢 **벡터 분석:**\n"
            vector_analysis += f"• 벡터 차원: {vector_info.get('dimensions', 0)}\n"
            vector_analysis += f"• 총 청크 수: {vector_info.get('total_chunks', 0)}\n"
            vector_analysis += f"• 처리된 청크: {vector_info.get('processed_chunks', 0)}\n"
            vector_analysis += f"• 유사도 임계값: {vector_info.get('threshold_applied', 0)}\n\n"
            
            # 유사도 분포
            similarity_dist = detailed_analysis.get("similarity_distribution", {})
            vector_analysis += f"📊 **유사도 분포:**\n"
            vector_analysis += f"• 정확히 일치: {similarity_dist.get('exact_matches', 0)}\n"
            vector_analysis += f"• 유사도 일치: {similarity_dist.get('similarity_matches', 0)}\n"
            vector_analysis += f"• 문맥상 일치: {similarity_dist.get('contextual_matches', 0)}\n"
            
            return search_results, processing_info, vector_analysis
                
        except Exception as e:
            logger.error(f"상세 분석과 함께 문서 검색 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}", "", ""

    async def demonstrate_retriever_process(self, query: str) -> Tuple[str, str, str]:
        """리트리버 과정을 단계별로 시연"""
        if not query.strip():
            return "❌ 검색어를 입력해주세요", "", ""
        
        try:
            # 1단계: 쿼리 임베딩 생성
            step1_info = "🔄 **1단계: 쿼리 임베딩 생성**\n"
            step1_info += f"• 쿼리: '{query}'\n"
            step1_info += f"• 모델: sentence-transformers/all-MiniLM-L6-v2\n"
            step1_info += f"• 벡터 차원: 384\n"
            
            # 2단계: 벡터 검색
            step2_info = "🔍 **2단계: 벡터 검색**\n"
            step2_info += f"• 검색 알고리즘: 코사인 유사도 + BM25\n"
            step2_info += f"• 검색 범위: 전체 벡터 스토어\n"
            
            # 실제 검색 실행
            result = await self.rag_service.search_documents_with_analysis(
                query=query.strip(),
                top_k=5,
                similarity_threshold=0.1
            )
            
            if not result.get("success"):
                return f"❌ 검색 실패: {result.get('error', 'Unknown error')}", "", ""
            
            documents = result.get("results", [])
            detailed_analysis = result.get("detailed_analysis", {})
            processing_steps = detailed_analysis.get("processing_steps", {})
            
            # 3단계: 검색 결과
            step3_info = "📊 **3단계: 검색 결과**\n"
            step3_info += f"• 찾은 문서: {len(documents)}개\n"
            step3_info += f"• 처리 시간: {processing_steps.get('total_time', 0):.3f}s\n\n"
            
            for i, doc in enumerate(documents[:3], 1):
                step3_info += f"**{i}. 유사도: {doc.get('similarity_score', 0):.3f}**\n"
                step3_info += f"{doc.get('content', '')[:150]}...\n\n"
            
            # 상세 분석 정보
            analysis_info = "🔬 **상세 분석**\n"
            analysis_info += f"• 전처리: {processing_steps.get('preprocessing', 0):.3f}s\n"
            analysis_info += f"• 벡터화: {processing_steps.get('vectorization', 0):.3f}s\n"
            analysis_info += f"• 유사도 계산: {processing_steps.get('similarity_calculation', 0):.3f}s\n"
            analysis_info += f"• 정렬: {processing_steps.get('sorting', 0):.3f}s\n"
            
            vector_info = detailed_analysis.get("vector_info", {})
            analysis_info += f"• 벡터 차원: {vector_info.get('dimensions', 384)}\n"
            analysis_info += f"• 총 청크 수: {vector_info.get('total_chunks', 0)}\n"
            analysis_info += f"• 처리된 청크: {vector_info.get('processed_chunks', 0)}\n"
            
            return step1_info, step2_info + step3_info, analysis_info
                
        except Exception as e:
            logger.error(f"리트리버 과정 시연 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}", "", ""
