
import React from 'react';
import Header from './components/Header';
import PortfolioSection from './components/PortfolioSection';
import Chatbot from './components/Chatbot';
import { PROJECTS } from './constants';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-700 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <PortfolioSection projects={PROJECTS} />
      </main>
      <Chatbot />
    </div>
  );
};

export default App;