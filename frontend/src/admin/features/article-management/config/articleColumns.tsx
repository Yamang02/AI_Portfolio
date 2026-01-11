import { ColumnsType } from 'antd/es/table';
import { Article, ARTICLE_CATEGORIES } from '@/admin/entities/article';
import { Tag, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

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
        const color = status === 'published' ? 'green' : status === 'draft' ? 'orange' : 'gray';
        const text = status === 'published' ? '발행' : status === 'draft' ? '초안' : '보관';
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
