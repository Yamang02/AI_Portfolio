"""Context Builder interface for Clean Architecture."""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from ..entities.chat import AnalysisResult


class ContextBuilder(ABC):
    """Interface for context building service."""
    
    @abstractmethod
    async def build_context(
        self, 
        analysis: AnalysisResult, 
        user_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Build context for AI processing based on analysis.
        
        Args:
            analysis: Question analysis result
            user_context: Optional user-provided context
            
        Returns:
            Context dictionary with structured information
        """
        pass