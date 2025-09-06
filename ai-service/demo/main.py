"""
Demo Main Entry Point
데모 메인 진입점

헥사고널 아키텍처를 적용한 RAG 데모 애플리케이션의 메인 진입점입니다.
애플리케이션 부트스트래퍼를 통해 의존성 주입과 초기화를 관리합니다.
"""

import sys
import os
import logging
import gradio as gr

# Core 모듈 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'core'))
sys.path.append('/app')

from application_bootstrap import ApplicationFactory

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """메인 함수 - 애플리케이션 부트스트래퍼를 통한 헥사고널 아키텍처 데모"""
    try:
        logger.info("🚀 Starting AI Portfolio RAG Demo with Hexagonal Architecture")
        
        # 애플리케이션 팩토리를 통한 애플리케이션 생성
        logger.info("🏗️ Creating application instance...")
        app_factory = ApplicationFactory()
        ui_composer = app_factory.create_application()
        
        # Gradio 인터페이스 생성
        logger.info("🎨 Creating Gradio interface...")
        interface = ui_composer.create_interface()
        
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
