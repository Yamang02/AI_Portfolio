"""
LLM Generation Service
Handles Gemini API calls for response generation
"""

import logging
from typing import Optional
import google.generativeai as genai
from ...core.config import get_config_manager

logger = logging.getLogger(__name__)


class LLMService:
    """LLM service for generating responses using Gemini"""
    
    def __init__(self):
        self.config = get_config_manager()
        self.generation_config = self.config.get_generation_config()
        self.external_config = self.config.external
        
        # Initialize Gemini
        if self.external_config.GEMINI_API_KEY:
            genai.configure(api_key=self.external_config.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(
                model_name=self.generation_config.get('model', 'gemini-pro')
            )
        else:
            logger.warning("GEMINI_API_KEY not found. LLM service will not work.")
            self.model = None
    
    async def generate_response(
        self, 
        question: str, 
        context: str, 
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Generate AI response using Gemini
        
        Args:
            question: User question
            context: Portfolio context
            system_prompt: System prompt (optional)
        
        Returns:
            Generated response
        """
        if not self.model:
            return "죄송합니다. AI 서비스를 사용할 수 없습니다. API 키를 확인해주세요."
        
        try:
            # Build prompt
            if system_prompt is None:
                system_prompt = self.generation_config.get('system_prompt_template', '')
            
            prompt = f"""
{system_prompt}

포트폴리오 정보:
{context}

사용자 질문: {question}

위 포트폴리오 정보를 바탕으로 친근하고 전문적으로 답변해주세요.
"""
            
            # Generate response
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=self.generation_config.get('temperature', 0.3),
                    max_output_tokens=self.generation_config.get('max_tokens', 1000),
                )
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    
    def is_available(self) -> bool:
        """Check if LLM service is available"""
        return self.model is not None and self.external_config.GEMINI_API_KEY is not None
