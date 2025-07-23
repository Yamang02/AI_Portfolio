export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  visibility: string;
}

export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

class GitHubService {
  private baseUrl = 'https://api.github.com';
  private username: string;

  constructor(username: string) {
    this.username = username;
  }

  /**
   * 사용자의 공개 레포지토리 목록을 가져옵니다
   */
  async getUserRepos(): Promise<GitHubRepo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${this.username}/repos?sort=updated&per_page=100`);
      
      if (!response.ok) {
        // 404 에러는 조용히 처리 (사용자가 없거나 접근 권한이 없는 경우)
        if (response.status === 404) {
          console.warn(`GitHub 사용자를 찾을 수 없습니다: ${this.username}`);
          return [];
        }
        throw new Error(`GitHub API 요청 실패: ${response.status}`);
      }

      const repos: GitHubRepo[] = await response.json();
      
      // 포크된 레포지토리 제외하고, 포트폴리오에 적합한 레포지토리만 필터링
      return repos.filter(repo => 
        !repo.name.includes('.github.io') && // GitHub Pages 레포지토리 제외
        !repo.name.includes('portfolio') && // 포트폴리오 레포지토리 제외
        repo.visibility === 'public' && // 공개 레포지토리만
        repo.description && // 설명이 있는 레포지토리만
        repo.language // 언어가 감지된 레포지토리만
      );
    } catch (error) {
      console.error('GitHub 레포지토리 가져오기 실패:', error);
      return [];
    }
  }

  /**
   * 사용자 정보를 가져옵니다
   */
  async getUserInfo(): Promise<GitHubUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${this.username}`);
      
      if (!response.ok) {
        throw new Error(`GitHub API 요청 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub 사용자 정보 가져오기 실패:', error);
      return null;
    }
  }

  /**
   * 레포지토리의 README 내용을 가져옵니다
   */
  async getRepoReadme(repoName: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${this.username}/${repoName}/readme`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      // Base64로 인코딩된 내용을 디코딩
      return atob(data.content);
    } catch (error) {
      console.error(`README 가져오기 실패 (${repoName}):`, error);
      return null;
    }
  }

  /**
   * 레포지토리의 특정 파일 내용을 가져옵니다
   */
  async getRepoFile(repoName: string, filePath: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${this.username}/${repoName}/contents/${filePath}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      // Base64로 인코딩된 내용을 디코딩
      return atob(data.content);
    } catch (error) {
      console.error(`파일 가져오기 실패 (${repoName}/${filePath}):`, error);
      return null;
    }
  }

  /**
   * 포트폴리오 관련 파일을 찾습니다
   */
  async findPortfolioFile(repoName: string): Promise<string | null> {
    const portfolioFiles = ['portfolio.md', 'PORTFOLIO.md', 'README.md'];
    
    for (const file of portfolioFiles) {
      const content = await this.getRepoFile(repoName, file);
      if (content) {
        return content;
      }
    }
    
    return null;
  }

  /**
   * 프로젝트 정보를 가져옵니다
   */
  async getProjectInfo(projectTitle: string): Promise<any | null> {
    try {
      // 1. 먼저 사용자의 모든 레포지토리를 가져옵니다
      const repos = await this.getUserRepos();
      
      // 2. 프로젝트 제목과 매칭되는 레포지토리를 찾습니다
      const matchingRepo = repos.find(repo => {
        const repoName = repo.name.toLowerCase();
        const projectName = projectTitle.toLowerCase();
        
        // 정확한 매칭 또는 부분 매칭
        return repoName === projectName || 
               repoName.includes(projectName) || 
               projectName.includes(repoName);
      });
      
      if (!matchingRepo) {
        return null;
      }
      
      // 3. README와 포트폴리오 정보를 가져옵니다
      const readme = await this.getRepoReadme(matchingRepo.name);
      const portfolioInfo = await this.findPortfolioFile(matchingRepo.name);
      
      // 4. 기술 스택을 추출합니다
      const technologies = [
        matchingRepo.language,
        ...(matchingRepo.topics || [])
      ].filter(Boolean);
      
      return {
        title: matchingRepo.name,
        description: matchingRepo.description || '',
        technologies,
        githubUrl: matchingRepo.html_url,
        liveUrl: matchingRepo.homepage || null,
        readme: readme || '',
        portfolioInfo: portfolioInfo || '',
        stars: matchingRepo.stargazers_count,
        forks: matchingRepo.forks_count,
        updatedAt: matchingRepo.updated_at
      };
    } catch (error) {
      console.error('프로젝트 정보 가져오기 실패:', error);
      return null;
    }
  }

  /**
   * 포트폴리오 프로젝트 목록을 가져옵니다
   */
  async getPortfolioProjects(): Promise<any[]> {
    try {
      const repos = await this.getUserRepos();
      const projects = [];
      
      for (const repo of repos) {
        const projectInfo = await this.getProjectInfo(repo.name);
        if (projectInfo) {
          projects.push(projectInfo);
        }
      }
      
      return projects;
    } catch (error) {
      console.error('포트폴리오 프로젝트 가져오기 실패:', error);
      return [];
    }
  }
}

export default GitHubService; 