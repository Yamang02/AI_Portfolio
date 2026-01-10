import { useState } from 'react';
import { Button, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Article } from '../entities/article';
import {
  useAdminArticleListQuery,
  useDeleteArticleMutation,
} from '../entities/article/api/useAdminArticleQuery';
import { getArticleColumns } from '../features/article-management/config/articleColumns';

/**
 * 아티클 관리 페이지
 */
export function ArticleManagement() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // 데이터 조회
  const { data, isLoading } = useAdminArticleListQuery({ page: page - 1, size: pageSize });
  const deleteMutation = useDeleteArticleMutation();

  // 핸들러
  const handleCreate = () => {
    navigate('/admin/articles/new');
  };

  const handleEdit = (article: Article) => {
    navigate(`/admin/articles/${article.id}`);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  // 테이블 컬럼
  const columns = getArticleColumns(handleEdit, handleDelete);

  return (
    <div className="article-management-page p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">아티클 관리</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          아티클 생성
        </Button>
      </div>

      <Table
        dataSource={data?.content || []}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize,
          total: data?.totalElements || 0,
          onChange: setPage,
        }}
      />
    </div>
  );
}
