import React from 'react';
import { appConfig } from '../../../shared';

const HeroSection: React.FC = () => {
  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-2">{appConfig.app.developerTitle}</h2>
        <div className="text-3xl md:text-4xl font-bold text-black mb-4">{appConfig.app.developerName}</div>
        <p className="text-gray-500 max-w-2xl mx-auto mb-6">
          Building digital experiences with modern technologies. Focused on creating elegant solutions to complex problems.
        </p>
        <div className="flex justify-center gap-4">
          <a href={appConfig.app.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded border border-gray-300 bg-white text-black hover:bg-gray-100 transition-colors">
            <span className="sr-only">GitHub</span>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.43 7.86 10.96.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.45 24 17.12 24 12.02 24 5.74 18.27.5 12 .5z"/></svg>
          </a>
          <a href={`mailto:${appConfig.app.email}`} className="inline-flex items-center justify-center w-10 h-10 rounded border border-gray-300 bg-white text-black hover:bg-gray-100 transition-colors">
            <span className="sr-only">Email</span>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="m22 7-8.97 6.48a2 2 0 0 1-2.06 0L2 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 