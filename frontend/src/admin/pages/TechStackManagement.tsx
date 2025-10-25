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
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ToolOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { Option } = Select;
const { Title } = Typography;

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

const TechStackManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTech, setEditingTech] = useState<TechStackMetadata | null>(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 기술스택 목록 조회
  const { data: techStacks, isLoading } = useQuery<TechStackMetadata[]>({
    queryKey: ['tech-stacks-management'],
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

  // 기술스택 생성/수정 뮤테이션 (실제 API가 없으므로 시뮬레이션)
  const createOrUpdateMutation = useMutation({
    mutationFn: async (data: TechStackFormData) => {
      // 실제로는 API 호출
      console.log('Creating/Updating tech stack:', data);
      return data;
    },
    onSuccess: () => {
      message.success(editingTech ? '기술스택이 수정되었습니다.' : '기술스택이 생성되었습니다.');
      setIsModalVisible(false);
      setEditingTech(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['tech-stacks-management'] });
    },
    onError: () => {
      message.error('오류가 발생했습니다.');
    }
  });

  // 기술스택 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: async (name: string) => {
      // 실제로는 API 호출
      console.log('Deleting tech stack:', name);
      return name;
    },
    onSuccess: () => {
      message.success('기술스택이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['tech-stacks-management'] });
    },
    onError: () => {
      message.error('삭제 중 오류가 발생했습니다.');
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
      createOrUpdateMutation.mutate(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingTech(null);
    form.resetFields();
  };

  const columns = [
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
      render: (level: string) => (
        <Tag color={level === 'core' ? 'gold' : level === 'general' ? 'blue' : 'green'}>
          {levelMapping[level as keyof typeof levelMapping] || level}
        </Tag>
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
      title: '핵심 기술',
      dataIndex: 'isCore',
      key: 'isCore',
      render: (isCore: boolean) => (
        <Tag color={isCore ? 'gold' : 'default'}>
          {isCore ? '핵심' : '일반'}
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
    {
      title: '작업',
      key: 'actions',
      render: (_: any, record: TechStackMetadata) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="정말 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.name)}
            okText="삭제"
            cancelText="취소"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
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
        />
      </Card>

      {/* 기술스택 생성/수정 모달 */}
      <Modal
        title={editingTech ? '기술스택 수정' : '새 기술스택 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        confirmLoading={createOrUpdateMutation.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isCore: false,
            isActive: true,
            colorHex: '#8c8c8c',
            sortOrder: 0,
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
                  {Object.keys(frontendCategoryNames).map((category) => (
                    <Option key={category} value={category}>
                      {frontendCategoryNames[category as keyof typeof frontendCategoryNames]}
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
                rules={[{ required: true, message: '정렬 순서를 입력해주세요.' }]}
              >
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="설명"
          >
            <Input.TextArea rows={3} placeholder="기술에 대한 설명을 입력해주세요." />
          </Form.Item>

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
        </Form>
      </Modal>
    </div>
  );
};

export default TechStackManagement;
