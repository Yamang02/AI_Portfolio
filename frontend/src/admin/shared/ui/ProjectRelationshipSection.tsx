/**
 * 프로젝트 관계 관리 섹션
 * CRUD 모달 내부에서 사용하는 인라인 컴포넌트
 */

import React, { useState, useMemo } from 'react';
import { Select, Button, Tag, Input, Switch, App } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { type EntityProjectRelationship } from '../../entities/project';
import { useProjects } from '../../hooks/useProjects';

const { Option } = Select;
const { TextArea } = Input;

interface ProjectRelationshipSectionProps {
  value: EntityProjectRelationship[];
  onChange: (relationships: EntityProjectRelationship[]) => void;
}

/**
 * 프로젝트 관계 선택 및 관리 섹션
 * 모달 내부에서 인라인으로 표시되는 섹션
 */
export const ProjectRelationshipSection: React.FC<ProjectRelationshipSectionProps> = ({
  value = [],
  onChange,
}) => {
  const { message } = App.useApp();
  const [selectingProject, setSelectingProject] = useState<string | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const [usageDescription, setUsageDescription] = useState('');
  
  // 캐시된 프로젝트 목록 조회 (관리자 API 사용)
  const { data: allProjects, isLoading } = useProjects({});

  // 이미 선택된 프로젝트 Business ID 목록
  const selectedIds = useMemo(() => value.map((v) => v.projectBusinessId), [value]);

  // 추가 가능한 프로젝트만 필터링
  // 기존 프로젝트는 제외하지 않고 모든 프로젝트 표시
  // (필터링은 백엔드에서 중복 체크)
  const availableProjects = useMemo(() => {
    return allProjects || [];
  }, [allProjects]);

  const handleAdd = () => {
    if (!selectingProject) {
      message.warning('프로젝트를 선택해주세요');
      return;
    }

    const selectedProject = allProjects?.find((p) => p.id === selectingProject);
    if (!selectedProject) return;

    const newRelationship: EntityProjectRelationship = {
      id: Date.now(),  // 임시 ID (화면 표시용)
      projectBusinessId: selectedProject.id,  // Business ID
      projectTitle: selectedProject.title,
      isPrimary,
      usageDescription: usageDescription.trim() || undefined,
    };

    onChange([...value, newRelationship]);

    setSelectingProject(null);
    setIsPrimary(false);
    setUsageDescription('');
    message.success(`${selectedProject.title}이(가) 추가되었습니다`);
  };

  const handleRemove = (projectBusinessId: string) => {
    onChange(value.filter((v) => v.projectBusinessId !== projectBusinessId));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 검색 및 추가 영역 */}
      <div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <Select
            style={{ flex: 1 }}
            placeholder="프로젝트 검색 및 선택"
            showSearch
            value={selectingProject}
            onChange={setSelectingProject}
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={isLoading ? '로딩 중...' : '프로젝트를 찾을 수 없습니다'}
            allowClear
          >
            {availableProjects.map((project) => (
              <Option key={project.id} value={project.id} label={project.title}>
                {project.title}
              </Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleAdd}>
            추가
          </Button>
        </div>

        {selectingProject && (
          <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
            <div style={{ marginBottom: '8px' }}>
              <Switch
                checked={isPrimary}
                onChange={setIsPrimary}
                size="small"
              />{' '}
              <span style={{ marginLeft: '8px', fontSize: '14px' }}>주요 프로젝트</span>
            </div>
            <TextArea
              placeholder="사용 내용 설명 (선택사항)"
              value={usageDescription}
              onChange={(e) => setUsageDescription(e.target.value)}
              rows={2}
            />
          </div>
        )}
      </div>

      {/* 현재 선택된 프로젝트 목록 */}
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
          선택된 프로젝트 ({value.length})
        </h4>
        {value.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
            선택된 프로젝트가 없습니다
          </div>
        ) : (
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {value.map((item) => (
              <div
                key={item.projectBusinessId}
                style={{
                  border: '1px solid #d9d9d9',
                  marginBottom: '8px',
                  padding: '12px',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {item.projectTitle}
                    </span>
                    {item.isPrimary && (
                      <Tag color="gold" style={{ marginLeft: '8px' }}>
                        <CheckCircleOutlined /> 주요
                      </Tag>
                    )}
                  </div>
                  {item.usageDescription && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {item.usageDescription}
                    </div>
                  )}
                </div>
                <Button
                  size="small"
                  danger
                  onClick={() => handleRemove(item.projectBusinessId)}
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

