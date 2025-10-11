import React from 'react';
import {
  DefaultProjectIcon,
  CodeIcon,
  WebIcon,
  DesktopIcon,
  AIIcon
} from '../components/icons/ProjectIcons';
import { safeToLowerCase, safeIncludes } from './safeStringUtils';

/**
 * 프로젝트 타입
 */
export type ProjectIconType = 'ai' | 'desktop' | 'gallery' | 'web' | 'code';

/**
 * 프로젝트 제목과 설명을 기반으로 적절한 아이콘을 반환합니다
 * @param title - 프로젝트 제목
 * @param description - 프로젝트 설명
 * @returns 아이콘 JSX 엘리먼트
 */
export const getProjectIcon = (title: string, description: string): JSX.Element => {
  const lowerTitle = safeToLowerCase(title);
  const lowerDescription = safeToLowerCase(description);

  // AI 관련
  if (
    safeIncludes(lowerTitle, 'ai') ||
    safeIncludes(lowerTitle, '챗봇') ||
    safeIncludes(lowerTitle, 'chatbot') ||
    safeIncludes(lowerDescription, 'ai') ||
    safeIncludes(lowerDescription, 'gemini')
  ) {
    return <AIIcon />;
  }

  // 데스크톱 애플리케이션
  if (
    safeIncludes(lowerTitle, 'pyqt') ||
    safeIncludes(lowerTitle, '파일') ||
    safeIncludes(lowerTitle, 'file') ||
    safeIncludes(lowerDescription, '데스크톱') ||
    safeIncludes(lowerDescription, 'gui')
  ) {
    return <DesktopIcon />;
  }

  // 갤러리/전시
  if (
    safeIncludes(lowerTitle, '갤러리') ||
    safeIncludes(lowerTitle, '전시') ||
    safeIncludes(lowerTitle, 'art') ||
    safeIncludes(lowerDescription, '전시')
  ) {
    return <DefaultProjectIcon />;
  }

  // 웹 프로젝트
  if (
    safeIncludes(lowerTitle, '웹') ||
    safeIncludes(lowerTitle, 'web') ||
    safeIncludes(lowerTitle, '사이트') ||
    safeIncludes(lowerDescription, '웹')
  ) {
    return <WebIcon />;
  }

  // 기본 코드 아이콘
  return <CodeIcon />;
};

/**
 * 프로젝트 타입을 문자열로 반환합니다 (분석용)
 * @param title - 프로젝트 제목
 * @param description - 프로젝트 설명
 * @returns 프로젝트 타입 문자열
 */
export const getProjectIconType = (title: string, description: string): ProjectIconType => {
  const lowerTitle = safeToLowerCase(title);
  const lowerDescription = safeToLowerCase(description);

  if (
    safeIncludes(lowerTitle, 'ai') ||
    safeIncludes(lowerTitle, '챗봇') ||
    safeIncludes(lowerTitle, 'chatbot') ||
    safeIncludes(lowerDescription, 'ai') ||
    safeIncludes(lowerDescription, 'gemini')
  ) {
    return 'ai';
  }

  if (
    safeIncludes(lowerTitle, 'pyqt') ||
    safeIncludes(lowerTitle, '파일') ||
    safeIncludes(lowerTitle, 'file') ||
    safeIncludes(lowerDescription, '데스크톱') ||
    safeIncludes(lowerDescription, 'gui')
  ) {
    return 'desktop';
  }

  if (
    safeIncludes(lowerTitle, '갤러리') ||
    safeIncludes(lowerTitle, '전시') ||
    safeIncludes(lowerTitle, 'art') ||
    safeIncludes(lowerDescription, '전시')
  ) {
    return 'gallery';
  }

  if (
    safeIncludes(lowerTitle, '웹') ||
    safeIncludes(lowerTitle, 'web') ||
    safeIncludes(lowerTitle, '사이트') ||
    safeIncludes(lowerDescription, '웹')
  ) {
    return 'web';
  }

  return 'code';
};
