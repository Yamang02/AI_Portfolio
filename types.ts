
import type { ReactNode } from 'react';

export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  readme: string;
  imageUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: ReactNode;
}