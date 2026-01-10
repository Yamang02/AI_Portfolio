import { useParams } from 'react-router-dom';
import { useArticleQuery } from '../entities/article';
import { MarkdownRenderer } from '@/shared/ui/markdown/MarkdownRenderer';

/**
 * 아티클 상세 페이지
 */
export function ArticleDetailPage() {
  const { businessId } = useParams<{ businessId: string }>();

  const { data: article, isLoading, error } = useArticleQuery(businessId!);

  if (isLoading) {
    return <div className="p-8">로딩 중...</div>;
  }

  if (error || !article) {
    return <div className="p-8">아티클을 불러오는데 실패했습니다.</div>;
  }

  return (
    <article className="article-detail-page max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{article.publishedAt && new Date(article.publishedAt).toLocaleDateString('ko-KR')}</span>
          <span>조회 {article.viewCount}</span>
        </div>
        {article.tags.length > 0 && (
          <div className="flex gap-2 mt-4">
            {article.tags.map((tag) => (
              <span key={tag} className="bg-gray-100 px-3 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <MarkdownRenderer content={article.content} />

      {article.techStack.length > 0 && (
        <footer className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold mb-4">기술 스택</h3>
          <div className="flex gap-2 flex-wrap">
            {article.techStack.map((tech) => (
              <span key={tech} className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                {tech}
              </span>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}
