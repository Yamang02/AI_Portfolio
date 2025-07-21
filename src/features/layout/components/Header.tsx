import React from 'react';
import { appConfig } from '../../../shared';

const Header: React.FC = () => {
  return (
    <header className="py-6 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">{appConfig.app.developerName}</h1>
        <p className="mt-2 text-lg text-gray-500">{appConfig.app.developerTitle}</p>
      </div>
    </header>
  );
};

export default Header; 