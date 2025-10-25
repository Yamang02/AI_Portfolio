import React from 'react';
import { AppProvider } from './providers';
import { App } from './layout';

const AppRoot: React.FC = () => {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
};

export { AppRoot };