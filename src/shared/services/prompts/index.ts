// 프롬프트 관련 함수들
export { generateSystemPrompt } from './chatbotPersona';
export { generateContextualPrompt } from './conversationPatterns';

// 프롬프트 타입 정의
export interface PromptConfig {
  allowedProjects: string[];
  projectContext: string;
  question: string;
}

export interface SystemPromptConfig {
  allowedProjects: string[];
  projectContext: string;
}

export interface ContextualPromptConfig {
  question: string;
  projectContext: string;
} 