import React from 'react';

import styles from './ChatPage.module.css';

export const ChatPageInfoModalBody: React.FC = () => (
  <div className={styles.infoContent}>
    <h3>AI 포트폴리오 비서 사용 안내</h3>
    <p>안녕하세요! 👋 저는 AI 포트폴리오 비서입니다.</p>
    <p>궁금한 점이나 알고 싶은 내용을 자유롭게 질문해 주세요.</p>

    <h4>질문 예시</h4>
    <ul>
      <li>&quot;A작업물 기획의도를 알려줘.&quot;</li>
      <li>&quot;B작업물 기술스택 알려줘&quot;</li>
      <li>&quot;작업물에서 사용한 주요 기능은?&quot;</li>
    </ul>

    <h4>사용량 제한</h4>
    <ul>
      <li>시간당 최대 15회 질문 가능</li>
      <li>일일 최대 45회 질문 가능</li>
      <li>사용량이 초과되면 일정 시간 후 자동으로 해제됩니다</li>
    </ul>

    <div className={styles.infoWarning}>
      <strong>⚠️ 주의사항</strong>
      <p>
        AI 답변은 실제 정보와 다를 수 있으니 참고용으로만 활용해 주세요. 더 자세한 정보가 필요하시면 개발자에게 직접
        메일을 보내주세요.
      </p>
    </div>
  </div>
);
