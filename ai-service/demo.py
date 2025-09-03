"""
HuggingFace Spaces Demo Entry Point
Hexagonal Architecture RAG Demo for AI Portfolio
"""

import asyncio
import gradio as gr
import logging
from typing import List, Tuple, Dict, Any
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import hexagonal architecture components
from src.application.services.rag_hexagonal_service import RAGHexagonalService
from src.adapters.outbound.llm.mock_llm_adapter import MockLLMAdapter
from src.adapters.outbound.databases.vector.vector_adapter_factory import VectorAdapterFactory


# 프로덕션 설정 공유를 위한 import
try:
    from src.shared.config.config_manager import ConfigManager
    CONFIG_AVAILABLE = True
except ImportError:
    CONFIG_AVAILABLE = False
    logger.warning("ConfigLoader not available, using fallback configuration")


class RAGDemoInterface:
    """RAG 데모를 위한 Gradio 인터페이스"""
    
    def __init__(self):
        # 프로덕션 설정 매니저 초기화
        self.config_manager = None
        if CONFIG_AVAILABLE:
            try:
                self.config_manager = ConfigManager()
                logger.info("✅ Production config manager initialized")
            except Exception as e:
                logger.warning(f"⚠️ Failed to initialize config manager: {e}")
        
        # Initialize hexagonal architecture components
        self.llm_adapter = MockLLMAdapter()
        
        # 벡터스토어 팩토리 (데모 환경용)
        self.vector_adapter_factory = VectorAdapterFactory(environment="demo")
        
        
        
        # 벡터 어댑터 생성 (RAGService 호환용)
        self.vector_adapter = self.vector_adapter_factory.create_vector_adapter()
        
        self.rag_service = RAGHexagonalService(
            vector_store=self.vector_adapter,  # Vector Adapter 사용
            llm_port=self.llm_adapter,
            config_manager=self.config_manager  # 프로덕션 설정 공유
        )
        self.initialized = False
        self.sample_data_loaded = False
        logger.info("✅ Hexagonal RAG Demo initialized with production config sharing")

    async def initialize(self):
        """비동기 초기화 (임베딩 모델 로드)"""
        if self.initialized:
            return
            
        try:
            logger.info("🔄 Initializing LLM and Vector adapters...")
            await self.llm_adapter.initialize()
            
            self.initialized = True
            logger.info("✅ All adapters initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize adapters: {e}")
            raise

    def load_sample_data(self) -> str:
        """sampledata 디렉토리에서 샘플 데이터 로드 (문서 로드만)"""
        try:
            # sampledata 디렉토리 경로 설정
            sample_path = Path("sampledata")
            
            if not sample_path.exists():
                return "<div style='text-align: center; color: #dc3545; padding: 20px; font-weight: 600;'>❌ sampledata 디렉토리를 찾을 수 없습니다</div>"
            
            logger.info(f"📚 샘플 데이터 로드 시작: {sample_path}")
            sample_data = []
            
            # 핵심 문서만 선택 (경량화)
            core_files = [
                ("ai-portfolio.md", "AI 포트폴리오 프로젝트 개요"),
                ("qa_architecture.md", "헥사고날 아키텍처 Q&A"),
                ("qa_ai-services.md", "RAG 시스템 Q&A")
            ]
            
            for filename, title in core_files:
                file_path = sample_path / filename
                logger.info(f"🔍 파일 확인: {file_path} (존재: {file_path.exists()})")
                if file_path.exists():
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # 데모에서는 전체 내용 로드 (제한 없음)
                        sample_data.append({
                            "content": content,
                            "source": filename,
                            "title": title
                        })
                        logger.info(f"✅ {title} 로드 완료 ({len(content)} chars)")
                else:
                    logger.warning(f"⚠️  파일을 찾을 수 없음: {file_path}")
            
            logger.info(f"📊 총 {len(sample_data)}개의 샘플 데이터 준비됨")
            
            if not sample_data:
                return "<div style='text-align: center; color: #dc3545; padding: 20px; font-weight: 600;'>❌ 샘플 데이터를 찾을 수 없습니다</div>"
            
            # 샘플 데이터를 메모리에 저장 (문서 추가는 하지 않음)
            self.sample_data = sample_data
            self.sample_data_loaded = True
            
            # 결과 요약 생성
            result_summary = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <h3 style="color: #2c3e50; margin-bottom: 20px;">📚 샘플 데이터 로드 완료!</h3>
                <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%); border: 2px solid #4caf50; border-radius: 12px; padding: 20px;">
                    <h4 style="margin: 0 0 15px 0; color: #2c3e50;">✅ 로드된 문서 목록:</h4>
            """
            for data in sample_data:
                result_summary += f"""
                    <div style="background: rgba(255,255,255,0.8); border-radius: 8px; padding: 12px; margin-bottom: 8px;">
                        <div style="font-weight: 600; color: #2c3e50;">📖 {data['title']}</div>
                        <div style="font-size: 12px; color: #666;">📏 크기: {len(data['content']):,} 문자</div>
                    </div>
                """
            result_summary += """
                </div>
            </div>
            """
            
            return result_summary
            
        except Exception as e:
            logger.error(f"샘플 데이터 로드 중 오류 발생: {e}")
            return f"<div style='text-align: center; color: #dc3545; padding: 20px; font-weight: 600;'>❌ 샘플 데이터 로드 실패: {str(e)}</div>"

    def get_all_documents_preview(self) -> str:
        """모든 로드된 문서 통합 미리보기 (카드 형태)"""
        all_documents = []
        
        # 샘플 데이터 추가
        if hasattr(self, 'sample_data') and self.sample_data:
            for data in self.sample_data:
                all_documents.append({
                    **data,
                    'type': 'sample_data',
                    'icon': '📖',
                    'bg_color': '#e8f5e8',
                    'border_color': '#4caf50'
                })
        
        # 수동 문서 추가
        if hasattr(self, 'manual_documents') and self.manual_documents:
            for data in self.manual_documents:
                all_documents.append({
                    **data,
                    'type': 'manual_input',
                    'icon': '✍️',
                    'bg_color': '#fff3e0',
                    'border_color': '#ff9800'
                })
        
        if not all_documents:
            return "<div style='text-align: center; color: #6c757d; padding: 40px; font-weight: 600;'>📭 아직 로드된 문서가 없습니다.</div>"
        
        # HTML 카드 형태로 출력
        html_output = f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="display: flex; overflow-x: auto; gap: 20px; padding-bottom: 10px;">
        """
        
        for i, data in enumerate(all_documents, 1):
            # 내용 미리보기 (최대 200자)
            content_preview = data['content'][:200] + "..." if len(data['content']) > 200 else data['content']
            
            html_output += f"""
            <div style="
                background: linear-gradient(135deg, {data['bg_color']} 0%, {data['bg_color'].replace('e8', 'f0').replace('f3', 'f8')} 100%);
                border: 2px solid {data['border_color']};
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                transition: transform 0.2s ease-in-out;
                min-width: 350px;
                flex-shrink: 0;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <span style="font-size: 24px; margin-right: 8px;">{data['icon']}</span>
                    <h4 style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 600;">
                        {data['title']}
                    </h4>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                        <strong>📁 출처:</strong> {data['source']}
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                        <strong>📏 크기:</strong> {len(data['content']):,} 문자
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                        <strong>🏷️ 타입:</strong> {data['type']}
                    </div>
                </div>
                
                <div style="
                    background: rgba(255,255,255,0.8);
                    border-radius: 8px;
                    padding: 12px;
                    font-size: 13px;
                    line-height: 1.4;
                    color: #555;
                    max-height: 100px;
                    overflow: hidden;
                ">
                    {content_preview}
                </div>
            </div>
            """
        
        html_output += """
            </div>
        </div>
        """
        
        return html_output

    def preview_sample_data(self) -> str:
        """로드된 샘플 데이터 미리보기 (카드 형태)"""
        if not hasattr(self, 'sample_data') or not self.sample_data:
            return "<div style='text-align: center; color: #dc3545; padding: 20px; font-weight: 600;'>❌ 먼저 샘플 데이터를 로드해주세요.</div>"
        
        # HTML 카드 형태로 출력
        html_output = """
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 20px;">📖 샘플 데이터 미리보기</h3>
            <div style="display: flex; overflow-x: auto; gap: 20px; padding-bottom: 10px;">
        """
        
        for i, data in enumerate(self.sample_data, 1):
            # 내용 미리보기 (최대 200자)
            content_preview = data['content'][:200] + "..." if len(data['content']) > 200 else data['content']
            
            html_output += f"""
            <div style="
                background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
                border: 2px solid #4caf50;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                transition: transform 0.2s ease-in-out;
                min-width: 350px;
                flex-shrink: 0;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <span style="font-size: 24px; margin-right: 8px;">📖</span>
                    <h4 style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 600;">
                        {data['title']}
                    </h4>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                        <strong>📁 파일:</strong> {data['source']}
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                        <strong>📏 크기:</strong> {len(data['content']):,} 문자
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                        <strong>🏷️ 타입:</strong> 샘플 데이터
                    </div>
                </div>
                
                <div style="
                    background: rgba(255,255,255,0.8);
                    border-radius: 8px;
                    padding: 12px;
                    font-size: 13px;
                    line-height: 1.4;
                    color: #555;
                    max-height: 100px;
                    overflow: hidden;
                ">
                    {content_preview}
                </div>
            </div>
            """
        
        html_output += """
            </div>
        </div>
        """
        
        return html_output

    def preview_manual_documents(self) -> str:
        """로드된 수동 문서 미리보기 (카드 형태)"""
        if not hasattr(self, 'manual_documents') or not self.manual_documents:
            return "<div style='text-align: center; color: #dc3545; padding: 20px; font-weight: 600;'>❌ 먼저 수동 문서를 로드해주세요.</div>"
        
        # HTML 카드 형태로 출력
        html_output = """
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 20px;">✍️ 수동 입력 문서 미리보기</h3>
            <div style="display: flex; overflow-x: auto; gap: 20px; padding-bottom: 10px;">
        """
        
        for i, data in enumerate(self.manual_documents, 1):
            # 내용 미리보기 (최대 200자)
            content_preview = data['content'][:200] + "..." if len(data['content']) > 200 else data['content']
            
            html_output += f"""
            <div style="
                background: linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%);
                border: 2px solid #ff9800;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                transition: transform 0.2s ease-in-out;
                min-width: 350px;
                flex-shrink: 0;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <span style="font-size: 24px; margin-right: 8px;">✍️</span>
                    <h4 style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 600;">
                        {data['title']}
                    </h4>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                        <strong>📁 출처:</strong> {data['source']}
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                        <strong>📏 크기:</strong> {len(data['content']):,} 문자
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                        <strong>🏷️ 타입:</strong> 수동 입력
                    </div>
                </div>
                
                <div style="
                    background: rgba(255,255,255,0.8);
                    border-radius: 8px;
                    padding: 12px;
                    font-size: 13px;
                    line-height: 1.4;
                    color: #555;
                    max-height: 100px;
                    overflow: hidden;
                ">
                    {content_preview}
                </div>
            </div>
            """
        
        html_output += """
            </div>
        </div>
        """
        
        return html_output

    def add_sample_data_to_knowledge_base(self) -> str:
        """로드된 샘플 데이터를 지식 베이스에 추가"""
        if not hasattr(self, 'sample_data') or not self.sample_data:
            return "<div style='text-align: center; color: #dc3545; padding: 20px; font-weight: 600;'>❌ 먼저 샘플 데이터를 로드해주세요.</div>"
        
        try:
            async def add_all_samples():
                await self.initialize()
                results = []
                for data in self.sample_data:
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
                
                return "\n".join(results)
            
            result_text = asyncio.run(add_all_samples())
            
            # HTML로 포맷팅
            html_result = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <h3 style="color: #2c3e50; margin-bottom: 20px;">➕ 샘플 데이터 지식 베이스 추가 결과</h3>
                <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%); border: 2px solid #4caf50; border-radius: 12px; padding: 20px;">
            """
            
            for line in result_text.split('\n'):
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

    def get_sample_queries(self) -> List[str]:
        """샘플 검색 쿼리 목록 반환 (경량화)"""
        return [
            "헥사고날 아키텍처는 어떻게 구현되었나요?",
            "RAG 시스템의 핵심 구성 요소는 무엇인가요?",
            "프로젝트의 주요 목표는 무엇인가요?",
            "어떤 기술 스택을 사용했나요?"
        ]
    
    async def add_document(self, content: str, source: str = "manual_input") -> str:
        """메모리에 문서 로드 (지식 베이스 추가 없음)"""
        if not content.strip():
            return "<div style='text-align: center; color: #dc3545; padding: 20px; font-weight: 600;'>❌ 내용을 입력해주세요</div>"
        
        try:
            # 메모리에 문서 저장
            if not hasattr(self, 'manual_documents'):
                self.manual_documents = []
            
            document_data = {
                "content": content.strip(),
                "source": source,
                "title": f"수동 입력: {source}",
                "timestamp": "demo"
            }
            
            self.manual_documents.append(document_data)
            
            return f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <div style="background: linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%); border: 2px solid #ff9800; border-radius: 12px; padding: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #2c3e50;">✅ 문서 로드 완료!</h4>
                    <div style="color: #495057;">
                        <div><strong>📄 제목:</strong> {document_data['title']}</div>
                        <div><strong>📏 크기:</strong> {len(content.strip()):,} 문자</div>
                        <div><strong>📁 출처:</strong> {source}</div>
                    </div>
                </div>
            </div>
            """
                
        except Exception as e:
            logger.error(f"문서 로드 중 오류 발생: {e}")
            return f"<div style='text-align: center; color: #dc3545; padding: 20px; font-weight: 600;'>❌ 오류: {str(e)}</div>"

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
    
    async def clear_knowledge_base(self) -> str:
        """지식 베이스의 모든 문서 삭제"""
        try:
            result = await self.rag_service.clear_storage()
            if result.get("success"):
                return "✅ 지식 베이스가 성공적으로 삭제되었습니다"
            else:
                return f"❌ 삭제 실패: {result.get('error', 'Unknown error')}"
        except Exception as e:
            return f"❌ 오류: {str(e)}"
    
    async def get_status(self) -> str:
        """시스템 상태 가져오기"""
        try:
            status = await self.rag_service.get_status()
            
            # 실제 사용 중인 어댑터 정보 가져오기
            llm_info = await self.llm_adapter.get_info()
            vector_info = await self.vector_adapter.get_info()
            
            return f"""
📊 **시스템 상태**

**🤖 LLM 서비스:**
• 모델: {llm_info.get('model_name', 'MockLLM')}
• 상태: {'✅ 준비됨' if status.get('llm_available') else '❌ 사용 불가'}
• 타입: {llm_info.get('type', 'Mock')}

**🔍 벡터 스토어:**
• 스토어: {vector_info.get('store_name', 'MemoryVector')}
• 상태: {'✅ 준비됨' if status.get('vector_store_available') else '❌ 사용 불가'}
• 환경: {self.vector_adapter_factory.environment}
• 저장된 벡터: {vector_info.get('stored_vectors', 0)}개

**🔤 임베딩 서비스:**
• 모델: {vector_info.get('embedding_model', 'sentence-transformers/all-MiniLM-L6-v2')}
• 차원: {vector_info.get('dimensions', 384)}
• 상태: {'✅ 준비됨' if vector_info.get('embedding_available', True) else '❌ 사용 불가'}
            """
        except Exception as e:
            return f"❌ 상태 가져오기 오류: {str(e)}"

    async def view_all_documents(self) -> str:
        """데모: 저장된 모든 문서 보기 (카드 형태)"""
        try:
            documents = await self.vector_adapter.get_all_documents()
            
            if not documents:
                return "<div style='text-align: center; color: #6c757d; padding: 20px; font-weight: 600;'>📭 저장된 문서가 없습니다.</div>"
            
            # HTML 카드 형태로 출력
            html_output = f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <h3 style="color: #2c3e50; margin-bottom: 20px;">📚 저장된 문서 ({len(documents)}개)</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            """
            
            for i, doc in enumerate(documents, 1):
                # 문서 타입에 따른 아이콘과 색상
                doc_type = doc.get('metadata', {}).get('type', 'unknown')
                if doc_type == 'sample_data':
                    icon = "📖"
                    bg_color = "#e8f5e8"
                    border_color = "#4caf50"
                elif 'manual' in doc.get('source', ''):
                    icon = "✍️"
                    bg_color = "#fff3e0"
                    border_color = "#ff9800"
                else:
                    icon = "📄"
                    bg_color = "#f0f8ff"
                    border_color = "#2196f3"
                
                # 생성일 포맷팅
                created_at = doc.get('created_at', 'N/A')
                if created_at and created_at != 'N/A':
                    try:
                        from datetime import datetime
                        dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                        formatted_date = dt.strftime('%Y-%m-%d %H:%M')
                    except:
                        formatted_date = created_at[:19] if len(created_at) > 19 else created_at
                else:
                    formatted_date = 'N/A'
                
                # 내용 미리보기 (최대 150자)
                content_preview = doc.get('content_preview', '내용 없음')
                if len(content_preview) > 150:
                    content_preview = content_preview[:150] + "..."
                
                html_output += f"""
                <div style="
                    background: {bg_color};
                    border: 2px solid {border_color};
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    transition: transform 0.2s ease-in-out;
                    cursor: pointer;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 24px; margin-right: 8px;">{icon}</span>
                        <h4 style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 600;">
                            {doc.get('source', 'Unknown')}
                        </h4>
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                            <strong>📏 크기:</strong> {doc.get('content_length', 0):,} 문자
                        </div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                            <strong>🆔 ID:</strong> {doc.get('id', 'N/A')[:12]}...
                        </div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                            <strong>📅 생성일:</strong> {formatted_date}
                        </div>
                        {f'<div style="font-size: 12px; color: #666; margin-bottom: 4px;"><strong>🏷️ 타입:</strong> {doc_type}</div>' if doc_type != 'unknown' else ''}
                    </div>
                    
                    <div style="
                        background: rgba(255,255,255,0.7);
                        border-radius: 8px;
                        padding: 12px;
                        font-size: 13px;
                        line-height: 1.4;
                        color: #555;
                        max-height: 80px;
                        overflow: hidden;
                    ">
                        {content_preview}
                    </div>
                </div>
                """
            
            html_output += """
                </div>
            </div>
            """
            
            return html_output
            
        except Exception as e:
            logger.error(f"전체 문서 조회 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}"

    async def get_embedding_analysis(self) -> str:
        """데모: 임베딩 분석 정보"""
        try:
            info = await self.vector_adapter.get_embedding_info()
            
            if not info.get("embeddings_available"):
                return "❌ 임베딩이 사용 불가능합니다."
                
            output = f"""
🔬 **임베딩 분석**

**모델**: {info['model_name']}
**문서 수**: {info['document_count']}
**임베딩 차원**: {info['embedding_dimensions']}
**임베딩 형태**: {info['embedding_shape']}
**샘플 벡터 크기**: {info['sample_embedding_norm']:.4f}
            """
            
            return output
            
        except Exception as e:
            logger.error(f"임베딩 분석 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}"

    async def get_memory_info(self) -> str:
        """메모리 사용량 및 상태 정보"""
        try:
            import psutil
            import gc
            
            # 시스템 메모리 정보
            memory = psutil.virtual_memory()
            swap = psutil.swap_memory()
            
            # 가비지 컬렉터 정보
            gc_stats = gc.get_stats()
            
            # 프로세스 메모리 정보
            process = psutil.Process()
            process_memory = process.memory_info()
            
            output = f"""
💾 **시스템 메모리 상태**

**전체 메모리:**
• 총 메모리: {memory.total / (1024**3):.2f} GB
• 사용 가능: {memory.available / (1024**3):.2f} GB
• 사용률: {memory.percent:.1f}%
• 사용 중: {memory.used / (1024**3):.2f} GB

**스왑 메모리:**
• 총 스왑: {swap.total / (1024**3):.2f} GB
• 사용 중: {swap.used / (1024**3):.2f} GB
• 사용률: {swap.percent:.1f}%

**현재 프로세스:**
• RSS (물리 메모리): {process_memory.rss / (1024**2):.2f} MB
• VMS (가상 메모리): {process_memory.vms / (1024**2):.2f} MB

**가비지 컬렉터:**
• 세대 0: {gc_stats[0]['collections']}회 수집
• 세대 1: {gc_stats[1]['collections']}회 수집
• 세대 2: {gc_stats[2]['collections']}회 수집
            """
            
            return output
            
        except Exception as e:
            logger.error(f"메모리 정보 가져오기 중 오류 발생: {e}")
            return f"❌ 메모리 정보 가져오기 실패: {str(e)}"

    async def get_chunk_analysis(self) -> str:
        """청크 분석 정보"""
        try:
            # 모든 문서의 청크 정보 가져오기
            documents = await self.vector_adapter.get_all_documents()
            
            if not documents:
                return "📭 저장된 문서가 없습니다."
            
            # 청크 통계 계산
            total_chunks = 0
            chunk_lengths = []
            chunk_sources = {}
            
            for doc in documents:
                chunks = await self.vector_adapter.get_document_chunks(doc['id'])
                total_chunks += len(chunks)
                
                for chunk in chunks:
                    chunk_lengths.append(len(chunk.get('content', '')))
                    source = chunk.get('source', 'unknown')
                    chunk_sources[source] = chunk_sources.get(source, 0) + 1
            
            if not chunk_lengths:
                return "📭 청크 정보를 찾을 수 없습니다."
            
            avg_length = sum(chunk_lengths) / len(chunk_lengths)
            min_length = min(chunk_lengths)
            max_length = max(chunk_lengths)
            
            output = f"""
📄 **청크 분석**

**기본 통계:**
• 총 문서 수: {len(documents)}개
• 총 청크 수: {total_chunks}개
• 평균 청크 길이: {avg_length:.1f} 문자
• 최소 청크 길이: {min_length} 문자
• 최대 청크 길이: {max_length} 문자

**출처별 청크 분포:**
"""
            
            for source, count in sorted(chunk_sources.items(), key=lambda x: x[1], reverse=True):
                output += f"• {source}: {count}개 청크\n"
            
            # 길이 분포 분석
            short_chunks = len([l for l in chunk_lengths if l < 100])
            medium_chunks = len([l for l in chunk_lengths if 100 <= l < 500])
            long_chunks = len([l for l in chunk_lengths if l >= 500])
            
            output += f"""
**길이 분포:**
• 짧은 청크 (<100자): {short_chunks}개 ({short_chunks/total_chunks*100:.1f}%)
• 중간 청크 (100-500자): {medium_chunks}개 ({medium_chunks/total_chunks*100:.1f}%)
• 긴 청크 (≥500자): {long_chunks}개 ({long_chunks/total_chunks*100:.1f}%)
            """
            
            return output
            
        except Exception as e:
            logger.error(f"청크 분석 중 오류 발생: {e}")
            return f"❌ 청크 분석 실패: {str(e)}"

    async def get_vector_store_detailed_info(self) -> str:
        """벡터스토어 상세 정보"""
        try:
            # 기본 정보
            info = await self.vector_adapter.get_info()
            embedding_info = await self.vector_adapter.get_embedding_info()
            
            # 저장된 문서 정보
            documents = await self.vector_adapter.get_all_documents()
            
            # 벡터 통계
            total_vectors = 0
            vector_dimensions = 0
            if documents:
                total_vectors = sum(len(await self.vector_adapter.get_document_chunks(doc['id'])) for doc in documents)
                if documents:
                    sample_chunks = await self.vector_adapter.get_document_chunks(documents[0]['id'])
                    if sample_chunks:
                        vector_dimensions = len(sample_chunks[0].get('embedding', []))
            
            output = f"""
🔍 **벡터스토어 상세 정보**

**스토어 정보:**
• 스토어 이름: {info.get('store_name', 'Unknown')}
• 스토어 타입: {info.get('store_type', 'Unknown')}
• 초기화 상태: {'✅ 초기화됨' if info.get('initialized', False) else '❌ 초기화 안됨'}

**임베딩 모델:**
• 모델명: {embedding_info.get('model_name', 'Unknown')}
• 차원: {embedding_info.get('embedding_dimensions', 0)}
• 모델 형태: {embedding_info.get('embedding_shape', 'Unknown')}
• 샘플 벡터 크기: {embedding_info.get('sample_embedding_norm', 0):.4f}

**저장된 데이터:**
• 총 문서 수: {len(documents)}개
• 총 벡터 수: {total_vectors}개
• 평균 문서 길이: {sum(len(doc.get('content', '')) for doc in documents) / len(documents) if documents else 0:.1f} 문자

**성능 정보:**
• 임베딩 생성 가능: {'✅ 가능' if embedding_info.get('embeddings_available', False) else '❌ 불가능'}
• 벡터 검색 가능: {'✅ 가능' if info.get('search_available', True) else '❌ 불가능'}
• 벡터 저장 가능: {'✅ 가능' if info.get('storage_available', True) else '❌ 불가능'}
            """
            
            return output
            
        except Exception as e:
            logger.error(f"벡터스토어 상세 정보 가져오기 중 오류 발생: {e}")
            return f"❌ 벡터스토어 상세 정보 가져오기 실패: {str(e)}"

    async def get_memory_content(self) -> str:
        """메모리에 저장된 실제 내용 확인"""
        try:
            # 메모리 어댑터에서 직접 데이터 가져오기
            if hasattr(self.vector_adapter, 'get_memory_content'):
                content = await self.vector_adapter.get_memory_content()
                return content
            
            # 기본 메모리 내용 (문서 목록)
            documents = await self.vector_adapter.get_all_documents()
            
            if not documents:
                return "📭 메모리에 저장된 내용이 없습니다."
            
            output = f"💾 **메모리에 저장된 내용 ({len(documents)}개 문서)**\n\n"
            
            for i, doc in enumerate(documents, 1):
                output += f"**{i}. 문서 ID: {doc['id']}**\n"
                output += f"• 출처: {doc['source']}\n"
                output += f"• 길이: {doc['content_length']} 문자\n"
                output += f"• 생성일: {doc['created_at'][:19] if doc['created_at'] else 'N/A'}\n"
                output += f"• 내용 미리보기:\n{doc['content_preview'][:300]}...\n\n"
                
                # 청크 정보도 포함
                chunks = await self.vector_adapter.get_document_chunks(doc['id'])
                output += f"  📄 청크 수: {len(chunks)}개\n"
                for j, chunk in enumerate(chunks[:3], 1):  # 처음 3개 청크만
                    output += f"    • 청크 {j}: {chunk.get('content', '')[:100]}...\n"
                output += "\n"
            
            return output
            
        except Exception as e:
            logger.error(f"메모리 내용 가져오기 중 오류 발생: {e}")
            return f"❌ 메모리 내용 가져오기 실패: {str(e)}"

    async def get_chunk_content(self) -> str:
        """청크의 실제 내용 확인"""
        try:
            documents = await self.vector_adapter.get_all_documents()
            
            if not documents:
                return "📭 저장된 문서가 없습니다."
            
            output = f"📄 **청크 내용 확인**\n\n"
            
            for i, doc in enumerate(documents, 1):
                chunks = await self.vector_adapter.get_document_chunks(doc['id'])
                
                output += f"**문서 {i}: {doc['source']}** (ID: {doc['id'][:8]}...)\n"
                output += f"총 {len(chunks)}개 청크\n\n"
                
                for j, chunk in enumerate(chunks, 1):
                    output += f"**청크 {j}:**\n"
                    output += f"• 길이: {len(chunk.get('content', ''))} 문자\n"
                    output += f"• 내용:\n{chunk.get('content', '')}\n\n"
                    
                    # 처음 2개 문서의 처음 3개 청크만 표시
                    if i > 2 or j > 3:
                        break
                
                if i > 2:
                    output += "... (더 많은 문서가 있습니다)\n"
                    break
                
                output += "---\n\n"
            
            return output
            
        except Exception as e:
            logger.error(f"청크 내용 가져오기 중 오류 발생: {e}")
            return f"❌ 청크 내용 가져오기 실패: {str(e)}"

    async def get_vector_store_content(self) -> str:
        """벡터스토어의 실제 내용 확인"""
        try:
            documents = await self.vector_adapter.get_all_documents()
            
            if not documents:
                return "📭 벡터스토어에 저장된 내용이 없습니다."
            
            output = f"🔍 **벡터스토어 내용 확인**\n\n"
            
            for i, doc in enumerate(documents, 1):
                chunks = await self.vector_adapter.get_document_chunks(doc['id'])
                
                output += f"**문서 {i}: {doc['source']}**\n"
                output += f"• 문서 ID: {doc['id']}\n"
                output += f"• 전체 내용 길이: {doc['content_length']} 문자\n"
                output += f"• 청크 수: {len(chunks)}개\n"
                output += f"• 생성일: {doc['created_at'][:19] if doc['created_at'] else 'N/A'}\n\n"
                
                # 벡터 정보 포함
                if chunks:
                    sample_chunk = chunks[0]
                    embedding = sample_chunk.get('embedding', [])
                    output += f"**벡터 정보:**\n"
                    output += f"• 벡터 차원: {len(embedding)}\n"
                    output += f"• 샘플 벡터 (처음 10개): {embedding[:10]}\n"
                    output += f"• 벡터 크기: {len(embedding)} 차원\n\n"
                
                # 청크 상세 정보
                output += f"**청크 상세 정보:**\n"
                for j, chunk in enumerate(chunks, 1):
                    output += f"• 청크 {j}: {len(chunk.get('content', ''))} 문자\n"
                    output += f"  내용: {chunk.get('content', '')[:200]}...\n"
                    if j >= 3:  # 처음 3개 청크만
                        break
                
                output += "\n---\n\n"
                
                if i >= 3:  # 처음 3개 문서만
                    output += "... (더 많은 문서가 있습니다)\n"
                    break
            
            return output
            
        except Exception as e:
            logger.error(f"벡터스토어 내용 가져오기 중 오류 발생: {e}")
            return f"❌ 벡터스토어 내용 가져오기 실패: {str(e)}"

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

    # === 새로운 TextSplitter 관련 메서드들 ===
    
    def get_document_list(self) -> str:
        """메모리에 로드된 문서 목록을 HTML 형태로 반환"""
        all_documents = []
        
        # 샘플 데이터 추가
        if hasattr(self, 'sample_data') and self.sample_data:
            for data in self.sample_data:
                all_documents.append({
                    **data,
                    'type': 'sample_data',
                    'icon': '📖',
                    'bg_color': '#e8f5e8',
                    'border_color': '#4caf50'
                })
        
        # 수동 문서 추가
        if hasattr(self, 'manual_documents') and self.manual_documents:
            for data in self.manual_documents:
                all_documents.append({
                    **data,
                    'type': 'manual_input',
                    'icon': '✍️',
                    'bg_color': '#fff3e0',
                    'border_color': '#ff9800'
                })
        
        if not all_documents:
            return "<div style='text-align: center; color: #6c757d; padding: 20px; font-weight: 600;'>📭 아직 로드된 문서가 없습니다. DocumentLoad 탭에서 문서를 먼저 로드해주세요.</div>"
        
        # HTML 목록 형태로 출력
        html_output = f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 20px;">📋 로드된 문서 목록 (총 {len(all_documents)}개)</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
        """
        
        for i, data in enumerate(all_documents, 1):
            html_output += f"""
            <div style="
                background: linear-gradient(135deg, {data['bg_color']} 0%, {data['bg_color'].replace('e8', 'f0').replace('f3', 'f8')} 100%);
                border: 2px solid {data['border_color']};
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 20px; margin-right: 8px;">{data['icon']}</span>
                    <h4 style="margin: 0; color: #2c3e50; font-size: 14px; font-weight: 600;">
                        {data['title']}
                    </h4>
                </div>
                
                <div style="font-size: 12px; color: #666; line-height: 1.4;">
                    <div><strong>📁 출처:</strong> {data['source']}</div>
                    <div><strong>📏 크기:</strong> {len(data['content']):,} 문자</div>
                    <div><strong>🏷️ 타입:</strong> {data['type']}</div>
                </div>
            </div>
            """
        
        html_output += """
            </div>
        </div>
        """
        
        return html_output

    def get_document_choices(self) -> List[str]:
        """선택 가능한 문서 목록 반환"""
        choices = []
        
        # 샘플 데이터 추가
        if hasattr(self, 'sample_data') and self.sample_data:
            for data in self.sample_data:
                choices.append(f"📖 {data['title']} ({data['source']})")
        
        # 수동 문서 추가
        if hasattr(self, 'manual_documents') and self.manual_documents:
            for data in self.manual_documents:
                choices.append(f"✍️ {data['title']} ({data['source']})")
        
        return choices

    def update_chunking_settings(self, preset: str, chunk_size: int, chunk_overlap: int) -> str:
        """청킹 설정 업데이트"""
        # ConfigManager에서 base.yaml 설정 로드 (안전하게 처리)
        base_chunk_size = 500  # 기본값
        base_chunk_overlap = 75  # 기본값
        
        if self.config_manager:
            try:
                base_config = self.config_manager.get_config('base')
                if base_config:
                    base_chunk_size = base_config.get('rag', {}).get('chunk_size', 500)
                    base_chunk_overlap = base_config.get('rag', {}).get('chunk_overlap', 75)
            except Exception as e:
                logger.warning(f"⚠️ ConfigManager에서 base 설정을 가져올 수 없습니다: {e}")
        
        # 프리셋에 따른 설정 적용
        if preset == "기본 설정 (500/75)":  # base.yaml 설정에 맞춤
            chunk_size, chunk_overlap = base_chunk_size, base_chunk_overlap
        elif preset == "작은 청크 (300/50)":
            chunk_size, chunk_overlap = 300, 50
        elif preset == "큰 청크 (800/100)":
            chunk_size, chunk_overlap = 800, 100
        # "사용자 정의"인 경우 입력값 그대로 사용
        
        # 설정 저장
        self.current_chunk_settings = {
            'chunk_size': chunk_size,
            'chunk_overlap': chunk_overlap,
            'preset': preset
        }
        
        # HTML 형태로 현재 설정 반환
        return f"""
        <div style="padding: 10px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #007bff;">
            <strong>현재 설정:</strong><br>
            • 청크 크기: {chunk_size:,} 문자<br>
            • 청크 겹침: {chunk_overlap:,} 문자<br>
            • 분할 방식: 문장 단위<br>
            • 프리셋: {preset}<br>
            • 설정 소스: {preset if preset != "사용자 정의" else "사용자 입력"}
        </div>
        """

    def execute_chunking(self, document_selection: str, selected_document: str) -> Tuple[str, str]:
        """청킹 실행 및 결과 반환"""
        try:
            # 대상 문서 선택
            target_documents = []
            
            if document_selection == "전체 문서":
                # 모든 문서 선택
                if hasattr(self, 'sample_data') and self.sample_data:
                    target_documents.extend(self.sample_data)
                if hasattr(self, 'manual_documents') and self.manual_documents:
                    target_documents.extend(self.manual_documents)
            else:
                # 개별 문서 선택
                if selected_document:
                    # 선택된 문서 찾기
                    all_docs = []
                    if hasattr(self, 'sample_data') and self.sample_data:
                        all_docs.extend(self.sample_data)
                    if hasattr(self, 'manual_documents') and self.manual_documents:
                        all_docs.extend(self.manual_documents)
                    
                    for doc in all_docs:
                        if f"📖 {doc['title']} ({doc['source']})" == selected_document or f"✍️ {doc['title']} ({doc['source']})" == selected_document:
                            target_documents.append(doc)
                            break
            
            if not target_documents:
                return (
                    "<div style='text-align: center; color: #dc3545; padding: 20px; font-weight: 600;'>❌ 처리할 문서가 없습니다.</div>",
                    "❌ 처리할 문서가 없습니다."
                )
            
            # 청킹 설정 가져오기
            settings = getattr(self, 'current_chunk_settings', {
                'chunk_size': 500,
                'chunk_overlap': 75
            })
            
            chunk_size = settings['chunk_size']
            chunk_overlap = settings['chunk_overlap']
            
            # 청킹 실행
            all_chunks = []
            chunk_analysis = []
            
            for i, doc in enumerate(target_documents, 1):
                # 간단한 문장 단위 청킹 (실제로는 더 정교한 로직 필요)
                sentences = doc['content'].split('. ')
                chunks = []
                current_chunk = ""
                
                for sentence in sentences:
                    if len(current_chunk) + len(sentence) <= chunk_size:
                        current_chunk += sentence + ". "
                    else:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                        current_chunk = sentence + ". "
                
                if current_chunk:
                    chunks.append(current_chunk.strip())
                
                # 겹침 처리 (간단한 구현)
                if chunk_overlap > 0 and len(chunks) > 1:
                    overlapped_chunks = []
                    for j in range(len(chunks)):
                        if j == 0:
                            overlapped_chunks.append(chunks[j])
                        else:
                            # 이전 청크의 끝 부분을 현재 청크에 추가
                            prev_chunk = chunks[j-1]
                            overlap_text = prev_chunk[-chunk_overlap:] if len(prev_chunk) > chunk_overlap else prev_chunk
                            overlapped_chunk = overlap_text + " " + chunks[j]
                            overlapped_chunks.append(overlapped_chunk)
                    chunks = overlapped_chunks
                
                # 청크 정보 저장
                for j, chunk in enumerate(chunks):
                    chunk_info = {
                        'document_id': i,
                        'document_title': doc['title'],
                        'document_source': doc['source'],
                        'chunk_id': j + 1,
                        'content': chunk,
                        'length': len(chunk),
                        'type': doc.get('type', 'unknown')
                    }
                    all_chunks.append(chunk_info)
                
                # 분석 정보 추가
                chunk_analysis.append(f"📄 문서 {i}: {doc['title']}")
                chunk_analysis.append(f"   • 원본 크기: {len(doc['content']):,} 문자")
                chunk_analysis.append(f"   • 생성된 청크: {len(chunks)}개")
                chunk_analysis.append(f"   • 평균 청크 크기: {sum(len(c) for c in chunks) // len(chunks):,} 문자")
                chunk_analysis.append("")
            
            # 청킹 결과 저장
            self.chunking_results = {
                'chunks': all_chunks,
                'settings': settings,
                'total_chunks': len(all_chunks),
                'total_documents': len(target_documents)
            }
            
            # 상태 메시지 생성
            status_html = f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%); border: 2px solid #4caf50; border-radius: 12px; padding: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #2c3e50;">✅ 청킹 완료!</h4>
                    <div style="color: #495057;">
                        <div><strong>📄 처리된 문서:</strong> {len(target_documents)}개</div>
                        <div><strong>✂️ 생성된 청크:</strong> {len(all_chunks)}개</div>
                        <div><strong>⚙️ 청크 크기:</strong> {chunk_size:,} 문자</div>
                        <div><strong>🔄 청크 겹침:</strong> {chunk_overlap:,} 문자</div>
                    </div>
                </div>
            </div>
            """
            
            # 분석 결과 생성
            analysis_text = f"🔬 **청킹 분석 결과**\n\n"
            analysis_text += f"📊 **전체 요약:**\n"
            analysis_text += f"• 처리된 문서: {len(target_documents)}개\n"
            analysis_text += f"• 생성된 청크: {len(all_chunks)}개\n"
            analysis_text += f"• 청크 크기 설정: {chunk_size:,} 문자\n"
            analysis_text += f"• 청크 겹침 설정: {chunk_overlap:,} 문자\n\n"
            
            analysis_text += "📄 **문서별 상세 분석:**\n"
            analysis_text += "\n".join(chunk_analysis)
            
            return status_html, analysis_text
            
        except Exception as e:
            logger.error(f"청킹 실행 중 오류 발생: {e}")
            return (
                f"<div style='text-align: center; color: #dc3545; padding: 20px; font-weight: 600;'>❌ 청킹 실패: {str(e)}</div>",
                f"❌ 청킹 실패: {str(e)}"
            )

    def get_chunk_cards(self) -> str:
        """생성된 청크들을 카드 형태로 반환"""
        if not hasattr(self, 'chunking_results') or not self.chunking_results:
            return "<div style='text-align: center; color: #6c757d; padding: 40px; font-weight: 600;'>📭 청킹을 먼저 실행해주세요.</div>"
        
        chunks = self.chunking_results['chunks']
        
        html_output = f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 20px;">📄 생성된 청크들 (총 {len(chunks)}개)</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
        """
        
        for i, chunk in enumerate(chunks):
            # 내용 미리보기 (최대 150자)
            content_preview = chunk['content'][:150] + "..." if len(chunk['content']) > 150 else chunk['content']
            
            # 문서 타입에 따른 색상 설정
            if chunk['type'] == 'sample_data':
                bg_color = '#e8f5e8'
                border_color = '#4caf50'
                icon = '📖'
            else:
                bg_color = '#fff3e0'
                border_color = '#ff9800'
                icon = '✍️'
            
            html_output += f"""
            <div style="
                background: linear-gradient(135deg, {bg_color} 0%, {bg_color.replace('e8', 'f0').replace('f3', 'f8')} 100%);
                border: 2px solid {border_color};
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                cursor: pointer;
                transition: transform 0.2s ease-in-out;
            " onclick="showChunkContent({i})" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 18px;">{icon}</span>
                    <span style="font-size: 12px; color: #666; background: rgba(255,255,255,0.8); padding: 2px 6px; border-radius: 4px;">
                        청크 {chunk['chunk_id']}
                    </span>
                </div>
                
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                    <div><strong>📄 문서:</strong> {chunk['document_title']}</div>
                    <div><strong>📏 크기:</strong> {chunk['length']:,} 문자</div>
                </div>
                
                <div style="
                    background: rgba(255,255,255,0.8);
                    border-radius: 6px;
                    padding: 10px;
                    font-size: 12px;
                    line-height: 1.4;
                    color: #555;
                    max-height: 80px;
                    overflow: hidden;
                ">
                    {content_preview}
                </div>
            </div>
            """
        
        html_output += """
            </div>
            <script>
            function showChunkContent(chunkIndex) {
                // 이 함수는 Gradio의 JavaScript 이벤트와 연동되어야 함
                console.log('Chunk clicked:', chunkIndex);
            }
            </script>
        </div>
        """
        
        return html_output

    def get_chunk_content(self, chunk_index: int) -> str:
        """특정 청크의 전체 내용 반환"""
        if not hasattr(self, 'chunking_results') or not self.chunking_results:
            return "❌ 청킹을 먼저 실행해주세요."
        
        chunks = self.chunking_results['chunks']
        
        if chunk_index < 0 or chunk_index >= len(chunks):
            return "❌ 잘못된 청크 인덱스입니다."
        
        chunk = chunks[chunk_index]
        
        return f"""📄 **청크 상세 내용**

**문서 정보:**
• 문서 제목: {chunk['document_title']}
• 문서 출처: {chunk['document_source']}
• 청크 ID: {chunk['chunk_id']}
• 청크 크기: {chunk['length']:,} 문자
• 문서 타입: {chunk['type']}

**청크 내용:**
{chunk['content']}"""




def create_demo_interface() -> gr.Blocks:
    """Gradio 데모 인터페이스 생성"""
    
    demo_controller = RAGDemoInterface()
    
    with gr.Blocks(
        title="AI 포트폴리오 RAG 데모",
        theme=gr.themes.Soft(),
        css="""
        .gradio-container {
            max-width: 1800px !important;
            margin: 0 auto !important;
        }
        .tab-nav {
            justify-content: center !important;
        }
        .contain {
            max-width: none !important;
            margin: 0 auto !important;
        }
        .card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 16px;
            margin: 8px 0;
            background: #f8f9fa;
        }
        .feature-card {
            border: 1px solid #007bff;
            border-radius: 8px;
            padding: 12px;
            margin: 4px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .usage-card {
            border: 1px solid #28a745;
            border-radius: 8px;
            padding: 12px;
            margin: 4px;
            background: linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status-card {
            border: 1px solid #17a2b8;
            border-radius: 8px;
            padding: 12px;
            margin: 4px;
            background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        """
    ) as demo:
        
        gr.Markdown("""
        # 🚀 AI 포트폴리오 RAG 데모
        **RAG(Retrieval-Augmented Generation) 과정을 단계별로 체험해보세요**
        """)
        
        with gr.Row():
            # 왼쪽: 사용 방법 카드
            with gr.Column(scale=1):
                gr.Markdown("""
                <div class="usage-card" style="border: 1px solid #28a745; border-radius: 8px; padding: 12px; margin: 4px; background: linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3>🎯 RAG 과정 가이드</h3>
                    <ol style="margin: 8px 0; padding-left: 20px;">
                        <li><strong>📄 DocumentLoad</strong>: 문서를 로드하고 준비합니다</li>
                        <li><strong>✂️ Textsplitter</strong>: 문서를 적절한 크기로 분할합니다</li>
                        <li><strong>🔢 Embedding/VectorStore</strong>: 텍스트를 벡터로 변환하고 저장합니다</li>
                        <li><strong>🔍 Retriever</strong>: 관련 문서를 검색하고 찾습니다</li>
                        <li><strong>📊 Data확인</strong>: 각 단계의 결과를 확인합니다</li>
                    </ol>
                </div>
                """)
            
            # 오른쪽: 시스템 정보 카드 (동적 업데이트)
            with gr.Column(scale=1):
                system_status_html = gr.HTML(
                    value="""
                    <div class="status-card" style="border: 1px solid #17a2b8; border-radius: 8px; padding: 12px; margin: 4px; background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%); box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 300px; width: 100%;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <h3 style="margin: 0;">📊 시스템 정보</h3>
                            <span style="font-size: 16px;" title="새로고침">🔄</span>
                        </div>
                        <div style="font-size: 14px; line-height: 1.4;">
                            <div style="margin-bottom: 8px;">
                                <strong>📄 문서 관리:</strong><br>
                                • 저장된 문서: <strong>로딩 중...</strong><br>
                                • 벡터 임베딩: <strong>로딩 중...</strong>
                            </div>
                            
                            <div style="margin-bottom: 8px;">
                                <strong>🤖 LLM 서비스:</strong><br>
                                <strong>로딩 중...</strong>
                            </div>
                            
                            <div style="margin-bottom: 8px;">
                                <strong>🔍 벡터 스토어:</strong><br>
                                <strong>로딩 중...</strong>
                            </div>
                            
                            <div style="margin-bottom: 8px;">
                                <strong>🔤 임베딩 서비스:</strong><br>
                                <strong>로딩 중...</strong>
                            </div>
                        </div>
                    </div>
                    """,
                    label="시스템 상태"
                )
                
                # 시스템 상태 새로고침 버튼
                refresh_status_btn = gr.Button("🔄 시스템 상태 새로고침", variant="secondary", size="sm")
        
        # === 1. DocumentLoad 탭 ===
        with gr.Tab("📄 DocumentLoad"):
            with gr.Row():
                # 왼쪽: 샘플 데이터 로드
                with gr.Column(scale=1):
                    gr.Markdown("### 🚀 빠른 시작: 샘플 데이터 로드")
                    gr.Markdown("AI 포트폴리오 프로젝트의 핵심 문서들을 로드합니다.")
                    load_sample_btn = gr.Button("📚 샘플 데이터 로드", variant="primary", size="lg")
                    sample_status = gr.HTML(
                        label="로드 상태",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>샘플 데이터를 로드하면 여기에 결과가 표시됩니다.</div>"
                    )
                
                # 오른쪽: 수동 문서 추가
                with gr.Column(scale=1):
                    gr.Markdown("### 📝 수동 문서 추가")
                    gr.Markdown("직접 문서를 입력하여 메모리에 로드합니다.")
                    doc_input = gr.Textbox(
                        label="문서 내용",
                        placeholder="여기에 문서 내용을 붙여넣으세요...",
                        lines=8
                    )
                    source_input = gr.Textbox(
                        label="출처 이름 (선택 사항)",
                        placeholder="예: research_paper.pdf",
                        value="manual_input"
                    )
                    add_btn = gr.Button("📥 문서 로드", variant="primary")
                    add_output = gr.HTML(
                        label="로드 상태",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>문서를 로드하면 여기에 결과가 표시됩니다.</div>"
                    )
            
            # 통합 미리보기 섹션
            gr.Markdown("### 👁️ 로드된 문서 미리보기")
            preview_output = gr.HTML(
                label="문서 미리보기",
                value="<div style='text-align: center; color: #666; padding: 40px;'>문서를 로드하면 자동으로 미리보기가 업데이트됩니다.</div>"
            )

        # === 2. Textsplitter(Chunking) 탭 ===
        with gr.Tab("✂️ Textsplitter(Chunking)"):
            # 1단계: 메모리 내 Document 확인 및 대상 Document 설정
            gr.Markdown("### 📋 1단계: 메모리 내 Document 확인 및 대상 Document 설정")
            with gr.Row():
                with gr.Column(scale=2):
                    gr.Markdown("**현재 메모리에 로드된 문서들:**")
                    document_list_output = gr.HTML(
                        label="로드된 문서 목록",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>문서를 로드하면 여기에 목록이 표시됩니다.</div>"
                    )
                
                with gr.Column(scale=1):
                    gr.Markdown("**대상 문서 선택:**")
                    document_selection = gr.Radio(
                        choices=["전체 문서", "개별 문서 선택"],
                        label="처리 방식",
                        value="전체 문서"
                    )
                    selected_document = gr.Dropdown(
                        choices=[],
                        label="선택할 문서 (개별 선택 시)",
                        interactive=False
                    )
                    refresh_docs_btn = gr.Button("🔄 문서 목록 새로고침", variant="secondary", size="sm")
            
            # 2단계: Chunking 설정
            gr.Markdown("### ⚙️ 2단계: Chunking 설정")
            with gr.Row():
                with gr.Column(scale=1):
                    gr.Markdown("**기본 설정 (Load):**")
                    preset_dropdown = gr.Dropdown(
                        choices=["기본 설정 (500/75)", "작은 청크 (300/50)", "큰 청크 (800/100)", "사용자 정의"],
                        label="프리셋 선택",
                        value="기본 설정 (500/75)"
                    )
                
                with gr.Column(scale=1):
                    gr.Markdown("**사용자 정의 설정:**")
                    chunk_size = gr.Slider(
                        label="청크 크기 (문자 수)",
                        minimum=100,
                        maximum=1000,
                        value=500,
                        step=50,
                        interactive=False
                    )
                    chunk_overlap = gr.Slider(
                        label="청크 겹침 (문자 수)",
                        minimum=0,
                        maximum=200,
                        value=75,
                        step=10,
                        interactive=False
                    )
                
                with gr.Column(scale=1):
                    gr.Markdown("**설정 관리:**")
                    reset_settings_btn = gr.Button("🔄 설정 초기화", variant="secondary")
                    apply_settings_btn = gr.Button("✅ 설정 적용", variant="primary")
                    current_settings_display = gr.HTML(
                        label="현재 설정",
                        value="<div style='padding: 10px; background: #f8f9fa; border-radius: 5px;'><strong>현재 설정:</strong><br>• 청크 크기: 500 문자<br>• 청크 겹침: 75 문자<br>• 분할 방식: 문장 단위<br>• 설정 소스: base.yaml</div>"
                    )
            
            # 3단계: Chunking 실시 및 청크 카드화
            gr.Markdown("### 🔬 3단계: Chunking 실시 및 청크 카드화")
            with gr.Row():
                with gr.Column(scale=1):
                    gr.Markdown("**청킹 실행:**")
                    execute_chunking_btn = gr.Button("✂️ 청킹 실행", variant="primary", size="lg")
                    chunking_status = gr.HTML(
                        label="실행 상태",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>청킹을 실행하면 여기에 결과가 표시됩니다.</div>"
                    )
                    gr.Markdown("**청킹 분석:**")
                    chunk_analysis_btn = gr.Button("📊 청크 분석", variant="primary")
                    chunk_analysis_output = gr.Textbox(
                        label="청킹 분석",
                        lines=8,
                        interactive=False
                    )
                
                with gr.Column(scale=2):
                    gr.Markdown("**생성된 청크들 (카드 형태):**")
                    chunk_cards_output = gr.HTML(
                        label="청크 카드",
                        value="<div style='text-align: center; color: #666; padding: 40px;'>청킹을 실행하면 여기에 카드가 표시됩니다.</div>"
                    )

        # === 3. Embedding / VectorStore 탭 ===
        with gr.Tab("🔢 Embedding / VectorStore"):
            with gr.Row():
                # 왼쪽: 임베딩 모델 정보
                with gr.Column(scale=1):
                    gr.Markdown("### 🤖 임베딩 모델")
                    gr.Markdown("**현재 사용 중인 모델:**")
                    gr.Markdown("• 모델명: sentence-transformers/all-MiniLM-L6-v2")
                    gr.Markdown("• 차원: 384")
                    gr.Markdown("• 언어: 다국어 지원")
                    gr.Markdown("• 성능: 빠르고 효율적")
                    
                    embedding_analysis_btn = gr.Button("🔬 임베딩 분석", variant="primary")
                    embedding_output = gr.Textbox(
                        label="임베딩 분석",
                        lines=15,
                        interactive=False
                    )
                
                # 중앙: 벡터스토어 정보
                with gr.Column(scale=1):
                    gr.Markdown("### 🗄️ 벡터스토어")
                    gr.Markdown("**현재 사용 중인 스토어:**")
                    gr.Markdown("• 타입: Memory Vector Store")
                    gr.Markdown("• 검색 알고리즘: 코사인 유사도 + BM25")
                    gr.Markdown("• 저장 방식: 메모리 내 저장")
                    gr.Markdown("• 환경: 데모 모드")
                    
                    vector_info_btn = gr.Button("🔍 벡터스토어 상세 정보", variant="primary")
                    vector_info_output = gr.Textbox(
                        label="벡터스토어 정보",
                        lines=15,
                        interactive=False
                    )
                
                # 오른쪽: 벡터 내용 확인
                with gr.Column(scale=1):
                    gr.Markdown("### 🔍 벡터 내용 확인")
                    gr.Markdown("벡터스토어에 저장된 실제 벡터 데이터를 확인합니다.")
                    vector_content_btn = gr.Button("🔍 벡터 내용 보기", variant="primary")
                    vector_content_output = gr.Textbox(
                        label="벡터 내용",
                        lines=20,
                        interactive=False
                    )

        # === 4. Retriever 탭 ===
        with gr.Tab("🔍 Retriever"):
            with gr.Row():
                # 왼쪽: 검색 설정
                with gr.Column(scale=1):
                    gr.Markdown("### ⚙️ 검색 설정")
                    gr.Markdown("**검색 파라미터를 조정합니다:**")
                    top_k = gr.Slider(
                        label="결과 수 (top_k)",
                        minimum=1,
                        maximum=10,
                        value=3,
                        step=1
                    )
                    similarity_threshold = gr.Slider(
                        label="유사도 임계값",
                        minimum=0.0,
                        maximum=1.0,
                        value=0.1,
                        step=0.05
                    )
                    gr.Markdown("**검색 알고리즘:**")
                    gr.Markdown("• 벡터 유사도 (코사인)")
                    gr.Markdown("• BM25 키워드 검색")
                    gr.Markdown("• 하이브리드 점수 계산")
                
                # 중앙: 검색 실행
                with gr.Column(scale=1):
                    gr.Markdown("### 🔍 검색 실행")
                    gr.Markdown("**샘플 쿼리:**")
                    sample_query_dropdown = gr.Dropdown(
                        choices=demo_controller.get_sample_queries(),
                        label="미리 정의된 질문들",
                        value="",
                        interactive=True
                    )
                    use_sample_btn = gr.Button("🔍 선택한 질문으로 검색", variant="secondary")
                    
                    gr.Markdown("**직접 검색:**")
                    search_input = gr.Textbox(
                        label="검색어",
                        placeholder="예: 헥사고날 아키텍처, RAG 시스템, Docker 최적화...",
                        lines=4
                    )
                    search_btn = gr.Button("🔍 검색", variant="primary")
                
                # 오른쪽: 검색 결과
                with gr.Column(scale=1):
                    gr.Markdown("### 📋 검색 결과")
                    search_output = gr.Textbox(
                        label="검색 결과",
                        lines=20,
                        interactive=False
                    )

        # === 5. Data확인 탭 ===
        with gr.Tab("📊 Data확인"):
            with gr.Row():
                # 왼쪽: 시스템 상태
                with gr.Column(scale=1):
                    gr.Markdown("### 📊 시스템 상태")
                    gr.Markdown("전체 시스템의 현재 상태를 확인합니다.")
                    status_btn = gr.Button("📊 시스템 상태 확인", variant="primary")
                    status_output = gr.Textbox(
                        label="시스템 상태",
                        lines=15,
                        interactive=False
                    )
                
                # 중앙: 메모리 사용량
                with gr.Column(scale=1):
                    gr.Markdown("### 💾 메모리 사용량")
                    gr.Markdown("시스템 메모리 사용 현황을 확인합니다.")
                    memory_btn = gr.Button("💾 메모리 정보", variant="primary")
                    memory_output = gr.Textbox(
                        label="메모리 정보",
                        lines=15,
                        interactive=False
                    )
                
                # 오른쪽: 메모리 내용
                with gr.Column(scale=1):
                    gr.Markdown("### 💾 메모리 내용")
                    gr.Markdown("메모리에 저장된 실제 데이터를 확인합니다.")
                    memory_content_btn = gr.Button("💾 메모리 내용 보기", variant="primary")
                    memory_content_output = gr.Textbox(
                        label="메모리 내용",
                        lines=15,
                        interactive=False
                    )

        # === 추가: RAG Q&A 탭 (선택적) ===
        with gr.Tab("🤖 RAG Q&A"):
            with gr.Row():
                # 왼쪽: 질문 입력
                with gr.Column(scale=1):
                    gr.Markdown("### 💬 질문하기")
                    gr.Markdown("RAG 시스템을 통해 질문에 답변을 받습니다.")
                    question_input = gr.Textbox(
                        label="질문",
                        placeholder="예: 헥사고날 아키텍처의 장점은 무엇인가요? RAG 시스템은 어떻게 작동하나요?",
                        lines=6
                    )
                    max_sources = gr.Slider(
                        label="사용할 최대 출처 수",
                        minimum=1,
                        maximum=5,
                        value=3,
                        step=1
                    )
                    answer_btn = gr.Button("💬 답변 생성", variant="primary")
                
                # 중앙: AI 답변
                with gr.Column(scale=1):
                    gr.Markdown("### 🤖 AI 답변")
                    answer_output = gr.Textbox(
                        label="AI 답변",
                        lines=20,
                        interactive=False
                    )
                
                # 오른쪽: 출처 문서
                with gr.Column(scale=1):
                    gr.Markdown("### 📚 출처 문서")
                    sources_output = gr.Textbox(
                        label="출처 문서",
                        lines=20,
                        interactive=False
                    )

        # Async wrapper functions for Gradio compatibility
        def sync_add_document(content, source):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.add_document(content, source)
            result = asyncio.run(run())
            preview = demo_controller.get_all_documents_preview()
            return result, preview
        
        def sync_clear_knowledge_base():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.clear_knowledge_base()
            return asyncio.run(run())
        
        def sync_search_documents(query, top_k):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.search_documents(query, top_k)
            return asyncio.run(run())
        
        def sync_generate_answer(question, max_sources):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.generate_answer(question, max_sources)
            return asyncio.run(run())
        
        def sync_get_status():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_status()
            return asyncio.run(run())

        def sync_view_all_documents():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.view_all_documents()
            return asyncio.run(run())

        def sync_get_embedding_analysis():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_embedding_analysis()
            return asyncio.run(run())

        def sync_get_memory_info():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_memory_info()
            return asyncio.run(run())

        def sync_get_chunk_analysis():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_chunk_analysis()
            return asyncio.run(run())

        def sync_get_vector_store_detailed_info():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_vector_store_detailed_info()
            return asyncio.run(run())

        def sync_get_memory_content():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_memory_content()
            return asyncio.run(run())

        def sync_get_vector_store_content():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_vector_store_content()
            return asyncio.run(run())

        def sync_load_sample_data():
            result = demo_controller.load_sample_data()
            preview = demo_controller.get_all_documents_preview()
            return result, preview
        
        def sync_preview_sample_data():
            return demo_controller.preview_sample_data()
        
        def sync_add_sample_data_to_knowledge_base():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.add_sample_data_to_knowledge_base()
            return asyncio.run(run())

        def sync_preview_manual_documents():
            return demo_controller.preview_manual_documents()

        # === 새로운 TextSplitter 관련 동기 함수들 ===
        
        def sync_get_document_list():
            return demo_controller.get_document_list()
        
        def sync_get_document_choices():
            return demo_controller.get_document_choices()
        
        def sync_update_chunking_settings(preset, chunk_size, chunk_overlap):
            return demo_controller.update_chunking_settings(preset, chunk_size, chunk_overlap)
        
        def sync_execute_chunking(document_selection, selected_document):
            return demo_controller.execute_chunking(document_selection, selected_document)
        
        def sync_get_chunk_cards():
            return demo_controller.get_chunk_cards()
        
        def sync_get_chunk_content(chunk_index):
            return demo_controller.get_chunk_content(chunk_index)

        def format_system_status_html(status_text):
            """시스템 상태 텍스트를 HTML로 포맷팅"""
            if not status_text or "❌" in status_text:
                return """<div style="font-size: 14px; line-height: 1.4; color: #dc3545; min-width: 300px; width: 100%;">
                    <div style="margin-bottom: 8px;">
                        <strong>🤖 LLM 서비스:</strong><br>
                        <strong>❌ 준비안됨</strong>
                    </div>
                    
                    <div style="margin-bottom: 8px;">
                        <strong>🔍 벡터 스토어:</strong><br>
                        <strong>❌ 준비안됨</strong>
                    </div>
                    
                    <div style="margin-bottom: 8px;">
                        <strong>🔤 임베딩 서비스:</strong><br>
                        <strong>❌ 준비안됨</strong>
                    </div>
                </div>"""
            
            # 상태 텍스트에서 정보 추출 (실제 출력 구조에 맞게 수정)
            lines = status_text.split('\n')
            llm_model = "MockLLM"
            llm_type = "Mock"
            llm_status = "❌ 준비안됨"
            vector_store = "MemoryVector"
            stored_vectors = "0"
            vector_status = "❌ 준비안됨"
            embedding_model = "sentence-transformers/all-MiniLM-L6-v2"
            dimensions = "384"
            embedding_status = "❌ 준비안됨"
            
            # 실제 출력 구조에 맞게 파싱
            for line in lines:
                line = line.strip()
                if "스토어:" in line:
                    vector_store = line.split(":")[-1].strip()
                elif "저장된 벡터:" in line:
                    stored_vectors = line.split(":")[-1].strip().replace("개", "")
                elif "모델:" in line and "sentence-transformers" in line:
                    embedding_model = line.split(":")[-1].strip()
                elif "차원:" in line:
                    dimensions = line.split(":")[-1].strip()
                elif "상태:" in line and "✅" in line:
                    # 현재 섹션을 추정하여 상태 설정
                    if "LLM" in status_text and "MockLLM" in status_text:
                        llm_status = "✅ 준비됨"
                    if "MemoryVector" in line or "스토어" in line:
                        vector_status = "✅ 준비됨"
                    if "sentence-transformers" in line or "차원" in line:
                        embedding_status = "✅ 준비됨"
            
            # 기본값 설정 (실제 상태에서 정보가 없을 경우)
            if "✅ 준비됨" in status_text:
                llm_status = "✅ 준비됨"
                vector_status = "✅ 준비됨"
                embedding_status = "✅ 준비됨"
            
            return f"""<div style="font-size: 14px; line-height: 1.4; min-width: 300px; width: 100%;">
                <div style="margin-bottom: 8px;">
                    <strong>🤖 LLM 서비스:</strong><br>
                    <strong>{llm_model}({llm_type})</strong> - <strong>{llm_status}</strong>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <strong>🔍 벡터 스토어:</strong><br>
                    <strong>{vector_store}</strong> - <strong>{stored_vectors}개 벡터</strong> - <strong>{vector_status}</strong>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <strong>🔤 임베딩 서비스:</strong><br>
                    <strong>{embedding_model}</strong> - <strong>{dimensions}차원</strong> - <strong>{embedding_status}</strong>
                </div>
            </div>"""

        # Event handlers
        load_sample_btn.click(
            fn=sync_load_sample_data,
            outputs=[sample_status, preview_output]
        )
        
        use_sample_btn.click(
            fn=lambda query: query if query else "검색어를 선택해주세요",
            inputs=sample_query_dropdown,
            outputs=search_input
        )
        
        add_btn.click(
            fn=sync_add_document,
            inputs=[doc_input, source_input],
            outputs=[add_output, preview_output]
        )
        
        search_btn.click(
            fn=sync_search_documents,
            inputs=[search_input, top_k],
            outputs=search_output
        )

        # 임베딩 분석 버튼 이벤트 핸들러
        embedding_analysis_btn.click(
            fn=sync_get_embedding_analysis,
            outputs=embedding_output
        )

        # 시스템 상태 새로고침 이벤트 핸들러
        refresh_status_btn.click(
            fn=lambda: format_system_status_html(sync_get_status()),
            outputs=system_status_html
        )

        # 데이터 확인 이벤트 핸들러
        memory_content_btn.click(
            fn=sync_get_memory_content,
            outputs=memory_content_output
        )

        vector_content_btn.click(
            fn=sync_get_vector_store_content,
            outputs=vector_content_output
        )

        # 청킹 분석 이벤트 핸들러
        chunk_analysis_btn.click(
            fn=sync_get_chunk_analysis,
            outputs=chunk_analysis_output
        )

        # 벡터스토어 정보 이벤트 핸들러
        vector_info_btn.click(
            fn=sync_get_vector_store_detailed_info,
            outputs=vector_info_output
        )

        # 시스템 상태 이벤트 핸들러
        status_btn.click(
            fn=sync_get_status,
            outputs=status_output
        )

        # 메모리 정보 이벤트 핸들러
        memory_btn.click(
            fn=sync_get_memory_info,
            outputs=memory_output
        )

        # === 새로운 TextSplitter 이벤트 핸들러들 ===
        
        # 문서 목록 새로고침
        refresh_docs_btn.click(
            fn=sync_get_document_list,
            outputs=document_list_output
        )
        
        # 문서 선택 변경 시 드롭다운 업데이트
        document_selection.change(
            fn=lambda selection: gr.update(choices=sync_get_document_choices(), interactive=(selection == "개별 문서 선택")),
            inputs=document_selection,
            outputs=selected_document
        )
        
        # 프리셋 변경 시 설정 업데이트
        preset_dropdown.change(
            fn=lambda preset_value: (
                500 if preset_value == "기본 설정 (500/75)" else 
                300 if preset_value == "작은 청크 (300/50)" else 
                800 if preset_value == "큰 청크 (800/100)" else 500,
                75 if preset_value == "기본 설정 (500/75)" else 
                50 if preset_value == "작은 청크 (300/50)" else 
                100 if preset_value == "큰 청크 (800/100)" else 75
            ),
            inputs=preset_dropdown,
            outputs=[chunk_size, chunk_overlap]
        )
        
        # 설정 적용
        apply_settings_btn.click(
            fn=sync_update_chunking_settings,
            inputs=[preset_dropdown, chunk_size, chunk_overlap],
            outputs=current_settings_display
        )
        
        # 설정 초기화
        reset_settings_btn.click(
            fn=lambda: (500, 75, "기본 설정 (500/75)"),
            outputs=[chunk_size, chunk_overlap, preset_dropdown]
        )
        
        # 청킹 실행
        execute_chunking_btn.click(
            fn=sync_execute_chunking,
            inputs=[document_selection, selected_document],
            outputs=[chunking_status, chunk_analysis_output]
        )
        
        # 청크 카드 표시
        execute_chunking_btn.click(
            fn=sync_get_chunk_cards,
            outputs=chunk_cards_output
        )
        
        # 페이지 로드 시 초기 문서 목록 표시
        demo.load(
            fn=sync_get_document_list,
            outputs=document_list_output
        )

        # 페이지 로드 시 초기 시스템 상태 업데이트
        demo.load(
            fn=lambda: format_system_status_html(sync_get_status()),
            outputs=system_status_html
        )
    
    return demo


if __name__ == "__main__":
    logger.info("🚀 Starting Hexagonal RAG Demo...")
    
    try:
        demo = create_demo_interface()
        demo.launch(
            server_name="0.0.0.0",
            server_port=7860,
            share=False,
            show_error=True
        )
    except Exception as e:
        logger.error(f"❌ Failed to start demo: {e}")
        raise
