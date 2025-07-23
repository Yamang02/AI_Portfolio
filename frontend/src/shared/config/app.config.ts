// 프론트엔드 애플리케이션 설정
export interface AppConfig {
  // 애플리케이션 기본 정보
  app: {
    name: string;
    description: string;
    contactEmail: string;
    version: string;
    developerName: string;
    developerTitle: string;
  };
  
  // API 설정
  api: {
    baseUrl: string;
    timeout: number;
  };
  
  // 캐시 설정
  cache: {
    duration: number; // 24시간 (밀리초)
    maxProjects: number;
  };
}

// 환경 변수에서 설정 로드
const loadConfig = (): AppConfig => {
  return {
    app: {
      name: 'AI Portfolio Chatbot',
      description: '개발자 포트폴리오 AI 챗봇',
      contactEmail: 'ljj0210@gmail.com',
      version: '1.0.0',
      developerName: '이정준',
      developerTitle: 'Here Comes New Challenger!!',
    },
    
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL || '',
      timeout: 30000, // 30초
    },
    
    cache: {
      duration: 24 * 60 * 60 * 1000, // 24시간
      maxProjects: 10,
    },
  };
};

export const appConfig = loadConfig();

// 설정 유효성 검사
export const validateConfig = (): void => {
  const requiredEnvVars = [
    'VITE_API_BASE_URL',
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Missing required environment variables:', missingVars);
    console.warn('Please check your .env.local file');
  }
}; 