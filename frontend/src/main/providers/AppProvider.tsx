import React, { useContext, useEffect, useState, createContext, ReactNode } from 'react';
import { apiClient } from '../../shared/services/apiClient';
import type { Project, Experience, Education, Certification } from '../entities';

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
  isChatbotOpen: boolean;
  isHistoryPanelOpen: boolean;
  isWideScreen: boolean;
  
  // Actions
  setChatbotOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setHistoryPanelOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
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
  // UI 상태
  const [isChatbotOpen, setChatbotOpen] = useState(false);
  const [isHistoryPanelOpen, setHistoryPanelOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 2400;
    }
    return true;
  });
  const [isWideScreen, setIsWideScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 2400;
    }
    return true;
  });

  // 데이터 상태
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    projects: true,
    experiences: true,
    educations: true,
    certifications: true,
  });

  // 데이터 로드 - 점진적 로딩 방식
  useEffect(() => {
    const loadData = async () => {
      try {
        // 각 API를 개별적으로 호출하여 점진적 로딩
        const loadProjects = async () => {
          try {
            const data = await apiClient.getProjects();
            setProjects(data);
            setLoadingStates(prev => ({ ...prev, projects: false }));
          } catch (error) {
            console.error('프로젝트 데이터 로드 오류:', error);
            setLoadingStates(prev => ({ ...prev, projects: false }));
          }
        };

        const loadExperiences = async () => {
          try {
            const data = await apiClient.getExperiences();
            setExperiences(data);
            setLoadingStates(prev => ({ ...prev, experiences: false }));
          } catch (error) {
            console.error('경험 데이터 로드 오류:', error);
            setLoadingStates(prev => ({ ...prev, experiences: false }));
          }
        };

        const loadEducations = async () => {
          try {
            const data = await apiClient.getEducation();
            setEducations(data);
            setLoadingStates(prev => ({ ...prev, educations: false }));
          } catch (error) {
            console.error('교육 데이터 로드 오류:', error);
            setLoadingStates(prev => ({ ...prev, educations: false }));
          }
        };

        const loadCertifications = async () => {
          try {
            const data = await apiClient.getCertifications();
            setCertifications(data);
            setLoadingStates(prev => ({ ...prev, certifications: false }));
          } catch (error) {
            console.error('자격증 데이터 로드 오류:', error);
            setLoadingStates(prev => ({ ...prev, certifications: false }));
          }
        };

        // 병렬로 모든 데이터 로드 시작
        await Promise.allSettled([
          loadProjects(),
          loadExperiences(),
          loadEducations(),
          loadCertifications()
        ]);

      } catch (error) {
        console.error('데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
    isChatbotOpen,
    isHistoryPanelOpen,
    isWideScreen,
    
    // Actions
    setChatbotOpen,
    setHistoryPanelOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};