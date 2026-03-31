import { useState, useEffect, useCallback } from 'react';

import { apiClient } from '@/shared/api/apiClient';

export interface ChatUsageStatus {
  dailyCount: number;
  hourlyCount: number;
  timeUntilReset: number;
  isBlocked: boolean;
}

export function useChatUsageStatus() {
  const [usageStatus, setUsageStatus] = useState<ChatUsageStatus | null>(null);

  const refreshUsageStatus = useCallback(async () => {
    try {
      const status = await apiClient.getChatUsageStatus();
      setUsageStatus(status);
    } catch (error) {
      console.error('사용량 제한 상태 로드 오류:', error);
    }
  }, []);

  useEffect(() => {
    void refreshUsageStatus();
  }, [refreshUsageStatus]);

  return { usageStatus, refreshUsageStatus };
}
