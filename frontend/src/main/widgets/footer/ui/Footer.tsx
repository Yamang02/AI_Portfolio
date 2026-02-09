import React, { useState } from 'react';
import { SocialIcon, Button } from '@/design-system';
import { ContactModal } from '@/shared/ui/modal';
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
          <div className={styles.topRow}>
            <span className={styles.brand}>야망솔루션</span>
            <p className={styles.copyright}>© 2026, Lee Jeongjun(Yamang02)</p>
            <div className={styles.links}>
              <Button
                variant="icon"
                size="sm"
                href={githubUrl}
                target="_blank"
                ariaLabel="GitHub"
                className={styles.githubLink}
              >
                <SocialIcon type="github" size="sm" />
              </Button>
              <Button
                variant="icon"
                size="sm"
                onClick={() => setIsContactModalOpen(true)}
                ariaLabel="Email"
                className={styles.emailLink}
              >
                <SocialIcon type="email" size="sm" />
              </Button>
            </div>
          </div>
          <dl className={styles.infoRow}>
            <div className={styles.infoItem}>
              <dt>대표자</dt>
              <dd>이정준</dd>
            </div>
            <div className={styles.infoItem}>
              <dt>사업자등록번호</dt>
              <dd>882-30-01752</dd>
            </div>
<div className={styles.infoItem}>
                <dt>업태</dt>
                <dd>정보통신업</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>종목</dt>
                <dd>컴퓨터 프로그래밍 서비스업</dd>
              </div>
          </dl>
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
