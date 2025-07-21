import React from 'react';

interface PanelToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const PanelToggle: React.FC<PanelToggleProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-6 right-24 p-4 rounded-full shadow-lg transition-all duration-200 z-60 ${
        isOpen 
          ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-xl' 
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
      title={isOpen ? "히스토리 패널 닫기" : "히스토리 패널 열기"}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    </button>
  );
};

export default PanelToggle; 