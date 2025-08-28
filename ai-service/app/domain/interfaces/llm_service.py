"""LLM Service interface for Clean Architecture."""

from abc import ABC, abstractmethod
from typing import Dict, Any
from ..entities.chat import AnalysisResult


class LLMService(ABC):
    """Interface for Large Language Model service."""
    
    @abstractmethod
    async def generate_response(
        self, 
        question: str, 
        context: Dict[str, Any],
        analysis: AnalysisResult
    ) -> str:
        """Generate response using LLM.
        
        Args:
            question: User's question
            context: Context information
            analysis: Question analysis result
            
        Returns:
            Generated response text
        """
        pass
    
    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the model.
        
        Returns:
            Model information dictionary
        """
        pass