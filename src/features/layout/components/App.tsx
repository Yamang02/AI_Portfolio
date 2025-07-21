import React, { useEffect } from 'react';
import Header from './Header';
import { PortfolioSection } from '../../projects';
import { Chatbot } from '../../chatbot';
import { ALL_PROJECTS } from '../../projects';
import { validateConfig } from '../../../shared';

const App: React.FC = () => {
  useEffect(() => {
    // 애플리케이션 시작 시 설정 검증
    validateConfig();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-700 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <PortfolioSection projects={ALL_PROJECTS} />
      </main>
      <Chatbot />
    </div>
  );
};

export default App; 