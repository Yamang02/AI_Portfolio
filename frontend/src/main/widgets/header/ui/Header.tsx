import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tooltip, Button, HeaderIconButton } from '@/design-system';
import { useTheme } from '@/shared/hooks/useTheme';
import styles from './Header.module.css';

interface MenuItem {
  id: string;
  label: string;
  tooltip: string; // 영어 툴팁
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  isActive?: (pathname: string) => boolean; // 활성 상태 확인 함수
}

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
    setIsMenuOpen(false);
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/admin/settings');
    setIsMenuOpen(false);
  };

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      label: '프로필',
      tooltip: 'Profile',
      href: '/profile',
      isActive: (pathname) => pathname === '/profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: 'projects',
      label: '프로젝트',
      tooltip: 'Projects',
      href: '/projects',
      isActive: (pathname) => pathname === '/projects' || pathname.startsWith('/projects/'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'chatbot',
      label: '챗봇',
      tooltip: 'Chatbot',
      href: '/chat',
      isActive: (pathname) => pathname === '/chat',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: '설정',
      tooltip: 'Settings',
      onClick: handleSettingsClick,
      isActive: (pathname) => pathname === '/admin/settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const handleMenuItemClick = (item: MenuItem, e?: React.MouseEvent) => {
    if (item.onClick && e) {
      item.onClick(e);
    } else if (item.href) {
      navigate(item.href);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <a href="/" className={styles.logo} onClick={handleLogoClick}>
          Yamang02
        </a>
        
        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          {/* Theme Toggle */}
          <Tooltip content={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} placement="bottom">
            <HeaderIconButton
              onClick={toggleTheme}
              className={styles.themeToggle}
              ariaLabel={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </HeaderIconButton>
          </Tooltip>
          <div className={styles.divider} />
          {menuItems.map((item) => {
            const isActive = item.isActive ? item.isActive(location.pathname) : false;
            return (
              <Tooltip key={item.id} content={item.tooltip} placement="bottom">
                <HeaderIconButton
                  onClick={(e) => handleMenuItemClick(item, e)}
                  isActive={isActive}
                  ariaLabel={item.label}
                >
                  {item.icon}
                </HeaderIconButton>
              </Tooltip>
            );
          })}
        </nav>

        {/* Mobile Menu */}
        <div className={styles.mobileMenuWrapper}>
          {/* Mobile Theme Toggle */}
          <Tooltip content={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} placement="bottom">
            <HeaderIconButton
              onClick={toggleTheme}
              className={styles.mobileThemeToggle}
              ariaLabel={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </HeaderIconButton>
          </Tooltip>

          {/* Mobile Hamburger Menu */}
          <div className={styles.mobileMenu} ref={menuRef}>
            <HeaderIconButton
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={styles.menuButton}
              ariaLabel={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </HeaderIconButton>

            {/* Mobile Dropdown Menu */}
            {isMenuOpen && (
              <div className={styles.dropdown}>
                {menuItems.map((item) => {
                  const isActive = item.isActive ? item.isActive(location.pathname) : false;
                  return (
                    <Button
                      key={item.id}
                      variant="secondary"
                      size="md"
                      onClick={(e) => handleMenuItemClick(item, e)}
                      className={`${styles.dropdownLink} ${isActive ? styles.dropdownLinkActive : ''}`}
                      type="button"
                    >
                      <span className={styles.icon}>{item.icon}</span>
                      <span>{item.tooltip}</span>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
