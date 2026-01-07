import React from 'react';
import styles from './ChatBubble.module.css';

export type ChatBubbleVariant = 'user' | 'assistant';

export interface ChatBubbleProps {
  variant?: ChatBubbleVariant;
  children: React.ReactNode;
  timestamp?: string;
  className?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  variant = 'assistant',
  children,
  timestamp,
  className = '',
}) => {
  const classNames = [
    styles.chatBubble,
    styles[variant],
    className && styles[className as keyof typeof styles] ? styles[className as keyof typeof styles] : className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <div className={styles.content}>{children}</div>
      {timestamp && (
        <p className={styles.timestamp}>{timestamp}</p>
      )}
    </div>
  );
};
