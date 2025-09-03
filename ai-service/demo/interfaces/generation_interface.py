"""
Generation Interface
답변 생성 관련 그라디오 인터페이스
"""

import logging
from typing import List, Dict, Any, Tuple

logger = logging.getLogger(__name__)


class GenerationInterface:
    """답변 생성 관련 인터페이스"""
    
    def __init__(self, rag_service):
        self.rag_service = rag_service

    async def generate_answer(self, question: str, max_results: int = 3) -> Tuple[str, str]:
        """출처와 함께 RAG 답변 생성"""
        if not question.strip():
            return "❌ 질문을 입력해주세요", ""
        
        try:
            result = await self.rag_service.generate_rag_answer(
                question=question.strip(),
                context_hint=None,
                metadata={"timestamp": "demo"}
            )
            
            # Format answer
            answer = f"🤖 **답변:**\n{result.answer}\n\n"
            answer += f"⏱️ **처리 시간:** {result.processing_time_ms:.0f}ms\n"
            answer += f"🎯 **신뢰도:** {result.confidence:.2f}"
            
            # Format sources
            if result.sources:
                sources = "📚 **사용된 출처:**\n\n"
                for i, source in enumerate(result.sources, 1):
                    sources += f"**{i}. 유사도: {source.similarity_score:.3f}**\n"
                    sources += f"{source.chunk.content[:300]}...\n\n"
            else:
                sources = "📭 출처를 찾을 수 없습니다"
            
            return answer, sources
            
        except Exception as e:
            logger.error(f"답변 생성 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}", ""

    async def add_document_with_analysis(self, content: str, source: str = "manual_input") -> Tuple[str, str, str]:
        """상세 분석과 함께 문서 추가"""
        if not content.strip():
            return "❌ 내용을 입력해주세요", "", ""
        
        try:
            result = await self.rag_service.add_document_with_analysis(
                content=content.strip(),
                source=source,
                metadata={"timestamp": "demo"}
            )
            
            if not result.get("success"):
                return f"❌ 문서 추가 실패: {result.get('error', 'Unknown error')}", "", ""
            
            # 기본 결과
            basic_result = f"✅ 문서가 성공적으로 추가되었습니다!\n문서 ID: {result.get('document_id', 'N/A')}\n출처: {result.get('source', 'N/A')}"
            
            # 처리 과정 분석
            processing_steps = result.get("processing_steps", {})
            vector_result = result.get("vector_result", {})
            
            processing_info = f"⏱️ **처리 분석:**\n"
            processing_info += f"• 모델 생성: {processing_steps.get('model_creation', 0):.3f}s\n"
            processing_info += f"• 벡터 처리: {processing_steps.get('vector_processing', 0):.3f}s\n"
            processing_info += f"• 총 시간: {processing_steps.get('total_time', 0):.3f}s\n\n"
            
            # 벡터 처리 결과
            if vector_result.get("success"):
                vector_info = f"🔢 **벡터 분석:**\n"
                vector_info += f"• 생성된 청크: {vector_result.get('chunks_created', 0)}\n"
                vector_info += f"• 벡터 차원: {vector_result.get('vector_dimensions', 0)}\n"
                vector_info += f"• 총 문서 수: {vector_result.get('total_documents', 0)}\n"
                vector_info += f"• 총 청크 수: {vector_result.get('total_chunks', 0)}\n\n"
                
                # 청크 상세 정보
                chunk_details = vector_result.get("chunk_details", [])
                if chunk_details:
                    vector_info += "📄 **청크 상세 정보:**\n"
                    for i, chunk in enumerate(chunk_details, 1):
                        vector_info += f"• 청크 {i}: {chunk['length']} chars - {chunk['content_preview']}\n"
            else:
                vector_info = "❌ 벡터 처리 실패"
            
            return basic_result, processing_info, vector_info
                
        except Exception as e:
            logger.error(f"상세 분석과 함께 문서 추가 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}", "", ""

    async def add_sample_data_to_knowledge_base(self, sample_data: List[Dict[str, Any]]) -> str:
        """로드된 샘플 데이터를 지식 베이스에 추가"""
        if not sample_data:
            return "<div style='text-align: center; color: #dc3545; padding: 20px; font-weight: 600;'>❌ 먼저 샘플 데이터를 로드해주세요.</div>"
        
        try:
            results = []
            for data in sample_data:
                try:
                    result = await self.rag_service.add_document_from_text(
                        content=data["content"],
                        source=data["source"],
                        metadata={"title": data["title"], "type": "sample_data"}
                    )
                    if result.get("success"):
                        results.append(f"✅ {data['title']} 추가 완료")
                    else:
                        results.append(f"❌ {data['title']} 추가 실패: {result.get('error', 'Unknown error')}")
                except Exception as e:
                    results.append(f"❌ {data['title']} 추가 실패: {str(e)}")
            
            # HTML로 포맷팅
            html_result = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <h3 style="color: #2c3e50; margin-bottom: 20px;">➕ 샘플 데이터 지식 베이스 추가 결과</h3>
                <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%); border: 2px solid #4caf50; border-radius: 12px; padding: 20px;">
            """
            
            for line in results:
                if line.startswith('✅'):
                    html_result += f'<div style="color: #28a745; margin-bottom: 8px;">{line}</div>'
                elif line.startswith('❌'):
                    html_result += f'<div style="color: #dc3545; margin-bottom: 8px;">{line}</div>'
                else:
                    html_result += f'<div style="color: #6c757d; margin-bottom: 8px;">{line}</div>'
            
            html_result += """
                </div>
            </div>
            """
            
            return html_result
            
        except Exception as e:
            logger.error(f"샘플 데이터 추가 중 오류 발생: {e}")
            return f"<div style='text-align: center; color: #dc3545; padding: 20px; font-weight: 600;'>❌ 샘플 데이터 추가 실패: {str(e)}</div>"

    async def demonstrate_complete_rag_pipeline(self, content: str, query: str) -> Tuple[str, str, str, str]:
        """완전한 RAG 파이프라인 시연: 문서 추가부터 검색까지"""
        try:
            pipeline_log = []
            
            # === 1단계: 문서 로딩 ===
            pipeline_log.append("🔄 **1단계: 문서 로딩**")
            pipeline_log.append(f"• 입력 텍스트 길이: {len(content)} 문자")
            pipeline_log.append(f"• 문서 타입: 텍스트")
            pipeline_log.append(f"• 처리 시간: 즉시\n")
            
            # === 2단계: 문서 저장 및 벡터화 ===
            pipeline_log.append("🔄 **2단계: 문서 저장 및 벡터화**")
            add_result = await self.rag_service.add_document_with_analysis(
                content=content.strip(),
                source="pipeline_demo",
                metadata={"demo": "complete_pipeline"}
            )
            
            if not add_result.get("success"):
                return "❌ 문서 추가 실패", "", "", ""
            
            processing_steps = add_result.get("processing_steps", {})
            vector_result = add_result.get("vector_result", {})
            
            pipeline_log.append(f"• 임베딩 모델: sentence-transformers/all-MiniLM-L6-v2")
            pipeline_log.append(f"• 벡터 차원: {vector_result.get('vector_dimensions', 384)}")
            pipeline_log.append(f"• 생성된 청크: {vector_result.get('chunks_created', 0)}개")
            pipeline_log.append(f"• 벡터화 시간: {processing_steps.get('vector_processing', 0):.3f}s")
            pipeline_log.append(f"• BM25 인덱싱 완료\n")
            
            # === 3단계: 쿼리 처리 ===
            pipeline_log.append("🔍 **3단계: 쿼리 처리**")
            pipeline_log.append(f"• 검색 쿼리: '{query}'")
            pipeline_log.append(f"• 쿼리 길이: {len(query)} 문자")
            pipeline_log.append(f"• 검색 알고리즘: 하이브리드 (Vector + BM25)\n")
            
            # === 4단계: 유사도 검색 실행 ===
            search_result = await self.rag_service.search_documents_with_analysis(
                query=query.strip(),
                top_k=3,
                similarity_threshold=0.1
            )
            
            if not search_result.get("success"):
                return "\n".join(pipeline_log), "❌ 검색 실패", "", ""
            
            documents = search_result.get("results", [])
            detailed_analysis = search_result.get("detailed_analysis", {})
            processing_steps_search = detailed_analysis.get("processing_steps", {})
            
            pipeline_log.append("📊 **4단계: 검색 실행 결과**")
            pipeline_log.append(f"• 찾은 문서: {len(documents)}개")
            pipeline_log.append(f"• 검색 시간: {processing_steps_search.get('total_time', 0):.3f}s")
            pipeline_log.append(f"• 벡터 유사도 계산: {processing_steps_search.get('similarity_calculation', 0):.3f}s")
            pipeline_log.append(f"• BM25 점수 계산: {processing_steps_search.get('preprocessing', 0):.3f}s")
            
            # 검색 결과 포맷팅
            search_results = f"🔍 **검색 결과 ({len(documents)}개)**\n\n"
            for i, doc in enumerate(documents, 1):
                search_results += f"**{i}. 유사도: {doc.get('similarity_score', 0):.3f}**\n"
                search_results += f"{doc.get('content', '')[:300]}...\n\n"
            
            # 벡터 분석 정보
            vector_info = detailed_analysis.get("vector_info", {})
            vector_analysis = f"🔢 **벡터 분석**\n"
            vector_analysis += f"• 처리된 청크: {vector_info.get('processed_chunks', 0)}개\n"
            vector_analysis += f"• 벡터 차원: {vector_info.get('dimensions', 384)}\n"
            vector_analysis += f"• 유사도 임계값: {vector_info.get('threshold_applied', 0.1)}\n\n"
            
            similarity_dist = detailed_analysis.get("similarity_distribution", {})
            vector_analysis += f"**유사도 분포:**\n"
            vector_analysis += f"• 고유사도 (>0.7): {similarity_dist.get('exact_matches', 0)}개\n"
            vector_analysis += f"• 중유사도 (0.3-0.7): {similarity_dist.get('similarity_matches', 0)}개\n"
            vector_analysis += f"• 저유사도 (<0.3): {similarity_dist.get('contextual_matches', 0)}개\n"
            
            # === 5단계: RAG 답변 생성 ===
            if documents:
                rag_result = await self.rag_service.generate_rag_answer(
                    question=query.strip(),
                    context_hint=None,
                    metadata={"demo": "complete_pipeline"}
                )
                
                pipeline_log.append(f"\n🤖 **5단계: RAG 답변 생성**")
                pipeline_log.append(f"• LLM 모델: MockLLM (데모용)")
                pipeline_log.append(f"• 사용된 컨텍스트: {len(rag_result.sources)}개 문서")
                pipeline_log.append(f"• 답변 생성 시간: {rag_result.processing_time_ms:.0f}ms")
                pipeline_log.append(f"• 신뢰도: {rag_result.confidence:.2f}")
                
                final_answer = f"🤖 **최종 RAG 답변**\n\n{rag_result.answer}\n\n"
                final_answer += f"**메타 정보:**\n"
                final_answer += f"• 처리 시간: {rag_result.processing_time_ms:.0f}ms\n"
                final_answer += f"• 신뢰도: {rag_result.confidence:.2f}\n"
                final_answer += f"• 사용된 소스: {len(rag_result.sources)}개"
            else:
                pipeline_log.append(f"\n❌ **5단계: RAG 답변 생성 실패**")
                pipeline_log.append("• 관련 문서를 찾을 수 없어 답변을 생성할 수 없습니다.")
                final_answer = "❌ 관련 문서를 찾을 수 없어 답변을 생성할 수 없습니다."
            
            return "\n".join(pipeline_log), search_results, vector_analysis, final_answer
            
        except Exception as e:
            logger.error(f"완전한 RAG 파이프라인 시연 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}", "", "", ""
