"""
HuggingFace Spaces Entry Point - Clean Architecture Demo
"""

import logging
import sys
import os
from pathlib import Path

# Add project root to Python path for Clean Architecture imports
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Configure logging for HuggingFace Spaces
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

try:
    # Import Clean Architecture components
    from presentation.demo.demo_controller import DemoController
    
    logger.info("🚀 Initializing Clean Architecture RAG Demo for HuggingFace Spaces")
    
    # Create demo controller
    demo_controller = DemoController()
    
    # Create Gradio interface
    demo_interface = demo_controller.create_gradio_interface()
    
    logger.info("✅ Clean Architecture Demo Interface Ready")
    
    # Launch for HuggingFace Spaces
    if __name__ == "__main__":
        demo_interface.launch(
            server_name="0.0.0.0",
            server_port=7860,  # HuggingFace Spaces default port
            share=False,
            debug=False,
            show_error=True,
            quiet=False
        )

except Exception as e:
    logger.error(f"❌ Failed to initialize demo: {e}")
    
    # Create fallback simple interface
    import gradio as gr
    
    def error_interface():
        return gr.Blocks(
            title="RAG Demo - Initialization Error"
        ) as demo:
            gr.HTML(f"""
            <div style="text-align: center; padding: 50px;">
                <h1>🚫 Demo Initialization Error</h1>
                <p>Failed to load Clean Architecture components:</p>
                <code>{str(e)}</code>
                <br><br>
                <p>Please check the logs for more details.</p>
            </div>
            """)
            return demo
    
    # Fallback interface
    demo_interface = error_interface()
    
    if __name__ == "__main__":
        demo_interface.launch(
            server_name="0.0.0.0",
            server_port=7860,
            share=False
        )