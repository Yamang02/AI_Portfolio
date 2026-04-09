import { useEffect, useState } from 'react';
import { fetchProfileContent } from './api/content';
import type { ProfileContent } from './types/profile';

export function App() {
  const [content, setContent] = useState<ProfileContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileContent()
      .then(setContent)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : '오류가 발생했습니다.'));
  }, []);

  if (error) return <p>{error}</p>;
  if (!content) return <p>로딩 중...</p>;

  return <div>{content.hero.nameKo}</div>;
}
