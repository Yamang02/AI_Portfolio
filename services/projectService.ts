import { Project } from '../types';
import { PROJECTS } from '../constants';
import GitHubService from './githubService';

interface ProjectCache {
  projects: Project[];
  lastUpdated: number;
  version: string;
}

class ProjectService {
  private cache: ProjectCache | null = null;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간
  private readonly CACHE_KEY = 'portfolio_projects_cache';
  private githubService: GitHubService;

  constructor() {
    // 환경 변수에서 GitHub 사용자명 가져오기
    const githubUsername = import.meta.env.VITE_GITHUB_USERNAME;
    this.githubService = new GitHubService(githubUsername || '');
  }

  /**
   * 프로젝트 목록을 가져옵니다 (GitHub API 우선, 캐시 백업)
   */
  async getProjects(): Promise<Project[]> {
    try {
      // 1. 로컬 캐시 확인
      const cachedProjects = this.getCachedProjects();
      if (cachedProjects && this.isCacheValid(cachedProjects.lastUpdated)) {
        console.log('📦 캐시된 프로젝트 정보 사용');
        return cachedProjects.projects;
      }

      // 2. GitHub API에서 최신 정보 가져오기
      console.log('🔄 GitHub에서 최신 프로젝트 정보 가져오는 중...');
      const githubProjects = await this.fetchFromGitHub();
      
      if (githubProjects.length > 0) {
        // 3. 캐시 업데이트
        this.updateCache(githubProjects);
        return githubProjects;
      }

      // 4. GitHub API 실패 시 기본 프로젝트 사용
      console.log('⚠️ GitHub API 실패, 기본 프로젝트 정보 사용');
      return PROJECTS;

    } catch (error) {
      console.error('프로젝트 정보 가져오기 실패:', error);
      return PROJECTS; // 폴백으로 기본 프로젝트 사용
    }
  }



  /**
   * GitHub API에서 프로젝트 정보를 가져옵니다
   */
  private async fetchFromGitHub(): Promise<Project[]> {
    try {
      const githubProjects = await this.githubService.getPortfolioProjects();
      
      // GitHub 프로젝트를 로컬 형식으로 변환
      return githubProjects.map((repo: any) => ({
        id: repo.id,
        title: repo.title,
        description: repo.description,
        technologies: repo.technologies,
        githubUrl: repo.githubUrl,
        liveUrl: repo.liveUrl,
        imageUrl: repo.imageUrl,
        readme: repo.readme,
        stars: repo.stars,
        forks: repo.forks,
        updatedAt: repo.updatedAt
      }));
    } catch (error) {
      console.error('GitHub API 호출 실패:', error);
      return [];
    }
  }

  /**
   * 로컬 캐시에서 프로젝트 정보를 가져옵니다
   */
  private getCachedProjects(): ProjectCache | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('캐시 읽기 실패:', error);
      return null;
    }
  }

  /**
   * 캐시가 유효한지 확인합니다
   */
  private isCacheValid(lastUpdated: number): boolean {
    return Date.now() - lastUpdated < this.CACHE_DURATION;
  }

  /**
   * 캐시를 업데이트합니다
   */
  private updateCache(projects: Project[]): void {
    try {
      const cache: ProjectCache = {
        projects,
        lastUpdated: Date.now(),
        version: '1.0.0'
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      console.log('💾 프로젝트 캐시 업데이트 완료');
    } catch (error) {
      console.error('캐시 업데이트 실패:', error);
    }
  }

  /**
   * 캐시를 강제로 새로고침합니다
   */
  async refreshCache(): Promise<Project[]> {
    console.log('🔄 캐시 강제 새로고침...');
    this.cache = null;
    localStorage.removeItem(this.CACHE_KEY);
    return this.getProjects();
  }

  /**
   * 특정 프로젝트의 README를 가져옵니다
   */
  async getProjectReadme(projectId: number): Promise<string | null> {
    const projects = await this.getProjects();
    const project = projects.find(p => p.id === projectId);
    return project?.readme || null;
  }

  /**
   * 프로젝트 검색 기능
   */
  async searchProjects(query: string): Promise<Project[]> {
    const projects = await this.getProjects();
    const lowerQuery = query.toLowerCase();
    
    return projects.filter(project => 
      project.title.toLowerCase().includes(lowerQuery) ||
      project.description.toLowerCase().includes(lowerQuery) ||
      project.technologies.some(tech => tech.toLowerCase().includes(lowerQuery))
    );
  }
}

export default ProjectService; 