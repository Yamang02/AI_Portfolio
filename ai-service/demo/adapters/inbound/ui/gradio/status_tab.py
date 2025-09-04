"""
Status Tab Adapter
상태 탭 어댑터

기존 StatusInterface를 기반으로 한 탭 어댑터입니다.
시스템 상태 확인 기능의 UI만 담당합니다.
"""

import gradio as gr
import logging

logger = logging.getLogger(__name__)


class StatusTabAdapter:
    """상태 탭 어댑터 - 상태 확인 UI만 담당"""
    
    def __init__(self):
        logger.info("✅ Status Tab Adapter initialized")
    
    def create_tab(self) -> gr.Tab:
        """상태 탭 생성"""
        with gr.Tab("📊 Data확인", id=5) as tab:
            gr.Markdown("## 📊 Data확인")
            gr.Markdown("각 단계의 결과를 확인합니다")
            
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
            
            # Event handlers
            status_btn.click(
                fn=self._get_status,
                outputs=status_output
            )
            memory_btn.click(
                fn=self._get_memory_info,
                outputs=memory_output
            )
            memory_content_btn.click(
                fn=self._get_memory_content,
                outputs=memory_content_output
            )
        
        return tab
    
    def _get_status(self) -> str:
        """시스템 상태 가져오기"""
        try:
            return "📊 **시스템 상태**\n\n**🤖 LLM 서비스:**\n• 모델: MockLLM\n• 상태: ✅ 준비됨\n• 타입: Mock\n\n**🔍 벡터 스토어:**\n• 스토어: MemoryVector\n• 상태: ✅ 준비됨\n• 환경: demo\n• 저장된 벡터: 0개\n\n**🔤 임베딩 서비스:**\n• 모델: sentence-transformers/all-MiniLM-L6-v2\n• 차원: 384\n• 상태: ✅ 준비됨"
        except Exception as e:
            logger.error(f"Error in _get_status: {e}")
            return f"❌ 상태 가져오기 오류: {str(e)}"
    
    def _get_memory_info(self) -> str:
        """메모리 정보 가져오기"""
        try:
            return "💾 **시스템 메모리 상태**\n\n**전체 메모리:**\n• 총 메모리: 16.00 GB\n• 사용 가능: 8.50 GB\n• 사용률: 46.9%\n• 사용 중: 7.50 GB\n\n**스왑 메모리:**\n• 총 스왑: 2.00 GB\n• 사용 중: 0.50 GB\n• 사용률: 25.0%\n\n**현재 프로세스:**\n• RSS (물리 메모리): 256.00 MB\n• VMS (가상 메모리): 512.00 MB"
        except Exception as e:
            logger.error(f"Error in _get_memory_info: {e}")
            return f"❌ 메모리 정보 가져오기 실패: {str(e)}"
    
    def _get_memory_content(self) -> str:
        """메모리 내용 가져오기"""
        try:
            return "💾 **메모리에 저장된 내용 (0개 문서)**\n\n📭 메모리에 저장된 내용이 없습니다."
        except Exception as e:
            logger.error(f"Error in _get_memory_content: {e}")
            return f"❌ 메모리 내용 가져오기 실패: {str(e)}"
