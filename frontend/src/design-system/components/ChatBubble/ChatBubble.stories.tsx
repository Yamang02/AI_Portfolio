import type { Meta, StoryObj } from '@storybook/react';
import { ChatBubble } from './ChatBubble';

const meta: Meta<typeof ChatBubble> = {
  title: 'Design System/Components/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['user', 'assistant'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChatBubble>;

export const User: Story = {
  args: {
    variant: 'user',
    children: '안녕하세요!',
    timestamp: '오전 09:17',
  },
};

export const Assistant: Story = {
  args: {
    variant: 'assistant',
    children: '안녕하세요! 👋 저는 AI 포트폴리오 비서입니다.',
    timestamp: '오전 09:17',
  },
};

export const UserLongText: Story = {
  args: {
    variant: 'user',
    children: 'A프로젝트의 기획의도와 기술스택에 대해 자세히 알려주세요.',
    timestamp: '오전 09:20',
  },
};

export const AssistantLongText: Story = {
  args: {
    variant: 'assistant',
    children: `안녕하세요! 👋 저는 AI 포트폴리오 비서입니다.

궁금한 점이나 알고 싶은 내용을 자유롭게 질문해 주세요.

예시:
"A프로젝트 기획의도를 알려줘."
"B프로젝트 기술스택 알려줘"

💡 AI 답변은 실제 정보와 다를 수 있으니 참고용으로만 활용해 주세요.`,
    timestamp: '오전 09:15',
  },
};

export const WithoutTimestamp: Story = {
  args: {
    variant: 'user',
    children: '타임스탬프 없는 메시지',
  },
};
