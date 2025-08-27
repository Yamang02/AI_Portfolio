"""
RAG Demo Service
기존 RAG 클래스들을 Gradio 인터페이스와 연동하는 서비스
"""

import asyncio
import uuid
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
import json
import logging

from ..services.document.pipeline import DocumentProcessingPipeline
from ..services.document.splitters import MarkdownTextSplitter
from ..services.chat.context_builder import ContextBuilder
from ..services.generation.llm_service import LLMService
from ..services.portfolio.service import PortfolioService
from ..core.config import get_config_manager

logger = logging.getLogger(__name__)


class RAGDemoService:
    """RAG 데모 서비스 - 기존 클래스들을 Gradio와 연동"""
    
    def __init__(self):
        """서비스 초기화"""
        self.config = get_config_manager()
        self.pipeline = DocumentProcessingPipeline()
        self.portfolio_service = PortfolioService()
        self.context_builder = ContextBuilder(self.portfolio_service)
        
        # LLM 서비스는 향후 구현
        # self.llm_service = LLMService()
        
        self.docs_path = Path("docs/projects")
        
    async def demo_document_loading(self, selected_file: str) -> Tuple[str, Dict[str, Any]]:
        """문서 로딩 데모"""
        try:
            file_path = self.docs_path / selected_file
            
            if not file_path.exists():
                return "파일을 찾을 수 없습니다.", {"error": "File not found"}
            
            # 실제 DocumentProcessingPipeline 사용
            result = await self.pipeline.process_file(file_path)
            
            if result.get("error"):
                return "문서 로딩 중 오류가 발생했습니다.", {"error": result["error"]}
            
            documents = result["documents"]
            if not documents:
                return "문서가 비어있습니다.", {"error": "Empty document"}
            
            # 원본 텍스트와 메타데이터 반환
            original_text = documents[0].page_content
            metadata = {
                "file_name": selected_file,
                "document_count": len(documents),
                "content_length": len(original_text),
                "processing_stats": result["processing_stats"]
            }
            
            logger.info(f"Document loading demo completed for {selected_file}")
            return original_text, metadata
            
        except Exception as e:
            logger.error(f"Document loading demo failed: {e}")
            return f"오류 발생: {str(e)}", {"error": str(e)}
    
    async def demo_text_splitting(self, content: str, chunk_size: int, chunk_overlap: int) -> Tuple[str, Dict[str, Any]]:
        """텍스트 분할 데모"""
        try:
            if not content.strip():
                return "분할할 텍스트가 없습니다.", {"error": "No content"}
            
            # MarkdownTextSplitter 사용
            splitter = MarkdownTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                header_levels=[1, 2, 3]
            )
            
            # 텍스트를 Document 객체로 변환 후 분할
            from langchain_core.documents import Document
            doc = Document(page_content=content, metadata={"source": "demo"})
            
            chunks = await splitter.split_documents([doc])
            
            # 분할 결과 포매팅
            formatted_chunks = []
            for i, chunk in enumerate(chunks):
                formatted_chunks.append(f"=== 청크 {i+1} ===\n{chunk.page_content}\n")
            
            chunks_display = "\n".join(formatted_chunks)
            
            # 통계 정보
            stats = {
                "total_chunks": len(chunks),
                "avg_chunk_size": sum(len(chunk.page_content) for chunk in chunks) // len(chunks) if chunks else 0,
                "chunk_size_setting": chunk_size,
                "chunk_overlap_setting": chunk_overlap,
                "original_length": len(content),
                "total_processed_length": sum(len(chunk.page_content) for chunk in chunks)
            }
            
            logger.info(f"Text splitting demo completed: {len(chunks)} chunks")
            return chunks_display, stats
            
        except Exception as e:
            logger.error(f"Text splitting demo failed: {e}")
            return f"오류 발생: {str(e)}", {"error": str(e)}
    
    async def demo_generation(self, question: str) -> Tuple[str, str]:
        """생성 데모 (ContextBuilder 사용)"""
        try:
            if not question.strip():
                return "질문을 입력해주세요.", "질문이 없습니다."
            
            # 실제 ContextBuilder 사용하여 컨텍스트 구성
            context = await self.context_builder.build_full_portfolio_context()
            
            # 향후 LLM 서비스 연동 시 실제 답변 생성
            # answer = await self.llm_service.generate_answer(question, context)
            
            # 현재는 데모용 답변
            demo_answer = f"""
[데모 답변]
질문: {question}

포트폴리오 컨텍스트를 기반으로 답변을 생성합니다.
현재는 ContextBuilder만 연동되어 있으며, LLM 서비스는 향후 구현 예정입니다.

컨텍스트 길이: {len(context)} 문자
            """.strip()
            
            logger.info(f"Generation demo completed for question: {question[:50]}...")
            return context, demo_answer
            
        except Exception as e:
            logger.error(f"Generation demo failed: {e}")
            return f"컨텍스트 구성 실패: {str(e)}", f"오류 발생: {str(e)}"
    
    async def demo_full_pipeline(self, question: str) -> Dict[str, Any]:
        """전체 파이프라인 데모"""
        try:
            if not question.strip():
                return {"error": "질문을 입력해주세요."}
            
            pipeline_result = {
                "question": question,
                "steps": []
            }
            
            # 1단계: 문서 로딩 (기본 프로젝트 문서들)
            pipeline_result["steps"].append("1. 문서 로딩 시작...")
            
            loaded_docs = []
            for file_path in self.docs_path.glob("*.md"):
                try:
                    content, metadata = await self.demo_document_loading(file_path.name)
                    loaded_docs.append({
                        "file": file_path.name,
                        "length": len(content),
                        "status": "success"
                    })
                except Exception as e:
                    loaded_docs.append({
                        "file": file_path.name,
                        "status": "failed",
                        "error": str(e)
                    })
            
            pipeline_result["loaded_documents"] = loaded_docs
            pipeline_result["steps"].append(f"1. 문서 로딩 완료: {len(loaded_docs)}개 파일")
            
            # 2단계: 컨텍스트 구성
            pipeline_result["steps"].append("2. 컨텍스트 구성 시작...")
            context, answer = await self.demo_generation(question)
            
            pipeline_result["context_length"] = len(context)
            pipeline_result["generated_answer"] = answer
            pipeline_result["steps"].append("2. 컨텍스트 구성 및 답변 생성 완료")
            
            # 3단계: 결과 요약
            pipeline_result["summary"] = {
                "total_steps": len(pipeline_result["steps"]),
                "documents_processed": len([doc for doc in loaded_docs if doc["status"] == "success"]),
                "context_size": len(context),
                "answer_length": len(answer),
                "status": "completed"
            }
            
            logger.info(f"Full pipeline demo completed for question: {question[:50]}...")
            return pipeline_result
            
        except Exception as e:
            logger.error(f"Full pipeline demo failed: {e}")
            return {
                "error": str(e),
                "question": question,
                "status": "failed"
            }
    
    # 향후 Qdrant 연동 메서드들 (현재는 스텁)
    async def reset_demo_data(self) -> Dict[str, str]:
        """데모 데이터 초기화 (향후 구현)"""
        return {
            "status": "향후 구현 예정",
            "message": "Qdrant 벡터 스토어 연동 후 구현됩니다."
        }
    
    async def get_demo_stats(self) -> Dict[str, Any]:
        """데모 데이터 통계 (향후 구현)"""
        return {
            "status": "향후 구현 예정",
            "total_vectors": 0,
            "collection_status": "not_implemented",
            "indexed_documents": 0
        }
    
    async def demo_vector_search(self, query: str) -> Tuple[str, Dict[str, Any]]:
        """벡터 검색 데모 (향후 구현)"""
        return (
            "벡터 검색 기능은 향후 구현 예정입니다.",
            {
                "query": query,
                "status": "not_implemented",
                "similarity_scores": []
            }
        )
    
    async def is_available(self) -> bool:
        """서비스 가용성 확인"""
        try:
            return await self.context_builder.is_available()
        except Exception as e:
            logger.error(f"Demo service availability check failed: {e}")
            return False