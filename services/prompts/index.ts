// 프롬프트 관리 시스템 통합 내보내기
export * from './chatbotPersona';
export * from './conversationPatterns';

// 프롬프트 설정 타입
export interface PromptConfig {
  persona: {
    role: string;
    personality: string;
    behavior: string[];
    responseStyle: string[];
    limitations: string[];
  };
  patterns: {
    types: string[];
    examples: string[];
  };
}

// 현재 프롬프트 설정 가져오기
export const getCurrentPromptConfig = (): PromptConfig => {
  const { CHATBOT_PERSONA } = require('./chatbotPersona');
  const { CONVERSATION_PATTERNS } = require('./conversationPatterns');
  
  return {
    persona: {
      role: CHATBOT_PERSONA.role,
      personality: CHATBOT_PERSONA.personality,
      behavior: CHATBOT_PERSONA.behavior,
      responseStyle: CHATBOT_PERSONA.responseStyle,
      limitations: CHATBOT_PERSONA.limitations
    },
    patterns: {
      types: CONVERSATION_PATTERNS.map((p: any) => p.type),
      examples: CONVERSATION_PATTERNS.flatMap((p: any) => p.examples)
    }
  };
}; 