/**
 * 기술스택 관계 관리 섹션
 * CRUD 모달 내부에서 사용하는 인라인 컴포넌트
 */

import React, { useState, useMemo } from 'react';
import { Select, Button, List, Tag, Input, Switch, App } from 'antd';
import { SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAdminTechStacksQuery } from '../../entities/tech-stack';
import type { TechStackMetadata } from '../../entities/tech-stack';

const { Option } = Select;
const { TextArea } = Input;

export interface TechStackRelationship {
  techStack: TechStackMetadata;
  isPrimary: boolean;
  usageDescription?: string;
}

interface TechStackRelationshipSectionProps {
  value: TechStackRelationship[];
  onChange: (relationships: TechStackRelationship[]) => void;
}

/**
 * 기술스택 관계 선택 및 관리 섹션
 * 모달 내부에서 인라인으로 표시되는 섹션
 */
export const TechStackRelationshipSection: React.FC<TechStackRelationshipSectionProps> = ({
  value = [],
  onChange,
}) => {
  const { message } = App.useApp();
  const [searchText, setSearchText] = useState('');
  const [selectingTechStack, setSelectingTechStack] = useState<string | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const [usageDescription, setUsageDescription] = useState('');

  // 캐시된 기술스택 목록 조회
  const { data: allTechStacks, isLoading } = useAdminTechStacksQuery();

  // 이미 선택된 기술스택 ID 목록
  const selectedIds = useMemo(() => value.map((v) => v.techStack.name), [value]);

  // 검색 필터링
  const filteredTechStacks = useMemo(() => {
    if (!allTechStacks) return [];
    return allTechStacks.filter((tech) =>
      tech.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
      tech.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [allTechStacks, searchText]);

  // 추가 가능한 기술스택만 필터링 (이미 선택된 것은 제외)
  const availableTechStacks = filteredTechStacks.filter(
    (tech) => !selectedIds.includes(tech.name)
  );

  const handleAdd = () => {
    if (!selectingTechStack) {
      message.warning('기술스택을 선택해주세요');
      return;
    }

    const selectedTech = allTechStacks?.find((t) => t.name === selectingTechStack);
    if (!selectedTech) return;

    // 새 관계 추가
    const newRelationship: TechStackRelationship = {
      techStack: selectedTech,
      isPrimary,
      usageDescription: usageDescription.trim() || undefined,
    };

    onChange([...value, newRelationship]);

    // 폼 초기화
    setSelectingTechStack(null);
    setIsPrimary(false);
    setUsageDescription('');
    message.success(`${selectedTech.displayName}이(가) 추가되었습니다`);
  };

  const handleRemove = (techName: string) => {
    onChange(value.filter((v) => v.techStack.name !== techName));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 검색 및 추가 영역 */}
      <div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <Select
            style={{ flex: 1 }}
            placeholder="기술스택 검색 및 선택"
            showSearch
            value={selectingTechStack}
            onChange={setSelectingTechStack}
            filterOption={false}
            notFoundContent={isLoading ? '로딩 중...' : '기술스택을 찾을 수 없습니다'}
            allowClear
          >
            {availableTechStacks.map((tech) => (
              <Option key={tech.name} value={tech.name}>
                {tech.displayName} ({tech.category})
              </Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleAdd}>
            추가
          </Button>
        </div>

        {selectingTechStack && (
          <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
            <div style={{ marginBottom: '8px' }}>
              <Switch
                checked={isPrimary}
                onChange={setIsPrimary}
                size="small"
              />{' '}
              <span style={{ marginLeft: '8px', fontSize: '14px' }}>주요 기술</span>
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

      {/* 현재 선택된 기술스택 목록 */}
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
          선택된 기술스택 ({value.length})
        </h4>
        {value.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
            선택된 기술스택이 없습니다
          </div>
        ) : (
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {value.map((item) => (
              <div
                key={item.techStack.name}
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
                      {item.techStack.displayName}
                    </span>
                    {item.isPrimary && (
                      <Tag color="gold" style={{ marginLeft: '8px' }}>
                        <CheckCircleOutlined /> 주요
                      </Tag>
                    )}
                    <Tag color="blue" style={{ marginLeft: '4px' }}>
                      {item.techStack.category}
                    </Tag>
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
                  onClick={() => handleRemove(item.techStack.name)}
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

