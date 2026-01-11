import { useState, useEffect, useRef } from 'react';
import { Button, Table, Empty, Spin } from 'antd';
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
  const containerRef = useRef<HTMLDivElement>(null);

  // 데이터 조회 (최신순 정렬)
  const { data, isLoading, isFetching } = useAdminArticleListQuery({ 
    page: page - 1, 
    size: pageSize,
    sort: 'id,desc' // 최신순 (ID 내림차순)
  });
  const deleteMutation = useDeleteArticleMutation();

  // API 호출 완료 후 높이 재계산
  useEffect(() => {
    if (!isLoading && !isFetching && containerRef.current) {
      // 높이 재계산을 위한 강제 리플로우
      const height = containerRef.current.offsetHeight;
      // 브라우저에 레이아웃 재계산 요청
      window.requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.style.minHeight = `${height}px`;
          // 다음 프레임에서 원래대로 복원
          window.requestAnimationFrame(() => {
            if (containerRef.current) {
              containerRef.current.style.minHeight = '';
            }
          });
        }
      });
    }
  }, [isLoading, isFetching, data]);

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

  // 빈 상태 체크
  const isEmpty = !isLoading && !isFetching && (!data?.content || data.content.length === 0);

  return (
    <div className="article-management-page p-6" ref={containerRef}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">아티클 관리</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          아티클 생성
        </Button>
      </div>

      {/* 로딩 상태 */}
      {isLoading && !data && (
        <div className="flex justify-center items-center" style={{ minHeight: '400px' }}>
          <Spin size="large" tip="아티클 목록을 불러오는 중..." />
        </div>
      )}

      {/* 빈 상태 */}
      {isEmpty && (
        <div className="flex justify-center items-center" style={{ minHeight: '400px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ color: '#999' }}>등록된 아티클이 없습니다</span>
            }
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              첫 아티클 생성하기
            </Button>
          </Empty>
        </div>
      )}

      {/* 데이터가 있을 때만 테이블 표시 */}
      {!isEmpty && (
        <Table
          dataSource={data?.content || []}
          columns={columns}
          loading={isFetching}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total: data?.totalElements || 0,
            onChange: setPage,
          }}
        />
      )}
    </div>
  );
}
