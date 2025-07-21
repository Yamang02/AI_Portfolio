// Services
export { default as GitHubService } from './services/githubService';
export { getChatbotResponse } from './services/geminiService';

// Prompts
export * from './services/prompts';

// Config
export { appConfig, validateConfig } from './config/app.config';
export type { AppConfig } from './config/app.config';

// Components
export * from './components/icons/ProjectIcons';

// Types
export type { 
  GitHubRepo, 
  GitHubUser 
} from './services/githubService';
export type { Project } from './types'; 