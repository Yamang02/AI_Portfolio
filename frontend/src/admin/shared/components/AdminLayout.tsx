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
  HomeOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
      key: '/admin/tech-stacks',
      icon: <ToolOutlined />,
      label: '기술스택 관리',
    },
    {
      key: '/admin/career',
      icon: <BookOutlined />,
      label: '학력 및 경력',
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
            <Text type="secondary">
              안녕하세요, {sessionData?.username}님
            </Text>
            <Button
              type="text"
              icon={<HomeOutlined />}
              aria-label="메인으로"
              onClick={() => navigate('/')}
            />
          </Space>
        </Header>

        <Content style={{
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 112px)',
        }}>
          {/* Outlet을 사용하여 중첩 라우트 렌더링 */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export { AdminLayout };
