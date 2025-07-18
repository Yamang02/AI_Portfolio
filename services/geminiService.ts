
import { GoogleGenAI } from "@google/genai";
import { PROJECTS } from '../constants';
import GitHubService from './githubService';
import { generateSystemPrompt } from './prompts/chatbotPersona';
import { generateContextualPrompt } from './prompts/conversationPatterns';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this example, we assume it's set.
  console.warn("API_KEY environment variable not set. Using a placeholder. AI features will not work.");
  process.env.API_KEY = "placeholder-key";
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// GitHub 서비스 인스턴스 (사용자명을 실제 GitHub 사용자명으로 변경하세요)
const githubService = new GitHubService('Yamang02'); // 실제 GitHub 사용자명으로 변경

// 프로젝트 정보 캐시
let cachedProjects: any[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

// 허용된 프로젝트 ID 목록 (보안 강화)
const ALLOWED_PROJECT_IDS = PROJECTS.map(p => p.id);

// GitHub에서 프로젝트 정보를 가져오는 함수
const getProjectsFromGitHub = async (): Promise<any[]> => {
  const now = Date.now();
  
  // 캐시가 유효한 경우 캐시된 데이터 반환
  if (cachedProjects.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedProjects;
  }

  try {
    // GitHub API에서 프로젝트 정보 가져오기
    const githubProjects = await githubService.getPortfolioProjects();
    
    // constants.ts의 기본 정보와 병합
    const mergedProjects = PROJECTS.map(localProject => {
      const githubProject = githubProjects.find(gp => {
        // GitHub URL이 정확히 일치하는 경우
        if (gp.githubUrl === localProject.githubUrl) {
          return true;
        }
        
        // 프로젝트명에서 키워드 매칭
        const localTitle = localProject.title.toLowerCase();
        const githubTitle = gp.name.toLowerCase();
        
        // 주요 키워드로 매칭
        const keywords = localTitle.split(/[\s()]+/).filter(word => word.length > 2);
        return keywords.some(keyword => 
          githubTitle.includes(keyword) || 
          keyword.includes(githubTitle)
        );
      });
      
      if (githubProject) {
        return {
          ...localProject,
          description: githubProject.description || localProject.description,
          technologies: githubProject.technologies.length > 0 ? githubProject.technologies : localProject.technologies,
          readme: githubProject.readme || localProject.readme,
          stars: githubProject.stars,
          forks: githubProject.forks,
          updatedAt: githubProject.updatedAt
        };
      }
      
      return localProject;
    });

    // 캐시 업데이트
    cachedProjects = mergedProjects;
    cacheTimestamp = now;
    
    return mergedProjects;
  } catch (error) {
    console.error('GitHub 프로젝트 정보 가져오기 실패:', error);
    // 실패 시 기본 프로젝트 정보 반환
    return PROJECTS;
  }
};

// This function now gets its data from GitHub API with fallback to constants
const generateProjectContext = async (): Promise<string> => {
  const projects = await getProjectsFromGitHub();
  
  return projects.map(p => {
    const contextParts = [
      `프로젝트명: ${p.title}`,
      `설명: ${p.description}`,
      `사용 기술: ${p.technologies.join(', ')}`
    ];
    if (p.githubUrl) {
      contextParts.push(`GitHub 주소: ${p.githubUrl}`);
    }
    if (p.liveUrl) {
      contextParts.push(`라이브 데모 주소: ${p.liveUrl}`);
    }
    // README 내용을 더 자연스럽게 처리
    const readmeContent = p.readme.trim();
    if (readmeContent) {
      contextParts.push(`상세 정보:\n${readmeContent}`);
    }
    return contextParts.join('\n');
  }).join('\n\n');
};

// 질문에서 프로젝트 ID를 추출하는 함수 (보안 강화)
const extractProjectIdsFromQuestion = (question: string): number[] => {
  const projectIds: number[] = [];
  
  // 프로젝트 제목에서 ID 매칭
  PROJECTS.forEach(project => {
    if (question.toLowerCase().includes(project.title.toLowerCase())) {
      projectIds.push(project.id);
    }
  });
  
  return projectIds;
};

// The function signature is simplified. It no longer needs the 'projects' array passed to it.
export const getChatbotResponse = async (question: string): Promise<string> => {
  if (process.env.API_KEY === "placeholder-key") {
    return "I_CANNOT_ANSWER";
  }

  // 보안 검사: 질문에서 추출된 프로젝트 ID가 허용된 목록에 있는지 확인
  const mentionedProjectIds = extractProjectIdsFromQuestion(question);
  const hasUnauthorizedProjects = mentionedProjectIds.some(id => !ALLOWED_PROJECT_IDS.includes(id));
  
  if (hasUnauthorizedProjects) {
    return "I_CANNOT_ANSWER";
  }

  // It generates the context from GitHub API with fallback to constants.
  const projectContext = await generateProjectContext();

  // 새로운 프롬프트 시스템 사용
  const allowedProjects = PROJECTS.map(p => p.title || '').filter(title => title);
  const systemInstruction = generateSystemPrompt(allowedProjects, projectContext);
  const contextualPrompt = generateContextualPrompt(question, projectContext);

  const prompt = `${contextualPrompt}\n\n사용자 질문: "${question}"`;

  try {
    // 타임아웃 설정 (30초)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('API 요청 타임아웃')), 30000);
    });

    const apiPromise = ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: `${systemInstruction}\n\n--- 프로젝트 컨텍스트 시작 ---\n\n${projectContext}\n\n--- 프로젝트 컨텍스트 끝 ---`,
        },
    });

    const response = await Promise.race([apiPromise, timeoutPromise]) as any;
    const text = response.text || '';
    
    // 응답이 너무 짧으면 에러로 처리
    if (text.trim().length < 10) {
      console.error("API 응답이 너무 짧습니다:", text);
      return "I_CANNOT_ANSWER";
    }
    
    return text;
  } catch (error) {
    console.error("Error fetching response from Gemini API:", error);
    
    // 구체적인 에러 메시지 로깅
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    
    return "I_CANNOT_ANSWER";
  }
};