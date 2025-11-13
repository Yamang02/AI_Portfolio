import React, { useEffect } from 'react';
import type { EasterEggContext } from '../../model/easter-egg.types';

export const GiantBlockEffect: React.FC<{
  context: EasterEggContext;
  onClose: () => void;
}> = ({ onClose }) => {
  useEffect(() => {
    const event = new CustomEvent('triggerGiantBlock');
    window.dispatchEvent(event);
    
    const timeout = setTimeout(() => {
      onClose();
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [onClose]);

  return null;
};

