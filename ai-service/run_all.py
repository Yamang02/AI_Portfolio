#!/usr/bin/env python3
"""
FastAPI + Gradio 통합 실행 스크립트
두 서비스를 별도 포트에서 동시 실행
"""

import asyncio
import logging
import sys
import threading
import time
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def run_fastapi():
    """FastAPI 서버 실행"""
    try:
        import uvicorn
        logger.info("🚀 Starting FastAPI server on port 8000...")
        uvicorn.run(
            "main:app", 
            host="0.0.0.0", 
            port=8000, 
            reload=False,  # 통합 실행시에는 reload 비활성화
            log_level="info"
        )
    except Exception as e:
        logger.error(f"❌ FastAPI server failed: {e}")


def run_gradio_demo():
    """Gradio 데모 실행"""
    try:
        time.sleep(2)  # FastAPI가 먼저 시작되도록 약간 지연
        logger.info("🎨 Starting Gradio demo on port 7860...")
        
        from demo import create_demo_interface
        demo = create_demo_interface()
        
        demo.launch(
            server_name="0.0.0.0",
            server_port=7860,
            share=False,
            show_error=True,
            show_api=False
        )
    except Exception as e:
        logger.error(f"❌ Gradio demo failed: {e}")


def main():
    """메인 실행 함수"""
    try:
        logger.info("🚀 Starting AI Portfolio Service...")
        logger.info("📍 FastAPI: http://localhost:8000")
        logger.info("📍 API Docs: http://localhost:8000/docs")
        logger.info("📍 Gradio Demo: http://localhost:7860")
        logger.info("🔄 Press Ctrl+C to stop both services")
        
        # FastAPI를 별도 스레드에서 실행
        fastapi_thread = threading.Thread(target=run_fastapi, daemon=True)
        fastapi_thread.start()
        
        # Gradio를 메인 스레드에서 실행 (GUI 때문)
        run_gradio_demo()
        
    except KeyboardInterrupt:
        logger.info("👋 Services stopped by user")
    except Exception as e:
        logger.error(f"❌ Failed to start services: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()