"""
Demo Main Entry Point
데모 메인 진입점

헥사고널 아키텍처를 적용한 RAG 데모 애플리케이션의 메인 진입점입니다.
"""

import sys
import os
import logging
import gradio as gr

# Core 모듈 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'core'))
sys.path.append('/app')

from adapters.inbound.ui.gradio.gradio_adapter import GradioAdapter

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """메인 함수 - Use Case 기반 헥사고널 아키텍처 데모"""
    try:
        logger.info("🚀 Starting AI Portfolio RAG Demo with Hexagonal Architecture")
        
        # Gradio 어댑터 초기화 (Use Case 기반)
        logger.info("🎨 Initializing Gradio adapter with Use Cases...")
        gradio_adapter = GradioAdapter()
        
        # Gradio 인터페이스 생성
        logger.info("🖥️ Creating Gradio interface...")
        interface = gradio_adapter.create_interface()
        
        # 서버 시작
        logger.info("🌐 Starting Gradio server...")
        interface.launch(
            server_name="0.0.0.0",
            server_port=7860,
            share=False,
            debug=True,
            show_error=True
        )
        
    except Exception as e:
        logger.error(f"❌ Failed to start demo: {e}")
        raise


if __name__ == "__main__":
    main()
