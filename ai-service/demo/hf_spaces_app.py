"""
HuggingFace Spaces App Entry Point
RAG Pipeline Demonstration with Gradio
"""

import os
import sys
from pathlib import Path

# Add the current directory to the Python path for imports
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Set environment variables for demo mode
os.environ["ENV_TYPE"] = "demo"
os.environ["EMBEDDING_SERVICE_TYPE"] = "local"
os.environ["LLM_SERVICE_TYPE"] = "mock"
os.environ["VECTOR_STORE_TYPE"] = "memory"
os.environ["ENABLE_GRADIO_DEMO"] = "true"
os.environ["ENABLE_API_ENDPOINTS"] = "false"  # Gradio only for HF Spaces

# Import and run the demo
from main_demo import create_demo_interface

if __name__ == "__main__":
    # Create the Gradio interface
    demo_interface = create_demo_interface()
    
    # Launch the demo
    demo_interface.launch(
        server_name="0.0.0.0",
        server_port=7860,  # HuggingFace Spaces default port
        share=False,
        debug=False
    )