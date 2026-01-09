import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

const meta = {
  title: 'Widgets/Layout/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story, context) => {
      const { initialPath = '/' } = context.args;
      return (
        <MemoryRouter initialEntries={[initialPath]}>
          <Story />
        </MemoryRouter>
      );
    },
  ],
  argTypes: {
    initialPath: {
      control: 'select',
      options: ['/', '/profile', '/projects', '/projects/1', '/admin/settings'],
      description: '초기 경로 설정',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '/' },
      },
    },
  },
} satisfies Meta<typeof Header & { initialPath?: string }>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 헤더 컴포넌트입니다.
 * 
 * 헤더는 다음 기능을 제공합니다:
 * - 로고 클릭으로 홈으로 이동
 * - 데스크톱: 아이콘 메뉴 (프로필, 프로젝트, 챗봇, 설정)
 * - 모바일: 햄버거 메뉴를 통한 드롭다운 메뉴
 * - 테마 토글 버튼
 * - 현재 페이지에 따른 활성 상태 표시 (배경색)
 * - 각 메뉴 아이템에 툴팁 표시
 */
export const Default: Story = {
  args: {
    initialPath: '/',
  },
};

/**
 * 프로필 페이지에 있을 때의 헤더입니다.
 * 프로필 아이콘이 활성 상태로 표시됩니다.
 */
export const OnProfilePage: Story = {
  args: {
    initialPath: '/profile',
  },
  parameters: {
    docs: {
      description: {
        story: '프로필 페이지(/profile)에 있을 때 프로필 아이콘이 활성 상태로 표시됩니다.',
      },
    },
  },
};

/**
 * 프로젝트 리스트 페이지에 있을 때의 헤더입니다.
 * 프로젝트 아이콘이 활성 상태로 표시됩니다.
 */
export const OnProjectsListPage: Story = {
  args: {
    initialPath: '/projects',
  },
  parameters: {
    docs: {
      description: {
        story: '프로젝트 리스트 페이지(/projects)에 있을 때 프로젝트 아이콘이 활성 상태로 표시됩니다.',
      },
    },
  },
};

/**
 * 프로젝트 상세 페이지에 있을 때의 헤더입니다.
 * 프로젝트 아이콘이 활성 상태로 표시됩니다.
 */
export const OnProjectDetailPage: Story = {
  args: {
    initialPath: '/projects/1',
  },
  parameters: {
    docs: {
      description: {
        story: '프로젝트 상세 페이지(/projects/:id)에 있을 때도 프로젝트 아이콘이 활성 상태로 표시됩니다.',
      },
    },
  },
};

/**
 * 설정 페이지에 있을 때의 헤더입니다.
 * 설정 아이콘이 활성 상태로 표시됩니다.
 */
export const OnSettingsPage: Story = {
  args: {
    initialPath: '/admin/settings',
  },
  parameters: {
    docs: {
      description: {
        story: '설정 페이지(/admin/settings)에 있을 때 설정 아이콘이 활성 상태로 표시됩니다.',
      },
    },
  },
};

/**
 * 모바일 뷰에서의 헤더입니다.
 * 햄버거 메뉴가 표시되고, 클릭 시 드롭다운 메뉴가 열립니다.
 */
export const MobileView: Story = {
  args: {
    initialPath: '/',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: '모바일 뷰에서는 데스크톱 메뉴가 숨겨지고 햄버거 메뉴가 표시됩니다. 햄버거 메뉴를 클릭하면 드롭다운 메뉴가 열립니다.',
      },
    },
  },
};

/**
 * 모바일 뷰에서 드롭다운 메뉴가 열린 상태입니다.
 * 
 * **사용 방법**: 햄버거 메뉴 버튼을 클릭하면 드롭다운 메뉴가 열립니다.
 * 각 메뉴 아이템은 아이콘과 텍스트를 함께 표시하며, 활성 상태인 메뉴는 배경색으로 표시됩니다.
 */
export const MobileViewWithDropdown: Story = {
  args: {
    initialPath: '/',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: '햄버거 메뉴를 클릭하면 드롭다운 메뉴가 열립니다. 각 메뉴 아이템은 아이콘과 텍스트를 함께 표시합니다. 활성 상태인 메뉴는 배경색으로 강조 표시됩니다.',
      },
    },
  },
};

/**
 * 다크 모드에서의 헤더입니다.
 */
export const DarkMode: Story = {
  args: {
    initialPath: '/',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: '다크 모드에서의 헤더 모습입니다. 테마 토글 버튼을 클릭하여 라이트/다크 모드를 전환할 수 있습니다.',
      },
    },
  },
};

/**
 * 모든 메뉴 아이템의 툴팁을 확인할 수 있는 스토리입니다.
 * 각 아이콘에 마우스를 올리면 툴팁이 표시됩니다.
 */
export const WithTooltips: Story = {
  args: {
    initialPath: '/',
  },
  parameters: {
    docs: {
      description: {
        story: '각 메뉴 아이템에 마우스를 올리면 툴팁이 표시됩니다. 데스크톱과 모바일 모두에서 툴팁이 작동합니다.',
      },
    },
  },
};
