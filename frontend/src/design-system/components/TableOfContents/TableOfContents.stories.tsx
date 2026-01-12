import type { Meta, StoryObj } from '@storybook/react';
import { TableOfContents } from './TableOfContents';
import type { TOCItem } from '@/main/features/project-gallery/hooks/types';

const meta: Meta<typeof TableOfContents> = {
  title: 'Design System/Components/TableOfContents',
  component: TableOfContents,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TableOfContents>;

const mockTOCItems: TOCItem[] = [
  { id: 'overview', text: '개요', level: 2 },
  { id: 'screenshots', text: '스크린샷', level: 2 },
  {
    id: 'readme',
    text: '상세 설명',
    level: 2,
    children: [
      { id: 'readme-introduction', text: '소개', level: 3 },
      { id: 'readme-features', text: '주요 기능', level: 3 },
      {
        id: 'readme-features-list',
        text: '기능 목록',
        level: 4,
      },
    ],
  },
  { id: 'tech-stack', text: '기술 스택', level: 2 },
];

export const Default: Story = {
  args: {
    items: mockTOCItems,
  },
};

export const Simple: Story = {
  args: {
    items: [
      { id: 'section1', text: '섹션 1', level: 2 },
      { id: 'section2', text: '섹션 2', level: 2 },
      { id: 'section3', text: '섹션 3', level: 2 },
    ],
  },
};

export const DeepNesting: Story = {
  args: {
    items: [
      {
        id: 'level1',
        text: '레벨 1',
        level: 2,
        children: [
          {
            id: 'level2',
            text: '레벨 2',
            level: 3,
            children: [
              {
                id: 'level3',
                text: '레벨 3',
                level: 4,
                children: [
                  { id: 'level4', text: '레벨 4', level: 5 },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};
