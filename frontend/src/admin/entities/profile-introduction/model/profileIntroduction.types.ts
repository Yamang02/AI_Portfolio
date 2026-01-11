/**
 * 프로필 자기소개 타입
 */
export interface ProfileIntroduction {
  id: number;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 자기소개 저장 요청
 */
export interface SaveProfileIntroductionRequest {
  content: string;
}
