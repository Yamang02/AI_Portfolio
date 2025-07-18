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
   * 레포지토리를 포트폴리오 프로젝트 형식으로 변환합니다
   */
  async getPortfolioProjects(): Promise<any[]> {
    const repos = await this.getUserRepos();
    
    const projects = await Promise.all(
      repos.slice(0, 10).map(async (repo) => {
        const readme = await this.getRepoReadme(repo.name);
        
        return {
          id: repo.id,
          title: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: repo.description || '설명이 없습니다.',
          technologies: [repo.language, ...repo.topics].filter(Boolean),
          githubUrl: repo.html_url,
          liveUrl: repo.homepage || null,
          imageUrl: `https://images.unsplash.com/photo-1614728263952-84ea256ec346?q=80&w=800&h=600&auto=format&fit=crop`, // 기본 이미지
          readme: readme || `# ${repo.name}\n\n${repo.description || '설명이 없습니다.'}`,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updatedAt: repo.updated_at
        };
      })
    );

    return projects.sort((a, b) => b.stars - a.stars); // 스타 수로 정렬
  }
}

export default GitHubService; 