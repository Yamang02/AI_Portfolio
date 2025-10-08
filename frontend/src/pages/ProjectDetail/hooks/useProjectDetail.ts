import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project } from '../../../features/projects/types';
import { useApp } from '../../../app/providers';

// 프로젝트 데이터 캐시
const projectCache = new Map<string, Project>();

export interface UseProjectDetailReturn {
  project: Project | null;
  loading: boolean;
  error: string | null;
  markdownContent: string;
  handleBack: () => void;
}

/**
 * 프로젝트 상세 정보를 관리하는 최적화된 훅
 */
export const useProjectDetail = (): UseProjectDetailReturn => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 프로젝트 데이터 메모이제이션
  const project = useMemo(() => {
    if (!id) return null;
    
    // 캐시에서 먼저 확인
    const cachedProject = projectCache.get(id);
    if (cachedProject) {
      return cachedProject;
    }
    
    // 프로젝트 목록에서 찾기
    const foundProject = projects.find(p => p.id === id);
    if (foundProject) {
      projectCache.set(id, foundProject);
      return foundProject;
    }
    
    return null;
  }, [id, projects]);

  // 마크다운 컨텐츠 메모이제이션
  const markdownContent = useMemo(() => {
    if (!project) return '';
    return project.readme || project.description || '';
  }, [project]);

  // 로딩 상태 관리
  useEffect(() => {
    if (project) {
      setLoading(false);
      setError(null);
    } else if (id && projects.length > 0) {
      // 프로젝트를 찾을 수 없는 경우
      setLoading(false);
      setError('프로젝트를 찾을 수 없습니다.');
    }
  }, [project, id, projects]);

  // 뒤로가기 핸들러
  const handleBack = useMemo(() => () => {
    navigate('/');
  }, [navigate]);

  return {
    project,
    loading,
    error,
    markdownContent,
    handleBack
  };
};
