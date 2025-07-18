export interface ConversationPattern {
  type: string;
  description: string;
  examples: string[];
  responseGuidance: string;
}

export const CONVERSATION_PATTERNS: ConversationPattern[] = [
  {
    type: "project_introduction",
    description: "프로젝트 소개 요청",
    examples: [
      "프로젝트에 대해 알려주세요",
      "이 프로젝트는 뭔가요?",
      "간단히 소개해줄 수 있어?",
      "프로젝트 설명해줘"
    ],
    responseGuidance: "프로젝트의 목적, 주요 기능, 사용 기술을 자연스럽게 설명"
  },
  
  {
    type: "tech_stack",
    description: "기술 스택 질문",
    examples: [
      "어떤 기술을 사용했어?",
      "기술 스택 알려줘",
      "개발 언어는 뭐야?",
      "사용한 프레임워크가 뭐야?"
    ],
    responseGuidance: "주요 기술들을 자연스럽게 설명하고, 왜 그 기술을 선택했는지 언급"
  },
  
  {
    type: "project_purpose",
    description: "프로젝트 목적/동기 질문",
    examples: [
      "왜 이 프로젝트를 만들었어?",
      "프로젝트 목적이 뭐야?",
      "어떤 문제를 해결하려고 했어?",
      "만든 이유가 뭐야?"
    ],
    responseGuidance: "프로젝트의 배경과 해결하려는 문제를 설명"
  },
  
  {
    type: "features",
    description: "주요 기능 질문",
    examples: [
      "주요 기능이 뭐야?",
      "어떤 기능들이 있어?",
      "핵심 기능 알려줘",
      "무엇을 할 수 있어?"
    ],
    responseGuidance: "핵심 기능들을 사용자 관점에서 설명"
  },
  
  {
    type: "development_process",
    description: "개발 과정 질문",
    examples: [
      "개발 과정은 어땠어?",
      "어떻게 만들었어?",
      "개발하면서 어려웠던 점은?",
      "개발 기간은 얼마나 걸렸어?"
    ],
    responseGuidance: "개발 과정에서의 경험과 학습한 점을 언급"
  },
  
  {
    type: "deployment",
    description: "배포 관련 질문",
    examples: [
      "어디에 배포했어?",
      "배포는 어떻게 했어?",
      "실제로 사용할 수 있어?",
      "라이브 데모가 있어?"
    ],
    responseGuidance: "배포 환경과 접근 방법을 설명"
  },
  
  {
    type: "comparison",
    description: "프로젝트 비교 질문",
    examples: [
      "다른 프로젝트와 비교하면?",
      "어떤 점이 특별해?",
      "차별화된 점이 뭐야?",
      "장점이 뭐야?"
    ],
    responseGuidance: "프로젝트의 특징과 장점을 객관적으로 설명"
  }
];

export const getPatternForQuestion = (question: string): ConversationPattern | null => {
  const lowerQuestion = question.toLowerCase();
  
  for (const pattern of CONVERSATION_PATTERNS) {
    if (pattern.examples.some(example => 
      lowerQuestion.includes(example.toLowerCase()) ||
      example.toLowerCase().includes(lowerQuestion)
    )) {
      return pattern;
    }
  }
  
  return null;
};

export const generateContextualPrompt = (question: string, projectContext: string): string => {
  const pattern = getPatternForQuestion(question);
  
  if (pattern) {
    return `사용자가 "${question}"라고 질문했습니다. 이는 "${pattern.description}" 유형의 질문입니다.

답변 가이드라인: ${pattern.responseGuidance}

프로젝트 컨텍스트를 바탕으로 자연스럽고 도움이 되는 답변을 제공해주세요.`;
  }
  
  return `사용자가 "${question}"라고 질문했습니다. 프로젝트 컨텍스트를 바탕으로 자연스럽고 도움이 되는 답변을 제공해주세요.`;
}; 