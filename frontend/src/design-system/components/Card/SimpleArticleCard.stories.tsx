import type { Meta, StoryObj } from '@storybook/react';
import { SimpleArticleCard } from './SimpleArticleCard';

const meta: Meta<typeof SimpleArticleCard> = {
  title: 'Design System/Components/Card/SimpleArticleCard',
  component: SimpleArticleCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SimpleArticleCard>;

const sampleArticle = {
  businessId: 'article-001',
  title: '프로젝트 개발 과정 기록',
  summary: '이 프로젝트를 개발하면서 겪은 다양한 경험과 기술적 결정 사항들을 기록했습니다. 초기 설계부터 배포까지의 전체 과정을 담았습니다.',
  publishedAt: '2024-01-15T10:00:00Z',
};

export const Default: Story = {
  args: {
    article: sampleArticle,
  },
};

export const WithoutSummary: Story = {
  args: {
    article: {
      ...sampleArticle,
      summary: undefined,
    },
  },
};

export const WithoutDate: Story = {
  args: {
    article: {
      ...sampleArticle,
      publishedAt: undefined,
    },
  },
};

export const Minimal: Story = {
  args: {
    article: {
      businessId: 'article-002',
      title: '최소 정보 아티클',
      summary: undefined,
      publishedAt: undefined,
    },
  },
};

export const LongTitle: Story = {
  args: {
    article: {
      ...sampleArticle,
      title: '매우 긴 아티클 제목이 두 줄로 표시되는 경우의 예시입니다. 이렇게 긴 제목도 잘 처리됩니다.',
    },
  },
};

export const LongSummary: Story = {
  args: {
    article: {
      ...sampleArticle,
      summary: '이것은 매우 긴 요약 텍스트입니다. 세 줄로 제한되어 표시되며, 나머지 내용은 말줄임표로 처리됩니다. 실제로는 더 많은 내용이 있을 수 있지만, 카드에서는 최대 세 줄까지만 보여줍니다. 이렇게 하면 카드의 일관된 높이를 유지할 수 있습니다.',
    },
  },
};

export const Clickable: Story = {
  args: {
    article: sampleArticle,
    onClick: () => alert('아티클 카드 클릭됨!'),
  },
};

export const MultipleCards: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <SimpleArticleCard
        article={{
          businessId: 'article-001',
          title: '첫 번째 관련 아티클',
          summary: '프로젝트 초기 설계 단계에서의 결정 사항들을 기록했습니다.',
          publishedAt: '2024-01-15T10:00:00Z',
        }}
        onClick={() => alert('첫 번째 아티클 클릭')}
      />
      <SimpleArticleCard
        article={{
          businessId: 'article-002',
          title: '두 번째 관련 아티클',
          summary: '개발 중 발생한 주요 이슈와 해결 과정을 정리했습니다.',
          publishedAt: '2024-02-20T14:30:00Z',
        }}
        onClick={() => alert('두 번째 아티클 클릭')}
      />
      <SimpleArticleCard
        article={{
          businessId: 'article-003',
          title: '세 번째 관련 아티클',
          summary: '배포 및 운영 과정에서의 경험을 공유합니다.',
          publishedAt: '2024-03-10T09:15:00Z',
        }}
        onClick={() => alert('세 번째 아티클 클릭')}
      />
    </div>
  ),
};
