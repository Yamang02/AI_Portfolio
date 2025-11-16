import { useState, useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';

export const MobileFeatureNotice = () => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('mobile-feature-notice-dismissed') === 'true';
    setDismissed(isDismissed);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('mobile-feature-notice-dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-4 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
        aria-label="닫기"
      >
        <CloseOutlined className="text-base" />
      </button>

      <div className="pr-8">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>PC 환경</strong>에서 채팅 히스토리 및 특별 기능을 이용하실 수 있습니다.
        </p>
        <button
          onClick={handleDismiss}
          className="text-xs text-blue-600 dark:text-blue-400 underline mt-2 hover:text-blue-800 dark:hover:text-blue-200"
        >
          다시 보지 않기
        </button>
      </div>
    </div>
  );
};
