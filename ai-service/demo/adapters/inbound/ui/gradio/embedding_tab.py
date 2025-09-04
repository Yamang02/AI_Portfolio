"""
Embedding Tab Adapter
임베딩 탭 어댑터

기존 인터페이스를 기반으로 한 탭 어댑터입니다.
임베딩 생성 기능의 UI만 담당합니다.
"""

import gradio as gr
import logging
from domain.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class EmbeddingTabAdapter:
    """임베딩 탭 어댑터 - 임베딩 생성 UI만 담당"""
    
    def __init__(self, embedding_service: EmbeddingService):
        self.embedding_service = embedding_service
        logger.info("✅ Embedding Tab Adapter initialized with Use Cases")
    
    def create_tab(self) -> gr.Tab:
        """임베딩 탭 생성"""
        with gr.Tab("🔢 Embedding / VectorStore", id=2) as tab:
            gr.Markdown("## 🔢 Embedding / VectorStore")
            gr.Markdown("텍스트를 벡터로 변환하고 저장합니다")
            
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
            
            # Event handlers
            embedding_analysis_btn.click(
                fn=self._get_embedding_analysis,
                outputs=embedding_output
            )
            vector_info_btn.click(
                fn=self._get_vector_store_info,
                outputs=vector_info_output
            )
            vector_content_btn.click(
                fn=self._get_vector_content,
                outputs=vector_content_output
            )
        
        return tab
    
    def _get_embedding_analysis(self) -> str:
        """임베딩 분석 정보"""
        try:
            return "🔬 **임베딩 분석**\n\n**모델**: sentence-transformers/all-MiniLM-L6-v2\n**문서 수**: 0\n**임베딩 차원**: 384\n**임베딩 형태**: (384,)\n**샘플 벡터 크기**: 0.0000"
        except Exception as e:
            logger.error(f"Error in _get_embedding_analysis: {e}")
            return f"❌ 임베딩 분석 실패: {str(e)}"
    
    def _get_vector_store_info(self) -> str:
        """벡터스토어 정보"""
        try:
            return "🔍 **벡터스토어 상세 정보**\n\n**스토어 정보:**\n• 스토어 이름: MemoryVector\n• 스토어 타입: Memory\n• 초기화 상태: ✅ 초기화됨\n\n**임베딩 모델:**\n• 모델명: sentence-transformers/all-MiniLM-L6-v2\n• 차원: 384\n• 모델 형태: (384,)\n• 샘플 벡터 크기: 0.0000\n\n**저장된 데이터:**\n• 총 문서 수: 0개\n• 총 벡터 수: 0개\n• 평균 문서 길이: 0.0 문자"
        except Exception as e:
            logger.error(f"Error in _get_vector_store_info: {e}")
            return f"❌ 벡터스토어 정보 실패: {str(e)}"
    
    def _get_vector_content(self) -> str:
        """벡터 내용 확인"""
        try:
            return "📭 벡터스토어에 저장된 내용이 없습니다."
        except Exception as e:
            logger.error(f"Error in _get_vector_content: {e}")
            return f"❌ 벡터 내용 확인 실패: {str(e)}"
