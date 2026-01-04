import React from 'react';
import { TextLink } from '@/design-system';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  // TODO: 실제 GitHub URL과 Email 주소로 교체 필요
  const githubUrl = 'https://github.com/username'; // 실제 GitHub URL로 교체
  const email = 'mailto:your-email@example.com'; // 실제 Email 주소로 교체

  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>© 2025 이준경</p>
        <div className={styles.links}>
          <TextLink href={githubUrl} external>
            GitHub
          </TextLink>
          <TextLink href={email}>
            Email
          </TextLink>
        </div>
      </div>
    </footer>
  );
};
