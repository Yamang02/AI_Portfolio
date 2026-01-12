import React, { useContext, useEffect, useState, createContext, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useProjectsQuery } from '../../entities/project/api/useProjectsQuery';
import { useExperiencesQuery } from '../../entities/experience/api/useExperienceQuery';
import { useEducationQuery } from '../../entities/education/api/useEducationQuery';
import { useCertificationsQuery } from '../../entities/certification/api/useCertificationQuery';
import type { Project, Experience, Education, Certification } from '../../entities';

interface AppState {
  projects: Project[];
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  isLoading: boolean;
  // 개별 로딩 상태 추가
  loadingStates: {
    projects: boolean;
    experiences: boolean;
    educations: boolean;
    certifications: boolean;
  };
}

interface AppContextValue extends AppState {
  // UI state
  isWideScreen: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  // UI 상태
  const [isWideScreen, setIsWideScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 2400;
    }
    return true;
  });

  // 홈페이지에서는 데이터 로딩 지연 (크리티컬 체인 최적화)
  // 다른 페이지로 이동할 때만 데이터 로드
  const shouldLoadData = !isHomePage;

  // React Query를 사용한 데이터 로드
  // localStorage에 캐시가 있으면 즉시 표시, 없으면 API 호출
  // 홈페이지에서는 enabled: false로 설정하여 로딩 지연
  const { data: projects = [], isLoading: projectsLoading } = useProjectsQuery(undefined, {
    enabled: shouldLoadData,
  });
  const { data: experiences = [], isLoading: experiencesLoading } = useExperiencesQuery({
    enabled: shouldLoadData,
  });
  const { data: educations = [], isLoading: educationsLoading } = useEducationQuery({
    enabled: shouldLoadData,
  });
  const { data: certifications = [], isLoading: certificationsLoading } = useCertificationsQuery({
    enabled: shouldLoadData,
  });

  // 로딩 상태 계산
  const isLoading = projectsLoading || experiencesLoading || educationsLoading || certificationsLoading;
  
  const loadingStates = {
    projects: projectsLoading,
    experiences: experiencesLoading,
    educations: educationsLoading,
    certifications: certificationsLoading,
  };

  // 화면 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 2400);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const value: AppContextValue = {
    // Data state
    projects,
    experiences,
    educations,
    certifications,
    isLoading,
    loadingStates,
    
    // UI state
    isWideScreen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};