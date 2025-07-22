import { GoogleGenAI } from "@google/genai";
import { ALL_PROJECTS, GITHUB_PROJECTS } from '../../features/projects';
import GitHubService from './githubService';
import { generateSystemPrompt } from './prompts/chatbotPersona';
import { generateContextualPrompt } from './prompts/conversationPatterns';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set. Using a placeholder. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "placeholder-key" });

import { appConfig } from '../config/app.config';

// GitHub 서비스 인스턴스 (설정에서 사용자명 가져오기)
const githubService = new GitHubService(appConfig.github.username);

// 프로젝트 정보 캐시
let cachedProjects: any[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

// 허용된 프로젝트 ID 목록 (보안 강화)
const ALLOWED_PROJECT_IDS = ALL_PROJECTS.map(p => p.id);

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
    
    // GitHub 프로젝트만 API 정보와 병합
    const mergedProjects = ALL_PROJECTS.map(localProject => {
      // GitHub 소스가 아닌 프로젝트는 그대로 반환
      if (localProject.source !== 'github') {
        return localProject;
      }
      
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
    return ALL_PROJECTS;
  }
};

// This function now gets its data from GitHub API with fallback to constants
const generateProjectContext = async (): Promise<string> => {
  const projects = await getProjectsFromGitHub();
  return projects.map(p => {
    const contextParts = [
      `프로젝트명: ${p.title}`,
      `설명: ${p.description}`,
      `팀 프로젝트: ${p.isTeam ? '예' : '아니오'}`,
      p.isTeam
        ? (p.myContributions && p.myContributions.length > 0
            ? `내 기여:\n- ${p.myContributions.join('\n- ')}`
            : '내 기여: (기여 내용 미입력)')
        : '내 기여: 전체 기획/개발',
      `사용 기술: ${p.technologies.join(', ')}`
    ];
    if (p.githubUrl) {
      contextParts.push(`GitHub 주소: ${p.githubUrl}`);
    }
    if (p.liveUrl) {
      contextParts.push(`라이브 데모 주소: ${p.liveUrl}`);
    }
    const readmeContent = p.readme.trim();
    if (readmeContent) {
      contextParts.push(`상세 정보:\n${readmeContent}`);
    }
    return contextParts.join('\n');
  }).join('\n\n');
};

// 질문에서 프로젝트 ID를 추출하는 함수 (보안 강화)
const extractProjectIdsFromQuestion = (question: string): string[] => {
  const projectIds: string[] = [];
  
  // 프로젝트 제목에서 ID 매칭
  ALL_PROJECTS.forEach(project => {
    if (question.toLowerCase().includes(project.title.toLowerCase())) {
      projectIds.push(project.id);
    }
  });
  
  return projectIds;
};

// 선택된 프로젝트의 맥락을 유지하는 함수
export const getChatbotResponse = async (question: string, selectedProject?: string): Promise<string> => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return "I_CANNOT_ANSWER";
  }

  // 보안 검사: 질문에서 추출된 프로젝트 ID가 허용된 목록에 있는지 확인
  const mentionedProjectIds = extractProjectIdsFromQuestion(question);
  const hasUnauthorizedProjects = mentionedProjectIds.some(id => !ALLOWED_PROJECT_IDS.includes(id));
  
  if (hasUnauthorizedProjects) {
    return "I_CANNOT_ANSWER";
  }

  let projectContext: string;

  // 선택된 프로젝트가 있으면 해당 프로젝트의 상세 정보만 가져오기
  if (selectedProject) {
    try {
      const projectInfo = await githubService.getProjectInfo(selectedProject);
      if (projectInfo) {
        const contextParts = [
          `프로젝트명: ${projectInfo.title}`,
          `설명: ${projectInfo.description}`,
          `팀 프로젝트: ${projectInfo.isTeam ? '예' : '아니오'}`,
          projectInfo.isTeam
            ? (projectInfo.myContributions && projectInfo.myContributions.length > 0
                ? `내 기여:\n- ${projectInfo.myContributions.join('\n- ')}`
                : '내 기여: (기여 내용 미입력)')
            : '내 기여: 전체 기획/개발',
          `사용 기술: ${projectInfo.technologies.join(', ')}`
        ];
        if (projectInfo.githubUrl) {
          contextParts.push(`GitHub 주소: ${projectInfo.githubUrl}`);
        }
        if (projectInfo.liveUrl) {
          contextParts.push(`라이브 데모 주소: ${projectInfo.liveUrl}`);
        }
        if (projectInfo.readme) {
          contextParts.push(`상세 정보:\n${projectInfo.readme}`);
        }
        if (projectInfo.portfolioInfo) {
          contextParts.push(`포트폴리오 정보:\n${projectInfo.portfolioInfo}`);
        }
        projectContext = contextParts.join('\n');
      } else {
        // GitHub에서 정보를 가져올 수 없으면 기본 정보 사용
        const defaultProject = ALL_PROJECTS.find(p => p.title === selectedProject);
        projectContext = defaultProject ? 
          `프로젝트명: ${defaultProject.title}\n설명: ${defaultProject.description}\n사용 기술: ${defaultProject.technologies.join(', ')}\nGitHub 주소: ${defaultProject.githubUrl}` :
          await generateProjectContext();
      }
    } catch (error) {
      console.error('선택된 프로젝트 정보 가져오기 실패:', error);
      projectContext = await generateProjectContext();
    }
  } else {
    // 선택된 프로젝트가 없으면 전체 프로젝트 컨텍스트 사용
    projectContext = await generateProjectContext();
  }

  // 새로운 프롬프트 시스템 사용
  const allowedProjects = ALL_PROJECTS.map(p => p.title || '').filter(title => title);
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