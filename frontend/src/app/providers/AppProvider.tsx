import React, { useContext, useEffect, useState, createContext, ReactNode } from 'react';
import { apiClient } from '../../shared/services/apiClient';
import type { Project, Experience, Education, Certification } from '../../entities';

interface AppState {
  projects: Project[];
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  isLoading: boolean;
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

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const [backendProjectsData, experiencesData, educationsData, certificationsData] = await Promise.all([
          apiClient.getProjects(),
          apiClient.getExperiences(),
          apiClient.getEducation(),
          apiClient.getCertifications()
        ]);

        setProjects(backendProjectsData);
        setExperiences(experiencesData);
        setEducations(educationsData);
        setCertifications(certificationsData);
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