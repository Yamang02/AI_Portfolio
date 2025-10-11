import { TechStackMetadata, TechStackStatistics } from '../../entities/techstack';

// API 기본 URL (환경변수 또는 기본값)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * 기술 스택 메타데이터 API 클라이언트
 */
export class TechStackApi {
  private static readonly BASE_URL = `${API_BASE_URL}/api/tech-stack`;

  /**
   * 모든 활성화된 기술 스택 메타데이터 조회
   */
  static async getAllTechStackMetadata(): Promise<TechStackMetadata[]> {
    const response = await fetch(`${this.BASE_URL}`);
    const data = await response.json();
    return data.data || [];
  }

  /**
   * 핵심 기술 스택 메타데이터만 조회
   */
  static async getCoreTechStackMetadata(): Promise<TechStackMetadata[]> {
    const response = await fetch(`${this.BASE_URL}/core`);
    const data = await response.json();
    return data.data || [];
  }

  /**
   * 기술명으로 특정 기술 스택 조회
   */
  static async getTechStackMetadataByName(name: string): Promise<TechStackMetadata> {
    const response = await fetch(`${this.BASE_URL}/${encodeURIComponent(name)}`);
    const data = await response.json();
    return data.data;
  }

  /**
   * 카테고리별 기술 스택 조회
   */
  static async getTechStackMetadataByCategory(category: string): Promise<TechStackMetadata[]> {
    const response = await fetch(`${this.BASE_URL}/category/${encodeURIComponent(category)}`);
    const data = await response.json();
    return data.data || [];
  }

  /**
   * 레벨별 기술 스택 조회
   */
  static async getTechStackMetadataByLevel(level: string): Promise<TechStackMetadata[]> {
    const response = await fetch(`${this.BASE_URL}/level/${encodeURIComponent(level)}`);
    const data = await response.json();
    return data.data || [];
  }

  /**
   * 카테고리와 레벨로 기술 스택 조회
   */
  static async getTechStackMetadataByCategoryAndLevel(
    category: string, 
    level: string
  ): Promise<TechStackMetadata[]> {
    const response = await fetch(
      `${this.BASE_URL}/category/${encodeURIComponent(category)}/level/${encodeURIComponent(level)}`
    );
    const data = await response.json();
    return data.data || [];
  }

  /**
   * 기술명 검색
   */
  static async searchTechStackMetadata(name: string): Promise<TechStackMetadata[]> {
    const response = await fetch(`${this.BASE_URL}/search?name=${encodeURIComponent(name)}`);
    const data = await response.json();
    return data.data || [];
  }

  /**
   * 프로젝트에서 사용된 기술 스택들의 메타데이터 조회
   */
  static async getTechnologiesUsedInProjects(): Promise<TechStackMetadata[]> {
    const response = await fetch(`${this.BASE_URL}/used-in-projects`);
    const data = await response.json();
    return data.data || [];
  }

  /**
   * 기술 스택 통계 정보 조회
   */
  static async getTechStackStatistics(): Promise<TechStackStatistics> {
    const response = await fetch(`${this.BASE_URL}/statistics`);
    const data = await response.json();
    return data.data;
  }

  /**
   * 기술명 목록으로 기술 스택 메타데이터 조회
   */
  static async getTechStackMetadataByNames(names: string[]): Promise<TechStackMetadata[]> {
    // 현재 API에 해당 엔드포인트가 없으므로 개별 조회로 구현
    const promises = names.map(name => 
      this.getTechStackMetadataByName(name).catch(() => null)
    );
    
    const results = await Promise.all(promises);
    return results.filter((tech): tech is TechStackMetadata => tech !== null);
  }
}
