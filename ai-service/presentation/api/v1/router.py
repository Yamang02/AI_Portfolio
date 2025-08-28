"""
API v1 Router
Main router for all v1 API endpoints
"""

from fastapi import APIRouter
from .chat import router as chat_router

api_router = APIRouter()

# Include sub-routers
api_router.include_router(chat_router, prefix="/chat", tags=["chat"])