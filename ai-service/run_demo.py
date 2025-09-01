#!/usr/bin/env python3
"""
독립 실행형 Gradio 데모
FastAPI와 별도로 실행할 수 있는 데모 스크립트
"""

import logging
import sys
import os
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


def main():
    """독립 실행형 Gradio 데모 실행"""
    try:
        logger.info("🚀 Starting standalone Gradio demo...")
        
        from demo import create_demo_interface
        
        demo = create_demo_interface()
        
        # 독립 실행
        demo.launch(
            server_name="0.0.0.0",
            server_port=7860,
            share=False,
            show_error=True,
            show_api=False
        )
        
    except KeyboardInterrupt:
        logger.info("👋 Demo stopped by user")
    except Exception as e:
        logger.error(f"❌ Failed to start demo: {e}")
        logger.exception("Full error details:")
        sys.exit(1)


if __name__ == "__main__":
    main()