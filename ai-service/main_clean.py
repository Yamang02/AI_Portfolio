"""
Main application entry point - Clean Architecture
"""

import uvicorn
import logging
from fastapi import FastAPI

from presentation.demo.demo_controller import DemoController

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Portfolio Service",
    description="Clean Architecture RAG Service with Demo UI",
    version="2.0.0"
)

# Initialize demo controller
demo_controller = DemoController()


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "architecture": "clean"}


@app.on_event("startup")
async def startup():
    """Startup event."""
    logger.info("🚀 Clean Architecture AI Service Starting...")
    logger.info("📊 Demo UI available at /demo")


# Mount Gradio demo
try:
    demo_interface = demo_controller.create_gradio_interface()
    app = demo_interface.mount_to(app, path="/demo")
    logger.info("✅ Demo UI mounted successfully")
except Exception as e:
    logger.error(f"❌ Failed to mount demo UI: {e}")


if __name__ == "__main__":
    uvicorn.run(
        "main_clean:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )