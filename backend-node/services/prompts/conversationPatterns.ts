// 대화 패턴 및 컨텍스트 프롬프트 생성
export const generateContextualPrompt = (question: string, projectContext: string): string => {
  const questionType = analyzeQuestionType(question);
  
  switch (questionType) {
    case 'technical':
      return generateTechnicalPrompt(question, projectContext);
    case 'overview':
      return generateOverviewPrompt(question, projectContext);
    case 'comparison':
      return generateComparisonPrompt(question, projectContext);
    case 'challenge':
      return generateChallengePrompt(question, projectContext);
    default:
      return generateGeneralPrompt(question, projectContext);
  }
};

// 질문 유형 분석
const analyzeQuestionType = (question: string): string => {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('기술') || lowerQuestion.includes('tech') || 
      lowerQuestion.includes('언어') || lowerQuestion.includes('프레임워크') ||
      lowerQuestion.includes('라이브러리') || lowerQuestion.includes('도구')) {
    return 'technical';
  }
  
  if (lowerQuestion.includes('개요') || lowerQuestion.includes('소개') || 
      lowerQuestion.includes('설명') || lowerQuestion.includes('뭐') ||
      lowerQuestion.includes('무엇')) {
    return 'overview';
  }
  
  if (lowerQuestion.includes('비교') || lowerQuestion.includes('차이') || 
      lowerQuestion.includes('장단점') || lowerQuestion.includes('vs')) {
    return 'comparison';
  }
  
  if (lowerQuestion.includes('어려움') || lowerQuestion.includes('문제') || 
      lowerQuestion.includes('도전') || lowerQuestion.includes('해결') ||
      lowerQuestion.includes('개선')) {
    return 'challenge';
  }
  
  return 'general';
};

// 기술 관련 프롬프트
const generateTechnicalPrompt = (question: string, projectContext: string): string => {
  return `다음 질문에 대해 기술적 세부사항을 중심으로 답변해주세요:

질문: "${question}"

프로젝트 정보:
${projectContext}

답변 시 다음을 포함해주세요:
- 사용된 기술 스택의 구체적인 버전이나 특징
- 각 기술이 프로젝트에서 어떤 역할을 했는지
- 기술 선택의 이유나 장점
- 구현 과정에서의 기술적 고려사항`;
};

// 개요 관련 프롬프트
const generateOverviewPrompt = (question: string, projectContext: string): string => {
  return `다음 질문에 대해 프로젝트의 전체적인 개요를 설명해주세요:

질문: "${question}"

프로젝트 정보:
${projectContext}

답변 시 다음을 포함해주세요:
- 프로젝트의 목적과 배경
- 주요 기능과 특징
- 프로젝트의 규모와 기간
- 달성한 결과나 성과`;
};

// 비교 관련 프롬프트
const generateComparisonPrompt = (question: string, projectContext: string): string => {
  return `다음 질문에 대해 비교 분석을 제공해주세요:

질문: "${question}"

프로젝트 정보:
${projectContext}

답변 시 다음을 포함해주세요:
- 비교 대상과의 차이점
- 각각의 장단점
- 선택한 기술이나 방법의 이유
- 실제 적용 결과의 차이`;
};

// 도전/문제 해결 관련 프롬프트
const generateChallengePrompt = (question: string, projectContext: string): string => {
  return `다음 질문에 대해 도전과제와 해결 과정을 설명해주세요:

질문: "${question}"

프로젝트 정보:
${projectContext}

답변 시 다음을 포함해주세요:
- 직면한 주요 도전과제
- 문제 해결을 위한 접근 방법
- 시행착오와 학습 과정
- 최종 해결책과 그 효과`;
};

// 일반적인 프롬프트
const generateGeneralPrompt = (question: string, projectContext: string): string => {
  return `다음 질문에 대해 친근하고 이해하기 쉽게 답변해주세요:

질문: "${question}"

프로젝트 정보:
${projectContext}

답변 시 다음을 고려해주세요:
- 질문의 의도를 정확히 파악
- 관련된 프로젝트 정보를 적절히 활용
- 명확하고 간결한 설명
- 추가 질문을 유도하는 친근한 톤`;
}; 