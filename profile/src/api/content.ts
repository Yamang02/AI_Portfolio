/**
 * 프로필 콘텐츠 fetch 레이어
 *
 * 현재: public/content.json 정적 파일에서 로드
 * 향후: 백엔드 API로 교체 시 이 파일만 수정
 */
import type { ProfileContent } from '../types/profile';

export async function fetchProfileContent(): Promise<ProfileContent> {
  const response = await fetch('/content.json');
  if (!response.ok) {
    throw new Error('프로필 콘텐츠를 불러오지 못했습니다.');
  }
  return response.json() as Promise<ProfileContent>;
}
