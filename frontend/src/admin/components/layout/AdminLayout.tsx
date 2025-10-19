import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Typography, Space } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  ToolOutlined,
  BookOutlined,
  TrophyOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, sessionData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: '대시보드',
    },
    {
      key: '/admin/projects',
      icon: <ProjectOutlined />,
      label: '프로젝트 관리',
    },
    {
      key: '/admin/skills',
      icon: <ToolOutlined />,
      label: '스킬 관리',
    },
    {
      key: '/admin/experiences',
      icon: <BookOutlined />,
      label: '경력 관리',
    },
    {
      key: '/admin/certifications',
      icon: <TrophyOutlined />,
      label: '자격증 관리',
    },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#001529',
        }}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? '16px' : '18px',
          fontWeight: 'bold',
          borderBottom: '1px solid #002140',
        }}>
          {collapsed ? 'AD' : 'Admin Dashboard'}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px' }}
          />

          <Space>
            <Text type="secondary">
              안녕하세요, {sessionData?.username}님
            </Text>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Avatar
                icon={<UserOutlined />}
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </Space>
        </Header>

        <Content style={{
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 112px)',
        }}>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPlaceholder />} />
            <Route path="projects" element={<ProjectListPlaceholder />} />
            <Route path="projects/new" element={<ProjectEditPlaceholder />} />
            <Route path="projects/:id/edit" element={<ProjectEditPlaceholder />} />
            <Route path="skills" element={<SkillsPlaceholder />} />
            <Route path="experiences" element={<ExperiencesPlaceholder />} />
            <Route path="education" element={<EducationPlaceholder />} />
            <Route path="certifications" element={<CertificationsPlaceholder />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

// 임시 플레이스홀더 컴포넌트들
const DashboardPlaceholder: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h2>대시보드</h2>
    <p>프로젝트 통계 및 최근 활동을 표시합니다.</p>
  </div>
);

const ProjectListPlaceholder: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h2>프로젝트 관리</h2>
    <p>프로젝트 목록 및 관리 기능을 제공합니다.</p>
  </div>
);

const ProjectEditPlaceholder: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h2>프로젝트 편집</h2>
    <p>프로젝트 정보를 편집할 수 있습니다.</p>
  </div>
);

const SkillsPlaceholder: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h2>스킬 관리</h2>
    <p>기술 스택 관리 기능을 제공합니다.</p>
  </div>
);

const ExperiencesPlaceholder: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h2>경력 관리</h2>
    <p>경력 정보 관리 기능을 제공합니다.</p>
  </div>
);

const EducationPlaceholder: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h2>교육 관리</h2>
    <p>교육 정보 관리 기능을 제공합니다.</p>
  </div>
);

const CertificationsPlaceholder: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h2>자격증 관리</h2>
    <p>자격증 및 교육 정보 관리 기능을 제공합니다.</p>
  </div>
);

export default AdminLayout;
