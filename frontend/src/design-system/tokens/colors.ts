/**
 * Color Tokens
 *
 * ⚠️ 중요: 이 파일은 타입 정의와 문서화 목적입니다.
 * 실제 컬러 값의 단일 소스는 `globals.css`의 CSS 변수입니다.
 * 
 * 디자인 시스템 구조:
 * - 단일 소스: globals.css의 CSS 변수 (--color-*)
 * - Tailwind 통합: tailwind.config.js에서 CSS 변수 참조
 * - TypeScript 타입: 이 파일에서 타입 정의 (선택적)
 *
 * 80% 표준 + 20% 브랜드 접근법
 * 
 * 브랜드 컬러: #7FAF8A (하나만 사용)
 * - Primary 버튼
 * - Hover / Focus 상태
 * - 강조 링크 (제한적)
 * 
 * 나머지는 표준 색상 사용 (Tailwind/Material 계열)
 */

export const brandColors = {
  // 브랜드 그린: #7FAF8A (하나만 사용)
  primary: '#7FAF8A',        // 브랜드 그린 - Primary CTA 버튼, Focus, 강조 링크
  primaryHover: '#6FA07A',   // 약간 진한 hover
  primaryActive: '#5F9070',  // Active 상태
  primaryFocus: '#7FAF8A',   // Focus ring
  
  // 다크 모드용 (약간 밝게 조정)
  primaryDarkMode: '#6FA07A',    // 다크 모드 Primary
  primaryDarkHover: '#7FAF8A',
  primaryDarkActive: '#5F9070',
  
  // 히어로 섹션 배경용 - 임팩트 있는 초록색
  heroBackground: '#50C878',  // Emerald Green - 히어로 섹션 배경용 (높은 채도/명도)
  heroBackgroundDark: '#2E8B57', // Sea Green - 다크 모드용 (약간 어둡게)
  
  // 버튼 텍스트 색상 (라이트/다크 공통)
  buttonText: '#F8FBF9',      // Primary 버튼 위 텍스트용
  
  // 히어로 섹션 텍스트 색상
  heroTitle: '#0F1F17',       // 히어로 메인 헤드라인 (H1) - Light Mode
  heroTitleDark: '#ECF6F1',   // 히어로 메인 헤드라인 (H1) - Dark Mode
  heroSubtext: '#1F3A2C',     // 히어로 서브 카피/설명 텍스트 - Light Mode
  heroSubtextDark: '#B7D7C7', // 히어로 서브 카피/설명 텍스트 - Dark Mode
  heroCtaText: '#F7FCF9',     // 히어로 CTA 버튼 텍스트 (라이트/다크 공통)
  heroBadge: '#145A32',       // 히어로 보조 요소 (Badge, Eyebrow) - Light Mode
  heroBadgeDark: '#9FD6B2',   // 히어로 보조 요소 (Badge, Eyebrow) - Dark Mode
  
  // Featured 배지 색상
  featuredBadge: '#d4a017',   // Featured 별 배지 배경 (노란색, 톤 다운)
  
  // GitHub 링크 색상
  github: '#6e5494',          // GitHub 시그니처 보라색
  
  // Primary 다크 버전 (섹션 타이틀용) - 라이트 모드
  primaryDark: '#4F8060',     // 텍스트용 진한 그린 - 섹션 타이틀 등
  // Primary 다크 버전 - 다크 모드 (텍스트용)
  primaryDarkText: '#7FB89A',  // 텍스트용 그린 - 다크 모드용 (약간 밝게)
} as const;

// 공통 유틸리티 컬러 (라이트/다크 모드 공통)
export const utilityColors = {
  // 그림자 색상 (투명도 포함)
  shadow: {
    light: 'rgba(0, 0, 0, 0.08)',    // 가벼운 그림자
    medium: 'rgba(0, 0, 0, 0.1)',    // 중간 그림자
    heavy: 'rgba(0, 0, 0, 0.15)',    // 진한 그림자
  },
  // 글라스모피즘 효과용
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',   // 밝은 글라스 효과
    medium: 'rgba(255, 255, 255, 0.2)',  // 중간 글라스 효과
  },
  // 그라데이션 색상 (HomePage 배경용)
  gradient: {
    // 라이트 모드 그라데이션 (흰색 → bg-primary)
    lightStart: '#FCFDFA',
    lightMid1: '#F9FAF7',
    lightMid2: '#F8F9F5',
    lightMid3: '#F7F9F5',
    // 다크 모드 그라데이션 (다크 그린 → bg-primary)
    darkStart: '#0F1A14',
    darkMid1: '#0F1B15',
    darkMid2: '#0F1C16',
    darkMid3: '#0F1D17',
    darkMid4: '#0F1E18',
  },
} as const;

export const lightModeColors = {
  background: {
    primary: '#ffffff',      // 순수 흰색 (neutral)
    secondary: '#f9fafb',     // Gray-50 (표준)
    tertiary: '#f3f4f6',     // Gray-100 (표준)
  },
  text: {
    primary: '#1F2A23',       // 브랜드 그린 톤 - 부드러운 블랙
    secondary: '#5F6F66',    // 브랜드 그린 톤 - 서브 텍스트
    tertiary: '#9ca3af',     // Gray-400 (표준)
  },
  border: {
    default: '#e5e7eb',      // Gray-200 (표준 neutral)
    hover: '#d1d5db',        // Gray-300 (표준)
    accent: '#e5e7eb',        // Gray-200 (브랜드 색상 제거)
  },
  link: {
    default: '#6b7280',      // Gray-500 (neutral, 브랜드 제거)
    hover: '#7FAF8A',        // 브랜드 그린 (강조 링크만)
    visited: '#6b7280',      // Gray-500 (neutral)
  },
  status: {
    info: '#3b82f6',         // Blue-500 (표준)
    success: '#10b981',      // Green-500 (표준, 브랜드 그린 아님)
    warning: '#f59e0b',       // Amber-500 (표준)
    error: '#ef4444',        // Red-500 (표준)
  },
} as const;

export const darkModeColors = {
  background: {
    primary: '#111827',       // Gray-900 (표준 neutral)
    secondary: '#1f2937',     // Gray-800 (표준)
    tertiary: '#374151',      // Gray-700 (표준)
  },
  text: {
    primary: '#E6F1EA',       // 브랜드 그린 톤 - 부드러운 화이트
    secondary: '#9FB4A8',    // 브랜드 그린 톤 - 서브 텍스트
    tertiary: '#9ca3af',      // Gray-400 (표준)
  },
  border: {
    default: '#374151',       // Gray-700 (표준 neutral)
    hover: '#4b5563',         // Gray-600 (표준)
    accent: '#374151',         // Gray-700 (브랜드 색상 제거)
  },
  link: {
    default: '#d1d5db',       // Gray-300 (neutral, 브랜드 제거)
    hover: '#6FA07A',         // 브랜드 그린 (다크 모드용, 약간 어둡게)
    visited: '#9ca3af',       // Gray-400 (neutral)
  },
  status: {
    info: '#60a5fa',          // Blue-400 (표준)
    success: '#34d399',        // Green-400 (표준, 브랜드 그린 아님)
    warning: '#fbbf24',       // Amber-400 (표준)
    error: '#f87171',         // Red-400 (표준)
  },
} as const;

export type BrandColor = keyof typeof brandColors;
export type LightModeColor = keyof typeof lightModeColors;
export type DarkModeColor = keyof typeof darkModeColors;
