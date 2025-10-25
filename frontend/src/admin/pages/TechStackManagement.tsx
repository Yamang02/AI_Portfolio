import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Select, 
  Modal, 
  Form, 
  message, 
  Popconfirm,
  Row,
  Col,
  Statistic,
  Typography,
  Divider,
  List,
  Avatar,
  Empty,
  Tabs,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ToolOutlined,
  EyeOutlined,
  ProjectOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { Option } = Select;
const { Title } = Typography;
const { TabPane } = Tabs;

interface TechStackMetadata {
  name: string;
  displayName: string;
  category: string;
  level: string;
  isCore: boolean;
  isActive: boolean;
  colorHex?: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface TechStackFormData {
  name: string;
  displayName: string;
  category: string;
  level: string;
  isCore: boolean;
  isActive: boolean;
  colorHex: string;
  description: string;
  sortOrder: number;
}

interface TechStackProject {
  id: number;
  title: string;
  description: string;
  status: string;
  thumbnailUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  startDate: string;
  endDate?: string;
}

const TechStackManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTech, setEditingTech] = useState<TechStackMetadata | null>(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  // 프로젝트 조회 모달 상태
  const [selectedTechStack, setSelectedTechStack] = useState<TechStackMetadata | null>(null);

  // 기술스택 목록 조회
  const { data: techStacks, isLoading } = useQuery<TechStackMetadata[]>({
    queryKey: ['tech-stacks-management'],
    queryFn: async () => {
      const response = await fetch('/api/tech-stack');
      const data = await response.json();
      return data.data || [];
    },
  });

  // 선택된 기술스택의 프로젝트 조회
  const { data: projects, isLoading: projectsLoading } = useQuery<TechStackProject[]>({
    queryKey: ['tech-stack-projects', selectedTechStack?.name],
    queryFn: async () => {
      if (!selectedTechStack) return [];
      const response = await fetch(`/api/tech-stack/${selectedTechStack.name}/projects`);
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!selectedTechStack,
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

  // 카테고리 색상
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      language: '#1890ff',
      framework: '#52c41a',
      database: '#fa8c16',
      tool: '#722ed1',
      other: '#8c8c8c',
    };
    return colors[category] || '#8c8c8c';
  };

  // 필터링된 데이터
  const filteredTechStacks = techStacks?.filter(tech => {
    const matchesSearch = !searchText || 
      tech.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
      tech.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (tech.description && tech.description.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || tech.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // 통계 데이터
  const stats = {
    total: techStacks?.length || 0,
    core: techStacks?.filter(t => t.isCore).length || 0,
    active: techStacks?.filter(t => t.isActive).length || 0,
    categories: [...new Set(techStacks?.map(t => t.category) || [])].length
  };

  // 기술스택 생성/수정 뮤테이션
  const createOrUpdateMutation = useMutation({
    mutationFn: async (data: TechStackFormData) => {
      const url = editingTech ? `/api/tech-stack/${editingTech.name}` : '/api/tech-stack';
      const method = editingTech ? 'PUT' : 'POST';
      
      console.log('=== 기술스택 수정 요청 ===');
      console.log('URL:', url);
      console.log('Method:', method);
      console.log('Data:', data);
      console.log('Editing Tech:', editingTech);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'API 호출 중 오류가 발생했습니다.');
      }
      
      const result = await response.json();
      console.log('Success response:', result);
      return result;
    },
    onSuccess: () => {
      message.success(editingTech ? '기술스택이 수정되었습니다.' : '기술스택이 생성되었습니다.');
      setIsModalVisible(false);
      setEditingTech(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['tech-stacks-management'] });
    },
    onError: (error: Error) => {
      message.error(error.message || '오류가 발생했습니다.');
    }
  });

  // 정렬 순서 업데이트 mutation
  const updateSortOrderMutation = useMutation({
    mutationFn: async ({ techName, newSortOrder }: { techName: string; newSortOrder: number }) => {
      const response = await fetch(`/api/tech-stack/${techName}/sort-order`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sortOrder: newSortOrder }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '정렬 순서 업데이트에 실패했습니다.');
      }
      
      return response.json();
    },
    onSuccess: () => {
      message.success('정렬 순서가 업데이트되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['tech-stacks-management'] });
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  // 기술스택 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/tech-stack/${name}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '삭제 중 오류가 발생했습니다.');
      }
      
      return name;
    },
    onSuccess: () => {
      message.success('기술스택이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['tech-stacks-management'] });
    },
    onError: (error: Error) => {
      message.error(error.message || '삭제 중 오류가 발생했습니다.');
    }
  });

  const handleCreate = () => {
    setEditingTech(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (tech: TechStackMetadata) => {
    setEditingTech(tech);
    form.setFieldsValue({
      ...tech,
      colorHex: tech.colorHex || '#8c8c8c'
    });
    setIsModalVisible(true);
  };

  const handleDelete = (name: string) => {
    deleteMutation.mutate(name);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 정렬 순서가 변경된 경우 별도 처리
      if (editingTech && values.sortOrder !== editingTech.sortOrder) {
        // 먼저 정렬 순서 업데이트
        await updateSortOrderMutation.mutateAsync({
          techName: editingTech.name,
          newSortOrder: values.sortOrder
        });
        
        // 그 다음 일반 업데이트 (정렬 순서 제외)
        const { sortOrder, ...updateData } = values;
        createOrUpdateMutation.mutate(updateData);
      } else {
        // 정렬 순서 변경이 없는 경우 일반 업데이트
        createOrUpdateMutation.mutate(values);
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingTech(null);
    setSelectedTechStack(null); // 프로젝트 조회 상태도 초기화
    form.resetFields();
  };

  const handleViewProjects = (tech: TechStackMetadata) => {
    setSelectedTechStack(tech);
  };

  const handleProjectModalCancel = () => {
    setSelectedTechStack(null);
  };

  // 행 클릭 핸들러
  const handleRowClick = (tech: TechStackMetadata) => {
    setEditingTech(tech);
    setSelectedTechStack(tech); // 프로젝트 조회를 위해 설정
    form.setFieldsValue({
      ...tech,
      colorHex: tech.colorHex || '#8c8c8c'
    });
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: '정렬 순서',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
      render: (sortOrder: number) => (
        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
          {sortOrder}
        </div>
      ),
    },
    {
      title: '기술명',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text: string, record: TechStackMetadata) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.name}</div>
        </div>
      ),
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={getCategoryColor(category)}>
          {categoryNames[category as keyof typeof categoryNames]}
        </Tag>
      ),
      filters: Object.keys(categoryNames).map(cat => ({
        text: categoryNames[cat as keyof typeof categoryNames],
        value: cat,
      })),
      onFilter: (value: string, record: TechStackMetadata) => record.category === value,
    },
    {
      title: '레벨',
      dataIndex: 'level',
      key: 'level',
      render: (level: string, record: TechStackMetadata) => (
        <div>
          <Tag color={level === 'core' ? 'gold' : level === 'general' ? 'blue' : 'green'}>
            {levelMapping[level as keyof typeof levelMapping] || level}
          </Tag>
          {record.isCore && (
            <Tag color="gold" style={{ marginLeft: '4px' }}>
              핵심
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '활성' : '비활성'}
        </Tag>
      ),
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ToolOutlined style={{ marginRight: '8px' }} />
          기술스택 관리
        </Title>
      </div>

      {/* 통계 카드 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="전체 기술" value={stats.total} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="핵심 기술" value={stats.core} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="활성 기술" value={stats.active} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="카테고리 수" value={stats.categories} />
          </Card>
        </Col>
      </Row>

      {/* 검색 및 필터 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="기술명으로 검색..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: '100%' }}
              placeholder="카테고리"
            >
              <Option value="all">전체 카테고리</Option>
              {Object.keys(categoryNames).map((category) => (
                <Option key={category} value={category}>
                  {categoryNames[category as keyof typeof categoryNames]}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              style={{ width: '100%' }}
            >
              새 기술 추가
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 기술스택 테이블 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTechStacks}
          rowKey="name"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} / 총 ${total}개`,
          }}
          scroll={{ x: 800 }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* 기술스택 생성/수정 모달 */}
      <Modal
        title={editingTech ? '기술스택 수정' : '새 기술스택 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        confirmLoading={createOrUpdateMutation.isPending}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            취소
          </Button>,
          editingTech && (
            <Popconfirm
              key="delete"
              title="정말 삭제하시겠습니까?"
              onConfirm={() => {
                handleDelete(editingTech.name);
                setIsModalVisible(false);
              }}
              okText="삭제"
              cancelText="취소"
            >
              <Button danger>
                삭제
              </Button>
            </Popconfirm>
          ),
          <Button key="submit" type="primary" onClick={handleModalOk}>
            {editingTech ? '수정' : '생성'}
          </Button>,
        ]}
      >
        <Tabs defaultActiveKey="basic">
          <TabPane tab="기본 정보" key="basic">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                isCore: false,
                isActive: true,
                colorHex: '#8c8c8c',
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="기술명 (영문)"
                    rules={[{ required: true, message: '기술명을 입력해주세요.' }]}
                  >
                    <Input placeholder="예: React, Spring Boot" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="displayName"
                    label="표시명 (한글)"
                    rules={[{ required: true, message: '표시명을 입력해주세요.' }]}
                  >
                    <Input placeholder="예: React, Spring Boot" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label="카테고리"
                    rules={[{ required: true, message: '카테고리를 선택해주세요.' }]}
                  >
                    <Select placeholder="카테고리 선택">
                      {Object.keys(categoryNames).map((category) => (
                        <Option key={category} value={category}>
                          {categoryNames[category as keyof typeof categoryNames]}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="level"
                    label="레벨"
                    rules={[{ required: true, message: '레벨을 선택해주세요.' }]}
                  >
                    <Select placeholder="레벨 선택">
                      <Option value="core">핵심</Option>
                      <Option value="general">일반</Option>
                      <Option value="learning">학습중</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="colorHex"
                    label="색상"
                    rules={[{ required: true, message: '색상을 선택해주세요.' }]}
                  >
                    <Input type="color" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="sortOrder"
                    label="정렬 순서"
                    rules={[{ required: true, message: '정렬 순서를 선택해주세요.' }]}
                  >
                    <Select placeholder="정렬 순서 선택">
                      {Array.from({ length: (techStacks?.length || 0) + 1 }, (_, index) => (
                        <Option key={index + 1} value={index + 1}>
                          {index + 1}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="isCore"
                    label="핵심 기술"
                    valuePropName="checked"
                  >
                    <input type="checkbox" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="isActive"
                    label="활성화"
                    valuePropName="checked"
                  >
                    <input type="checkbox" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="설명"
              >
                <Input.TextArea rows={3} placeholder="기술에 대한 설명을 입력해주세요." />
              </Form.Item>
            </Form>
          </TabPane>
          
          {editingTech && (
            <TabPane tab="사용 프로젝트" key="projects">
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {projectsLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
                ) : projects && projects.length > 0 ? (
                  <List
                    dataSource={projects}
                    renderItem={(project) => (
                      <List.Item key={project.id}>
                        <List.Item.Meta
                          avatar={
                            project.thumbnailUrl ? (
                              <Avatar src={project.thumbnailUrl} size={48} />
                            ) : (
                              <Avatar size={48} icon={<ProjectOutlined />} />
                            )
                          }
                          title={project.title}
                          description={
                            <div>
                              <div style={{ marginBottom: '4px' }}>{project.description}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {project.startDate} ~ {project.endDate || '진행중'}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty 
                    description="이 기술스택을 사용하는 프로젝트가 없습니다" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </div>
            </TabPane>
          )}
        </Tabs>
      </Modal>

    </div>
  );
};

export default TechStackManagement;
