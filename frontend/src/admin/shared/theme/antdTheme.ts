import { ThemeConfig } from 'antd';

/**
 * Admin 전용 Ant Design 테마 설정
 *
 * 디자인시스템의 CSS 변수를 참조하여 Main 영역과 색상 체계를 통일합니다.
 * Admin은 Antd 컴포넌트를 사용하지만, 색상/간격/폰트는 디자인시스템을 따릅니다.
 *
 * @see frontend/src/design-system/tokens/cssVariables.css
 */
export const adminTheme: ThemeConfig = {
  token: {
    // 색상 (디자인시스템 CSS 변수 참조)
    colorPrimary: '#3b82f6',        // --color-primary (파란색)
    colorSuccess: '#10b981',        // --color-success (초록색)
    colorWarning: '#f59e0b',        // --color-warning (주황색)
    colorError: '#ef4444',          // --color-error (빨간색)
    colorInfo: '#3b82f6',           // --color-info (파란색)

    // 배경색
    colorBgContainer: '#ffffff',    // 컨테이너 배경 (밝은 테마)
    colorBgLayout: '#f5f5f5',       // 레이아웃 배경

    // 텍스트 색상
    colorText: '#1a1a1a',           // 기본 텍스트 색상
    colorTextSecondary: '#6b7280',  // 보조 텍스트 색상
    colorTextTertiary: '#9ca3af',   // 3차 텍스트 색상

    // Border
    colorBorder: '#e5e7eb',         // 기본 border
    colorBorderSecondary: '#f3f4f6', // 2차 border
    borderRadius: 8,                // border radius (8px)

    // 간격
    fontSize: 14,                   // 기본 폰트 크기
    fontSizeHeading1: 32,           // H1
    fontSizeHeading2: 24,           // H2
    fontSizeHeading3: 20,           // H3
    fontSizeHeading4: 16,           // H4
    fontSizeHeading5: 14,           // H5

    // 폰트
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

    // 그림자
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },

  components: {
    // Button
    Button: {
      controlHeight: 36,            // 버튼 높이
      borderRadius: 6,              // 버튼 border radius
      fontSize: 14,                 // 버튼 폰트 크기
      fontWeight: 500,              // 버튼 폰트 굵기
    },

    // Table
    Table: {
      headerBg: '#f9fafb',          // 테이블 헤더 배경
      headerColor: '#374151',       // 테이블 헤더 텍스트
      rowHoverBg: '#f3f4f6',        // 행 hover 배경
      borderColor: '#e5e7eb',       // 테이블 border
      fontSize: 14,                 // 테이블 폰트 크기
    },

    // Modal
    Modal: {
      borderRadiusLG: 12,           // 모달 border radius
      paddingContentHorizontalLG: 24,
      paddingMD: 20,
    },

    // Form
    Form: {
      labelFontSize: 14,            // 레이블 폰트 크기
      labelColor: '#374151',        // 레이블 색상
      itemMarginBottom: 20,         // 폼 아이템 하단 간격
    },

    // Input
    Input: {
      controlHeight: 36,            // 입력창 높이
      borderRadius: 6,              // 입력창 border radius
      fontSize: 14,                 // 입력창 폰트 크기
    },

    // Select
    Select: {
      controlHeight: 36,            // 선택창 높이
      borderRadius: 6,              // 선택창 border radius
      fontSize: 14,                 // 선택창 폰트 크기
    },

    // Card
    Card: {
      borderRadiusLG: 8,            // 카드 border radius
      paddingLG: 20,                // 카드 패딩
      boxShadowTertiary: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    },

    // Pagination
    Pagination: {
      itemSize: 32,                 // 페이지네이션 아이템 크기
      borderRadius: 4,              // 페이지네이션 border radius
    },

    // Tag
    Tag: {
      borderRadiusSM: 4,            // 태그 border radius
      fontSize: 12,                 // 태그 폰트 크기
    },

    // Statistic
    Statistic: {
      titleFontSize: 14,            // 통계 제목 폰트 크기
      contentFontSize: 24,          // 통계 값 폰트 크기
    },

    // Layout
    Layout: {
      headerBg: '#ffffff',          // 헤더 배경
      bodyBg: '#f9fafb',            // 바디 배경
      siderBg: '#ffffff',           // 사이드바 배경
      triggerBg: '#ffffff',         // 트리거 배경
    },

    // Menu
    Menu: {
      itemBg: '#ffffff',            // 메뉴 아이템 배경
      itemSelectedBg: '#eff6ff',    // 선택된 메뉴 배경
      itemActiveBg: '#f3f4f6',      // 활성 메뉴 배경
      itemSelectedColor: '#3b82f6', // 선택된 메뉴 텍스트
      itemColor: '#6b7280',         // 메뉴 텍스트
      itemHoverColor: '#374151',    // hover 메뉴 텍스트
    },
  },
};

/**
 * 다크모드 테마 (향후 확장용)
 * 현재는 라이트 모드만 지원하지만, 향후 다크모드 지원 시 사용
 */
export const adminDarkTheme: ThemeConfig = {
  ...adminTheme,
  token: {
    ...adminTheme.token,
    colorBgContainer: '#1f2937',
    colorBgLayout: '#111827',
    colorText: '#f9fafb',
    colorTextSecondary: '#d1d5db',
    colorTextTertiary: '#9ca3af',
    colorBorder: '#374151',
    colorBorderSecondary: '#4b5563',
  },
};
