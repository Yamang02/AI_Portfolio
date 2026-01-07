import { useResponsive } from './useResponsive';

export const useFeatureAvailability = () => {
  const { isMobile, isTablet } = useResponsive();

  return {
    // 이스터에그 기능 사용 가능 여부
    canUseEasterEgg: !isMobile,
    // 채팅 히스토리 패널 사용 가능 여부
    canUseChatHistoryPanel: !isMobile,
    // 전체 채팅 히스토리 사용 가능 여부 (태블릿은 축약 버전)
    canUseFullChatHistory: !isMobile && !isTablet,
  };
};
