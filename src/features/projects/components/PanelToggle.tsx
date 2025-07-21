import React from 'react';

interface PanelToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const PanelToggle: React.FC<PanelToggleProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`fixed right-4 top-20 z-40 p-3 rounded-full shadow-lg transition-all duration-300 ${
        isOpen 
          ? 'bg-gray-600 text-white' 
          : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
      title={isOpen ? '히스토리 패널 닫기' : '히스토리 패널 열기'}
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
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
    </button>
  );
};

export default PanelToggle; 