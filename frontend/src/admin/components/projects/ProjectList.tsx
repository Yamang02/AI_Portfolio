import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Input,
  Select,
  message,
  Popconfirm,
  Image,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useProjects, useDeleteProject } from '../../hooks/useProjects';
import { Project, ProjectFilter } from '../../api/adminProjectApi';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ProjectFilter>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { data: projects = [], isLoading, isError, error } = useProjects(filter);
  const deleteProjectMutation = useDeleteProject();

  const handleDelete = async (id: string) => {
    try {
      await deleteProjectMutation.mutateAsync(id);
      message.success('프로젝트가 삭제되었습니다');
    } catch (error: any) {
      message.error(error.message || '프로젝트 삭제 중 오류가 발생했습니다');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map(id => deleteProjectMutation.mutateAsync(String(id))));
      message.success(`${selectedRowKeys.length}개 프로젝트가 삭제되었습니다`);
      setSelectedRowKeys([]);
    } catch (error: any) {
      message.error('프로젝트 삭제 중 오류가 발생했습니다');
    }
  };

  const columns = [
    {
      title: '이미지',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      fixed: 'left' as const,
      render: (imageUrl: string) => (
        imageUrl ? (
          <Image
            src={imageUrl}
            alt="프로젝트 이미지"
            width={60}
            height={40}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            preview={false}
          />
        ) : (
          <div style={{ width: 60, height: 40, background: '#f0f0f0', borderRadius: 4 }} />
        )
      ),
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      ellipsis: true,
      render: (title: string) => (
        <div style={{ fontWeight: 500 }}>{title}</div>
      ),
    },
    {
      title: '타입',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center' as const,
      render: (type: string) => {
        const colors = {
          BUILD: 'blue',
          LAB: 'green',
          MAINTENANCE: 'orange',
        };
        return <Tag color={colors[type as keyof typeof colors]}>{type}</Tag>;
      },
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      align: 'center' as const,
      render: (status: string) => {
        const colors = {
          completed: 'green',
          in_progress: 'blue',
          maintenance: 'orange',
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
      },
    },
    {
      title: '팀/개인',
      dataIndex: 'isTeam',
      key: 'isTeam',
      width: 90,
      align: 'center' as const,
      render: (isTeam: boolean) => (
        <Tag color={isTeam ? 'purple' : 'default'}>
          {isTeam ? '팀' : '개인'}
        </Tag>
      ),
    },
    {
      title: '시작일',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      align: 'center' as const,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: '완료일',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      align: 'center' as const,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: '순서',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 70,
      align: 'center' as const,
      sorter: (a: Project, b: Project) => (a.sortOrder || 0) - (b.sortOrder || 0),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div>
      {isError && (
        <Alert
          message="프로젝트 목록을 불러오지 못했습니다."
          description={error?.message || "알 수 없는 오류가 발생했습니다."}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              프로젝트 관리
            </Title>
          </Col>
          <Col>
            <Space>
              {selectedRowKeys.length > 0 && (
                <Popconfirm
                  title={`${selectedRowKeys.length}개 프로젝트를 삭제하시겠습니까?`}
                  description="이 작업은 되돌릴 수 없습니다."
                  onConfirm={handleBulkDelete}
                  okText="삭제"
                  cancelText="취소"
                >
                  <Button danger>
                    선택 삭제 ({selectedRowKeys.length})
                  </Button>
                </Popconfirm>
              )}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/projects/new')}
              >
                새 프로젝트
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Card>
        {/* 필터 영역 */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Input
                placeholder="프로젝트 검색"
                prefix={<SearchOutlined />}
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="프로젝트 타입"
                style={{ width: '100%' }}
                value={filter.projectType}
                onChange={(value) => setFilter({ ...filter, projectType: value })}
                allowClear
              >
                <Option value="BUILD">BUILD</Option>
                <Option value="LAB">LAB</Option>
                <Option value="MAINTENANCE">MAINTENANCE</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="상태"
                style={{ width: '100%' }}
                value={filter.status}
                onChange={(value) => setFilter({ ...filter, status: value })}
                allowClear
              >
                <Option value="completed">완료</Option>
                <Option value="in_progress">진행중</Option>
                <Option value="maintenance">유지보수</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="팀/개인"
                style={{ width: '100%' }}
                value={filter.isTeam}
                onChange={(value) => setFilter({ ...filter, isTeam: value })}
                allowClear
              >
                <Option value="team">팀 프로젝트</Option>
                <Option value="individual">개인 프로젝트</Option>
              </Select>
            </Col>
            <Col span={3}>
              <Select
                placeholder="정렬"
                style={{ width: '100%' }}
                value={filter.sortBy}
                onChange={(value) => setFilter({ ...filter, sortBy: value })}
              >
                <Option value="sortOrder">정렬 순서</Option>
                <Option value="startDate">시작일</Option>
                <Option value="title">제목</Option>
                <Option value="status">상태</Option>
              </Select>
            </Col>
            <Col span={3}>
              <Select
                placeholder="순서"
                style={{ width: '100%' }}
                value={filter.sortOrder}
                onChange={(value) => setFilter({ ...filter, sortOrder: value })}
              >
                <Option value="asc">오름차순</Option>
                <Option value="desc">내림차순</Option>
              </Select>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          loading={isLoading}
          rowSelection={rowSelection}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/projects/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            total: projects.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / ${total}개`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export { ProjectList };

