import React, { useState, useMemo } from 'react';
import { Tag, Checkbox, Input, Select, Row, Col, Card, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

interface TechStackOption {
  name: string;
  displayName: string;
  category: string;
  level: string;
  isCore: boolean;
  colorHex?: string;
  description?: string;
}

interface TechStackSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
}

const TechStackSelector: React.FC<TechStackSelectorProps> = ({ value = [], onChange }) => {
  const [searchValue, setSearchValue] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // 기술 스택 목록 조회
  const { data: techStacks, isLoading } = useQuery<TechStackOption[]>({
    queryKey: ['tech-stacks'],
    queryFn: async () => {
      const response = await fetch('/api/tech-stack');
      const data = await response.json();
      return data.data || [];
    },
  });

  // 프론트엔드 카테고리 표시명
  const categoryNames = {
    language: '언어',
    framework: '프레임워크',
    database: '데이터베이스',
    tool: '도구',
    other: '기타'
  };

  // 레벨 매핑
  const levelMapping = {
    core: '핵심',
    general: '일반',
    learning: '학습중'
  };

  // 필터링된 기술스택 목록
  const filteredTechStacks = useMemo(() => {
    if (!techStacks) return [];
    
    return techStacks.filter((tech) => {
      // 검색어 필터
      const matchesSearch = !searchValue || 
        tech.displayName.toLowerCase().includes(searchValue.toLowerCase()) ||
        tech.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        (tech.description && tech.description.toLowerCase().includes(searchValue.toLowerCase()));
      
      // 카테고리 필터
      const matchesCategory = categoryFilter === 'all' || tech.category === categoryFilter;
      
      // 레벨 필터
      const matchesLevel = levelFilter === 'all' || tech.level === levelFilter;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [techStacks, searchValue, categoryFilter, levelFilter]);

  // 프론트엔드 카테고리 목록
  const frontendCategories = ['language', 'framework', 'database', 'tool', 'other'];

  const handleTechToggle = (techName: string, checked: boolean) => {
    if (checked) {
      onChange?.([...value, techName]);
    } else {
      onChange?.(value.filter(name => name !== techName));
    }
  };

  const handleRemoveTech = (techName: string) => {
    onChange?.(value.filter(name => name !== techName));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      language: '#1890ff',      // 파란색
      framework: '#52c41a',     // 초록색
      database: '#fa8c16',      // 주황색
      tool: '#722ed1',          // 보라색
      other: '#8c8c8c',         // 회색
    };
    return colors[category] || '#8c8c8c';
  };

  return (
    <div>
      {/* 검색 및 필터 영역 */}
      <div style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="기술 스택을 검색하세요..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: '100%' }}
              placeholder="카테고리"
            >
              <Option value="all">전체 카테고리</Option>
              {frontendCategories.map((category) => (
                <Option key={category} value={category}>
                  {categoryNames[category as keyof typeof categoryNames]}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={levelFilter}
              onChange={setLevelFilter}
              style={{ width: '100%' }}
              placeholder="레벨"
            >
              <Option value="all">전체 레벨</Option>
              <Option value="core">핵심</Option>
              <Option value="general">일반</Option>
              <Option value="learning">학습중</Option>
            </Select>
          </Col>
        </Row>
      </div>

      {/* 선택된 기술스택 표시 */}
      {value && value.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
            선택된 기술 ({value.length}개)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {value.map((techName) => {
              const tech = techStacks?.find((t) => t.name === techName);
              const color = tech ? getCategoryColor(tech.category) : '#8c8c8c';
              
              return (
                <Tag
                  key={techName}
                  closable
                  onClose={() => handleRemoveTech(techName)}
                  style={{
                    backgroundColor: color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  {tech?.displayName || techName}
                </Tag>
              );
            })}
          </div>
        </div>
      )}

      {/* 기술스택 목록 */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
        ) : filteredTechStacks.length === 0 ? (
          <Empty 
            description="검색 결과가 없습니다" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Row gutter={[8, 8]}>
            {filteredTechStacks.map((tech) => (
              <Col xs={24} sm={12} md={8} lg={6} key={tech.name}>
                <Card
                  size="small"
                  hoverable
                  style={{
                    border: value.includes(tech.name) ? `2px solid ${getCategoryColor(tech.category)}` : '1px solid #d9d9d9',
                    backgroundColor: value.includes(tech.name) ? `${getCategoryColor(tech.category)}10` : 'white',
                  }}
                  bodyStyle={{ padding: '8px 12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: getCategoryColor(tech.category),
                          }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                          {categoryNames[tech.category as keyof typeof categoryNames]}
                        </span>
                        {tech.isCore && (
                          <Tag color="gold" style={{ fontSize: '10px', padding: '0 4px' }}>
                            핵심
                          </Tag>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                        {tech.displayName}
                      </div>
                      {tech.description && (
                        <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.2' }}>
                          {tech.description.length > 50 
                            ? `${tech.description.substring(0, 50)}...` 
                            : tech.description}
                        </div>
                      )}
                    </div>
                    <Checkbox
                      checked={value.includes(tech.name)}
                      onChange={(e) => handleTechToggle(tech.name, e.target.checked)}
                      style={{ marginLeft: '8px' }}
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* 통계 정보 */}
      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
        <div style={{ fontSize: '12px', color: '#666' }}>
          총 {techStacks?.length || 0}개 기술 중 {filteredTechStacks.length}개 표시
          {categoryFilter !== 'all' && ` (${categoryNames[categoryFilter as keyof typeof categoryNames]} 필터 적용)`}
          {levelFilter !== 'all' && ` (${levelMapping[levelFilter as keyof typeof levelMapping] || levelFilter} 레벨 필터 적용)`}
        </div>
      </div>
    </div>
  );
};

export { TechStackSelector };
