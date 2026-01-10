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
      id: 'articles',
      label: '아티클',
      tooltip: 'Articles',
      href: '/articles',
      isActive: (pathname) => pathname === '/articles' || pathname.startsWith('/articles/'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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
        <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor" stroke="none">
          <g transform="translate(0,512) scale(0.1,-0.1)" fill="currentColor">
            <path d="M2442 5104 c-90 -24 -164 -66 -227 -129 -99 -99 -145 -211 -145 -350 0 -204 128 -387 323 -460 l47 -18 0 -118 0 -118 -677 -3 -678 -3 -80 -27 c-114 -39 -196 -92 -280 -179 -85 -89 -145 -199 -170 -312 l-16 -74 -87 -6 c-53 -3 -109 -13 -142 -26 -109 -41 -207 -139 -253 -251 -22 -55 -22 -56 -22 -670 l0 -615 32 -68 c36 -75 114 -164 177 -201 61 -36 141 -56 222 -56 l71 0 12 -59 c46 -236 216 -429 451 -513 64 -23 73 -23 541 -26 l477 -3 221 -383 c121 -210 232 -393 247 -407 36 -34 112 -34 148 0 15 14 126 197 247 408 l222 383 446 0 c497 0 529 4 654 64 185 90 309 244 359 449 l21 87 72 0 c80 0 160 20 221 56 63 37 141 126 177 201 l32 68 0 615 c0 614 0 615 -22 670 -46 112 -144 210 -253 251 -33 13 -89 23 -142 26 l-87 6 -16 74 c-28 124 -85 225 -184 324 -65 65 -104 95 -161 123 -149 73 -110 70 -862 73 l-678 4 0 118 0 118 48 18 c191 71 322 258 322 460 0 140 -46 251 -145 350 -122 122 -302 173 -463 129z m190 -234 c95 -27 178 -135 178 -232 0 -73 -18 -123 -64 -175 -53 -60 -103 -83 -186 -83 -83 0 -133 23 -186 83 -166 188 15 474 258 407z m1370 -1211 c154 -33 278 -149 322 -300 15 -50 16 -155 14 -1020 l-3 -964 -32 -68 c-42 -89 -121 -168 -210 -210 l-68 -32 -517 -5 c-497 -5 -518 -6 -543 -25 -15 -11 -107 -159 -213 -342 -103 -178 -189 -323 -192 -323 -3 0 -89 145 -192 323 -106 183 -198 331 -213 342 -25 19 -46 20 -543 25 l-517 5 -68 32 c-88 42 -168 121 -210 210 l-32 68 -3 965 c-2 944 -2 966 18 1031 41 138 161 249 305 285 69 17 2817 20 2897 3z m-3462 -1295 l0 -706 -73 4 c-84 4 -127 26 -168 86 l-24 36 -3 555 c-2 377 0 568 8 593 24 84 102 137 203 138 l57 0 0 -706z m4195 687 c49 -22 91 -69 105 -119 8 -25 10 -216 8 -593 l-3 -555 -24 -36 c-41 -60 -84 -82 -168 -86 l-73 -4 0 706 0 706 58 0 c34 0 74 -8 97 -19z" />
            <path d="M1457 3026 c-84 -35 -131 -69 -176 -126 -63 -79 -85 -148 -86 -261 0 -90 2 -99 38 -171 154 -313 590 -309 738 6 94 200 11 435 -189 533 -69 35 -84 38 -171 41 -83 2 -104 -1 -154 -22z m241 -243 c88 -65 95 -197 13 -266 -73 -61 -167 -55 -233 14 -76 80 -56 208 42 261 46 25 138 21 178 -9z" />
            <path d="M3383 3030 c-107 -38 -188 -114 -240 -226 -25 -52 -28 -71 -28 -159 0 -92 3 -106 32 -167 122 -258 440 -324 649 -135 227 205 150 577 -141 686 -72 27 -198 28 -272 1z m217 -239 c42 -22 77 -70 86 -117 22 -117 -92 -225 -206 -194 -144 39 -175 223 -51 307 43 29 121 31 171 4z" />
            <path d="M1970 1993 c-45 -23 -73 -76 -65 -122 16 -85 165 -257 287 -329 273 -162 627 -123 858 95 98 92 163 190 164 250 1 53 -28 93 -81 112 -36 13 -43 12 -79 -5 -24 -12 -51 -37 -71 -68 -209 -320 -636 -325 -840 -9 -54 84 -109 108 -173 76z" />
          </g>
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
