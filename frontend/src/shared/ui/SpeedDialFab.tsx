import React, { useState } from 'react';

interface SpeedDialAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface SpeedDialFabProps {
  actions: SpeedDialAction[];
  onOpenChange?: (isOpen: boolean) => void;
}

const SpeedDialFab: React.FC<SpeedDialFabProps> = ({ actions, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  const handleActionClick = (action: SpeedDialAction) => {
    action.onClick();
    setIsOpen(false);
    onOpenChange?.(false);
  };

  return (
    <div className="flex items-center">
      {/* Action Buttons - Dynamically appear and push other elements */}
      <div
        className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-w-[300px] opacity-100 mr-3' : 'max-w-0 opacity-0 mr-0'
        }`}
      >
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            className={`${action.color || 'bg-white dark:bg-slate-700'} p-3 rounded-full shadow-lg transition-all duration-300 ease-out flex-shrink-0 ${
              isOpen
                ? 'scale-100'
                : 'scale-75'
            }`}
            style={{
              transitionDelay: isOpen ? `${index * 80}ms` : '0ms'
            }}
            aria-label={action.label}
            title={action.label}
          >
            {action.icon}
          </button>
        ))}
      </div>

      {/* Main FAB Button - Same size as submit button with smooth rotation */}
      <button
        onClick={handleToggle}
        className={`flex-shrink-0 bg-primary-600 dark:bg-primary-500 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-all duration-300 ease-in-out transform ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        aria-label="메뉴 열기"
      >
        {/* Plus Icon (smaller to match submit button size) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
};

export { SpeedDialFab };
