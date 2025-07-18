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
   * 레포지토리의 특정 파일 내용을 가져옵니다 (README, portfolio.md 등)
   */
  async getRepoFile(repoName: string, filePath: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${this.username}/${repoName}/contents/${filePath}`);
      
      if (!response.ok) {
        // 404 에러는 조용히 처리 (파일이 없는 경우)
        return null;
      }

      const data = await response.json();
      // Base64로 인코딩된 내용을 디코딩
      return atob(data.content);
    } catch (error) {
      // 네트워크 에러 등만 로그 출력
      if (error instanceof Error && !error.message?.includes('404')) {
        console.error(`파일 가져오기 실패 (${repoName}/${filePath}):`, error);
      }
      return null;
    }
  }

  /**
   * 레포지토리에서 포트폴리오 정보 파일을 가져옵니다 (docs/portfolio.md로 고정)
   */
  async findPortfolioFile(repoName: string): Promise<string | null> {
    try {
      const content = await this.getRepoFile(repoName, 'docs/portfolio.md');
      if (content) {
        console.log(`포트폴리오 파일 발견: ${repoName}/docs/portfolio.md`);
        return content;
      }
    } catch (error) {
      // 파일이 없으면 null 반환 (404 에러 로그 출력 안함)
      return null;
    }

    return null;
  }

  /**
   * 특정 프로젝트의 GitHub 정보를 가져옵니다
   */
  async getProjectInfo(projectTitle: string): Promise<any | null> {
    // 프로젝트 제목에서 레포지토리명 추출
    const repoNameMap: { [key: string]: string } = {
      'PYQT5 파일 태거 (File Tagger)': 'PYQT5_FileTagger',
      'AI 포트폴리오 챗봇 (AI Portfolio Chatbot)': 'AI_Portfolio',
      '성균관대학교 순수미술 동아리 갤러리 (SKKU FAC)': 'SKKU_FAC'
    };

    const repoName = repoNameMap[projectTitle];
    if (!repoName) {
      console.warn(`프로젝트에 대한 레포지토리 매핑을 찾을 수 없습니다: ${projectTitle}`);
      return null;
    }

    try {
      // 레포지토리 정보 가져오기
      const response = await fetch(`${this.baseUrl}/repos/${this.username}/${repoName}`);
      
      if (!response.ok) {
        console.warn(`레포지토리를 찾을 수 없습니다: ${repoName}`);
        return null;
      }

      const repo: GitHubRepo = await response.json();
      
      // README와 포트폴리오용 MD 파일 가져오기
      const [readme, portfolioInfo] = await Promise.all([
        this.getRepoReadme(repoName),
        this.findPortfolioFile(repoName)
      ]);
      
      return {
        id: repo.id,
        title: projectTitle,
        description: repo.description || '설명이 없습니다.',
        technologies: [repo.language, ...repo.topics].filter(Boolean),
        githubUrl: repo.html_url,
        liveUrl: repo.homepage || null,
        imageUrl: `https://images.unsplash.com/photo-1614728263952-84ea256ec346?q=80&w=800&h=600&auto=format&fit=crop`,
        readme: readme || `# ${repo.name}\n\n${repo.description || '설명이 없습니다.'}`,
        portfolioInfo: portfolioInfo || null,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updatedAt: repo.updated_at
      };
    } catch (error) {
      console.error(`프로젝트 정보 가져오기 실패 (${projectTitle}):`, error);
      return null;
    }
  }

  /**
   * 레포지토리를 포트폴리오 프로젝트 형식으로 변환합니다
   */
  async getPortfolioProjects(): Promise<any[]> {
    const repos = await this.getUserRepos();
    
    const projects = await Promise.all(
      repos.slice(0, 10).map(async (repo) => {
        // README와 포트폴리오용 MD 파일 가져오기
        const [readme, portfolioInfo] = await Promise.all([
          this.getRepoReadme(repo.name),
          this.findPortfolioFile(repo.name) // 여러 위치에서 포트폴리오 파일 찾기
        ]);
        
        return {
          id: repo.id,
          title: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: repo.description || '설명이 없습니다.',
          technologies: [repo.language, ...repo.topics].filter(Boolean),
          githubUrl: repo.html_url,
          liveUrl: repo.homepage || null,
          imageUrl: `https://images.unsplash.com/photo-1614728263952-84ea256ec346?q=80&w=800&h=600&auto=format&fit=crop`,
          readme: readme || `# ${repo.name}\n\n${repo.description || '설명이 없습니다.'}`,
          portfolioInfo: portfolioInfo || null, // 포트폴리오용 추가 정보
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updatedAt: repo.updated_at
        };
      })
    );

    return projects.sort((a, b) => b.stars - a.stars);
  }
}

export default GitHubService; 