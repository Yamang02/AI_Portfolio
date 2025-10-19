export interface ValidationResult {
  valid: boolean;
  reason?: 'empty_question' | 'too_long' | 'spam_pattern' | 'too_short';
  message?: string;
}

export interface QuestionAnalysis {
  type: 'normal' | 'personal_info' | 'simple_greeting' | 'spam';
  shouldShowEmailButton: boolean;
  immediateResponse?: string;
}

/**
 * 질문의 기본 유효성 검증
 */
export const validateQuestion = (question: string): ValidationResult => {
  const trimmedQuestion = question.trim();
  
  // 1. 빈 질문 체크
  if (!trimmedQuestion) {
    return { 
      valid: false, 
      reason: 'empty_question',
      message: '질문을 입력해주세요.'
    };
  }
  
  // 2. 너무 짧은 질문 체크
  if (trimmedQuestion.length < 2) {
    return { 
      valid: false, 
      reason: 'too_short',
      message: '질문을 2자 이상 입력해주세요.'
    };
  }
  
  // 3. 길이 제한 체크
  if (trimmedQuestion.length > 500) {
    return { 
      valid: false, 
      reason: 'too_long',
      message: '질문은 500자 이하로 입력해주세요.'
    };
  }
  
  // 4. 스팸 패턴 체크 (단순한 것들)
  const spamPatterns = [
    'ㅋㅋㅋㅋㅋ', 'ㅎㅎㅎㅎㅎ', '!!!!!', '?????', '...',
    'ㅋㅋㅋㅋ', 'ㅎㅎㅎㅎ', '!!!!', '????'
  ];
  
  if (spamPatterns.some(pattern => trimmedQuestion.includes(pattern))) {
    return { 
      valid: false, 
      reason: 'spam_pattern',
      message: '적절한 질문을 입력해주세요.'
    };
  }
  
  return { valid: true };
};

/**
 * 질문 타입 분석 (프론트엔드에서 처리 가능한 것들)
 * 
 * 프론트엔드에서는 기본적인 검증만 수행하고,
 * 비즈니스 로직은 백엔드에서 통합 처리
 */
export const analyzeQuestion = (question: string): QuestionAnalysis => {
  const lowerQuestion = question.toLowerCase();
  
  // 1. 단순 인사말 감지 (즉시 응답 가능)
  const greetingKeywords = [
    '안녕', '안녕하세요', '하이', 'hi', 'hello', '반갑', '만나서 반가워',
    '안녕하세요', '안녕하세요!', '안녕하세요~', '안녕하세요.'
  ];
  
  const isGreeting = greetingKeywords.some(keyword => 
    lowerQuestion.includes(keyword.toLowerCase())
  );
  
  if (isGreeting) {
    return {
      type: 'simple_greeting',
      shouldShowEmailButton: false,
      immediateResponse: '안녕하세요! 👋 저는 AI 포트폴리오 비서입니다. 궁금한 점이나 알고 싶은 내용을 자유롭게 질문해 주세요!'
    };
  }
  
  // 2. 명백한 스팸 감지 (즉시 차단)
  const obviousSpamIndicators = [
    /[ㅋㅎ]{5,}/, // ㅋㅋㅋㅋㅋ, ㅎㅎㅎㅎㅎ
    /[!?]{5,}/,   // !!!!!, ?????
    /[.]{5,}/,    // .....
    /[가-힣]*[ㅋㅎ]{3,}[가-힣]*/, // 한글 중간에 ㅋㅋㅋ
  ];
  
  const isObviousSpam = obviousSpamIndicators.some(pattern => pattern.test(question));
  
  if (isObviousSpam) {
    return {
      type: 'spam',
      shouldShowEmailButton: false,
      immediateResponse: '적절한 질문을 입력해주세요. 포트폴리오나 프로젝트에 대한 질문을 해주시면 도움을 드릴 수 있습니다.'
    };
  }
  
  // 3. 일반 질문 (백엔드로 전송하여 통합 처리)
  return {
    type: 'normal',
    shouldShowEmailButton: false
  };
};

/**
 * 통합 질문 처리
 */
export const processQuestion = (question: string): {
  shouldSendToBackend: boolean;
  immediateResponse?: string;
  showEmailButton: boolean;
  validationError?: string;
} => {
  // 1. 기본 검증
  const validation = validateQuestion(question);
  if (!validation.valid) {
    return {
      shouldSendToBackend: false,
      showEmailButton: false,
      validationError: validation.message
    };
  }
  
  // 2. 질문 분석
  const analysis = analyzeQuestion(question);
  
  // 3. 즉시 응답이 있는 경우
  if (analysis.immediateResponse) {
    return {
      shouldSendToBackend: false,
      immediateResponse: analysis.immediateResponse,
      showEmailButton: analysis.shouldShowEmailButton
    };
  }
  
  // 4. 백엔드로 전송
  return {
    shouldSendToBackend: true,
    showEmailButton: false
  };
}; 