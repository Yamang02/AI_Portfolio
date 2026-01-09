import React from 'react';
import { useEasterEggStore } from '../store/easterEggStore';
import { easterEggRegistry } from '../registry/easterEggRegistry';
import type { EasterEggTrigger } from '../model/easter-egg.types';

interface EasterEggListPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const EasterEggListPanel: React.FC<EasterEggListPanelProps> = ({
  isOpen,
  onToggle,
}) => {
  const { isEasterEggDiscovered } = useEasterEggStore();
  const triggers = easterEggRegistry.getTriggers();

  // 발견된 이스터에그와 미발견 이스터에그 분리
  const discoveredTriggers = triggers.filter(trigger => isEasterEggDiscovered(trigger.id));
  const undiscoveredTriggers = triggers.filter(trigger => !isEasterEggDiscovered(trigger.id));

  const totalCount = triggers.length;
  const discoveredCount = discoveredTriggers.length;
  const progressPercentage = totalCount > 0 ? Math.round((discoveredCount / totalCount) * 100) : 0;

  return (
    <div className={`fixed left-0 top-0 h-screen w-96 max-w-full bg-surface dark:bg-slate-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 border-r border-border ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        {/* 패널 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary text-center w-full">이스터에그 목록</h2>
          <button
            onClick={onToggle}
            className="text-text-secondary hover:text-text-primary transition-colors absolute right-4"
            aria-label="패널 닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 진행 상황 표시 */}
        <div className="p-4 border-b border-border bg-surface-elevated dark:bg-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">발견 진행률</span>
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              {discoveredCount} / {totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2.5">
            <div
              className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">
            {progressPercentage === 100 
              ? '모든 이스터에그를 발견했습니다!' 
              : `${totalCount - discoveredCount}개의 이스터에그가 더 있습니다.`}
          </p>
        </div>

        {/* 스크롤 가능한 목록 영역 */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-slate-500">
          {/* 발견된 이스터에그 */}
          {discoveredTriggers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                발견됨 ({discoveredTriggers.length})
              </h3>
              <div className="space-y-2">
                {discoveredTriggers.map(trigger => (
                  <EasterEggItem key={trigger.id} trigger={trigger} isDiscovered={true} />
                ))}
              </div>
            </div>
          )}

          {/* 미발견 이스터에그 */}
          {undiscoveredTriggers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                미발견 ({undiscoveredTriggers.length})
              </h3>
              <div className="space-y-2">
                {undiscoveredTriggers.map(trigger => (
                  <EasterEggItem key={trigger.id} trigger={trigger} isDiscovered={false} />
                ))}
              </div>
            </div>
          )}

          {/* 이스터에그가 없는 경우 */}
          {triggers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🥚</div>
              <p className="text-text-muted">등록된 이스터에그가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface EasterEggItemProps {
  trigger: EasterEggTrigger;
  isDiscovered: boolean;
}

const EasterEggItem: React.FC<EasterEggItemProps> = ({ trigger, isDiscovered }) => {
  return (
    <div
      className={`
        p-3 rounded-lg border transition-all duration-200
        ${isDiscovered
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 opacity-60'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isDiscovered ? (
              <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <h4 className={`text-sm font-medium ${isDiscovered ? 'text-text-primary' : 'text-text-muted'}`}>
              {trigger.name}
            </h4>
          </div>
          {/* 미발견 이스터에그: 힌트 표시 */}
          {!isDiscovered && (trigger.hint || trigger.description) && (
            <p className="text-xs ml-6 mt-1 text-text-muted">
              💡 {trigger.hint || trigger.description}
            </p>
          )}
          {/* 발견된 이스터에그: 구체적인 트리거 조건 표시 */}
          {isDiscovered && (trigger.triggerDescription || trigger.description) && (
            <p className="text-xs ml-6 mt-1 text-text-secondary">
              ✓ {trigger.triggerDescription || trigger.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export { EasterEggListPanel };

