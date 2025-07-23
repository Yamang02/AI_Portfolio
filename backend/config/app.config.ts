// 애플리케이션 설정 중앙화
export interface AppConfig {
  // GitHub 설정
  github: {
    username: string;
    apiBaseUrl: string;
  };
  
  // AI 설정
  ai: {
    model: string;
    timeout: number;
    maxTokens: number;
  };
  
  // 애플리케이션 설정
  app: {
    name: string;
    description: string;
    contactEmail: string;
    version: string;
    developerName: string;
    developerTitle: string;
  };
  
  // 배포 설정
  deployment: {
    projectId: string;
    region: string;
    serviceName: string;
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
    github: {
      username: process.env.GITHUB_USERNAME || 'Yamang02',
      apiBaseUrl: 'https://api.github.com',
    },
    
    ai: {
      model: 'gemini-2.5-flash',
      timeout: 30000, // 30초
      maxTokens: 1000,
    },
    
    app: {
      name: 'AI Portfolio Chatbot',
      description: '개발자 포트폴리오 AI 챗봇',
      contactEmail: process.env.CONTACT_EMAIL || 'ljj0210@gmail.com',
      version: '1.0.0',
      developerName: '이정준',
      developerTitle: 'Here Comes New Challenger!!',
    },
    
    deployment: {
      projectId: process.env.PROJECT_ID || 'yamang02-ai-portfolio',
      region: process.env.REGION || 'asia-northeast3',
      serviceName: process.env.SERVICE_NAME || 'ai-portfolio-chatbot',
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
    'GEMINI_API_KEY',
    'GITHUB_USERNAME',
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Missing required environment variables:', missingVars);
    console.warn('Please check your environment configuration');
  }
}; 