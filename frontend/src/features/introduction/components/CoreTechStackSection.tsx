import React, { useState, useEffect } from 'react';
import { TechStackMetadata } from '@entities/tech-stack';
import { TechStackApi } from '@shared/techStackApi';
import { TechStackBadge } from '@shared/ui';

/**
 * 소개 섹션용 핵심 기술 스택 컴포넌트
 * 사용자의 핵심 기술 스택을 시각적으로 표시
 */
export const CoreTechStackSection: React.FC = () => {
  const [coreTechs, setCoreTechs] = useState<TechStackMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoreTechs = async () => {
      try {
        setLoading(true);
        const data = await TechStackApi.getCoreTechStackMetadata();
        setCoreTechs(data);
        setError(null);
      } catch (err) {
        console.error('핵심 기술 스택 조회 실패:', err);
        setError('핵심 기술 스택을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoreTechs();
  }, []);

  if (loading) {
    return (
      <div className="my-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">핵심 기술 스택</h3>
        <div className="flex flex-wrap gap-2 items-center">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="w-16 h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-[skeleton-loading_1.5s_infinite] rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">핵심 기술 스택</h3>
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          <p className="text-sm m-0">{error}</p>
        </div>
      </div>
    );
  }

  if (coreTechs.length === 0) {
    return (
      <div className="my-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">핵심 기술 스택</h3>
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          <p className="text-sm m-0">표시할 핵심 기술 스택이 없습니다.</p>
        </div>
      </div>
    );
  }

  // 레벨별로 그룹화 (단순화)
  const coreLevelTechs = coreTechs.filter(tech => tech.level === 'core');
  const generalLevelTechs = coreTechs.filter(tech => tech.level === 'general');

  return (
    <div className="my-4">
      <div className="flex flex-wrap justify-center gap-3 items-center">
        {coreTechs.map((tech) => (
          <TechStackBadge
            key={tech.name}
            tech={tech}
            variant="default"
            size="md"
          />
        ))}
      </div>
    </div>
  );
};
