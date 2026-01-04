import React from 'react';
import { SectionTitle, Divider } from '@/design-system';
import styles from './AboutSection.module.css';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className={styles.about}>
      <div className={styles.container}>
        <SectionTitle level="h2">About</SectionTitle>
        <p className={styles.summary}>
          저는 AI를 단순한 도구가 아닌 개발 파트너로 활용합니다.
          Cursor, Claude, ChatGPT 등을 프로젝트 설계부터 디버깅까지 전 과정에 적극 활용하며,
          AI의 도움으로 빠르게 프로토타입을 만들고 반복 개선합니다.
          이를 통해 개발 속도를 높이고, 더 나은 사용자 경험에 집중할 수 있습니다.
        </p>
      </div>
      <Divider variant="horizontal" />
    </section>
  );
};
