/**
 * TOC 관련 타입 정의
 */

export interface TOCItem {
  id: string;
  text: string;
  level: number;
  children?: TOCItem[];
}

