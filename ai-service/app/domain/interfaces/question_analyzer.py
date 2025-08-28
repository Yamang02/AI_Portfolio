"""Question Analyzer interface for Clean Architecture."""

from abc import ABC, abstractmethod
from ..entities.chat import AnalysisResult


class QuestionAnalyzer(ABC):
    """Interface for question analysis service."""
    
    @abstractmethod
    async def analyze(self, question: str) -> AnalysisResult:
        """Analyze a question and determine how to process it.
        
        Args:
            question: User's question text
            
        Returns:
            Analysis result with question type and processing strategy
        """
        pass