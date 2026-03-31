import React from 'react';

import { Button } from '@/design-system';

import type { ChatUsageStatus } from '@/main/features/chatbot/hooks/useChatUsageStatus';

import styles from './ChatPage.module.css';

export interface ChatPageTopBarProps {
  usageStatus: ChatUsageStatus | null;
  onReset: () => void;
  onOpenInfo: () => void;
}

export const ChatPageTopBar: React.FC<ChatPageTopBarProps> = ({ usageStatus, onReset, onOpenInfo }) => (
  <div className={styles.topBar}>
    <div className={styles.topBarContent}>
      {usageStatus && (
        <div className={styles.usageContainer}>
          {usageStatus.isBlocked && (
            <div className={styles.blockedText}>
              ⚠️ 차단됨 ({Math.ceil(usageStatus.timeUntilReset / (1000 * 60 * 60))}시간 후 해제)
            </div>
          )}
          <div className={styles.usageText}>
            <div className={styles.usageLabel}>호출제한</div>
            <div className={styles.usageRows}>
              <div className={styles.usageRow}>시간: {usageStatus.hourlyCount}/15</div>
              <div className={styles.usageRow}>일일: {usageStatus.dailyCount}/45</div>
            </div>
          </div>
        </div>
      )}
      <div className={styles.buttonsContainer}>
        <Button variant="icon" size="md" onClick={onReset} ariaLabel="채팅 초기화">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582M20 20v-5h-.581M19.418 15A7.978 7.978 0 0 1 12 20a8 8 0 1 1 8-8"
            />
          </svg>
        </Button>
        <Button
          variant="icon"
          size="md"
          onClick={onOpenInfo}
          ariaLabel="안내사항 보기"
          className={styles.infoButton}
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </Button>
      </div>
    </div>
  </div>
);
