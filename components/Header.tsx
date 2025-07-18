
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">김개발</h1>
        <p className="mt-2 text-lg text-gray-500">시니어 프론트엔드 엔지니어 & AI 애호가</p>
      </div>
    </header>
  );
};

export default Header;