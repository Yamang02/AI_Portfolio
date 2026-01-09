import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, ProjectTypeBadge } from '@/design-system';
import { Project } from '@/main/entities/project/model/project.types';
import { TechStackList } from '@/shared/ui/tech-stack/TechStackList';
import { categorizeTechStack } from '@/shared/utils/techStackCategorization';
import styles from './ProjectSearchModal.module.css';

interface ProjectSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}

interface FilterState {
  techSearchQuery: string;
  projectType: 'all' | 'BUILD' | 'LAB' | 'MAINTENANCE';
  selectedTechs: string[];
}

export const ProjectSearchModal: React.FC<ProjectSearchModalProps> = ({
  isOpen,
  onClose,
  projects,
}) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>({
    techSearchQuery: '',
    projectType: 'all',
    selectedTechs: [],
  });

  // 사용 가능한 기술 스택 목록 추출 및 타입별 분류
  const categorizedTechs = useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach((project) => {
      project.technologies?.forEach((tech) => techSet.add(tech));
    });
    const techs = Array.from(techSet);
    // 타입별로 분류하고 각 타입 내에서 오름차순 정렬
    return categorizeTechStack(techs);
  }, [projects]);

  // 검색어로 필터링된 기술 스택 (타입별로 유지)
  const filteredCategorizedTechs = useMemo(() => {
    if (!filters.techSearchQuery.trim()) {
      return categorizedTechs;
    }
    
    const query = filters.techSearchQuery.toLowerCase().trim();
    return categorizedTechs
      .map((group) => ({
        ...group,
        techs: group.techs.filter((tech) =>
          tech.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.techs.length > 0);
  }, [categorizedTechs, filters.techSearchQuery]);

  // 필터링된 프로젝트 목록
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // 프로젝트 타입 필터
    if (filters.projectType !== 'all') {
      filtered = filtered.filter((project) => project.type === filters.projectType);
    }

    // 기술 스택 필터
    if (filters.selectedTechs.length > 0) {
      filtered = filtered.filter((project) =>
        filters.selectedTechs.some((selectedTech) =>
          project.technologies?.some((tech) =>
            tech.toLowerCase().includes(selectedTech.toLowerCase())
          )
        )
      );
    }

    return filtered;
  }, [projects, filters]);

  const handleTechSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, techSearchQuery: e.target.value });
  };

  const handleProjectTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, projectType: e.target.value as FilterState['projectType'] });
  };

  const handleTechToggle = (tech: string) => {
    setFilters({
      ...filters,
      selectedTechs: filters.selectedTechs.includes(tech)
        ? filters.selectedTechs.filter((t) => t !== tech)
        : [...filters.selectedTechs, tech],
    });
  };

  const handleResetFilters = () => {
    setFilters({
      techSearchQuery: '',
      projectType: 'all',
      selectedTechs: [],
    });
  };

  const handleRowClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
    onClose();
  };

  const hasActiveFilters =
    filters.techSearchQuery.trim() !== '' ||
    filters.projectType !== 'all' ||
    filters.selectedTechs.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="프로젝트 검색"
      width="1000px"
      className={styles.modal}
    >
      <div className={styles.container}>
        {/* 필터 섹션 */}
        <div className={styles.filters}>
          {/* 기술 스택 검색 입력 */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>기술 스택 검색</label>
            <input
              type="text"
              value={filters.techSearchQuery}
              onChange={handleTechSearchChange}
              placeholder="기술 스택으로 검색..."
              className={styles.searchInput}
            />
          </div>

          {/* 프로젝트 타입 필터 */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>프로젝트 타입</label>
            <select
              value={filters.projectType}
              onChange={handleProjectTypeChange}
              className={styles.select}
            >
              <option value="all">전체</option>
              <option value="BUILD">BUILD</option>
              <option value="LAB">LAB</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>

          {/* 필터 초기화 버튼 */}
          {hasActiveFilters && (
            <div className={styles.filterGroup}>
              <label className={styles.label}>&nbsp;</label>
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                필터 초기화
              </Button>
            </div>
          )}
        </div>

        {/* 기술 스택 필터 (타입별로 구분) */}
        {filteredCategorizedTechs.length > 0 && (
          <div className={styles.techFilterSection}>
            <label className={styles.label}>기술 스택 필터</label>
            {filteredCategorizedTechs.map((group) => (
              <div key={group.name} className={styles.techCategoryGroup}>
                <div className={styles.techCategoryHeader}>
                  <span className={styles.techCategoryName}>{group.name}</span>
                  <span className={styles.techCategoryCount}>({group.techs.length}개)</span>
                </div>
                <div className={styles.techBadges}>
                  {group.techs.map((tech) => (
                    <Button
                      key={tech}
                      variant={filters.selectedTechs.includes(tech) ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleTechToggle(tech)}
                      className={styles.techBadgeButton}
                    >
                      {tech}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            {filters.selectedTechs.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({ ...filters, selectedTechs: [] })}
                className={styles.clearTechsButton}
              >
                선택 해제 ({filters.selectedTechs.length}개)
              </Button>
            )}
          </div>
        )}

        {/* 결과 카운트 */}
        <div className={styles.resultCount}>
          총 {filteredProjects.length}개의 프로젝트
        </div>

        {/* 테이블 */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>프로젝트명</th>
                <th>프로젝트 타입</th>
                <th>기술 스택</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => handleRowClick(project.id)}
                    className={styles.tableRow}
                  >
                    <td className={styles.projectName}>{project.title}</td>
                    <td>
                      <ProjectTypeBadge type={project.type} size="sm" />
                    </td>
                    <td>
                      <div className={styles.techStackCell}>
                        {(() => {
                          const categorized = categorizeTechStack(project.technologies || []);
                          return categorized.map((group) => (
                            <div key={group.name} className={styles.techStackGroup}>
                              <span className={styles.techStackGroupLabel}>{group.name}:</span>
                              <TechStackList
                                technologies={group.techs}
                                variant="compact"
                                size="sm"
                                maxVisible={10}
                              />
                            </div>
                          ));
                        })()}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className={styles.emptyCell}>
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};
