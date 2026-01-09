import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';

// 스토리북 UI 테마 설정 (선택사항)
addons.setConfig({
  theme: themes.light, // 또는 themes.dark
  // 사이드바 설정
  sidebar: {
    showRoots: true, // 루트 그룹 표시
    collapsedRoots: [], // 기본적으로 접힌 그룹
  },
  // 툴바 설정
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
});
