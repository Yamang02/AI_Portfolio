import React, { useState, useEffect } from 'react';
import { useProjectQuery } from '../../entities/project';
import { ChatbotWidget } from '../../widgets/chatbot';
import { useApp } from '../../main/providers';

// 로딩 스켈레톤 컴포넌트
const ProjectDetailSkeleton: React.FC = () => (
  <div className="min-h-screen bg-white">
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* 헤더 스켈레톤 */}
      <div className="animate-pulse mb-8">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-28"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      
      {/* 컨텐츠 스켈레톤 */}
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  </div>
);

// 에러 컴포넌트
const ProjectDetailError: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-6">
      <div className="text-6xl mb-4">😵</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">프로젝트를 불러올 수 없습니다</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        다시 시도
      </button>
    </div>
  </div>
);

const ProjectDetailPage: React.FC = () => {
  const { isChatbotOpen, onChatbotToggle } = useApp();
  const [projectId, setProjectId] = useState<string>('');

  // URL에서 프로젝트 ID 추출
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    if (id) {
      setProjectId(id);
    }
  }, []);

  // 프로젝트 데이터 가져오기
  const { 
    data: project, 
    isLoading, 
    error, 
    refetch 
  } = useProjectQuery(projectId);

  // 로딩 상태
  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  // 에러 상태
  if (error) {
    return (
      <ProjectDetailError 
        error={error.message || '프로젝트를 불러오는 중 오류가 발생했습니다.'} 
        onRetry={() => refetch()} 
      />
    );
  }

  // 프로젝트가 없는 경우
  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">프로젝트를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청하신 프로젝트가 존재하지 않거나 삭제되었습니다.</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 프로젝트 상세 내용 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 프로젝트 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h1>
          
          {/* 프로젝트 메타 정보 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.type === 'BUILD' 
                ? 'bg-green-100 text-green-800' 
                : project.type === 'LAB'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {project.type === 'BUILD' ? '개발' : project.type === 'LAB' ? '실험' : '유지보수'}
            </span>
            
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.isTeam 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {project.isTeam ? '팀 프로젝트' : '개인 프로젝트'}
            </span>
            
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : project.status === 'in_progress'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {project.status === 'completed' ? '완료' : 
               project.status === 'in_progress' ? '진행중' : '유지보수'}
            </span>
          </div>

          {/* 프로젝트 링크 */}
          <div className="flex gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            )}
            
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                라이브 데모
              </a>
            )}
          </div>
        </div>

        {/* 프로젝트 설명 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">프로젝트 소개</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed">{project.description}</p>
          </div>
        </div>

        {/* 기술 스택 */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">사용 기술</h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech.id}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* README 내용 */}
        {project.readme && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">상세 정보</h2>
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: project.readme }} />
            </div>
          </div>
        )}
      </div>

      {/* 챗봇 위젯 */}
      <ChatbotWidget
        isOpen={isChatbotOpen}
        onToggle={onChatbotToggle}
        showProjectButtons={true}
      />
    </div>
  );
};

export default ProjectDetailPage;
