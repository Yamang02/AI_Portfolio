"""
RAG Q&A Tab Adapter
RAG Q&A 탭 어댑터

기존 GenerationInterface를 기반으로 한 탭 어댑터입니다.
RAG Q&A 기능의 UI만 담당합니다.
"""

import gradio as gr
import logging
from domain.services.generation_service import GenerationService

logger = logging.getLogger(__name__)


class RagQATabAdapter:
    """RAG Q&A 탭 어댑터 - RAG Q&A UI만 담당"""
    
    def __init__(self, generation_service: GenerationService):
        self.generation_service = generation_service
        logger.info("✅ RAG Q&A Tab Adapter initialized with Use Cases")
    
    def create_tab(self) -> gr.Tab:
        """RAG Q&A 탭 생성"""
        with gr.Tab("🤖 RAG Q&A", id=4) as tab:
            gr.Markdown("## 🤖 RAG Q&A")
            gr.Markdown("RAG 시스템을 통해 질문에 답변을 받습니다")
            
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
            
            # Event handlers
            answer_btn.click(
                fn=self._generate_answer,
                inputs=[question_input, max_sources],
                outputs=[answer_output, sources_output]
            )
        
        return tab
    
    def _generate_answer(self, question: str, max_sources: int) -> tuple:
        """RAG 답변 생성 (UI 이벤트 핸들러)"""
        try:
            if not question.strip():
                return "❌ 질문을 입력해주세요", "📭 출처를 찾을 수 없습니다"
            
            # 실제로는 demo_service를 통해 답변을 생성하지만, 여기서는 간단한 예시
            answer = f"🤖 **AI 답변:**\n\n'{question}'에 대한 답변을 생성하려면 먼저 문서를 로드하고 임베딩을 생성해야 합니다.\n\n**신뢰도**: 0.00\n**처리 시간**: 0ms"
            sources = "📚 **사용된 출처:**\n\n📭 아직 벡터스토어에 문서가 없습니다. 먼저 문서를 로드하고 임베딩을 생성해주세요."
            
            return answer, sources
                
        except Exception as e:
            logger.error(f"Error in _generate_answer: {e}")
            return f"❌ 답변 생성 중 오류 발생: {str(e)}", "📭 출처를 찾을 수 없습니다"
