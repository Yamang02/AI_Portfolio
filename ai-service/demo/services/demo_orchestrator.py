"""
Demo Orchestrator
모든 인터페이스를 조합하는 데모 오케스트레이터
"""

import asyncio
import logging
import gradio as gr
from typing import Dict, Any

# Import hexagonal architecture components
from src.application.services.rag_hexagonal_service import RAGHexagonalService
from src.adapters.outbound.llm.mock_llm_adapter import MockLLMAdapter
from src.adapters.outbound.databases.vector.vector_adapter_factory import VectorAdapterFactory

# Import demo interfaces
from ..interfaces.document_interface import DocumentLoadInterface
from ..interfaces.chunking_interface import ChunkingInterface
from ..interfaces.retrieval_interface import RetrievalInterface
from ..interfaces.generation_interface import GenerationInterface
from ..interfaces.status_interface import StatusInterface

# 프로덕션 설정 공유를 위한 import
try:
    from src.shared.config.config_manager import ConfigManager
    CONFIG_AVAILABLE = True
except ImportError:
    CONFIG_AVAILABLE = False

logger = logging.getLogger(__name__)


class RAGDemoOrchestrator:
    """RAG 데모 오케스트레이터 - 모든 인터페이스를 조합"""
    
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
        self.vector_adapter_factory = VectorAdapterFactory(environment="demo")
        self.vector_adapter = self.vector_adapter_factory.create_vector_adapter()
        
        self.rag_service = RAGHexagonalService(
            vector_store=self.vector_adapter,
            llm_port=self.llm_adapter,
            config_manager=self.config_manager
        )
        
        # Initialize demo interfaces
        self.document_interface = DocumentLoadInterface()
        self.chunking_interface = ChunkingInterface(self.document_interface)
        self.retrieval_interface = RetrievalInterface(self.rag_service)
        self.generation_interface = GenerationInterface(self.rag_service)
        self.status_interface = StatusInterface(self.rag_service, self.llm_adapter, self.vector_adapter)
        
        self.initialized = False
        logger.info("✅ RAG Demo Orchestrator initialized with all interfaces")

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

    # === Document Interface Methods ===
    def load_sample_data(self) -> str:
        """샘플 데이터 로드"""
        return self.document_interface.load_sample_data()

    def add_document(self, content: str, source: str = "manual_input") -> str:
        """문서 추가"""
        return self.document_interface.add_document(content, source)

    def get_all_documents_preview(self) -> str:
        """문서 미리보기"""
        return self.document_interface.get_all_documents_preview()

    def get_document_list(self) -> str:
        """문서 목록"""
        return self.document_interface.get_document_list()

    def load_sample_data_with_ui_update(self) -> tuple:
        """샘플 데이터 로드 + 모든 UI 업데이트 (단일 액션)"""
        # 1. 샘플 데이터 로드
        load_result = self.document_interface.load_sample_data()
        
        # 2. 문서 미리보기 업데이트
        preview = self.document_interface.get_all_documents_preview()
        
        # 3. 드롭다운 선택 항목 업데이트
        choices = self.document_interface.get_document_choices()
        
        return load_result, preview, gr.update(choices=choices, value=None)

    def add_document_with_ui_update(self, content: str, source: str = "manual_input") -> tuple:
        """문서 추가 + 모든 UI 업데이트 (단일 액션)"""
        # 1. 문서 추가
        add_result = self.document_interface.add_document(content, source)
        
        # 2. 문서 미리보기 업데이트
        preview = self.document_interface.get_all_documents_preview()
        
        # 3. 드롭다운 선택 항목 업데이트
        choices = self.document_interface.get_document_choices()
        
        return add_result, preview, gr.update(choices=choices, value=None)

    def get_document_full_content_by_title(self, choice: str) -> str:
        """문서 전체 내용 보기 (인덱스 기반)"""
        return self.document_interface.get_document_full_content(choice)

    def get_document_choices(self) -> list:
        """문서 선택 목록 (인덱스 포함)"""
        return self.document_interface.get_document_choices()

    def get_document_preview_by_choice(self, choice: str) -> str:
        """선택된 문서의 미리보기"""
        document = self.document_interface.get_document_by_choice(choice)
        if not document:
            return "<div style='text-align: center; color: #666; padding: 20px;'>문서를 찾을 수 없습니다.</div>"
        
        # 간단한 미리보기 생성
        content_preview = document['content'][:300] + "..." if len(document['content']) > 300 else document['content']
        
        return f"""
        <div style="
            background: linear-gradient(135deg, {document['bg_color']} 0%, {document['bg_color'].replace('e8', 'f0').replace('f3', 'f8')} 100%);
            border: 2px solid {document['border_color']};
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 18px; margin-right: 8px;">{document['icon']}</span>
                <h4 style="margin: 0; color: #2c3e50; font-size: 14px; font-weight: 600;">
                    {document['title']}
                </h4>
            </div>
            
            <div style="font-size: 12px; color: #666; line-height: 1.4; margin-bottom: 12px;">
                <div><strong>📁 출처:</strong> {document['source']}</div>
                <div><strong>📏 크기:</strong> {len(document['content']):,} 문자</div>
                <div><strong>🏷️ 타입:</strong> {document['type']}</div>
            </div>
            
            <div style="
                background: rgba(255,255,255,0.7);
                border-radius: 4px;
                padding: 8px;
                font-size: 11px;
                color: #555;
                line-height: 1.3;
                max-height: 100px;
                overflow-y: auto;
            ">
                {content_preview}
            </div>
        </div>
        """

    # === Chunking Interface Methods ===
    def update_chunking_settings(self, preset: str, chunk_size: int, chunk_overlap: int) -> str:
        """청킹 설정 업데이트"""
        return self.chunking_interface.update_chunking_settings(preset, chunk_size, chunk_overlap)

    def get_multiple_documents_preview(self, choices: list) -> str:
        """다중 선택된 문서들의 미리보기"""
        if not choices:
            return "<div style='text-align: center; color: #666; padding: 20px;'>문서를 선택하면 여기에 미리보기가 표시됩니다.</div>"
        
        html_output = f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h4 style="color: #2c3e50; margin-bottom: 15px;">📋 선택된 문서들 ({len(choices)}개)</h4>
            <div style="display: flex; flex-direction: column; gap: 12px;">
        """
        
        for choice in choices:
            document = self.document_interface.get_document_by_choice(choice)
            if document:
                content_preview = document['content'][:200] + "..." if len(document['content']) > 200 else document['content']
                
                html_output += f"""
                <div style="
                    background: linear-gradient(135deg, {document['bg_color']} 0%, {document['bg_color'].replace('e8', 'f0').replace('f3', 'f8')} 100%);
                    border: 2px solid {document['border_color']};
                    border-radius: 8px;
                    padding: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ">
                    <div style="display: flex; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 16px; margin-right: 6px;">{document['icon']}</span>
                        <h5 style="margin: 0; color: #2c3e50; font-size: 13px; font-weight: 600;">
                            {document['title']}
                        </h5>
                    </div>
                    
                    <div style="font-size: 11px; color: #666; line-height: 1.3; margin-bottom: 8px;">
                        <div><strong>📁 출처:</strong> {document['source']}</div>
                        <div><strong>📏 크기:</strong> {len(document['content']):,} 문자</div>
                        <div><strong>🏷️ 타입:</strong> {document['type']}</div>
                    </div>
                    
                    <div style="
                        background: rgba(255,255,255,0.7);
                        border-radius: 4px;
                        padding: 6px;
                        font-size: 10px;
                        color: #555;
                        line-height: 1.3;
                        max-height: 60px;
                        overflow-y: auto;
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

    def analyze_multiple_documents(self, document_choices: list) -> str:
        """다중 선택된 문서들의 분석"""
        if not document_choices:
            return "❌ 분석할 문서를 선택해주세요."
        
        try:
            analysis_results = []
            
            for choice in document_choices:
                document = self.document_interface.get_document_by_choice(choice)
                if not document:
                    continue
                
                # 문서 분석 실행
                from src.core.domain.services.chunking import ChunkingStrategyFactory
                
                document_metadata = {
                    'file_path': document.get('source', ''),
                    'source': document.get('source', ''),
                    'title': document.get('title', '')
                }
                
                analysis = ChunkingStrategyFactory.analyze_document_for_strategy(
                    document=document['content'],
                    document_metadata=document_metadata
                )
                
                analysis_results.append({
                    'title': document['title'],
                    'source': document['source'],
                    'size': len(document['content']),
                    'type': document['type'],
                    'analysis': analysis
                })
            
            # 분석 결과 포맷팅
            result = f"""🔬 **다중 문서 분석 결과** ({len(analysis_results)}개 문서)

📊 **전체 요약:**
• 분석된 문서: {len(analysis_results)}개
• 총 문자 수: {sum(doc['size'] for doc in analysis_results):,} 문자
• 평균 문서 크기: {sum(doc['size'] for doc in analysis_results) // len(analysis_results):,} 문자

📄 **문서별 상세 분석:**
"""
            
            for i, doc_analysis in enumerate(analysis_results, 1):
                result += f"""
🔍 **{i}. {doc_analysis['title']}**
• 출처: {doc_analysis['source']}
• 크기: {doc_analysis['size']:,} 문자
• 타입: {doc_analysis['type']}
• 감지된 문서 유형: {doc_analysis['analysis'].get('content_type', 'N/A')}
• 권장 청킹 전략: {doc_analysis['analysis'].get('recommended_strategy', 'N/A')}
• 복잡도 점수: {doc_analysis['analysis'].get('complexity_score', 'N/A')}
• 권장 청크 크기: {doc_analysis['analysis'].get('recommended_chunk_size', 'N/A')} 문자
"""
            
            # 통합 권장사항
            strategies = [doc['analysis'].get('recommended_strategy', 'Unknown') for doc in analysis_results]
            unique_strategies = list(set(strategies))
            
            result += f"""
🎯 **통합 권장사항:**
• 감지된 전략 유형: {', '.join(unique_strategies)}
• 권장 처리 순서: 복잡도가 높은 문서부터 처리
• 특별 고려사항: 문서 유형이 다양하므로 각각에 맞는 청킹 전략 적용 필요
"""
            
            return result
            
        except Exception as e:
            logger.error(f"다중 문서 분석 중 오류 발생: {e}")
            return f"❌ 다중 문서 분석 중 오류가 발생했습니다: {str(e)}"

    def execute_chunking(self, document_selection: str, selected_document: str, selected_documents: list) -> tuple:
        """청킹 실행"""
        return self.chunking_interface.execute_chunking(document_selection, selected_document)

    def get_chunk_cards(self) -> str:
        """청크 카드"""
        return self.chunking_interface.get_chunk_cards()

    def get_chunk_content(self, chunk_index: int) -> str:
        """청크 내용"""
        return self.chunking_interface.get_chunk_content(chunk_index)

    def analyze_document(self, document_choice: str) -> str:
        """선택된 문서 분석"""
        if not document_choice:
            return "❌ 분석할 문서를 선택해주세요."
        
        try:
            # 선택된 문서 가져오기
            document = self.document_interface.get_document_by_choice(document_choice)
            if not document:
                return "❌ 선택된 문서를 찾을 수 없습니다."
            
            # 문서 분석 실행
            from src.core.domain.services.chunking import ChunkingStrategyFactory
            
            document_metadata = {
                'file_path': document.get('source', ''),
                'source': document.get('source', ''),
                'title': document.get('title', '')
            }
            
            analysis = ChunkingStrategyFactory.analyze_document_for_strategy(
                document=document['content'],
                document_metadata=document_metadata
            )
            
            # 분석 결과 포맷팅
            result = f"""🔬 **문서 분석 결과**

📄 **문서 정보:**
• 제목: {document['title']}
• 출처: {document['source']}
• 크기: {len(document['content']):,} 문자
• 타입: {document['type']}

🧠 **스마트 분석:**
• 감지된 문서 유형: {analysis.get('content_type', 'N/A')}
• 권장 청킹 전략: {analysis.get('recommended_strategy', 'N/A')}
• 복잡도 점수: {analysis.get('complexity_score', 'N/A')}

📊 **구조 분석:**
• 문단 수: {analysis.get('paragraph_count', 'N/A')}
• 섹션 수: {analysis.get('section_count', 'N/A')}
• 평균 문장 길이: {analysis.get('avg_sentence_length', 'N/A')} 문자

🎯 **최적 청킹 전략 제안:**
• 권장 청크 크기: {analysis.get('recommended_chunk_size', 'N/A')} 문자
• 권장 청크 겹침: {analysis.get('recommended_overlap', 'N/A')} 문자
• 특별 고려사항: {analysis.get('special_considerations', 'N/A')}

📝 **키워드 및 주제:**
• 주요 키워드: {', '.join(analysis.get('keywords', []))}
• 감지된 주제: {', '.join(analysis.get('topics', []))}
"""
            
            return result
            
        except Exception as e:
            logger.error(f"문서 분석 중 오류 발생: {e}")
            return f"❌ 문서 분석 중 오류가 발생했습니다: {str(e)}"

    # === Retrieval Interface Methods ===
    def get_sample_queries(self) -> list:
        """샘플 쿼리"""
        return self.retrieval_interface.get_sample_queries()

    async def search_documents(self, query: str, top_k: int = 3) -> str:
        """문서 검색"""
        return await self.retrieval_interface.search_documents(query, top_k)

    async def search_documents_with_analysis(self, query: str, top_k: int = 3) -> tuple:
        """분석과 함께 검색"""
        return await self.retrieval_interface.search_documents_with_analysis(query, top_k)

    async def demonstrate_retriever_process(self, query: str) -> tuple:
        """리트리버 과정 시연"""
        return await self.retrieval_interface.demonstrate_retriever_process(query)

    # === Generation Interface Methods ===
    async def generate_answer(self, question: str, max_results: int = 3) -> tuple:
        """답변 생성"""
        return await self.generation_interface.generate_answer(question, max_results)

    async def add_document_with_analysis(self, content: str, source: str = "manual_input") -> tuple:
        """분석과 함께 문서 추가"""
        return await self.generation_interface.add_document_with_analysis(content, source)

    async def add_sample_data_to_knowledge_base(self) -> str:
        """샘플 데이터 지식 베이스 추가"""
        sample_data = self.document_interface.get_all_documents()
        return await self.generation_interface.add_sample_data_to_knowledge_base(sample_data)

    async def demonstrate_complete_rag_pipeline(self, content: str, query: str) -> tuple:
        """완전한 RAG 파이프라인 시연"""
        return await self.generation_interface.demonstrate_complete_rag_pipeline(content, query)

    # === Status Interface Methods ===
    async def get_status(self) -> str:
        """시스템 상태"""
        return await self.status_interface.get_status()

    async def get_memory_info(self) -> str:
        """메모리 정보"""
        return await self.status_interface.get_memory_info()

    async def get_embedding_analysis(self) -> str:
        """임베딩 분석"""
        return await self.status_interface.get_embedding_analysis()

    async def get_vector_store_detailed_info(self) -> str:
        """벡터스토어 상세 정보"""
        return await self.status_interface.get_vector_store_detailed_info()

    async def get_memory_content(self) -> str:
        """메모리 내용"""
        return await self.status_interface.get_memory_content()

    async def get_vector_store_content(self) -> str:
        """벡터스토어 내용"""
        return await self.status_interface.get_vector_store_content()

    async def get_chunk_analysis(self) -> str:
        """청크 분석"""
        return await self.status_interface.get_chunk_analysis()

    async def clear_knowledge_base(self) -> str:
        """지식 베이스 삭제"""
        return await self.status_interface.clear_knowledge_base()

    def format_system_status_html(self, status_text: str) -> str:
        """시스템 상태 HTML 포맷팅"""
        return self.status_interface.format_system_status_html(status_text)

    # === Utility Methods ===
    def get_rag_service(self):
        """RAG 서비스 반환 (다른 곳에서 사용)"""
        return self.rag_service

    def get_vector_adapter(self):
        """벡터 어댑터 반환"""
        return self.vector_adapter

    def get_llm_adapter(self):
        """LLM 어댑터 반환"""
        return self.llm_adapter
