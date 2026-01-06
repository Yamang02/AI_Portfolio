import React, { useState } from 'react';
import { SocialIcon } from '@/design-system';
import { ContactModal } from '../../../main/components/common/Modal';
import styles from './Footer.module.css';

interface FooterProps {
  isVisible?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isVisible = false }) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const githubUrl = 'https://github.com/Yamang02';

  return (
    <>
      <footer 
        id="footer" 
        className={`${styles.footer} ${isVisible ? styles.visible : ''}`}
      >
        <div className={styles.container}>
          <p className={styles.copyright}>© 2026, Lee Jeongjun(Yamang02)</p>
          <div className={styles.links}>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.link} ${styles.githubLink}`}
              title="GitHub 저장소"
              aria-label="GitHub"
            >
              <SocialIcon type="github" size="sm" />
            </a>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className={`${styles.link} ${styles.emailLink}`}
              title="이메일 보내기"
              aria-label="Email"
            >
              <SocialIcon type="email" size="sm" />
            </button>
          </div>
        </div>
      </footer>

      {/* 문의 모달 */}
      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
};
