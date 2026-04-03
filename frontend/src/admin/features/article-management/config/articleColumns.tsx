import { ColumnsType } from 'antd/es/table';
import { Article } from '@/admin/entities/article';
import { ARTICLE_CATEGORIES } from '@/shared/article';
import { Tag, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const getArticleStatusTag = (status: string): { color: string; text: string } => {
  if (status === 'published') {
    return { color: 'green', text: '발행' };
  }
  if (status === 'draft') {
    return { color: 'orange', text: '초안' };
  }
  return { color: 'gray', text: '보관' };
};

export function getArticleColumns(
  onEdit: (article: Article) => void,
  onDelete: (id: number) => void
): ColumnsType<Article> {
  return [
    {
      title: 'ID',
      dataIndex: 'businessId',
      key: 'businessId',
      width: 120,
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      width: 300,
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => 
        category ? (ARTICLE_CATEGORIES[category as keyof typeof ARTICLE_CATEGORIES] || category) : '-',
    },
    {
      title: '시리즈',
      dataIndex: 'seriesTitle',
      key: 'seriesTitle',
      width: 150,
      render: (seriesTitle: string) => seriesTitle || '-',
    },
    {
      title: '연관 프로젝트',
      dataIndex: 'projectTitle',
      key: 'projectTitle',
      width: 180,
      render: (projectTitle: string) => projectTitle || '-',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const { color, text } = getArticleStatusTag(status);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '조회수',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 80,
      align: 'right',
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('ko-KR'),
    },
    {
      title: '작업',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            수정
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];
}
